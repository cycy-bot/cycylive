import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { maisons } from "@/data/academie/maisons";
import { personnages } from "@/data/academie/personnages";
import type { Expression, PersoId, Scene } from "@/data/academie/types";
import { choisir, differenceRelations, optionsVisibles, suivant, type ContexteJeu, type EtatScene } from "@/lib/academie/moteur";
import { interpoler } from "@/lib/academie/texte";
import Portrait from "./art/Portrait";
import Decor from "./art/Decors";
import { BoutonIcone, Icone, MenuDemo } from "./ui";

type Props = {
  titreChapitre: string;
  scene: Scene;
  etat: EtatScene;
  ctx: ContexteJeu;
  texteInstantane: boolean;
  onEtat: (e: EtatScene) => void;
  onTexteInstantane: (v: boolean) => void;
  onFin: () => void;
  onRejouer: () => void;
  onRecommencerDemo: () => void;
};

type Notification = { id: number; texte: string; ton: "plus" | "moins" | "neutre" };

const ROMAINS = ["I", "II", "III", "IV"];
const VITESSE_MS = 22;
/** Ordre fixe gauche → droite pour que les personnages ne changent pas de côté. */
const ordreScene: PersoId[] = ["milo", "bellamy", "iris"];

function couleurPerso(perso: PersoId | "joueur", ctx: ContexteJeu): string {
  if (perso === "joueur") return ctx.maison ? maisons[ctx.maison].couleurs.principale : "#C9CED8";
  const m = personnages[perso].maison;
  return m ? maisons[m].couleurs.principale : "#C79F4A";
}

