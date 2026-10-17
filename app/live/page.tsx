import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import AccentCosmique from "@/components/AccentCosmique";
import InterfaceLive from "@/components/live/InterfaceLive";

export const metadata: Metadata = {
  title: "Jouer pendant le live | Cycylive",
  description: "Pronostics, votes de strat, camps et réactions en direct : participe au live de Cycylive depuis ton téléphone ou ton ordi, sans spammer le chat.",
  alternates: { canonical: "/live" },
  openGraph: {
    title: "Jouer pendant le live | Cycylive",
    description: "Pronostics, votes, camps et réactions en direct pendant les lives de Cycylive.",
    url: "/live",
  },
};

export default function LivePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />
      <EntetePage
        surtitre="Pendant le live"
        icone="manette"
        titre="Joue avec le live"
        intro="Pronostique, vote la strat, choisis ton camp et réagis en direct : tout se met à jour en même temps que le live, sans noyer le chat."
      />
      <InterfaceLive />
    </div>
  );
}
