"use client";

// Administration — rubrique « Setup » (PC et matériel de la page À propos)
import { useState } from "react";
import { useAdmin } from "@/components/admin/contexteAdmin";
import { genererId } from "@/components/admin/communs";
import { IconeMateriel, TYPES_MATERIEL, ORDRE_TYPES, devinerType } from "@/components/setup/IconesSetup";
import type { GroupeSetup, ItemSetup, TypeMateriel } from "@/data/setup";

const champ = "w-full min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60";
const libelle = "grid gap-1 text-xs font-medium text-ink-soft";
const petit = "text-ink-soft/60 hover:text-ink disabled:opacity-25 text-sm px-1.5 py-1";

function ChoixType({ valeur, onChange }: { valeur: TypeMateriel; onChange: (t: TypeMateriel) => void }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-label={"Icône : " + TYPES_MATERIEL[valeur].label}
        title={"Icône : " + TYPES_MATERIEL[valeur].label + " (cliquer pour changer)"}
        className="grid h-10 w-10 place-items-center rounded-xl border border-violet/25 bg-violet/10 text-lilac hover:border-violet-light/60"
      >
        <IconeMateriel type={valeur} className="w-5 h-5" />
      </button>
      {ouvert && (
        <div className="absolute left-0 top-11 z-20 grid w-[296px] grid-cols-6 gap-1 rounded-xl border border-violet/30 bg-[#140f24] p-2 shadow-xl">
          {ORDRE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              title={TYPES_MATERIEL[t].label}
              aria-label={TYPES_MATERIEL[t].label}
              aria-pressed={t === valeur}
              onClick={() => {
                onChange(t);
                setOuvert(false);
              }}
              className={"grid h-11 w-11 place-items-center rounded-lg " + (t === valeur ? "bg-violet/30 text-ink" : "text-ink-soft hover:bg-violet/15 hover:text-ink")}
            >
              <IconeMateriel type={t} className="w-5 h-5" />
            </button>
          ))}
          <p className="col-span-6 px-1 pt-1 text-[11px] text-ink-soft/60">Le nom de l&apos;icône sert aussi de petit libellé sur le site.</p>
        </div>
      )}
    </div>
  );
}

function LigneArticle({ it, fiche, premier, dernier, maj, monter, descendre, retirer }: {
  it: ItemSetup; fiche: boolean; premier: boolean; dernier: boolean;
  maj: (c: Partial<ItemSetup>) => void; monter: () => void; descendre: () => void; retirer: () => void;
}) {
  const lienInvalide = Boolean(it.lien?.trim()) && !/^https:\/\//i.test(it.lien!.trim());
  return (
    <div className="rounded-xl border border-violet/12 bg-void/40 p-2.5">
      <div className="flex items-start gap-2">
        <ChoixType valeur={it.type} onChange={(type) => maj({ type })} />
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_170px]">
          <input
            type="text"
            placeholder="Nom (ex. Elgato Wave:3)"
            value={it.nom}
            onChange={(e) => {
              const nom = e.target.value;
              // Nouvel article encore « Accessoire » : l'icône suit le nom tapé
              const t = it.type === "autre" ? devinerType(nom) : null;
              maj(t ? { nom, type: t } : { nom });
            }}
            className={champ}
          />
          <input type="text" placeholder="Détail (ex. 32 Go, blanc)" value={it.detail ?? ""} onChange={(e) => maj({ detail: e.target.value })} className={champ} />
          <input
            type="url"
            inputMode="url"
            placeholder="Lien vers l'article (optionnel, https://…)"
            value={it.lien ?? ""}
            onChange={(e) => maj({ lien: e.target.value })}
            className={champ + " sm:col-span-2" + (lienInvalide ? " border-red-400/60" : "")}
          />
        </div>
        <div className="flex shrink-0 flex-col items-center">
          <button type="button" onClick={monter} disabled={premier} aria-label="Monter" title="Monter" className={petit}>↑</button>
          <button type="button" onClick={descendre} disabled={dernier} aria-label="Descendre" title="Descendre" className={petit}>↓</button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-12 text-xs">
        <span className="text-ink-soft/60">{TYPES_MATERIEL[it.type].label}</span>
        {fiche && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-ink-soft">
            <input type="checkbox" checked={Boolean(it.vedette)} onChange={(e) => maj({ vedette: e.target.checked || undefined })} className="accent-violet-light" />
            Pièce maîtresse (en grand en haut)
          </label>
        )}
        {lienInvalide && <span className="text-red-300">Le lien doit commencer par https://</span>}
        {it.lien?.trim() && !lienInvalide && (
          <a href={it.lien} target="_blank" rel="noopener noreferrer" className="text-violet-light hover:text-lilac">
            Tester le lien ↗
          </a>
        )}
        <button type="button" onClick={retirer} className="ml-auto text-ink-soft/60 hover:text-red-300">
          Retirer
        </button>
      </div>
    </div>
  );
}

