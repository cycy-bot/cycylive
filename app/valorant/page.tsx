import type { Metadata } from "next";
import { liens } from "@/data/liens";
import { lireTimeline } from "@/lib/timelineStore";
import {
  lireNewsValorant,
  lireClipsValorant,
  lireProfilValorant,
} from "@/lib/valorantStore";
import { ajouterMiniatures } from "@/lib/miniatures";
import AccentCosmique from "@/components/AccentCosmique";
import TexteRiche from "@/components/TexteRiche";
import CarouselFleches from "@/components/CarouselFleches";
import { IconValorant, IconTwitch, IconOrbit, IconOrbit as IconMap, IconCrystal } from "@/components/Icons";

function listeDepuisTexte(valeur: string): string[] {
  return valeur
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export const metadata: Metadata = {
  title: "Valorant | Cycylive",
  description:
    "Le rapport de Cycy à Valorant : rank, agents et maps favoris, clips marquants et actus.",
  alternates: { canonical: "/valorant" },
  openGraph: {
    title: "Valorant | Cycylive",
    description:
      "Le rapport de Cycy à Valorant : rank, agents et maps favoris, clips marquants et actus.",
    url: "/valorant",
  },
};

export default async function ValorantPage() {
  const [news, clips, profil, timeline] = await Promise.all([
    lireNewsValorant(),
    lireClipsValorant(),
    lireProfilValorant(),
    lireTimeline(),
  ]);
  const clipsAvecMiniatures = await ajouterMiniatures(
    clips.map((c) => ({ id: c.id, plateforme: "Twitch" as const, titre: c.titre, url: c.url, format: "vertical" as const }))
  );

  const agents = listeDepuisTexte(profil.agents);
  const maps = listeDepuisTexte(profil.maps);
  const momentsLies = timeline.filter((e) =>
    `${e.titre} ${e.description ?? ""}`.toLowerCase().includes("valorant")
  );

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
      <AccentCosmique variante="fusee" />
      <div className="flex items-center gap-3 mb-4">
        <span className="h-10 w-10 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
          <IconValorant className="w-5 h-5" />
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text">
          Valorant
        </h1>
      </div>
      <TexteRiche html={profil.intro} className="text-ink-soft leading-relaxed mb-6 max-w-2xl" />
      <a
        href={liens.twitch}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all mb-10"
      >
        <IconTwitch className="w-5 h-5" />
        Regarder mes lives Valorant
      </a>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="carte-holo rounded-2xl p-6 border border-violet/12">
          <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
            Rank actuel
          </p>
          <p className="text-2xl font-semibold text-ink">{profil.rankActuel}</p>
        </div>
        <div className="carte-holo rounded-2xl p-6 border border-violet/12">
          <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
            Objectif
          </p>
          <p className="text-2xl font-semibold text-lilac">{profil.objectifRank}</p>
        </div>
      </div>

      {profil.statsPerso && (
        <div className="carte-holo rounded-2xl p-5 border border-violet/12 mb-10">
          <p className="text-ink-soft text-sm">{profil.statsPerso}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="carte-holo rounded-2xl p-5 border border-violet/12">
          <IconCrystal className="w-5 h-5 text-violet-light mb-3" />
          <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
            Agents
          </p>
          {agents.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {agents.map((a) => (
                <span key={a} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-ink-soft">
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-ink font-medium">{profil.agents}</p>
          )}
        </div>
        <div className="carte-holo rounded-2xl p-5 border border-violet/12">
          <IconMap className="w-5 h-5 text-violet-light mb-3" />
          <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
            Maps favorites
          </p>
          {maps.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {maps.map((m) => (
                <span key={m} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-ink-soft">
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-ink font-medium">{profil.maps}</p>
          )}
        </div>
        <div className="carte-holo rounded-2xl p-5 border border-violet/12">
          <IconOrbit className="w-5 h-5 text-violet-light mb-3" />
          <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
            Skins / armes favoris
          </p>
          <p className="text-ink font-medium">{profil.skinsArmes}</p>
        </div>
      </div>

      {profil.trackerUrl && (
        <a
          href={profil.trackerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full px-5 py-2.5 border border-violet/40 bg-violet/10 text-ink text-sm font-medium hover:bg-violet/20 transition-all mb-10"
        >
          Voir le profil complet sur Tracker.gg
        </a>
      )}

      {clipsAvecMiniatures.length > 0 && (
        <section className="py-8 border-t border-violet/10">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">
            Clips marquants
          </h2>
          <CarouselFleches>
            {clipsAvecMiniatures.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-start shrink-0 w-40 carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm transition-all"
              >
                <div className="relative aspect-[9/16] bg-nebula flex items-center justify-center text-ink-soft/40 text-xs overflow-hidden">
                  {c.miniature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.miniature} alt={c.titre} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <span>Clip</span>
                  )}
                </div>
                <p className="p-3 text-sm text-ink line-clamp-2">{c.titre}</p>
              </a>
            ))}
          </CarouselFleches>
        </section>
      )}

      {momentsLies.length > 0 && (
        <section className="py-8 border-t border-violet/10">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">
            Des moments de l'aventure
          </h2>
          <div className="space-y-4">
            {momentsLies.map((etape) => (
              <div key={etape.id} className="carte-holo rounded-2xl p-4 border border-violet/12">
                <p className="text-xs uppercase tracking-wide text-violet-light mb-1">
                  {etape.date}
                </p>
                <h3 className="text-ink font-medium mb-1">{etape.titre}</h3>
                {etape.description && (
                  <p className="text-ink-soft text-sm leading-relaxed">{etape.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="py-8 border-t border-violet/10">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">
            News Valorant
          </h2>
          <div className="space-y-3">
            {news.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="carte-holo rounded-2xl p-4 flex items-center gap-3 border border-violet/12 hover:shadow-glow-sm hover:border-violet/30 transition-all"
              >
                <span className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
                  <IconValorant className="w-4 h-4" />
                </span>
                <span className="text-ink text-sm font-medium">{n.titre}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
