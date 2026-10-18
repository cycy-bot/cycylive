"use client";

// Administration — rubrique « timeline » (état partagé : components/admin/contexteAdmin.tsx)
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/components/admin/contexteAdmin";
import Icone, { type NomIcone } from "@/components/icones/Icone";
import { BANQUE } from "@/components/icones/banque";
import { CATEGORIES, ORDRE_CATEGORIES, ICONES_TIMELINE, categorieDe, iconeDe } from "@/lib/timelineDesign";
import type { CategorieTimeline, EtapeTimeline } from "@/data/timeline";
import { analyserLien, MAX_LIENS } from "@/lib/videoMoment";

function AideLien({ lien }: { lien?: string }) {
  if (!lien?.trim()) return null;
  const v = analyserLien(lien);
  const court = (() => {
    try {
      const u = new URL(lien.trim());
      return /^(vm|vt)\.tiktok\.com$/i.test(u.hostname) || (/^(www\.)?tiktok\.com$/i.test(u.hostname) && u.pathname.startsWith("/t/"));
    } catch {
      return false;
    }
  })();
  const texte = !v
    ? "⚠️ Ce lien n'est pas valide (il doit commencer par https://)."
    : court
      ? "✓ Lien TikTok court : il sera converti à l'enregistrement pour être lu sur le site."
      : v.type === "lien"
        ? "↗ Ce lien s'ouvrira dans un nouvel onglet (lecture intégrée : clips Twitch, TikTok et YouTube)."
        : "✓ " + (v.type === "twitch" ? "Clip Twitch" : v.type === "tiktok" ? "TikTok" : v.format === "vertical" ? "YouTube Short" : "Vidéo YouTube") + " : bouton « Voir » et lecture directement sur le site.";
  return <p className={"text-xs " + (v ? "text-ink-soft/70" : "text-red-300")}>{texte}</p>;
}

const champLien = "min-w-0 flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60";

function ChampsLiens({ liens, onChange }: { liens: string[]; onChange: (liens: string[]) => void }) {
  // Toujours au moins une case (vide) pour coller un lien
  const cases = liens.length ? liens : [""];
  const maj = (i: number, v: string) => onChange(cases.map((l, j) => (j === i ? v : l)));
  return (
    <div className="space-y-1.5">
      {cases.map((l, i) => (
        <div key={i}>
          <div className="flex gap-2">
            <input
              type="url"
              inputMode="url"
              placeholder={i === 0 ? "Lien du clip / TikTok / YouTube (optionnel)" : "Autre lien"}
              value={l}
              onChange={(e) => maj(i, e.target.value)}
              className={champLien}
            />
            {(cases.length > 1 || l) && (
              <button type="button" onClick={() => onChange(cases.filter((_, j) => j !== i))} aria-label="Retirer ce lien" title="Retirer ce lien" className="text-ink-soft/60 hover:text-red-300 text-sm px-2">
                ✕
              </button>
            )}
          </div>
          <AideLien lien={l} />
        </div>
      ))}
      {cases.length < MAX_LIENS && cases[cases.length - 1].trim() && (
        <button type="button" onClick={() => onChange([...cases, ""])} className="text-xs font-medium text-violet-light hover:text-lilac">
          + Ajouter un autre lien
        </button>
      )}
    </div>
  );
}

const champ = "w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60";
const libelle = "grid gap-1 text-xs font-medium text-ink-soft";

function Interrupteur({ actif, onChange, children }: { actif: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        onClick={() => onChange(!actif)}
        className={"relative h-5 w-9 shrink-0 rounded-full transition-colors " + (actif ? "bg-violet" : "bg-white/15")}
      >
        <span className={"absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all " + (actif ? "left-[18px]" : "left-0.5")} />
      </button>
      {children}
    </label>
  );
}

