import type { Metadata } from "next";
import Link from "next/link";
import { liens } from "@/data/liens";
import { lienPaypal, montantsRapides } from "@/data/soutien";
import AccentCosmique from "@/components/AccentCosmique";
import { IconDiscord, IconTwitch } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Soutenir Cycylive : don, abonnement Twitch et Prime Gaming | Cycylive",
  description:
    "Toutes les façons de soutenir la chaîne Twitch de Cycylive : faire un don via PayPal, s'abonner, utiliser son abonnement Prime Gaming gratuit, envoyer des bits ou simplement follow et partager.",
  alternates: { canonical: "/soutenir" },
  openGraph: {
    title: "Soutenir Cycylive",
    description: "Don, abonnement, Prime Gaming, bits… ou un simple follow : chaque coup de pouce compte.",
    url: "/soutenir",
  },
};

const twitchLogin = liens.twitch.replace(/\/+$/, "").split("/").pop() || "cycylive";
const lienAbonnement = `https://www.twitch.tv/subs/${twitchLogin}`;

// Un lien PayPal.me accepte un montant à la fin : https://paypal.me/pseudo/5EUR
const estPaypalMe = /^https:\/\/(www\.)?(paypal\.me|paypal\.com\/paypalme)\//i.test(lienPaypal);
const lienMontant = (euros: number) => `${lienPaypal.replace(/\/+$/, "")}/${euros}EUR`;

const sommaire = [
  { href: "#don", label: "💜 Faire un don" },
  { href: "#abonnement", label: "⭐ S'abonner" },
  { href: "#prime", label: "👑 Prime Gaming" },
  { href: "#bits", label: "💎 Bits" },
  { href: "#gratuit", label: "🚀 Gratuitement" },
  { href: "#partenaires", label: "🤝 Partenaires" },
];

const bouton =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all";
const boutonPlein = `${bouton} bg-violet text-white hover:bg-violet-light shadow-glow-sm`;
const boutonContour = `${bouton} border border-violet/30 text-ink-soft hover:bg-violet/10 hover:text-ink`;

