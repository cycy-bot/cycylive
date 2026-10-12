import type { Metadata } from "next";
import AccentCosmique from "@/components/AccentCosmique";
import BorneArcade from "@/components/arcade/BorneArcade";
import ClassementArcade from "@/components/arcade/ClassementArcade";

export const metadata: Metadata = {
  title: "Borne d'arcade · Cycy Runner | Cycylive",
  description:
    "Fais courir CycyBot sur sa planète, évite les astéroïdes et les comètes, et inscris ton pseudo au tableau des records. Sans compte, essais illimités.",
  alternates: { canonical: "/arcade" },
  openGraph: {
    title: "Borne d'arcade · Cycy Runner | Cycylive",
    description: "Le mini-jeu de Cycylive : bats le record et inscris ton pseudo au classement.",
    url: "/arcade",
  },
};

export default function ArcadePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="planete" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-3">Borne d&apos;arcade</h1>
      <p className="text-ink-soft leading-relaxed mb-8 max-w-2xl">
        <strong className="text-ink">Cycy Runner</strong> : aide CycyBot à traverser sa planète. Saute par-dessus les astéroïdes et
        les cristaux, baisse-toi sous les comètes… et ça accélère ! Pas de compte : à la fin de ta partie, entre ton pseudo pour
        inscrire ton record. Essais illimités.
      </p>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <BorneArcade />
        <ClassementArcade />
      </div>
    </div>
  );
}
