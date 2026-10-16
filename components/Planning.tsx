import Link from "next/link";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { getSemaineActuelle, datesSemaineActuelle, JOURS_ORDRE, LABEL_GENERIQUE } from "@/data/planning";
import { lireCalendrier } from "@/lib/calendrierStore";
import { jourAvecException, dateParis } from "@/data/calendrier";
import { lirePlanning } from "@/lib/planningStore";
import { IconCrystal, IconValorant, IconCalendar, IconArrowRight } from "@/components/Icons";

const ICONE_EVENEMENT: Record<string, NomIcone> = { quiz: "quiz", discord: "fete", projet: "outils", live: "live", autre: "etoile" };

export default async function Planning() {
  const [habituel, calendrier] = await Promise.all([lirePlanning(), lireCalendrier()]);
  const { du, au } = getSemaineActuelle();
  // Les changements prévus cette semaine (onglet Calendrier de /admin) remplacent le planning habituel
  const dates = datesSemaineActuelle();
  const aujourdhui = dateParis(new Date());
  const planning = habituel.map((jour) => {
    const i = (JOURS_ORDRE.indexOf(jour.jour) + 6) % 7;
    return { ...jourAvecException(jour, dates[i] ? calendrier.exceptions[dates[i]] : undefined), date: dates[i] || "" };
  });
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 md:gap-3">
        {planning.map((jour) => {
          const estAujourdhui = jour.date === aujourdhui;
          const valo = !jour.off && /valorant/i.test(jour.jeu || "");
          return (
            <div
              key={jour.jour}
              className={`relative carte-holo rounded-2xl px-4 py-3 md:p-4 flex flex-wrap md:flex-col items-center md:text-center gap-x-3 gap-y-1 md:gap-2 border ${
                estAujourdhui ? "border-violet-light shadow-glow" : jour.off ? "border-violet/10 opacity-80" : "border-violet/35 shadow-glow-sm"
              }`}
            >
              {estAujourdhui && (
                <span className="absolute -top-2.5 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 rounded-full bg-violet px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Aujourd&apos;hui
                </span>
              )}
              <span className="w-24 md:w-auto text-xs tracking-wide text-ink-soft uppercase">
                {jour.jour}
                {jour.date ? <span className="ml-1 text-ink-soft/50">{Number(jour.date.slice(8))}</span> : null}
              </span>
              {jour.off ? (
                <>
                  <Icone nom="dodo" className="w-6 h-6 text-ink-soft/70" />
                  <span className="ml-auto md:ml-0 text-ink-soft text-sm font-medium">OFF</span>
                </>
              ) : (
                <>
                  {valo ? <IconValorant className="w-6 h-6 text-rose-300" /> : <IconCrystal className="w-6 h-6 text-lilac" />}
                  <span className="text-lilac text-sm font-medium leading-tight">{jour.jeu ?? LABEL_GENERIQUE}</span>
                  <span className="ml-auto md:ml-0 text-ink text-sm font-semibold">
                    {jour.heure}
                    {jour.fin ? <span className="font-normal text-ink-soft"> → {jour.fin}</span> : null}
                  </span>
                </>
              )}
              {jour.modifie && <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">Changement</span>}
              {jour.note ? <span className="w-full md:w-auto text-[11px] leading-tight text-ink-soft">{jour.note}</span> : null}
            </div>
          );
        })}
      </div>

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