function ChoixIcone({ valeur, defaut, couleur, onChange }: { valeur?: string; defaut: NomIcone; couleur: string; onChange: (v: string | undefined) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        aria-pressed={!valeur}
        title="Icône de la catégorie"
        className={"h-8 rounded-lg border px-2 text-xs " + (!valeur ? "border-violet-light/70 bg-violet/20 text-ink" : "border-violet/15 text-ink-soft hover:text-ink")}
      >
        Auto
      </button>
      {ICONES_TIMELINE.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-pressed={valeur === n}
          aria-label={BANQUE[n]?.titre ?? n}
          title={BANQUE[n]?.titre ?? n}
          className={"grid h-8 w-8 place-items-center rounded-lg border " + (valeur === n ? "border-violet-light/70 bg-violet/20" : "border-violet/15 hover:border-violet/40")}
          style={{ color: valeur === n || (!valeur && n === defaut) ? couleur : "rgba(207,198,232,.7)" }}
        >
          <Icone nom={n} className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

function CarteEtape({ etape, index, total, ouverte, basculer }: { etape: EtapeTimeline; index: number; total: number; ouverte: boolean; basculer: () => void }) {
  const { modifierEtape, supprimerEtape, deplacerEtape, dupliquerEtape, ajouterEtape } = useAdmin();
  const cat = CATEGORIES[categorieDe(etape)];
  const maj = (c: Partial<EtapeTimeline>) => modifierEtape(index, c);
  const nbLiens = (etape.liens ?? (etape.lien ? [etape.lien] : [])).filter((l) => l.trim()).length;
  const petit = "text-ink-soft/60 hover:text-ink disabled:opacity-25 text-sm px-1.5 py-1";

  return (
    <div className={"rounded-2xl border bg-card/70 " + (etape.masque ? "opacity-60 " : "") + (ouverte ? "border-violet/35" : "border-violet/12")}>
      <div className="flex items-center gap-2 p-3">
        <button type="button" onClick={basculer} aria-expanded={ouverte} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border" style={{ color: cat.couleur, borderColor: cat.couleur + "66", background: cat.douce }}>
            <Icone nom={iconeDe(etape)} className="w-4 h-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{etape.titre || "Nouvelle étape"}</span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-ink-soft/70">
              <span style={{ color: cat.couleur }}>{etape.date || "date ?"}</span>
              {etape.marquant && <span className="text-amber-200">★ moment fort</span>}
              {nbLiens > 0 && <span>{nbLiens} vidéo{nbLiens > 1 ? "s" : ""}</span>}
              {etape.masque && <span>caché sur le site</span>}
            </span>
          </span>
          <span className={"ml-auto shrink-0 text-ink-soft/60 transition-transform " + (ouverte ? "rotate-180" : "")} aria-hidden>▾</span>
        </button>
        <div className="flex shrink-0 items-center">
          <button type="button" onClick={() => deplacerEtape(index, -1)} disabled={index === 0} aria-label="Monter" title="Monter" className={petit}>↑</button>
          <button type="button" onClick={() => deplacerEtape(index, 1)} disabled={index === total - 1} aria-label="Descendre" title="Descendre" className={petit}>↓</button>
        </div>
      </div>

      {ouverte && (
        <div className="grid gap-4 border-t border-violet/10 p-4">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <label className={libelle}>
              Date
              <input type="text" placeholder="ex. 5 avril 2026" value={etape.date} onChange={(e) => maj({ date: e.target.value })} className={champ} />
            </label>
            <label className={libelle}>
              Titre
              <input type="text" placeholder="ex. Mon premier ace" value={etape.titre} onChange={(e) => maj({ titre: e.target.value })} className={champ} />
            </label>
          </div>

          <div className="grid gap-1.5">
            <p className="text-xs font-medium text-ink-soft">Catégorie (couleur sur le site et filtre)</p>
            <div className="flex flex-wrap gap-1.5">
              {ORDRE_CATEGORIES.map((c: CategorieTimeline) => {
                const d = CATEGORIES[c];
                const choisie = categorieDe(etape) === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={choisie}
                    onClick={() => maj({ categorie: c })}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors"
                    style={choisie ? { color: d.couleur, borderColor: d.couleur + "99", background: d.douce } : { color: "rgba(207,198,232,.75)", borderColor: "rgba(181,124,255,.18)" }}
                  >
                    <Icone nom={d.icone} className="w-3.5 h-3.5" /> {d.label}
                  </button>
                );
              })}
            </div>
            {!etape.categorie && <p className="text-xs text-ink-soft/60">Choisie automatiquement d&apos;après le texte. Clique pour la fixer.</p>}
          </div>

          <div className="grid gap-1.5">
            <p className="text-xs font-medium text-ink-soft">Icône</p>
            <ChoixIcone valeur={etape.icone} defaut={cat.icone} couleur={cat.couleur} onChange={(icone) => maj({ icone })} />
          </div>

          <label className={libelle}>
            Description
            <textarea rows={4} placeholder="Raconte ce moment (au-delà de 4 lignes, un bouton « Lire la suite » apparaît sur le site)" value={etape.description ?? ""} onChange={(e) => maj({ description: e.target.value })} className={champ + " resize-y"} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className={libelle}>
              Petit badge (optionnel)
              <input type="text" maxLength={40} placeholder="ex. 100 followers, Rang Or" value={etape.chiffre ?? ""} onChange={(e) => maj({ chiffre: e.target.value })} className={champ} />
            </label>
            <label className={libelle}>
              Image (lien https, optionnel)
              <input type="url" inputMode="url" placeholder="https://… (capture, photo)" value={etape.image ?? ""} onChange={(e) => maj({ image: e.target.value })} className={champ} />
            </label>
          </div>
          {etape.image?.trim().startsWith("https://") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={etape.image} alt="" className="max-h-40 w-auto justify-self-start rounded-lg border border-white/10" />
          )}

          <div className="grid gap-1.5">
            <p className="text-xs font-medium text-ink-soft">Vidéos (jusqu&apos;à {MAX_LIENS})</p>
            <ChampsLiens liens={etape.liens ?? (etape.lien ? [etape.lien] : [])} onChange={(liens) => maj({ liens, lien: undefined })} />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Interrupteur actif={Boolean(etape.marquant)} onChange={(v) => maj({ marquant: v || undefined })}>
              Moment fort (grande étoile, carte mise en avant)
            </Interrupteur>
            <Interrupteur actif={Boolean(etape.masque)} onChange={(v) => maj({ masque: v || undefined })}>
              Cacher sur le site
            </Interrupteur>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-violet/10 pt-3 text-sm">
            <button type="button" onClick={() => ajouterEtape(index)} className="rounded-full border border-violet/25 px-3 py-1 text-ink-soft hover:text-ink">+ Étape juste après</button>
            <button type="button" onClick={() => dupliquerEtape(index)} className="rounded-full border border-violet/25 px-3 py-1 text-ink-soft hover:text-ink">Dupliquer</button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Supprimer « " + (etape.titre || "cette étape") + " » ? (Effacé du site à l'enregistrement.)")) supprimerEtape(index);
              }}
              className="ml-auto rounded-full px-3 py-1 text-ink-soft/70 hover:text-red-300"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OngletTimeline() {
  const { timeline, reglagesTimeline: r, setReglagesTimeline, enregistrement, ajouterEtape, enregistrer } = useAdmin();
  const [ouvertes, setOuvertes] = useState<Set<string>>(() => new Set());
  const majR = (c: Partial<typeof r>) => setReglagesTimeline({ ...r, ...c });
  const basculer = (id: string) =>
    setOuvertes((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  // Une étape ajoutée (ou dupliquée) s'ouvre directement
  const connues = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = timeline.map((e) => e.id);
    if (connues.current && ids.length) {
      const nouvelles = ids.filter((id) => !connues.current!.has(id));
      if (nouvelles.length && nouvelles.length < ids.length) setOuvertes((prev) => new Set([...prev, ...nouvelles]));
    }
    if (ids.length) connues.current = new Set(ids);
  }, [timeline]);
  const toutOuvert = timeline.length > 0 && timeline.every((e) => ouvertes.has(e.id));

  return (
    <>
      <p className="text-ink-soft mb-5 text-sm">
        Les étapes de ton parcours, dans l&apos;ordre chronologique (de la plus ancienne à la plus récente). Elles forment la frise étoilée de la page À propos ;
        les dernières apparaissent aussi sur l&apos;accueil. Clique sur une étape pour la modifier.
      </p>

      <details className="mb-5 rounded-2xl border border-violet/20 bg-card/50 p-4" open>
        <summary className="cursor-pointer text-sm font-semibold text-ink">Affichage sur le site</summary>
        <div className="mt-4 grid gap-3">
          <label className={libelle}>
            Titre de la frise
            <input type="text" value={r.titre} onChange={(e) => majR({ titre: e.target.value })} className={champ} />
          </label>
          <label className={libelle}>
            Petite intro (optionnel)
            <textarea rows={2} value={r.intro} onChange={(e) => majR({ intro: e.target.value })} className={champ + " resize-y"} placeholder="ex. Chaque étoile est un moment qui a compté." />
          </label>
          <label className={libelle}>
            Texte au bout de la frise (vide = rien)
            <input type="text" value={r.fin} onChange={(e) => majR({ fin: e.target.value })} className={champ} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={libelle}>
              Ordre à l&apos;ouverture de la page
              <select value={r.ordre} onChange={(e) => majR({ ordre: e.target.value === "recent" ? "recent" : "chronologique" })} className={champ}>
                <option value="chronologique">Depuis le début</option>
                <option value="recent">Les plus récents d&apos;abord</option>
              </select>
            </label>
            <label className={libelle}>
              Étapes dans l&apos;aperçu de l&apos;accueil
              <select value={r.apercuAccueil} onChange={(e) => majR({ apercuAccueil: Number(e.target.value) })} className={champ}>
                <option value={0}>Ne pas afficher l&apos;aperçu</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    Les {n} dernières
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Interrupteur actif={r.filtres} onChange={(filtres) => majR({ filtres })}>
            Boutons de filtre par catégorie (Live, Valorant, Communauté…)
          </Interrupteur>
        </div>
      </details>

      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <p className="text-ink-soft">
          {timeline.length} étape{timeline.length > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-3">
          {timeline.length > 0 && (
            <button type="button" onClick={() => setOuvertes(toutOuvert ? new Set() : new Set(timeline.map((e) => e.id)))} className="text-violet-light hover:text-lilac">
              {toutOuvert ? "Tout replier" : "Tout déplier"}
            </button>
          )}
          <a href="/a-propos#timeline" target="_blank" rel="noopener noreferrer" className="text-violet-light hover:text-lilac">
            Voir sur le site ↗
          </a>
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        {timeline.map((etape, index) => (
          <CarteEtape key={etape.id} etape={etape} index={index} total={timeline.length} ouverte={ouvertes.has(etape.id)} basculer={() => basculer(etape.id)} />
        ))}
      </div>

      <button
        onClick={() => ajouterEtape()}
        className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-6"
      >
        + Ajouter une étape à la fin
      </button>

      <button
        onClick={() => enregistrer("/api/timeline", { timeline, reglages: r }, "Timeline enregistrée et visible sur le site !")}
        disabled={enregistrement}
        className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
      >
        {enregistrement ? "Enregistrement..." : "Enregistrer la timeline"}
      </button>
    </>
  );
}
