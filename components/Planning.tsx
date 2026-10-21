import Link from "next/link";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { datesSemaineActuelle, JOURS_ORDRE, jeuxDe } from "@/data/planning";
import GrillePlanning, { type SemaineGrille } from "@/components/GrillePlanning";
import { lireCalendrier } from "@/lib/calendrierStore";
import { jourAvecException, dateParis } from "@/data/calendrier";
import { lirePlanning } from "@/lib/planningStore";
import { IconCalendar, IconArrowRight } from "@/components/Icons";

const ICONE_EVENEMENT: Record<string, NomIcone> = { quiz: "quiz", discord: "fete", projet: "outils", live: "live", autre: "etoile" };

export default async function Planning() {
  const [habituel, calendrier] = await Promise.all([lirePlanning(), lireCalendrier()]);
  // La semaine en cours et les 3 suivantes : les changements prévus (planning de /admin) remplacent la semaine type
  const lundi = datesSemaineActuelle();
  const aujourdhui = dateParis(new Date());
  const court = (ymd: string) => `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
  const semaines: SemaineGrille[] = [0, 1, 2, 3].map((s) => {
    const dates = lundi.map((d) => new Date(new Date(`${d}T12:00:00Z`).getTime() + s * 7 * 86400000).toISOString().slice(0, 10));
    // Du lundi au dimanche (JOURS_ORDRE commence le dimanche)
    const jours = [1, 2, 3, 4, 5, 6, 0].flatMap((k, i) => {
      const jour = habituel.find((x) => x.jour === JOURS_ORDRE[k]);
      if (!jour) return [];
      const j = jourAvecException(jour, calendrier.exceptions[dates[i]]);
      return [{ jour: j.jour, date: dates[i], off: j.off, heure: j.heure, fin: j.fin, jeux: jeuxDe(j), note: j.note, modifie: j.modifie }];
    });
    return { du: court(dates[0]), au: court(dates[6]), jours };
  });
  const du = semaines[0].du, au = semaines[0].au;
  // Les 3 prochains événements de la communauté (15 jours)
  const maintenant = Date.now();
  const evenements = calendrier.evenements
    .filter((e) => e.debut + (e.dureeMin || 0) * 60000 > maintenant && e.debut < maintenant + 15 * 86400000)
    .sort((a, b) => a.debut - b.debut)
    .slice(0, 3);
  const quand = (ms: number) =>
    new Date(ms).toLocaleString("fr-FR", { timeZone: "Europe/Paris", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink">Planning des lives</h2>
          <p className="mt-1 text-ink-soft text-sm">Semaine du {du} au {au}</p>
        </div>
        <Link
          href="/calendrier"
          className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-sm font-medium text-ink hover:bg-violet/20 transition-all"
        >
          <IconCalendar className="w-4 h-4 text-violet-light" />
          Calendrier des 15 prochains jours
          <IconArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <GrillePlanning semaines={semaines} aujourdhui={aujourdhui} />

      {evenements.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-ink-soft/60 mr-1">À venir</span>
          {evenements.map((e) => {
            return (
              <Link key={e.id} href="/calendrier" className="inline-flex items-center gap-2 rounded-full border border-violet/15 bg-card/70 px-3.5 py-1.5 text-sm text-ink-soft hover:text-ink hover:border-violet/40 transition-all">
                <Icone nom={ICONE_EVENEMENT[e.type] || "etoile"} className="w-4 h-4 text-violet-light" />
                <span className="font-medium text-ink">{e.titre}</span>
                <span className="text-ink-soft/70">· {quand(e.debut)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
