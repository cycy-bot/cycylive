import type { Metadata } from "next";
import Link from "next/link";
import { liens } from "@/data/liens";
import { obtenirNombreFollowers, estConnecteeATwitch } from "@/lib/twitchOAuth";
import { statsTwitchTracker } from "@/lib/twitchTracker";
import AccentCosmique from "@/components/AccentCosmique";
import DiscordEnLigne from "@/components/DiscordEnLigne";
import AnnoncesDiscord from "@/components/AnnoncesDiscord";
import { IconTwitch } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Statistiques | Cycylive",
  description: "Les chiffres de la chaîne Cycylive : followers, moyenne de viewers, classement Twitch mondial et francophone, heures de live et communauté Discord.",
  alternates: { canonical: "/statistiques" },
  openGraph: {
    title: "Statistiques | Cycylive",
    description: "Followers, viewers, classement Twitch et communauté : la progression de Cycylive.",
    url: "/statistiques",
  },
};

export const revalidate = 1800;

const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";
const nf = (n: number) => n.toLocaleString("fr-FR");

type Tuile = { e: string; v: string; l: string; d?: string; mise?: boolean };

export default async function StatistiquesPage() {
  const [connecte, tracker] = await Promise.all([estConnecteeATwitch().catch(() => false), statsTwitchTracker(chaine).catch(() => null)]);
  const followers = (connecte ? await obtenirNombreFollowers().catch(() => null) : null) ?? tracker?.followersTotal ?? null;

  const classements: Tuile[] = [
    ...(tracker?.rangFr ? [{ e: "🇫🇷", v: `#${nf(tracker.rangFr)}`, l: "Classement francophone", d: "parmi les chaînes Twitch en français", mise: true }] : []),
    ...(tracker?.rangMondial ? [{ e: "🌍", v: `#${nf(tracker.rangMondial)}`, l: "Classement mondial", d: "sur l'ensemble de Twitch", mise: true }] : []),
  ];
  const chiffres: Tuile[] = [
    ...(followers ? [{ e: "💜", v: nf(followers), l: "Followers Twitch", d: "en direct" }] : []),
    ...(tracker?.moyenneViewers ? [{ e: "👀", v: nf(Math.round(tracker.moyenneViewers)), l: "Viewers en moyenne", d: "sur les 30 derniers jours" }] : []),
    ...(tracker?.picViewers ? [{ e: "🚀", v: nf(tracker.picViewers), l: "Pic de viewers", d: "sur les 30 derniers jours" }] : []),
    ...(tracker?.heuresStreamees ? [{ e: "⏱️", v: `${nf(tracker.heuresStreamees)} h`, l: "De live", d: "sur les 30 derniers jours" }] : []),
    ...(tracker?.heuresRegardees ? [{ e: "📺", v: `${nf(Math.round(tracker.heuresRegardees))} h`, l: "Regardées par la commu", d: "sur les 30 derniers jours" }] : []),
    ...(tracker?.nouveauxFollowers ? [{ e: "✨", v: `+${nf(tracker.nouveauxFollowers)}`, l: "Nouveaux followers", d: "sur les 30 derniers jours" }] : []),
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow text-lilac mb-3">📊 Statistiques</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-ink glow-text leading-[1.15]">La chaîne en chiffres</h1>
        <p className="mt-4 text-lg text-ink-soft leading-relaxed">Chaque chiffre ici, c&apos;est grâce à vous. Voici où en est Cycylive, mis à jour automatiquement.</p>
      </header>

      {classements.length > 0 && (
        <div className={`grid gap-4 mb-4 ${classements.length > 1 ? "md:grid-cols-2" : ""}`}>
          {classements.map((t) => (
            <div key={t.l} className="relative overflow-hidden rounded-3xl border border-violet/40 p-6 md:p-7" style={{ background: "radial-gradient(ellipse 80% 90% at 100% 0%, rgba(161,92,255,.3), transparent 60%), #120d22" }}>
              <p className="text-sm text-ink-soft"><span aria-hidden className="mr-1.5">{t.e}</span>{t.l}</p>
              <p className="mt-2 font-display text-5xl md:text-6xl font-bold text-ink glow-text tabular-nums">{t.v}</p>
              <p className="mt-1 text-sm text-ink-soft/70">{t.d}</p>
            </div>
          ))}
        </div>
      )}

      {chiffres.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 mb-4">
          {chiffres.map((t) => (
            <div key={t.l} className="carte-holo rounded-2xl p-5">
              <span className="text-2xl" aria-hidden>{t.e}</span>
              <p className="mt-2 font-display text-3xl font-semibold text-ink tabular-nums">{t.v}</p>
              <p className="text-sm text-ink">{t.l}</p>
              {t.d && <p className="text-xs text-ink-soft/60">{t.d}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="carte-holo rounded-2xl p-6 text-ink-soft mb-4">Les chiffres reviennent dans un instant.</p>
      )}
      <p className="text-xs text-ink-soft/60 mb-12">
        Moyennes, pic et classements : source{" "}
        <a href={`https://twitchtracker.com/${chaine}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">TwitchTracker</a>
        {" "}(30 derniers jours) · followers : Twitch.
      </p>

      {/* Appel au soutien */}
      <section aria-labelledby="aider-titre" className="mb-12 rounded-3xl border border-violet/30 p-6 md:p-8" style={{ background: "linear-gradient(160deg, rgba(123,56,255,.22), rgba(13,10,23,.95) 70%)" }}>
        <h2 id="aider-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">💜 Fais grimper ces chiffres avec moi</h2>
        <p className="text-ink-soft max-w-2xl mb-6">
          Sur Twitch, la visibilité dépend directement de la communauté. Plus il y a de monde en live, plus la chaîne remonte dans la catégorie
          et dans les recommandations, et plus de nouvelles personnes découvrent Cycylive.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          {[
            ["👀", "Regarde les lives", "Même en fond : chaque viewer compte dans la moyenne et le classement."],
            ["💜", "Follow la chaîne", "Et active les notifications pour être là dès le début du live."],
            ["⭐", "Abonne-toi", "Avec Amazon Prime, ton sub du mois est gratuit : pense à l'utiliser !"],
          ].map(([e, t, d]) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <span className="text-2xl" aria-hidden>{e}</span>
              <h3 className="mt-2 font-semibold text-ink">{t}</h3>
              <p className="mt-0.5 text-sm text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={liens.twitch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm hover:bg-violet-light transition-all">
            <IconTwitch className="w-4 h-4" />
            Suivre la chaîne
          </a>
          <Link href="/soutenir" className="inline-flex items-center gap-2 rounded-full border border-violet/30 px-5 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink hover:bg-violet/10 transition-all">
            Toutes les façons de soutenir →
          </Link>
        </div>
      </section>

      {/* Discord */}
      <section aria-labelledby="discord-titre" className="mb-6">
        <h2 id="discord-titre" className="text-2xl font-semibold text-ink mb-4">🛸 La communauté Discord</h2>
        <div className="mb-6">
          <DiscordEnLigne />
        </div>
        <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">Dernières annonces</p>
        <AnnoncesDiscord limite={5} />
      </section>

      <div className="carte-holo mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
        <div className="max-w-xl">
          <h2 className="text-ink font-semibold mb-1">L&apos;historique complet</h2>
          <p className="text-ink-soft text-sm">Évolution des viewers, heures streamées, records : tout l&apos;historique détaillé est sur TwitchTracker.</p>
        </div>
        <a href={`https://twitchtracker.com/${chaine}`} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full px-5 py-2.5 border border-violet/40 bg-violet/10 text-ink text-sm font-medium hover:bg-violet/20 transition-all">
          Voir sur TwitchTracker ↗
        </a>
      </div>
    </div>
  );
}
