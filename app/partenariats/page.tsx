import type { Metadata } from "next";
import Link from "next/link";
import { liens } from "@/data/liens";
import { lireTextes } from "@/lib/textesStore";
import { lirePartenaires, lireBonsPlans } from "@/lib/partnersStore";
import AccentCosmique from "@/components/AccentCosmique";
import FollowersTwitch from "@/components/FollowersTwitch";
import TexteRiche from "@/components/TexteRiche";
import BoutonCopierCode from "@/components/BoutonCopierCode";
import {
  IconCrystal,
  IconStar4,
  IconPlanetRing,
  IconOrbit,
  IconMoonCrescent,
  IconMail,
  IconTwitch,
  IconTikTok,
  IconInstagram,
  IconYouTube,
  IconDiscord,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Partenaires & Bons plans | Cycylive",
  description:
    "Les marques avec qui Cycy collabore, les bons plans pour la communauté, et comment devenir partenaire.",
  alternates: { canonical: "/partenariats" },
  openGraph: {
    title: "Partenaires & Bons plans | Cycylive",
    description:
      "Les marques avec qui Cycy collabore, les bons plans pour la communauté, et comment devenir partenaire.",
    url: "/partenariats",
  },
};

const univers = ["Gaming", "Streaming", "Création de contenu", "Communauté"];

const presence = [
  { nom: "Twitch", href: liens.twitch, icon: IconTwitch },
  { nom: "TikTok", href: liens.tiktok, icon: IconTikTok },
  { nom: "Instagram", href: liens.instagram, icon: IconInstagram },
  { nom: "YouTube", href: liens.youtube, icon: IconYouTube },
  { nom: "Discord", href: liens.discord, icon: IconDiscord },
];

const typesCollab = [
  { label: "Sponsoring", icon: IconOrbit },
  { label: "Gaming", icon: IconCrystal },
  { label: "Événements", icon: IconStar4 },
  { label: "Campagnes sociales", icon: IconMoonCrescent },
  { label: "Tests / découvertes", icon: IconPlanetRing },
  { label: "Création de contenu", icon: IconCrystal },
  { label: "Collaborations créateurs", icon: IconStar4 },
];

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/[0.04] px-3.5 py-1.5 text-xs text-ink-soft/80">
      {label}
    </span>
  );
}

export default async function PartenariatsPage() {
  const [textes, partenairesTous, bonsPlansTous] = await Promise.all([
    lireTextes(),
    lirePartenaires(),
    lireBonsPlans(),
  ]);
  const partenaires = partenairesTous.filter((p) => p.active);
  const bonsPlans = bonsPlansTous.filter((b) => b.active);

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="planete" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        Partenaires & Bons plans
      </h1>
      <TexteRiche
        html={
          "Je sélectionne mes partenariats avec attention pour qu'ils restent cohérents avec mon univers et utiles à ma communauté.<br><br>" +
          "Tu retrouveras ici les marques avec lesquelles je collabore, les bons plans associés et les offres que j'ai envie de partager avec vous."
        }
        className="text-ink-soft leading-relaxed mb-10 max-w-2xl"
      />

      {partenaires.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">Mes partenaires</h2>

          {partenaires.length === 1 ? (
            <CartePartenaire partenaire={partenaires[0]} grande />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {partenaires.map((p) => (
                <CartePartenaire key={p.id} partenaire={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {bonsPlans.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">Bons plans</h2>
          <div className="space-y-3">
            {bonsPlans.map((b) => (
              <div
                key={b.id}
                className="carte-holo rounded-2xl p-5 border border-violet/12 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-violet-light mb-1">{b.marque}</p>
                  <p className="text-ink font-medium mb-1">{b.offre}</p>
                  {b.conditions && (
                    <p className="text-ink-soft/60 text-xs">{b.conditions}</p>
                  )}
                  {b.dateFin && (
                    <p className="text-ink-soft/60 text-xs">Valable jusqu'au {b.dateFin}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {b.promoCode && <BoutonCopierCode code={b.promoCode} />}
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full px-4 py-2 bg-violet text-ink text-sm font-medium hover:bg-violet-light hover:shadow-glow transition-all whitespace-nowrap"
                  >
                    Voir l'offre
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="carte-holo rounded-3xl p-6 md:p-8 border border-violet/15">
        <h2 className="text-xl md:text-2xl font-semibold text-ink mb-4">
          Envie de travailler ensemble ?
        </h2>
        <TexteRiche
          html={textes.partenariats.intro}
          className="text-ink-soft leading-relaxed mb-6 max-w-2xl"
        />

        <div className="mb-6">
          <FollowersTwitch />
        </div>

        <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">Mon univers</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {univers.map((u) => (
            <Tag key={u} label={u} />
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">Mes plateformes</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {presence.map(({ nom, href, icon: Icon }) => (
            <a
              key={nom}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-violet/20 px-3.5 py-1.5 text-xs text-ink-soft hover:text-ink hover:border-violet/40 transition-all"
            >
              <Icon className="w-3.5 h-3.5 text-violet-light/80" />
              {nom}
            </a>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">
          {textes.partenariats.typesTitre}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {typesCollab.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3.5 py-1.5 text-xs text-ink-soft/80"
            >
              <Icon className="w-3.5 h-3.5 text-violet-light/70" />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
          >
            <IconMail className="w-4 h-4" />
            Me proposer une collaboration
          </Link>
          <button
            disabled
            title="Media kit à venir"
            className="inline-flex rounded-full px-6 py-3 border border-violet/20 text-ink-soft/50 font-medium cursor-not-allowed"
          >
            {textes.partenariats.mediaKit}
          </button>
        </div>
      </section>
    </div>
  );
}

function CartePartenaire({
  partenaire,
  grande = false,
}: {
  partenaire: import("@/data/partners").Partenaire;
  grande?: boolean;
}) {
  return (
    <div
      className={`carte-holo rounded-3xl border border-violet/15 ${
        grande ? "p-8 md:p-10" : "p-6"
      }`}
    >
      <div className={`flex ${grande ? "flex-col sm:flex-row sm:items-center gap-6" : "flex-col gap-3"}`}>
        {partenaire.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={partenaire.logo}
            alt={partenaire.nom}
            className={grande ? "h-20 w-20 rounded-2xl object-cover shrink-0" : "h-14 w-14 rounded-xl object-cover"}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className={grande ? "text-2xl font-semibold text-ink" : "text-lg font-semibold text-ink"}>
              {partenaire.nom}
            </h3>
            <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft/70">
              {partenaire.typePartenariat}
            </span>
          </div>
          <p className="text-ink-soft text-sm leading-relaxed mb-4">{partenaire.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            {partenaire.promoCode && <BoutonCopierCode code={partenaire.promoCode} />}
            {partenaire.reduction && (
              <span className="text-lilac text-sm font-medium">{partenaire.reduction}</span>
            )}
            <a
              href={partenaire.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-5 py-2.5 bg-violet text-ink text-sm font-medium hover:bg-violet-light hover:shadow-glow transition-all"
            >
              {partenaire.ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
