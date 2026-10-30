import type { Metadata } from "next";
import Link from "next/link";
import { liens } from "@/data/liens";
import { lireCycyBot, transmissionSecours } from "@/lib/cycybot";
import { CarteBloc, Pastilles, nf, type Bloc } from "@/components/cycybot/Blocs";
import SectionGalaxie from "@/components/cycybot/SectionGalaxie";
import AccentCosmique from "@/components/AccentCosmique";
import ConsoleCycyBot from "@/components/ConsoleCycyBot";
import { IconDiscord, IconTwitch } from "@/components/Icons";
import Icone, { Pastille } from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";

export const metadata: Metadata = {
  title: "Cycy_Bot | Cycylive",
  description:
    "Cycy_Bot, le bot officiel de Cycylive sur Twitch et Discord : passeport galactique, jeux, Cartes Astrales, figurines Cosmo-Capsules, Éclats Stellaires, expéditions, Marché noir, prédictions et leaderboard.",
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
  { icone: "antenne" as NomIcone, titre: "Il annonce le live", texte: "Début, reprise, fin avec la durée, changement de jeu, et notification sur le Discord." },
  { icone: "coeur" as NomIcone, titre: "Il remercie l'équipage", texte: "Follows, subs, resubs, subs offerts, raids et Hype Train, avec un message pour chaque moment." },
  { icone: "cartes" as NomIcone, titre: "Il lâche des cartes mystère", texte: "Pendant le live, une carte sauvage apparaît : tape !attraper, un gagnant est tiré au sort et la carte rejoint sa collection Discord." },
  { icone: "boule" as NomIcone, titre: "Il lance les prédictions", texte: "En points de chaîne sur Twitch, ou en Éclats Stellaires sur le Discord, avec le résultat annoncé." },
  { icone: "trophee" as NomIcone, titre: "Il tient le classement", texte: "Messages, présence, séries de lives, bits et subs offerts : chaque Cycylien a sa place au leaderboard." },
  { icone: "bouclier" as NomIcone, titre: "Il protège le chat", texte: "Mode lent après les gros raids, et une vingtaine d'outils pour que les modos agissent en un clin d'œil." },
];

const aEssayer = ["attraper", "eclats", "watchtime", "8ball"];

// ── Figurines Cosmo-Capsules (si le bot ne répond pas, cette liste suffit) ──
const figurinesSecours = [
  { id: "stellaires", nom: "Compagnons stellaires", emoji: "🌙", total: 10, image: "/figurines/compagnon-luma.webp" },
  { id: "objets", nom: "Objets Cosmiques Vivants", emoji: "🌙", total: 10, image: "/figurines/fig25.webp" },
  { id: "robots", nom: "Robots & Science-Fiction", emoji: "🤖", total: 10, image: "/figurines/fig38.webp" },
  { id: "mystic", nom: "Mystic Cosmic", emoji: "🔮", total: 10, image: "/figurines/fig50.webp" },
  { id: "cosy", nom: "Cosy Galaxy", emoji: "☕", total: 15, image: "/figurines/fig65.webp" },
  { id: "delices", nom: "Délices Interstellaires", emoji: "🍬", total: 15, image: "/figurines/fig79.webp" },
  { id: "nibis", nom: "La Bande des Nibis", emoji: "👽", total: 12, image: "/figurines/nibi03.webp" },
  { id: "cycybot", nom: "Collection CycyBot", emoji: "🤖", total: 10, image: "/figurines/bot03.webp" },
  { id: "cycylive", nom: "Collection Cycylive", emoji: "💜", total: 11, image: "/figurines/cycy01.webp" },
];

