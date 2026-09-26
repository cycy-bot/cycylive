"use client";

import { useEffect, useRef, useState } from "react";
import {
  CYCYBOT_URL_PUBLIC,
  type Classement,
  type LigneClassement,
  type PeriodeClassement,
  type TypeClassement,
} from "@/lib/cycybot";

const TYPES: { id: TypeClassement; label: string; emoji: string; titre: string }[] = [
  { id: "messages", label: "Messages", emoji: "💬", titre: "Les plus bavards du chat" },
  { id: "watch", label: "Présence", emoji: "⏱", titre: "Les plus présents en live" },
  { id: "streak", label: "Séries", emoji: "🔥", titre: "Les plus fidèles, live après live" },
  { id: "bits", label: "Bits", emoji: "💎", titre: "Les pluies de bits" },
  { id: "gifts", label: "Subs offerts", emoji: "🎁", titre: "Les plus généreux" },
];

const PERIODES: { id: PeriodeClassement; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "session", label: "Live" },
];

function formatValeur(type: TypeClassement, v: number): string {
  if (type === "watch") {
    const h = Math.floor(v / 3600);
    const m = Math.floor((v % 3600) / 60);
    if (h >= 24) return `${Math.floor(h / 24)} j ${h % 24} h`;
    return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
  }
  if (type === "streak") return `${v} live${v > 1 ? "s" : ""}`;
  if (type === "messages" && v >= 1000) {
    return `${(v / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} k`;
  }
  return v.toLocaleString("fr-FR");
}

