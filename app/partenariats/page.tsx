import Link from "next/link";
import { textes } from "@/data/textes";
import {
  IconCrystal,
  IconStar4,
  IconPlanetRing,
  IconOrbit,
  IconMoonCrescent,
  IconMail,
} from "@/components/Icons";

const typesCollab = [
  { label: "Gaming", icon: IconCrystal },
  { label: "Événements", icon: IconStar4 },
  { label: "Marques", icon: IconPlanetRing },
  { label: "Sponsoring", icon: IconOrbit },
  { label: "Campagnes sociales", icon: IconMoonCrescent },
  { label: "Collaborations créateurs", icon: IconCrystal },
];

export default function PartenariatsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-6">
        {textes.partenariats.titre}
      </h1>
      <p className="text-ink-soft leading-relaxed mb-10 max-w-2xl">
        {textes.partenariats.intro}
      </p>

      <h2 className="text-xl font-semibold text-ink mb-4">
        {textes.partenariats.typesTitre}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {typesCollab.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="carte-holo rounded-xl p-4 flex items-center gap-2.5 text-sm text-ink-soft border border-violet/12"
          >
            <Icon className="w-4 h-4 text-violet-light shrink-0" />
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
        >
          <IconMail className="w-4 h-4" />
          {textes.partenariats.cta}
        </Link>
        <button
          disabled
          title="Media kit à venir"
          className="inline-flex rounded-full px-6 py-3 border border-violet/20 text-ink-soft/50 font-medium cursor-not-allowed"
        >
          {textes.partenariats.mediaKit}
        </button>
      </div>
    </div>
  );
}
