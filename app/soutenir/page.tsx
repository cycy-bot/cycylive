import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import Link from "next/link";
import { liens } from "@/data/liens";
import { lienPaypal, montantsRapides } from "@/data/soutien";
import { lireBonsPlans, lirePartenaires } from "@/lib/partnersStore";
import AccentCosmique from "@/components/AccentCosmique";
import BoutonCopierCode from "@/components/BoutonCopierCode";
import { IconDiscord, IconTwitch } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Soutenir Cycylive : don, abonnement Twitch et Prime Gaming | Cycylive",
  description:
    "Toutes les façons de soutenir la chaîne Twitch de Cycylive : regarder les lives, follow, s'abonner (même gratuitement avec Prime Gaming), envoyer des bits, faire un don ou profiter des bons plans partenaires.",
  alternates: { canonical: "/soutenir" },
  openGraph: {
    title: "Soutenir Cycylive",
    description: "Un follow, un live en fond, un sub Prime ou un don : chaque coup de pouce compte.",
    url: "/soutenir",
  },
};

export const revalidate = 300;

const twitchLogin = liens.twitch.replace(/\/+$/, "").split("/").pop() || "cycylive";
const lienAbonnement = `https://www.twitch.tv/subs/${twitchLogin}`;

// Un lien PayPal.me accepte un montant à la fin : https://paypal.me/pseudo/5EUR
const estPaypalMe = /^https:\/\/(www\.)?(paypal\.me|paypal\.com\/paypalme)\//i.test(lienPaypal);
const lienMontant = (euros: number) => `${lienPaypal.replace(/\/+$/, "")}/${euros}EUR`;

const bouton = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all";
const boutonPlein = `${bouton} bg-violet text-white hover:bg-violet-light shadow-glow-sm`;
const boutonContour = `${bouton} border border-violet/30 text-ink-soft hover:bg-violet/10 hover:text-ink`;

// Pourquoi chaque geste compte (visibilité sur Twitch)
const impact = [
  { e: "👀", t: "Chaque viewer compte", d: "Plus il y a de monde en même temps sur le live, plus la chaîne remonte dans la catégorie du jeu et dans les recommandations Twitch." },
  { e: "💜", t: "Chaque follow aide", d: "Les follows font grandir la chaîne et te préviennent à chaque début de live : tu ne rates rien, et Twitch voit la chaîne progresser." },
  { e: "⭐", t: "Chaque sub fait avancer", d: "Un abonnement (même gratuit avec Prime) soutient directement la chaîne et débloque les emotes et ton badge de Cycylien." },
];

const gratuit = [
  ["💜", "Follow + notifications", "Active la cloche pour être prévenu·e à chaque live."],
  ["🖥️", "Laisser le live en fond", "Même sans regarder : le live compte ta présence, et tu grimpes au leaderboard."],
  ["💬", "Écrire dans le chat", "Un chat vivant donne envie aux nouveaux de rester (et ça fait plaisir 😄)."],
  ["🎬", "Clipper et partager", "Tape !clip pendant un live, puis partage le clip à tes potes ou sur tes réseaux."],
  ["📣", "Parler de la chaîne", "Un message à un ami, une story : c'est comme ça que la commu grandit."],
  ["🛸", "Rejoindre le Discord", "Pour discuter entre les lives, jouer avec la commu et gagner des récompenses."],
];

