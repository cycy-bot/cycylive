"use client";

// Barre de navigation entre les jeux : retour à la vitrine + accès direct à chaque jeu.
// Défile horizontalement sur mobile ; le jeu en cours est mis en avant.
import Link from "next/link";
import Icone from "@/components/icones/Icone";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { JEUX } from "@/lib/jeux";

export default function BarreJeux() {
  const chemin = usePathname();
  const liste = useRef<HTMLUListElement | null>(null);

  // Garde le jeu en cours visible dans la barre (mobile)
  useEffect(() => {
    const actif = liste.current?.querySelector<HTMLElement>("[aria-current='page']");
    actif?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [chemin]);

  return (
    <nav aria-label="Changer de jeu" className="mb-6 flex items-center gap-3">
      <Link
        href="/jeux"
        className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-violet/30 px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink hover:bg-violet/10 transition-colors"
      >
        <span aria-hidden>‹</span> Tous les jeux
      </Link>
      <ul ref={liste} className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {JEUX.map((j, i) => {
          const actif = chemin === j.href;
          const separe = i > 0 && JEUX[i - 1].famille !== j.famille;
          return (
            <li key={j.id} className={`shrink-0 flex items-center ${separe ? "pl-2 ml-1 border-l border-violet/20" : ""}`}>
              <Link
                href={j.href}
                aria-current={actif ? "page" : undefined}
                title={j.nom}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  actif ? "bg-violet text-ink shadow-glow-sm" : "text-ink-soft hover:bg-violet/10 hover:text-ink"
                }`}
              >
                <Icone nom={j.icone} className="w-[18px] h-[18px]" />
                <span className={actif ? "" : "hidden 2xl:inline"}>{j.nom}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
