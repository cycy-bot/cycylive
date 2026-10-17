import type { Metadata } from "next";
import CoffresScelles from "@/components/arcade/CoffresScelles";
import EnteteJeu from "@/components/arcade/EnteteJeu";
import AutresJeux from "@/components/arcade/AutresJeux";
import { jeuParId } from "@/lib/jeux";

export const metadata: Metadata = {
  title: "Les 3 coffres scellés | Jeux Cycylive",
  description: "Trois coffres, un gros lot : choisis, CycyBot en ouvre un, puis garde ou change. Ton trésor (Éclats, boosters, fragments…) se récupère sur le Discord Cycylive.",
  alternates: { canonical: "/jeux/coffres" },
  openGraph: { title: "Les 3 coffres scellés | Cycylive", description: "Une partie par jour, un trésor sur le Discord.", url: "/jeux/coffres" },
};

export default function CoffresPage() {
  return (
    <>
      <EnteteJeu jeu={jeuParId("coffres")!} />
      <CoffresScelles />
      <AutresJeux actuel="coffres" />
    </>
  );
}
