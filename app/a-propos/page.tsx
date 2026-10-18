import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import Image from "next/image";
import Link from "next/link";
import { lireTextes } from "@/lib/textesStore";
import { lireTimeline, lireReglagesTimeline } from "@/lib/timelineStore";
import TimelineInteractive from "@/components/timeline/TimelineInteractive";
import { lireSectionsAPropos } from "@/lib/aproposSectionsStore";
import AccentCosmique from "@/components/AccentCosmique";
import TexteRiche from "@/components/TexteRiche";
import SetupCards from "@/components/SetupCards";

export const metadata: Metadata = {
  title: "À propos de Cycy | Cycylive",
  description:
    "Qui est Cycy, son univers, son setup et son parcours sur Twitch.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos de Cycy | Cycylive",
    description:
      "Qui est Cycy, son univers, son setup et son parcours sur Twitch.",
    url: "/a-propos",
  },
};

export default async function AProposPage() {
  const textes = await lireTextes();
  const [timeline, reglagesTimeline] = await Promise.all([lireTimeline(), lireReglagesTimeline()]);
  const sections = await lireSectionsAPropos();
  const [premiere, ...reste] = sections;

  function BlocTimeline() {
    return <TimelineInteractive etapes={timeline.filter((e) => !e.masque)} reglages={reglagesTimeline} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="lune" />
      <EntetePage surtitre="À propos" icone="etoile" titre={textes.apropos.pageTitre} />

      <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-start mb-4">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden liseret-glow border border-violet/25">
          <Image
            src="/images/cycy-photo.jpg"
            alt="Cycy"
            fill
            className="object-cover"
          />
        </div>

        {premiere && premiere.type === "texte" && (
          <section className="py-2">
            <h2 className="text-xl md:text-2xl font-semibold text-ink mb-3">
              {premiere.titre}
            </h2>
            <TexteRiche html={premiere.texte} className="text-ink-soft" />
          </section>
        )}
      </div>

      {reste.map((section) => {
        if (section.type === "timeline") {
          return <BlocTimeline key={section.id} />;
        }
        if (section.type === "setup") {
          return (
            <section key={section.id} className="py-6 md:py-8 border-t border-violet/10">
              <h2 className="text-xl md:text-2xl font-semibold text-ink mb-6">
                {section.titre}
              </h2>
              <SetupCards />
            </section>
          );
        }
        return (
          <section key={section.id} className="py-6 md:py-8 border-t border-violet/10">
            <h2 className="text-xl md:text-2xl font-semibold text-ink mb-3">
              {section.titre}
            </h2>
            <TexteRiche html={section.texte} className="text-ink-soft" />
          </section>
        );
      })}

      <section className="py-6 md:py-8 border-t border-violet/10">
        <Link
          href="/partenariats"
          className="inline-flex rounded-full px-6 py-3 border border-violet/40 bg-violet/10 text-ink font-medium hover:bg-violet/20 transition-all"
        >
          Découvrir la page Partenariats
        </Link>
      </section>
    </div>
  );
}
