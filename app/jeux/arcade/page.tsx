import type { Metadata } from "next";
import VitrineJeux from "@/components/arcade/VitrineJeux";
import RedirectionAncre from "@/components/arcade/RedirectionAncre";
import { lireRecords } from "@/lib/recordsJeux";

// Ancienne adresse de la salle d'arcade (/jeux/arcade#reflexes…) : on ouvre le bon jeu, sinon la vitrine.
export const metadata: Metadata = {
  title: "Salle d'arcade | Cycylive",
  description: "Neuf jeux gratuits et leurs tableaux des records : Cycy Runner, Astro Dodge, Star Catcher, CycyWord, réflexes Valorant, rythme cosmique, constellations, memory et quiz.",
  alternates: { canonical: "/jeux" },
};

export const revalidate = 60;

export default async function ArcadePage() {
  const records = await lireRecords().catch(() => ({}));
  return (
    <>
      <RedirectionAncre />
      <VitrineJeux records={records} />
    </>
  );
}
