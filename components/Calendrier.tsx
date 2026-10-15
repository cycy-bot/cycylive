"use client";

// Calendrier interactif de la communauté : lives, soirées PP, quiz, événements
// Discord et projets. Les données viennent de CycyBot (aucune donnée personnelle :
// seulement le nombre d'inscrit·es). La participation se fait sur Discord (bouton
// « Je participe », rappel en MP) ; ici on peut aussi ajouter l'événement à son agenda.

import { useEffect, useMemo, useState } from "react";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const TZ = "Europe/Paris";

type Statut = "avenir" | "encours" | "termine";
type Resultat = { text?: string; url?: string; clips?: { url: string; label: string }[] } | null;
type Evenement = {
  id: string;
  type: string;
  emoji: string;
  typeLabel: string;
  title: string;
  description?: string;
  startAt: number;
  endAt: number;
  location: string;
  link: string;
  discordUrl: string;
  participants: number | null;
  maxPlaces: number;
  status: Statut;
  result: Resultat;
};

const TYPES: { id: string; label: string; couleur: string }[] = [
  { id: "live", label: "🔴 Lives", couleur: "#9146ff" },
  { id: "pp", label: "🎮 Soirées PP", couleur: "#ff4655" },
  { id: "quiz", label: "🧠 Quiz", couleur: "#fbbf24" },
  { id: "discord", label: "🎉 Discord", couleur: "#5865f2" },
  { id: "projet", label: "🛠️ Projets", couleur: "#34d399" },
  { id: "autre", label: "✨ Autres", couleur: "#c084fc" },
];
const couleurDe = (type: string) => TYPES.find((t) => t.id === type)?.couleur ?? "#c084fc";
const JOURS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

