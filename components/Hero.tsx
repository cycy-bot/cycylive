"use client";

import Image from "next/image";
import { liens } from "@/data/liens";
import { textes } from "@/data/textes";
import { useTwitchStatus } from "@/components/useTwitchStatus";
import {
  IconTikTok,
  IconInstagram,
  IconYouTube,
  IconMail,
  IconStar4,
  IconOrbit,
} from "@/components/Icons";

export default function Hero() {
  const { enLigne } = useTwitchStatus();

  return (
    <section className="relative mx-auto max-w-6xl px-5 md:px-8 pt-14 pb-10 md:pt-20 md:pb-16 overflow-hidden">
      {/* décor cosmique discret, en arrière-plan de la section */}
      <IconStar4 className="hidden md:block absolute top-6 left-[42%] w-4 h-4 text-violet-light/60 animate-pulse" aria-hidden />
      <IconStar4 className="hidden md:block absolute bottom-10 left-10 w-3 h-3 text-lilac/50" aria-hidden />

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="animate-rise">
          <p className="eyebrow text-violet-light mb-5 flex items-center gap-2">
            {enLigne && (
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            )}
            {enLigne ? "En direct maintenant" : textes.hero.ligneCourte}
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ink glow-text leading-tight mb-4">
            {enLigne ? "Je suis en live !" : textes.hero.accroche}
          </h1>
          <p className="text-ink-soft text-lg mb-8 max-w-md">
            {enLigne
              ? "Rejoins le live en cours, ça se passe maintenant sur Twitch."
              : textes.hero.description}
          </p>

          <div className="flex flex-wrap gap-3 mb-9">
            <a
              href={liens.twitch}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full px-6 py-3 font-medium transition-all ${
                enLigne
                  ? "bg-red-500 text-white hover:bg-red-400 hover:shadow-glow"
                  : "bg-violet text-ink hover:bg-violet-light hover:shadow-glow"
              }`}
            >
              {enLigne ? "Rejoindre le live" : textes.hero.boutonPrincipal}
            </a>
            <a
              href={liens.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-3 border border-violet/40 bg-violet/10 text-ink font-medium hover:bg-violet/20 transition-all"
            >
              {textes.hero.boutonSecondaire}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a href={liens.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-violet/20 text-ink-soft hover:text-ink hover:border-violet/50 hover:shadow-glow-sm transition-all">
              <IconTikTok className="w-4 h-4" />
            </a>
            <a href={liens.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-violet/20 text-ink-soft hover:text-ink hover:border-violet/50 hover:shadow-glow-sm transition-all">
              <IconInstagram className="w-4 h-4" />
            </a>
            <a href={liens.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-violet/20 text-ink-soft hover:text-ink hover:border-violet/50 hover:shadow-glow-sm transition-all">
              <IconYouTube className="w-4 h-4" />
            </a>
            <a href={`mailto:${liens.mailPro}`} aria-label="Mail pro"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-violet/20 text-ink-soft hover:text-ink hover:border-violet/50 hover:shadow-glow-sm transition-all">
              <IconMail className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end animate-rise">
          <div
            className={`absolute -inset-6 rounded-full blur-3xl animate-drift ${
              enLigne ? "bg-red-500/20" : "bg-violet/20"
            }`}
            aria-hidden
          />
          <IconOrbit className="absolute -top-8 -left-6 w-24 h-24 text-violet-light/40 animate-spin-slow" aria-hidden />
          <div
            className={`relative w-64 md:w-80 aspect-[4/5] rounded-[2rem] overflow-hidden border ${
              enLigne ? "border-red-400/40" : "border-violet/25 liseret-glow"
            }`}
          >
            <Image
              src="/images/cycy-photo.jpg"
              alt="Cycy"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full border border-violet-light/40 animate-spin-slow" aria-hidden />
          <IconStar4 className="absolute -top-3 right-10 w-5 h-5 text-lilac animate-pulse" aria-hidden />
        </div>
      </div>
    </section>
  );
}