function CarteGroupe({ g, index, total, maj, deplacer, supprimer }: {
  g: GroupeSetup; index: number; total: number;
  maj: (c: Partial<GroupeSetup>) => void; deplacer: (d: -1 | 1) => void; supprimer: () => void;
}) {
  const items = g.items;
  const majItem = (i: number, c: Partial<ItemSetup>) => maj({ items: items.map((x, j) => (j === i ? { ...x, ...c } : x)) });
  const bouger = (i: number, d: -1 | 1) => {
    const c = [...items];
    [c[i], c[i + d]] = [c[i + d], c[i]];
    maj({ items: c });
  };
  const fiche = g.style === "fiche";
  return (
    <section className="rounded-2xl border border-violet/25 bg-card/60 p-4">
      <div className="flex items-start gap-2">
        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
          <label className={libelle}>
            Titre
            <input type="text" value={g.titre} onChange={(e) => maj({ titre: e.target.value })} className={champ} placeholder="ex. Aether, Matériel" />
          </label>
          <label className={libelle}>
            Sous-titre (optionnel)
            <input type="text" value={g.sousTitre ?? ""} onChange={(e) => maj({ sousTitre: e.target.value })} className={champ} />
          </label>
        </div>
        <div className="flex shrink-0 items-center pt-5">
          <button type="button" onClick={() => deplacer(-1)} disabled={index === 0} aria-label="Monter le groupe" title="Monter le groupe" className={petit}>↑</button>
          <button type="button" onClick={() => deplacer(1)} disabled={index === total - 1} aria-label="Descendre le groupe" title="Descendre le groupe" className={petit}>↓</button>
        </div>
      </div>

      <div className="mt-3 inline-flex rounded-full border border-violet/20 p-0.5 text-xs" role="group" aria-label="Présentation">
        {(["fiche", "grille"] as const).map((st) => (
          <button key={st} type="button" aria-pressed={g.style === st} onClick={() => maj({ style: st })} className={"rounded-full px-3 py-1 font-medium " + (g.style === st ? "bg-violet/30 text-ink" : "text-ink-soft hover:text-ink")}>
            {st === "fiche" ? "Fiche technique (PC)" : "Tuiles (matériel)"}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2">
        {items.map((it, i) => (
          <LigneArticle
            key={it.id}
            it={it}
            fiche={fiche}
            premier={i === 0}
            dernier={i === items.length - 1}
            maj={(c) => majItem(i, c)}
            monter={() => bouger(i, -1)}
            descendre={() => bouger(i, 1)}
            retirer={() => maj({ items: items.filter((_, j) => j !== i) })}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <button type="button" onClick={() => maj({ items: [...items, { id: genererId(), type: "autre", nom: "" }] })} className="rounded-full border border-violet/30 px-3.5 py-1.5 font-medium text-ink-soft hover:bg-violet/10 hover:text-ink">
          + Ajouter un article
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Supprimer le groupe « " + (g.titre || "sans titre") + " » et ses " + items.length + " article(s) ?")) supprimer();
          }}
          className="ml-auto px-2 text-ink-soft/60 hover:text-red-300"
        >
          Supprimer le groupe
        </button>
      </div>
    </section>
  );
}

export default function OngletSetup() {
  const { setup, setSetup, enregistrement, enregistrer } = useAdmin();
  const groupes = setup.groupes;
  const majGroupe = (i: number, c: Partial<GroupeSetup>) => setSetup({ ...setup, groupes: groupes.map((g, j) => (j === i ? { ...g, ...c } : g)) });
  const deplacer = (i: number, d: -1 | 1) => {
    const c = [...groupes];
    [c[i], c[i + d]] = [c[i + d], c[i]];
    setSetup({ ...setup, groupes: c });
  };

  return (
    <>
      <p className="text-ink-soft mb-5 text-sm">
        Ton PC et ton matériel, affichés dans le bloc Setup de la page À propos. Clique sur l&apos;icône d&apos;un article pour la changer ;
        colle un lien (boutique, site de la marque) pour que les visiteurs puissent voir l&apos;article.
      </p>

      <div className="grid gap-4 mb-4">
        {groupes.map((g, i) => (
          <CarteGroupe key={g.id} g={g} index={i} total={groupes.length} maj={(c) => majGroupe(i, c)} deplacer={(d) => deplacer(i, d)} supprimer={() => setSetup({ ...setup, groupes: groupes.filter((_, j) => j !== i) })} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setSetup({ ...setup, groupes: [...groupes, { id: genererId(), titre: "Nouveau groupe", style: "grille", items: [] }] })}
        className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-5"
      >
        + Ajouter un groupe (ex. Console, Déco du stream…)
      </button>

      <div className="grid gap-3 rounded-2xl border border-violet/20 bg-card/50 p-4 mb-6">
        <label className={libelle}>
          Petite phrase sous le setup
          <textarea rows={2} value={setup.note} onChange={(e) => setSetup({ ...setup, note: e.target.value })} className={champ + " resize-y"} />
        </label>
        <label className={libelle}>
          Mention sous les liens (affichée seulement s&apos;il y a au moins un lien)
          <input type="text" value={setup.mentionLiens} onChange={(e) => setSetup({ ...setup, mentionLiens: e.target.value })} className={champ} placeholder="ex. Certains liens sont affiliés : un achat via ces liens me reverse une petite commission." />
        </label>
        <p className="text-xs text-ink-soft/60">
          Si un lien est affilié (Amazon Partenaires, code créateur…), tu dois le signaler clairement : remplis la mention ci-dessus.
        </p>
      </div>

      <button
        onClick={() => enregistrer("/api/setup", { setup }, "Setup enregistré et visible sur le site !")}
        disabled={enregistrement}
        className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
      >
        {enregistrement ? "Enregistrement..." : "Enregistrer le setup"}
      </button>
    </>
  );
}
