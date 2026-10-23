"use client";

// Administration — rubrique « gaming » (état partagé : components/admin/contexteAdmin.tsx)
import { useEffect, useState } from "react";
import { type JeuDuMoment, type AutreJeu, type ContenuJeu, MAX_CONTENUS_JEU, contenusDuJeu } from "@/data/gaming";
import { plateformeDe, miniatureYoutubeDe } from "@/data/contenus";
import type { ClipTwitch } from "@/lib/clipsTwitch";
import { ILLUSTRATIONS_JEU, illustrationPour } from "@/lib/illustrationJeu";
import { SousNavAdmin } from "@/components/admin/NavigationAdmin";
import EditeurRiche from "@/components/admin/EditeurRiche";
import { useAdmin } from "@/components/admin/contexteAdmin";

const CHAMP = "rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60";
const COULEUR: Record<ContenuJeu["plateforme"], string> = { TikTok: "#ff3b6b", Instagram: "#e1306c", YouTube: "#ff0000", Twitch: "#9146ff" };

/** Plusieurs clips / vidéos par jeu : coller des liens, ou piocher dans les clips Twitch récents. */
function ContenusJeu({ jeu, onChange, clips }: { jeu: AutreJeu; onChange: (c: ContenuJeu[]) => void; clips: ClipTwitch[] }) {
  const liste = contenusDuJeu(jeu);
  const [colle, setColle] = useState("");
  const [choix, setChoix] = useState(false);
  const ajouter = (urls: { url: string; titre?: string }[]) => {
    const neufs = urls
      .map((x) => ({ ...x, url: x.url.trim() }))
      .filter((x) => /^https?:\/\//i.test(x.url) && !liste.some((c) => c.url === x.url))
      .map((x) => ({ id: Math.random().toString(36).slice(2, 10), url: x.url, titre: x.titre, plateforme: plateformeDe(x.url)?.plateforme ?? "Twitch" }));
    if (neufs.length) onChange([...liste, ...neufs].slice(0, MAX_CONTENUS_JEU));
  };
  const deplacer = (i: number, d: number) => { const l = liste.slice(); const j = i + d; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; onChange(l); };
  return (
    <div className="rounded-xl border border-violet/15 bg-white/[0.02] p-3 space-y-2">
      <p className="text-xs text-ink-soft">🎬 Clips et vidéos du jeu ({liste.length}/{MAX_CONTENUS_JEU}) · TikTok, Reels Instagram, YouTube, clips Twitch</p>
      {liste.map((c, i) => {
        const mini = c.plateforme === "YouTube" ? miniatureYoutubeDe(c.url) : "";
        return (
          <div key={c.id} className="flex items-center gap-2">
            <span className="shrink-0 w-12 h-9 rounded-md overflow-hidden flex items-center justify-center text-[9px] font-bold text-white" style={{ background: mini ? `center/cover url(${mini})` : COULEUR[c.plateforme] }}>{mini ? "" : c.plateforme}</span>
            <input value={c.titre ?? ""} placeholder="Titre (facultatif)" maxLength={80} onChange={(e) => onChange(liste.map((x, k) => (k === i ? { ...x, titre: e.target.value } : x)))} className={`${CHAMP} w-40`} />
            <input value={c.url} placeholder="https://…" onChange={(e) => onChange(liste.map((x, k) => (k === i ? { ...x, url: e.target.value, plateforme: plateformeDe(e.target.value)?.plateforme ?? x.plateforme } : x)))} className={`${CHAMP} flex-1 min-w-0`} />
            <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} className="text-ink-soft/60 hover:text-ink disabled:opacity-25 text-sm px-1">↑</button>
            <button type="button" onClick={() => onChange(liste.filter((_, k) => k !== i))} className="text-ink-soft/60 hover:text-red-300 text-sm px-1.5" aria-label="Retirer">✕</button>
          </div>
        );
      })}
      {liste.length < MAX_CONTENUS_JEU ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={colle}
            placeholder="Colle un ou plusieurs liens (un par ligne ou séparés par des espaces)"
            onChange={(e) => setColle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ajouter(colle.split(/\s+/).map((url) => ({ url }))); setColle(""); } }}
            className={`${CHAMP} flex-1 min-w-[220px]`}
          />
          <button type="button" onClick={() => { ajouter(colle.split(/\s+/).map((url) => ({ url }))); setColle(""); }} className="rounded-full px-3 py-1.5 bg-violet/20 border border-violet/40 text-ink text-xs">＋ Ajouter</button>
          {clips.length ? <button type="button" onClick={() => setChoix(!choix)} className="rounded-full px-3 py-1.5 border border-violet/30 text-ink-soft text-xs hover:bg-violet/10">🎞️ Mes clips Twitch {choix ? "▲" : "▼"}</button> : null}
        </div>
      ) : null}
      {choix ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-auto">
          {clips.map((c) => {
            const deja = liste.some((x) => x.url === c.url);
            return (
              <button key={c.id} type="button" disabled={deja} onClick={() => ajouter([{ url: c.url, titre: c.titre }])} className={`text-left rounded-lg overflow-hidden border ${deja ? "border-emerald-400/40 opacity-60" : "border-violet/20 hover:border-violet/50"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.miniature} alt="" className="w-full aspect-video object-cover" loading="lazy" />
                <span className="block p-1.5 text-[11px] text-ink line-clamp-2">{deja ? "✓ " : ""}{c.titre}</span>
                <span className="block px-1.5 pb-1.5 text-[10px] text-ink-soft">{c.jeu} · {c.vues} vues</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function OngletGaming() {
  const [clips, setClips] = useState<ClipTwitch[]>([]);
  useEffect(() => { fetch("/api/clips-recents").then((r) => r.json()).then((d) => setClips(d.clips || [])).catch(() => {}); }, []);
  const { gaming, setGaming, enregistrement, modifierAutreJeu, ajouterAutreJeu, supprimerAutreJeu, deplacerAutreJeu, modifierJeuDuMoment, ajouterJeuDuMoment, supprimerJeuDuMoment, enregistrer } = useAdmin();
  return (
        <>
          <SousNavAdmin liens={[{ id: "adm-intro-gaming", label: "Introduction" }, { id: "adm-autres-jeux", label: "Autres jeux" }, { id: "adm-jeux-moment", label: "Jeux du moment" }]} />
          <h2 id="adm-intro-gaming" className="scroll-mt-32 text-ink font-medium mb-3">Introduction Gaming</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Le texte en haut de la page /gaming, avant le bloc Valorant.
          </p>
          <div className="mb-4">
            <EditeurRiche
              value={gaming.intro}
              onChange={(html) => setGaming((p) => ({ ...p, intro: html }))}
              minHeight={70}
            />
          </div>
          <button
            onClick={() =>
              enregistrer("/api/gaming", { gaming }, "Données Gaming enregistrées !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-2.5 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer l'introduction"}
          </button>

          <h2 id="adm-autres-jeux" className="scroll-mt-32 text-ink font-medium mb-3">Autres jeux</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Les jeux affichés en cartes sous le bloc Valorant.
          </p>
          <div className="space-y-3 mb-4">
            {gaming.autresJeux.map((jeu, index) => (
              <div
                key={jeu.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nom du jeu"
                    value={jeu.nom}
                    onChange={(e) => modifierAutreJeu(index, { nom: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deplacerAutreJeu(index, -1)}
                      disabled={index === 0}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerAutreJeu(index, 1)}
                      disabled={index === gaming.autresJeux.length - 1}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerAutreJeu(index)}
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Courte description"
                  value={jeu.description}
                  onChange={(e) => modifierAutreJeu(index, { description: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <label className="flex items-center gap-2 text-xs text-ink-soft">
                  Illustration
                  <select
                    value={jeu.illustration ?? ""}
                    onChange={(e) => modifierAutreJeu(index, { illustration: e.target.value || undefined })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  >
                    <option value="">Automatique ({illustrationPour(jeu.nom).label})</option>
                    {ILLUSTRATIONS_JEU.map((i) => (
                      <option key={i.cle} value={i.cle}>{i.label}</option>
                    ))}
                  </select>
                </label>
                <ContenusJeu jeu={jeu} clips={clips} onChange={(contenus) => modifierAutreJeu(index, { contenus, lienClip: undefined })} />
              </div>
            ))}
          </div>
          <button
            onClick={ajouterAutreJeu}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter un jeu
          </button>
          <button
            onClick={() =>
              enregistrer("/api/gaming", { gaming }, "Données Gaming enregistrées !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les autres jeux"}
          </button>

          <h2 id="adm-jeux-moment" className="scroll-mt-32 text-ink font-medium mb-3">Mes jeux du moment</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Section facultative : laisse-la vide pour qu'elle n'apparaisse pas du tout sur le site.
          </p>
          <div className="space-y-3 mb-4">
            {gaming.jeuxDuMoment.map((jeu, index) => (
              <div
                key={jeu.id}
                className="carte-holo rounded-2xl p-4 flex flex-wrap gap-2 items-center border border-violet/12"
              >
                <input
                  type="text"
                  placeholder="Nom du jeu"
                  value={jeu.nom}
                  onChange={(e) => modifierJeuDuMoment(index, { nom: e.target.value })}
                  className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <input
                  type="url"
                  placeholder="Lien vers le jeu (facultatif)"
                  value={jeu.lien || ""}
                  onChange={(e) => modifierJeuDuMoment(index, { lien: e.target.value })}
                  className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <select
                  value={jeu.statut}
                  onChange={(e) =>
                    modifierJeuDuMoment(index, { statut: e.target.value as JeuDuMoment["statut"] })
                  }
                  className="rounded-lg bg-card border border-violet/20 px-2 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                >
                  <option value="En ce moment">En ce moment</option>
                  <option value="En pause">En pause</option>
                  <option value="À venir">À venir</option>
                </select>
                <button
                  onClick={() => supprimerJeuDuMoment(index)}
                  className="text-ink-soft/60 hover:text-red-300 text-sm px-2 shrink-0"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={ajouterJeuDuMoment}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter un jeu du moment
          </button>
          <button
            onClick={() =>
              enregistrer("/api/gaming", { gaming }, "Données Gaming enregistrées !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les jeux du moment"}
          </button>
        </>
  );
}
