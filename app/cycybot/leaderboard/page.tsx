import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import { lireClassement } from "@/lib/cycybot";
import AccentCosmique from "@/components/AccentCosmique";
import LeaderboardCycyBot from "@/components/LeaderboardCycyBot";

export const metadata: Metadata = {
  title: "Leaderboard des Cycyliens | Cycylive",
  description:
    "Le classement des Cycyliens : messages, présence en live, séries de lives, bits et subs offerts, par semaine, mois ou depuis toujours.",
  alternates: { canonical: "/cycybot/leaderboard" },
  openGraph: {
    title: "Leaderboard des Cycyliens | Cycylive",
    description: "Qui écrit le plus, qui ne rate aucun live, qui fait pleuvoir les bits : découvre le podium.",
    url: "/cycybot/leaderboard",
  },
};

export const revalidate = 60;

export default async function LeaderboardPage() {
  const initial = await lireClassement("messages", "global");

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />

      <EntetePage
        retour={{ href: "/cycybot", label: "Cycy_Bot" }}
        surtitre="Leaderboard" icone="trophee"
        titre="Les Cycyliens à l'honneur"
        intro={<>Ceux qui font vivre la galaxie, live après live. Tape <code className="text-lilac">!top</code> dans le chat pour retrouver cette page à tout moment.</>}
      />

      <LeaderboardCycyBot initial={initial} />
    </div>
  );
}
