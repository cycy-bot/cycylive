import Image from "next/image";
import Link from "next/link";
import { lireTextes } from "@/lib/textesStore";
import { lireTimeline } from "@/lib/timelineStore";
import { lireSectionsAPropos } from "@/lib/aproposSectionsStore";
import AccentCosmique from "@/components/AccentCosmique";
import TexteRiche from "@/components/TexteRiche";
import SetupCards from "@/components/SetupCards";

export default async function AProposPage() {
  const textes = await lireTextes();
  const timeline = await lireTimeline();
  const sections = await lireSectionsAPropos();
  const [premiere, ...reste] = sections;

  function BlocTimeline() {
    if (timeline.length === 0) return null;
    return (
      <section id="timeline" className="py-8 border-t border-violet/10 scroll-mt-24">
        <h2 className="text-xl md:text-2xl font-semibold text-ink mb-6">
          Les moments qui ont marqué l'aventure
        </h2>
        <div className="space-y-5">
          {timeline.map((etape, index) => (
            <div key={etape.id} className="flex gap-4">
              <div className="flex flex-col items-center pt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-light shrink-0" />
                {index < timeline.length - 1 && (
                  <span className="w-px flex-1 bg-violet/20 mt-1" />
                )}
              </div>
              <div className="pb-2">
                <p className="text-xs uppercase tracking-wide text-violet-light mb-1">
                  {etape.date}
                </p>
                <h3 className="text-ink font-medium mb-1">{etape.titre}</h3>
                {etape.description && (
                  <p className="text-ink-soft text-sm leading-relaxed">
                    {etape.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
      <AccentCosmique variante="lune" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-10">
        {textes.apropos.pageTitre}
      </h1>

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
            <section key={section.id} className="py-8 border-t border-violet/10">
              <h2 className="text-xl md:text-2xl font-semibold text-ink mb-6">
                {section.titre}
              </h2>
              <SetupCards />
            </section>
          );
        }
        return (
          <section key={section.id} className="py-8 border-t border-violet/10">
            <h2 className="text-xl md:text-2xl font-semibold text-ink mb-3">
              {section.titre}
            </h2>
            <TexteRiche html={section.texte} className="text-ink-soft" />
          </section>
        );
      })}

      <section className="py-8 border-t border-violet/10">
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
