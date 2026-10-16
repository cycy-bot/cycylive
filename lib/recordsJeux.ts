// Record actuel de chaque jeu de la salle d'arcade (pour les cartes de la vitrine).
import { lireClassement } from "@/lib/arcadeStore";
import { JEUX_ARCADE } from "@/lib/arcadeRegles";
import type { RecordJeu } from "@/components/arcade/CarteJeu";

export async function lireRecords(): Promise<Record<string, RecordJeu>> {
  const out: Record<string, RecordJeu> = {};
  await Promise.all(
    JEUX_ARCADE.map(async (jeu) => {
      try {
        const top = await lireClassement(1, jeu);
        out[jeu] = top && top[0] ? { nom: top[0].nom, score: top[0].score } : null;
      } catch {
        out[jeu] = null;
      }
    })
  );
  return out;
}
