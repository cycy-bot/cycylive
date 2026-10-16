"use client";

import { useMemo, useState } from "react";
import { Pastille } from "@/components/icones/Icone";
import { ICONE_GROUPE } from "@/components/icones/correspondances";
import type { CommandeCycyBot, GroupeCommandesDiscord, GroupeCommandesTwitch } from "@/lib/cycybot";

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

// Retire l'emoji de tête des descriptions Discord (déjà affiché dans le titre du groupe).
function sansEmoji(t: string): string {
  const i = t.indexOf(" ");
  return i > 0 && i <= 8 && !/[A-Za-z0-9À-ÿ]/.test(t.slice(0, i)) ? t.slice(i + 1) : t;
}

const sansAccent = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Onglet = "twitch" | "discord";

export default function CommandesCycyBot({
  toutLeMonde,
  groupesTwitch = [],
  discord = [],
  ongletInitial = "twitch",
}: {
  toutLeMonde: CommandeCycyBot[];
  groupesTwitch?: GroupeCommandesTwitch[];
  discord?: GroupeCommandesDiscord[];
  ongletInitial?: Onglet;
}) {
  const [recherche, setRecherche] = useState("");
  const [onglet, setOnglet] = useState<Onglet>(discord.length ? ongletInitial : "twitch");
  const terme = sansAccent(recherche.trim().replace(/^[!/]/, ""));

  const twitch = useMemo(
    () => toutLeMonde.filter((c) => !terme || sansAccent([c.name, ...c.aliases, c.description].join(" ")).includes(terme)),
    [toutLeMonde, terme]
  );
  const groupes = useMemo(
    () =>
      discord
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (c) =>
              !terme ||
              sansAccent([c.name, c.description, g.label, ...c.sub.flatMap((s) => [s.name, s.description])].join(" ")).includes(terme)
          ),
        }))
        .filter((g) => g.items.length),
    [discord, terme]
  );
  // Commandes Twitch classées par catégorie (si Cycy_Bot les fournit), sinon une seule liste
  const sectionsTwitch = useMemo(() => {
    const connus = groupesTwitch.filter((g) => twitch.some((c) => c.group === g.key)).map((g) => ({ ...g, items: twitch.filter((c) => c.group === g.key) }));
    const reste = twitch.filter((c) => !groupesTwitch.some((g) => g.key === c.group));
    return reste.length ? [...connus, { key: "autres", label: connus.length ? "Autres" : "", emoji: "", items: reste }] : connus;
  }, [groupesTwitch, twitch]);
  const nbDiscord = groupes.reduce((n, g) => n + g.items.length, 0);

  const onglets: { key: Onglet; label: string; n: number }[] = [
    { key: "twitch", label: "Chat Twitch", n: twitch.length },
    ...(discord.length ? [{ key: "discord" as Onglet, label: "Discord", n: nbDiscord }] : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label htmlFor="recherche-commande" className="sr-only">
          Rechercher une commande
        </label>
        <input
          id="recherche-commande"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher une commande, par exemple booster ou discord"
          autoComplete="off"
          className="w-full rounded-full bg-card border border-violet/20 px-5 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-violet/60 transition-colors"
        />
      </div>

      {onglets.length > 1 && (
        <div role="tablist" aria-label="Plateforme" className="flex flex-wrap gap-2 mb-6">
          {onglets.map((o) => (
            <button
              key={o.key}
              role="tab"
              type="button"
              aria-selected={onglet === o.key}
              onClick={() => setOnglet(o.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                onglet === o.key
                  ? "bg-violet text-white shadow-glow-sm"
                  : "border border-violet/25 text-ink-soft hover:bg-violet/10 hover:text-ink"
              }`}
            >
              {o.label} <span className="opacity-70">({o.n})</span>
            </button>
          ))}
        </div>
      )}

      {onglet === "twitch" ? (
        twitch.length === 0 ? (
          <p className="carte-holo rounded-2xl p-6 text-ink-soft text-sm">Aucune commande Twitch ne correspond à cette recherche.</p>
        ) : (
          <>
            <p className="text-sm text-ink-soft mb-4">À taper dans le chat Twitch pendant les lives. Les éléments entre crochets sont facultatifs.</p>
            <div className="space-y-8">
              {sectionsTwitch.map((g) => (
                <section key={g.key} aria-labelledby={g.label ? `groupe-twitch-${g.key}` : undefined}>
                  {g.label && (
                    <h2 id={`groupe-twitch-${g.key}`} className="flex items-center gap-2.5 text-lg font-semibold text-ink mb-3">
                      <Pastille nom={ICONE_GROUPE[g.key] || "etoile"} taille="xs" /> {g.label}
                    </h2>
                  )}
                  <ul className="carte-holo rounded-2xl overflow-hidden divide-y divide-violet/10">
                    {g.items.map((c) => (
                      <li key={c.name} className="grid md:grid-cols-[minmax(200px,280px)_1fr] gap-x-8 gap-y-1.5 px-5 md:px-6 py-4">
                        <div>
                          <code className="font-display font-semibold text-lilac">!{c.name}</code>
                          {["subscriber", "vip", "broadcaster"].includes(c.permission) && (
                            <span className="ml-2 align-middle rounded-full border border-lilac/30 px-2 py-0.5 text-[0.7rem] text-lilac">
                              {c.permissionLabel}
                            </span>
                          )}
                          {c.usage && <span className="ml-2 text-xs text-ink-soft/70">{c.usage}</span>}
                          {c.aliases.length > 0 && (
                            <span className="block text-xs text-ink-soft/50 mt-0.5">aussi {c.aliases.map((a) => `!${a}`).join(", ")}</span>
                          )}
                        </div>
                        <p className="text-sm text-ink-soft break-words">{lisible(c.description)}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )
      ) : groupes.length === 0 ? (
        <p className="carte-holo rounded-2xl p-6 text-ink-soft text-sm">Aucune commande Discord ne correspond à cette recherche.</p>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-ink-soft">
            À taper dans les salons du Discord : commence par <code className="text-lilac">/</code> et Discord te propose la suite.
            Les jeux et les cartes se jouent dans le salon CycyBot.
          </p>
          {groupes.map((g) => (
            <section key={g.key} aria-labelledby={`groupe-${g.key}`}>
              <h2 id={`groupe-${g.key}`} className="flex items-center gap-2.5 text-lg font-semibold text-ink mb-3">
                <Pastille nom={ICONE_GROUPE[g.key] || "etoile"} taille="xs" /> {g.label}
              </h2>
              <ul className="carte-holo rounded-2xl overflow-hidden divide-y divide-violet/10">
                {g.items.map((c) => (
                  <li key={c.name} className="grid md:grid-cols-[minmax(200px,280px)_1fr] gap-x-8 gap-y-1.5 px-5 md:px-6 py-4">
                    <div>
                      <code className="font-display font-semibold text-lilac">/{c.name}</code>
                      {c.options.length > 0 && (
                        <span className="ml-2 text-xs text-ink-soft/70">
                          {c.options.map((o) => (o.required ? `<${o.name}>` : `[${o.name}]`)).join(" ")}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-ink-soft break-words">
                      <p>{sansEmoji(c.description)}</p>
                      {c.sub.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {c.sub.map((s) => (
                            <li key={s.name} className="text-xs">
                              <code className="text-lilac/90">
                                /{c.name} {s.name}
                              </code>{" "}
                              · {sansEmoji(s.description)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
