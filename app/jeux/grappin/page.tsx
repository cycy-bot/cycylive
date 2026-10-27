import type { Metadata } from "next";
import GrappinCosmique from "@/components/arcade/GrappinCosmique";
import EnteteJeu from "@/components/arcade/EnteteJeu";
import AutresJeux from "@/components/arcade/AutresJeux";
import { jeuParId } from "@/lib/jeux";

export const metadata: Metadata = {
  title: "Le Grappin cosmique | Jeux Cycylive",
  description: "Une machine à pinces néon remplie de peluches et d’objets mystère : 3 tirages par jour, au moins 1 booster garanti, des Éclats, des fragments… et peut-être le JACKPOT. Récompense ajoutée sur le Discord Cycylive.",
  alternates: { canonical: "/jeux/grappin" },
  openGraph: { title: "Le Grappin cosmique | Cycylive", description: "3 tirages par jour, un butin sur le Discord.", url: "/jeux/grappin" },
};

export default function GrappinPage() {
  return (
    <>
      <EnteteJeu jeu={jeuParId("grappin")!} />
      <GrappinCosmique />
      <AutresJeux actuel="grappin" />
    </>
  );
}
