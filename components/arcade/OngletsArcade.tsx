"use client";

import { useEffect, useState, type ReactNode } from "react";

// Deux jeux au même endroit : Cycy Runner et le ticket à gratter (/arcade#gratter).
type Onglet = "runner" | "gratter";

export default function OngletsArcade({ runner, gratter }: { runner: ReactNode; gratter: ReactNode }) {
  const [onglet, setOnglet] = useState<Onglet>("runner");

  useEffect(() => {
    const lire = () => setOnglet(window.location.hash === "#gratter" ? "gratter" : "runner");
    lire();
    window.addEventListener("hashchange", lire);
    return () => window.removeEventListener("hashchange", lire);
  }, []);

  const choisir = (o: Onglet) => {
    setOnglet(o);
    history.replaceState(null, "", o === "gratter" ? "#gratter" : window.location.pathname);
  };

  const bouton = (o: Onglet, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={onglet === o}
      onClick={() => choisir(o)}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
        onglet === o ? "bg-violet text-ink shadow-glow-sm" : "border border-violet/25 text-ink-soft hover:bg-violet/10 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div role="tablist" aria-label="Jeux de la borne" className="flex flex-wrap gap-2 mb-6">
        {bouton("runner", "🏃 Cycy Runner")}
        {bouton("gratter", "🎟️ Ticket à gratter")}
      </div>
      {/* Le jeu reste monté (pas de perte de partie en changeant d'onglet) */}
      <div hidden={onglet !== "runner"}>{runner}</div>
      <div hidden={onglet !== "gratter"}>{gratter}</div>
    </div>
  );
}
