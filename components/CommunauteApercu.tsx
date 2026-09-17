import { liens } from "@/data/liens";
import { lireTextes } from "@/lib/textesStore";
import TexteRiche from "@/components/TexteRiche";
import { IconDiscord, IconStar4 } from "@/components/Icons";

export default async function CommunauteApercu() {
  const textes = await lireTextes();
  return (
    <section id="communaute" className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-10 scroll-mt-24">
      <div className="relative carte-holo rounded-3xl p-8 md:p-12 text-center border border-violet/15 overflow-hidden">
        <IconStar4 className="absolute top-5 right-6 w-4 h-4 text-violet-light/40" aria-hidden />
        <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
          {textes.communaute.titre}
        </h2>
        <TexteRiche
          html={textes.communaute.texte}
          className="text-ink-soft max-w-xl mx-auto mb-7 leading-relaxed"
        />
        <a
          href={liens.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
        >
          <IconDiscord className="w-5 h-5" />
          Rejoindre le Discord
        </a>
      </div>
    </section>
  );
}
