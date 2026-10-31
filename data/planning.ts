// ============================================================
// PLANNING DES LIVES — types et calculs
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Pour changer le planning au quotidien, utilise l'interface web
// sur /admin (voir le README, section "Interface d'administration
// du planning").
//
// Le tableau ci-dessous ne sert que de PLANNING PAR DÉFAUT, utilisé
// si l'interface /admin n'a encore jamais rien enregistré (ou si le
// stockage n'est pas configuré). Une fois que tu as fait une
// première sauvegarde via /admin, c'est celle-ci qui prend le relais
// partout sur le site.

export type JourPlanning = {
  jour: string;
  off: boolean;
  jeu?: string; // tous les jeux de la soirée, séparés par « + » (lu aussi par CycyBot et le compte à rebours)
  jeux?: string[]; // jusqu'à 3 jeux / activités dans la même soirée, dans l'ordre
  titre?: string; // titre libre de la soirée (« Soirée jeux communautaires »…)
  categorie?: string; // catégorie (voir CATEGORIES) : choisit l'illustration du planning
  heure?: string; // format "21h30"
  fin?: string; // heure de fin (facultative), format "1h" ou "23h30"
};

export const MAX_JEUX = 3;

/** Catégories de soirée : elles choisissent l'illustration et les couleurs du planning (site + Discord). */
export const CATEGORIES = [
  { id: "valorant", label: "Valorant", emoji: "🎯" },
  { id: "pp", label: "Soirée PP", emoji: "🎮" },
  { id: "communautaire", label: "Soirée jeux communautaires", emoji: "🎲" },
  { id: "horreur", label: "Soirée horreur", emoji: "👻" },
  { id: "evenement", label: "Événement spécial", emoji: "✨" },
  { id: "caritatif", label: "Live caritatif", emoji: "💜" },
  { id: "giveaway", label: "Giveaway", emoji: "🎁" },
  { id: "tournoi", label: "Tournoi", emoji: "🏆" },
  { id: "anniversaire", label: "Anniversaire", emoji: "🎂" },
  { id: "halloween", label: "Halloween", emoji: "🎃" },
  { id: "noel", label: "Noël", emoji: "🎄" },
  { id: "discussion", label: "Discussion", emoji: "💬" },
  { id: "autre", label: "Autre jeu", emoji: "🕹️" },
] as const;
export const categorieDe = (id?: string) => CATEGORIES.find((c) => c.id === id);

type AvecSoiree = { jeu?: string; jeux?: string[]; titre?: string; categorie?: string };

/** Les jeux / activités d'une soirée (1 à 3), quel que soit l'ancien ou le nouveau format. */
export function jeuxDe(j: AvecSoiree | null | undefined): string[] {
  if (!j) return [];
  const liste = Array.isArray(j.jeux) ? j.jeux.map((x) => String(x || "").trim()).filter(Boolean) : [];
  if (liste.length) return liste.slice(0, MAX_JEUX);
  // Ancien format : « jeu » seul (sans titre ni catégorie, sinon « jeu » est le libellé calculé)
  if (j.titre || j.categorie) return [];
  return j.jeu ? [String(j.jeu).trim()].filter(Boolean) : [];
}

/** Libellé complet de la soirée (lu par CycyBot, le compte à rebours, les stories) : « Titre : jeu + jeu ». */
export function libelleSoiree(j: AvecSoiree | null | undefined): string {
  if (!j) return "";
  const jeux = jeuxDe(j);
  const cat = categorieDe(j.categorie);
  const base = String(j.titre || "").trim() || (cat && cat.id !== "autre" && cat.id !== "valorant" ? cat.label : "");
  if (base && jeux.length) return `${base} : ${jeux.join(" + ")}`;
  return base || jeux.join(" + ") || (cat ? cat.label : "");
}

/** Range un jour avant l'enregistrement : jeux nettoyés (3 max), titre, catégorie et « jeu » recalculé. */
export function avecJeux<T extends AvecSoiree>(j: T): T {
  const titre = String(j.titre || "").trim().slice(0, 80) || undefined;
  const categorie = categorieDe(j.categorie)?.id;
  const brut = Array.isArray(j.jeux) ? j.jeux : !titre && !categorie && j.jeu ? [j.jeu] : [];
  const jeux = brut.map((x) => String(x || "").trim().slice(0, 60)).filter(Boolean).slice(0, MAX_JEUX);
  const propre = { ...j, titre, categorie, jeux: jeux.length ? jeux : undefined };
  return { ...propre, jeu: libelleSoiree(propre) || undefined };
}

export const LABEL_GENERIQUE = "Stream";

export const planningParDefaut: JourPlanning[] = [
  { jour: "Lundi", off: false, heure: "21h30" },
  { jour: "Mardi", off: false, heure: "21h30" },
  { jour: "Mercredi", off: false, heure: "21h30" },
  { jour: "Jeudi", off: false, heure: "21h30" },
  { jour: "Vendredi", off: true },
  { jour: "Samedi", off: false, heure: "21h30" },
  { jour: "Dimanche", off: false, heure: "21h30" },
];

// ------------------------------------------------------------
// Calculs automatiques (rien à modifier en dessous de cette ligne)
// ------------------------------------------------------------

