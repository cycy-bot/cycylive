"use client";

import { useMemo, useState } from "react";
import type { CommandeCycyBot } from "@/lib/cycybot";

// Remplace les variables techniques par un texte lisible pour les visiteurs.
function lisible(texte: string): string {
  return texte
    .replace(/\s*\n\s*/g, " ")
    .replace(/\{fetch:[^}]+\}/g, "…")
    .replace(/\{user\}/g, "pseudo")
    .replace(/\{cible\}/g, "@quelqu'un")
    .replace(/\{channel\}/g, "Cycylive")
    .replace(/\{game\}/g, "le jeu en cours");
}

export default function CommandesCycyBot({ toutLeMonde }: { toutLeMonde: CommandeCycyBot[] }) {
  const [recherche, setRecherche] = useState("");

  const liste = toutLeMonde;
  const terme = recherche.trim().toLowerCase().replace(/^!/, "");

  const filtrees = useMemo(
    () =>
      liste.filter((c) =>
        !terme
          ? true
          : [c.name, ...c.aliases, c.description].join(" ").toLowerCase().includes(terme)
      ),
    [liste, terme]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label htmlFor="recherche-commande" className="sr-only">
          Rechercher une commande
        </label>
        <input
          id="recherche-commande"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une commande, par exemple discord"
          autoComplete="off"
          className="w-full rounded-full bg-card border border-violet/20 px-5 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-violet/60 transition-colors"
        />
      </div>

      {filtrees.length === 0 ? (
        <p className="carte-holo rounded-2xl p-6 text-ink-soft text-sm">
          Aucune commande ne correspond à cette recherche.
        </p>
      ) : (
        <ul className="carte-holo rounded-2xl overflow-hidden divide-y divide-violet/10">
          {filtrees.map((c) => (
            <li
              key={c.name}
              className="grid md:grid-cols-[minmax(200px,280px)_1fr] gap-x-8 gap-y-1.5 px-5 md:px-6 py-4"
            >
              <div>
                <code className="font-display font-semibold text-lilac">!{c.name}</code>
                {["subscriber", "vip", "broadcaster"].includes(c.permission) && (
                  <span className="ml-2 align-middle rounded-full border border-lilac/30 px-2 py-0.5 text-[0.7rem] text-lilac">
                    {c.permissionLabel}
                  </span>
                )}
                {c.usage && <span className="ml-2 text-xs text-ink-soft/70">{c.usage}</span>}
                {c.aliases.length > 0 && (
                  <span className="block text-xs text-ink-soft/50 mt-0.5">
                    aussi {c.aliases.map((a) => `!${a}`).join(", ")}
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-soft break-words">{lisible(c.description)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
