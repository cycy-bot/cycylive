"use client";

import { useCallback, useEffect, useState } from "react";

type Ligne = { rang: number; nom: string; score: number; date: number };

const MEDAILLES = ["🥇", "🥈", "🥉"];

function quand(date: number): string {
  if (!date) return "";
  const jours = Math.floor((Date.now() - date) / 86400000);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return "hier";
  if (jours < 30) return `il y a ${jours} j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function ClassementArcade() {
  const [scores, setScores] = useState<Ligne[] | null>(null);
  const [actif, setActif] = useState(true);
  const [moi, setMoi] = useState("");

  const charger = useCallback(() => {
    fetch("/api/arcade/scores", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setActif(d.actif !== false);
        setScores(Array.isArray(d.scores) ? d.scores : []);
      })
      .catch(() => setScores([]));
  }, []);

  useEffect(() => {
    try {
      setMoi((localStorage.getItem("cycylive-arcade-pseudo") || "").toLowerCase());
    } catch {
      /* navigateur sans stockage */
    }
    charger();
    const maj = (e: Event) => {
      const p = (e as CustomEvent<{ pseudo?: string }>).detail?.pseudo;
      if (p) setMoi(p.toLowerCase());
      charger();
    };
    window.addEventListener("arcade:classement", maj);
    const minuteur = setInterval(charger, 60000);
    return () => {
      window.removeEventListener("arcade:classement", maj);
      clearInterval(minuteur);
    };
  }, [charger]);

  return (
    <section aria-labelledby="classement-arcade" className="carte-holo rounded-2xl border border-violet/12 p-5 md:p-6">
      <h2 id="classement-arcade" className="text-lg font-semibold text-ink mb-1">🏆 Tableau des records</h2>
      <p className="text-xs text-ink-soft/60 mb-4">Le meilleur score de chaque pseudo, mis à jour en direct.</p>
      {scores === null ? (
        <p className="text-sm text-ink-soft">Chargement…</p>
      ) : !actif ? (
        <p className="text-sm text-ink-soft">Le classement arrive très bientôt !</p>
      ) : scores.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucun record pour l&apos;instant : à toi l&apos;honneur !</p>
      ) : (
        <ol className="md:columns-2 md:gap-x-8">
          {scores.map((s) => {
            const estMoi = moi && s.nom.toLowerCase() === moi;
            return (
              <li
                key={s.rang + s.nom}
                className={`mb-1.5 break-inside-avoid flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  estMoi ? "bg-violet/20 border border-violet/40" : s.rang <= 3 ? "bg-white/[0.04]" : ""
                }`}
              >
                <span className="w-7 text-center font-semibold text-ink-soft">{MEDAILLES[s.rang - 1] || s.rang}</span>
                <span className="flex-1 min-w-0 truncate text-ink font-medium">
                  {s.nom}
                  {estMoi && <span className="ml-2 text-[10px] uppercase tracking-wide text-lilac">toi</span>}
                </span>
                <span className="hidden sm:inline text-xs text-ink-soft/50">{quand(s.date)}</span>
                <span className="font-mono font-semibold text-lilac tabular-nums">{s.score.toLocaleString("fr-FR")}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
