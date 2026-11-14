"use client";

// ============================================================
// SAISON EN COURS — décor du site et objets du compagnon
// ============================================================
// CycyBot tient le calendrier des saisons (admin → Saisons et
// événements) : Halloween, Noël, Nouvel An, Pâques… chaque année,
// de minuit le premier jour à 23 h 59 le dernier (heure de Paris).
// Le site lui demande la saison en cours (bot.cycylive.fr/api/saison)
// et la redemande toutes les 10 minutes (minuit pile, même sur une
// page restée ouverte). Sans réponse : les dates habituelles.
// Aperçu d'un décor : ?decor=halloween (ou ?decor=aucune pour arrêter).

import { useEffect, useState } from "react";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";

export type EtatSaison = {
  decor: string;
  compagnon: string;
  saison: { cle: string; nom: string; emoji: string; debut: string; fin: string } | null;
  apercu?: boolean;
};

const JOUR = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });
export const jourParis = (t = Date.now()) => JOUR.format(new Date(t));

// Secours si CycyBot ne répond pas : Halloween, Noël, Nouvel An aux dates habituelles
function local(): EtatSaison {
  const j = jourParis().slice(5);
  if (j === "10-31") return { decor: "halloween", compagnon: "citrouilles", saison: { cle: "halloween", nom: "Halloween", emoji: "🎃", debut: "", fin: "" } };
  if (j >= "12-01" && j <= "12-25") return { decor: "noel", compagnon: "sucres", saison: { cle: "noel", nom: "Noël", emoji: "🎄", debut: "", fin: "" } };
  if (j === "12-31" || j === "01-01") return { decor: "nouvelAn", compagnon: "confettis", saison: { cle: "nouvelAn", nom: "Nouvel An", emoji: "🎆", debut: "", fin: "" } };
  return { decor: "aucune", compagnon: "etoiles", saison: null };
}

function apercu(): string {
  try {
    const p = new URLSearchParams(location.search);
    if (p.has("decor")) { const d = p.get("decor") || "aucune"; if (d === "aucune" || d === "auto") sessionStorage.removeItem("apercu-decor"); else sessionStorage.setItem("apercu-decor", d); }
    if (p.has("apercu-noel")) sessionStorage.setItem("apercu-decor", "noel");
    return sessionStorage.getItem("apercu-decor") || "";
  } catch {
    return "";
  }
}

// Un seul appel pour toute la page, partagé entre les composants
let courant: EtatSaison | null = null;
let charge: Promise<void> | null = null;
let depuis = 0;
const abonnes = new Set<(e: EtatSaison) => void>();

async function charger() {
  try {
    const r = await fetch(`${BOT}/api/saison`, { cache: "no-store" });
    const d = await r.json();
    courant = { decor: d.decor || "aucune", compagnon: d.compagnon || "etoiles", saison: d.saison || null };
  } catch {
    courant = local();
  }
  depuis = Date.now();
  const a = apercu();
  if (a) courant = { ...courant, decor: a, apercu: true };
  abonnes.forEach((f) => f(courant!));
}

export function useSaison(): EtatSaison | null {
  const [e, setE] = useState<EtatSaison | null>(courant);
  useEffect(() => {
    abonnes.add(setE);
    if (!courant || Date.now() - depuis > 10 * 60e3) { if (!charge) charge = charger().finally(() => { charge = null; }); } else setE(courant);
    const t = setInterval(() => { if (!charge) charge = charger().finally(() => { charge = null; }); }, 10 * 60e3);
    return () => { abonnes.delete(setE); clearInterval(t); };
  }, []);
  return e;
}
