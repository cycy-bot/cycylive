import type { Metadata } from "next";
import Link from "next/link";
import { liens } from "@/data/liens";
import { lireCycyBot, type DiscordCycyBot, type ObjetMarche } from "@/lib/cycybot";
import AccentCosmique from "@/components/AccentCosmique";
import ConsoleCycyBot from "@/components/ConsoleCycyBot";
import { IconDiscord, IconTwitch } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Cycy_Bot | Cycylive",
  description:
    "Cycy_Bot, le bot officiel de Cycylive sur Twitch et Discord : passeport galactique, jeux, Cartes Astrales, Éclats Stellaires, expéditions, Marché noir, prédictions et leaderboard.",
  alternates: { canonical: "/cycybot" },
  openGraph: {
    title: "Cycy_Bot | Cycylive",
    description:
      "Le bot officiel de Cycylive : il veille sur le chat Twitch et fait vivre toute une galaxie sur le Discord.",
    url: "/cycybot",
  },
};

export const revalidate = 60;

// ── Twitch ──────────────────────────────────────────────────
const fonctionsTwitch = [
  { emoji: "📡", titre: "Il annonce le live", texte: "Début, reprise, fin avec la durée, changement de jeu, et notification sur le Discord." },
  { emoji: "💜", titre: "Il remercie l'équipage", texte: "Follows, subs, resubs, subs offerts, raids et Hype Train, avec un message pour chaque moment." },
  { emoji: "🃏", titre: "Il lâche des cartes mystère", texte: "Pendant le live, une carte sauvage apparaît : tape !attraper, un gagnant est tiré au sort et la carte rejoint sa collection Discord." },
  { emoji: "🔮", titre: "Il lance les prédictions", texte: "En points de chaîne sur Twitch, ou en Éclats Stellaires sur le Discord, avec le résultat annoncé." },
  { emoji: "🏆", titre: "Il tient le classement", texte: "Messages, présence, séries de lives, bits et subs offerts : chaque Cycylien a sa place au leaderboard." },
  { emoji: "🛡", titre: "Il protège le chat", texte: "Mode lent après les gros raids, et une vingtaine d'outils pour que les modos agissent en un clin d'œil." },
];

const aEssayer = ["attraper", "eclats", "watchtime", "8ball"];

// ── Discord ─────────────────────────────────────────────────
type Bloc = { id: string; emoji: string; titre: string; texte: string; commandes: string[] };

const blocsDiscord: Bloc[] = [
  { id: "passeport", emoji: "🪪", titre: "Le passeport galactique", texte: "Ta carte d'identité de Cycylien : infos, rang, succès et tampons, avec plus de 30 thèmes à débloquer, des cadres, des titres et des effets de nom.", commandes: ["passeport", "rank", "leaderboard"] },
  { id: "jeux", emoji: "🎮", titre: "Des jeux chaque jour", texte: "Explorer la galaxie, chasser les étoiles, ouvrir un coffre, le quiz, le mot mystère, les duels et le défi galactique du jour : de quoi monter d'orbite.", commandes: ["jeux", "explorer", "quiz", "duel"] },
  { id: "cartes", emoji: "🃏", titre: "Les Cartes Astrales", texte: "Un vrai jeu de cartes à collectionner : un booster gratuit par jour, six raretés, des brillantes, des mythiques en dix exemplaires et des cartes à l'effigie de la commu.", commandes: ["booster", "collection", "fabriquer"] },
  { id: "succes", emoji: "🏅", titre: "Des succès à trois niveaux", texte: "Chaque succès monte jusqu'au niveau III : boosters, rôles « aguerri·e », thèmes Prestige et Légende, cartes Trophées… et le titre ultime de Maître des succès.", commandes: ["passeport"] },
  { id: "musique", emoji: "🎵", titre: "La musique en vocal", texte: "Colle un lien Spotify (titre, album ou playlist) et CycyBot le joue dans ton salon vocal, avec une file d'attente partagée.", commandes: ["jouer", "file", "volume"] },
  { id: "vocaux", emoji: "🔊", titre: "Des vocaux rien qu'à toi", texte: "Rejoins le salon de création et ton propre vocal apparaît : nom, limite, verrou, invités… tu gères tout, il disparaît quand il se vide.", commandes: ["vocal"] },
];