// ── Discord ─────────────────────────────────────────────────
const blocsDiscord: Bloc[] = [
  { id: "passeport", icone: "badge", titre: "Le passeport galactique", texte: "Ta carte d'identité de Cycylien : infos, rang, succès et tampons, avec plus de 30 thèmes à débloquer, des cadres, des titres et des effets de nom.", commandes: ["passeport", "rank", "leaderboard"] },
  { id: "jeux", icone: "manette", titre: "Des jeux chaque jour", texte: "Explorer la galaxie, chasser les étoiles, ouvrir un coffre, le quiz, le mot mystère, les duels et le défi galactique du jour : de quoi monter d'orbite.", commandes: ["jeux", "explorer", "quiz", "duel"] },
  { id: "site", icone: "cadeau", titre: "Les récompenses du site", texte: "Ticket à gratter, compagnon, coffres scellés, Grappin cosmique et Cosmo-Capsules sur cycylive.fr : tout ce que tu gagnes arrive sur ton profil Discord.", commandes: ["gratter", "compagnon", "tresor"] },
  { id: "cartes", icone: "cartes", titre: "Les Cartes Astrales", texte: "Un vrai jeu de cartes à collectionner : un booster gratuit par jour, six raretés, des brillantes, des mythiques en dix exemplaires et des cartes à l'effigie de la commu.", commandes: ["booster", "collection", "fabriquer"] },
  { id: "succes", icone: "medaille", titre: "Des succès à trois niveaux", texte: "Chaque succès monte jusqu'au niveau III : boosters, rôles « aguerri·e », thèmes Prestige et Légende, cartes Trophées… et le titre ultime de Maître des succès.", commandes: ["passeport"] },
  { id: "musique", icone: "note", titre: "La musique en vocal", texte: "Colle un lien Spotify (titre, album ou playlist) et CycyBot le joue dans ton salon vocal, avec une file d'attente partagée.", commandes: ["jouer", "file", "volume"] },
  { id: "vocaux", icone: "son", titre: "Des vocaux rien qu'à toi", texte: "Rejoins le salon de création et ton propre vocal apparaît : nom, limite, verrou, invités… tu gères tout, il disparaît quand il se vide.", commandes: ["vocal"] },
  { id: "roles", icone: "badge", titre: "Tes rôles en un clic", texte: "Notifications des lives, YouTube et TikTok, jeux, rang Valorant : choisis tes rôles où que tu sois, et l'agence t'aide à trouver des coéquipier·es.", commandes: ["mes-roles", "agence", "planning"] },
];


