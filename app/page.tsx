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

export default function AccueilPage() {
  return (
    <>
      <Hero />
      <StatutTwitch />
      <StatsRapides />
      <Planning />
      <AProposCourt />
      <TimelineApercu />
      <DerniersContenus />
      <CommunauteApercu />
      <PartenariatsApercu />
    </>
  );
}
