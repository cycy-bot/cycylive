import type { Metadata } from "next";
import { liens } from "@/data/liens";
import { lireGaming } from "@/lib/gamingStore";
import { lireTimeline } from "@/lib/timelineStore";
import {
  lireNewsValorant,
  lireClipsValorant,
  lireProfilValorant,
} from "@/lib/valorantStore";
import { ajouterMiniatures } from "@/lib/miniatures";
import { obtenirRankValorant } from "@/lib/henrikApi";
import AccentCosmique from "@/components/AccentCosmique";
import TexteRiche from "@/components/TexteRiche";
import CarouselFleches from "@/components/CarouselFleches";
import {
  IconValorant,
  IconTwitch,
  IconOrbit,
  IconOrbit as IconMap,
  IconCrystal,
  IconStar4,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Gaming | Cycylive",
  description:
    "Valorant, autres jeux et clips marquants : tout l'univers gaming de Cycylive.",
  alternates: { canonical: "/gaming" },
  openGraph: {
    title: "Gaming | Cycylive",
    description:
      "Valorant, autres jeux et clips marquants : tout l'univers gaming de Cycylive.",
    url: "/gaming",
  },
};

function listeDepuisTexte(valeur: string): string[] {
  return valeur
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default async function GamingPage() {
  const [gaming, news, clips, profil, timeline] = await Promise.all([
    lireGaming(),
    lireNewsValorant(),
    lireClipsValorant(),
    lireProfilValorant(),
    lireTimeline(),
  ]);
  const clipsAvecMiniatures = await ajouterMiniatures(
    clips.map((c) => ({
      id: c.id,
      plateforme: "Twitch" as const,
      titre: c.titre,
      url: c.url,
      format: "vertical" as const,
    }))
  );

  const agents = listeDepuisTexte(profil.agents);
  const maps = listeDepuisTexte(profil.maps);
  const momentsLies = timeline.filter((e) =>
    `${e.titre} ${e.description ?? ""}`.toLowerCase().includes("valorant")
  );

  const rankEnDirect = await obtenirRankValorant(
    profil.riotName,
    profil.riotTag,
    profil.riotRegion
  );
  const rankAffiche = rankEnDirect ? rankEnDirect.rank : profil.rankActuel;

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="fusee" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        Gaming
      </h1>
      <TexteRiche html={gaming.intro} className="text-ink-soft leading-relaxed mb-10 max-w-2xl" />

      <section id="valorant" className="carte-holo rounded-3xl p-6 md:p-8 border border-violet/15 scroll-mt-24 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-10 w-10 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
            <IconValorant className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-semibold text-ink">Valorant</h2>
        </div>
        <TexteRiche html={profil.intro} className="text-ink-soft leading-relaxed mb-5" />

        <a
          href={liens.twitch}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all mb-8"
        >
          <IconTwitch className="w-5 h-5" />
          Regarder mes lives Valorant
        </a>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl p-5 bg-void/40 border border-violet/10">
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">Rank actuel</p>
            <p className="text-2xl font-semibold text-ink">{rankAffiche}</p>
            {rankEnDirect && (
              <p className="text-ink-soft/60 text-xs mt-1">
                {rankEnDirect.rr} RR · actualisé automatiquement
              </p>
            )}
          </div>
          <div className="rounded-2xl p-5 bg-void/40 border border-violet/10">
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">Objectif</p>
            <p className="text-2xl font-semibold text-lilac">{profil.objectifRank}</p>
          </div>
        </div>

        {profil.statsPerso && (
          <p className="text-ink-soft text-sm mb-6">{profil.statsPerso}</p>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl p-5 bg-void/40 border border-violet/10">
            <IconCrystal className="w-4 h-4 text-violet-light mb-2.5" />
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">Agents</p>
            {agents.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {agents.map((a) => (
                  <span key={a} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-ink-soft">{a}</span>
                ))}
              </div>
            ) : (
              <p className="text-ink text-sm font-medium">{profil.agents}</p>
            )}
          </div>
          <div className="rounded-2xl p-5 bg-void/40 border border-violet/10">
            <IconMap className="w-4 h-4 text-violet-light mb-2.5" />
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">Maps favorites</p>
            {maps.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {maps.map((m) => (
                  <span key={m} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-ink-soft">{m}</span>
                ))}
              </div>
            ) : (
              <p className="text-ink text-sm font-medium">{profil.maps}</p>
            )}
          </div>
          <div className="rounded-2xl p-5 bg-void/40 border border-violet/10">
            <IconOrbit className="w-4 h-4 text-violet-light mb-2.5" />
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">Skins / armes</p>
            <p className="text-ink text-sm font-medium">{profil.skinsArmes}</p>
          </div>
        </div>

        {profil.trackerUrl && (
          <a
            href={profil.trackerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full px-5 py-2.5 border border-violet/40 bg-violet/10 text-ink text-sm font-medium hover:bg-violet/20 transition-all"
          >
            Voir le profil complet sur Tracker.gg
          </a>
        )}

        {momentsLies.length > 0 && (
          <div className="mt-8 pt-6 border-t border-violet/10">
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">
              Des moments de l'aventure
            </p>
            <div className="space-y-3">
              {momentsLies.map((etape) => (
                <div key={etape.id} className="rounded-xl p-3.5 bg-void/40 border border-violet/10">
                  <p className="text-xs text-violet-light mb-0.5">{etape.date}</p>
                  <p className="text-ink text-sm font-medium">{etape.titre}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {news.length > 0 && (
          <div className="mt-8 pt-6 border-t border-violet/10">
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-3">News Valorant</p>
            <div className="space-y-2">
              {news.map((n) => (
                <a
                  key={n.id}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl p-3 bg-void/40 border border-violet/10 hover:border-violet/30 transition-all text-sm text-ink"
                >
                  <IconValorant className="w-3.5 h-3.5 text-violet-light shrink-0" />
                  {n.titre}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {gaming.autresJeux.length > 0 && (
        <section id="autres-jeux" className="py-6 md:py-8 border-t border-violet/10 scroll-mt-24">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">Autres jeux</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {gaming.autresJeux.map((jeu) => (
              <div key={jeu.id} className="carte-holo rounded-2xl p-5 border border-violet/12">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light mb-3">
                  <IconStar4 className="w-4 h-4" />
                </span>
                <h3 className="text-ink font-medium mb-1.5">{jeu.nom}</h3>
                <p className="text-ink-soft text-sm mb-2">{jeu.description}</p>
                {jeu.lienClip && (
                  <a
                    href={jeu.lienClip}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-light hover:text-lilac text-xs font-medium transition-colors"
                  >
                    Voir un contenu →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {gaming.jeuxDuMoment.length > 0 && (
        <section className="py-6 md:py-8 border-t border-violet/10">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">Jeux du moment</h2>
          <div className="flex flex-wrap gap-2">
            {gaming.jeuxDuMoment.map((jeu) => (
              <span
                key={jeu.id}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3.5 py-1.5 text-xs text-ink-soft/80"
              >
                {jeu.nom}
                <span className="text-violet-light/70">· {jeu.statut}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {clipsAvecMiniatures.length > 0 && (
        <section id="clips" className="py-6 md:py-8 border-t border-violet/10 scroll-mt-24">
          <h2 className="text-xl md:text-2xl font-semibold text-ink mb-5">Clips gaming</h2>
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
    </div>
  );
}
