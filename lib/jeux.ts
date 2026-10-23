// Catalogue des jeux du site (vitrine /jeux, barre de changement de jeu, menu).
// Deux familles :
//  • la salle d'arcade : des jeux à records, chacun avec son tableau des scores ;
//  • les récompenses du jour : liées au Discord (un ticket, des quêtes par jour).

import type { JeuArcade } from "@/lib/arcadeRegles";
import type { NomIcone } from "@/components/icones/banque";

export type FamilleJeu = "arcade" | "quotidien";

export type FicheJeu = {
  id: JeuArcade | "gratter" | "compagnon" | "coffres" | "grappin" | "capsules";
  famille: FamilleJeu;
  href: string;
  nom: string;
  emoji: string;
  /** Icône de la banque Cycylive (remplace l'emoji à l'affichage). */
  icone: NomIcone;
  /** Une ligne, sur la carte de la vitrine. */
  accroche: string;
  /** Deux ou trois phrases, sous le titre de la page du jeu. */
  description: string;
  duree: string;
  controles: string;
  /** Couleurs de la carte (dégradé de la miniature et liseré). */
  teinte: { de: string; a: string; accent: string };
  /** Petites étiquettes (« Nouveau », « Récompense Discord »…). */
  badge?: string;
};

export const JEUX: FicheJeu[] = [
  {
    id: "runner",
    icone: "course",
    famille: "arcade",
    href: "/jeux/runner",
    nom: "Cycy Runner",
    emoji: "🏃",
    accroche: "Saute les astéroïdes, esquive les comètes : jusqu'où iras-tu ?",
    description: "Fais courir CycyBot sur sa planète. La course s'accélère sans arrêt : saute les astéroïdes, baisse-toi sous les comètes et va le plus loin possible.",
    duree: "Sans fin",
    controles: "Espace / ↑ ↓ · tactile",
    teinte: { de: "#3b1d7a", a: "#120b2a", accent: "#b57cff" },
    badge: "Le classique",
  },
  {
    id: "reflexes",
    icone: "cible",
    famille: "arcade",
    href: "/jeux/arcade/reflexes",
    nom: "Réflexes Valorant",
    emoji: "🎯",
    accroche: "30 secondes pour toucher un maximum de cibles.",
    description: "Les cibles apparaissent, rétrécissent et accélèrent. Plus tu tires vite, plus ça rapporte, mais chaque tir dans le vide coûte 25 points : vise juste !",
    duree: "30 s",
    controles: "Souris · tactile",
    teinte: { de: "#7a1d3a", a: "#1a0b18", accent: "#ff5577" },
  },
  {
    id: "astrododge",
    icone: "fusee",
    famille: "arcade",
    href: "/jeux/arcade/astrododge",
    nom: "Astro Dodge",
    emoji: "🚀",
    accroche: "Pilote, tire et esquive : astéroïdes et soucoupes extraterrestres en approche !",
    description: "Ton vaisseau tire tout seul : détruis les astéroïdes et les soucoupes extraterrestres, esquive leurs tirs et tiens le plus longtemps possible. Tes missiles s'améliorent au fil de la partie, et les bonus d'armes (laser, rafale, éventail, tête chercheuse) changent tout pendant 8 secondes.",
    duree: "Sans fin",
    controles: "Souris · ← → ↑ ↓ · tactile",
    teinte: { de: "#7a2a1d", a: "#160b14", accent: "#ff9d5c" },
    badge: "Nouveau",
  },
  {
    id: "starcatcher",
    icone: "etoile",
    famille: "arcade",
    href: "/jeux/arcade/starcatcher",
    nom: "Star Catcher",
    emoji: "⭐",
    accroche: "Attrape les étoiles, évite les météorites et les trous noirs.",
    description: "Des étoiles tombent du ciel : attrape-les avec ton filet cosmique et enchaîne pour monter le combo jusqu'à ×5. Les étoiles dorées valent triple, mais gare aux météorites et aux trous noirs : trois vies, pas une de plus.",
    duree: "Jusqu'à 3 vies perdues",
    controles: "Souris · ← → · tactile",
    teinte: { de: "#6a5a12", a: "#14110a", accent: "#ffe066" },
    badge: "Nouveau",
  },
  {
    id: "cycyword",
    icone: "lettres",
    famille: "arcade",
    href: "/jeux/arcade/cycyword",
    nom: "CycyWord",
    emoji: "🔤",
    accroche: "Un mot mystère par jour, six essais pour le trouver.",
    description: "Devine le mot mystère de 5 lettres en six essais. Après chaque essai, les lettres se colorent : violet, bien placée ; jaune, dans le mot mais ailleurs ; gris, absente. Un nouveau mot chaque jour, et tes statistiques de réussite.",
    duree: "1 mot / jour",
    controles: "Clavier · tactile",
    teinte: { de: "#1d5a7a", a: "#0a1420", accent: "#7ad7ff" },
    badge: "Nouveau",
  },
  {
    id: "rythme",
    icone: "note",
    famille: "arcade",
    href: "/jeux/arcade/rythme",
    nom: "Rythme cosmique",
    emoji: "🎵",
    accroche: "Tape les notes en rythme sur la musique.",
    description: "Les notes descendent sur quatre pistes : tape-les pile quand elles passent sur les cercles. Enchaîne sans rater pour multiplier tes points jusqu'à ×4. Monte le son !",
    duree: "1 min",
    controles: "D F J K · tactile",
    teinte: { de: "#1d4a7a", a: "#0b1224", accent: "#5fd4ff" },
  },
  {
    id: "constellations",
    icone: "constellation",
    famille: "arcade",
    href: "/jeux/arcade/constellations",
    nom: "Puzzle des constellations",
    emoji: "✨",
    accroche: "Mémorise la constellation, puis retrace-la.",
    description: "Une constellation s'affiche quelques secondes puis s'efface. Retrace-la étoile par étoile, dans l'ordre, sans tomber dans les étoiles pièges. Trois vies.",
    duree: "Jusqu'à 3 erreurs",
    controles: "Souris · tactile",
    teinte: { de: "#1d2f7a", a: "#0a0c22", accent: "#ffd76b" },
  },
  {
    id: "memory",
    icone: "cerveau",
    famille: "arcade",
    href: "/jeux/arcade/memory",
    nom: "Memory galactique",
    emoji: "🧠",
    accroche: "Retrouve les 8 paires le plus vite possible.",
    description: "Retourne les cartes deux par deux et retrouve les 8 paires. Le chrono démarre à la première carte : rapidité et précision font grimper le score.",
    duree: "≈ 1 min",
    controles: "Souris · tactile",
    teinte: { de: "#5a1d7a", a: "#150b24", accent: "#e0b3ff" },
  },
  {
    id: "quiz",
    icone: "quiz",
    famille: "arcade",
    href: "/jeux/arcade/quiz",
    nom: "Quiz de la galaxie",
    emoji: "❓",
    accroche: "10 questions, 15 secondes chacune.",
    description: "Valorant, l'espace, les jeux vidéo, le stream, la culture G, le cinéma et la musique : dix questions tirées d'une banque de plus de 300, presque jamais les mêmes d'une partie à l'autre. Quinze secondes par question : réponds juste, et vite, pour décrocher le bonus de rapidité.",
    duree: "≈ 2 min",
    controles: "Souris · tactile",
    teinte: { de: "#1d6a5a", a: "#0b1a18", accent: "#6bffc8" },
  },
  {
    id: "gratter",
    icone: "ticket",
    famille: "quotidien",
    href: "/jeux/gratter",
    nom: "Ticket à gratter",
    emoji: "🎟️",
    accroche: "Un ticket gratuit par jour, le gain arrive directement sur ton compte Discord.",
    description: "Gratte ton ticket galactique du jour : points stellaires, Éclats, boosters de Cartes Astrales… Connecte-toi avec Discord : le gain arrive directement sur ton profil.",
    duree: "1 ticket / jour",
    controles: "Souris · tactile",
    teinte: { de: "#4b2a8f", a: "#140b2a", accent: "#c9a8ff" },
    badge: "Récompense Discord",
  },
  {
    id: "compagnon",
    icone: "oeuf",
    famille: "quotidien",
    href: "/jeux/compagnon",
    nom: "Compagnon galactique",
    emoji: "🥚",
    accroche: "Fais éclore ta créature et réussis ses 5 quêtes du jour.",
    description: "Adopte un œuf, fais éclore ta créature et prends-en soin. Quand ses 5 quêtes du jour sont faites, une récompense arrive directement sur ton compte Discord.",
    duree: "5 quêtes / jour",
    controles: "Souris · tactile",
    teinte: { de: "#1d7a4a", a: "#0b1a12", accent: "#9dffb0" },
    badge: "Récompense Discord",
  },
  {
    id: "capsules",
    icone: "cadeau",
    famille: "quotidien",
    href: "/jeux/capsules",
    nom: "Cosmo-Capsules",
    emoji: "🫧",
    accroche: "Une capsule par jour : une figurine kawaii à collectionner (100+ à trouver) et un cadeau sur Discord.",
    description: "Tourne la manivelle de la machine gatchapon et ouvre ta capsule du jour : une figurine rejoint ton album (plus de 100 figurines, 10 collections, 6 raretés, certaines en exemplaire unique) et un cadeau arrive sur ton compte Discord. Boosters, Éclats, fragments… et un gros bonus quand tu complètes une collection. Ton album se montre aussi sur Discord avec /figurines.",
    duree: "1 capsule / jour",
    controles: "Souris · tactile",
    teinte: { de: "#7a3a6a", a: "#1a0b24", accent: "#ffb3d6" },
    badge: "Nouveau",
  },
  {
    id: "grappin",
    icone: "soucoupe",
    famille: "quotidien",
    href: "/jeux/grappin",
    nom: "Le Grappin cosmique",
    emoji: "🕹️",
    accroche: "Une machine à pinces néon, 3 tirages par jour : chaque peluche cache un lot mystère !",
    description: "Pilote le grappin de la borne néon et attrape peluches et objets de la vitrine. Chacun cache un lot mystère : Éclats, boosters, fragments… ou le JACKPOT, impossible de savoir avant de l'avoir sorti ! Trois tirages par jour, jamais les mains vides : tout ton butin arrive sur ton compte Discord.",
    duree: "3 tirages / jour",
    controles: "◀ ▶ · Espace · tactile",
    teinte: { de: "#7a1d6a", a: "#12062a", accent: "#ff4f9a" },
    badge: "Nouveau",
  },
  {
    id: "coffres",
    icone: "coffre",
    famille: "quotidien",
    href: "/jeux/coffres",
    nom: "Les 3 coffres scellés",
    emoji: "🗝️",
    accroche: "Trois coffres, un gros lot. CycyBot en ouvre un : tu gardes ou tu changes ?",
    description: "Choisis un coffre parmi trois. CycyBot ouvre alors un des deux autres, qui ne cache jamais le gros lot. À toi de décider : garder ton coffre ou tenter l'autre. Ton trésor arrive directement sur ton compte Discord.",
    duree: "1 partie / jour",
    controles: "Souris · tactile · clavier",
    teinte: { de: "#4a2470", a: "#120a24", accent: "#ffc46b" },
    badge: "Récompense Discord",
  },
];

export const jeuParId = (id: string) => JEUX.find((j) => j.id === id) || null;
export const jeuxArcade = () => JEUX.filter((j) => j.famille === "arcade");
export const jeuxQuotidiens = () => JEUX.filter((j) => j.famille === "quotidien");
