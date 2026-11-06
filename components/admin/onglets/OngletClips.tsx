"use client";

// Administration — « Clips Twitch » : le tri se fait maintenant à un seul endroit, dans CycyBot
// (Studio créatrice › 🎞️ Clips Twitch : 🌐 sur le site · ✂️ à monter · 🗑️ supprimer). Ici : ce qui est en ligne.
import { useEffect, useState } from "react";

export default function OngletClips() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/clips-choix", { cache: "no-store" }).then((r) => r.json()).then((d) => setN((d.publies || []).length)).catch(() => setN(null));
  }, []);
  return (
    <div className="carte-holo rounded-2xl border border-violet/15 p-5 space-y-3">
      <p className="text-ink font-semibold">🎞️ Le tri des clips se fait dans CycyBot</p>
      <p className="text-sm text-ink-soft">Studio créatrice › 🎞️ Clips Twitch : les clips arrivent live par live, et pour chacun tu choisis 🌐 sur le site, ✂️ à monter ou 🗑️ supprimer. Le site se met à jour tout seul.</p>
      <p className="text-sm text-ink-soft">{n === null ? "" : `${n} clip${n > 1 ? "s" : ""} en ligne sur `}<a href="/gaming/clips" target="_blank" className="text-lilac underline">la page Clips</a>.</p>
    </div>
  );
}
