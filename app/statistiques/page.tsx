import type { Metadata } from "next";
import { liens } from "@/data/liens";
import { obtenirNombreFollowers, estConnecteeATwitch } from "@/lib/twitchOAuth";
import AccentCosmique from "@/components/AccentCosmique";
import DiscordEnLigne from "@/components/DiscordEnLigne";
import AnnoncesDiscord from "@/components/AnnoncesDiscord";
import { IconTwitch } from "@/components/Icons";

function extraireChannelTwitch(url: string): string {
  const correspondance = url.match(/twitch\.tv\/([^/]+)/);
  return correspondance ? correspondance[1] : "cycylive";
}

export const metadata: Metadata = {
  title: "Statistiques | Cycylive",
  description:
    "Un aperçu en direct de l'activité de Cycylive : followers, communauté et plus.",
  alternates: { canonical: "/statistiques" },
  openGraph: {
    title: "Statistiques | Cycylive",
    description:
      "Un aperçu en direct de l'activité de Cycylive : followers, communauté et plus.",
    url: "/statistiques",
  },
};

export default async function StatistiquesPage() {
  const connecte = await estConnecteeATwitch();
  const followers = connecte ? await obtenirNombreFollowers() : null;
  const channel = extraireChannelTwitch(liens.twitch);

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        Statistiques
      </h1>
      <p className="text-ink-soft leading-relaxed mb-10 max-w-2xl">
        Un aperçu en direct de l'activité de Cycylive.
      </p>

      <div className="carte-holo rounded-2xl p-6 border border-violet/12 mb-6">
        <IconTwitch className="w-6 h-6 text-violet-light mb-3" />
        <p className="text-3xl font-semibold text-ink">
          {followers ? followers.toLocaleString("fr-FR") : "—"}
        </p>
        <p className="text-ink-soft text-sm mt-1">Followers Twitch</p>
      </div>

      <div className="mb-6">
        <DiscordEnLigne />
      </div>

      <div className="mb-10">
        <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">
          Dernières annonces Discord
        </p>
        <AnnoncesDiscord limite={5} />
      </div>

      <div className="carte-holo rounded-2xl p-6 border border-violet/12">
        <h2 className="text-ink font-medium mb-2">Statistiques Twitch complètes</h2>
        <p className="text-ink-soft text-sm mb-4 leading-relaxed">
          Heures streamées, pic et moyenne de viewers, évolution dans le
          temps : retrouve un historique détaillé et à jour sur
          TwitchTracker.
        </p>
        <a
          href={`https://twitchtracker.com/${channel}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full px-5 py-2.5 border border-violet/40 bg-violet/10 text-ink text-sm font-medium hover:bg-violet/20 transition-all"
        >
          Voir sur TwitchTracker
        </a>
      </div>
    </div>
  );
}
