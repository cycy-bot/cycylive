"use client";

// Écran de fin commun aux jeux de la salle d'arcade : score, pseudo, enregistrement du record.
import { useEffect, useRef, useState } from "react";
import type { NomIcone } from "@/components/icones/banque";
import Icone, { Pastille } from "@/components/icones/Icone";
import { ARCADE, type JeuSalle } from "@/lib/arcadeRegles";

const CLE_PSEUDO = "cycylive-arcade-pseudo";

/** Demande un jeton de partie au serveur (à appeler au début de chaque partie). */
export function demarrerPartie(jeu: JeuSalle): Promise<string | null> {
  return fetch("/api/arcade/partie", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jeu }) })
    .then((r) => r.json())
    .then((d) => (d.ok ? (d.jeton as string) : null))
    .catch(() => null);
}

type Props = {
  jeu: JeuSalle;
  score: number;
  resume: string;
  jeton: string | null;
  onRejouer: () => void;
};

export default function FinDePartie({ jeu, score, resume, jeton, onRejouer }: Props) {
  const [pseudo, setPseudo] = useState("");
  const [etat, setEtat] = useState<{ type: "ok" | "erreur"; texte: string } | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const champ = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      setPseudo(localStorage.getItem(CLE_PSEUDO) || "");
    } catch {
      /* pas de stockage */
    }
    setTimeout(() => champ.current?.focus(), 50);
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!jeton) {
      setEtat({ type: "erreur", texte: "Partie non reconnue par le serveur : rejoue pour enregistrer ton score." });
      return;
    }
    setEnvoi(true);
    try {
      const r = await fetch("/api/arcade/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jeu, jeton, score, pseudo, site: "" }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.erreur || "Enregistrement impossible.");
      try {
        localStorage.setItem(CLE_PSEUDO, pseudo.trim());
      } catch {
        /* pas de stockage */
      }
      const place = d.rang ? ` Tu es ${d.rang === 1 ? "1ᵉʳ·e" : `${d.rang}ᵉ`} du classement !` : "";
      setEtat({ type: "ok", texte: d.nouveauRecord ? `Nouveau record : ${d.score.toLocaleString("fr-FR")} points !${place}` : `Score enregistré. Ton record reste de ${d.meilleur.toLocaleString("fr-FR")} points.${place}` });
      setEnvoye(true);
      window.dispatchEvent(new CustomEvent("arcade:classement", { detail: { pseudo: pseudo.trim(), jeu } }));
    } catch (err) {
      setEtat({ type: "erreur", texte: err instanceof Error ? err.message : "Enregistrement impossible." });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-void/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-sm uppercase tracking-widest text-ink-soft">Partie terminée</p>
        <p className="text-5xl font-bold text-ink glow-text my-2 tabular-nums">{score.toLocaleString("fr-FR")}</p>
        {resume ? <p className="text-sm text-ink-soft mb-5">{resume}</p> : null}
        {score > 0 && !envoye ? (
          <form onSubmit={enregistrer} className="flex gap-2 mb-3">
            <label htmlFor={`pseudo-${jeu}`} className="sr-only">Ton pseudo</label>
            <input
              ref={champ}
              id={`pseudo-${jeu}`}
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={ARCADE.pseudoMax}
              minLength={ARCADE.pseudoMin}
              required
              placeholder="Ton pseudo"
              className="flex-1 min-w-0 rounded-full bg-card border border-violet/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-violet-light"
            />
            <button type="submit" disabled={envoi} className="rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-ink hover:bg-violet-light disabled:opacity-50">
              {envoi ? "…" : "Enregistrer"}
            </button>
          </form>
        ) : null}
        {etat ? <p className={`text-sm mb-3 ${etat.type === "ok" ? "text-emerald-300" : "text-red-300"}`}>{etat.texte}</p> : null}
        <button type="button" onClick={onRejouer} className="rounded-full border border-violet/40 px-6 py-2.5 text-sm font-semibold text-ink hover:bg-violet/15">
          <Icone nom="rejouer" className="w-4 h-4 mr-1.5" />Rejouer
        </button>
      </div>
    </div>
  );
}

export type PropsJeu = {
  /** Appelé quand la partie commence vraiment (le jeton est demandé à ce moment-là). */
  onDebut: () => void;
  /** Fin de partie : score final et petit résumé (« 18 cibles · 92 % de précision »). */
  onFin: (score: number, resume: string) => void;
};

/** Écran de départ commun : titre, règles, bouton Jouer. */
export function EcranDepart({ icone, titre, regles, onJouer, bouton = "Jouer" }: { icone: NomIcone; titre: string; regles: React.ReactNode; onJouer: () => void; bouton?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-5 text-center">
      <div className="max-w-md">
        <Pastille nom={icone} taille="lg" className="mb-3" />
        <h3 className="text-2xl font-semibold text-ink mb-2">{titre}</h3>
        <div className="text-sm text-ink-soft leading-relaxed mb-5">{regles}</div>
        <button type="button" onClick={onJouer} className="rounded-full bg-violet px-8 py-3 font-semibold text-ink shadow-glow hover:bg-violet-light">
          <Icone nom="lecture" className="w-5 h-5 mr-1.5" />{bouton}
        </button>
      </div>
    </div>
  );
}
