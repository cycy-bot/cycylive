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
  IconDiscord,
  IconMail,
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
  id,
  nom,
  description,
  lien,
  icon: Icon,
  ctaLabel,
  children,
}: {
  id: string;
  nom: string;
  description: string;
  lien: string;
  icon: typeof IconTwitch;
  ctaLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="py-6 md:py-8 border-t border-violet/10 first:border-t-0 first:pt-0 scroll-mt-24">
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
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="fusee" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-6">
        Réseaux
      </h1>

      <nav className="flex flex-wrap gap-2 mb-10 text-xs">
        <a href="#twitch" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">Twitch</a>
        <a href="#tiktok" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">TikTok</a>
        <a href="#instagram" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">Instagram</a>
        <a href="#youtube" className="rounded-full border border-violet/20 px-3 py-1.5 text-ink-soft hover:text-ink hover:border-violet/40 transition-all">YouTube</a>
      </nav>

      <BlocPlateforme
        id="twitch"
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
        id="tiktok"
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
        id="instagram"
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
        id="youtube"
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

      <section className="py-6 md:py-8 border-t border-violet/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
              <IconDiscord className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink">Discord</h2>
              <p className="text-ink-soft text-sm">La communauté Cycylive au complet.</p>
            </div>
          </div>
          <a
            href={liens.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-4 py-2 bg-violet text-ink text-sm font-medium hover:bg-violet-light hover:shadow-glow transition-all shrink-0"
          >
            Rejoindre le Discord
          </a>
        </div>
      </section>

      <section className="py-6 md:py-8 border-t border-violet/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 shrink-0 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
              <IconMail className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink">Contact pro</h2>
              <p className="text-ink-soft text-sm">Pour les partenariats et demandes professionnelles.</p>
            </div>
          </div>
          <a
            href={`mailto:${liens.mailPro}`}
            className="rounded-full px-4 py-2 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 hover:text-ink transition-all shrink-0"
          >
            {liens.mailPro}
          </a>
        </div>
      </section>
    </div>
  );
}
