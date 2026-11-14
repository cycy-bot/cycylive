// ============================================================
// SAISON DE NOËL — dates des décorations du site
// ============================================================
// Du 1er au 25 décembre (heure de Paris), le site se pare de
// décorations : neige, guirlande lumineuse, étoiles et sucres
// d'orge. La machine Cosmo-Capsules, elle, suit ce que renvoie
// CycyBot (réglable dans l'admin « Figurines de Noël »).
// Aperçu avant l'heure : ajouter ?apercu-noel à l'adresse.

export const NOEL = { debut: "2026-12-01", fin: "2026-12-25" };

const JOUR = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });
export const jourParis = (t = Date.now()) => JOUR.format(new Date(t));
export const saisonNoel = (t = Date.now()) => { const j = jourParis(t); return j >= NOEL.debut && j <= NOEL.fin; };
