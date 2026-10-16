// Bande de chiffres de l'accueil, sur une seule ligne : Twitch (followers, viewers, classement),
// Discord (membres, en ligne) et heures de live. Seuls les chiffres disponibles s'affichent.
import Link from "next/link";
import { liens } from "@/data/liens";
import { obtenirNombreFollowers, estConnecteeATwitch } from "@/lib/twitchOAuth";
import { obtenirStatsDiscord } from "@/lib/discordStats";
import { statsTwitchTracker } from "@/lib/twitchTracker";
import { IconTwitch, IconDiscord, IconEye, IconTrophy, IconClock, IconArrowRight } from "@/components/Icons";

type Stat = { icon: typeof IconTwitch; valeur: string; label: string; detail?: string; teinte: string };

const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";
const nf = (n: number) => n.toLocaleString("fr-FR");

export default async function StatsRapides() {
  const [connecte, discord, tracker] = await Promise.all([
    estConnecteeATwitch().catch(() => false),
    obtenirStatsDiscord().catch(() => null),
    statsTwitchTracker(chaine).catch(() => null),
  ]);
  const followers = (connecte ? await obtenirNombreFollowers().catch(() => null) : null) ?? tracker?.followersTotal ?? null;

  const stats: Stat[] = [];
  if (followers) stats.push({ icon: IconTwitch, valeur: nf(followers), label: "Followers Twitch", teinte: "text-violet-light bg-violet/15" });
  if (tracker?.moyenneViewers) stats.push({ icon: IconEye, valeur: nf(Math.round(tracker.moyenneViewers)), label: "Viewers en moyenne", detail: "30 derniers jours", teinte: "text-sky-300 bg-sky-400/15" });
  if (tracker?.rangFr || tracker?.rangMondial)
    stats.push({
      icon: IconTrophy,
      valeur: `#${nf((tracker.rangFr || tracker.rangMondial)!)}`,
      label: tracker.rangFr ? "Classement FR" : "Classement Twitch",
      detail: tracker.rangFr ? "chaînes francophones" : "mondial",
      teinte: "text-amber-300 bg-amber-300/15",
    });
  if (discord?.totalMembres || discord?.enLigne)
    stats.push({
      icon: IconDiscord,
      valeur: nf((discord.totalMembres || discord.enLigne)!),
      label: discord.totalMembres ? "Membres Discord" : "En ligne sur Discord",
      detail: discord.totalMembres && discord.enLigne ? `dont ${nf(discord.enLigne)} en ligne` : undefined,
      teinte: "text-indigo-300 bg-indigo-400/15",
    });
  if (tracker?.heuresStreamees) stats.push({ icon: IconClock, valeur: `${nf(tracker.heuresStreamees)} h`, label: "De live", detail: "30 derniers jours", teinte: "text-emerald-300 bg-emerald-400/15" });

  if (stats.length === 0) return null;

  const colonnes = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-2 lg:grid-cols-4", "sm:grid-cols-3 lg:grid-cols-5"][stats.length];

  return (
    <section aria-label="La chaîne en chiffres" className="mx-auto max-w-6xl px-5 md:px-8 py-6">
      <div className={`grid grid-cols-2 gap-3 ${colonnes}`}>
        {stats.map((s) => (
          <div key={s.label} className="carte-holo flex flex-col items-start gap-2 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center sm:gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.teinte}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-semibold leading-tight text-ink tabular-nums">{s.valeur}</p>
              <p className="text-xs leading-snug text-ink-soft">{s.label}</p>
              {s.detail && <p className="text-[11px] leading-snug text-ink-soft/55">{s.detail}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Link href="/statistiques" className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-light hover:text-lilac transition-colors">
          Toutes les statistiques <IconArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
