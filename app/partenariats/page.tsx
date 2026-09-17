import Link from "next/link";
import { lireTextes } from "@/lib/textesStore";
import AccentCosmique from "@/components/AccentCosmique";
import FollowersTwitch from "@/components/FollowersTwitch";
import TexteRiche from "@/components/TexteRiche";
import {
  IconCrystal,
  IconStar4,
  IconPlanetRing,
  IconOrbit,
  IconMail,
} from "@/components/Icons";

const typesCollab = [
  { label: "Gaming", icon: IconCrystal },
  { label: "Événements", icon: IconStar4 },
  { label: "Marques", icon: IconPlanetRing },
  { label: "Sponsoring", icon: IconOrbit },
  { label: "Collaborations créateurs", icon: IconCrystal },
];

export default async function PartenariatsPage() {
  const textes = await lireTextes();
  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
      <AccentCosmique variante="planete" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        {textes.partenariats.titre}
      </h1>
      <TexteRiche
        html={textes.partenariats.intro}
        className="text-ink-soft leading-relaxed mb-4 max-w-2xl"
      />

      <div className="mb-8">
        <FollowersTwitch />
      </div>

      <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">
        {textes.partenariats.typesTitre}
      </p>
      <div className="flex flex-wrap gap-2 mb-10">
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