export default async function CycyBotPage() {
  const donnees = await lireCycyBot();
  const discord = donnees?.discord ?? null;
  const enAvant = aEssayer
    .map((nom) => donnees?.commands.everyone.find((c) => c.name === nom))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const nbDiscord = discord ? discord.commands.reduce((n, g) => n + g.items.length, 0) : 0;
  // Collections de figurines : la liste du bot (nombres à jour), sinon celle du site
  const collections = discord?.figurines?.length
    ? discord.figurines.map((c) => ({ id: c.id, nom: c.nom, emoji: c.emoji, total: c.total, mystere: Boolean(c.mystere) || (c.id === "evenements" && !c.apercu.length), image: c.apercu[0]?.image || figurinesSecours.find((s) => s.id === c.id)?.image || "/figurines/boule-rose.webp" }))
    : figurinesSecours;
  const stats = discord
    ? [
        { v: discord.stats.cards, l: "Cartes Astrales à collectionner" },
        { v: discord.stats.collectors, l: "collectionneurs" },
        { v: discord.stats.boostersOpened, l: "boosters ouverts" },
        { v: discord.stats.eclatsCirculation, l: "Éclats en circulation" },
        { v: discord.stats.expeditions, l: "expéditions lancées" },
        { v: discord.stats.themes, l: "thèmes de passeport" },
        { v: discord.stats.figurines ?? 0, l: "figurines Cosmo-Capsules" },
        { v: discord.stats.capsules ?? 0, l: "capsules ouvertes" },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/cycybot/avatar.webp"
              alt="Avatar de Cycy_Bot"
              width={112}
              height={112}
              className="relative w-28 h-28 rounded-full object-cover shadow-glow ring-4 ring-void"
            />
          </div>

          {/* leading + pb : laisse la place aux jambages du « y » */}
          <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mb-4">
            Cycy_Bot
          </h1>
          <p className="text-ink-soft text-lg leading-relaxed mb-5 max-w-xl">
            {donnees?.bot.bio ||
              "Le bot officiel de Cycylive. Il veille sur le chat Twitch pendant que Cycy essaie de viser, et fait vivre toute une galaxie sur le Discord."}
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
              <Icone nom="soucoupe" className="w-4 h-4 mr-1.5" />L&apos;univers Discord
            </a>
            <Link
              href="/cycybot/leaderboard"
              className="rounded-full px-5 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 hover:text-ink transition-all"
            >
              <Icone nom="trophee" className="w-4 h-4 mr-1.5" />Leaderboard
            </Link>
          </div>
        </div>

        <ConsoleCycyBot lignes={donnees?.transmission?.length ? donnees.transmission : transmissionSecours} />
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
          <Icone nom="alerte" className="w-4 h-4 mr-1" /> <strong>Anomalie détectée sur le Discord :</strong> {discord.anomaly.label}. Fonce en profiter !
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
              <Pastille nom={f.icone} />
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
            <img src="/images/cycybot/passeport.webp" alt="Exemple de passeport galactique avec un cadre holographique" width={1200} height={675} loading="lazy" className="w-full rounded-xl" />
            <figcaption className="px-2 py-2 text-xs text-ink-soft">Le passeport : infos, rang, thème, cadre, titre et effet de nom.</figcaption>
          </figure>
          <figure className="carte-holo rounded-2xl p-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cycybot/tampons.webp" alt="Page Tampons du passeport avec les tampons de la Chronique" width={1200} height={675} loading="lazy" className="w-full rounded-xl" />
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

        {/* Figurines Cosmo-Capsules */}
        <div id="figurines" className="mt-6 carte-holo rounded-2xl p-5 md:p-6 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div className="max-w-2xl">
              <h3 className="text-ink font-semibold">Les figurines Cosmo-Capsules</h3>
              <p className="text-sm text-ink-soft">
                Une capsule par jour sur la machine gatchapon du site : {nf(collections.reduce((n, c) => n + ("mystere" in c && c.mystere ? 0 : c.total), 0))} figurines kawaii en {collections.length} collections,
                six raretés et quelques exemplaires uniques. Ton album se montre sur le Discord, trié par numéro, rareté ou collection.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Pastilles noms={["figurines", "figurine"]} />
              <Link href="/jeux/capsules" className="mt-3 rounded-full px-4 py-2 bg-violet text-white text-sm font-medium hover:bg-violet-light shadow-glow-sm transition-all">
                <Icone nom="cadeau" className="w-4 h-4 mr-1.5" />Ouvrir ma capsule
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {collections.map((c) => (
              <Link key={c.id} href="/jeux/capsules" className="group flex flex-col items-center rounded-2xl border border-violet/20 bg-void/50 p-2 text-center hover:border-lilac/60 transition-colors">
                <div className="relative w-full aspect-square">
                  <span aria-hidden className="absolute inset-[12%] rounded-full bg-violet/40 blur-xl" />
                  {"mystere" in c && c.mystere ? (
                    // Surprise : la figurine n'est pas encore sortie, on ne montre qu'une capsule dans l'ombre
                    <span className="relative flex h-full w-full items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/figurines/boule-rose.webp" alt="" loading="lazy" className="absolute h-[82%] w-[82%] object-contain brightness-[.12] saturate-0 drop-shadow-[0_0_14px_rgba(196,181,253,.55)] transition-transform duration-300 group-hover:scale-105" />
                      <span className="relative font-display text-4xl font-bold text-lilac drop-shadow-[0_0_10px_rgba(196,181,253,.9)]">?</span>
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" loading="lazy" className="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                  )}
                </div>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-ink">{c.emoji} {c.nom}</p>
                <p className="text-[10px] text-ink-soft">{"mystere" in c && c.mystere ? "Surprise à venir…" : `${c.total} figurines`}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galaxie : Éclats, Marché noir, expéditions… ── */}
      <SectionGalaxie discord={discord} />

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
          <Pastille nom="clavier" taille="lg" />
          <h2 className="text-xl font-semibold text-ink mt-3 mb-1">Toutes les commandes</h2>
          <p className="text-sm text-ink-soft">
            {donnees
              ? `${donnees.commands.everyone.length} commandes pour le chat Twitch${nbDiscord ? ` et ${nbDiscord} commandes Discord` : ""}, avec une recherche.`
              : "La liste complète, Twitch et Discord, avec une recherche."}
          </p>
          <span className="inline-block mt-4 text-sm text-lilac group-hover:text-ink transition-colors">Voir la liste ›</span>
        </Link>
        <Link href="/cycybot/leaderboard" className="group carte-holo rounded-2xl p-6 hover:shadow-glow-sm transition-all">
          <Pastille nom="trophee" teinte="or" taille="lg" />
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
