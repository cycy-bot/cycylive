import type { Metadata } from "next";
import BorneArcade from "@/components/arcade/BorneArcade";
import ClassementArcade from "@/components/arcade/ClassementArcade";
import EnteteJeu from "@/components/arcade/EnteteJeu";
import AutresJeux from "@/components/arcade/AutresJeux";
import { jeuParId } from "@/lib/jeux";

export const metadata: Metadata = {
  title: "Cycy Runner | Jeux Cycylive",
  description:
    "Fais courir CycyBot sur sa planète, évite les astéroïdes et les comètes, et inscris ton pseudo au tableau des records. Sans compte, essais illimités.",
  alternates: { canonical: "/jeux/runner" },
  openGraph: { title: "Cycy Runner | Cycylive", description: "Bats ton record et inscris ton pseudo au classement.", url: "/jeux/runner" },
};

export default function RunnerPage() {
  const jeu = jeuParId("runner")!;
  return (
    <>
      <EnteteJeu jeu={jeu} />
      <div className="flex flex-col gap-6">
        <BorneArcade />
        <ClassementArcade jeu="runner" titre="Records · Cycy Runner" />
      </div>
      <AutresJeux actuel="runner" />
    </>
  );
}
