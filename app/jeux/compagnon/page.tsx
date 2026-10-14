import type { Metadata } from "next";
import Compagnon from "@/components/arcade/Compagnon";

export const metadata: Metadata = {
  title: "Jeux · Compagnon galactique | Cycylive",
  description:
    "Choisis ta créature de l'espace, fais éclore son œuf, nourris-la, lave-la et câline-la : une fois les quêtes du jour terminées, récupère ta récompense sur le Discord.",
  alternates: { canonical: "/jeux/compagnon" },
  openGraph: { title: "Compagnon galactique | Cycylive", description: "Ta créature de l'espace à chouchouter chaque jour.", url: "/jeux/compagnon" },
};

export default function CompagnonPage() {
  return <Compagnon />;
}
