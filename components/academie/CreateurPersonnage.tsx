// Créateur de personnage de l'Académie des Astres.
// Aperçu de l'avatar à gauche (en haut sur mobile), options par
// catégorie à droite (panneau inférieur sur mobile). Les catégories
// et les variantes viennent de data/academie/avatar/catalogue.ts.

import "./avatar/createur.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LONGUEUR_MAX_NOM, identites, pronoms, questionsTraits } from "@/data/academie/personnalisation";
import { categoriesCreateur, optionsParCalque, palettes, racineAssets, teintes } from "@/data/academie/avatar/catalogue";
import type { CategorieCalque, CategorieCreateur, VueAvatar } from "@/data/academie/avatar/types";
import { textesAcademie } from "@/data/academie/textes";
import type { Apparence, Personnage } from "@/data/academie/types";
import { cheminVignette, normaliserSelection, trouverOption } from "@/lib/academie/avatar/composition";
import { useHistorique } from "@/lib/academie/avatar/historique";
import {
  SEUIL_PERSONNALISATION_AVANCEE,
  apparenceAleatoire,
  apparenceInitiale,
  avecSelection,
  couleurSourcils,
  nombrePersonnalisations,
} from "@/lib/academie/avatar/selection";
import { accordDe, interpoler, libelleTrait } from "@/lib/academie/texte";
import Decor from "./art/Decors";
import CarteEleve from "./CarteEleve";
import ApercuAvatar, { prechargerOption } from "./avatar/ApercuAvatar";
import IconeCreateur from "./avatar/Icones";
import { GrilleVignettes, PastillesCouleur, Section } from "./avatar/Selecteurs";
import { Modale } from "./ui";

type Props = {
  personnage: Personnage;
  etape: number;
  onChange: (p: Personnage) => void;
  onEtape: (n: number) => void;
  onRetourAccueil: () => void;
  onTerminer: () => void;
};

export const INDEX_RECAPITULATIF = categoriesCreateur.findIndex((c) => c.id === "recapitulatif");

const NOTE_TEINTE = "Couleur enregistrée pour ton personnage (portraits des scènes). Elle s'appliquera à cet aperçu avec les prochains assets.";

const formatVignettes: Partial<Record<CategorieCalque, "carre" | "portrait">> = { tenue: "portrait" };

