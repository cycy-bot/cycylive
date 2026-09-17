import type { Metadata } from "next";
import { liens } from "@/data/liens";
import { lireContenus } from "@/lib/contenusStore";
import { ajouterMiniatures, type ContenuAvecMiniature } from "@/lib/miniatures";
import AccentCosmique from "@/components/AccentCosmique";
import CarouselFleches from "@/components/CarouselFleches";
import {
  IconTwitch,
  IconTikTok,
  IconInstagram,
  IconYouTube,
} from "@/components/Icons";

function CarteVideo({ c, largeur }: { c: ContenuAvecMiniature; largeur: string }) {
  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`snap-start shrink-0 carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm hover:border-violet/30 transition-all ${largeur}`}
    >
      <div
        className={`relative bg-nebula flex items-center justify-center text-ink-soft/40 text-xs overflow-hidden ${
          c.format === "vertical" ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        {c.miniature ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.miniature}
            alt={c.titre}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span>{c.plateforme}</span>
        )}
      </div>
      <p className="p-3 text-sm text-ink line-clamp-2">{c.titre}</p>
    </a>
  );
}

function BlocPlateforme({
  nom,
  description,
  lien,
  icon: Icon,
  ctaLabel,
  children,
}: {
  nom: string;
  description: string;
  lien: string;
  icon: typeof IconTwitch;
  ctaLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="py-8 border-t border-violet/10 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-ink">{nom}</h2>
            <p className="text-ink-soft text-sm">{description}</p>
          </div>
        </div>
        <a
          href={lien}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full px-4 py-2 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 hover:text-ink transition-all shrink-0"
        >
          {ctaLabel}
        </a>
      </div>
      {children}
    </section>
  );
}

export const metadata: Metadata = {
  title: "Réseaux & contenus | Cycylive",
  description:
    "Retrouve Cycy sur Twitch, TikTok, Instagram et YouTube, avec les derniers contenus mis en avant.",
  alternates: { canonical: "/reseaux" },
  openGraph: {
    title: "Réseaux & contenus | Cycylive",
    description:
      "Retrouve Cycy sur Twitch, TikTok, Instagram et YouTube, avec les derniers contenus mis en avant.",
    url: "/reseaux",
  },
};

export default async function ReseauxPage() {
  const contenus = await ajouterMiniatures(await lireContenus());

  const clipsTwitch = contenus.filter((c) => c.plateforme === "Twitch");
  const tiktoks = contenus.filter((c) => c.plateforme === "TikTok");
  const reels = contenus.filter((c) => c.plateforme === "Instagram");
  const videosYoutube = contenus.filter((c) => c.plateforme === "YouTube");

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-12">
      <AccentCosmique variante="fusee" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-10">
        Réseaux
      </h1>

      <BlocPlateforme
        nom="Twitch"
        description="Lives gaming plusieurs fois par semaine, Valorant en tête d'affiche."
        lien={liens.twitch}
        icon={IconTwitch}
        ctaLabel="Voir la chaîne"
      >
        {clipsTwitch.length > 0 ? (
          <CarouselFleches>
            {clipsTwitch.map((c) => (
              <CarteVideo key={c.id} c={c} largeur="w-40" />
            ))}
          </CarouselFleches>
        ) : (
          <p className="text-ink-soft/50 text-sm">Aucun clip pour l'instant.</p>
        )}
      </BlocPlateforme>

      <BlocPlateforme
        nom="TikTok"
        description="Clips, moments forts et coulisses au format court."
        lien={liens.tiktok}
        icon={IconTikTok}
        ctaLabel="Voir le profil"
      >
        {tiktoks.length > 0 ? (
          <CarouselFleches>
            {tiktoks.map((c) => (
              <CarteVideo key={c.id} c={c} largeur="w-40" />
            ))}
          </CarouselFleches>
        ) : (
          <p className="text-ink-soft/50 text-sm">Aucune vidéo pour l'instant.</p>
        )}
      </BlocPlateforme>

      <BlocPlateforme
        nom="Instagram"
        description="Reels, photos et aperçu du quotidien."
        lien={liens.instagram}
        icon={IconInstagram}
        ctaLabel="Voir le profil"
      >
        {reels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {reels.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm hover:border-violet/30 transition-all"
              >
                <div className="relative aspect-square bg-nebula flex items-center justify-center text-ink-soft/40 text-xs overflow-hidden">
                  {c.miniature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.miniature}
                      alt={c.titre}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span>Instagram</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft/50 text-sm">Aucun contenu pour l'instant.</p>
        )}
      </BlocPlateforme>

      <BlocPlateforme
        nom="YouTube"
        description="Best-of, vidéos longues et Shorts."
        lien={liens.youtube}
        icon={IconYouTube}
        ctaLabel="Voir la chaîne"
      >
        {videosYoutube.length > 0 ? (
          <CarouselFleches>
            {videosYoutube.map((c) => (
              <CarteVideo key={c.id} c={c} largeur="w-72 md:w-96" />
            ))}
          </CarouselFleches>
        ) : (
          <p className="text-ink-soft/50 text-sm">Aucune vidéo pour l'instant.</p>
        )}
      </BlocPlateforme>
    </div>
  );
}
