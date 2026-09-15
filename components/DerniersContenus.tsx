import { contenus } from "@/data/contenus";
import {
  IconTikTok,
  IconInstagram,
  IconYouTube,
  IconTwitch,
} from "@/components/Icons";

const iconParPlateforme = {
  TikTok: IconTikTok,
  Instagram: IconInstagram,
  YouTube: IconYouTube,
  Twitch: IconTwitch,
};

export default function DerniersContenus() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-5 md:px-8 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink">
          Derniers contenus
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto px-5 md:px-8 pb-2 snap-x snap-mandatory scrollbar-hide">
        {contenus.map((contenu) => {
          const Icon = iconParPlateforme[contenu.plateforme];
          return (
            <a
              key={contenu.id}
              href={contenu.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`snap-start shrink-0 carte-holo rounded-2xl overflow-hidden hover:shadow-glow-sm transition-all ${
                contenu.format === "vertical" ? "w-40 md:w-48" : "w-64 md:w-80"
              }`}
            >
              <div
                className={`relative bg-nebula flex items-center justify-center text-ink-soft/30 text-xs ${
                  contenu.format === "vertical" ? "aspect-[9/16]" : "aspect-video"
                }`}
              >
                Aperçu
                <span className="absolute top-2 left-2 h-7 w-7 flex items-center justify-center rounded-full bg-void/70 border border-violet/30 text-violet-light">
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="p-3">
                <span className="eyebrow text-[10px] text-violet-light">
                  {contenu.plateforme}
                </span>
                <p className="text-sm text-ink mt-1.5 line-clamp-2">
                  {contenu.titre}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