const blocsGalaxie: Bloc[] = [
  { id: "eclats", emoji: "✦", titre: "Les Éclats Stellaires", texte: "La monnaie de la galaxie. Elle se gagne en jouant, en attrapant des cartes, en regardant les lives, en réussissant des expéditions… Tes Points Stellaires, eux, restent ton XP.", commandes: ["eclats"] },
  { id: "expeditions", emoji: "🚀", titre: "Les expéditions spatiales", texte: "Monte un équipage jusqu'à quatre et pars en mission. Quand le radar détecte quelque chose, à vous de choisir : investiguer, continuer… ou tirer dessus.", commandes: ["expedition"] },
  { id: "marche", emoji: "🕶️", titre: "Le Marché Noir Astral", texte: "Nouvel arrivage chaque jour, raretés chaque semaine et un mystérieux objet clandestin. Thèmes, cadres, titres, boosters : jamais de cartes exclusives, elles se méritent.", commandes: ["marche"] },
  { id: "predictions", emoji: "🔮", titre: "Les prédictions", texte: "Pendant les lives, mise tes Éclats : « Cycy gagne la game ? », « Ace ce soir ? »… Le pot est partagé entre ceux qui ont vu juste.", commandes: [] },
  { id: "question", emoji: "💫", titre: "La question du jour", texte: "Chaque jour, une question à la commu. On vote avec un bouton, les résultats tombent le lendemain et restent dans les archives.", commandes: ["question"] },
  { id: "anomalies", emoji: "🌌", titre: "Les anomalies", texte: "Une à trois fois par semaine, sans prévenir : pluie de météores, distorsion temporelle, XP ×2, faille à cartes ou éclipse. Il faut être là.", commandes: [] },
  { id: "chronique", emoji: "📖", titre: "La Chronique CycyLive", texte: "Les grands moments de la commu deviennent des chapitres. Les présents reçoivent un tampon unique sur leur passeport, impossible à obtenir après coup.", commandes: ["chronique"] },
];

const nf = (n: number) => n.toLocaleString("fr-FR");
const etoiles = (n: number) => "⭐".repeat(Math.max(1, Math.min(5, n)));
const duree = (h: number) => (h >= 1 ? `${h.toLocaleString("fr-FR")} h` : `${Math.round(h * 60)} min`);
const dateFr = (iso: string) => iso.split("-").reverse().join("/");

function Pastilles({ noms }: { noms: string[] }) {
  if (!noms.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {noms.map((n) => (
        <code key={n} className="rounded-md bg-violet/15 px-2 py-0.5 text-xs font-display font-semibold text-lilac">
          /{n}
        </code>
      ))}
    </div>
  );
}

function CarteBloc({ bloc, children }: { bloc: Bloc; children?: React.ReactNode }) {
  return (
    <div id={bloc.id} className="carte-holo rounded-2xl p-5 hover:shadow-glow-sm transition-all scroll-mt-24 flex flex-col">
      <span className="text-2xl" aria-hidden>
        {bloc.emoji}
      </span>
      <h3 className="text-ink font-semibold mt-3 mb-1.5">{bloc.titre}</h3>
      <p className="text-sm text-ink-soft leading-relaxed">{bloc.texte}</p>
      {children}
      <div className="mt-auto">
        <Pastilles noms={bloc.commandes} />
      </div>
    </div>
  );
}

