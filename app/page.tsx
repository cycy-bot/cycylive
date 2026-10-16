import type { Metadata } from "next";
import Hero from "@/components/Hero";
import StatutTwitch from "@/components/StatutTwitch";
import StatsRapides from "@/components/StatsRapides";
import Planning from "@/components/Planning";
import AProposCourt from "@/components/AProposCourt";
import TimelineApercu from "@/components/TimelineApercu";
import DerniersContenus from "@/components/DerniersContenus";
import CommunauteApercu from "@/components/CommunauteApercu";
import PartenariatsApercu from "@/components/PartenariatsApercu";
import BandeauPartenaires from "@/components/BandeauPartenaires";
import ExplorerAccueil from "@/components/ExplorerAccueil";
import { liens } from "@/data/liens";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cycylive | Stream, gaming & création de contenu",
  description:
    "Cycylive, le hub central de Cycy : lives Twitch, planning, réseaux, communauté et partenariats.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Cycylive | Stream, gaming & création de contenu",
    description:
      "Cycylive, le hub central de Cycy : lives Twitch, planning, réseaux, communauté et partenariats.",
    url: "/",
  },
};

export const revalidate = 300;

// Données structurées : aident Google à relier le site à la chaîne et aux réseaux
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, url: SITE_URL, name: "Cycylive", inLanguage: "fr-FR" },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#cycy`,
      name: "Cycylive",
      url: SITE_URL,
      image: `${SITE_URL}/images/cycy-photo.jpg`,
      jobTitle: "Streameuse et créatrice de contenu",
      sameAs: [liens.twitch, liens.tiktok, liens.instagram, liens.youtube].filter((l) => l && l !== "#"),
    },
  ],
};

export default function AccueilPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <StatutTwitch />
      <StatsRapides />
      <Planning />
      <ExplorerAccueil />
      <AProposCourt />
      <TimelineApercu />
      <DerniersContenus />
      <CommunauteApercu />
      <PartenariatsApercu />
      <BandeauPartenaires />
    </>
  );
}
