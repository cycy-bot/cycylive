import Image from "next/image";
import { liens } from "@/data/liens";
import {
  IconTwitch,
  IconDiscord,
  IconTikTok,
  IconInstagram,
  IconYouTube,
} from "@/components/Icons";

const reseaux = [
  { icon: IconTwitch, href: liens.twitch, label: "Twitch" },
  { icon: IconTikTok, href: liens.tiktok, label: "TikTok" },
  { icon: IconInstagram, href: liens.instagram, label: "Instagram" },
  { icon: IconYouTube, href: liens.youtube, label: "YouTube" },
  { icon: IconDiscord, href: liens.discord, label: "Discord" },
];

export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-violet/10 mt-24">
      <div className="mx-auto max-w-6xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/cycylive-wordmark.png"
            alt="Cycylive"
            width={110}
            height={110}
            className="opacity-90"
          />
          <span className="text-ink-soft/60 text-xs ml-1">
            © {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {reseaux.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="h-11 w-11 flex items-center justify-center rounded-full border border-violet/20 text-ink-soft hover:text-ink hover:border-violet/50 hover:shadow-glow-sm transition-all"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-8 pb-8 text-xs text-ink-soft/60 flex gap-4">
        <a href="/mentions-legales" className="hover:text-ink-soft">Mentions légales</a>
        <a href="/confidentialite" className="hover:text-ink-soft">Politique de confidentialité</a>
      </div>
    </footer>
  );
}
