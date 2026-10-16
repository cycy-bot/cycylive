import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JeuSalle from "@/components/arcade/JeuSalle";
import ClassementArcade from "@/components/arcade/ClassementArcade";
import EnteteJeu from "@/components/arcade/EnteteJeu";
import AutresJeux from "@/components/arcade/AutresJeux";
import { JEUX_SALLE, type JeuSalle as IdJeu } from "@/lib/arcadeRegles";
import { jeuParId } from "@/lib/jeux";

const estJeuSalle = (j: string): j is IdJeu => j in JEUX_SALLE;

export function generateStaticParams() {
  return Object.keys(JEUX_SALLE).map((jeu) => ({ jeu }));
}
export const dynamicParams = false;

export function generateMetadata({ params }: { params: { jeu: string } }): Metadata {
  const fiche = jeuParId(params.jeu);
  if (!fiche) return {};
  return {
    title: `${fiche.nom} | Jeux Cycylive`,
    description: `${fiche.description} Gratuit, sans compte, avec un tableau des records.`,
    alternates: { canonical: `/jeux/arcade/${params.jeu}` },
    openGraph: { title: `${fiche.nom} | Cycylive`, description: fiche.accroche, url: `/jeux/arcade/${params.jeu}` },
  };
}

export default function PageJeuSalle({ params }: { params: { jeu: string } }) {
  if (!estJeuSalle(params.jeu)) notFound();
  const fiche = jeuParId(params.jeu)!;
  const jeu = params.jeu;
  return (
    <>
      <EnteteJeu jeu={fiche} />
      <div className="flex flex-col gap-6">
        <JeuSalle jeu={jeu} />
        <ClassementArcade jeu={jeu} titre={`🏆 Records · ${fiche.emoji} ${fiche.nom}`} />
      </div>
      <AutresJeux actuel={jeu} />
    </>
  );
}
