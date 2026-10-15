"use client";
// Annuaire des Cycylien·nes : recherche instantanée parmi les profils publics.
import { useState } from "react";
import Link from "next/link";
import type { MembreAnnuaire } from "@/lib/membres";

export default function Annuaire({ membres }: { membres: MembreAnnuaire[] }) {
  const [q, setQ] = useState("");
  const terme = q.trim().toLowerCase();
  const liste = terme ? membres.filter((m) => m.name.toLowerCase().includes(terme) || m.slug.includes(terme)) : membres;
  return (
    <>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Chercher un·e Cycylien·ne…"
        aria-label="Chercher un membre"
        className="w-full max-w-md rounded-full bg-card border border-violet/20 px-5 py-3 text-ink outline-none focus:border-violet/60 mb-8"
      />
      {liste.length === 0 ? (
        <p className="text-ink-soft">{membres.length ? "Personne ne correspond." : "Aucun profil public pour l’instant : sois le ou la premier·e !"}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liste.map((m) => (
            <li key={m.slug}>
              <Link href={`/membres/${m.slug}`} className="carte-holo flex items-center gap-4 rounded-2xl border border-violet/15 p-4 hover:border-violet/45 hover:shadow-glow-sm transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.avatar} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 rounded-full object-cover shrink-0" style={{ boxShadow: `0 0 0 3px ${m.color}` }} />
                <span className="min-w-0">
                  <span className="block text-ink font-semibold truncate">{m.name}</span>
                  <span className="block text-sm text-ink-soft">
                    {m.orbit ? `Orbite ${m.orbit} · ` : ""}{m.role}{m.badges ? ` · 🏅 ${m.badges}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
