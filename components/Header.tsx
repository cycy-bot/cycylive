"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { liens } from "@/data/liens";
import { useTwitchStatus } from "@/components/useTwitchStatus";
import { IconTwitch } from "@/components/Icons";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { jeuxArcade, jeuxQuotidiens } from "@/lib/jeux";

type SousLien = { label: string; href: string; icone?: NomIcone; note?: string };
type LienNav = { type: "lien"; label: string; href: string };
// Un groupe peut être découpé en colonnes titrées (menu « Jeux », qui a beaucoup d'entrées)
type GroupeNav = { type: "groupe"; label: string; items: SousLien[]; colonnes?: { titre: string; items: SousLien[]; pied?: SousLien }[] };

const versLien = (j: ReturnType<typeof jeuxArcade>[number]): SousLien => ({ label: j.nom, href: j.href, icone: j.icone, note: j.duree });

const navItems: (LienNav | GroupeNav)[] = [
  { type: "lien", label: "Accueil", href: "/" },
  {
    type: "groupe",
    label: "Découvrir",
    items: [
      { label: "À propos", href: "/a-propos" },
      { label: "Réseaux", href: "/reseaux" },
      { label: "Statistiques", href: "/statistiques" },
      { label: "Calendrier", href: "/calendrier" },
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
  {
    type: "groupe",
    label: "Cycy_Bot",
    items: [
      { label: "Présentation", href: "/cycybot" },
      { label: "L'univers Discord", href: "/cycybot#discord" },
      { label: "Figurines Cosmo-Capsules", href: "/cycybot#figurines" },
      { label: "Éclats & Marché noir", href: "/cycybot#galaxie" },
      { label: "Commandes", href: "/cycybot/commandes" },
      { label: "Leaderboard", href: "/cycybot/leaderboard" },
    ],
  },
  {
    type: "groupe",
    label: "Jeux",
    items: [
      { label: "Tous les jeux", href: "/jeux" },
      { label: "Récompenses du jour", href: "/jeux#quotidien" },
      { label: "Salle d'arcade", href: "/jeux#arcade" },
    ],
    colonnes: [
      { titre: "Récompenses du jour", items: jeuxQuotidiens().map(versLien), pied: { label: "Toutes les récompenses", href: "/jeux#quotidien" } },
      { titre: "Salle d'arcade", items: jeuxArcade().map(versLien), pied: { label: "Tous les jeux", href: "/jeux" } },
    ],
  },
  {
    type: "groupe",
    label: "Partenaires",
    items: [
      { label: "Bons plans & codes promo", href: "/partenariats#bons-plans" },
      { label: "Mes partenaires", href: "/partenariats#partenaires" },
      { label: "Devenir partenaire", href: "/partenariats#collaborer" },
    ],
  },
  {
    type: "groupe",
    label: "Soutenir",
    items: [
      { label: "Toutes les façons d'aider", href: "/soutenir" },
      { label: "Faire un don", href: "/soutenir#don" },
      { label: "S'abonner & Prime Gaming", href: "/soutenir#abonnement" },
      { label: "Soutenir gratuitement", href: "/soutenir#gratuit" },
    ],
  },
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
        <>
          <span className="xl:hidden">Twitch</span>
          <span className="hidden xl:inline">Voir la chaîne Twitch</span>
        </>
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

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm text-ink-soft">
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
                {groupeOuvert === item.label && item.colonnes && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[40rem] rounded-2xl border border-violet/15 bg-nebula/95 backdrop-blur-md shadow-glow-sm p-3 z-50 grid grid-cols-2 gap-2">
                    {item.colonnes.map((col) => (
                      <div key={col.titre} className="flex flex-col">
                        <p className="px-3 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-lilac/80">{col.titre}</p>
                        {col.items.map((sous) => (
                          <Link
                            key={sous.href}
                            href={sous.href}
                            onClick={() => setGroupeOuvert(null)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm text-ink-soft hover:text-ink hover:bg-violet/10 transition-colors"
                          >
                            {sous.icone && <Icone nom={sous.icone} className="w-4 h-4 shrink-0 text-lilac" />}
                            <span className="flex-1 truncate">{sous.label}</span>
                            {sous.note && <span className="text-[10px] text-ink-soft/50 shrink-0">{sous.note}</span>}
                          </Link>
                        ))}
                        {col.pied && (
                          <Link href={col.pied.href} onClick={() => setGroupeOuvert(null)} className="mt-auto px-3 pt-2 text-xs font-semibold text-lilac hover:text-ink transition-colors">
                            {col.pied.label} ›
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {groupeOuvert === item.label && !item.colonnes && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 rounded-2xl border border-violet/15 bg-nebula/95 backdrop-blur-md shadow-glow-sm py-2 z-50">
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

        <CTATwitch enLigne={enLigne} className="hidden lg:inline-flex" />

        <button
          aria-label="Ouvrir le menu"
          onClick={() => setOuvert(!ouvert)}
          className="lg:hidden text-ink p-2"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {ouvert && (
        <nav className="lg:hidden border-t border-violet/10 bg-void/95 px-5 py-4 flex flex-col gap-1 text-ink-soft">
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
                {groupeMobileOuvert === item.label && item.colonnes && (
                  <div className="pl-4 pb-2 grid grid-cols-2 gap-x-4">
                    {item.colonnes.map((col) => (
                      <div key={col.titre} className="flex flex-col">
                        <p className="pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-lilac/80">{col.titre}</p>
                        {[...col.items, ...(col.pied ? [col.pied] : [])].map((sous) => (
                          <Link
                            key={sous.href + sous.label}
                            href={sous.href}
                            onClick={() => {
                              setOuvert(false);
                              setGroupeMobileOuvert(null);
                            }}
                            className="py-1.5 text-sm text-ink-soft/80 hover:text-ink transition-colors"
                          >
                            {sous.icone && <Icone nom={sous.icone} className="w-3.5 h-3.5 mr-1.5 text-lilac" />}
                            {sous.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {groupeMobileOuvert === item.label && !item.colonnes && (
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
