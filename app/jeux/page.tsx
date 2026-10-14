import type { Metadata } from "next";
import BorneArcade from "@/components/arcade/BorneArcade";
import ClassementArcade from "@/components/arcade/ClassementArcade";

export const metadata: Metadata = {
  title: "Jeux · Cycy Runner | Cycylive",
  description:
    "Fais courir CycyBot sur sa planète, évite les astéroïdes et les comètes, et inscris ton pseudo au tableau des records. Sans compte, essais illimités.",
  alternates: { canonical: "/jeux" },
  openGraph: { title: "Cycy Runner | Cycylive", description: "Bats ton record et inscris ton pseudo au classement.", url: "/jeux" },
};

export default function RunnerPage() {
  return (
    <div className="space-y-6">
      <BorneArcade />
      <ClassementArcade />
    </div>
  );
}
