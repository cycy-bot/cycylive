// ============================================================
// BORNE D'ARCADE — règles communes au jeu et au serveur
// ============================================================
// Le serveur s'en sert pour refuser les scores impossibles :
// le score dépend de la distance parcourue, et la vitesse
// augmente selon une courbe connue.

export const ARCADE = {
  nom: "Cycy Runner",
  vitesseDepart: 420, // px / s
  acceleration: 7, // px / s²
  vitesseMax: 1150, // px / s
  pxParPoint: 10, // 10 px parcourus = 1 point
  tailleClassement: 20,
  pseudoMin: 2,
  pseudoMax: 16,
};

/** Vitesse du jeu après t secondes de course. */
export function vitesseA(t: number): number {
  return Math.min(ARCADE.vitesseMax, ARCADE.vitesseDepart + ARCADE.acceleration * t);
}

/** Score maximum atteignable en t secondes (course parfaite, sans pause). */
export function scoreMaxPour(t: number): number {
  const { vitesseDepart: v0, acceleration: a, vitesseMax: vmax, pxParPoint } = ARCADE;
  const tMax = (vmax - v0) / a;
  const distance = t <= tMax ? v0 * t + (a * t * t) / 2 : v0 * tMax + (a * tMax * tMax) / 2 + vmax * (t - tMax);
  return Math.floor(distance / pxParPoint);
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
