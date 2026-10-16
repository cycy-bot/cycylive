// ============================================================
// BANQUE D'ICÔNES CYCYLIVE — direction artistique « Orbite »
// ============================================================
// Toutes les icônes suivent les mêmes règles, pour un rendu uniforme :
//  • grille 24 × 24, marge de 2 px ;
//  • trait de 1,7 px, extrémités et angles arrondis ;
//  • une forme principale légèrement remplie (16 % d'opacité) ;
//  • un petit détail plein (point, étoile, éclat) : la signature Cycylive ;
//  • couleur héritée du texte (currentColor) : elles se teintent partout.
// Fichiers SVG prêts à l'emploi pour les autres supports : /public/icones.

import type { ReactNode } from "react";

const T = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const F = { ...T, fill: "currentColor", fillOpacity: 0.16 };
const P = { fill: "currentColor" };

// petit éclat à 4 branches (signature), centré en (x, y)
const eclat = (x: number, y: number, r = 2.2) => (
  <path {...P} d={`M${x} ${y - r}c.25 1.3.6 1.7 ${r * 0.9} ${r}c-1.3.25-1.7.6-${r * 0.9} ${r}c-.25-1.3-.6-1.7-${r * 0.9}-${r}c1.3-.25 1.7-.6 ${r * 0.9}-${r}Z`} />
);

export type DefIcone = { titre: string; famille: Famille; dessin: ReactNode };
export type Famille = "Live & stream" | "Communauté" | "Jeux" | "Galaxie" | "Récompenses" | "Navigation" | "Infos";

const I = (titre: string, famille: Famille, dessin: ReactNode): DefIcone => ({ titre, famille, dessin });

