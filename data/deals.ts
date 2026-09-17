// ============================================================
// BONS PLANS — types et valeur par défaut
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Ajoute/modifie tes bons plans depuis /admin, onglet "Partenaires".

export type BonPlan = {
  id: string;
  marque: string;
  offre: string; // ex: "-15% sur toute la boutique"
  promoCode?: string;
  reduction?: string;
  url: string;
  dateFin?: string; // libre, ex: "31 décembre 2026"
  conditions?: string;
  active: boolean;
};

export const bonsPlansParDefaut: BonPlan[] = [];
