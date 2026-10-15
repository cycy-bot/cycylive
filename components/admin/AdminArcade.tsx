"use client";

import { useCallback, useEffect, useState } from "react";
import { JEUX_ARCADE, nomJeu, type JeuArcade } from "@/lib/arcadeRegles";

type Ligne = { rang: number; cle: string; nom: string; score: number; date: number };

// Onglet « Arcade » de /admin : voir le classement, retirer un pseudo, tout remettre à zéro.
export default function AdminArcade({ motDePasse }: { motDePasse: string }) {
  const [scores, setScores] = useState<Ligne[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "erreur"; texte: string } | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [jeu, setJeu] = useState<JeuArcade>("runner");

  const appeler = useCallback(
    async (action: "lister" | "supprimer" | "reinitialiser", cle?: string) => {
      if (!motDePasse) {
        setMessage({ type: "erreur", texte: "Entre d'abord ton mot de passe admin (en bas de la page)." });
        return;
      }
      setOccupe(true);
      try {
        const r = await fetch("/api/arcade/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ motDePasse, action, cle, jeu }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.ok) throw new Error(d.erreur || "Erreur inconnue.");
        setScores(d.scores);
        setMessage(action === "lister" ? null : { type: "ok", texte: action === "supprimer" ? "Pseudo retiré du classement." : "Classement remis à zéro." });
      } catch (e) {
        setMessage({ type: "erreur", texte: e instanceof Error ? e.message : "Erreur inconnue." });
      } finally {
        setOccupe(false);
      }
    },
    [motDePasse, jeu]
  );

  useEffect(() => {
    if (motDePasse) appeler("lister");
  }, [motDePasse, appeler]);

  return (
    <div>
      <h2 className="text-ink font-medium mb-3">Jeux du site · tableaux des records</h2>
      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Jeu">
        {JEUX_ARCADE.map((j) => (
          <button
            key={j}
            type="button"
            role="tab"
            aria-selected={jeu === j}
            onClick={() => setJeu(j)}
            className={`rounded-full px-4 py-1.5 text-sm border ${jeu === j ? "bg-violet text-ink border-violet" : "border-violet/25 text-ink-soft hover:bg-violet/10"}`}
          >
            {nomJeu(j)}
          </button>
        ))}
      </div>
      <p className="text-ink-soft mb-4 text-sm">
        Les jeux sont sur <a href="/jeux" target="_blank" className="text-lilac underline">cycylive.fr/jeux</a> et dans la <a href="/jeux/arcade" target="_blank" className="text-lilac underline">salle d&apos;arcade</a>. Chaque pseudo garde son
        meilleur score. Les scores impossibles (trop élevés pour la durée de la partie) sont refusés automatiquement. Tu peux retirer un
        pseudo (inapproprié, triche…) ou remettre tout le classement à zéro, par exemple pour lancer une saison.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => appeler("lister")}
          disabled={occupe}
          className="rounded-full px-4 py-2 border border-violet/30 text-ink-soft text-sm hover:bg-violet/10 disabled:opacity-50"
        >
          {scores === null ? "Afficher le classement" : "Actualiser"}
        </button>
        <button
          onClick={() => {
            if (confirm(`Remettre le classement de « ${nomJeu(jeu)} » à zéro ? Tous ses records seront effacés.`)) appeler("reinitialiser");
          }}
          disabled={occupe}
          className="rounded-full px-4 py-2 border border-red-400/40 text-red-200 text-sm hover:bg-red-500/10 disabled:opacity-50"
        >
          Remettre à zéro
        </button>
      </div>
      {message && <p className={`text-sm mb-3 ${message.type === "ok" ? "text-green-300" : "text-red-300"}`}>{message.texte}</p>}
      {scores && (scores.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucun record pour l&apos;instant.</p>
      ) : (
        <ol className="carte-holo rounded-2xl border border-violet/12 divide-y divide-violet/10">
          {scores.map((s) => (
            <li key={s.cle} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="w-8 text-ink-soft">{s.rang}</span>
              <span className="flex-1 min-w-0 truncate text-ink">{s.nom}</span>
              <span className="text-xs text-ink-soft/50 hidden sm:inline">{s.date ? new Date(s.date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : ""}</span>
              <span className="font-mono text-lilac">{s.score.toLocaleString("fr-FR")}</span>
              <button
                onClick={() => {
                  if (confirm(`Retirer « ${s.nom} » du classement ?`)) appeler("supprimer", s.cle);
                }}
                disabled={occupe}
                className="text-ink-soft/60 hover:text-red-300 text-xs px-2"
              >
                Retirer
              </button>
            </li>
          ))}
        </ol>
      ))}
    </div>
  );
}
