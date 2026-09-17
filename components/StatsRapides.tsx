"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconTwitch, IconDiscord } from "@/components/Icons";

type Stat = { icon: typeof IconTwitch; valeur: string; label: string };

export default function StatsRapides() {
  const [followers, setFollowers] = useState<number | null>(null);
  const [discordEnLigne, setDiscordEnLigne] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/followers")
      .then((r) => r.json())
      .then((d) => setFollowers(d.followers))
      .catch(() => {});
    fetch("/api/discord-stats")
      .then((r) => r.json())
      .then((d) => setDiscordEnLigne(d.enLigne))
      .catch(() => {});
  }, []);

  const stats: Stat[] = [];
  if (followers) {
    stats.push({ icon: IconTwitch, valeur: followers.toLocaleString("fr-FR"), label: "Followers Twitch" });
  }
  if (discordEnLigne) {
    stats.push({ icon: IconDiscord, valeur: discordEnLigne.toLocaleString("fr-FR"), label: "En ligne sur Discord" });
  }

  if (stats.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-6">
      <div className="flex flex-wrap items-center gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="carte-holo rounded-2xl pl-4 pr-5 py-3 flex items-center gap-3 border border-violet/12"
          >
            <s.icon className="w-5 h-5 text-violet-light shrink-0" />
            <div>
              <p className="text-ink font-semibold leading-tight">{s.valeur}</p>
              <p className="text-ink-soft/70 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
        <Link
          href="/statistiques"
          className="ml-auto text-sm text-violet-light hover:text-lilac transition-colors"
        >
          Voir toutes les statistiques
        </Link>
      </div>
    </section>
  );
}
