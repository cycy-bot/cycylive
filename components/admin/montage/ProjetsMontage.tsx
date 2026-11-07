"use client";

// 🎬 Studio montage — page d'accueil : nouveau projet (importer une vidéo) + tous les projets.
// Chaque projet : aperçu, nom (modifiable), dates, et un menu « … » (ouvrir, renommer, dupliquer,
// télécharger la vidéo, planifier, archiver, supprimer).
import { useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { enregistrerBrouillon, lireEtatBrouillon, lireFichierBrouillon, listerBrouillons, supprimerBrouillon, type BrouillonInfo } from "@/lib/brouillonsMontage";
import type { ClipTwitch } from "@/lib/montage/projet";

type Props = {
  onNouveau: (f: File, clip: ClipTwitch | null) => void;
  onOuvrir: (b: BrouillonInfo, opts?: { exporter?: boolean }) => void;
  message?: string;
};
type Tri = "maj" | "cree" | "nom";

const dateCourte = (t?: number) => (t ? new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: new Date(t).getFullYear() === new Date().getFullYear() ? undefined : "numeric" }) : "");
function ilYa(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "à l’instant"; if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24); return j === 1 ? "hier" : `il y a ${j} j`;
}
const duree = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const lienCalendrier = "https://bot.cycylive.fr/admin#studio";