export default function SoutenirPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="lune" />

      <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mb-4">
        Soutenir la chaîne
      </h1>
      <p className="text-ink-soft text-lg leading-relaxed mb-8 max-w-2xl">
        Chaque coup de pouce aide Cycylive à grandir et à améliorer les lives. Voici toutes les façons de
        soutenir la chaîne, avec ou sans dépenser un centime. 💜
      </p>

      <nav aria-label="Sommaire" className="flex flex-wrap gap-2 mb-14">
        {sommaire.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="rounded-full border border-violet/20 bg-card px-4 py-2 text-sm text-ink-soft hover:text-ink hover:border-violet/50 transition-all"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Don */}
      <section id="don" className="scroll-mt-24 mb-12" aria-labelledby="don-titre">
        <div className="carte-holo liseret-glow rounded-3xl p-6 md:p-8">
          <h2 id="don-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
            💜 Faire un don
          </h2>
          <p className="text-ink-soft mb-6 max-w-2xl">
            Un don aide directement la chaîne : matériel, jeux, projets pour la communauté. Le paiement se fait en
            toute sécurité sur PayPal, par carte bancaire ou avec ton compte PayPal. Tu peux ajouter un petit mot
            dans la note du paiement, il fait toujours plaisir.
          </p>

          {lienPaypal ? (
            <div className="flex flex-wrap items-center gap-3">
              {estPaypalMe &&
                montantsRapides.map((montant) => (
                  <a
                    key={montant}
                    href={lienMontant(montant)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={boutonContour}
                  >
                    {montant} €
                  </a>
                ))}
              <a href={lienPaypal} target="_blank" rel="noopener noreferrer" className={boutonPlein}>
                {estPaypalMe ? "Choisir mon montant" : "Faire un don avec PayPal"}
              </a>
            </div>
          ) : (
            <p className="text-sm text-ink-soft/70">Le lien de don arrive très bientôt.</p>
          )}
        </div>
      </section>

      {/* Abonnement */}
      <section id="abonnement" className="scroll-mt-24 mb-12" aria-labelledby="abo-titre">
        <h2 id="abo-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
          ⭐ S'abonner sur Twitch
        </h2>
        <p className="text-ink-soft mb-5 max-w-2xl">
          L'abonnement est la façon la plus directe de soutenir la chaîne sur Twitch. En échange, tu profites
          des emotes de la chaîne, d'un badge à côté de ton pseudo, et tu deviens officiellement un Cycylien
          Premium. ⭐
        </p>
        <a href={lienAbonnement} target="_blank" rel="noopener noreferrer" className={boutonPlein}>
          <IconTwitch className="w-4 h-4" />
          S'abonner à la chaîne
        </a>
      </section>

      {/* Prime Gaming */}
      <section id="prime" className="scroll-mt-24 mb-12" aria-labelledby="prime-titre">
        <div className="carte-holo rounded-2xl p-6">
          <h2 id="prime-titre" className="text-xl md:text-2xl font-semibold text-ink mb-2">
            👑 Ton abonnement Prime Gaming, offert chaque mois
          </h2>
          <p className="text-ink-soft mb-4">
            Si tu as Amazon Prime, tu disposes d'un abonnement Twitch gratuit tous les mois. Tu peux l'utiliser
            pour soutenir la chaîne sans rien payer de plus :
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-ink-soft mb-5">
            <li>Relie ton compte Amazon à ton compte Twitch (une seule fois).</li>
            <li>Sur la chaîne, clique sur « S'abonner ».</li>
            <li>Choisis « Utiliser Prime » : c'est fait, et c'est à renouveler chaque mois.</li>
          </ol>
          <a href={lienAbonnement} target="_blank" rel="noopener noreferrer" className={boutonContour}>
            Utiliser mon abonnement Prime
          </a>
        </div>
      </section>

      {/* Bits */}
      <section id="bits" className="scroll-mt-24 mb-12" aria-labelledby="bits-titre">
        <h2 id="bits-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
          💎 Envoyer des bits
        </h2>
        <p className="text-ink-soft max-w-2xl">
          Les bits s'envoient directement dans le chat pendant le live, avec un message. Les plus généreux
          apparaissent dans le{" "}
          <Link href="/cycybot/leaderboard" className="text-lilac hover:text-ink underline underline-offset-4">
            leaderboard des Cycyliens
          </Link>
          .
        </p>
      </section>

      {/* Gratuit */}
      <section id="gratuit" className="scroll-mt-24 mb-12" aria-labelledby="gratuit-titre">
        <h2 id="gratuit-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
          🚀 Soutenir gratuitement
        </h2>
        <p className="text-ink-soft mb-6 max-w-2xl">
          Pas besoin de dépenser quoi que ce soit : ces gestes simples aident énormément la chaîne à se faire
          connaître.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ["💜", "Follow la chaîne", "Et active les notifications pour ne rater aucun live."],
            ["👀", "Rester en live", "Même en arrière-plan : chaque viewer compte, et ta présence fait grimper ton rang au leaderboard."],
            ["🎬", "Partager des clips", "Tape !clip pendant un live pour capturer la dernière minute, puis partage-la."],
            ["💬", "Rejoindre le Discord", "Pour discuter, trouver des mates et être prévenu des prochains lives."],
          ].map(([emoji, titre, texte]) => (
            <div key={titre} className="carte-holo rounded-2xl p-5">
              <span className="text-2xl" aria-hidden>
                {emoji}
              </span>
              <h3 className="text-ink font-semibold mt-2 mb-1">{titre}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{texte}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <a href={liens.twitch} target="_blank" rel="noopener noreferrer" className={boutonPlein}>
            <IconTwitch className="w-4 h-4" />
            Suivre sur Twitch
          </a>
          <a href={liens.discord} target="_blank" rel="noopener noreferrer" className={boutonContour}>
            <IconDiscord className="w-4 h-4" />
            Rejoindre le Discord
          </a>
        </div>
      </section>

      {/* Partenaires */}
      <section id="partenaires" className="scroll-mt-24" aria-labelledby="partenaires-titre">
        <div className="carte-holo rounded-2xl p-6 flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-xl">
            <h2 id="partenaires-titre" className="text-xl font-semibold text-ink mb-1">
              🤝 Partenaires & bons plans
            </h2>
            <p className="text-ink-soft text-sm">
              Profite de réductions chez les partenaires de la chaîne : tu fais des économies, et la chaîne est
              soutenue au passage.
            </p>
          </div>
          <Link href="/partenariats" className={boutonPlein}>
            Voir les codes promo
          </Link>
        </div>
      </section>
    </div>
  );
}
