import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import { lireCycyBot } from "@/lib/cycybot";
import AccentCosmique from "@/components/AccentCosmique";
import CommandesCycyBot from "@/components/CommandesCycyBot";

export const metadata: Metadata = {
  title: "Commandes de Cycy_Bot | Cycylive",
  description: "Toutes les commandes de Cycy_Bot : le chat Twitch de Cycylive et le Discord (passeport, jeux, Cartes Astrales, Éclats, expéditions, Marché noir, musique…).",
  alternates: { canonical: "/cycybot/commandes" },
  openGraph: {
    title: "Commandes de Cycy_Bot | Cycylive",
    description: "Toutes les commandes de Cycy_Bot, sur Twitch et sur Discord.",
    url: "/cycybot/commandes",
  },
};

export const revalidate = 60;

export default async function CommandesPage() {
  const donnees = await lireCycyBot();

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="fusee" />

      <EntetePage
        retour={{ href: "/cycybot", label: "Cycy_Bot" }}
        surtitre="Commandes" icone="clavier"
        titre="Les commandes de Cycy_Bot"
        intro="Dans le chat Twitch pendant les lives, et sur le Discord tout le temps. Cette liste se met à jour automatiquement avec Cycy_Bot."
      />

      {donnees ? (
        <CommandesCycyBot toutLeMonde={donnees.commands.everyone} groupesTwitch={donnees.commands.groups ?? []} discord={donnees.discord?.commands ?? []} />
      ) : (
        <p className="carte-holo rounded-2xl p-6 text-ink-soft">
          Cycy_Bot fait une petite pause technique, la liste revient dans un instant. En attendant, tape{" "}
          <code className="text-lilac">!commandes</code> dans le chat Twitch.
        </p>
      )}
    </div>
  );
}
