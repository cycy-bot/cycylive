import Link from "next/link";
import { textes } from "@/data/textes";
import {
  IconCrystal,
  IconStar4,
  IconPlanetRing,
  IconOrbit,
  IconMoonCrescent,
} from "@/components/Icons";

const typesCollab = [
  { label: "Gaming", icon: IconCrystal },
  { label: "Événements", icon: IconStar4 },
  { label: "Marques", icon: IconPlanetRing },
  { label: "Sponsoring", icon: IconOrbit },
  { label: "Campagnes sociales", icon: IconMoonCrescent },
  { label: "Collabs créateurs", icon: IconCrystal },
];

export default function PartenariatsApercu() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-14">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
            {textes.partenariats.titre}
          </h2>
          <p className="text-ink-soft leading-relaxed mb-6 max-w-md">
            {textes.partenariats.intro}
          </p>
          <Link
            href="/partenariats"
            className="inline-flex rounded-full px-6 py-3 border border-violet/40 bg-violet/10 text-ink font-medium hover:bg-violet/20 transition-all"
          >
            {textes.partenariats.cta}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {typesCollab.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="carte-holo rounded-xl p-4 flex items-center gap-2.5 text-sm text-ink-soft border border-violet/10"
            >
              <Icon className="w-4 h-4 text-violet-light shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
