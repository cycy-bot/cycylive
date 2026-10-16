import Link from "next/link";
import Icone from "@/components/icones/Icone";
import { lireTextes } from "@/lib/textesStore";
import TexteRiche from "@/components/TexteRiche";
import {
  IconCrystal,
  IconStar4,
  IconPlanetRing,
  IconOrbit,
} from "@/components/Icons";

const typesCollab = [
  { label: "Gaming", icon: IconCrystal },
  { label: "Événements", icon: IconStar4 },
  { label: "Marques", icon: IconPlanetRing },
  { label: "Sponsoring", icon: IconOrbit },
  { label: "Collabs créateurs", icon: IconCrystal },
];

export default async function PartenariatsApercu() {
  const textes = await lireTextes();
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-10">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
            {textes.partenariats.titre}
          </h2>
          <TexteRiche
            html={textes.partenariats.intro}
            className="text-ink-soft leading-relaxed mb-6 max-w-md"
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href="/partenariats#bons-plans"
              className="inline-flex rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
            >
              <Icone nom="etiquette" className="w-5 h-5 mr-2" />Voir les codes promo
            </Link>
            <Link
              href="/partenariats"
              className="inline-flex rounded-full px-6 py-3 border border-violet/40 bg-violet/10 text-ink font-medium hover:bg-violet/20 transition-all"
            >
              {textes.partenariats.cta}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
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
      </div>
    </section>
  );
}
