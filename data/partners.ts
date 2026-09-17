// ============================================================
// PARTENAIRES — types et valeur par défaut
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Ajoute/modifie tes partenaires depuis /admin, onglet "Partenaires".

export type Partenaire = {
  id: string;
  nom: string;
  logo?: string; // URL d'image (optionnel)
  description: string;
  typePartenariat: string; // ex: "Sponsoring", "Matériel", "Créateur"
  url: string;
  promoCode?: string;
  reduction?: string; // ex: "-10%"
  ctaLabel: string; // ex: "Découvrir", "Profiter du bon plan"
  active: boolean;
};

// Aucun partenaire par défaut : la page reste élégante même vide
// (voir composant PartenairesListe) tant que rien n'est renseigné.
export const partenairesParDefaut: Partenaire[] = [];
