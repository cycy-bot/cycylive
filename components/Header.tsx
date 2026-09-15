"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { liens } from "@/data/liens";
import { useTwitchStatus } from "@/components/useTwitchStatus";
import { IconTwitch } from "@/components/Icons";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Réseaux", href: "/reseaux" },
  { label: "Communauté", href: "/communaute" },
  { label: "Partenariats", href: "/partenariats" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [ouvert, setOuvert] = useState(false);
  const { enLigne } = useTwitchStatus();

  return (
    <header className="sticky top-0 z-50 border-b border-violet/10 bg-void/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo/cycylive-icon.png"
            alt="Cycylive"
            width={34}
            height={34}
            className="rounded-full"
          />
          <span className="font-display font-semibold text-ink text-lg tracking-wide">
            Cycylive
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-soft">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={liens.twitch}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border border-violet/40 bg-violet/10 text-ink hover:bg-violet/20 hover:shadow-glow-sm transition-all"
          >
            <IconTwitch className="w-4 h-4" />
            {enLigne ? (
              <>
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                EN LIVE
              </>
            ) : (
              "Voir le live"
            )}
          </a>
        </div>

        <button
          aria-label="Ouvrir le menu"
          onClick={() => setOuvert(!ouvert)}
          className="md:hidden text-ink p-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {ouvert && (
        <nav className="md:hidden border-t border-violet/10 bg-void/95 px-5 py-4 flex flex-col gap-4 text-ink-soft">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOuvert(false)}
              className="hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={liens.twitch}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium border border-violet/40 bg-violet/10 text-ink"
          >
            <IconTwitch className="w-4 h-4" />
            {enLigne ? "EN LIVE" : "Voir le live"}
          </a>
        </nav>
      )}
    </header>
  );
}
