import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />

      <Link href="/cycybot" className="text-sm text-ink-soft hover:text-ink transition-colors">
        ‹ Cycy_Bot
      </Link>
      <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mt-3 mb-3">
        Leaderboard
      </h1>
      <p className="text-ink-soft text-lg mb-10 max-w-2xl">
        Les Cycyliens qui font vivre la galaxie. Tape <code className="text-lilac">!top</code> dans le chat pour
        retrouver cette page à tout moment.
      </p>

      <LeaderboardCycyBot initial={initial} />
    </div>
  );
}