export default function LecteurScene({
  titreChapitre,
  scene,
  etat,
  ctx,
  texteInstantane,
  onEtat,
  onTexteInstantane,
  onFin,
  onRejouer,
  onRecommencerDemo,
}: Props) {
  const ligne = scene.lignes[etat.index];
  const estChoix = ligne?.type === "choix";
  const estTexte = ligne?.type === "narration" || ligne?.type === "dialogue";
  const texteComplet = estTexte ? interpoler(ligne.texte, ctx) : "";
  const cleLigne = `${etat.sceneId}-${etat.index}-${etat.historique.length}`;

  const [nbCaracteres, setNbCaracteres] = useState(texteInstantane ? Infinity : 0);
  const [historiqueOuvert, setHistoriqueOuvert] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idNotif = useRef(0);

  // Machine à écrire : redémarre à chaque nouvelle ligne.
  useEffect(() => {
    if (texteInstantane) {
      setNbCaracteres(Infinity);
      return;
    }
    setNbCaracteres(0);
    const t = setInterval(() => {
      setNbCaracteres((n) => {
        if (n >= texteComplet.length) {
          clearInterval(t);
          return n;
        }
        return n + 1;
      });
    }, VITESSE_MS);
    return () => clearInterval(t);
  }, [cleLigne, texteComplet.length, texteInstantane]);

  const texteFini = nbCaracteres >= texteComplet.length;

  const notifier = useCallback((texte: string, ton: Notification["ton"]) => {
    const id = ++idNotif.current;
    setNotifications((n) => [...n, { id, texte, ton }]);
    setTimeout(() => setNotifications((n) => n.filter((x) => x.id !== id)), 3600);
  }, []);

  const avancer = useCallback(() => {
    if (historiqueOuvert || estChoix) return;
    if (etat.termine) return onFin();
    if (!texteFini) return setNbCaracteres(Infinity);
    onEtat(suivant(scene, etat, ctx));
  }, [historiqueOuvert, estChoix, etat, texteFini, onEtat, onFin, scene, ctx]);

  const options = useMemo(() => (estChoix ? optionsVisibles(ligne, etat, ctx) : []), [estChoix, ligne, etat, ctx]);

  const prendreChoix = (optionId: string) => {
    const apres = choisir(scene, etat, ctx, optionId);
    const option = options.find((o) => o.id === optionId);
    if (option?.note) notifier(interpoler(option.note, ctx), "neutre");
    for (const { perso, delta } of differenceRelations(etat, apres)) {
      notifier(`${personnages[perso].nom} ${delta > 0 ? "+" : "−"}${Math.abs(delta)} relation`, delta > 0 ? "plus" : "moins");
    }
    onEtat(apres);
  };

  // Clavier : Espace / Entrée pour continuer, 1-4 pour les choix.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (estChoix) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= options.length) prendreChoix(options[n - 1].id);
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        avancer();
      }
      if (e.key === "Escape") setHistoriqueOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  });

  // Personnages présents : les deux derniers à avoir parlé.
  const presents = useMemo(() => {
    const vus: { perso: PersoId; expression: Expression }[] = [];
    for (let i = etat.historique.length - 1; i >= 0 && vus.length < 2; i--) {
      const h = etat.historique[i];
      if (h.perso && h.perso !== "joueur" && !vus.some((v) => v.perso === h.perso)) {
        vus.push({ perso: h.perso, expression: h.expression ?? "neutre" });
      }
    }
    return vus.sort((a, b) => ordreScene.indexOf(a.perso) - ordreScene.indexOf(b.perso));
  }, [etat.historique]);

  const locuteur = ligne?.type === "dialogue" ? ligne.perso : null;
  const nomLocuteur = locuteur === "joueur" ? ctx.personnage.prenom.trim() || "Toi" : locuteur ? personnages[locuteur].nom : null;
  const accentJoueur = ctx.maison ? maisons[ctx.maison].couleurs.principale : undefined;

  return (
    <div className="relative h-full w-full select-none overflow-hidden" onClick={avancer}>
      {/* Décor */}
      <div key={etat.decor} className="absolute inset-0 ada-fondu">
        <Decor id={etat.decor} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,26,0.35)_0%,transparent_25%,transparent_55%,rgba(7,6,26,0.55)_100%)]" />

      {/* Personnages */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[6%] h-[64%] sm:bottom-0 sm:h-[74%] md:h-[80%]">
        {presents.map((p, i) => {
          const actif = locuteur === p.perso;
          const seul = presents.length === 1;
          const cote = seul ? "centre" : i === 0 ? "gauche" : "droite";
          const position =
            cote === "centre"
              ? "left-1/2"
              : cote === "gauche"
                ? "left-[-14%] sm:left-[4%] md:left-[10%]"
                : "right-[-14%] sm:right-[4%] md:right-[10%]";
          return (
            <div
              key={p.perso}
              className={`absolute bottom-0 aspect-[4/5] h-full max-w-[86vw] transition-all duration-300 ${position} ${actif ? "z-10" : "z-0"}`}
              style={{
                filter: actif || !locuteur ? "none" : "brightness(0.55) saturate(0.8)",
                transform: `${cote === "centre" ? "translateX(-50%) " : ""}scale(${actif ? 1 : 0.95})`,
                transformOrigin: "bottom center",
              }}
            >
              <div key={p.perso + "-entree"} className="ada-entree-portrait h-full w-full">
                <Portrait
                  apparence={personnages[p.perso].apparence}
                  expression={p.expression}
                  accent={couleurPerso(p.perso, ctx)}
                  className="h-full w-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  titre={`${personnages[p.perso].nom}, ${p.expression}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Barre supérieure */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0 rounded-xl bg-black/35 px-3 py-2 backdrop-blur-md">
          <p className="ada-petites-capitales truncate text-[0.58rem] text-[color:var(--ada-or)]">{titreChapitre}</p>
          <p className="truncate text-xs italic text-[color:var(--ada-encre-douce)]">{scene.titre} — texte temporaire, non canonique</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <BoutonIcone label="Historique des dialogues" onClick={() => setHistoriqueOuvert(true)}>
            <Icone nom="historique" />
          </BoutonIcone>
          <BoutonIcone label={texteInstantane ? "Texte instantané : activé" : "Texte instantané : désactivé"} actif={texteInstantane} onClick={() => onTexteInstantane(!texteInstantane)}>
            <Icone nom="eclair" />
          </BoutonIcone>
          <MenuDemo onRecommencer={onRecommencerDemo} autresActions={[{ label: "Rejouer cette scène", action: onRejouer }]} />
        </div>
      </div>

      {/* Notifications de conséquences */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-40 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="ada-monte flex items-center gap-2 rounded-full border bg-[rgba(10,8,28,0.88)] px-4 py-2 text-sm shadow-lg backdrop-blur-md"
            style={{ borderColor: n.ton === "plus" ? "#7FD1A0" : n.ton === "moins" ? "#E68A8A" : "rgba(217,178,94,0.5)" }}
          >
            <span style={{ color: n.ton === "plus" ? "#9BE3B6" : n.ton === "moins" ? "#F0A0A0" : "var(--ada-or-clair)" }}>
              {n.ton === "plus" ? "♥" : n.ton === "moins" ? "↯" : "✦"}
            </span>
            {n.texte}
          </div>
        ))}
      </div>

      {/* Choix */}
      {estChoix && ligne.type === "choix" && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-[radial-gradient(ellipse_at_center,rgba(7,6,26,0.55),rgba(5,4,15,0.88))] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] ada-fondu md:items-center md:pb-0" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-2xl">
            <p className="ada-titre mb-4 text-center text-2xl text-[color:var(--ada-or-clair)] sm:text-3xl">{interpoler(ligne.question, ctx)}</p>
            <div className="space-y-3">
              {options.map((o, i) => (
                <button
                  key={o.id}
                  type="button"
                  className="ada-choix ada-monte text-base sm:text-lg"
                  style={{ animationDelay: `${0.08 + i * 0.08}s` }}
                  onClick={() => prendreChoix(o.id)}
                >
                  <span className="ada-choix-numero">{ROMAINS[i]}</span>
                  {interpoler(o.texte, ctx)}
                  {o.si?.trait && <span className="ada-petites-capitales ml-2 text-[0.55rem] text-[color:var(--ada-or)]">✦ trait</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue */}
      {!estChoix && (
        <div className="absolute inset-x-0 bottom-0 z-20 md:bottom-6 md:px-6">
          <div className="relative mx-auto max-w-4xl">
            {nomLocuteur && locuteur && (
              <div
                className="ada-plaque-nom absolute -top-[2.05rem] left-4 flex items-center gap-2 text-[#14101f] md:left-6"
                style={{ background: `linear-gradient(180deg, ${couleurPerso(locuteur, ctx)}, ${couleurPerso(locuteur, ctx)}cc)` }}
              >
                {locuteur === "joueur" && (
                  <span className="-my-2 -ml-2 h-9 w-9 overflow-hidden rounded-full border-2 border-[#14101f]/40 bg-[#1E1838]">
                    <Portrait apparence={ctx.personnage.apparence} accent={accentJoueur} cadrage="tete" className="h-full w-full" />
                  </span>
                )}
                {nomLocuteur}
              </div>
            )}
            <div className="ada-dialogue min-h-[9.5rem] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:min-h-[10rem] sm:px-8 md:pb-6">
              {etat.termine ? (
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                  <p className="ada-titre text-2xl text-[color:var(--ada-or-clair)]">Fin de la scène de démonstration</p>
                  <button type="button" className="ada-bouton ada-bouton-or" onClick={(e) => (e.stopPropagation(), onFin())}>
                    Voir le bilan de mes choix
                  </button>
                </div>
              ) : (
                <p
                  key={cleLigne}
                  className={`text-[1.12rem] leading-relaxed sm:text-[1.3rem] ${
                    ligne?.type === "narration" ? "text-center italic text-[color:var(--ada-encre-douce)]" : ""
                  }`}
                >
                  {ligne?.type === "narration" && <span className="mr-2 text-[color:var(--ada-or)] not-italic" aria-hidden>❦</span>}
                  {texteComplet.slice(0, nbCaracteres)}
                  <span className="opacity-0">{texteComplet.slice(nbCaracteres)}</span>
                </p>
              )}
              {!etat.termine && (
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-[color:var(--ada-encre-douce)]">
                  <span className="hidden sm:inline">{texteFini ? "Espace ou clic pour continuer" : "Cliquer pour tout afficher"}</span>
                  <button
                    type="button"
                    aria-label="Continuer"
                    onClick={(e) => {
                      e.stopPropagation();
                      avancer();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9b25e]/40 text-[color:var(--ada-or-clair)]"
                  >
                    <span className={texteFini ? "ada-curseur" : ""}>▼</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historique */}
      {historiqueOuvert && (
        <div className="absolute inset-0 z-50 flex justify-end bg-black/50 ada-fondu" onClick={(e) => (e.stopPropagation(), setHistoriqueOuvert(false))}>
          <aside className="ada-panneau flex h-full w-full max-w-md flex-col" onClick={(e) => e.stopPropagation()} aria-label="Historique des dialogues">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="ada-titre text-2xl">Historique</h2>
              <BoutonIcone label="Fermer l'historique" onClick={() => setHistoriqueOuvert(false)}>
                <Icone nom="fermer" />
              </BoutonIcone>
            </div>
            <ol className="ada-defilement flex-1 space-y-4 overflow-y-auto p-5">
              {etat.historique.map((h, i) => (
                <li key={i} className={h.perso === null ? "italic text-[color:var(--ada-encre-douce)]" : ""}>
                  {h.perso && (
                    <span className="ada-petites-capitales mb-0.5 block text-[0.6rem]" style={{ color: couleurPerso(h.perso, ctx) }}>
                      {h.perso === "joueur" ? ctx.personnage.prenom || "Toi" : personnages[h.perso].nom}
                      {h.choix && " · choix"}
                    </span>
                  )}
                  {h.texte}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}
    </div>
  );
}
