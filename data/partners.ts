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
  image?: string; // visuel / bannière cliquable (URL ou image envoyée depuis /admin)
  affichage?: AffichagePartenaire; // style de la carte (par défaut : "carte")
  affilie?: boolean; // lien affilié : mention « Lien affilié » affichée
  miseEnAvant?: boolean; // affiché en grand, en haut de la liste
};

// carte : logo + texte + bouton · banniere : grande image cliquable avec le texte dessous
// image : uniquement l'image cliquable (idéal pour un visuel fourni par la marque)
export type AffichagePartenaire = "carte" | "banniere" | "image";
export const AFFICHAGES_PARTENAIRE: { valeur: AffichagePartenaire; label: string }[] = [
  { valeur: "carte", label: "Carte (logo + texte + bouton)" },
  { valeur: "banniere", label: "Bannière (grande image cliquable + texte)" },
  { valeur: "image", label: "Image seule cliquable" },
];

// Style réellement utilisé : sans choix explicite, un partenaire qui a une image
// s'affiche en bannière (sinon l'image ajoutée dans /admin n'apparaîtrait pas).
export function affichageDe(p: Pick<Partenaire, "image" | "affichage">): AffichagePartenaire {
  if (!p.image) return "carte";
  return p.affichage ?? "banniere";
}

// Aucun partenaire par défaut : la page reste élégante même vide
// (voir composant PartenairesListe) tant que rien n'est renseigné.
export const partenairesParDefaut: Partenaire[] = [];
