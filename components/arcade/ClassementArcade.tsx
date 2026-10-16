"use client";

import { useCallback, useEffect, useState } from "react";
import Icone from "@/components/icones/Icone";

type Ligne = { rang: number; nom: string; score: number; date: number };

const COULEUR_MEDAILLE = ["text-amber-300", "text-slate-200", "text-orange-300"];

function quand(date: number): string {
  if (!date) return "";
  const jours = Math.floor((Date.now() - date) / 86400000);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return "hier";
  if (jours < 30) return `il y a ${jours} j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function ClassementArcade({ jeu = "runner", titre = "Tableau des records" }: { jeu?: string; titre?: string }) {
  const [scores, setScores] = useState<Ligne[] | null>(null);
  const [actif, setActif] = useState(true);
  const [moi, setMoi] = useState("");

  const charger = useCallback(() => {
    fetch(`/api/arcade/scores?jeu=${jeu}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setActif(d.actif !== false);
        setScores(Array.isArray(d.scores) ? d.scores : []);
      })
      .catch(() => setScores([]));
  }, [jeu]);

  useEffect(() => {
    try {
      setMoi((localStorage.getItem("cycylive-arcade-pseudo") || "").toLowerCase());
    } catch {
      /* navigateur sans stockage */
    }
    charger();
    const maj = (e: Event) => {
      const det = (e as CustomEvent<{ pseudo?: string; jeu?: string }>).detail;
      if ((det?.jeu || "runner") !== jeu) return;
      const p = det?.pseudo;
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

  const podium = (scores || []).slice(0, 3);
  const suite = (scores || []).slice(3);
  const estMoi = (nom: string) => Boolean(moi && nom.toLowerCase() === moi);

  return (
    <section aria-labelledby={`classement-${jeu}`} className="carte-holo rounded-3xl p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-5">
        <div>
          <h2 id={`classement-${jeu}`} className="flex items-center gap-2.5 text-xl md:text-2xl font-semibold text-ink"><Icone nom="trophee" className="w-6 h-6 text-amber-300" />{titre}</h2>
          <p className="text-sm text-ink-soft/70 mt-1">Le meilleur score de chaque pseudo, mis à jour en direct.</p>
        </div>
        {scores && scores.length > 0 && <p className="text-xs text-ink-soft/60">Top {scores.length}</p>}
      </div>
      {scores === null ? (
        <div className="grid sm:grid-cols-3 gap-3" aria-hidden>
          {[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/[0.04] animate-pulse" />)}
        </div>
      ) : !actif ? (
        <p className="text-sm text-ink-soft">Le classement arrive très bientôt !</p>
      ) : scores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-violet/30 p-8 text-center">
          <Icone nom="drapeau" className="w-9 h-9 mb-2 text-violet-light" />
          <p className="text-ink font-medium">Aucun record pour l&apos;instant</p>
          <p className="text-sm text-ink-soft mt-1">Joue une partie et inscris ton pseudo en premier !</p>
        </div>
      ) : (
        <>
          <ol className="grid gap-3 sm:grid-cols-3 mb-4" aria-label="Podium">
            {podium.map((s) => (
              <li
                key={s.rang + s.nom}
                className={`relative overflow-hidden rounded-2xl border p-4 flex items-center justify-between gap-3 sm:block ${
                  s.rang === 1 ? "border-amber-300/50 bg-gradient-to-br from-amber-300/15 to-transparent" : s.rang === 2 ? "border-slate-200/30 bg-gradient-to-br from-slate-200/10 to-transparent" : "border-orange-400/30 bg-gradient-to-br from-orange-400/10 to-transparent"
                } ${estMoi(s.nom) ? "ring-2 ring-violet-light" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`relative ${COULEUR_MEDAILLE[s.rang - 1]}`} aria-label={`${s.rang}ᵉ place`}><Icone nom="medaille" className="w-9 h-9" /></span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate text-base" title={s.nom}>
                      {s.nom}
                      {estMoi(s.nom) && <span className="ml-2 align-middle rounded-full bg-violet/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-lilac">toi</span>}
                    </p>
                    <p className="text-xs text-ink-soft/60">{quand(s.date)}</p>
                  </div>
                </div>
                <p className="shrink-0 sm:mt-3 font-mono text-xl sm:text-2xl font-bold text-lilac tabular-nums">{s.score.toLocaleString("fr-FR")}</p>
              </li>
            ))}
          </ol>
          {suite.length > 0 && (
            <ol start={4} className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {suite.map((s) => (
                <li
                  key={s.rang + s.nom}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm border-b border-violet/10 ${estMoi(s.nom) ? "bg-violet/20 border border-violet/40" : ""}`}
                >
                  <span className="w-6 shrink-0 text-center font-semibold text-ink-soft/70 tabular-nums">{s.rang}</span>
                  <span className="flex-1 min-w-0 truncate text-ink font-medium" title={s.nom}>
                    {s.nom}
                    {estMoi(s.nom) && <span className="ml-2 text-[10px] uppercase tracking-wide text-lilac">toi</span>}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft/60">{quand(s.date)}</span>
                  <span className="shrink-0 font-mono font-semibold text-lilac tabular-nums">{s.score.toLocaleString("fr-FR")}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
