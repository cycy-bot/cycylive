"use client";

// Administration — « Clips Twitch » : les clips récents de la chaîne, à publier (ou masquer) sur la page
// Gaming en un clic. Mode automatique (les plus récents) ou « mon choix » (seulement les clips publiés).
import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/contexteAdmin";
import type { ClipTwitch } from "@/lib/clipsTwitch";
import type { ChoixClips } from "@/lib/clipsChoixStore";

const duree = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const date = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function OngletClips() {
  const { enregistrer, enregistrement } = useAdmin();
  const [choix, setChoix] = useState<ChoixClips | null>(null);
  const [recents, setRecents] = useState<ClipTwitch[]>([]);
  const [filtre, setFiltre] = useState<"nouveaux" | "tous" | "publies" | "masques">("nouveaux");
  const [modifie, setModifie] = useState(false);

  useEffect(() => {
    fetch("/api/clips-choix?recents=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setRecents(d.recents || []); setChoix({ mode: d.mode || "auto", publies: d.publies || [], masques: d.masques || [], vus: d.vus || [] }); })
      .catch(() => setChoix({ mode: "auto", publies: [], masques: [], vus: [] }));
  }, []);

  const tous = useMemo(() => {
    const m = new Map<string, ClipTwitch>();
    for (const c of [...recents, ...(choix?.publies || [])]) if (!m.has(c.id)) m.set(c.id, c);
    return [...m.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [recents, choix]);
  if (!choix) return <p className="text-ink-soft text-sm">Chargement des clips…</p>;

  const publie = (id: string) => choix.publies.some((c) => c.id === id);
  const masque = (id: string) => choix.masques.includes(id);
  const nouveau = (id: string) => !choix.vus.includes(id);
  const maj = (c: ChoixClips) => { setChoix(c); setModifie(true); };
  const vu = (c: ChoixClips, id: string) => ({ ...c, vus: c.vus.includes(id) ? c.vus : [...c.vus, id] });
  const publier = (clip: ClipTwitch) => maj(vu({ ...choix, publies: publie(clip.id) ? choix.publies.filter((x) => x.id !== clip.id) : [clip, ...choix.publies], masques: choix.masques.filter((x) => x !== clip.id) }, clip.id));
  const masquer = (clip: ClipTwitch) => maj(vu({ ...choix, masques: masque(clip.id) ? choix.masques.filter((x) => x !== clip.id) : [...choix.masques, clip.id], publies: choix.publies.filter((x) => x.id !== clip.id) }, clip.id));
  const toutVu = () => maj({ ...choix, vus: [...new Set([...choix.vus, ...tous.map((c) => c.id)])] });
  const deplacer = (id: string, d: number) => { const l = choix.publies.slice(); const i = l.findIndex((x) => x.id === id), j = i + d; if (i < 0 || j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; maj({ ...choix, publies: l }); };
  const sauver = async () => { await enregistrer("/api/clips-choix", { choix }, "Clips enregistrés : la page Gaming est à jour !"); setModifie(false); };

  const liste = filtre === "publies" ? choix.publies : tous.filter((c) => (filtre === "nouveaux" ? nouveau(c.id) && !publie(c.id) && !masque(c.id) : filtre === "masques" ? masque(c.id) : true));
  const nbNouveaux = tous.filter((c) => nouveau(c.id) && !publie(c.id) && !masque(c.id)).length;

  return (
    <div className="space-y-5">
      <div className="carte-holo rounded-2xl border border-violet/15 p-4 space-y-3">
        <p className="text-sm text-ink-soft">Les clips créés sur ta chaîne arrivent ici tout seuls (CycyBot te prévient en MP quand il y en a de nouveaux). Un clic pour les publier sur la page <a href="/gaming#clips" target="_blank" className="text-lilac underline">Gaming</a>.</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink">Sur le site :</span>
          <div className="flex rounded-full border border-violet/25 p-1">
            <button type="button" onClick={() => maj({ ...choix, mode: "auto" })} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${choix.mode === "auto" ? "bg-violet text-ink" : "text-ink-soft"}`}>⚡ Automatique</button>
            <button type="button" onClick={() => maj({ ...choix, mode: "choix" })} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${choix.mode === "choix" ? "bg-violet text-ink" : "text-ink-soft"}`}>⭐ Seulement mon choix</button>
          </div>
          <span className="text-xs text-ink-soft">{choix.mode === "auto" ? "Les 12 plus récents (tes clips publiés en premier, les masqués jamais)." : "Uniquement les clips que tu publies, dans ton ordre."}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([["nouveaux", `🆕 À trier (${nbNouveaux})`], ["tous", `Tous (${tous.length})`], ["publies", `✅ Publiés (${choix.publies.length})`], ["masques", `🙈 Masqués (${choix.masques.length})`]] as const).map(([k, t]) => (
          <button key={k} type="button" onClick={() => setFiltre(k)} className={`rounded-full px-3.5 py-1.5 text-sm border ${filtre === k ? "border-violet-light bg-violet/20 text-ink" : "border-violet/15 text-ink-soft"}`}>{t}</button>
        ))}
        {nbNouveaux ? <button type="button" onClick={toutVu} className="ml-auto text-xs text-ink-soft hover:text-lilac">✓ Tout marquer comme trié</button> : null}
      </div>

      {liste.length === 0 ? (
        <p className="text-ink-soft text-sm">{filtre === "nouveaux" ? "Aucun nouveau clip à trier 🎉" : "Rien ici pour l’instant."}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {liste.map((c) => (
            <div key={c.id} className={`carte-holo rounded-2xl overflow-hidden border ${publie(c.id) ? "border-emerald-400/50" : masque(c.id) ? "border-violet/10 opacity-60" : "border-violet/20"}`}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-video bg-nebula">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.miniature ? <img src={c.miniature} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" /> : null}
                <span className="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1.5 text-[11px] text-white">{duree(c.duree)}</span>
                {nouveau(c.id) && !publie(c.id) && !masque(c.id) ? <span className="absolute left-1.5 top-1.5 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold text-white">NOUVEAU</span> : null}
              </a>
              <div className="p-3 space-y-2">
                <p className="text-sm font-medium text-ink line-clamp-2">{c.titre}</p>
                <p className="text-xs text-ink-soft">{c.jeu || "—"} · {c.vues} vue{c.vues > 1 ? "s" : ""} · {date(c.date)} · par {c.auteur}</p>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => publier(c)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${publie(c.id) ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40" : "bg-violet text-ink"}`}>{publie(c.id) ? "✅ Publié" : "📤 Publier"}</button>
                  <button type="button" onClick={() => masquer(c)} className="rounded-full px-3 py-1.5 text-xs border border-violet/25 text-ink-soft hover:bg-violet/10">{masque(c.id) ? "👁️ Ré-afficher" : "🙈 Masquer"}</button>
                  {filtre === "publies" ? (
                    <>
                      <button type="button" onClick={() => deplacer(c.id, -1)} className="rounded-full px-2 py-1.5 text-xs border border-violet/20 text-ink-soft">↑</button>
                      <button type="button" onClick={() => deplacer(c.id, 1)} className="rounded-full px-2 py-1.5 text-xs border border-violet/20 text-ink-soft">↓</button>
                    </>
                  ) : null}
                  <button type="button" onClick={() => navigator.clipboard?.writeText(c.url)} className="rounded-full px-3 py-1.5 text-xs border border-violet/20 text-ink-soft hover:bg-violet/10" title="Copier le lien (pour un jeu, TikTok…)">🔗</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={sauver} disabled={enregistrement || !modifie} className="sticky bottom-4 w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50">
        {enregistrement ? "Enregistrement..." : modifie ? "Enregistrer les clips" : "Tout est enregistré ✓"}
      </button>
    </div>
  );
}
