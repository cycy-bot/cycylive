import { liens } from "@/data/liens";
import { textes } from "@/data/textes";
import { IconDiscord, IconStar4 } from "@/components/Icons";

export default function CommunauteApercu() {
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-14">
      <div className="relative carte-holo rounded-3xl p-8 md:p-12 text-center border border-violet/15 overflow-hidden">
        <IconStar4 className="absolute top-5 right-6 w-4 h-4 text-violet-light/40" aria-hidden />
        <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
          {textes.communaute.titre}
        </h2>
        <p className="text-ink-soft max-w-xl mx-auto mb-7 leading-relaxed">
          {textes.communaute.texte}
        </p>
        <a
          href={liens.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
        >
          <IconDiscord className="w-4 h-4" />
          Rejoindre le Discord
        </a>
      </div>
    </section>
  );
}
