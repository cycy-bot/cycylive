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
  IconDiscord,
} from "@/components/Icons";

const plateformes: {
  nom: string;
  description: string;
  lien: string;
  icon: typeof IconTwitch;
  accent?: boolean;
}[] = [
  {
    nom: "Twitch",
    description: "Lives gaming plusieurs fois par semaine.",
    lien: liens.twitch,
    icon: IconTwitch,
    accent: true,
  },
  {
    nom: "TikTok",
    description: "Clips, moments forts et coulisses au format court.",
    lien: liens.tiktok,
    icon: IconTikTok,
  },
  {
    nom: "Instagram",
    description: "Reels, photos et aperçu du quotidien.",
    lien: liens.instagram,
    icon: IconInstagram,
  },
  {
    nom: "YouTube",
    description: "Best-of, vidéos longues et Shorts.",
    lien: liens.youtube,
    icon: IconYouTube,
  },
  {
    nom: "Discord",
    description: "La communauté Cycylive au complet.",
    lien: liens.discord,
    icon: IconDiscord,
  },
];

function GalerieClips({ titre, items }: { titre: string; items: ContenuAvecMiniature[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <h2 className="text-2xl font-semibold text-ink mt-10 mb-6">{titre}</h2>
      <CarouselFleches>
        {items.map((c) => (
          <a
            key={c.id}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`snap-start shrink-0 carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm transition-all ${
              c.format === "vertical" ? "w-40" : "w-64"
            }`}
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
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span>{c.plateforme}</span>
              )}
            </div>
            <p className="p-3 text-sm text-ink line-clamp-2">{c.titre}</p>
          </a>
        ))}
      </CarouselFleches>
    </>
  );
}

export default async function ReseauxPage() {
  const contenus = await ajouterMiniatures(await lireContenus());

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-12">
      <AccentCosmique variante="fusee" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-10">
        Réseaux
      </h1>

      <div className="grid md:grid-cols-2 gap-5">
        {plateformes.map(({ nom, description, lien, icon: Icon, accent }) => (
          <a
            key={nom}
            href={lien}
            target="_blank"
            rel="noopener noreferrer"
            className={`carte-holo rounded-2xl p-6 flex items-start gap-4 hover:shadow-glow-sm transition-all border ${
              accent ? "border-violet/40" : "border-violet/12"
            }`}
          >
            <span className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
              <Icon className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink mb-1.5">{nom}</h2>
              <p className="text-ink-soft text-sm">{description}</p>
            </div>
          </a>
        ))}
      </div>

      <GalerieClips
        titre="Derniers clips Twitch"
        items={contenus.filter((c) => c.plateforme === "Twitch")}
      />
      <GalerieClips
        titre="Derniers TikTok"
        items={contenus.filter((c) => c.plateforme === "TikTok")}
      />
      <GalerieClips
        titre="Derniers Reels Instagram"
        items={contenus.filter((c) => c.plateforme === "Instagram")}
      />
      <GalerieClips
        titre="Dernières vidéos YouTube"
        items={contenus.filter((c) => c.plateforme === "YouTube")}
      />
    </div>
  );
}
