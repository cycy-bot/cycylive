import Link from "next/link";
import { lireTimeline } from "@/lib/timelineStore";
import { IconStar4 } from "@/components/Icons";

export default async function TimelineApercu() {
  const timeline = await lireTimeline();
  const dernieresEtapes = timeline.slice(-3);

  if (dernieresEtapes.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink">Mon parcours</h2>
        <Link
          href="/a-propos#timeline"
          className="text-sm text-violet-light hover:text-lilac transition-colors hidden md:inline"
        >
          Découvrir le parcours complet
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {dernieresEtapes.map((etape) => (
          <div
            key={etape.id}
            className="carte-holo rounded-2xl p-5 border border-violet/12"
          >
            <IconStar4 className="w-4 h-4 text-violet-light mb-3" />
            <p className="text-xs uppercase tracking-wide text-violet-light mb-1.5">
              {etape.date}
            </p>
            <h3 className="text-ink font-medium mb-1.5">{etape.titre}</h3>
            {etape.description && (
              <p className="text-ink-soft text-sm leading-relaxed line-clamp-3">
                {etape.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <Link
        href="/a-propos#timeline"
        className="mt-5 inline-flex text-sm text-violet-light hover:text-lilac transition-colors md:hidden"
      >
        Découvrir le parcours complet
      </Link>
    </section>
  );
}
