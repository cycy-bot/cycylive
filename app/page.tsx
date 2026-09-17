import Hero from "@/components/Hero";
import StatutTwitch from "@/components/StatutTwitch";
import StatsRapides from "@/components/StatsRapides";
import Planning from "@/components/Planning";
import AProposCourt from "@/components/AProposCourt";
import TimelineApercu from "@/components/TimelineApercu";
import DerniersContenus from "@/components/DerniersContenus";
import CommunauteApercu from "@/components/CommunauteApercu";
import PartenariatsApercu from "@/components/PartenariatsApercu";

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
