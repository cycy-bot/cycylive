import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import AccentCosmique from "@/components/AccentCosmique";
import Calendrier from "@/components/Calendrier";

export const metadata: Metadata = {
  title: "Calendrier | Cycylive",
  description:
    "Les lives, soirées PP Valorant, quiz, événements Discord et projets de la communauté Cycylive au même endroit, avec les résultats après chaque événement.",
  alternates: { canonical: "/calendrier" },
  openGraph: { title: "Calendrier | Cycylive", description: "Tous les lives et événements de la communauté, et leurs résultats.", url: "/calendrier" },
};

export default function CalendrierPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />
      <EntetePage
        surtitre="📅 Calendrier"
        titre="Calendrier de la communauté"
        className="mb-8"
        intro={<p>
        Les <strong className="text-ink">lives</strong>, les <strong className="text-ink">soirées PP Valorant</strong>, les{" "}
        <strong className="text-ink">quiz</strong>, les événements Discord et les projets de la commu, au même endroit. Inscris-toi
        sur Discord pour recevoir un rappel, et retrouve les résultats une fois l’événement terminé.
      </p>}
      />
      <Calendrier />
    </div>
  );
}
