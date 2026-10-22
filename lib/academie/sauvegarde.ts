// Sauvegarde temporaire du prototype dans le navigateur
// (localStorage). Rien n'est envoyé au serveur, et rien n'est relié
// à l'économie réelle de Cycylive.

import type { MaisonId, Personnage } from "@/data/academie/types";
import type { ReponsesCeremonie } from "./ceremonie";
import type { EtatScene } from "./moteur";

const CLE = "cycylive:academie-des-astres:demo";
const VERSION = 1;

export type Etape = "accueil" | "creation" | "ceremonie" | "revelation" | "scene" | "synthese";

export type Sauvegarde = {
  version: number;
  etape: Etape;
  etapeCreation: number;
  personnage: Personnage;
  reponsesCeremonie: ReponsesCeremonie;
  questionCeremonie: number;
  maison: MaisonId | null;
  scene: EtatScene | null;
  reglages: { texteInstantane: boolean };
};

export function charger(): Sauvegarde | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const donnees = JSON.parse(brut) as Sauvegarde;
    // Une sauvegarde d'une ancienne version du prototype est ignorée.
    return donnees.version === VERSION ? donnees : null;
  } catch {
    return null;
  }
}

export function enregistrer(s: Omit<Sauvegarde, "version">): void {
  try {
    window.localStorage.setItem(CLE, JSON.stringify({ ...s, version: VERSION }));
  } catch {
    // Stockage indisponible (navigation privée...) : le prototype
    // reste jouable, seule la reprise après rafraîchissement est perdue.
  }
}

export function effacer(): void {
  try {
    window.localStorage.removeItem(CLE);
  } catch {}
}
