import { liens } from "@/data/liens";
import { contenus } from "@/data/contenus";
import {
  IconTwitch,
  IconTikTok,
  IconInstagram,
  IconYouTube,
  IconDiscord,
} from "@/components/Icons";

const plateformes = [
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

export default function ReseauxPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-16">
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
            <span className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink mb-1.5">{nom}</h2>
              <p className="text-ink-soft text-sm">{description}</p>
            </div>
          </a>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-ink mt-14 mb-6">
        Derniers clips Twitch
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {contenus
          .filter((c) => c.plateforme === "Twitch")
          .map((c) => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-40 carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm transition-all"
            >
              <div className="aspect-[9/16] bg-nebula flex items-center justify-center text-ink-soft/40 text-xs">
                Aperçu
              </div>
              <p className="p-3 text-sm text-ink line-clamp-2">{c.titre}</p>
            </a>
          ))}
      </div>
    </div>
  );
}
