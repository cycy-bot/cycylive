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
  jeu?: string;
  heure?: string; // format "21h30"
};

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
  planning: JourPlanning[]
): ProchainLive | null {
  const maintenant = new Date();

  for (let decalage = 0; decalage < 8; decalage++) {
    const date = new Date(maintenant);
    date.setDate(maintenant.getDate() + decalage);
    const nomJour = JOURS_ORDRE[jourSemaineAParis(date)];

    const jourPlanning = planning.find((p) => p.jour === nomJour);
    if (!jourPlanning || jourPlanning.off) continue;

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
