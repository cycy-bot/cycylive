import type { Metadata } from "next";
import Link from "next/link";
import { liens } from "@/data/liens";
import { lireTextes } from "@/lib/textesStore";
import AccentCosmique from "@/components/AccentCosmique";
import FollowersTwitch from "@/components/FollowersTwitch";
import TexteRiche from "@/components/TexteRiche";
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

export const metadata: Metadata = {
  title: "Collaborations & Partenariats | Cycylive",
  description:
    "Marques, événements, créateurs : découvre les collaborations possibles avec Cycylive.",
  alternates: { canonical: "/partenariats" },
  openGraph: {
    title: "Collaborations & Partenariats | Cycylive",
    description:
      "Marques, événements, créateurs : découvre les collaborations possibles avec Cycylive.",
    url: "/partenariats",
  },
};

export default async function PartenariatsPage() {
  const textes = await lireTextes();
  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
      <AccentCosmique variante="planete" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        {textes.partenariats.titre}
      </h1>
      <TexteRiche
        html={textes.partenariats.intro}
        className="text-ink-soft leading-relaxed mb-6 max-w-2xl"
      />

      <nav className="flex flex-wrap gap-2 mb-8 text-xs">
        <a href="#univers" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">Mon univers</a>
        <a href="#plateformes" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">Plateformes</a>
        <a href="#collaborations" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">Collaborations</a>
        <a href="#contact" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">Contact</a>
      </nav>

      {/* Chiffres clés : masqué automatiquement tant qu'aucune donnée n'est disponible */}
      <div className="mb-8">
        <FollowersTwitch />
      </div>

      {/* Univers */}
      <p id="univers" className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3 scroll-mt-24">Mon univers</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {univers.map((u) => (
          <Tag key={u} label={u} />
        ))}
      </div>

      {/* Mes plateformes */}
      <p id="plateformes" className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3 scroll-mt-24">Mes plateformes</p>
      <div className="flex flex-wrap gap-2 mb-8">
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

      {/* Collaborations possibles */}
      <p id="collaborations" className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3 scroll-mt-24">
        {textes.partenariats.typesTitre}
      </p>
      <div className="flex flex-wrap gap-2 mb-10">
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

      <div id="contact" className="flex flex-wrap gap-3 scroll-mt-24">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
        >
          <IconMail className="w-4 h-4" />
          {textes.partenariats.cta}
        </Link>
        <button
          disabled
          title="Media kit à venir"
          className="inline-flex rounded-full px-6 py-3 border border-violet/20 text-ink-soft/50 font-medium cursor-not-allowed"
        >
          {textes.partenariats.mediaKit}
        </button>
      </div>
    </div>
  );
}
