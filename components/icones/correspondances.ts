// Correspondances « données du bot → icône de la banque », pour ne plus afficher
// les emojis envoyés par Cycy_Bot (groupes de commandes, objets du Marché noir, destinations…).
import type { NomIcone } from "@/components/icones/banque";

export const ICONE_GROUPE: Record<string, NomIcone> = {
  // Twitch
  live: "ecran", profil: "badge", jeux: "manette", cycybot: "robot", clips: "clap", perso: "eclats",
  sanctions: "bouclier", chat: "bulle", gestion: "outils",
  // Discord
  plusieurs: "membres", cartes: "cartes", galaxie: "galaxie", musique: "note", vocal: "son", aide: "livre", autres: "etoile",
};

/** Icône d'un objet du Marché noir, d'après son nom. */
export function iconeObjet(nom: string): NomIcone {
  const n = nom.toLowerCase();
  if (/booster|carte/.test(n)) return "cartes";
  if (/boost|xp/.test(n)) return "boost";
  if (/titre/.test(n)) return "etiquette";
  if (/cadre|passeport/.test(n)) return "badge";
  if (/th[eè]me|fond/.test(n)) return "planete";
  if (/fragment/.test(n)) return "puzzle";
  if (/relance/.test(n)) return "slot";
  if (/couronne|prestige|l[ée]gende/.test(n)) return "couronne";
  if (/filigrane|or\b|dor[ée]/.test(n)) return "etoile";
  return "eclats";
}

/** Icône d'une destination d'expédition, d'après son nom. */
export function iconeDestination(nom: string): NomIcone {
  const n = nom.toLowerCase();
  if (/lune|moon/.test(n)) return "lune";
  if (/n[ée]buleuse|galaxie|sagittarius|trou noir|andromède/.test(n)) return "galaxie";
  if (/com[eè]te|ast[ée]ro/.test(n)) return "comete";
  if (/station|satellite|base/.test(n)) return "satellite";
  if (/soleil|[ée]toile|pulsar/.test(n)) return "soleil";
  return "planete";
}
