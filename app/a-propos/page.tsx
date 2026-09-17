import Image from "next/image";
import Link from "next/link";
import { lireTextes } from "@/lib/textesStore";
import { lireTimeline } from "@/lib/timelineStore";
import AccentCosmique from "@/components/AccentCosmique";
import { IconStar4 } from "@/components/Icons";

function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 border-t border-violet/10 first:border-t-0 first:pt-0">
      <h2 className="text-xl md:text-2xl font-semibold text-ink mb-3">{titre}</h2>
      <div className="text-ink-soft leading-relaxed">{children}</div>
    </section>
  );
}

export default async function AProposPage() {
  const textes = await lireTextes();
  const timeline = await lireTimeline();
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

        <div>
          <Section titre={a.quiSuisJeTitre}>
            <p>{a.quiSuisJeTexte}</p>
          </Section>
        </div>
      </div>

      <Section titre={a.universTitre}>
        <p>{a.universTexte}</p>
      </Section>

      <Section titre={a.setupTitre}>
        <p>{a.setupTexte}</p>
      </Section>

      <Section titre={a.parcoursTitre}>
        <p>{a.parcoursTexte}</p>
      </Section>

      {timeline.length > 0 && (
        <section id="timeline" className="py-8 border-t border-violet/10 scroll-mt-24">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-6">
            Ma timeline
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

      <Section titre={a.passionsTitre}>
        <p>{a.passionsTexte}</p>
      </Section>

      <section className="py-8 border-t border-violet/10">
        <h2 className="text-xl md:text-2xl font-semibold text-ink mb-3">
          {a.collabTitre}
        </h2>
        <p className="text-ink-soft leading-relaxed mb-4">{a.collabTexte}</p>
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
