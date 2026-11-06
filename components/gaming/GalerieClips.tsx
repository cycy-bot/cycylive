"use client";

// Page Clips : les clips partagés, rangés live par live, avec le tri (récents / anciens / plus vus) et le filtre par jeu.
import { useMemo, useState } from "react";
import CarteClip from "@/components/gaming/CarteClip";
import type { ClipTwitch } from "@/lib/clipsTwitch";

type Ordre = "recents" | "anciens" | "vues";
type Groupe = { cle: string; titre: string; sous: string; date: number; clips: ClipTwitch[] };

const PARIS = "Europe/Paris";
function jourLong(t: number) {
  const s = new Date(t).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: PARIS });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function grouper(clips: ClipTwitch[], ordre: Ordre): Groupe[] {
  const m = new Map<string, Groupe>();
  for (const c of clips) {
    const debut = c.live ? Date.parse(c.live) : NaN;
    const jour = new Date(c.date).toLocaleDateString("fr-CA", { timeZone: PARIS });
    const cle = Number.isFinite(debut) ? "live:" + c.live : "jour:" + jour;
    if (!m.has(cle)) {
      const t = Number.isFinite(debut) ? debut : Date.parse(c.date);
      m.set(cle, { cle, date: t, titre: Number.isFinite(debut) ? `Live du ${jourLong(t).replace(/^./, (x) => x.toLowerCase())}` : jourLong(t), sous: c.liveJeux || "", clips: [] });
    }
    m.get(cle)!.clips.push(c);
  }
  const g = [...m.values()];
  for (const x of g) {
    x.clips.sort((a, b) => (ordre === "vues" ? b.vues - a.vues : ordre === "anciens" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
    if (!x.sous) x.sous = [...new Set(x.clips.map((c) => c.jeu).filter(Boolean))].slice(0, 2).join(", ");
  }
  return g.sort((a, b) => (ordre === "anciens" ? a.date - b.date : b.date - a.date));
}

export default function GalerieClips({ clips }: { clips: ClipTwitch[] }) {
  const [ordre, setOrdre] = useState<Ordre>("recents");
  const [jeu, setJeu] = useState("");
  const jeux = useMemo(() => {
    const n = new Map<string, number>();
    for (const c of clips) if (c.jeu) n.set(c.jeu, (n.get(c.jeu) || 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([j]) => j);
  }, [clips]);
  const liste = jeu ? clips.filter((c) => c.jeu === jeu) : clips;
  const groupes = useMemo(() => grouper(liste, ordre), [liste, ordre]);

  const pastille = (actif: boolean) => `rounded-full border px-4 py-2 text-sm transition-all ${actif ? "border-violet-light bg-violet/25 text-ink shadow-glow-sm" : "border-violet/20 bg-card text-ink-soft hover:border-violet/50 hover:text-ink"}`;

  return (
    <div>
      <div className="sticky top-20 z-10 -mx-2 mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-violet/15 bg-nebula/90 px-3 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ordre">
          {([["recents", "Les plus récents"], ["anciens", "Les plus anciens"], ["vues", "Les plus vus"]] as const).map(([k, t]) => (
            <button key={k} type="button" onClick={() => setOrdre(k)} aria-pressed={ordre === k} className={pastille(ordre === k)}>{t}</button>
          ))}
        </div>
        {jeux.length > 1 && (
          <div className="flex flex-wrap gap-2 md:ml-auto" role="group" aria-label="Jeu">
            <button type="button" onClick={() => setJeu("")} aria-pressed={!jeu} className={pastille(!jeu)}>Tous les jeux</button>
            {jeux.map((j) => <button key={j} type="button" onClick={() => setJeu(j)} aria-pressed={jeu === j} className={pastille(jeu === j)}>{j}</button>)}
          </div>
        )}
      </div>

      <div className="space-y-12">
        {groupes.map((g, gi) => (
          <section key={g.cle} aria-labelledby={`g-${gi}`}>
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-violet/15 pb-3">
              <h2 id={`g-${gi}`} className="text-xl md:text-2xl font-semibold text-ink">
                {g.cle.startsWith("live:") ? <span className="mr-2 inline-block h-2.5 w-2.5 -translate-y-0.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,.8)]" aria-hidden /> : null}
                {g.titre}
              </h2>
              <p className="text-sm text-ink-soft">{[g.sous, `${g.clips.length} clip${g.clips.length > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.clips.map((c, i) => (
                <CarteClip key={c.id} c={c} grande={gi === 0 && i === 0 && ordre !== "anciens" && g.clips.length > 2} className={gi === 0 && i === 0 && ordre !== "anciens" && g.clips.length > 2 ? "sm:col-span-2 lg:row-span-2" : ""} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
