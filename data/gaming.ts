// ============================================================
// GAMING — intro, autres jeux, jeux du moment
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Gère tout ça depuis /admin, onglet "Gaming".

export type AutreJeu = {
  id: string;
  nom: string;
  description: string;
  lienClip?: string; // optionnel : lien vers un clip/contenu de ce jeu
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
