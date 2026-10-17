// Catalogue des jeux du site (vitrine /jeux, barre de changement de jeu, menu).
// Deux familles :
//  • la salle d'arcade : des jeux à records, chacun avec son tableau des scores ;
//  • les récompenses du jour : liées au Discord (un ticket, des quêtes par jour).

import type { JeuArcade } from "@/lib/arcadeRegles";
import type { NomIcone } from "@/components/icones/banque";

export type FamilleJeu = "arcade" | "quotidien";

export type FicheJeu = {
  id: JeuArcade | "gratter" | "compagnon" | "coffres";
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
    description: "Valorant, l'espace, les jeux vidéo et le stream : dix questions, quinze secondes pour chacune. Réponds juste, et vite, pour décrocher le bonus de rapidité.",
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
    teinte: { de: "#7a5a1d", a: "#1a130b", accent: "#ffd76b" },
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
    teinte: { de: "#7a3a1d", a: "#1a0e0b", accent: "#ffb86b" },
    badge: "Nouveau",
  },
];

export const jeuParId = (id: string) => JEUX.find((j) => j.id === id) || null;
export const jeuxArcade = () => JEUX.filter((j) => j.famille === "arcade");
export const jeuxQuotidiens = () => JEUX.filter((j) => j.famille === "quotidien");
