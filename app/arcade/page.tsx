import type { Metadata } from "next";
import AccentCosmique from "@/components/AccentCosmique";
import BorneArcade from "@/components/arcade/BorneArcade";
import ClassementArcade from "@/components/arcade/ClassementArcade";
import TicketAGratter from "@/components/arcade/TicketAGratter";
import OngletsArcade from "@/components/arcade/OngletsArcade";

export const metadata: Metadata = {
  title: "Borne d'arcade · Cycy Runner & ticket à gratter | Cycylive",
  description:
    "Fais courir CycyBot sur sa planète et inscris ton pseudo au tableau des records, puis gratte ton ticket galactique du jour pour gagner des récompenses sur le Discord.",
  alternates: { canonical: "/arcade" },
  openGraph: {
    title: "Borne d'arcade · Cycy Runner | Cycylive",
    description: "Le mini-jeu de Cycylive : bats le record et inscris ton pseudo au classement.",
    url: "/arcade",
  },
};

export default function ArcadePage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="planete" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-3">Borne d&apos;arcade</h1>
      <p className="text-ink-soft leading-relaxed mb-6 max-w-2xl">
        Deux jeux sans compte : <strong className="text-ink">Cycy Runner</strong>, où tu aides CycyBot à traverser sa planète (essais
        illimités, ton record au classement), et le <strong className="text-ink">ticket à gratter</strong> du jour, qui fait gagner des
        récompenses sur le Discord.
      </p>
      <OngletsArcade
        runner={
          /* Le jeu prend toute la largeur, le tableau des records est dessous */
          <div className="space-y-6">
            <BorneArcade />
            <ClassementArcade />
          </div>
        }
        gratter={<TicketAGratter />}
      />
    </div>
  );
}
