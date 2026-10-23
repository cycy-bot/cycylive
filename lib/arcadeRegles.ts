// ============================================================
// BORNE D'ARCADE — règles communes au jeu et au serveur
// ============================================================
// Le serveur s'en sert pour refuser les scores impossibles :
// le score dépend de la distance parcourue, et la vitesse
// augmente selon une courbe connue.

export const ARCADE = {
  nom: "Cycy Runner",
  vitesseDepart: 430, // px / s
  acceleration: 8, // px / s² (au début)
  accelerationCroissante: 0.06, // l'accélération augmente avec le temps : la course s'emballe
  vitesseMax: 1400, // px / s
  pxParPoint: 10, // 10 px parcourus = 1 point
  tailleClassement: 20,
  pseudoMin: 2,
  pseudoMax: 16,
};

/** Vitesse du jeu après t secondes de course (de plus en plus vite). */
export function vitesseA(t: number): number {
  const { vitesseDepart: v0, acceleration: a, accelerationCroissante: b, vitesseMax } = ARCADE;
  return Math.min(vitesseMax, v0 + a * t + b * t * t);
}

/** Progression de la difficulté (0 au départ, 1 après ~100 s) : obstacles plus serrés et plus variés. */
export function intensite(t: number): number {
  return Math.max(0, Math.min(1, t / 100));
}

/** Score maximum atteignable en t secondes (course parfaite, sans pause). */
export function scoreMaxPour(t: number): number {
  const pas = 0.05;
  let distance = 0;
  for (let x = 0; x < t; x += pas) distance += vitesseA(x + pas / 2) * Math.min(pas, t - x);
  return Math.floor(distance / ARCADE.pxParPoint);
}

// Lettres (accents compris), chiffres, espace, tiret, point, tiret bas
const PSEUDO_OK = /^[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF _.\-]+$/;
// Pseudo refusé s'il est exactement l'un de ces mots, ou s'il contient l'un des seconds
const MOTS_EXACTS = ["admin", "moderateur", "modo", "cycy", "cycylive", "pute", "conne", "nazi", "negro", "pd", "fdp", "ntm"];
const MOTS_CONTENUS = ["connard", "salope", "encule", "nigger", "hitler", "batard"];

function sansAccents(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
}

/** Pseudo nettoyé, ou un message d'erreur. */
export function verifierPseudo(brut: unknown): { ok: true; pseudo: string; cle: string } | { ok: false; erreur: string } {
  const pseudo = String(brut ?? "").replace(/\s+/g, " ").trim();
  if (pseudo.length < ARCADE.pseudoMin || pseudo.length > ARCADE.pseudoMax) {
    return { ok: false, erreur: `Ton pseudo doit faire entre ${ARCADE.pseudoMin} et ${ARCADE.pseudoMax} caractères.` };
  }
  if (!PSEUDO_OK.test(pseudo)) {
    return { ok: false, erreur: "Utilise seulement des lettres, des chiffres, des espaces, « - », « _ » ou « . »." };
  }
  const simple = sansAccents(pseudo).toLowerCase();
  const compact = simple.replace(/[^a-z0-9]/g, "");
  if (MOTS_EXACTS.includes(compact) || MOTS_CONTENUS.some((m) => compact.includes(m))) {
    return { ok: false, erreur: "Ce pseudo n'est pas autorisé, choisis-en un autre." };
  }
  return { ok: true, pseudo, cle: simple };
}

// ============================================================
// SALLE D'ARCADE — les mini-jeux et leurs limites de score
// ============================================================
// Chaque jeu a son propre tableau des records. Le serveur refuse un
// score plus haut que ce qui est possible pour le temps écoulé depuis
// le début de la partie (dureeMin = durée minimale d'une vraie partie).

export type JeuSalle = "reflexes" | "memory" | "quiz" | "constellations" | "rythme" | "astrododge" | "starcatcher" | "cycyword" | "flipper";
export type JeuArcade = "runner" | JeuSalle;

export const JEUX_SALLE: Record<JeuSalle, { nom: string; emoji: string; dureeMin: number; scoreMax: (t: number) => number }> = {
  // 30 s de cibles : 150 points max par cible, 6 cibles/s au mieux
  reflexes: { nom: "Réflexes Valorant", emoji: "🎯", dureeMin: 28, scoreMax: (t) => Math.min(t, 34) * 6 * 150 },
  // 8 paires : 3 000 points de base + bonus de vitesse
  memory: { nom: "Memory galactique", emoji: "🧠", dureeMin: 6, scoreMax: () => 3000 + 90 * 40 },
  // 10 questions, 100 points + 50 de bonus de rapidité
  quiz: { nom: "Quiz de la galaxie", emoji: "❓", dureeMin: 8, scoreMax: () => 1500 },
  // niveaux de constellations : environ 160 points par seconde au mieux
  constellations: { nom: "Puzzle des constellations", emoji: "✨", dureeMin: 4, scoreMax: (t) => t * 160 + 200 },
  // 60 s de musique, 4 notes/s au plus, 100 points × multiplicateur 4
  rythme: { nom: "Rythme cosmique", emoji: "🎵", dureeMin: 50, scoreMax: (t) => Math.min(t, 70) * 4 * 400 },
  // 10 points par seconde de survie × palier (jusqu'à ×4) + 150 par bonus ramassé (≈ 1 toutes les 4 s)
  astrododge: { nom: "Astro Dodge", emoji: "🚀", dureeMin: 3, scoreMax: (t) => t * 40 + (t / 3) * 150 + 300 },
  // jusqu'à ~3 étoiles/s, 50 points × combo ×5, étoiles dorées ×3
  starcatcher: { nom: "Star Catcher", emoji: "⭐", dureeMin: 3, scoreMax: (t) => t * 3 * 50 * 5 * 1.6 + 500 },
  // mot du jour : 100 × (7 − essais) + bonus de rapidité (≤ 150)
  cycyword: { nom: "CycyWord", emoji: "🔤", dureeMin: 4, scoreMax: () => 750 },
  // planètes 100 pts (≈ 6/s au mieux), cibles, trou noir 2 000, missions jusqu'à 25 000, multiplicateur ×5
  flipper: { nom: "Flipper cosmique", emoji: "🪐", dureeMin: 8, scoreMax: (t) => t * 9000 + 150000 },
};

export const JEUX_ARCADE: JeuArcade[] = ["runner", "reflexes", "memory", "quiz", "constellations", "rythme", "astrododge", "starcatcher", "cycyword", "flipper"];
export const estJeuArcade = (j: unknown): j is JeuArcade => JEUX_ARCADE.includes(j as JeuArcade);
export const nomJeu = (j: JeuArcade) => (j === "runner" ? ARCADE.nom : JEUX_SALLE[j].nom);

/** Score maximum autorisé pour ce jeu après t secondes. */
export function scoreMaxJeu(jeu: JeuArcade, t: number): number {
  return jeu === "runner" ? scoreMaxPour(t) : JEUX_SALLE[jeu].scoreMax(t);
}
