"use client";

// Administration — rubrique « contenus » (état partagé : components/admin/contexteAdmin.tsx)
import { useState } from "react";
import { type Contenu, plateformeDe, miniatureYoutubeDe } from "@/data/contenus";
import { genererId } from "@/components/admin/communs";
import { PLATEFORMES } from "@/components/admin/communs";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletContenus() {
  const { contenus, setContenus, enregistrement, modifierContenu, ajouterContenu, supprimerContenu, deplacerContenu, enregistrer } = useAdmin();
  const [colle, setColle] = useState("");
  // Coller un ou plusieurs liens : plateforme et format devinés, ajoutés en haut de la liste
  const ajouterLiens = () => {
    const urls = colle.split(/\s+/).map((x) => x.trim()).filter((x) => /^https?:\/\//i.test(x) && !contenus.some((c) => c.url === x));
    if (!urls.length) return;
    setContenus((prev) => [...urls.map((url) => ({ id: genererId(), url, titre: "", ...(plateformeDe(url) ?? { plateforme: "TikTok" as const, format: "vertical" as const }) })), ...prev]);
    setColle("");
  };
  return (
        <>
          <p className="text-ink-soft mb-4 text-sm">
            Colle le lien de ta vidéo (TikTok, Reel Instagram, YouTube ou clip Twitch) : la plateforme et le format sont
            reconnus tout seuls. Donne-lui un titre, range-les dans l’ordre voulu, puis enregistre.
          </p>
          <div className="carte-holo rounded-2xl p-4 mb-6 border border-violet/20 flex flex-wrap gap-2">
            <textarea
              value={colle}
              onChange={(e) => setColle(e.target.value)}
              rows={2}
              placeholder="Colle un ou plusieurs liens ici (un par ligne)…"
              className="flex-1 min-w-[240px] rounded-lg bg-card border border-violet/20 px-3 py-2 text-sm text-ink outline-none focus:border-violet/60"
            />
            <button type="button" onClick={ajouterLiens} className="self-start rounded-full px-4 py-2 bg-violet text-ink text-sm font-medium hover:bg-violet-light">＋ Ajouter</button>
          </div>

          <div className="space-y-3 mb-4">
            {contenus.map((c, index) => (
              <div
                key={c.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2">
                  <select
                    value={c.plateforme}
                    onChange={(e) =>
                      modifierContenu(index, {
                        plateforme: e.target.value as Contenu["plateforme"],
                      })
                    }
                    className="rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  >
                    {PLATEFORMES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <select
                    value={c.format}
                    onChange={(e) =>
                      modifierContenu(index, {
                        format: e.target.value as Contenu["format"],
                      })
                    }
                    className="rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  >
                    <option value="vertical">Vertical (TikTok/Reel)</option>
                    <option value="horizontal">Horizontal (YouTube)</option>
                  </select>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => deplacerContenu(index, -1)}
                      disabled={index === 0}
                      aria-label="Monter"
                      title="Monter"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerContenu(index, 1)}
                      disabled={index === contenus.length - 1}
                      aria-label="Descendre"
                      title="Descendre"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerContenu(index)}
                      aria-label="Supprimer"
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Titre de la vidéo"
                  value={c.titre}
                  onChange={(e) => modifierContenu(index, { titre: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <div className="flex items-center gap-2">
                  {miniatureYoutubeDe(c.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={miniatureYoutubeDe(c.url)} alt="" className="w-20 h-11 rounded-md object-cover shrink-0" />
                  ) : null}
                  <input
                    type="text"
                    placeholder="Lien de la vidéo (https://...)"
                    value={c.url}
                    onChange={(e) => { const d = plateformeDe(e.target.value); modifierContenu(index, d ? { url: e.target.value, ...d } : { url: e.target.value }); }}
                    className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <a href={c.url || "#"} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-lilac hover:underline">Voir ↗</a>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={ajouterContenu}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-6"
          >
            + Ajouter une vidéo
          </button>

          <button
            onClick={() =>
              enregistrer("/api/contenus", { contenus }, "Contenus enregistrés et visibles sur le site !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les contenus"}
          </button>
        </>
  );
}
