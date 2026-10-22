import type { Metadata } from "next";
import VitrineJeux from "@/components/arcade/VitrineJeux";
import RedirectionAncre from "@/components/arcade/RedirectionAncre";
import { lireRecords } from "@/lib/recordsJeux";

export const metadata: Metadata = {
  title: "Jeux | Cycylive",
  description:
    "Les jeux gratuits de Cycylive : Cycy Runner, Astro Dodge, Star Catcher, CycyWord (le mot du jour), réflexes Valorant, rythme cosmique, constellations, memory et quiz avec leurs records, plus le ticket à gratter, le compagnon et les 3 coffres scellés qui font gagner des récompenses sur le Discord.",
  alternates: { canonical: "/jeux" },
  openGraph: { title: "Les jeux de Cycylive", description: "Neuf jeux à records et trois récompenses du jour pour le Discord.", url: "/jeux" },
};

export const revalidate = 60;

export default async function JeuxPage() {
  const records = await lireRecords().catch(() => ({}));
  return (
    <>
      <RedirectionAncre />
      <VitrineJeux records={records} />
    </>
  );
}
