import Image from "next/image";
import Link from "next/link";
import { lireTextes } from "@/lib/textesStore";
import { lireTimeline } from "@/lib/timelineStore";
import { lireSectionsAPropos } from "@/lib/aproposSectionsStore";
import AccentCosmique from "@/components/AccentCosmique";
import TexteRiche from "@/components/TexteRiche";
import { IconStar4 } from "@/components/Icons";

export default async function AProposPage() {
  const textes = await lireTextes();
  const timeline = await lireTimeline();
  const sections = await lireSectionsAPropos();
  const a = textes.apropos;

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
      <AccentCosmique variante="lune" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-10">
        {a.pageTitre}
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

        {sections[0] && (
          <section className="py-2">
            <h2 className="text-xl md:text-2xl font-semibold text-ink mb-3">
              {sections[0].titre}
            </h2>
            <TexteRiche html={sections[0].texte} className="text-ink-soft" />
          </section>
        )}
      </div>

      {sections.slice(1).map((section) => (
        <section key={section.id} className="py-8 border-t border-violet/10">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-3">
            {section.titre}
          </h2>
          <TexteRiche html={section.texte} className="text-ink-soft" />
        </section>
      ))}

      {timeline.length > 0 && (
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
      )}

      <section className="py-8 border-t border-violet/10">
        <Link
          href="/partenariats"
          className="inline-flex items-center gap-1.5 text-violet-light hover:text-lilac transition-colors font-medium"
        >
          <IconStar4 className="w-3.5 h-3.5" />
          Voir la page Partenariats
        </Link>
      </section>
    </div>
  );
}
