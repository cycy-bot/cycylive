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
    const nomJour = JOURS_ORDRE[date.getDay()];

    const jourPlanning = planning.find((p) => p.jour === nomJour);
    if (!jourPlanning || jourPlanning.off) continue;

    const { heures, minutes } = parseHeure(jourPlanning.heure);
    const dateLive = new Date(date);
    dateLive.setHours(heures, minutes, 0, 0);

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
