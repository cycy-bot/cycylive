// Blocs de présentation de la page Cycy_Bot (cartes + encarts « en direct » alimentés par le bot).
import type { DiscordCycyBot, ObjetMarche } from "@/lib/cycybot";

export type Bloc = { id: string; emoji: string; titre: string; texte: string; commandes: string[] };

export const nf = (n: number) => n.toLocaleString("fr-FR");
export const etoiles = (n: number) => "⭐".repeat(Math.max(1, Math.min(5, n)));
export const duree = (h: number) => (h >= 1 ? `${h.toLocaleString("fr-FR")} h` : `${Math.round(h * 60)} min`);
export const dateFr = (iso: string) => iso.split("-").reverse().join("/");

export function Pastilles({ noms }: { noms: string[] }) {
  if (!noms.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {noms.map((n) => (
        <code key={n} className="rounded-md bg-violet/15 px-2 py-0.5 text-xs font-display font-semibold text-lilac">
          /{n}
        </code>
      ))}
    </div>
  );
}

export function CarteBloc({ bloc, children }: { bloc: Bloc; children?: React.ReactNode }) {
  return (
    <div id={bloc.id} className="carte-holo rounded-2xl p-5 hover:shadow-glow-sm transition-all scroll-mt-24 flex flex-col">
      <span className="text-2xl" aria-hidden>
        {bloc.emoji}
      </span>
      <h3 className="text-ink font-semibold mt-3 mb-1.5">{bloc.titre}</h3>
      <p className="text-sm text-ink-soft leading-relaxed">{bloc.texte}</p>
      {children}
      <div className="mt-auto">
        <Pastilles noms={bloc.commandes} />
      </div>
    </div>
  );
}

// Encarts « en direct » alimentés par le bot
export function EnDirect({ d, id }: { d: DiscordCycyBot; id: string }) {
  if (id === "marche" && d.market && (d.market.daily.length || d.market.weekly.length)) {
    const ligne = (o: ObjetMarche) => (
      <li key={o.name} className="flex justify-between gap-3">
        <span className="truncate">
          {o.emoji} {o.name}
        </span>
        <span className="shrink-0 text-lilac">
          {nf(o.price)} {o.currency === "fragments" ? "🧩" : "✦"}
        </span>
      </li>
    );
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        <p className="uppercase tracking-wide text-ink-soft/50 mb-2">En vente en ce moment</p>
        <ul className="space-y-1">
          {d.market.daily.map(ligne)}
          {d.market.weekly.map(ligne)}
          {d.market.hasSecret && (
            <li className="flex justify-between gap-3">
              <span>🔒 Objet clandestin ???</span>
              <span className="text-lilac">?</span>
            </li>
          )}
        </ul>
      </div>
    );
  }
  if (id === "expeditions" && d.destinations.length) {
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        <p className="uppercase tracking-wide text-ink-soft/50 mb-2">Destinations du jour</p>
        <ul className="space-y-1">
          {d.destinations.map((x) => (
            <li key={x.name} className="flex justify-between gap-3">
              <span className="truncate">
                {x.emoji} {x.name}
              </span>
              <span className="shrink-0">
                {duree(x.hours)} · {etoiles(x.difficulty)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (id === "question" && (d.question || d.lastQuestion)) {
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        {d.question ? (
          <>
            <p className="uppercase tracking-wide text-ink-soft/50 mb-1.5">Aujourd&apos;hui</p>
            <p className="text-ink font-medium mb-1.5">{d.question.q}</p>
            <p>
              {d.question.options.join(" · ")} · {d.question.votes} vote{d.question.votes > 1 ? "s" : ""}
            </p>
          </>
        ) : null}
        {d.lastQuestion ? (
          <div className={d.question ? "mt-3 pt-3 border-t border-violet/10" : ""}>
            <p className="uppercase tracking-wide text-ink-soft/50 mb-1.5">Résultats de la dernière</p>
            <p className="text-ink font-medium mb-2">{d.lastQuestion.q}</p>
            {d.lastQuestion.options.map((o) => (
              <div key={o.label} className="mb-1.5">
                <div className="flex justify-between">
                  <span>{o.label}</span>
                  <span>{o.pct} %</span>
                </div>
                <div className="h-1.5 rounded-full bg-violet/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet to-lilac" style={{ width: `${o.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
  if (id === "anomalies" && d.anomaly) {
    return (
      <div className="mt-4 rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-xs text-ink">
        ⚠️ Anomalie en cours : <strong>{d.anomaly.emoji} {d.anomaly.label}</strong>, file sur le Discord !
      </div>
    );
  }
  if (id === "chronique" && d.chapters.length) {
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        <p className="uppercase tracking-wide text-ink-soft/50 mb-2">Derniers chapitres</p>
        <ul className="space-y-1">
          {d.chapters.slice(0, 4).map((c) => (
            <li key={c.num} className="flex justify-between gap-3">
              <span className="truncate">
                {String(c.num).padStart(3, "0")} · {c.emoji} {c.title}
              </span>
              <span className="shrink-0">{dateFr(c.date)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
}

