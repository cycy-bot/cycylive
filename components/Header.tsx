"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { liens } from "@/data/liens";
import { useTwitchStatus } from "@/components/useTwitchStatus";
import { IconTwitch } from "@/components/Icons";

type LienNav = { type: "lien"; label: string; href: string };
type GroupeNav = { type: "groupe"; label: string; items: { label: string; href: string }[] };

const navItems: (LienNav | GroupeNav)[] = [
  { type: "lien", label: "Accueil", href: "/" },
  {
    type: "groupe",
    label: "Découvrir",
    items: [
      { label: "À propos", href: "/a-propos" },
      { label: "Statistiques", href: "/statistiques" },
    ],
  },
  {
    type: "groupe",
    label: "Gaming",
    items: [
      { label: "Valorant", href: "/gaming#valorant" },
      { label: "Autres jeux", href: "/gaming#autres-jeux" },
      { label: "Clips", href: "/gaming#clips" },
    ],
  },
  { type: "lien", label: "Réseaux", href: "/reseaux" },
  { type: "lien", label: "Cycy_Bot", href: "/cycybot" },
  { type: "lien", label: "Partenaires & Bons plans", href: "/partenariats" },
];

function IconChevronBas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CTATwitch({ enLigne, className }: { enLigne: boolean; className?: string }) {
  return (
    <a
      href={liens.twitch}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
        enLigne
          ? "bg-red-500 text-white hover:bg-red-400 shadow-glow"
          : "border border-violet/40 bg-violet/10 text-ink hover:bg-violet/20 hover:shadow-glow-sm"
      } ${className ?? ""}`}
    >
      <IconTwitch className="w-5 h-5" />
      {enLigne ? (
        <>
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          Voir le live
        </>
      ) : (
        "Voir la chaîne Twitch"
      )}
    </a>
  );
}

export default function Header() {
  const [ouvert, setOuvert] = useState(false);
  const [groupeOuvert, setGroupeOuvert] = useState<string | null>(null);
  const [groupeMobileOuvert, setGroupeMobileOuvert] = useState<string | null>(null);
  const { enLigne } = useTwitchStatus();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function fermerSiExterieur(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setGroupeOuvert(null);
      }
    }
    document.addEventListener("click", fermerSiExterieur);
    return () => document.removeEventListener("click", fermerSiExterieur);
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-violet/10 bg-void/70 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo/cycylive-icon.png"
            alt="Cycylive"
            width={46}
            height={46}
            className="rounded-full"
          />
          <span className="font-display font-semibold text-ink text-lg tracking-wide">
            Cycylive
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-soft">
          {navItems.map((item) =>
            item.type === "lien" ? (
              <Link key={item.href} href={item.href} className="hover:text-ink transition-colors">
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGroupeOuvert((prev) => (prev === item.label ? null : item.label));
                  }}
                  className="flex items-center gap-1 hover:text-ink transition-colors"
                >
                  {item.label}
                  <IconChevronBas
                    className={`w-3 h-3 transition-transform ${
                      groupeOuvert === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {groupeOuvert === item.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 rounded-2xl border border-violet/15 bg-nebula/95 backdrop-blur-md shadow-glow-sm py-2 z-50">
                    {item.items.map((sous) => (
                      <Link
                        key={sous.href}
                        href={sous.href}
                        onClick={() => setGroupeOuvert(null)}
                        className="block px-4 py-2 text-sm text-ink-soft hover:text-ink hover:bg-violet/10 transition-colors"
                      >
                        {sous.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </nav>

        <CTATwitch enLigne={enLigne} className="hidden md:inline-flex" />

        <button
          aria-label="Ouvrir le menu"
          onClick={() => setOuvert(!ouvert)}
          className="md:hidden text-ink p-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {ouvert && (
        <nav className="md:hidden border-t border-violet/10 bg-void/95 px-5 py-4 flex flex-col gap-1 text-ink-soft">
          {navItems.map((item) =>
            item.type === "lien" ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOuvert(false)}
                className="py-2.5 hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setGroupeMobileOuvert((prev) => (prev === item.label ? null : item.label))
                  }
                  className="w-full flex items-center justify-between py-2.5 hover:text-ink transition-colors"
                >
                  {item.label}
                  <IconChevronBas
                    className={`w-3.5 h-3.5 transition-transform ${
                      groupeMobileOuvert === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {groupeMobileOuvert === item.label && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {item.items.map((sous) => (
                      <Link
                        key={sous.href}
                        href={sous.href}
                        onClick={() => {
                          setOuvert(false);
                          setGroupeMobileOuvert(null);
                        }}
                        className="py-2 text-ink-soft/80 hover:text-ink transition-colors"
                      >
                        {sous.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
          <CTATwitch enLigne={enLigne} className="mt-2 justify-center" />
        </nav>
      )}
    </header>
  );
}
