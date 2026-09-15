// ============================================================
// STATUT TWITCH — un seul interrupteur à changer
// ============================================================
// Le "prochain live" est calculé automatiquement depuis
// data/planning.ts : tu n'as rien à faire pour ça.
//
// Le SEUL réglage manuel ici, c'est "enLigne" : passe-le à true
// pendant que tu es vraiment en train de streamer si tu veux que
// le site affiche le badge "EN LIVE" à la place de "Prochain live".
// Remets-le à false une fois le live terminé.
//
// (Plus tard, ce fichier pourra être remplacé par un vrai appel à
// l'API Twitch pour détecter ça automatiquement — voir le README.)

export type StatutTwitch = {
  enLigne: boolean;
  titre?: string;
  categorie?: string;
  viewers?: number;
};

export const statutTwitch: StatutTwitch = {
  enLigne: false,
};
