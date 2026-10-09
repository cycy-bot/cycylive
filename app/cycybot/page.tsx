import type { Metadata } from "next";
import Link from "next/link";
import { liens } from "@/data/liens";
import { lireCycyBot } from "@/lib/cycybot";
import AccentCosmique from "@/components/AccentCosmique";
import ConsoleCycyBot from "@/components/ConsoleCycyBot";
import { IconDiscord, IconTwitch } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Cycy_Bot | Cycylive",
  description:
    "Cycy_Bot, le bot officiel de Cycylive : annonces, remerciements, commandes, prédictions, leaderboard et modération du chat Twitch.",
  alternates: { canonical: "/cycybot" },
  openGraph: {
    title: "Cycy_Bot | Cycylive",
    description: "Cycy_Bot, le bot officiel de Cycylive : il veille sur le chat pendant que Cycy essaie de viser.",
    url: "/cycybot",
  },
};

export const revalidate = 60;

const fonctions = [
  { emoji: "📡", titre: "Il annonce le live", texte: "Début, reprise, fin avec la durée, changement de jeu, et notification sur le Discord." },
  { emoji: "💜", titre: "Il remercie l'équipage", texte: "Follows, subs, resubs, subs offerts, raids et Hype Train, avec un message pour chaque moment." },
  { emoji: "🛰", titre: "Il répond aux commandes", texte: "Liens, rang Valorant, infos sur le jeu, temps de visionnage, ancienneté de follow et boule cosmique." },
  { emoji: "🔮", titre: "Il lance les prédictions", texte: "Les modos ouvrent des paris en points de chaîne directement depuis le chat, avec le résultat annoncé." },
  { emoji: "🏆", titre: "Il tient le classement", texte: "Messages, présence, séries de lives, bits et subs offerts : chaque Cycylien a sa place au leaderboard." },
  { emoji: "🛡", titre: "Il protège le chat", texte: "Mode lent après les gros raids, et une vingtaine d'outils pour que les modos agissent en un clin d'œil." },
];

const aEssayer = ["commandes", "followage", "watchtime", "8ball"];