// Encarts « en direct » alimentés par le bot
function EnDirect({ d, id }: { d: DiscordCycyBot; id: string }) {
  if (id === "marche" && d.market && (d.market.daily.length || d.market.weekly.length)) {
    const ligne = (o: ObjetMarche) => (
      <li key={o.name} className="flex justify-between gap-3">
        <span className="truncate">
          {o.emoji} {o.name}
        </span>
        <span className="shrink-0 text-lilac">
          {nf(o.price)} {o.currency === "fragments" ? "🧩" : "✦"}
        </span>
      </li>
    );
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        <p className="uppercase tracking-wide text-ink-soft/50 mb-2">En vente en ce moment</p>
        <ul className="space-y-1">
          {d.market.daily.map(ligne)}
          {d.market.weekly.map(ligne)}
          {d.market.hasSecret && (
            <li className="flex justify-between gap-3">
              <span>🔒 Objet clandestin ???</span>
              <span className="text-lilac">?</span>
            </li>
          )}
        </ul>
      </div>
    );
  }
  if (id === "expeditions" && d.destinations.length) {
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        <p className="uppercase tracking-wide text-ink-soft/50 mb-2">Destinations du jour</p>
        <ul className="space-y-1">
          {d.destinations.map((x) => (
            <li key={x.name} className="flex justify-between gap-3">
              <span className="truncate">
                {x.emoji} {x.name}
              </span>
              <span className="shrink-0">
                {duree(x.hours)} · {etoiles(x.difficulty)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (id === "question" && (d.question || d.lastQuestion)) {
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        {d.question ? (
          <>
            <p className="uppercase tracking-wide text-ink-soft/50 mb-1.5">Aujourd&apos;hui</p>
            <p className="text-ink font-medium mb-1.5">{d.question.q}</p>
            <p>
              {d.question.options.join(" · ")} · {d.question.votes} vote{d.question.votes > 1 ? "s" : ""}
            </p>
          </>
        ) : null}
        {d.lastQuestion ? (
          <div className={d.question ? "mt-3 pt-3 border-t border-violet/10" : ""}>
            <p className="uppercase tracking-wide text-ink-soft/50 mb-1.5">Résultats de la dernière</p>
            <p className="text-ink font-medium mb-2">{d.lastQuestion.q}</p>
            {d.lastQuestion.options.map((o) => (
              <div key={o.label} className="mb-1.5">
                <div className="flex justify-between">
                  <span>{o.label}</span>
                  <span>{o.pct} %</span>
                </div>
                <div className="h-1.5 rounded-full bg-violet/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet to-lilac" style={{ width: `${o.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
  if (id === "anomalies" && d.anomaly) {
    return (
      <div className="mt-4 rounded-xl bg-red-500/10 border border-red-400/30 p-3 text-xs text-ink">
        ⚠️ Anomalie en cours : <strong>{d.anomaly.emoji} {d.anomaly.label}</strong>, file sur le Discord !
      </div>
    );
  }
  if (id === "chronique" && d.chapters.length) {
    return (
      <div className="mt-4 rounded-xl bg-void/60 border border-violet/15 p-3 text-xs text-ink-soft">
        <p className="uppercase tracking-wide text-ink-soft/50 mb-2">Derniers chapitres</p>
        <ul className="space-y-1">
          {d.chapters.slice(0, 4).map((c) => (
            <li key={c.num} className="flex justify-between gap-3">
              <span className="truncate">
                {String(c.num).padStart(3, "0")} · {c.emoji} {c.title}
              </span>
              <span className="shrink-0">{dateFr(c.date)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
}

export default async function CycyBotPage() {
  const donnees = await lireCycyBot();
  const discord = donnees?.discord ?? null;
  const enAvant = aEssayer
    .map((nom) => donnees?.commands.everyone.find((c) => c.name === nom))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const nbDiscord = discord ? discord.commands.reduce((n, g) => n + g.items.length, 0) : 0;
  const stats = discord
    ? [
        { v: discord.stats.cards, l: "Cartes Astrales à collectionner" },
        { v: discord.stats.collectors, l: "collectionneurs" },
        { v: discord.stats.boostersOpened, l: "boosters ouverts" },
        { v: discord.stats.eclatsCirculation, l: "Éclats en circulation" },
        { v: discord.stats.expeditions, l: "expéditions lancées" },
        { v: discord.stats.themes, l: "thèmes de passeport" },
      ].filter((s) => s.v > 0)
    : [];

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="planete" />

      {/* Présentation + console animée */}
      <section className="grid md:grid-cols-[1fr_1.05fr] gap-10 md:gap-12 items-center mb-12">
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
              "Le bot officiel de Cycylive. Il veille sur le chat Twitch pendant que Cycy essaie de viser, et fait vivre toute une galaxie sur le Discord. 🎯"}
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
            <a
              href="#discord"
              className="rounded-full px-5 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 hover:text-ink transition-all"
            >
              ✦ L&apos;univers Discord
            </a>
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

      {/* Chiffres en direct */}
      {stats.length > 0 && (
        <section aria-label="Cycy_Bot en chiffres" className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-16">
          {stats.map((s) => (
            <div key={s.l} className="carte-holo rounded-2xl px-4 py-3">
              <p className="font-display text-2xl font-semibold text-ink">{nf(s.v)}</p>
              <p className="text-xs text-ink-soft">{s.l}</p>
            </div>
          ))}
        </section>
      )}

      {discord?.anomaly && (
        <div className="mb-10 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-ink" role="status">
          ⚠️ <strong>Anomalie détectée sur le Discord :</strong> {discord.anomaly.emoji} {discord.anomaly.label}. Fonce en profiter !
        </div>
      )}

      {/* ── Twitch ── */}
      <section className="mb-16" aria-labelledby="twitch-titre">
        <p className="eyebrow mb-2 inline-flex items-center gap-2">
          <IconTwitch className="w-4 h-4" /> Sur Twitch
        </p>
        <h2 id="twitch-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
          Ce qu&apos;il fait pendant les lives
        </h2>
        <p className="text-ink-soft mb-8 max-w-2xl">
          Il tourne en permanence pour que Cycy puisse se concentrer sur son jeu.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fonctionsTwitch.map((f) => (
            <div key={f.titre} className="carte-holo rounded-2xl p-5 hover:shadow-glow-sm transition-all">
              <span className="text-2xl" aria-hidden>
                {f.emoji}
              </span>
              <h3 className="text-ink font-semibold mt-3 mb-1.5">{f.titre}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{f.texte}</p>
            </div>
          ))}
        </div>

        {enAvant.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-ink mt-10 mb-4">À essayer dans le chat</h3>
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
          </>
        )}
      </section>

      {/* ── Discord ── */}
      <section id="discord" className="mb-16 scroll-mt-24" aria-labelledby="discord-titre">
        <p className="eyebrow mb-2 inline-flex items-center gap-2">
          <IconDiscord className="w-4 h-4" /> Sur le Discord
        </p>
        <h2 id="discord-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
          Toute une galaxie à explorer
        </h2>
        <p className="text-ink-soft mb-8 max-w-2xl">
          Sur le serveur, Cycy_Bot devient ton copilote : chaque message, chaque partie et chaque live te fait progresser
          d&apos;orbite en orbite.
        </p>

        {/* Passeport en vitrine */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <figure className="carte-holo rounded-2xl p-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cycybot/passeport.jpg" alt="Exemple de passeport galactique avec un cadre holographique" width={1200} height={675} loading="lazy" className="w-full rounded-xl" />
            <figcaption className="px-2 py-2 text-xs text-ink-soft">Le passeport : infos, rang, thème, cadre, titre et effet de nom.</figcaption>
          </figure>
          <figure className="carte-holo rounded-2xl p-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cycybot/tampons.jpg" alt="Page Tampons du passeport avec les tampons de la Chronique" width={1200} height={675} loading="lazy" className="w-full rounded-xl" />
            <figcaption className="px-2 py-2 text-xs text-ink-soft">La page Tampons : les grands moments où tu étais là.</figcaption>
          </figure>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocsDiscord.map((b) => (
            <CarteBloc key={b.id} bloc={b} />
          ))}
        </div>

        {/* Cartes en vitrine */}
        <div className="mt-6 carte-holo rounded-2xl p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h3 className="text-ink font-semibold">Quelques Cartes Astrales</h3>
              <p className="text-sm text-ink-soft">Mythique, légendaire, épique… et les cartes Trophées, qu&apos;on ne gagne qu&apos;au niveau II d&apos;un succès.</p>
            </div>
            <Pastilles noms={["booster", "carte"]} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={`/images/cycybot/carte-${i}.webp`} alt="" width={360} height={504} loading="lazy" className="w-full" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Galaxie ── */}
      <section id="galaxie" className="mb-16 scroll-mt-24" aria-labelledby="galaxie-titre">
        <p className="eyebrow mb-2">✦ Nouveau</p>
        <h2 id="galaxie-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
          Éclats, expéditions &amp; Marché noir
        </h2>
        <p className="text-ink-soft mb-8 max-w-2xl">
          Une économie à part entière, avec des surprises toute la semaine. Les encarts ci-dessous sont mis à jour en
          direct par Cycy_Bot.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocsGalaxie.map((b) => (
            <CarteBloc key={b.id} bloc={b}>
              {discord && <EnDirect d={discord} id={b.id} />}
            </CarteBloc>
          ))}
        </div>
      </section>

      {/* ── Lier Twitch et Discord ── */}
      <section className="mb-16 carte-holo rounded-2xl p-6 md:p-8" aria-labelledby="lier-titre">
        <h2 id="lier-titre" className="text-xl font-semibold text-ink mb-1">Relie ton compte Twitch à Discord</h2>
        <p className="text-sm text-ink-soft mb-5 max-w-2xl">
          Les cartes attrapées en live et les Éclats gagnés en regardant arrivent alors directement dans ta collection.
        </p>
        <ol className="grid md:grid-cols-3 gap-3 text-sm text-ink-soft">
          <li className="rounded-xl bg-void/60 border border-violet/15 p-4">
            <span className="block font-display text-lilac font-semibold mb-1">1. Sur Discord</span>
            Tape <code className="text-lilac">/lier-twitch</code> : Cycy_Bot te donne un code secret.
          </li>
          <li className="rounded-xl bg-void/60 border border-violet/15 p-4">
            <span className="block font-display text-lilac font-semibold mb-1">2. Sur Twitch</span>
            Dans le chat du live, écris <code className="text-lilac">!lier TONCODE</code>.
          </li>
          <li className="rounded-xl bg-void/60 border border-violet/15 p-4">
            <span className="block font-display text-lilac font-semibold mb-1">3. C&apos;est tout</span>
            Les cartes déjà gagnées en attente te sont envoyées tout de suite.
          </li>
        </ol>
      </section>

      {/* Accès rapides */}
      <section className="grid md:grid-cols-2 gap-4 mb-16">
        <Link href="/cycybot/commandes" className="group carte-holo rounded-2xl p-6 hover:shadow-glow-sm transition-all">
          <span className="text-3xl" aria-hidden>🛰</span>
          <h2 className="text-xl font-semibold text-ink mt-3 mb-1">Toutes les commandes</h2>
          <p className="text-sm text-ink-soft">
            {donnees
              ? `${donnees.commands.everyone.length} commandes pour le chat Twitch${nbDiscord ? ` et ${nbDiscord} commandes Discord` : ""}, avec une recherche.`
              : "La liste complète, Twitch et Discord, avec une recherche."}
          </p>
          <span className="inline-block mt-4 text-sm text-lilac group-hover:text-ink transition-colors">Voir la liste ›</span>
        </Link>
        <Link href="/cycybot/leaderboard" className="group carte-holo rounded-2xl p-6 hover:shadow-glow-sm transition-all">
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
          <h2 className="text-xl font-semibold text-ink mb-1">Prêt·e à embarquer ?</h2>
          <p className="text-ink-soft text-sm max-w-xl">
            Rejoins les Cycyliens sur le Discord, tape <code className="text-lilac">/aide</code> et laisse Cycy_Bot te faire
            visiter la galaxie.
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
