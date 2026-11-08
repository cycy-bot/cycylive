// Bande de chiffres de l'accueil, sur une seule ligne de petits carrés : Twitch (followers, viewers, classement, subs, bits),
// Discord (membres), heures de live, TikTok (abonnés, likes) et YouTube. Seuls les chiffres disponibles s'affichent.
// Sur téléphone et tablette, la ligne défile au doigt.
import Link from "next/link";
import { liens } from "@/data/liens";
import { obtenirNombreFollowers, estConnecteeATwitch } from "@/lib/twitchOAuth";
import { obtenirStatsDiscord } from "@/lib/discordStats";
import { statsTwitchTracker } from "@/lib/twitchTracker";
import { IconTwitch, IconDiscord, IconEye, IconTrophy, IconClock, IconArrowRight, IconTikTok, IconYouTube } from "@/components/Icons";
import Icone from "@/components/icones/Icone";
import { lireCycyBot } from "@/lib/cycybot";

type Stat = { icon: (p: { className?: string }) => React.ReactNode; valeur: string; label: string; detail?: string; teinte: string };

const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";
const nf = (n: number) => n.toLocaleString("fr-FR");

export default async function StatsRapides() {
  const [connecte, discord, tracker, bot] = await Promise.all([
    estConnecteeATwitch().catch(() => false),
    obtenirStatsDiscord().catch(() => null),
    statsTwitchTracker(chaine).catch(() => null),
    lireCycyBot().catch(() => null),
  ]);
  const ch = bot?.chiffres ?? null, tw = ch?.twitch;
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
  if (tw?.subs) stats.push({ icon: ({ className }) => <Icone nom="etoile" className={className} />, valeur: nf(tw.subs), label: "Subs", detail: tw.subsOfferts ? `dont ${nf(tw.subsOfferts)} offerts` : undefined, teinte: "text-fuchsia-300 bg-fuchsia-400/15" });
  if (tw?.bits) stats.push({ icon: ({ className }) => <Icone nom="diamant" className={className} />, valeur: nf(tw.bits), label: "Bits", detail: "30 derniers jours", teinte: "text-cyan-300 bg-cyan-400/15" });
  if (tracker?.heuresStreamees) stats.push({ icon: IconClock, valeur: `${nf(tracker.heuresStreamees)} h`, label: "De live", detail: "30 derniers jours", teinte: "text-emerald-300 bg-emerald-400/15" });

  if (ch?.tiktok?.abonnes) stats.push({ icon: IconTikTok, valeur: nf(ch.tiktok.abonnes), label: "Abonnés TikTok", teinte: "text-pink-300 bg-pink-400/15" });
  if (ch?.tiktok?.likes) stats.push({ icon: ({ className }) => <Icone nom="coeur" className={className} />, valeur: nf(ch.tiktok.likes), label: "Likes TikTok", teinte: "text-rose-300 bg-rose-400/15" });
  if (ch?.youtube?.abonnes) stats.push({ icon: IconYouTube, valeur: nf(ch.youtube.abonnes), label: "Abonnés YouTube", teinte: "text-red-300 bg-red-400/15" });

  if (stats.length === 0) return null;

  return (
    <section aria-label="La chaîne en chiffres" className="mx-auto max-w-6xl px-5 md:px-8 py-6">
      <div className="-mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-flow-col lg:auto-cols-fr lg:overflow-visible lg:px-0 lg:pb-0">
        {stats.map((s) => (
          <div key={s.label} className="carte-holo flex w-[124px] shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-center lg:w-auto lg:min-h-[124px]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.teinte}`}>
              <s.icon className="w-[18px] h-[18px]" />
            </span>
            <p className="font-display text-lg font-semibold leading-tight text-ink tabular-nums">{s.valeur}</p>
            <p className="text-[11px] leading-tight text-ink-soft">{s.label}</p>
            {s.detail && <p className="text-[10px] leading-tight text-ink-soft/55">{s.detail}</p>}
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