export default async function CycyBotPage() {
  const donnees = await lireCycyBot();
  const enAvant = aEssayer
    .map((nom) => donnees?.commands.everyone.find((c) => c.name === nom))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="planete" />

      {/* Présentation + console animée */}
      <section className="grid md:grid-cols-[1fr_1.05fr] gap-10 md:gap-12 items-center mb-14">
        <div>
          <div className="relative w-28 h-28 mb-6">
            <span
              aria-hidden
              className="absolute -inset-3 rounded-full border border-lilac/25 rotate-[-18deg] scale-y-[0.42]"
            />
            {donnees?.bot.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={donnees.bot.avatar}
                alt="Avatar de Cycy_Bot"
                width={112}
                height={112}
                className="relative w-28 h-28 rounded-full object-cover shadow-glow ring-4 ring-void"
              />
            ) : (
              <span className="relative w-28 h-28 rounded-full bg-card flex items-center justify-center text-5xl shadow-glow">
                🤖
              </span>
            )}
          </div>

          {/* leading + pb : laisse la place aux jambages du « y » */}
          <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mb-4">
            Cycy_Bot
          </h1>
          <p className="text-ink-soft text-lg leading-relaxed mb-5 max-w-xl">
            {donnees?.bot.bio ||
              "Le bot officiel de Cycylive. Il veille sur le chat pendant que Cycy essaie de viser. 🎯"}
          </p>

          {donnees && (
            <p className="inline-flex items-center gap-2.5 text-sm text-ink-soft mb-7" role="status">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  donnees.live.isLive ? "bg-red-500 animate-pulse" : "bg-violet-light/50"
                }`}
              />
              {donnees.live.isLive
                ? `Cycylive est en direct${donnees.live.category ? ` sur ${donnees.live.category}` : ""}, Cycy_Bot est à son poste`
                : "Cycylive est hors ligne, Cycy_Bot reste en veille"}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/cycybot/commandes"
              className="rounded-full px-5 py-2.5 bg-violet text-white text-sm font-medium hover:bg-violet-light shadow-glow-sm transition-all"
            >
              Voir les commandes
            </Link>
            <Link
              href="/cycybot/leaderboard"
              className="rounded-full px-5 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 hover:text-ink transition-all"
            >
              🏆 Leaderboard
            </Link>
          </div>
        </div>

        {donnees?.transmission?.length ? (
          <ConsoleCycyBot lignes={donnees.transmission} />
        ) : (
          <div className="carte-holo rounded-2xl p-6 text-ink-soft text-sm">
            Cycy_Bot fait une petite pause technique. Il revient très vite dans le chat.
          </div>
        )}
      </section>

      {/* À essayer */}
      {enAvant.length > 0 && (
        <section className="mb-16" aria-labelledby="essayer-titre">
          <h2 id="essayer-titre" className="text-lg font-semibold text-ink mb-4">
            À essayer dans le chat
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {enAvant.map((c) => (
              <div key={c.name} className="carte-holo rounded-2xl p-4">
                <code className="inline-block rounded-lg bg-violet/15 px-2.5 py-1 font-display font-semibold text-lilac text-sm mb-2">
                  !{c.name}
                </code>
                <p className="text-sm text-ink-soft leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ce qu'il fait */}
      <section className="mb-16" aria-labelledby="fonctions-titre">
        <h2 id="fonctions-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
          Ce qu'il fait pendant les lives
        </h2>
        <p className="text-ink-soft mb-8 max-w-2xl">
          Il tourne en permanence, sur Twitch comme sur Discord, pour que Cycy puisse se concentrer sur son jeu.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fonctions.map((f) => (
            <div key={f.titre} className="carte-holo rounded-2xl p-5 hover:shadow-glow-sm transition-all">
              <span className="text-2xl" aria-hidden>
                {f.emoji}
              </span>
              <h3 className="text-ink font-semibold mt-3 mb-1.5">{f.titre}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{f.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Accès rapides */}
      <section className="grid md:grid-cols-2 gap-4 mb-16">
        <Link
          href="/cycybot/commandes"
          className="group carte-holo rounded-2xl p-6 hover:shadow-glow-sm transition-all"
        >
          <span className="text-3xl" aria-hidden>🛰</span>
          <h2 className="text-xl font-semibold text-ink mt-3 mb-1">Toutes les commandes</h2>
          <p className="text-sm text-ink-soft">
            {donnees ? `${donnees.commands.everyone.length} commandes à taper dans le chat, avec une recherche.` : "La liste complète, avec une recherche."}
          </p>
          <span className="inline-block mt-4 text-sm text-lilac group-hover:text-ink transition-colors">Voir la liste ›</span>
        </Link>
        <Link
          href="/cycybot/leaderboard"
          className="group carte-holo rounded-2xl p-6 hover:shadow-glow-sm transition-all"
        >
          <span className="text-3xl" aria-hidden>🏆</span>
          <h2 className="text-xl font-semibold text-ink mt-3 mb-1">Le leaderboard des Cycyliens</h2>
          <p className="text-sm text-ink-soft">
            Qui écrit le plus, qui ne rate aucun live, qui fait pleuvoir les bits : découvre le podium.
          </p>
          <span className="inline-block mt-4 text-sm text-lilac group-hover:text-ink transition-colors">Voir le classement ›</span>
        </Link>
      </section>

      {/* Discord */}
      <section className="carte-holo rounded-2xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold text-ink mb-1">Cycy_Bot est aussi sur le Discord</h2>
          <p className="text-ink-soft text-sm max-w-xl">
            Niveaux, quiz, duels, chasse aux étoiles et annonces de live : rejoins les Cycyliens pour le retrouver.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={liens.twitch}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 hover:text-ink transition-all"
          >
            <IconTwitch className="w-4 h-4" />
            Le voir en action
          </a>
          <a
            href={liens.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-violet text-white text-sm font-medium hover:bg-violet-light shadow-glow-sm transition-all"
          >
            <IconDiscord className="w-4 h-4" />
            Rejoindre le Discord
          </a>
        </div>
      </section>
    </div>
  );
}
