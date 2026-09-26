import type { Metadata } from "next";
import Link from "next/link";
import { lireCycyBot } from "@/lib/cycybot";
import AccentCosmique from "@/components/AccentCosmique";
import CommandesCycyBot from "@/components/CommandesCycyBot";

export const metadata: Metadata = {
  title: "Commandes de Cycy_Bot | Cycylive",
  description: "Toutes les commandes de Cycy_Bot à taper dans le chat Twitch de Cycylive.",
  alternates: { canonical: "/cycybot/commandes" },
  openGraph: {
    title: "Commandes de Cycy_Bot | Cycylive",
    description: "Toutes les commandes de Cycy_Bot à taper dans le chat Twitch de Cycylive.",
    url: "/cycybot/commandes",
  },
};

export const revalidate = 60;

export default async function CommandesPage() {
  const donnees = await lireCycyBot();

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="fusee" />

      <Link href="/cycybot" className="text-sm text-ink-soft hover:text-ink transition-colors">
        ‹ Cycy_Bot
      </Link>
      <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mt-3 mb-3">
        Commandes
      </h1>
      <p className="text-ink-soft text-lg mb-10 max-w-2xl">
        À taper dans le chat Twitch pendant les lives. Les éléments entre crochets sont facultatifs, et cette liste
        se met à jour automatiquement.
      </p>

      {donnees ? (
        <CommandesCycyBot toutLeMonde={donnees.commands.everyone} />
      ) : (
        <p className="carte-holo rounded-2xl p-6 text-ink-soft">
          Cycy_Bot fait une petite pause technique, la liste revient dans un instant. En attendant, tape{" "}
          <code className="text-lilac">!commandes</code> dans le chat Twitch.
        </p>
      )}
    </div>
  );
}
