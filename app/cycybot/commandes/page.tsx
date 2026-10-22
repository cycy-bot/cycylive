import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import { lireCycyBot, commandesSecours } from "@/lib/cycybot";
import AccentCosmique from "@/components/AccentCosmique";
import CommandesCycyBot from "@/components/CommandesCycyBot";

export const metadata: Metadata = {
  title: "Commandes de Cycy_Bot | Cycylive",
  description: "Toutes les commandes de Cycy_Bot : le chat Twitch de Cycylive et le Discord (passeport, jeux, Cartes Astrales, figurines Cosmo-Capsules, Éclats, expéditions, Marché noir, musique…).",
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

      {!donnees && (
        <p className="mb-6 rounded-2xl border border-violet/20 bg-violet/10 px-5 py-3 text-sm text-ink-soft" role="status">
          Cycy_Bot ne répond pas en ce moment : voici la liste habituelle de ses commandes. Pendant un live, tape{" "}
          <code className="text-lilac">!commandes</code> dans le chat pour la liste à jour.
        </p>
      )}
      <CommandesCycyBot
        toutLeMonde={donnees?.commands.everyone?.length ? donnees.commands.everyone : commandesSecours.everyone}
        groupesTwitch={donnees?.commands.groups?.length ? donnees.commands.groups : commandesSecours.groups}
        discord={donnees?.discord?.commands?.length ? donnees.discord.commands : commandesSecours.discord}
      />
    </div>
  );
}