export default function CreateurPersonnage({ personnage, etape, onChange, onEtape, onRetourAccueil, onTerminer }: Props) {
  const index = Math.min(Math.max(0, etape), categoriesCreateur.length - 1);
  const categorie = categoriesCreateur[index];
  const ap = personnage.apparence;
  const selection = useMemo(() => normaliserSelection(ap.avatar, personnage.identite), [ap.avatar, personnage.identite]);

  const histo = useHistorique(personnage, onChange);
  const [vue, setVue] = useState<VueAvatar>(categorie.vue);
  const [pleinEcran, setPleinEcran] = useState(false);
  const [visitees, setVisitees] = useState<Set<string>>(() => new Set([categorie.id]));
  const [confirmation, setConfirmation] = useState<"aleatoire" | "reinitialiser" | null>(null);
  const contenuRef = useRef<HTMLDivElement>(null);
  const ongletsRef = useRef<HTMLDivElement>(null);

  // ---------- Navigation ----------

  const allerA = useCallback(
    (i: number) => {
      const c = categoriesCreateur[i];
      if (!c) return;
      onEtape(i);
      setVue(c.vue); // vue privilégiée, modifiable ensuite à la main
      setVisitees((v) => new Set(v).add(c.id));
    },
    [onEtape]
  );

  useEffect(() => {
    contenuRef.current?.scrollTo({ top: 0 });
    // Garde l'onglet actif visible dans la barre défilante, sans faire défiler la page.
    const barre = ongletsRef.current;
    const actif = barre?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (barre && actif) {
      const horizontal = barre.scrollWidth > barre.clientWidth;
      if (horizontal) barre.scrollTo({ left: actif.offsetLeft - barre.clientWidth / 2 + actif.offsetWidth / 2, behavior: "smooth" });
      else barre.scrollTo({ top: actif.offsetTop - barre.clientHeight / 2 + actif.offsetHeight / 2, behavior: "smooth" });
    }
  }, [index]);

  // ---------- Modifications ----------

  const majApparence = (apparence: Apparence, cleFusion?: string) => histo.appliquer({ ...personnage, apparence }, cleFusion);
  const choisirCalque = (cat: CategorieCalque, id: string) => majApparence(avecSelection(ap, personnage.identite, { [cat]: id }));
  const choisirCouleur = (champ: "peau" | "yeux" | "cheveux" | "sourcils", valeur: string | undefined) =>
    majApparence({ ...ap, [champ]: valeur });

  const avancee = nombrePersonnalisations(ap, personnage.identite) >= SEUIL_PERSONNALISATION_AVANCEE;
  const tirerAuHasard = () => majApparence(apparenceAleatoire(ap, personnage.identite));
  const reinitialiser = () => majApparence(apparenceInitiale(personnage.identite));

  // Raccourcis : Ctrl+Z, Ctrl+Y / Ctrl+Maj+Z (hors champs de saisie, qui gardent leur propre annulation).
  const { annuler, retablir } = histo;
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const cible = e.target as HTMLElement;
      if (cible.closest("input, textarea, [contenteditable]")) return;
      const touche = e.key.toLowerCase();
      if (touche === "z" && !e.shiftKey) {
        e.preventDefault();
        annuler();
      } else if (touche === "y" || (touche === "z" && e.shiftKey)) {
        e.preventDefault();
        retablir();
      }
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [annuler, retablir]);

  // Indicateur de sauvegarde automatique (l'écriture est faite, différée, par AcademieApp).
  const [enregistrement, setEnregistrement] = useState(false);
  const premier = useRef(true);
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    setEnregistrement(true);
    const t = setTimeout(() => setEnregistrement(false), 700);
    return () => clearTimeout(t);
  }, [personnage]);

  // ---------- Progression ----------

  const traitsComplets = questionsTraits.every((q) => personnage.traits[q.id]);
  const prenomOk = personnage.prenom.trim().length > 0;
  const estComplete = (c: CategorieCreateur) => {
    if (c.id === "identite") return prenomOk;
    if (c.id === "caractere") return traitsComplets;
    if (c.id === "recapitulatif") return false;
    return visitees.has(c.id);
  };
  const peutTerminer = prenomOk && traitsComplets;
  const terminer = () => {
    // Fige la sélection (et ses équivalents vectoriels) avant la cérémonie.
    onChange({ ...personnage, apparence: avecSelection(ap, personnage.identite, {}) });
    onTerminer();
  };

  const surClavierOnglets = (e: React.KeyboardEvent) => {
    const delta = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    if (!delta) return;
    e.preventDefault();
    const j = (index + delta + categoriesCreateur.length) % categoriesCreateur.length;
    allerA(j);
    requestAnimationFrame(() => ongletsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus());
  };

  // ---------- Rendu ----------

  return (
    <div className="ada-createur">
      <div className="ada-createur-fond" aria-hidden>
        <Decor id="salle-astrolabe" />
      </div>

      <header className="ada-createur-entete">
        <p className="ada-createur-surtitre">{textesAcademie.creation.titre}</p>
      <div className="ada-actions" role="toolbar" aria-label="Actions du créateur">
        <button type="button" className="ada-action" onClick={histo.annuler} disabled={!histo.peutAnnuler} title="Annuler (Ctrl+Z)">
          <IconeCreateur nom="annuler" className="h-[18px] w-[18px]" />
          <span className="ada-action-texte">Annuler</span>
        </button>
        <button type="button" className="ada-action" onClick={histo.retablir} disabled={!histo.peutRetablir} title="Rétablir (Ctrl+Y)">
          <IconeCreateur nom="retablir" className="h-[18px] w-[18px]" />
          <span className="ada-action-texte">Rétablir</span>
        </button>
        <span className="ada-actions-separateur" aria-hidden />
        <button
          type="button"
          className="ada-action ada-action--accent"
          onClick={() => (avancee ? setConfirmation("aleatoire") : tirerAuHasard())}
          title="Avatar aléatoire"
        >
          <IconeCreateur nom="de" className="h-[18px] w-[18px]" />
          <span className="ada-action-texte">Aléatoire</span>
        </button>
        <button type="button" className="ada-action" onClick={() => setConfirmation("reinitialiser")} title="Réinitialiser l'apparence">
          <IconeCreateur nom="reinitialiser" className="h-[18px] w-[18px]" />
          <span className="ada-action-texte">Réinitialiser</span>
        </button>
        <span className={`ada-sauvegarde ${enregistrement ? "ada-sauvegarde--en-cours" : ""}`} role="status">
          <IconeCreateur nom="coche" className="h-3.5 w-3.5" />
          {enregistrement ? "Enregistrement…" : "Enregistré"}
        </span>
      </div>

        <p className="ada-createur-etape" aria-live="polite">
          Étape {index + 1} / {categoriesCreateur.length}
          <span className="ada-progression" aria-hidden>
            <span style={{ width: `${((index + 1) / categoriesCreateur.length) * 100}%` }} />
          </span>
        </p>
      </header>

      <div className="ada-createur-corps">
        <div className="ada-createur-apercu">
          <ApercuAvatar
            selection={selection}
            vue={vue}
            onVue={setVue}
            pleinEcran={pleinEcran}
            onPleinEcran={setPleinEcran}
            titre={personnage.prenom.trim() ? `Aperçu de ${personnage.prenom.trim()}` : "Aperçu de ton personnage"}
            rendu={{ couleurs: { peau: ap.peau, yeux: ap.yeux, cheveux: ap.cheveux, sourcils: ap.sourcils } }}
          />
        </div>

        <div className="ada-createur-panneau">
          <nav className="ada-onglets" ref={ongletsRef} aria-label="Catégories">
            <div role="tablist" className="ada-onglets-liste" onKeyDown={surClavierOnglets}>
              {categoriesCreateur.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  id={`ada-onglet-${c.id}`}
                  aria-selected={i === index}
                  aria-controls="ada-contenu-categorie"
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => allerA(i)}
                  className="ada-onglet"
                >
                  <span className="ada-onglet-icone">
                    <IconeCreateur nom={c.icone} className="h-5 w-5" />
                    {estComplete(c) && i !== index && <span className="ada-onglet-fait" />}
                  </span>
                  <span className="ada-onglet-nom">{c.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div
            ref={contenuRef}
            id="ada-contenu-categorie"
            role="tabpanel"
            aria-labelledby={`ada-onglet-${categorie.id}`}
            className="ada-createur-contenu"
          >
            <div key={categorie.id} className="ada-apparition">
              <h2 className="ada-createur-titre">{categorie.label}</h2>
              <ContenuCategorie
                categorie={categorie}
                personnage={personnage}
                selection={selection}
                onPersonnage={(p, cle) => histo.appliquer(p, cle)}
                onCalque={choisirCalque}
                onCouleur={choisirCouleur}
                onAller={(id) => allerA(categoriesCreateur.findIndex((c) => c.id === id))}
              />
            </div>
          </div>

          <div className="ada-pied">
            <button type="button" className="ada-btn" onClick={() => (index === 0 ? onRetourAccueil() : allerA(index - 1))}>
              <IconeCreateur nom="precedent" className="h-4 w-4" />
              {index === 0 ? "Accueil" : categoriesCreateur[index - 1].label}
            </button>
            {index === INDEX_RECAPITULATIF ? (
              <button type="button" className="ada-btn ada-btn--or" disabled={!peutTerminer} onClick={terminer}>
                Rejoindre la cérémonie
              </button>
            ) : (
              <button type="button" className="ada-btn ada-btn--principal" onClick={() => allerA(index + 1)}>
                {categoriesCreateur[index + 1].label}
                <IconeCreateur nom="suivant" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {confirmation === "aleatoire" && (
        <Modale titre="Tirer un avatar au hasard ?" onFermer={() => setConfirmation(null)}>
          <p className="mb-6 text-[color:var(--ada-encre-douce)]">
            Ton apparence actuelle sera remplacée. Tu pourras revenir en arrière avec « Annuler ».
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <button className="ada-bouton ada-bouton-fantome" onClick={() => setConfirmation(null)}>
              Garder mon avatar
            </button>
            <button
              className="ada-bouton ada-bouton-or"
              onClick={() => {
                setConfirmation(null);
                tirerAuHasard();
              }}
            >
              Tirer au hasard
            </button>
          </div>
        </Modale>
      )}

      {confirmation === "reinitialiser" && (
        <Modale titre="Réinitialiser l'apparence ?" onFermer={() => setConfirmation(null)}>
          <p className="mb-6 text-[color:var(--ada-encre-douce)]">
            Le visage, la coiffure, la tenue et les couleurs reviennent aux choix de départ. Ton identité et ton caractère sont conservés.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <button className="ada-bouton ada-bouton-fantome" onClick={() => setConfirmation(null)}>
              Annuler
            </button>
            <button
              className="ada-bouton ada-bouton-or"
              onClick={() => {
                setConfirmation(null);
                reinitialiser();
              }}
            >
              Réinitialiser
            </button>
          </div>
        </Modale>
      )}
    </div>
  );
}

// ---------- Contenu de chaque catégorie ----------

type PropsContenu = {
  categorie: CategorieCreateur;
  personnage: Personnage;
  selection: ReturnType<typeof normaliserSelection>;
  onPersonnage: (p: Personnage, cleFusion?: string) => void;
  onCalque: (cat: CategorieCalque, id: string) => void;
  onCouleur: (champ: "peau" | "yeux" | "cheveux" | "sourcils", valeur: string | undefined) => void;
  onAller: (id: string) => void;
};

function ContenuCategorie({ categorie, personnage, selection, onPersonnage, onCalque, onCouleur, onAller }: PropsContenu) {
  const ap = personnage.apparence;

  if (categorie.id === "identite") return <Identite personnage={personnage} onPersonnage={onPersonnage} />;
  if (categorie.id === "caractere") return <Caractere personnage={personnage} onPersonnage={onPersonnage} />;
  if (categorie.id === "recapitulatif") return <Recapitulatif personnage={personnage} selection={selection} onAller={onAller} />;

  const cat = categorie.calque;
  const options = cat ? optionsParCalque[cat] : [];
  const couleur = categorie.couleur;

  return (
    <>
      {cat && options.length > 0 && (
        <Section titre={categorie.id === "tenue" ? "Uniformes" : "Formes"} aide={`${options.length} variantes`}>
          <GrilleVignettes
            label={categorie.label}
            format={formatVignettes[cat] ?? "carre"}
            options={options.map((o) => ({ id: o.id, label: o.label, morphologie: o.morphologie, vignette: cheminVignette(o.fichier) }))}
            valeur={selection[cat]}
            onChoisir={(id) => onCalque(cat, id)}
            onSurvol={(id) => prechargerOption(cat, id, racineAssets)}
          />
        </Section>
      )}

      {(categorie.bientot || (cat && options.length === 0)) && (
        <p className="ada-bientot">
          <IconeCreateur nom="info" className="h-4 w-4 shrink-0" />
          Cette catégorie arrive avec la prochaine bibliothèque d&apos;assets.
        </p>
      )}

      {couleur && (
        <Section titre={couleur.label}>
          {couleur.champ === "sourcils" ? (
            <PastillesCouleur
              label="Couleur des sourcils"
              couleurs={palettes.sourcils}
              valeur={ap.sourcils}
              onChoisir={(v) => onCouleur("sourcils", v)}
              extra={{ label: "Comme les cheveux", actif: ap.sourcils === undefined, onChoisir: () => onCouleur("sourcils", undefined), apercu: couleurSourcils(ap) }}
              note={teintes.sourcils.appliquee ? undefined : NOTE_TEINTE}
            />
          ) : (
            <PastillesCouleur
              label={{ peau: "Carnation", yeux: "Couleur des iris", cheveux: "Couleur des cheveux" }[couleur.champ]}
              couleurs={palettes[couleur.champ]}
              valeur={ap[couleur.champ]}
              onChoisir={(v) => onCouleur(couleur.champ, v)}
              note={teintes[couleur.champ].appliquee ? undefined : NOTE_TEINTE}
            />
          )}
        </Section>
      )}
    </>
  );
}

function Identite({ personnage, onPersonnage }: { personnage: Personnage; onPersonnage: PropsContenu["onPersonnage"] }) {
  return (
    <>
      <Section titre="Prénom ou pseudo" aide="obligatoire">
        <input
          className="ada-champ"
          value={personnage.prenom}
          maxLength={LONGUEUR_MAX_NOM}
          placeholder="Ton prénom ou ton pseudo"
          autoComplete="off"
          aria-label="Prénom"
          aria-required
          onChange={(e) => onPersonnage({ ...personnage, prenom: e.target.value }, "prenom")}
        />
      </Section>
      <Section titre="Identité">
        <div className="ada-choix-ligne" role="radiogroup" aria-label="Identité">
          {identites.map((i) => (
            <button
              key={i.id}
              type="button"
              role="radio"
              aria-checked={personnage.identite === i.id}
              className="ada-puce"
              onClick={() => onPersonnage({ ...personnage, identite: i.id, pronoms: i.pronomsParDefaut })}
            >
              {i.label}
            </button>
          ))}
        </div>
      </Section>
      <Section titre="Pronoms dans les dialogues">
        <div className="ada-choix-ligne" role="radiogroup" aria-label="Pronoms">
          {Object.values(pronoms).map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={personnage.pronoms === p.id}
              className="ada-puce"
              onClick={() => onPersonnage({ ...personnage, pronoms: p.id })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="ada-exemple">
          « {interpoler("{prenom} est arrivé{e} à l'Académie. {Il} semble {g:impatient|impatiente|impatient·e} de commencer.", { personnage, maison: null })} »
        </p>
      </Section>
    </>
  );
}

function Caractere({ personnage, onPersonnage }: { personnage: Personnage; onPersonnage: PropsContenu["onPersonnage"] }) {
  const accord = accordDe(personnage);
  return (
    <>
      <p className="ada-intro">Trois questions pour donner une personnalité à ton personnage. Elles colorent certains dialogues.</p>
      {questionsTraits.map((q) => (
        <fieldset key={q.id} className="ada-section">
          <legend className="ada-question">{q.question}</legend>
          <div className="space-y-2">
            {q.reponses.map((r) => {
              const actif = personnage.traits[q.id] === r.trait;
              return (
                <button
                  key={r.trait}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => onPersonnage({ ...personnage, traits: { ...personnage.traits, [q.id]: r.trait } })}
                  className="ada-reponse"
                >
                  <span>… {r.texte}</span>
                  <span className="ada-reponse-trait">{libelleTrait(r.trait, accord)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </>
  );
}

function Recapitulatif({
  personnage,
  selection,
  onAller,
}: {
  personnage: Personnage;
  selection: ReturnType<typeof normaliserSelection>;
  onAller: (id: string) => void;
}) {
  const ap = personnage.apparence;
  const manque: { label: string; id: string }[] = [];
  if (!personnage.prenom.trim()) manque.push({ label: "ton prénom", id: "identite" });
  if (!questionsTraits.every((q) => personnage.traits[q.id])) manque.push({ label: "les trois questions de caractère", id: "caractere" });

  const nomCouleur = (champ: "peau" | "yeux" | "cheveux" | "sourcils") =>
    champ === "sourcils" && ap.sourcils === undefined
      ? "comme les cheveux"
      : palettes[champ].find((c) => c.valeur === ap[champ])?.label.toLowerCase();

  const lignes = categoriesCreateur
    .filter((c) => c.calque)
    .map((c) => {
      const option = trouverOption(c.calque!, selection[c.calque!]);
      const teinte = c.couleur ? nomCouleur(c.couleur.champ) : undefined;
      return { c, valeur: [option?.label, teinte].filter(Boolean).join(" · ") };
    });

  return (
    <>
      <div className="mx-auto max-w-[420px]">
        <CarteEleve personnage={personnage} maison={null} />
      </div>

      {manque.length > 0 && (
        <div className="ada-manque" role="note">
          <IconeCreateur nom="attention" className="h-4 w-4 shrink-0" />
          <p>
            Pour rejoindre la cérémonie, il reste à renseigner{" "}
            {manque.map((m, i) => (
              <span key={m.id}>
                {i > 0 && " et "}
                <button type="button" className="ada-lien" onClick={() => onAller(m.id)}>
                  {m.label}
                </button>
              </span>
            ))}
            .
          </p>
        </div>
      )}

      <Section titre="Ton personnage">
        <dl className="ada-resume">
          <div>
            <dt>Identité</dt>
            <dd>
              {personnage.prenom.trim() || "—"} · {pronoms[personnage.pronoms].label}
            </dd>
            <button type="button" className="ada-lien" onClick={() => onAller("identite")} aria-label="Modifier l'identité">
              Modifier
            </button>
          </div>
          {lignes.map(({ c, valeur }) => (
            <div key={c.id}>
              <dt>{c.label}</dt>
              <dd>{valeur}</dd>
              <button type="button" className="ada-lien" onClick={() => onAller(c.id)} aria-label={`Modifier : ${c.label}`}>
                Modifier
              </button>
            </div>
          ))}
          <div>
            <dt>Caractère</dt>
            <dd>{Object.values(personnage.traits).map((t) => libelleTrait(t, accordDe(personnage))).join(", ") || "à compléter"}</dd>
            <button type="button" className="ada-lien" onClick={() => onAller("caractere")} aria-label="Modifier le caractère">
              Modifier
            </button>
          </div>
        </dl>
      </Section>
    </>
  );
}
