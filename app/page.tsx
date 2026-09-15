import Hero from "@/components/Hero";
import StatutTwitch from "@/components/StatutTwitch";
import Planning from "@/components/Planning";
import AProposCourt from "@/components/AProposCourt";
import DerniersContenus from "@/components/DerniersContenus";
import CommunauteApercu from "@/components/CommunauteApercu";
import PartenariatsApercu from "@/components/PartenariatsApercu";

export default function AccueilPage() {
  return (
    <>
      <Hero />
      <StatutTwitch />
      <Planning />
      <AProposCourt />
      <DerniersContenus />
      <CommunauteApercu />
      <PartenariatsApercu />
    </>
  );
}
