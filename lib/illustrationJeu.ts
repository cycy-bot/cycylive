// Illustrations des cartes « Autres jeux » : une icône de la banque + un dégradé par genre.
// L'illustration est devinée depuis le nom du jeu, et peut être forcée dans /admin.
import type { NomIcone } from "@/components/icones/banque";

export type IllustrationJeu = { cle: string; label: string; icone: NomIcone; couleur: string; texte: string; mots: RegExp };

export const ILLUSTRATIONS_JEU: IllustrationJeu[] = [
  { cle: "horreur", label: "Horreur", icone: "fantome", couleur: "244,63,94", texte: "text-rose-200", mots: /horr|peur|phasmo|outlast|resident|fnaf|lethal|dead by|silent|zombie/i },
  { cle: "creature", label: "Créatures / survie", icone: "monstre", couleur: "52,211,153", texte: "text-emerald-200", mots: /palworld|pok[eé]|monst|cr[ée]ature|ark\b|temtem/i },
  { cle: "sandbox", label: "Sandbox / construction", icone: "cube", couleur: "56,189,248", texte: "text-sky-200", mots: /minecraft|sandbox|construct|craft|terraria|valheim|sims|stardew/i },
  { cle: "aventure", label: "Aventure / RPG", icone: "epee", couleur: "251,191,36", texte: "text-amber-200", mots: /zelda|rpg|aventure|elden|souls|baldur|witcher|skyrim|hogwarts|final fantasy/i },
  { cle: "course", label: "Course", icone: "volant", couleur: "232,121,249", texte: "text-fuchsia-200", mots: /course|racing|kart|forza|\bf1\b|rocket league|gran turismo|trackmania/i },
  { cle: "fps", label: "FPS / compétitif", icone: "viseur", couleur: "251,113,133", texte: "text-rose-200", mots: /valorant|\bcs\b|counter|overwatch|apex|fortnite|fps|call of duty|warzone|rainbow/i },
  { cle: "soiree", label: "Soirée / party game", icone: "fete", couleur: "192,132,252", texte: "text-purple-200", mots: /soir[ée]e|party|among|jackbox|fall guys|gartic|quiz|codenames/i },
  { cle: "jeu", label: "Jeu (par défaut)", icone: "manette", couleur: "161,92,255", texte: "text-violet-200", mots: /$^/ },
];

export function illustrationPour(nom: string, cle?: string): IllustrationJeu {
  const forcee = cle && ILLUSTRATIONS_JEU.find((i) => i.cle === cle);
  if (forcee) return forcee;
  return ILLUSTRATIONS_JEU.find((i) => i.mots.test(nom)) ?? ILLUSTRATIONS_JEU[ILLUSTRATIONS_JEU.length - 1];
}
