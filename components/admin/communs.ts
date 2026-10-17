// Administration — constantes partagées entre les rubriques
import type { Contenu } from "@/data/contenus";
import { type RubriqueAdmin } from "@/components/admin/NavigationAdmin";
import { type Textes } from "@/data/textes";

export type Onglet = "accueil" | "live" | "generateur" | "miniatures" | "planning" | "calendrier" | "contenus" | "textes" | "timeline" | "apropos" | "gaming" | "valorant" | "partenaires" | "arcade";

// Rubriques de l'admin, rangées par thème (voir components/admin/NavigationAdmin.tsx)
export const ONGLETS: (RubriqueAdmin<Onglet> & { cles: string[] })[] = [
  { valeur: "accueil", label: "Vue d'ensemble", icone: "maison", groupe: "Général", description: "Connexions et accès rapide à toutes les rubriques", cles: [] },
  { valeur: "live", label: "Je lance le live", icone: "live", groupe: "Lives", description: "Stories Instagram / TikTok prêtes à partager : live, ce soir, planning, OFF", motsCles: "story stories instagram tiktok annonce réseaux partager", cles: [] },
  { valeur: "planning", label: "Planning", icone: "horloge", groupe: "Lives", description: "La semaine type : jours, jeux et horaires", motsCles: "horaires semaine jours off", cles: ["planning"] },
  { valeur: "calendrier", label: "Calendrier", icone: "calendrier", groupe: "Lives", description: "Exceptions, événements et lives spéciaux", motsCles: "exception événement vacances", cles: ["calendrier"] },
  { valeur: "contenus", label: "Derniers contenus", icone: "clap", groupe: "Contenus", description: "Vidéos TikTok, YouTube et Instagram de l'accueil", motsCles: "vidéos tiktok youtube instagram", cles: ["contenus"] },
  { valeur: "generateur", label: "Générateur de contenus", icone: "clap", groupe: "Contenus", description: "Un clip → vidéo verticale, sous-titres, miniature, story et textes", motsCles: "clip tiktok reels shorts vertical sous-titres miniature montage", cles: [] },
  { valeur: "miniatures", label: "Studio miniatures", icone: "camera", groupe: "Contenus", description: "Miniatures YouTube 1280 × 720 dans la charte Cycylive", motsCles: "miniature youtube thumbnail vignette video titre", cles: [] },
  { valeur: "textes", label: "Textes du site", icone: "document", groupe: "Contenus", description: "Titres et textes de chaque page", motsCles: "hero accueil titre contact soutenir", cles: ["textes"] },
  { valeur: "apropos", label: "À propos", icone: "coeur", groupe: "Contenus", description: "Les sections de la page À propos", cles: ["apropos"] },
  { valeur: "timeline", label: "Timeline", icone: "journal", groupe: "Contenus", description: "Les grandes étapes de la chaîne", motsCles: "histoire étapes dates", cles: ["timeline"] },
  { valeur: "gaming", label: "Gaming", icone: "manette", groupe: "Gaming & jeux", description: "Intro, autres jeux et jeux du moment", motsCles: "illustration horreur palworld", cles: ["gaming"] },
  { valeur: "valorant", label: "Valorant", icone: "tactique", groupe: "Gaming & jeux", description: "News, clips marquants et profil (rank, agents)", motsCles: "rank riot agents maps clips news", cles: ["news", "clips", "profil"] },
  { valeur: "arcade", label: "Jeux du site", icone: "joystick", groupe: "Gaming & jeux", description: "Arcade, records et réglages des mini-jeux", motsCles: "arcade runner records gratter compagnon coffres", cles: [] },
  { valeur: "partenaires", label: "Partenaires", icone: "poignee", groupe: "Partenariats", description: "Partenaires, bandeau de l'accueil et bons plans", motsCles: "codes promo réduction affiliation bons plans bandeau", cles: ["partenaires", "bonsPlans", "textes"] },
];

// Données enregistrées par chaque route (pour savoir ce qui n'est plus « modifié »)
export const CLES_PAR_URL: Record<string, string[]> = {
  "/api/planning": ["planning"],
  "/api/calendrier": ["calendrier"],
  "/api/contenus": ["contenus"],
  "/api/textes": ["textes"],
  "/api/timeline": ["timeline"],
  "/api/apropos-sections": ["apropos"],
  "/api/gaming": ["gaming"],
  "/api/valorant-news": ["news"],
  "/api/valorant-clips": ["clips"],
  "/api/valorant-profil": ["profil"],
  "/api/partenaires": ["partenaires"],
  "/api/bons-plans": ["bonsPlans"],
};

export const CLE_SESSION = "cycylive-admin-session";

export const PLATEFORMES: Contenu["plateforme"][] = ["TikTok", "Instagram", "YouTube", "Twitch"];

export function genererId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export type ChampTexte = { cle: string; label: string; type: "input" | "textarea" };
export type SectionTexte = { titre: string; cle: keyof Textes; champs: ChampTexte[] };

export const SECTIONS_TEXTES: SectionTexte[] = [
  {
    titre: "Hero (tout en haut de l'accueil)",
    cle: "hero",
    champs: [
      { cle: "ligneCourte", label: "Petite ligne au-dessus du titre", type: "input" },
      { cle: "accroche", label: "Titre principal", type: "input" },
      { cle: "description", label: "Description", type: "textarea" },
      { cle: "boutonPrincipal", label: "Texte du bouton Twitch", type: "input" },
      { cle: "boutonSecondaire", label: "Texte du bouton Discord", type: "input" },
    ],
  },
  {
    titre: "À propos",
    cle: "apropos",
    champs: [
      { cle: "titreAccueil", label: "Titre (bloc sur l'accueil)", type: "input" },
      { cle: "texteCourt", label: "Texte court (bloc sur l'accueil)", type: "textarea" },
      { cle: "boutonPlus", label: "Texte du bouton \"en savoir plus\"", type: "input" },
      { cle: "pageTitre", label: "Titre (page \"À propos\" complète)", type: "input" },
    ],
  },
  {
    titre: "Communauté",
    cle: "communaute",
    champs: [
      { cle: "titre", label: "Titre", type: "input" },
      { cle: "texte", label: "Texte (bloc sur l'accueil)", type: "textarea" },
      { cle: "pageTexte", label: "Texte (page complète)", type: "textarea" },
    ],
  },
  {
    titre: "Partenariats",
    cle: "partenariats",
    champs: [
      { cle: "titre", label: "Titre", type: "input" },
      { cle: "intro", label: "Texte d'introduction", type: "textarea" },
      { cle: "typesTitre", label: "Titre \"types de collaborations\"", type: "input" },
      { cle: "cta", label: "Texte du bouton contact", type: "input" },
      { cle: "mediaKit", label: "Texte du bouton media kit", type: "input" },
    ],
  },
  {
    titre: "Contact",
    cle: "contact",
    champs: [
      { cle: "titre", label: "Titre", type: "input" },
      { cle: "texte", label: "Texte d'introduction", type: "textarea" },
    ],
  },
];