export const JOURS_ORDRE = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function formatCourt(date: Date): string {
  const jour = String(date.getDate()).padStart(2, "0");
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  return `${jour}/${mois}`;
}

/** Les 7 dates (« 2026-10-19 »…) de la semaine en cours, du lundi au dimanche, à Paris. */
export function datesSemaineActuelle(): string[] {
  const ymd = anneeMoisJourAParis(new Date());
  const jour = new Date(`${ymd}T12:00:00Z`);
  const lundi = new Date(jour.getTime() - ((jour.getUTCDay() + 6) % 7) * 86400000);
  return Array.from({ length: 7 }, (_, i) => new Date(lundi.getTime() + i * 86400000).toISOString().slice(0, 10));
}

export function getSemaineActuelle(): { du: string; au: string } {
  const aujourdhui = new Date();
  const jourSemaine = aujourdhui.getDay();
  const decalageLundi = jourSemaine === 0 ? -6 : 1 - jourSemaine;

  const lundi = new Date(aujourdhui);
  lundi.setDate(aujourdhui.getDate() + decalageLundi);

  const dimanche = new Date(lundi);
  dimanche.setDate(lundi.getDate() + 6);

  return { du: formatCourt(lundi), au: formatCourt(dimanche) };
}

// Convertit "21h30" -> { heures: 21, minutes: 30 }
function parseHeure(heure?: string): { heures: number; minutes: number } {
  if (!heure) return { heures: 0, minutes: 0 };
  const [h, m] = heure.replace("h", ":").split(":");
  return { heures: parseInt(h, 10) || 0, minutes: parseInt(m, 10) || 0 };
}

const FUSEAU_CYCYLIVE = "Europe/Paris";

// Le serveur (Vercel) tourne en UTC, pas en heure française. "21h" dans
// le planning veut dire 21h à Paris, pas 21h UTC — sans cette
// conversion, tout le compte à rebours est décalé (1h en hiver, 2h en
// été à cause du changement d'heure).
function decalageMinutes(date: Date, fuseau: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: fuseau,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const valeur = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const commeUTC = Date.UTC(
    parseInt(valeur("year")),
    parseInt(valeur("month")) - 1,
    parseInt(valeur("day")),
    parseInt(valeur("hour")),
    parseInt(valeur("minute")),
    parseInt(valeur("second"))
  );
  return (commeUTC - date.getTime()) / 60000;
}

function anneeMoisJourAParis(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU_CYCYLIVE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // "2026-09-24"
}

// Jour de la semaine (0 = dimanche) selon le calendrier de Paris —
// important autour de minuit, où le jour côté serveur (UTC) et côté
// Paris peuvent différer.
function jourSemaineAParis(date: Date): number {
  const ymd = anneeMoisJourAParis(date);
  return new Date(`${ymd}T00:00:00Z`).getUTCDay();
}

// Construit l'instant exact (UTC) correspondant à "heures:minutes" à
// Paris, pour le jour calendaire de `date` (vu depuis Paris).
function dateLiveAParis(date: Date, heures: number, minutes: number): Date {
  const anneeMoisJour = anneeMoisJourAParis(date);
  const essai = new Date(
    `${anneeMoisJour}T${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`
  );
  const decalage = decalageMinutes(essai, FUSEAU_CYCYLIVE);
  return new Date(essai.getTime() - decalage * 60000);
}

export type ProchainLive = {
  jour: string;
  heure: string;
  jeu: string;
  estAujourdhui: boolean;
  timestamp: string; // date/heure exacte (ISO), pour calculer un compte à rebours
};

// Trouve le prochain live à venir à partir d'UN planning donné
// (celui par défaut, ou celui enregistré via /admin).
export function calculerProchainLive(
  planning: JourPlanning[],
  exceptions: Record<string, { off: boolean; heure?: string; jeu?: string }> = {}
): ProchainLive | null {
  const maintenant = new Date();

  for (let decalage = 0; decalage < 22; decalage++) {
    const date = new Date(maintenant);
    date.setDate(maintenant.getDate() + decalage);
    const nomJour = JOURS_ORDRE[jourSemaineAParis(date)];

    const habituel = planning.find((p) => p.jour === nomJour);
    const exception = exceptions[anneeMoisJourAParis(date)];
    const jourPlanning: JourPlanning | undefined = exception
      ? exception.off
        ? { jour: nomJour, off: true }
        : { jour: nomJour, off: false, heure: exception.heure || habituel?.heure, jeu: exception.jeu || habituel?.jeu }
      : habituel;
    if (!jourPlanning || jourPlanning.off || !jourPlanning.heure) continue;

    const { heures, minutes } = parseHeure(jourPlanning.heure);
    const dateLive = dateLiveAParis(date, heures, minutes);

    if (decalage === 0 && dateLive.getTime() < maintenant.getTime()) continue;

    return {
      jour: jourPlanning.jour,
      heure: jourPlanning.heure ?? "",
      jeu: jourPlanning.jeu ?? LABEL_GENERIQUE,
      estAujourdhui: decalage === 0,
      timestamp: dateLive.toISOString(),
    };
  }

  return null;
}
