"use client";

import { liens } from "@/data/liens";
import { useTwitchStatus } from "@/components/useTwitchStatus";
import { IconTwitch, IconDiscord, IconInstagram } from "@/components/Icons";

export default function BarreMobile() {
  const { enLigne } = useTwitchStatus();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-violet/15 bg-void/95 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3">
      <a
        href={liens.twitch}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-all ${
          enLigne
            ? "bg-red-500 text-white"
            : "border border-violet/40 bg-violet/10 text-ink"
        }`}
      >
        <IconTwitch className="w-5 h-5" />
        {enLigne ? "EN LIVE" : "Twitch"}
      </a>
      <a
        href={liens.discord}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium border border-violet/20 text-ink-soft"
      >
        <IconDiscord className="w-5 h-5" />
        Discord
      </a>
      <a
        href={liens.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium border border-violet/20 text-ink-soft"
      >
        <IconInstagram className="w-5 h-5" />
        Réseaux
      </a>
    </div>
  );
}
