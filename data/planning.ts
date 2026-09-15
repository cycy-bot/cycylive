// ============================================================
// PLANNING DES LIVES — le planning type de la semaine
// ============================================================
// Comme tes jours off / jours de live sont toujours les mêmes,
// tu n'as PAS besoin de mettre à jour les dates ni le "prochain
// live" : tout est calculé automatiquement à partir de la liste
// ci-dessous et de l'heure actuelle.
//
// Tu ne modifies CE FICHIER que si :
// - un jour off/live change de façon durable ;
// - un horaire change ;
// - tu veux préciser un jeu pour une semaine donnée (optionnel).
//
// "off: true"   -> jour sans live (heure et jeu ignorés)
// "off: false"  -> jour avec live (renseigne au moins l'heure)
// "jeu"         -> optionnel. Si tu ne le remplis pas, le site
//                  affiche juste "En live" à la place.

export type JourPlanning = {
  jour: string;
  off: boolean;
  jeu?: string;
  heure?: string; // format "21h30"
};

export const planning: JourPlanning[] = [
  { jour: "Lundi", off: false, heure: "21h30" },
  { jour: "Mardi", off: false, heure: "21h30" },
  { jour: "Mercredi", off: false, heure: "21h30" },
  { jour: "Jeudi", off: false, heure: "21h30" },
  { jour: "Vendredi", off: true },
  { jour: "Samedi", off: false, heure: "21h30" },
  { jour: "Dimanche", off: true },
];

// Libellé générique utilisé quand aucun jeu n'est précisé pour un jour.
export const LABEL_GENERIQUE = "En live";

// ------------------------------------------------------------
// Calculs automatiques (rien à modifier en dessous de cette ligne)
// ------------------------------------------------------------

const JOURS_ORDRE = [
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
};

// Trouve automatiquement le prochain live à venir (ou en cours ce
// soir) en se basant sur le planning et l'heure actuelle.
export function getProchainLive(): ProchainLive | null {
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

    // Si c'est aujourd'hui mais que l'heure est déjà passée, on ignore
    // ce jour et on continue à chercher plus loin dans la semaine.
    if (decalage === 0 && dateLive.getTime() < maintenant.getTime()) continue;

    return {
      jour: jourPlanning.jour,
      heure: jourPlanning.heure ?? "",
      jeu: jourPlanning.jeu ?? LABEL_GENERIQUE,
      estAujourdhui: decalage === 0,
    };
  }

  return null;
}
