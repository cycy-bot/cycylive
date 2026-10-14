"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Onglets des jeux du site : de vraies pages (/jeux, /jeux/gratter, /jeux/compagnon),
// donc les liens du menu du haut ouvrent toujours le bon jeu.
const JEUX = [
  { href: "/jeux", label: "🏃 Cycy Runner" },
  { href: "/jeux/gratter", label: "🎟️ Ticket à gratter" },
  { href: "/jeux/compagnon", label: "🥚 Compagnon" },
];

export default function OngletsJeux() {
  const chemin = usePathname();
  return (
    <nav aria-label="Jeux du site" className="flex flex-wrap gap-2 mb-6">
      {JEUX.map((j) => {
        const actif = chemin === j.href;
        return (
          <Link
            key={j.href}
            href={j.href}
            aria-current={actif ? "page" : undefined}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              actif ? "bg-violet text-ink shadow-glow-sm" : "border border-violet/25 text-ink-soft hover:bg-violet/10 hover:text-ink"
            }`}
          >
            {j.label}
          </Link>
        );
      })}
    </nav>
  );
}