export default function ProjetsMontage({ onNouveau, onOuvrir, message }: Props) {
  const [projets, setProjets] = useState<BrouillonInfo[] | null>(null);
  const [vue, setVue] = useState<"actifs" | "archives">("actifs");
  const [tri, setTri] = useState<Tri>("maj");
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState("");
  const [renomme, setRenomme] = useState<{ id: string; nom: string } | null>(null);
  const [occupe, setOccupe] = useState("");
  const [erreur, setErreur] = useState("");
  const [clips, setClips] = useState<ClipTwitch[]>([]);
  const [clip, setClip] = useState<ClipTwitch | null>(null);
  const entree = useRef<HTMLInputElement>(null);

  const recharger = () => listerBrouillons().then(setProjets).catch(() => setProjets([]));
  useEffect(() => {
    recharger();
    fetch("/api/clips-recents").then((r) => r.json()).then((d) => setClips(d.clips || [])).catch(() => {});
    const vu = () => { if (document.visibilityState === "visible") recharger(); };
    document.addEventListener("visibilitychange", vu);
    const fermer = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest("[data-menu-projet]")) setMenu(""); };
    document.addEventListener("pointerdown", fermer);
    return () => { document.removeEventListener("visibilitychange", vu); document.removeEventListener("pointerdown", fermer); };
  }, []);

  const liste = useMemo(() => {
    const l = (projets || []).filter((p) => (vue === "archives" ? p.archive : !p.archive)).filter((p) => !q.trim() || p.nom.toLowerCase().includes(q.trim().toLowerCase()));
    return l.sort((a, b) => (tri === "nom" ? a.nom.localeCompare(b.nom, "fr") : tri === "cree" ? (b.cree || b.maj) - (a.cree || a.maj) : b.maj - a.maj));
  }, [projets, vue, tri, q]);
  const nbArchives = (projets || []).filter((p) => p.archive).length, nbActifs = (projets || []).length - nbArchives;

  // modifie les infos d'un projet (nom, archive) sans l'ouvrir
  async function modifier(p: BrouillonInfo, maj: Partial<BrouillonInfo>, libelle: string) {
    setOccupe(p.id); setErreur(""); setMenu("");
    try {
      const complet = await lireEtatBrouillon(p);
      const info = { ...complet, ...maj, maj: Date.now() };
      await enregistrerBrouillon(info, undefined, { immediat: true });
      setProjets((l) => (l || []).map((x) => (x.id === p.id ? { ...x, ...maj, maj: info.maj } : x)));
    } catch (e) { setErreur(`${libelle} impossible : ${e instanceof Error ? e.message : e}`); }
    setOccupe("");
  }
  async function dupliquer(p: BrouillonInfo) {
    setOccupe(p.id); setErreur(""); setMenu("");
    try {
      const complet = await lireEtatBrouillon(p);
      const f = await lireFichierBrouillon(p.id, complet);
      if (!f) throw new Error("le clip n’est pas sur cet appareil");
      const nid = Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9);
      const info: BrouillonInfo = { ...complet, id: nid, nom: complet.nom + " (copie)", maj: Date.now(), cree: Date.now(), archive: false };
      delete (info as Partial<BrouillonInfo>).ligne; delete (info as Partial<BrouillonInfo>).etatEnLigne;
      await enregistrerBrouillon(info, f);
      await recharger();
    } catch (e) { setErreur(`Duplication impossible : ${e instanceof Error ? e.message : e}`); }
    setOccupe("");
  }
  async function supprimer(p: BrouillonInfo) {
    setMenu("");
    if (!confirm(`Supprimer définitivement le projet « ${p.nom} » ? (Le clip et le montage seront effacés sur tous tes appareils.)`)) return;
    setOccupe(p.id);
    try { await supprimerBrouillon(p.id); } catch { /* déjà parti */ }
    setProjets((l) => (l || []).filter((x) => x.id !== p.id)); setOccupe("");
  }
  function validerNom() {
    if (!renomme) return;
    const p = (projets || []).find((x) => x.id === renomme.id), nom = renomme.nom.trim();
    setRenomme(null);
    if (p && nom && nom !== p.nom) modifier(p, { nom }, "Renommage");
  }

  const pastille = (on: boolean) => `rounded-full border px-4 py-2 text-sm font-medium transition-all ${on ? "border-violet-light bg-violet/25 text-ink" : "border-violet/20 text-ink-soft hover:text-ink"}`;
  const ligneMenu = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-ink hover:bg-violet/15";

  return (
    <div className="space-y-6">
      {/* Nouveau projet */}
      <section className="carte-holo rounded-3xl p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
          <label className="group flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-violet/35 bg-violet/[0.06] p-6 text-center transition-all hover:border-violet-light hover:bg-violet/10"
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith("video")) onNouveau(f, clip); }}>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet text-white shadow-glow transition-transform group-hover:scale-105"><Icone nom="plus" className="h-7 w-7" /></span>
            <span className="text-lg font-semibold text-ink">Nouveau projet</span>
            <span className="text-sm text-ink-soft">Importe une vidéo depuis ta galerie ou tes fichiers (MP4, MOV…) : le projet se crée tout seul.</span>
            <input ref={entree} type="file" accept="video/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onNouveau(f, clip); }} />
          </label>
          <div className="min-w-0">
            <p className="mb-2 text-sm font-medium text-ink">Ou pars d’un clip Twitch récent</p>
            <p className="mb-3 text-xs text-ink-soft">Choisis-le, télécharge-le depuis Twitch, puis importe le fichier : le nom du projet, le titre et le jeu sont remplis pour toi.</p>
            {clips.length ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {clips.slice(0, 12).map((c) => (
                  <button key={c.id} type="button" onClick={() => setClip(clip?.id === c.id ? null : c)} className={`w-40 shrink-0 overflow-hidden rounded-xl border text-left transition-all ${clip?.id === c.id ? "border-violet-light ring-2 ring-violet/40" : "border-violet/15 hover:border-violet/40"}`}>
                    <img src={c.miniature} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                    <span className="block px-2 pt-1.5 text-xs font-medium text-ink line-clamp-2 min-h-[2rem]">{c.titre}</span>
                    <span className="block px-2 pb-1.5 text-[11px] text-ink-soft/70">{c.jeu} · {c.duree} s</span>
                  </button>
                ))}
              </div>
            ) : <p className="text-xs text-ink-soft/70">Aucun clip récent.</p>}
            {clip && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <a href={clip.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-violet/30 px-3.5 py-2 text-lilac hover:bg-violet/10"><Icone nom="telecharger" className="h-4 w-4" /> Télécharger sur Twitch</a>
                <button type="button" onClick={() => entree.current?.click()} className="inline-flex items-center gap-1.5 rounded-full bg-violet px-3.5 py-2 font-semibold text-white hover:bg-violet-light"><Icone nom="plus" className="h-4 w-4" /> Importer le fichier</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {message && <p className="rounded-xl border border-amber-300/40 bg-amber-400/10 p-3 text-sm text-amber-50" role="status">{message}</p>}
      {erreur && <p className="rounded-xl border border-red-300/40 bg-red-400/10 p-3 text-sm text-red-100" role="alert">{erreur}</p>}

      {/* Mes projets */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="mr-2 text-lg font-semibold text-ink">Mes projets</h3>
          <button type="button" onClick={() => setVue("actifs")} className={pastille(vue === "actifs")}>Projets <span className="opacity-60">{nbActifs}</span></button>
          <button type="button" onClick={() => setVue("archives")} className={pastille(vue === "archives")}><Icone nom="archive" className="mr-1 h-4 w-4" />Archivés <span className="opacity-60">{nbArchives}</span></button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un projet…" className="w-52 rounded-full border border-violet/20 bg-card px-4 py-2 text-sm text-ink outline-none focus:border-violet/60" />
            <select value={tri} onChange={(e) => setTri(e.target.value as Tri)} className="rounded-full border border-violet/20 bg-card px-3 py-2 text-sm text-ink outline-none" aria-label="Trier">
              <option value="maj">Modifiés récemment</option>
              <option value="cree">Créés récemment</option>
              <option value="nom">Nom (A → Z)</option>
            </select>
          </div>
        </div>

        {projets === null ? <p className="text-sm text-ink-soft">Chargement des projets…</p>
          : !liste.length ? (
            <p className="rounded-2xl border border-violet/15 bg-white/[0.02] p-8 text-center text-sm text-ink-soft">{q ? "Aucun projet ne correspond." : vue === "archives" ? "Aucun projet archivé." : "Pas encore de projet : importe une vidéo ci-dessus pour commencer."}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {liste.map((p) => (
                <div key={p.id} className={`group relative overflow-hidden rounded-2xl border bg-card/70 transition-all hover:-translate-y-0.5 hover:border-violet/50 hover:shadow-glow-sm ${occupe === p.id ? "opacity-60" : ""} border-violet/15`}>
                  <button type="button" onClick={() => onOuvrir(p)} className="block w-full text-left" title="Ouvrir le projet">
                    <div className="relative aspect-[9/12] overflow-hidden bg-black">
                      {p.miniature ? <img src={p.miniature} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <span className="flex h-full items-center justify-center text-4xl">🎬</span>}
                      {p.duree ? <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">{duree(p.duree)}</span> : null}
                      <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white" title={p.ligne === "local" ? "Seulement sur cet appareil pour l’instant" : p.clipLocal || p.clipEnLigne ? "Projet et clip sur tous tes appareils" : "Le clip est resté sur l’appareil d’origine"}>{p.ligne === "local" ? "📱" : p.clipLocal || p.clipEnLigne ? "☁️" : "☁️ · 🎞️"}</span>
                    </div>
                  </button>
                  <div className="p-3">
                    {renomme?.id === p.id ? (
                      <input autoFocus value={renomme.nom} onChange={(e) => setRenomme({ id: p.id, nom: e.target.value })} onBlur={validerNom} onKeyDown={(e) => { if (e.key === "Enter") validerNom(); if (e.key === "Escape") setRenomme(null); }}
                        className="w-full rounded-md border border-violet/50 bg-black/40 px-2 py-1 text-sm text-ink outline-none" maxLength={120} />
                    ) : (
                      <p className="line-clamp-2 min-h-[2.5rem] pr-7 text-sm font-medium text-ink" onDoubleClick={() => setRenomme({ id: p.id, nom: p.nom })} title={p.nom}>{p.nom}</p>
                    )}
                    <p className="mt-1 text-[11px] text-ink-soft/75">Créé le {dateCourte(p.cree || p.maj)} · modifié {ilYa(p.maj)}</p>
                  </div>
                  <div className="absolute bottom-[3.4rem] right-2" data-menu-projet>
                    <button type="button" onClick={() => setMenu(menu === p.id ? "" : p.id)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur hover:bg-violet" aria-label="Options du projet" aria-expanded={menu === p.id}><Icone nom="points" className="h-5 w-5" /></button>
                    {menu === p.id && (
                      <div className="absolute bottom-11 right-0 z-30 w-56 rounded-2xl border border-violet/25 bg-[#1a1033] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,.6)]" role="menu">
                        <button type="button" className={ligneMenu} onClick={() => { setMenu(""); onOuvrir(p); }}><Icone nom="crayon" className="h-4 w-4 text-lilac" /> Ouvrir / modifier</button>
                        <button type="button" className={ligneMenu} onClick={() => { setMenu(""); setRenomme({ id: p.id, nom: p.nom }); }}><Icone nom="lettres" className="h-4 w-4 text-lilac" /> Renommer</button>
                        <button type="button" className={ligneMenu} onClick={() => dupliquer(p)}><Icone nom="dupliquer" className="h-4 w-4 text-lilac" /> Dupliquer</button>
                        <button type="button" className={ligneMenu} onClick={() => { setMenu(""); onOuvrir(p, { exporter: true }); }}><Icone nom="telecharger" className="h-4 w-4 text-lilac" /> Télécharger la vidéo</button>
                        <a className={ligneMenu} href={lienCalendrier} target="_top" onClick={() => setMenu("")}><Icone nom="calendrier" className="h-4 w-4 text-lilac" /> Planifier (calendrier)</a>
                        <button type="button" className={ligneMenu} onClick={() => modifier(p, { archive: !p.archive }, p.archive ? "Désarchivage" : "Archivage")}><Icone nom="archive" className="h-4 w-4 text-lilac" /> {p.archive ? "Désarchiver" : "Archiver"}</button>
                        <button type="button" className={`${ligneMenu} text-red-200 hover:bg-red-500/15`} onClick={() => supprimer(p)}><Icone nom="corbeille" className="h-4 w-4" /> Supprimer</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}
