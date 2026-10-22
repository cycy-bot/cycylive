import type { Metadata } from "next";
import CosmoCapsules from "@/components/arcade/CosmoCapsules";
import EnteteJeu from "@/components/arcade/EnteteJeu";
import AutresJeux from "@/components/arcade/AutresJeux";
import { jeuParId } from "@/lib/jeux";

export const metadata: Metadata = {
  title: "Cosmo-Capsules | Jeux Cycylive",
  description: "La machine gatchapon kawaii de la galaxie Cycylive : une capsule par jour, une figurine à collectionner (24 Cosmo-Copains) et un cadeau sur le Discord : boosters de Cartes Astrales, Éclats, fragments…",
  alternates: { canonical: "/jeux/capsules" },
  openGraph: { title: "Cosmo-Capsules | Cycylive", description: "Une capsule par jour, une figurine et un cadeau sur le Discord.", url: "/jeux/capsules" },
};

export default function CapsulesPage() {
  return (
    <>
      <EnteteJeu jeu={jeuParId("capsules")!} />
      <CosmoCapsules />
      <AutresJeux actuel="capsules" />
    </>
  );
}