export const BANQUE = {
  // ── Live & stream ────────────────────────────────
  live: I("En direct", "Live & stream", <>
    <circle {...F} cx="12" cy="12" r="4" />
    <circle {...P} cx="12" cy="12" r="1.6" />
    <path {...T} d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4M3.5 3.5a12 12 0 0 0 0 17M20.5 3.5a12 12 0 0 1 0 17" opacity=".75" />
  </>),
  ecran: I("Écran / stream", "Live & stream", <>
    <rect {...F} x="2.5" y="4" width="19" height="13" rx="3" />
    <path {...T} d="M8.5 21h7M12 17v4" />
    <path {...P} d="M10.3 8.4v4.2l3.6-2.1-3.6-2.1Z" />
  </>),
  clap: I("Clip / vidéo", "Live & stream", <>
    <rect {...F} x="3" y="9" width="18" height="11" rx="2.5" />
    <path {...T} d="m3.6 9-.6-3 15.6-3 .6 3M8 4.3 9.6 8M13.3 3.3 15 7.5" />
    {eclat(16.5, 14.5, 2.4)}
  </>),
  camera: I("Caméra", "Live & stream", <>
    <rect {...F} x="2.5" y="6.5" width="13" height="11" rx="3" />
    <path {...T} d="m15.5 10.5 6-3v9l-6-3" />
    <circle {...P} cx="6.5" cy="10" r="1.3" />
  </>),
  micro: I("Micro / son", "Live & stream", <>
    <rect {...F} x="8.5" y="2.5" width="7" height="12" rx="3.5" />
    <path {...T} d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" />
    <circle {...P} cx="12" cy="7" r="1" />
  </>),
  son: I("Haut-parleur", "Live & stream", <>
    <path {...F} d="M3.5 9.5h3.5L12 5v14l-5-4.5H3.5z" />
    <path {...T} d="M15.5 9a4 4 0 0 1 0 6M18.3 6.5a7.5 7.5 0 0 1 0 11" />
  </>),
  muet: I("Son coupé", "Live & stream", <>
    <path {...F} d="M3.5 9.5h3.5L12 5v14l-5-4.5H3.5z" />
    <path {...T} d="m16 9.5 5 5M21 9.5l-5 5" />
  </>),
  antenne: I("Diffusion", "Live & stream", <>
    <path {...F} d="M12 13 7 21h10z" />
    <circle {...P} cx="12" cy="10" r="1.8" />
    <path {...T} d="M8.5 6.5a5 5 0 0 0 0 7M15.5 6.5a5 5 0 0 1 0 7M5.7 3.7a9 9 0 0 0 0 12.6M18.3 3.7a9 9 0 0 1 0 12.6" />
  </>),
  oeil: I("Viewers", "Live & stream", <>
    <path {...F} d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle {...T} cx="12" cy="12" r="3.2" />
    <circle {...P} cx="13" cy="11" r="1.1" />
  </>),
  chrono: I("Durée", "Live & stream", <>
    <circle {...F} cx="12" cy="13.5" r="8" />
    <path {...T} d="M12 9.5v4l2.6 1.8M9.5 2.5h5M12 2.5v3M19 6.5l1.4-1.4" />
  </>),
  horloge: I("Horaire", "Live & stream", <>
    <circle {...F} cx="12" cy="12" r="9" />
    <path {...T} d="M12 7v5l3.4 2.2" />
    <circle {...P} cx="12" cy="12" r="1.1" />
  </>),
  calendrier: I("Calendrier", "Live & stream", <>
    <rect {...F} x="3" y="4.5" width="18" height="16" rx="3" />
    <path {...T} d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    {eclat(12, 15, 2.6)}
  </>),
  ordinateur: I("Ordinateur", "Live & stream", <>
    <rect {...F} x="3" y="4" width="18" height="12" rx="2.5" />
    <path {...T} d="M2 20h20M9 16l-.7 4M15 16l.7 4" />
    <circle {...P} cx="12" cy="10" r="1.3" />
  </>),
  smartphone: I("Smartphone", "Live & stream", <>
    <rect {...F} x="6.5" y="2.5" width="11" height="19" rx="3" />
    <path {...T} d="M10.5 5.5h3" />
    <circle {...P} cx="12" cy="18" r="1.1" />
  </>),

  // ── Communauté ────────────────────────────────────
  coeur: I("Cœur / follow", "Communauté", <>
    <path {...F} d="M12 20.5s-8-4.7-8-10.7A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8 2.9c0 6-8 10.7-8 10.7Z" />
    {eclat(16.4, 9.8, 1.8)}
  </>),
  membres: I("Membres", "Communauté", <>
    <circle {...F} cx="9" cy="8.5" r="3.6" />
    <path {...T} d="M2.5 20c.6-3.5 3.3-5.7 6.5-5.7s5.9 2.2 6.5 5.7" />
    <circle {...T} cx="17" cy="9.3" r="2.6" opacity=".75" />
    <path {...T} d="M17.6 14.2c2.2.3 3.6 2 3.9 4.8" opacity=".75" />
  </>),
  bulle: I("Discussion", "Communauté", <>
    <path {...F} d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17.5h-9l-5 4v-4H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5Z" />
    <circle {...P} cx="8" cy="11.5" r="1.1" /><circle {...P} cx="12" cy="11.5" r="1.1" /><circle {...P} cx="16" cy="11.5" r="1.1" />
  </>),
  megaphone: I("Annonce", "Communauté", <>
    <path {...F} d="M3 10v4a1.5 1.5 0 0 0 1.5 1.5H7l9 5V3.5l-9 5H4.5A1.5 1.5 0 0 0 3 10Z" />
    <path {...T} d="M7 15.5 8.5 21M19.5 9.5a3 3 0 0 1 0 5" />
  </>),
  poignee: I("Partenariat", "Communauté", <>
    <circle {...F} cx="8.5" cy="12" r="6" />
    <circle {...T} cx="15.5" cy="12" r="6" />
    {eclat(12, 12, 2.4)}
  </>),
  mainLevee: I("Je participe", "Communauté", <>
    <path {...F} d="M7 13V6.5a1.5 1.5 0 0 1 3 0V11V4.5a1.5 1.5 0 0 1 3 0V11V5.5a1.5 1.5 0 0 1 3 0V13l1-2a1.6 1.6 0 0 1 2.8 1.5L17 19a4 4 0 0 1-3.6 2.5h-2.6A4.8 4.8 0 0 1 6 16.7Z" />
    {eclat(4, 5, 1.8)}
  </>),
  enveloppe: I("Contact", "Communauté", <>
    <rect {...F} x="2.5" y="5" width="19" height="14" rx="3" />
    <path {...T} d="m3.5 7 8.5 6 8.5-6" />
  </>),
  lien: I("Lien", "Communauté", <>
    <path {...T} d="M10 14a4 4 0 0 0 5.7 0l3.5-3.5a4 4 0 0 0-5.7-5.7l-1 1" />
    <path {...F} d="M14 10a4 4 0 0 0-5.7 0l-3.5 3.5a4 4 0 0 0 5.7 5.7l1-1" />
  </>),
  externe: I("Ouvrir ailleurs", "Navigation", <>
    <rect {...F} x="3" y="6" width="15" height="15" rx="3" />
    <path {...T} d="M13 3h8v8M21 3l-9.5 9.5" />
  </>),
  bouclier: I("Modération", "Communauté", <>
    <path {...F} d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z" />
    <path {...T} d="m8.5 12 2.5 2.5 4.5-5" />
  </>),
  badge: I("Passeport", "Communauté", <>
    <rect {...F} x="2.5" y="4.5" width="19" height="15" rx="3" />
    <circle {...T} cx="8.5" cy="11" r="2.4" />
    <path {...T} d="M5 16.5c.6-1.6 2-2.4 3.5-2.4s2.9.8 3.5 2.4M14.5 9.5h4.5M14.5 13h3" />
  </>),
  robot: I("Cycy_Bot", "Communauté", <>
    <rect {...F} x="3.5" y="7" width="17" height="13" rx="5" />
    <path {...T} d="M12 7V3.8" />
    <circle {...P} cx="12" cy="3" r="1.3" />
    <circle {...P} cx="9" cy="13.3" r="1.5" /><circle {...P} cx="15" cy="13.3" r="1.5" />
    <path {...T} d="M1.5 12v3M22.5 12v3" />
  </>),
  globe: I("Monde", "Communauté", <>
    <circle {...F} cx="12" cy="12" r="9.2" />
    <path {...T} d="M2.8 12h18.4M12 2.8c2.6 2.6 3.8 5.7 3.8 9.2s-1.2 6.6-3.8 9.2c-2.6-2.6-3.8-5.7-3.8-9.2S9.4 5.4 12 2.8Z" />
  </>),
  drapeauFr: I("France", "Communauté", <>
    <path {...T} d="M4.5 21.5V3" />
    <path {...F} d="M4.5 4h15l-2.5 4.5 2.5 4.5h-15" />
    <path {...P} d="M4.5 4h5v9h-5z" opacity=".9" />
  </>),

  // ── Jeux ──────────────────────────────────────────
  manette: I("Jeux", "Jeux", <>
    <path {...F} d="M7 7h10a5 5 0 0 1 4.7 6.7l-1 2.8a2.3 2.3 0 0 1-3.9.7L15 15H9l-1.8 2.2a2.3 2.3 0 0 1-3.9-.7l-1-2.8A5 5 0 0 1 7 7Z" />
    <path {...T} d="M8 9.8v3.4M6.3 11.5h3.4" />
    <circle {...P} cx="15.5" cy="10.5" r="1.1" /><circle {...P} cx="17.5" cy="12.6" r="1.1" />
  </>),
  joystick: I("Arcade", "Jeux", <>
    <path {...F} d="M3 15.5h18v3.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path {...T} d="M12 15.5V9" />
    <circle {...F} cx="12" cy="6" r="3.3" />
    <circle {...P} cx="17.5" cy="13.5" r="1.3" />
  </>),
  cible: I("Valorant / objectif", "Jeux", <>
    <circle {...F} cx="12" cy="12" r="9" />
    <circle {...T} cx="12" cy="12" r="5" />
    <circle {...P} cx="12" cy="12" r="1.8" />
    <path {...T} d="M12 1.5V5M12 19v3.5M1.5 12H5M19 12h3.5" />
  </>),
  viseur: I("Viseur", "Jeux", <>
    <circle {...F} cx="12" cy="12" r="6.5" />
    <path {...T} d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5" />
    <circle {...P} cx="12" cy="12" r="1.3" />
  </>),
  tactique: I("FPS tactique (Valorant)", "Jeux", <>
    <path {...F} d="M12 2.5 20 6.8v6.1c0 4.1-3.4 7.4-8 8.6-4.6-1.2-8-4.5-8-8.6V6.8l8-4.3Z" />
    <path {...T} d="M12 6.9v2M12 15.1v2M6.9 12h2M15.1 12h2" /><circle cx="12" cy="12" r="3.1" {...T} />
    <path {...P} d="m12 11 1 1-1 1-1-1 1-1Z" />
  </>),
  fantome: I("Horreur / fantôme", "Jeux", <>
    <path {...F} d="M5 20.5V11a7 7 0 0 1 14 0v9.5l-2.3-1.6-2.4 1.6-2.3-1.6-2.3 1.6-2.4-1.6Z" />
    <circle {...P} cx="9.6" cy="11" r="1.2" /><circle {...P} cx="14.4" cy="11" r="1.2" />
    <path {...T} d="M10.8 14.6q1.2.9 2.4 0" />
    {eclat(20.3, 3.8, 1.8)}
  </>),
  monstre: I("Créature / monstre", "Jeux", <>
    <path {...T} d="M7.4 8.6 5.6 3.4l4.5 3M16.6 8.6l1.8-5.2-4.5 3" />
    <circle {...F} cx="12" cy="13.6" r="7.2" />
    <circle {...P} cx="9.4" cy="12.6" r="1.2" /><circle {...P} cx="14.6" cy="12.6" r="1.2" />
    <path {...T} d="M10.4 16.2q1.6 1.2 3.2 0" />
  </>),
  epee: I("Aventure / RPG", "Jeux", <>
    <path {...F} d="M20.5 3.5v4.2l-9.9 9.9-4.2-4.2 9.9-9.9Z" />
    <path {...T} d="m4.6 12.6 6.8 6.8M7.6 16.4l-3.9 3.9" />
    <circle {...P} cx="3.3" cy="20.7" r="1.1" />
  </>),
  cube: I("Sandbox / construction", "Jeux", <>
    <path {...F} d="M12 2.8 20 7.3v9.4l-8 4.5-8-4.5V7.3Z" />
    <path {...T} d="m4 7.3 8 4.5 8-4.5M12 11.8v9.4" />
    <path {...P} d="m12 5.2 3.6 2-3.6 2-3.6-2 3.6-2Z" opacity=".55" />
  </>),
  volant: I("Course / volant", "Jeux", <>
    <circle {...F} cx="12" cy="12" r="9" />
    <circle {...T} cx="12" cy="12" r="2.8" />
    <path {...T} d="M12 14.8V21M9.4 11 3.4 9.6M14.6 11l6-1.4" />
    <circle {...P} cx="12" cy="12" r="1" />
  </>),
  course: I("Runner", "Jeux", <>
    <circle {...P} cx="15.5" cy="4.3" r="2.1" />
    <path {...T} d="M8 21l3.2-5.2 3.3 2.3V22M11.2 15.8 13 9l4 3.2 3 .4M13 9l-4.2.6-2.1 3.1" />
    <path {...T} d="M2 9.5h3.5M1.5 14h3M3 18.5h3" opacity=".6" />
  </>),
  drapeau: I("Arrivée", "Jeux", <>
    <path {...T} d="M5 21.5V3" />
    <path {...F} d="M5 4h14.5l-2.5 4.5 2.5 4.5H5" />
    <path {...P} d="M9 4h3.5v4.5H9zM12.5 8.5H16V13h-3.5zM5 8.5h4V13H5z" opacity=".55" />
  </>),
  quiz: I("Quiz", "Jeux", <>
    <circle {...F} cx="12" cy="12" r="9.2" />
    <path {...T} d="M9.3 9.3A2.8 2.8 0 1 1 13 12c-.7.4-1 .9-1 1.7v.4" />
    <circle {...P} cx="12" cy="17.2" r="1.2" />
  </>),
  cerveau: I("Mémoire", "Jeux", <>
    <path {...F} d="M9 3.5a3 3 0 0 0-3 3 3 3 0 0 0-2.5 4.4A3.3 3.3 0 0 0 5 16.5a3 3 0 0 0 4 3.8V3.5Zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2.5 4.4 3.3 3.3 0 0 1-1.5 5.6 3 3 0 0 1-4 3.8V3.5Z" />
    <path {...T} d="M12 3.5v17M9 9H7.5M15 9h1.5M9 14H7M15 14h2" />
  </>),
  note: I("Musique / rythme", "Jeux", <>
    <path {...T} d="M9 18V5.5l11-2V16" />
    <circle {...F} cx="6.5" cy="18" r="2.8" />
    <circle {...F} cx="17.5" cy="16" r="2.8" />
    {eclat(14.5, 8.5, 1.8)}
  </>),
  constellation: I("Constellations", "Jeux", <>
    <path {...T} d="m4 17 5-6 4.5 2.5L20 5" opacity=".7" />
    <circle {...F} cx="4" cy="17" r="1.9" /><circle {...F} cx="9" cy="11" r="1.9" /><circle {...F} cx="13.5" cy="13.5" r="1.9" />
    {eclat(20, 5, 2.6)}
    <circle {...P} cx="17" cy="19" r="1" />
  </>),
  puzzle: I("Puzzle / fragment", "Jeux", <>
    <path {...F} d="M4 8.5h3.2a2.3 2.3 0 1 1 4.6 0H15v3.2a2.3 2.3 0 1 1 0 4.6V20H4v-3.7a2.3 2.3 0 1 0 0-4.6Z" />
    {eclat(19.5, 5, 2)}
  </>),
  cartes: I("Cartes Astrales", "Jeux", <>
    <rect {...T} x="3" y="5.5" width="11" height="15.5" rx="2.2" transform="rotate(-10 8.5 13)" opacity=".7" />
    <rect {...F} x="9" y="3" width="11.5" height="16" rx="2.2" />
    {eclat(14.75, 11, 3)}
  </>),
  ticket: I("Ticket à gratter", "Jeux", <>
    <path {...F} d="M3 6.5h18v3.2a2.3 2.3 0 0 0 0 4.6v3.2H3v-3.2a2.3 2.3 0 0 0 0-4.6Z" />
    <path {...T} d="M15.5 6.5v11" strokeDasharray="1.5 2" />
    {eclat(9, 12, 2.8)}
  </>),
  oeuf: I("Compagnon", "Jeux", <>
    <path {...F} d="M12 2.8c3.7 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3.3-11 7-11Z" />
    <path {...T} d="m6.2 12.5 2.6 1.6 2.2-2 2.2 2 2.2-2 2.4 1.5" />
    <circle {...P} cx="14.5" cy="7.5" r="1" />
  </>),
  slot: I("Relance / chance", "Jeux", <>
    <rect {...F} x="2.5" y="5" width="16" height="14" rx="3" />
    <path {...T} d="M7.8 9v6M13.2 9v6M18.5 8.5h1.5a1.5 1.5 0 0 1 1.5 1.5v2" />
    <circle {...P} cx="21.5" cy="13.5" r="1.3" />
    <path {...P} d="M4.5 12h1.6M9.9 12h1.6M15.2 12h1.6" />
  </>),
  bonbon: I("Bonbon cosmique", "Jeux", <>
    <circle {...F} cx="12" cy="12" r="5" />
    <path {...T} d="m7.5 9.5-4-2-1 4 3.5 1M16.5 14.5l4 2 1-4-3.5-1" />
    <path {...T} d="M9.5 9.5c1 2 3.5 3 5 5" opacity=".7" />
    {eclat(12, 12, 1.6)}
  </>),
  repas: I("Repas", "Jeux", <>
    <path {...F} d="M3 12h18a9 9 0 0 1-18 0Z" />
    <path {...T} d="M2 12h20M9 8.5c0-1.5 1.5-1.5 1.5-3S9 4 9 2.5M14 8.5c0-1.5 1.5-1.5 1.5-3S14 4 14 2.5" />
  </>),
  bain: I("Bain / propreté", "Jeux", <>
    <path {...F} d="M3 12h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6Z" />
    <path {...T} d="M6 12V5.5a2 2 0 0 1 3.8-.9M7 20l-1 2M17 20l1 2" />
    <circle {...T} cx="14" cy="7.5" r="1.6" /><circle {...P} cx="17.5" cy="4.5" r="1.1" /><circle {...T} cx="18" cy="9" r="1" />
  </>),
  soleil: I("Soleil / réveil", "Galaxie", <>
    <circle {...F} cx="12" cy="12" r="4.5" />
    <path {...T} d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  </>),
  pousse: I("Croissance", "Jeux", <>
    <path {...T} d="M12 21.5V11" />
    <path {...F} d="M12 13c0-4.5-3-7-8-7 0 4.5 3 7 8 7ZM12 11c0-4 2.6-6.5 7.5-6.5 0 4-2.6 6.5-7.5 6.5Z" />
    <path {...T} d="M7 21.5h10" />
  </>),
  rejouer: I("Rejouer", "Jeux", <>
    <path {...T} d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" />
    <path {...T} d="M3.5 3.5v5h5" />
    <path {...P} d="M10.3 9v6l5-3-5-3Z" />
  </>),
  eclair: I("Énergie", "Jeux", <>
    <path {...F} d="M13.5 2.5 4.5 13.5H11l-1 8 9-11h-6.5z" />
  </>),
  flamme: I("Série", "Jeux", <>
    <path {...F} d="M12 21.5c4 0 7-2.8 7-6.8 0-4.4-3.2-7-4.5-10.2-.5 2.7-2 4-3.4 4.6.3-2.3-.4-4.6-2.6-6.6C8.8 6 5 9.7 5 14.7c0 4 3 6.8 7 6.8Z" />
    <path {...P} d="M12 21.5c-1.9 0-3.2-1.3-3.2-3.1 0-2 1.6-3 2.2-4.8 1.6 1.2 4.2 2.6 4.2 4.8 0 1.8-1.3 3.1-3.2 3.1Z" opacity=".75" />
  </>),

  // ── Galaxie ───────────────────────────────────────
  etoile: I("Étoile", "Galaxie", <>
    <path {...F} d="m12 2.8 2.7 5.8 6.3.8-4.6 4.3 1.2 6.3L12 17l-5.6 3 1.2-6.3L3 9.4l6.3-.8Z" />
    <circle {...P} cx="12" cy="12" r="1.2" />
  </>),
  eclats: I("Éclats Stellaires", "Galaxie", <>
    <path {...F} d="M12 2c.4 4.4 1.6 7.6 6 8-4.4.4-5.6 3.6-6 8-.4-4.4-1.6-7.6-6-8 4.4-.4 5.6-3.6 6-8Z" />
    {eclat(19, 18, 2.3)}
    {eclat(5, 19, 1.6)}
  </>),
  fusee: I("Fusée / lancement", "Galaxie", <>
    <path {...F} d="M14.5 3.5c3-1 5.5-1 6-1 0 .5 0 3-1 6l-6.8 6.8-5-5Z" />
    <circle {...P} cx="16" cy="8" r="1.6" />
    <path {...T} d="M7.7 10.3 4 10l-1.5 2.5 4.6 1.3M13.7 16.3l.3 3.7-2.5 1.5-1.3-4.6M5.5 18.5c-.8.8-1 3-1 3s2.2-.2 3-1" />
  </>),
  planete: I("Planète", "Galaxie", <>
    <circle {...F} cx="12" cy="12" r="6.3" />
    <ellipse {...T} cx="12" cy="12" rx="10.5" ry="3.4" transform="rotate(-22 12 12)" />
    {eclat(19.5, 4.5, 1.9)}
  </>),
  lune: I("Lune / repos", "Galaxie", <>
    <path {...F} d="M20.5 14.6A8.8 8.8 0 0 1 9.4 3.5a8.8 8.8 0 1 0 11.1 11.1Z" />
    {eclat(17, 5, 2.2)}
    <circle {...P} cx="21" cy="9" r="1" />
  </>),
  dodo: I("Repos / OFF", "Galaxie", <>
    <path {...F} d="M17.8 15.6A7.6 7.6 0 0 1 8.4 6.2a7.6 7.6 0 1 0 9.4 9.4Z" />
    <path {...T} d="M14.5 3h4l-4 4.2h4M18.6 9.2h2.9l-2.9 3h2.9" />
  </>),
  soucoupe: I("Discord / soucoupe", "Galaxie", <>
    <path {...F} d="M7.5 11a4.5 4.5 0 0 1 9 0" />
    <ellipse {...F} cx="12" cy="13" rx="10" ry="3.8" />
    <circle {...P} cx="7" cy="13.3" r="1" /><circle {...P} cx="12" cy="14" r="1" /><circle {...P} cx="17" cy="13.3" r="1" />
    <path {...T} d="m8 18.5-1.5 3M16 18.5l1.5 3" opacity=".7" />
  </>),
  satellite: I("Expédition", "Galaxie", <>
    <rect {...F} x="9" y="9" width="6" height="6" rx="1.5" />
    <rect {...T} x="1.8" y="10" width="5.2" height="4" rx=".8" />
    <rect {...T} x="17" y="10" width="5.2" height="4" rx=".8" />
    <path {...T} d="M7 12h2M15 12h2M12 9V6.4" />
    <circle {...P} cx="12" cy="5" r="1.4" />
    <path {...T} d="M9.5 18.5a3.5 3.5 0 0 0 5 0M8 21a6 6 0 0 0 8 0" opacity=".6" />
  </>),
  galaxie: I("Galaxie / anomalie", "Galaxie", <>
    <ellipse {...F} cx="12" cy="12" rx="9.5" ry="4.6" transform="rotate(-28 12 12)" />
    <path {...T} d="M5.5 10c1.6-4.2 8.6-5.6 12-1.6M18.5 14c-1.6 4.2-8.6 5.6-12 1.6" />
    <circle {...P} cx="12" cy="12" r="1.9" />
  </>),
  comete: I("Comète", "Galaxie", <>
    <circle {...F} cx="16" cy="8" r="4.2" />
    <path {...T} d="M12.8 11.2 3 21M14.5 12.3 8 19M11.7 9.5 5.2 16" />
    <circle {...P} cx="17" cy="7" r="1.2" />
  </>),
  boule: I("Prédictions", "Galaxie", <>
    <circle {...F} cx="12" cy="10.5" r="7.5" />
    <path {...T} d="M7 20.5h10M8.5 17.5l-1 3M15.5 17.5l1 3" />
    {eclat(13.5, 8.5, 2.6)}
  </>),
  lunettes: I("Marché noir", "Galaxie", <>
    <path {...F} d="M2.5 10h8l-.7 4.3a2.8 2.8 0 0 1-2.8 2.4H5.8a2.8 2.8 0 0 1-2.8-2.4ZM13.5 10h8l-.5 4.3a2.8 2.8 0 0 1-2.8 2.4h-1.2a2.8 2.8 0 0 1-2.8-2.4Z" />
    <path {...T} d="M10.5 11.2c1-.6 2-.6 3 0M2.5 10 4 6.5M21.5 10 20 6.5" />
  </>),
  livre: I("Chronique", "Galaxie", <>
    <path {...F} d="M12 6.5C10 5 7 4.5 3 5v14c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5Z" />
    <path {...T} d="M12 6.5v14" />
    {eclat(17, 10.5, 2)}
  </>),

  // ── Récompenses ──────────────────────────────────
  trophee: I("Trophée", "Récompenses", <>
    <path {...F} d="M7 3.5h10v6a5 5 0 0 1-10 0z" />
    <path {...T} d="M7 5.5H4.3a2.7 2.7 0 0 0 2.9 4.4M17 5.5h2.7a2.7 2.7 0 0 1-2.9 4.4M12 14.5V17M8 21h8M9 17h6v4H9z" />
    {eclat(12, 8.5, 2)}
  </>),
  medaille: I("Médaille", "Récompenses", <>
    <path {...T} d="m8 2.5 2.5 6M16 2.5l-2.5 6" />
    <circle {...F} cx="12" cy="15" r="6.5" />
    {eclat(12, 15, 2.8)}
  </>),
  couronne: I("Couronne / premium", "Récompenses", <>
    <path {...F} d="m3 7.5 4.5 4L12 4.5l4.5 7 4.5-4-2 11H5Z" />
    <path {...T} d="M5 21h14" />
    <circle {...P} cx="12" cy="14.5" r="1.4" />
  </>),
  cadeau: I("Cadeau", "Récompenses", <>
    <rect {...F} x="3.5" y="9" width="17" height="12" rx="2" />
    <path {...T} d="M2.5 9h19M12 9v12M12 9c-1.5-3.5-5.7-4.2-5.7-1.8C6.3 8.8 9.6 9 12 9Zm0 0c1.5-3.5 5.7-4.2 5.7-1.8 0 1.6-3.3 1.8-5.7 1.8Z" />
  </>),
  diamant: I("Bits / gemme", "Récompenses", <>
    <path {...F} d="M6.5 3.5h11l4 5.5-9.5 12L2.5 9Z" />
    <path {...T} d="M2.5 9h19M9 3.5 7.5 9l4.5 12 4.5-12L15 3.5" opacity=".75" />
  </>),
  etiquette: I("Code promo", "Récompenses", <>
    <path {...F} d="M3 12.6V4.5A1.5 1.5 0 0 1 4.5 3h8.1a1.5 1.5 0 0 1 1 .4l7 7a1.5 1.5 0 0 1 0 2.2l-8 8a1.5 1.5 0 0 1-2.2 0l-7-7a1.5 1.5 0 0 1-.4-1Z" />
    <circle {...P} cx="8" cy="8" r="1.7" />
  </>),
  don: I("Don", "Récompenses", <>
    <path {...F} d="M12 14s-5-2.8-5-6.5A2.8 2.8 0 0 1 12 5.7a2.8 2.8 0 0 1 5 1.8C17 11.2 12 14 12 14Z" />
    <path {...T} d="M2.5 16.5h3.5l3.5 2.5h5a1.5 1.5 0 0 0 0-3h-3M14.5 16h4.3l2.7-2.2M2.5 21.5h17" />
  </>),
  mallette: I("Collaborer", "Récompenses", <>
    <rect {...F} x="2.5" y="7" width="19" height="13" rx="2.5" />
    <path {...T} d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2M2.5 12.5h19" />
    <circle {...P} cx="12" cy="12.5" r="1.4" />
  </>),
  colis: I("Objet mystère", "Récompenses", <>
    <path {...F} d="m12 2.5 9 4.5v10l-9 4.5-9-4.5V7Z" />
    <path {...T} d="m3 7 9 4.5L21 7M12 11.5v10M7.5 4.8l9 4.5" />
  </>),
  cadenas: I("Verrouillé", "Récompenses", <>
    <rect {...F} x="4" y="10" width="16" height="11.5" rx="3" />
    <path {...T} d="M8 10V7a4 4 0 0 1 8 0v3" />
    <circle {...P} cx="12" cy="15.5" r="1.6" />
  </>),
  boost: I("Progression", "Récompenses", <>
    <path {...T} d="M3 21h18M4 17l5-5 3.5 3L20 7" />
    <path {...T} d="M14.5 7H20v5.5" />
    {eclat(6, 6, 2.2)}
  </>),
  graphique: I("Statistiques", "Infos", <>
    <rect {...F} x="3" y="3" width="18" height="18" rx="3" />
    <path {...T} d="M7.5 16.5V12M12 16.5V8M16.5 16.5v-6" />
  </>),

  // ── Infos & navigation ───────────────────────────
  info: I("Information", "Infos", <>
    <circle {...F} cx="12" cy="12" r="9.2" />
    <path {...T} d="M12 11v6" />
    <circle {...P} cx="12" cy="7.6" r="1.2" />
  </>),
  alerte: I("Attention", "Infos", <>
    <path {...F} d="M10.3 3.8a2 2 0 0 1 3.4 0l8 14A2 2 0 0 1 20 20.8H4a2 2 0 0 1-1.7-3Z" />
    <path {...T} d="M12 9v5" />
    <circle {...P} cx="12" cy="17.2" r="1.1" />
  </>),
  valide: I("Validé", "Infos", <>
    <circle {...F} cx="12" cy="12" r="9.2" />
    <path {...T} d="m7.8 12.3 2.8 2.8 5.6-6" />
  </>),
  erreur: I("Raté", "Infos", <>
    <circle {...F} cx="12" cy="12" r="9.2" />
    <path {...T} d="m9 9 6 6M15 9l-6 6" />
  </>),
  document: I("Document", "Infos", <>
    <path {...F} d="M6 2.5h8l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4A1.5 1.5 0 0 1 6 2.5Z" />
    <path {...T} d="M14 2.5V7.5h5M8.5 12.5h7M8.5 16h5" />
  </>),
  liste: I("Liste", "Infos", <>
    <rect {...F} x="4" y="3.5" width="16" height="18" rx="2.5" />
    <path {...T} d="M9 2.5h6v3H9zM8 10.5h.1M11 10.5h5M8 14.5h.1M11 14.5h5M8 18h.1M11 18h3" />
  </>),
  journal: I("Actualités", "Infos", <>
    <path {...F} d="M3 4.5h14v14a2 2 0 0 0 2 2H5a2 2 0 0 1-2-2Z" />
    <path {...T} d="M17 8.5h3.5v10a2 2 0 0 1-4 0M6.5 8h7M6.5 11.5h7M6.5 15h4" />
  </>),
  carte: I("Carte / maps", "Infos", <>
    <path {...F} d="m3 6 6-2.5 6 2.5 6-2.5v14.5L15 20.5 9 18l-6 2.5Z" />
    <path {...T} d="M9 3.5V18M15 6v14.5" opacity=".7" />
    <circle {...P} cx="12" cy="10.5" r="1.3" />
  </>),
  lieu: I("Lieu", "Infos", <>
    <path {...F} d="M12 21.5s-7-6.3-7-11.5a7 7 0 0 1 14 0c0 5.2-7 11.5-7 11.5Z" />
    {eclat(12, 10, 2.6)}
  </>),
  epingle: I("Épinglé", "Infos", <>
    <path {...F} d="M9 3h6l-1 6 3.5 3.5v2h-11v-2L10 9Z" />
    <path {...T} d="M12 14.5v7" />
  </>),
  clavier: I("Commandes", "Infos", <>
    <rect {...F} x="2" y="6" width="20" height="12" rx="2.5" />
    <path {...T} d="M8 14.5h8" />
    <path {...P} d="M5.2 9h1.6v1.6H5.2zM8.7 9h1.6v1.6H8.7zM12.2 9h1.6v1.6h-1.6zM15.7 9h1.6v1.6h-1.6zM5.2 13.7h1.6v1.6H5.2zM17.2 13.7h1.6v1.6h-1.6z" />
  </>),
  outils: I("Projet / outils", "Infos", <>
    <path {...F} d="M14.7 3.3a5 5 0 0 0-5.4 6.6L3.5 15.7a2 2 0 0 0 2.8 2.8l5.8-5.8a5 5 0 0 0 6.6-5.4l-3 3-2.8-.7-.7-2.8Z" />
    <circle {...P} cx="5" cy="17" r="1" />
  </>),
  fete: I("Événement", "Infos", <>
    <path {...F} d="M3 21 8 7l9 9Z" />
    <path {...T} d="M8 7c3-3 3.5-4.5 2.5-5M17 16c3-3 4.5-3.5 5-2.5M13.5 4.5c.6 1.2.3 2.5-.7 3.5M19.5 10.5c-1.2-.6-2.5-.3-3.5.7" />
    {eclat(19, 4, 2)}
  </>),
  sablier: I("En attente", "Infos", <>
    <path {...F} d="M6.5 2.5h11c0 5-5.5 6-5.5 9.5s5.5 4.5 5.5 9.5h-11c0-5 5.5-6 5.5-9.5S6.5 7.5 6.5 2.5Z" />
    <path {...T} d="M5 2.5h14M5 21.5h14" />
  </>),
  maison: I("Accueil", "Navigation", <>
    <path {...F} d="M3.5 10.5 12 3.5l8.5 7V20a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 20Z" />
    <path {...T} d="M9.5 21.5V15h5v6.5" />
  </>),
  fleche: I("Suivant", "Navigation", <>
    <path {...T} d="M4.5 12h15M13.5 6l6 6-6 6" />
  </>),
  lecture: I("Jouer", "Navigation", <>
    <circle {...F} cx="12" cy="12" r="9.2" />
    <path {...P} d="M10 8.3v7.4l6.2-3.7Z" />
  </>),
  plus: I("Ajouter", "Navigation", <>
    <circle {...F} cx="12" cy="12" r="9.2" />
    <path {...T} d="M12 8v8M8 12h8" />
  </>),
} satisfies Record<string, DefIcone>;

export type NomIcone = keyof typeof BANQUE;
export const NOMS_ICONES = Object.keys(BANQUE) as NomIcone[];
