// ============================================================
// GAMING — intro, autres jeux, jeux du moment
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Gère tout ça depuis /admin, onglet "Gaming".

import { plateformeDe } from "@/data/contenus";

/** Un clip ou une vidéo d'un jeu (TikTok, Instagram, YouTube, clip Twitch). */
export type ContenuJeu = { id: string; url: string; titre?: string; plateforme: "TikTok" | "Instagram" | "YouTube" | "Twitch" };
export const MAX_CONTENUS_JEU = 12;

export type AutreJeu = {
  id: string;
  nom: string;
  description: string;
  contenus?: ContenuJeu[]; // plusieurs clips / vidéos du jeu, dans l'ordre
  lienClip?: string; // ancien format (un seul lien) : repris comme premier contenu
  illustration?: string; // optionnel : clé de lib/illustrationJeu.ts (sinon devinée depuis le nom)
};

export type JeuDuMoment = {
  id: string;
  nom: string;
  statut: "En ce moment" | "En pause" | "À venir";
};

export const introGamingParDefaut =
  "Le gaming est au cœur de mes lives. Aujourd'hui, Valorant occupe une place centrale, mais l'univers Cycylive évolue aussi au fil des jeux, des découvertes et des soirées communautaires.";

export const autresJeuxParDefaut: AutreJeu[] = [
  {
    id: "1",
    nom: "Soirées jeux d'horreur",
    description: "Un classique entre ami·es, à plusieurs, dans le noir (ou presque).",
  },
  {
    id: "2",
    nom: "Palworld",
    description: "Des sessions communautaires improvisées, entre exploration et fous rires.",
  },
];

// Optionnel : laisse ce tableau vide pour masquer automatiquement la
// section "Jeux du moment" sur le site.
export const jeuxDuMomentParDefaut: JeuDuMoment[] = [];


/** Les contenus d'un jeu (nouveau format, ou l'ancien lien unique). */
export function contenusDuJeu(jeu: AutreJeu): ContenuJeu[] {
  if (Array.isArray(jeu.contenus) && jeu.contenus.length) return jeu.contenus.filter((c) => c && c.url).slice(0, MAX_CONTENUS_JEU);
  if (jeu.lienClip) return [{ id: "lien", url: jeu.lienClip, plateforme: plateformeDe(jeu.lienClip)?.plateforme ?? "Twitch" }];
  return [];
}
