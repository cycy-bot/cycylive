import type { Metadata } from "next";
import SalleArcade from "@/components/arcade/SalleArcade";

export const metadata: Metadata = {
  title: "Jeux · Salle d'arcade | Cycylive",
  description:
    "Cinq mini-jeux gratuits : réflexes Valorant, rythme cosmique, puzzle des constellations, memory galactique et quiz. Chacun a son tableau des records, sans compte.",
  alternates: { canonical: "/jeux/arcade" },
  openGraph: { title: "Salle d'arcade | Cycylive", description: "Cinq mini-jeux et leurs tableaux des records.", url: "/jeux/arcade" },
};

export default function ArcadePage() {
  return <SalleArcade />;
}
