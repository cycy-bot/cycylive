import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import GalerieClips from "@/components/gaming/GalerieClips";
import CarouselFleches from "@/components/CarouselFleches";
import ImageMiniature from "@/components/ImageMiniature";
import TitreSection from "@/components/icones/TitreSection";
import Icone, { Pastille } from "@/components/icones/Icone";
import { liens } from "@/data/liens";
import { lireChoixClips, clipsAffiches } from "@/lib/clipsChoixStore";
import { derniersClipsTwitch } from "@/lib/clipsTwitch";
import { lireClipsValorant } from "@/lib/valorantStore";
import { ajouterMiniatures } from "@/lib/miniatures";

export const metadata: Metadata = {
  title: "Clips | Cycylive",
  description: "Les meilleurs moments des lives de Cycylive, rangés live par live : Valorant, parties persos et autres jeux.",
  alternates: { canonical: "/gaming/clips" },
  openGraph: { title: "Clips | Cycylive", description: "Les meilleurs moments des lives, live par live.", url: "/gaming/clips" },
};

export const revalidate = 300;

const twitchLogin = liens.twitch.replace(/\/+$/, "").split("/").pop() || "cycylive";

export default async function PageClips() {
  const [choix, recents, manuels] = await Promise.all([lireChoixClips(), derniersClipsTwitch(60).catch(() => []), lireClipsValorant()]);
  const clips = clipsAffiches(choix, recents, 300);
  const preferes = await ajouterMiniatures(manuels.map((c) => ({ id: c.id, plateforme: "Twitch" as const, titre: c.titre, url: c.url, format: "vertical" as const })));

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8 py-8 md:py-12">
      <EntetePage
        surtitre="Gaming" icone="clap"
        titre="Les clips des lives"
        retour={{ href: "/gaming", label: "Gaming" }}
        intro={<>Les meilleurs moments, clippés par la commu et rangés live par live. Tape <code className="text-lilac">!clip</code> pendant un live pour en créer un&nbsp;!</>}
      >
        <a href={`https://www.twitch.tv/${twitchLogin}/clips`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-lilac hover:text-ink">
          Tous les clips sur Twitch <Icone nom="externe" className="w-4 h-4" />
        </a>
      </EntetePage>

      {clips.length > 0 ? (
        <GalerieClips clips={clips} />
      ) : (
        <a href={`https://www.twitch.tv/${twitchLogin}/clips`} target="_blank" rel="noopener noreferrer" className="carte-holo flex items-center gap-4 rounded-2xl p-6 hover:shadow-glow-sm transition-all">
          <Pastille nom="clap" taille="lg" />
          <span className="text-ink-soft">Les prochains clips arrivent ici très vite. En attendant, retrouve-les tous sur Twitch.</span>
        </a>
      )}

      {preferes.length > 0 && (
        <section className="mt-16" aria-labelledby="preferes-titre">
          <TitreSection id="preferes-titre" niveau={2} icone="cible" teinte="rose" className="mb-4">Mes clips Valorant préférés</TitreSection>
          <CarouselFleches>
            {preferes.map((c) => (
              <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="snap-start shrink-0 w-40 carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm transition-all">
                <div className="relative aspect-[9/16] bg-nebula flex items-center justify-center text-ink-soft/60 text-xs overflow-hidden">
                  {c.miniature ? <ImageMiniature src={c.miniature} video={c.url} alt={c.titre} loading="lazy" className="absolute inset-0 w-full h-full object-cover" /> : <span>Clip</span>}
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
