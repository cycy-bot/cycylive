"use client";

// Connexion Discord des joueurs (ticket à gratter, compagnon, coffres scellés).
// Les récompenses sont limitées à une par COMPTE Discord et par jour : changer de
// navigateur, d'appareil ou passer en navigation privée ne redonne plus de partie.
// Le jeton arrive dans l'ancre (#cycy-session=…) au retour de Discord et reste
// dans ce navigateur ; le gain est ajouté directement au compte, sans code.

import { useCallback, useEffect, useState } from "react";
import Icone from "@/components/icones/Icone";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const CLE = "cycylive-discord-session";
const EVT = "cycylive-discord-session";

export type Joueur = { uid: string; name: string; avatar: string };

function lire(): string {
  try {
    return localStorage.getItem(CLE) || "";
  } catch {
    return "";
  }
}
function ecrire(v: string) {
  try {
    if (v) localStorage.setItem(CLE, v);
    else localStorage.removeItem(CLE);
  } catch {
    /* navigateur sans stockage : la session ne dure que le temps de la page */
  }
  memoire = v;
  window.dispatchEvent(new Event(EVT));
}
let memoire = "";

/** Jeton à envoyer avec chaque partie. */
export function sessionDiscord(): string {
  return lire() || memoire;
}

export function lienConnexion(): string {
  const retour = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://cycylive.fr/jeux";
  return `${BOT}/jeux/connexion?retour=${encodeURIComponent(retour)}`;
}

export function useCompteDiscord() {
  const [joueur, setJoueur] = useState<Joueur | null>(null);
  const [pret, setPret] = useState(false);
  const [erreur, setErreur] = useState("");

  const verifier = useCallback(async () => {
    const session = sessionDiscord();
    if (!session) {
      setJoueur(null);
      setPret(true);
      return;
    }
    try {
      const r = await fetch(`${BOT}/api/jeux/moi`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        setJoueur(d.joueur || null);
        if (!d.joueur) ecrire("");
      }
    } catch {
      /* CycyBot injoignable : on réessaiera à la partie */
    }
    setPret(true);
  }, []);

  useEffect(() => {
    // Retour de Discord : #cycy-session=… ou #cycy-erreur=…
    const h = window.location.hash;
    if (h.startsWith("#cycy-session=")) {
      ecrire(decodeURIComponent(h.slice("#cycy-session=".length)));
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } else if (h.startsWith("#cycy-erreur=")) {
      setErreur(decodeURIComponent(h.slice("#cycy-erreur=".length)));
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    verifier();
    const maj = () => verifier();
    window.addEventListener(EVT, maj);
    return () => window.removeEventListener(EVT, maj);
  }, [verifier]);

  const deconnecter = useCallback(async () => {
    const session = sessionDiscord();
    ecrire("");
    setJoueur(null);
    if (session) fetch(`${BOT}/api/jeux/moi`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session, deconnexion: true }) }).catch(() => {});
  }, []);

  /** À appeler quand le bot répond « connexion requise » (session expirée). */
  const oublier = useCallback(() => {
    ecrire("");
    setJoueur(null);
  }, []);

  return { joueur, pret, erreur, deconnecter, oublier };
}

/** Bandeau « Connecté en tant que … » ou bouton de connexion. */
export function BandeauDiscord({ compte, texte }: { compte: ReturnType<typeof useCompteDiscord>; texte?: string }) {
  const { joueur, pret, erreur, deconnecter } = compte;
  if (!pret) return <div className="h-12" aria-hidden />;
  if (joueur) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-ink-soft">
        {joueur.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={joueur.avatar} alt="" width={24} height={24} className="w-6 h-6 rounded-full" />
        ) : null}
        <span>
          Connecté·e en tant que <strong className="text-ink">{joueur.name}</strong>
        </span>
        <button type="button" onClick={deconnecter} className="text-xs underline text-ink-soft/70 hover:text-ink">
          Changer de compte
        </button>
      </div>
    );
  }
  return <BoutonDiscord texte={texte} erreur={erreur} />;
}

export function BoutonDiscord({ texte, erreur }: { texte?: string; erreur?: string }) {
  return (
    <div className="text-center">
      <a
        href={lienConnexion()}
        className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-white transition-all hover:brightness-110 hover:shadow-glow"
        style={{ background: "#5865F2" }}
      >
        <Icone nom="bulle" className="w-5 h-5" />
        Se connecter avec Discord
      </a>
      <p className="text-xs text-ink-soft/70 mt-3 max-w-sm mx-auto">
        {texte || "Une partie par jour et par compte Discord : ta récompense arrive directement sur ton profil, sans code à copier."} CycyBot ne voit que ton pseudo
        et ton avatar.
      </p>
      {erreur && <p className="text-sm text-red-300 mt-3">{erreur}</p>}
    </div>
  );
}