export default async function SoutenirPage() {
  const [bonsPlansTous, partenairesTous] = await Promise.all([lireBonsPlans().catch(() => []), lirePartenaires().catch(() => [])]);
  const bonsPlans = bonsPlansTous.filter((b) => b.active).slice(0, 3);
  const nbPartenaires = partenairesTous.filter((p) => p.active).length;

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="lune" />

      {/* En-tête */}
      <EntetePage
        surtitre="💜 Soutenir la chaîne"
        titre="Aide Cycylive à briller plus fort"
        intro={<>Que tu aies cinq minutes ou cinq euros, il y a toujours une façon de donner un coup de pouce. Et la plupart sont gratuites&nbsp;!</>}
      />

      {/* Les 3 façons principales */}
      <div className="grid gap-4 md:grid-cols-3 mb-14">
        <a href="#gratuit" className="group carte-holo rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-glow-sm">
          <span className="text-3xl" aria-hidden>🚀</span>
          <h2 className="mt-3 text-lg font-semibold text-ink">Gratuitement</h2>
          <p className="mt-1 text-sm text-ink-soft">Follow, regarder les lives, partager des clips : le plus important, et ça ne coûte rien.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-lilac group-hover:text-ink">Voir comment →</span>
        </a>
        <a href="#abonnement" className="group relative overflow-hidden rounded-3xl border border-violet/40 p-6 transition-all hover:-translate-y-1 hover:shadow-glow" style={{ background: "linear-gradient(160deg, rgba(123,56,255,.28), rgba(13,10,23,.95) 70%)" }}>
          <span className="absolute right-4 top-4 rounded-full bg-violet px-2.5 py-1 text-[11px] font-semibold text-white">Le plus utile</span>
          <span className="text-3xl" aria-hidden>⭐</span>
          <h2 className="mt-3 text-lg font-semibold text-ink">S&apos;abonner</h2>
          <p className="mt-1 text-sm text-ink-soft">Emotes, badge, et soutien direct. Avec Amazon Prime, ton sub du mois est offert.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-lilac group-hover:text-ink">M&apos;abonner →</span>
        </a>
        <a href="#don" className="group carte-holo rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-glow-sm">
          <span className="text-3xl" aria-hidden>💝</span>
          <h2 className="mt-3 text-lg font-semibold text-ink">Faire un don</h2>
          <p className="mt-1 text-sm text-ink-soft">Pour le matériel, les jeux et les projets pour la commu. Paiement sécurisé PayPal.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-lilac group-hover:text-ink">Faire un don →</span>
        </a>
      </div>

      {/* Pourquoi ça compte */}
      <section aria-labelledby="impact-titre" className="mb-14">
        <h2 id="impact-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">Pourquoi ça compte autant&nbsp;?</h2>
        <p className="text-ink-soft mb-6 max-w-2xl">
          Sur Twitch, la visibilité dépend de la communauté : c&apos;est toi qui fais découvrir la chaîne à de nouvelles personnes.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {impact.map((i) => (
            <div key={i.t} className="rounded-2xl border border-violet/15 bg-white/[0.02] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/15 text-2xl" aria-hidden>{i.e}</span>
              <h3 className="mt-3 font-semibold text-ink">{i.t}</h3>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">{i.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          📊 Envie de voir la progression de la chaîne&nbsp;?{" "}
          <Link href="/statistiques" className="text-lilac underline underline-offset-4 hover:text-ink">Les statistiques sont ici</Link>.
        </p>
      </section>

      {/* Gratuit */}
      <section id="gratuit" className="scroll-mt-24 mb-14" aria-labelledby="gratuit-titre">
        <h2 id="gratuit-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">🚀 Soutenir gratuitement</h2>
        <p className="text-ink-soft mb-6 max-w-2xl">Pas besoin de dépenser quoi que ce soit : ces gestes simples aident énormément la chaîne à se faire connaître.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gratuit.map(([emoji, titre, texte]) => (
            <div key={titre} className="carte-holo flex gap-3 rounded-2xl p-4">
              <span className="text-2xl" aria-hidden>{emoji}</span>
              <div>
                <h3 className="font-semibold text-ink">{titre}</h3>
                <p className="mt-0.5 text-sm text-ink-soft leading-relaxed">{texte}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
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

      {/* Abonnement + Prime */}
      <section id="abonnement" className="scroll-mt-24 mb-14" aria-labelledby="abo-titre">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="carte-holo liseret-glow rounded-3xl p-6 md:p-8">
            <h2 id="abo-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">⭐ S&apos;abonner sur Twitch</h2>
            <p className="text-ink-soft mb-5">La façon la plus directe de soutenir la chaîne. En échange :</p>
            <ul className="mb-6 space-y-2 text-sm text-ink">
              <li className="flex gap-2"><span aria-hidden>😺</span> Les emotes de la chaîne, utilisables partout sur Twitch</li>
              <li className="flex gap-2"><span aria-hidden>🏅</span> Un badge à côté de ton pseudo, qui évolue avec ton ancienneté</li>
              <li className="flex gap-2"><span aria-hidden>🛸</span> Le rôle abonné sur le Discord (et des boosters de Cartes Astrales)</li>
            </ul>
            <a href={lienAbonnement} target="_blank" rel="noopener noreferrer" className={boutonPlein}>
              <IconTwitch className="w-4 h-4" />
              S&apos;abonner à la chaîne
            </a>
          </div>
          <div id="prime" className="scroll-mt-24 rounded-3xl border border-sky-300/25 p-6 md:p-8" style={{ background: "linear-gradient(160deg, rgba(56,189,248,.12), rgba(13,10,23,.95) 70%)" }}>
            <h3 className="text-xl font-semibold text-ink mb-2">👑 Prime Gaming : ton sub offert</h3>
            <p className="text-sm text-ink-soft mb-4">Avec Amazon Prime, tu as un abonnement Twitch gratuit chaque mois. Il est perdu si tu ne l&apos;utilises pas&nbsp;!</p>
            <ol className="mb-5 space-y-2 text-sm text-ink">
              {["Relie ton compte Amazon à Twitch (une seule fois)", "Sur la chaîne, clique sur « S'abonner »", "Choisis « Utiliser Prime » (à refaire chaque mois)"].map((t, i) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-[11px] font-bold text-sky-200">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <a href={lienAbonnement} target="_blank" rel="noopener noreferrer" className={boutonContour}>
              Utiliser mon sub Prime
            </a>
          </div>
        </div>
      </section>

      {/* Don + bits */}
      <section id="don" className="scroll-mt-24 mb-14" aria-labelledby="don-titre">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="carte-holo rounded-3xl p-6 md:p-8">
            <h2 id="don-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">💝 Faire un don</h2>
            <p className="text-ink-soft mb-6">
              Un don aide directement la chaîne : matériel, jeux, projets pour la communauté. Paiement sécurisé sur PayPal, par carte ou
              avec ton compte. Un petit mot dans la note fait toujours plaisir.
            </p>
            {lienPaypal ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {estPaypalMe &&
                  montantsRapides.map((montant) => (
                    <a key={montant} href={lienMontant(montant)} target="_blank" rel="noopener noreferrer" className={`${boutonContour} min-w-[72px]`}>
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
          <div id="bits" className="scroll-mt-24 rounded-3xl border border-violet/15 bg-white/[0.02] p-6 md:p-8">
            <h3 className="text-xl font-semibold text-ink mb-2">💎 Envoyer des bits</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Les bits s&apos;envoient dans le chat pendant le live, avec un message. Les plus généreux apparaissent dans le{" "}
              <Link href="/cycybot/leaderboard" className="text-lilac underline underline-offset-4 hover:text-ink">leaderboard des Cycyliens</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Partenaires : des économies qui soutiennent aussi la chaîne */}
      <section id="partenaires" className="scroll-mt-24" aria-labelledby="partenaires-titre">
        <div className="rounded-3xl border border-amber-300/25 p-6 md:p-8" style={{ background: "linear-gradient(160deg, rgba(252,211,77,.10), rgba(13,10,23,.95) 65%)" }}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
            <div className="max-w-xl">
              <h2 id="partenaires-titre" className="text-2xl font-semibold text-ink mb-1">🤝 Économise et soutiens en même temps</h2>
              <p className="text-ink-soft text-sm">
                Les codes promo des partenaires te font des économies, et la chaîne est soutenue au passage, sans surcoût pour toi.
              </p>
            </div>
            <Link href="/partenariats" className={boutonPlein}>
              {nbPartenaires > 0 ? "Tous les partenaires et bons plans" : "Voir les bons plans"}
            </Link>
          </div>
          {bonsPlans.length > 0 && (
            <ul className="grid gap-3 md:grid-cols-3">
              {bonsPlans.map((b) => (
                <li key={b.id} className="flex flex-col rounded-2xl border border-white/10 bg-void/50 p-4">
                  <p className="text-xs uppercase tracking-wide text-amber-200/90">{b.marque}</p>
                  <p className="mt-1 font-medium text-ink">{b.offre}</p>
                  <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
                    {b.promoCode && <BoutonCopierCode code={b.promoCode} />}
                    <a href={b.url} target="_blank" rel={b.affilie ? "sponsored noopener noreferrer" : "noopener noreferrer"} className="text-sm font-semibold text-lilac hover:text-ink">
                      Voir l&apos;offre →
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-12 text-center text-ink-soft">Merci du fond du cœur pour ton soutien 💜 À tout de suite sur le live&nbsp;!</p>
    </div>
  );
}