function Avatar({ ligne, taille, anneau }: { ligne: LigneClassement; taille: string; anneau: string }) {
  return ligne.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ligne.avatar}
      alt=""
      className={`${taille} rounded-full object-cover ring-4 ${anneau}`}
      loading="lazy"
    />
  ) : (
    <span
      className={`${taille} rounded-full ring-4 ${anneau} bg-card flex items-center justify-center font-display font-semibold text-lilac text-xl`}
      aria-hidden
    >
      {(ligne.name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

// Couleurs du podium : or, argent, bronze, en version « lumière d'étoile »
const PODIUM = {
  1: { anneau: "ring-amber-300", glow: "shadow-[0_0_40px_rgba(252,211,77,0.45)]", socle: "h-28", medaille: "bg-amber-300 text-void", taille: "w-24 h-24 md:w-28 md:h-28" },
  2: { anneau: "ring-slate-300", glow: "shadow-[0_0_30px_rgba(203,213,225,0.35)]", socle: "h-20", medaille: "bg-slate-300 text-void", taille: "w-20 h-20 md:w-24 md:h-24" },
  3: { anneau: "ring-orange-400", glow: "shadow-[0_0_30px_rgba(251,146,60,0.35)]", socle: "h-14", medaille: "bg-orange-400 text-void", taille: "w-20 h-20 md:w-24 md:h-24" },
} as const;

function Marche({ ligne, type }: { ligne: LigneClassement | undefined; type: TypeClassement }) {
  if (!ligne) return <div className="flex-1" />;
  const style = PODIUM[ligne.rank as 1 | 2 | 3];
  return (
    <div className="flex-1 flex flex-col items-center min-w-0">
      {ligne.rank === 1 && (
        <span className="text-2xl mb-1 animate-pulse" aria-hidden>
          ✦
        </span>
      )}
      <p className="font-display font-semibold text-ink text-sm md:text-base truncate max-w-full mb-2 px-1">
        {ligne.name}
      </p>
      <div className={`relative rounded-full ${style.glow}`}>
        <Avatar ligne={ligne} taille={style.taille} anneau={style.anneau} />
        <span
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full ${style.medaille} font-display font-bold text-sm flex items-center justify-center ring-4 ring-void`}
          aria-label={`${ligne.rank}e place`}
        >
          {ligne.rank}
        </span>
      </div>
      <p className="mt-4 rounded-full bg-violet/20 border border-violet/30 px-3 py-1 text-sm font-semibold text-ink">
        {formatValeur(type, ligne.value)}
      </p>
      <div
        className={`mt-3 w-full ${style.socle} rounded-t-2xl bg-gradient-to-b from-violet/35 to-violet/5 border-x border-t border-violet/25`}
        aria-hidden
      />
    </div>
  );
}

export default function LeaderboardCycyBot({ initial }: { initial: Classement | null }) {
  const [type, setType] = useState<TypeClassement>(initial?.type || "messages");
  const [periode, setPeriode] = useState<PeriodeClassement>(initial?.period || "global");
  const [classement, setClassement] = useState<Classement | null>(initial);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(!initial);
  const premierRendu = useRef(true);

  useEffect(() => {
    if (premierRendu.current && initial) {
      premierRendu.current = false;
      return;
    }
    premierRendu.current = false;
    let annule = false;
    setChargement(true);
    fetch(`${CYCYBOT_URL_PUBLIC}/api/leaderboard?type=${type}&period=${type === "streak" ? "global" : periode}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Classement) => {
        if (!annule) {
          setClassement(data);
          setErreur(false);
        }
      })
      .catch(() => !annule && setErreur(true))
      .finally(() => !annule && setChargement(false));
    return () => {
      annule = true;
    };
  }, [type, periode, initial]);

  const infos = TYPES.find((t) => t.id === type)!;
  const lignes = classement?.entries || [];
  const podium = lignes.slice(0, 3);
  const suite = lignes.slice(3);

  return (
    <div>
      {/* Choix du classement */}
      <div role="tablist" aria-label="Type de classement" className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={type === t.id}
            onClick={() => setType(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium border transition-all ${
              type === t.id
                ? "bg-violet text-white border-violet shadow-glow-sm"
                : "bg-card border-violet/20 text-ink-soft hover:text-ink hover:border-violet/50"
            }`}
          >
            <span aria-hidden className="mr-1.5">
              {t.emoji}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Période */}
      {type === "streak" ? (
        <p className="text-sm text-ink-soft mb-8">
          Nombre de lives suivis d'affilée (au moins 10 minutes par live). Rater un live remet la série à zéro.
        </p>
      ) : (
        <div
          role="group"
          aria-label="Période"
          className="inline-flex rounded-full border border-violet/20 bg-card p-1 text-sm mb-8"
        >
          {PERIODES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={periode === p.id}
              onClick={() => setPeriode(p.id)}
              className={`rounded-full px-4 py-1.5 transition-all ${
                periode === p.id ? "bg-violet/80 text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className={`transition-opacity ${chargement ? "opacity-50" : "opacity-100"}`} aria-busy={chargement}>
        <h2 className="text-xl md:text-2xl font-semibold text-ink mb-6">
          {infos.emoji} {infos.titre}
          {type !== "streak" && periode === "session" && classement?.live && (
            <span className="ml-3 align-middle text-xs font-medium rounded-full bg-red-500/15 text-red-300 px-2.5 py-1">
              en direct
            </span>
          )}
        </h2>

        {erreur ? (
          <p className="carte-holo rounded-2xl p-6 text-ink-soft">
            Le classement est momentanément indisponible. Cycy_Bot revient dans un instant.
          </p>
        ) : lignes.length === 0 ? (
          <p className="carte-holo rounded-2xl p-6 text-ink-soft">
            Personne au classement pour cette période… la place est libre, à toi de jouer au prochain live ! 🚀
          </p>
        ) : (
          <>
            {/* Podium */}
            <div className="carte-holo liseret-glow rounded-3xl px-4 md:px-10 pt-8 overflow-hidden mb-6">
              <div className="flex items-end justify-center gap-3 md:gap-8 max-w-2xl mx-auto">
                <Marche ligne={podium[1]} type={type} />
                <Marche ligne={podium[0]} type={type} />
                <Marche ligne={podium[2]} type={type} />
              </div>
            </div>

            {/* Suite du classement */}
            {suite.length > 0 && (
              <ol className="carte-holo rounded-2xl overflow-hidden divide-y divide-violet/10">
                {suite.map((l) => (
                  <li key={l.login + l.rank} className="flex items-center gap-4 px-4 md:px-6 py-3">
                    <span className="w-8 text-center font-display font-semibold text-ink-soft">{l.rank}</span>
                    <Avatar ligne={l} taille="w-10 h-10" anneau="ring-violet/30" />
                    <span className="flex-1 min-w-0 truncate font-medium text-ink">{l.name}</span>
                    <span className="rounded-full bg-violet/15 px-3 py-1 text-sm font-semibold text-lilac whitespace-nowrap">
                      {formatValeur(type, l.value)}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {type === "streak" && (
              <p className="text-xs text-ink-soft/70 mt-4">
                Record personnel du n°1 : {formatValeur("streak", lignes[0].best)}.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