/** « 2026-10-15 » à l'heure de Paris. */
const jourParis = (t: number) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(t));
const heure = (t: number) => new Date(t).toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const dateLongue = (t: number) =>
  new Date(t).toLocaleDateString("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });

function fichierIcs(e: Evenement) {
  const f = (t: number) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const echap = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => "\\" + c);
  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cycylive//Calendrier//FR",
    "BEGIN:VEVENT",
    `UID:${e.id}@cycylive.fr`,
    `DTSTAMP:${f(Date.now())}`,
    `DTSTART:${f(e.startAt)}`,
    `DTEND:${f(e.endAt)}`,
    `SUMMARY:${echap(`${e.emoji} ${e.title}`)}`,
    `DESCRIPTION:${echap([e.description, e.discordUrl || e.link, "https://cycylive.fr/calendrier"].filter(Boolean).join("\n"))}`,
    e.location ? `LOCATION:${echap(e.location)}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${echap(e.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([lignes.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cycylive-${e.title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "evenement"}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function Badge({ statut }: { statut: Statut }) {
  if (statut === "encours")
    return <span className="rounded-full bg-emerald-400/15 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">🟢 En cours</span>;
  if (statut === "termine")
    return <span className="rounded-full border border-violet/25 px-2.5 py-0.5 text-xs text-ink-soft">Terminé</span>;
  return <span className="rounded-full border border-violet/35 bg-violet/10 px-2.5 py-0.5 text-xs text-lilac">À venir</span>;
}

function CarteEvenement({ e }: { e: Evenement }) {
  const complet = e.maxPlaces > 0 && (e.participants ?? 0) >= e.maxPlaces;
  return (
    <article className="carte-holo rounded-2xl border border-violet/25 p-4 md:p-5" style={{ borderLeft: `4px solid ${couleurDe(e.type)}` }}>
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-xs uppercase tracking-wide text-ink-soft">{e.emoji} {e.typeLabel}</span>
        <Badge statut={e.status} />
      </div>
      <h3 className="text-lg font-semibold text-ink leading-snug">{e.title}</h3>
      <p className="text-sm text-ink-soft mt-1 first-letter:uppercase">
        {dateLongue(e.startAt)} · {heure(e.startAt)} → {heure(e.endAt)}
        {e.location ? ` · 📍 ${e.location}` : ""}
      </p>
      {e.description ? <p className="text-sm text-ink-soft/90 mt-2 whitespace-pre-line">{e.description}</p> : null}
      {e.participants !== null && (
        <p className="text-sm text-ink mt-2">
          🙋 <strong>{e.participants}</strong> inscrit·e{e.participants > 1 ? "s" : ""}
          {e.maxPlaces ? ` / ${e.maxPlaces} places` : ""}
          {complet && e.status === "avenir" ? " · complet" : ""}
        </p>
      )}

      {e.result && (e.result.text || e.result.url) ? (
        <div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-300/5 p-3">
          <p className="text-sm font-semibold text-amber-200">🏁 Résultats</p>
          {e.result.text ? <p className="text-sm text-ink mt-1 whitespace-pre-line">{e.result.text}</p> : null}
          {e.result.clips?.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {e.result.clips.map((c) => (
                <li key={c.url}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-violet/30 px-3 py-1 text-xs text-lilac hover:bg-violet/15">
                    🎬 {c.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : e.result.url ? (
            <a href={e.result.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-lilac underline underline-offset-2">
              Voir le résultat →
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {e.status !== "termine" && e.discordUrl && !complet ? (
          <a href={e.discordUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-ink shadow-glow-sm hover:bg-violet-light">
            ✋ Je participe (Discord)
          </a>
        ) : null}
        {e.status === "avenir" ? (
          <button type="button" onClick={() => fichierIcs(e)} className="rounded-full border border-violet/30 px-4 py-2 text-sm text-ink-soft hover:bg-violet/10 hover:text-ink">
            📲 Ajouter à mon agenda
          </button>
        ) : null}
        {e.link ? (
          <a href={e.link} target="_blank" rel="noopener noreferrer" className="rounded-full border border-violet/30 px-4 py-2 text-sm text-ink-soft hover:bg-violet/10 hover:text-ink">
            {e.type === "live" ? (e.status === "termine" ? "📼 Revoir" : "📺 Twitch") : "🔗 Lien"}
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function Calendrier() {
  const [evenements, setEvenements] = useState<Evenement[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [filtres, setFiltres] = useState<string[]>(TYPES.map((t) => t.id));
  const [vue, setVue] = useState<"mois" | "liste">("mois");
  const aujourdHui = jourParis(Date.now());
  const [mois, setMois] = useState(() => aujourdHui.slice(0, 7)); // « 2026-10 »
  const [jour, setJour] = useState<string>(aujourdHui);

  useEffect(() => {
    let annule = false;
    const charger = () =>
      fetch(`${BOT}/api/calendar`)
        .then((r) => r.json())
        .then((d) => { if (!annule) { setEvenements(Array.isArray(d.events) ? d.events : []); setErreur(!d.ok); } })
        .catch(() => { if (!annule) { setErreur(true); setEvenements((x) => x ?? []); } });
    charger();
    const t = setInterval(charger, 60000);
    return () => { annule = true; clearInterval(t); };
  }, []);

  const visibles = useMemo(() => (evenements ?? []).filter((e) => filtres.includes(TYPES.some((t) => t.id === e.type) ? e.type : "autre")), [evenements, filtres]);
  const parJour = useMemo(() => {
    const m = new Map<string, Evenement[]>();
    for (const e of visibles) {
      const k = jourParis(e.startAt);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return m;
  }, [visibles]);

  // Grille du mois (semaines du lundi au dimanche)
  const cases = useMemo(() => {
    const [a, mo] = mois.split("-").map(Number);
    const premier = new Date(Date.UTC(a, mo - 1, 1));
    const decalage = (premier.getUTCDay() + 6) % 7;
    const nbJours = new Date(Date.UTC(a, mo, 0)).getUTCDate();
    const total = Math.ceil((decalage + nbJours) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(Date.UTC(a, mo - 1, 1 + i - decalage));
      return { cle: d.toISOString().slice(0, 10), num: d.getUTCDate(), dansMois: d.getUTCMonth() === mo - 1 };
    });
  }, [mois]);
  const titreMois = new Date(`${mois}-15T12:00:00Z`).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
  const changerMois = (delta: number) => {
    const [a, mo] = mois.split("-").map(Number);
    const d = new Date(Date.UTC(a, mo - 1 + delta, 1));
    setMois(d.toISOString().slice(0, 7));
  };

  const aVenir = visibles.filter((e) => e.status !== "termine");
  const resultats = visibles.filter((e) => e.status === "termine" && e.result).reverse().slice(0, 6);
  const duJour = parJour.get(jour) ?? [];

  const basculer = (id: string) =>
    setFiltres((f) => (f.length === TYPES.length ? [id] : f.includes(id) ? (f.length === 1 ? TYPES.map((t) => t.id) : f.filter((x) => x !== id)) : [...f, id]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => {
          const actif = filtres.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={actif}
              onClick={() => basculer(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${actif ? "text-ink bg-violet/15" : "text-ink-soft/60 border-violet/15"}`}
              style={actif ? { borderColor: couleurDe(t.id) } : undefined}
            >
              {t.label}
            </button>
          );
        })}
        <div className="ml-auto flex rounded-full border border-violet/25 p-1">
          {(["mois", "liste"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={vue === v} onClick={() => setVue(v)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${vue === v ? "bg-violet text-ink" : "text-ink-soft"}`}>
              {v === "mois" ? "🗓️ Mois" : "📋 Liste"}
            </button>
          ))}
        </div>
      </div>

      {evenements === null ? (
        <p className="text-ink-soft">Chargement du calendrier…</p>
      ) : erreur && !evenements.length ? (
        <p className="carte-holo rounded-2xl border border-violet/25 p-5 text-ink-soft">
          Le calendrier est momentanément indisponible. Retrouve les événements sur le Discord, avec la commande <code className="text-lilac">/calendrier</code>.
        </p>
      ) : vue === "mois" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="carte-holo rounded-2xl border border-violet/25 p-3 md:p-5" aria-label="Calendrier du mois">
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => changerMois(-1)} className="rounded-full border border-violet/25 w-9 h-9 text-ink-soft hover:bg-violet/10" aria-label="Mois précédent">‹</button>
              <h2 className="text-lg md:text-xl font-semibold text-ink first-letter:uppercase">{titreMois}</h2>
              <button type="button" onClick={() => changerMois(1)} className="rounded-full border border-violet/25 w-9 h-9 text-ink-soft hover:bg-violet/10" aria-label="Mois suivant">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-ink-soft mb-1">
              {JOURS.map((j) => <div key={j}>{j}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cases.map((c) => {
                const evs = parJour.get(c.cle) ?? [];
                const choisi = c.cle === jour;
                return (
                  <button
                    key={c.cle}
                    type="button"
                    onClick={() => setJour(c.cle)}
                    aria-pressed={choisi}
                    aria-label={`${c.num}${evs.length ? `, ${evs.length} événement${evs.length > 1 ? "s" : ""}` : ""}`}
                    className={`min-h-[58px] md:min-h-[84px] rounded-xl border p-1 md:p-1.5 text-left align-top transition-all ${
                      choisi ? "border-violet-light bg-violet/20" : "border-violet/10 hover:border-violet/35"
                    } ${c.dansMois ? "" : "opacity-35"}`}
                  >
                    <span className={`text-xs font-semibold ${c.cle === aujourdHui ? "rounded-full bg-violet px-1.5 text-ink" : "text-ink-soft"}`}>{c.num}</span>
                    <span className="mt-1 hidden md:flex flex-col gap-0.5">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className="truncate rounded px-1 text-[10.5px] leading-4 text-ink" style={{ background: couleurDe(e.type) + "33" }}>
                          {e.emoji} {e.title}
                        </span>
                      ))}
                      {evs.length > 3 ? <span className="text-[10px] text-ink-soft">+{evs.length - 3}</span> : null}
                    </span>
                    <span className="mt-1 flex md:hidden gap-0.5 flex-wrap">
                      {evs.slice(0, 4).map((e) => <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: couleurDe(e.type) }} />)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
          <section aria-live="polite">
            <h2 className="text-lg font-semibold text-ink mb-3 first-letter:uppercase">{dateLongue(new Date(`${jour}T12:00:00Z`).getTime())}</h2>
            {duJour.length ? (
              <div className="space-y-3">{duJour.map((e) => <CarteEvenement key={e.id} e={e} />)}</div>
            ) : (
              <p className="text-ink-soft text-sm">Rien de prévu ce jour-là. Choisis un autre jour dans le calendrier 🌙</p>
            )}
          </section>
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">À venir</h2>
          {aVenir.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{aVenir.map((e) => <CarteEvenement key={e.id} e={e} />)}</div>
          ) : (
            <p className="text-ink-soft text-sm">Rien de prévu pour l’instant… reviens bientôt 👀</p>
          )}
        </section>
      )}

      {resultats.length ? (
        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">🏁 Derniers résultats</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{resultats.map((e) => <CarteEvenement key={e.id} e={e} />)}</div>
        </section>
      ) : null}

      <p className="text-xs text-ink-soft/80">
        Heures de Paris. Pour participer, clique sur « Je participe » sous l’annonce Discord : CycyBot t’envoie un rappel en message privé avant le début.
      </p>
    </div>
  );
}
