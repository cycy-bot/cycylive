"use client";
// ============================================================
// MUSÉE CYCYLIVE — frise interactive de l'histoire de la chaîne
// ============================================================
// Les étapes viennent de /admin → onglet « Timeline & Musée ».
import { useMemo, useState } from "react";
import { CATEGORIES_MUSEE, type EtapeTimeline } from "@/data/timeline";

function embedDe(url: string): string | null {
  const u = url.trim();
  let m = u.match(/clips\.twitch\.tv\/(?:embed\?clip=)?([\w-]+)/) || u.match(/twitch\.tv\/[\w]+\/clip\/([\w-]+)/);
  if (m) return `https://clips.twitch.tv/embed?clip=${m[1]}&parent=cycylive.fr&parent=www.cycylive.fr&parent=localhost&autoplay=false`;
  m = u.match(/youtu\.be\/([\w-]{6,})/) || u.match(/youtube\.com\/(?:watch\?v=|shorts\/|embed\/)([\w-]{6,})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  return null;
}

const anneeDe = (date: string) => (date.match(/(19|20)\d{2}/) || [""])[0];

export default function MuseeCycylive({ etapes }: { etapes: EtapeTimeline[] }) {
  const [filtre, setFiltre] = useState<string>("");
  const [ouvert, setOuvert] = useState<string | null>(etapes[0]?.id ?? null);
  const visibles = etapes.filter((e) => !e.masquerMusee);
  const categoriesPresentes = CATEGORIES_MUSEE.filter((c) => visibles.some((e) => e.categorie === c.valeur));
  const liste = filtre ? visibles.filter((e) => e.categorie === filtre || anneeDe(e.date) === filtre) : visibles;
  const annees = useMemo(() => [...new Set(visibles.map((e) => anneeDe(e.date)).filter(Boolean))], [visibles]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filtrer les moments">
        {[{ v: "", l: "✨ Tout" }, ...categoriesPresentes.map((c) => ({ v: c.valeur as string, l: `${c.emoji} ${c.label}` })), ...(annees.length > 1 ? annees.map((a) => ({ v: a, l: a })) : [])].map((f) => (
          <button
            key={f.v || "tout"}
            type="button"
            onClick={() => setFiltre(f.v)}
            aria-pressed={filtre === f.v}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${filtre === f.v ? "bg-violet text-ink" : "border border-violet/20 text-ink-soft hover:bg-violet/10"}`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <ol className="relative border-l-2 border-violet/25 ml-3 md:ml-0 md:border-l-0 space-y-8 md:space-y-0">
        <span aria-hidden className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-violet/60 via-lilac/30 to-transparent" />
        {liste.map((e, i) => {
          const cat = CATEGORIES_MUSEE.find((c) => c.valeur === e.categorie);
          const estOuvert = ouvert === e.id;
          const embed = e.clip ? embedDe(e.clip) : null;
          const souvenirs = (e.souvenirs || "").split("\n").map((s) => s.trim()).filter(Boolean);
          const gauche = i % 2 === 0;
          return (
            <li key={e.id} className={`relative md:grid md:grid-cols-2 md:gap-12 md:py-6 ${gauche ? "" : "md:[&>div]:col-start-2"}`}>
              <span aria-hidden className={`absolute -left-[13px] md:left-1/2 md:-translate-x-1/2 top-6 h-6 w-6 rounded-full grid place-items-center text-xs bg-void border-2 ${estOuvert ? "border-lilac shadow-glow" : "border-violet/50"}`}>
                {e.emoji || cat?.emoji || "✦"}
              </span>
              <div className={`pl-6 md:pl-0 ${gauche ? "md:text-right" : ""}`}>
                <button
                  type="button"
                  onClick={() => setOuvert(estOuvert ? null : e.id)}
                  aria-expanded={estOuvert}
                  className={`w-full text-left ${gauche ? "md:text-right" : ""} carte-holo rounded-3xl border p-5 md:p-6 transition-all ${estOuvert ? "border-lilac/50 shadow-glow-sm" : "border-violet/15 hover:border-violet/40"}`}
                >
                  <span className="block text-xs uppercase tracking-[0.18em] text-lilac mb-1">{e.date}{cat ? ` · ${cat.emoji} ${cat.label}` : ""}</span>
                  <span className="block text-xl md:text-2xl font-semibold text-ink">{e.titre}</span>
                  {e.description && <span className={`block text-ink-soft mt-2 ${estOuvert ? "" : "line-clamp-2"}`}>{e.description}</span>}
                  {(e.image || embed || souvenirs.length > 0) && !estOuvert && <span className="block text-xs text-lilac mt-3">Ouvrir le souvenir →</span>}
                </button>
                {estOuvert && (e.image || embed || souvenirs.length > 0) && (
                  <div className="mt-3 space-y-3 text-left">
                    {e.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.image} alt={e.titre} loading="lazy" className="w-full rounded-2xl border border-violet/20" />
                    )}
                    {embed && (
                      <div className="aspect-video rounded-2xl overflow-hidden border border-violet/20 bg-black">
                        <iframe src={embed} title={`Clip : ${e.titre}`} allowFullScreen loading="lazy" className="w-full h-full" />
                      </div>
                    )}
                    {e.clip && !embed && (
                      <a href={e.clip} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-lilac hover:text-ink">🎬 Voir le clip ↗</a>
                    )}
                    {souvenirs.length > 0 && (
                      <ul className="space-y-2">
                        {souvenirs.map((s, k) => {
                          const [texte, auteur] = s.split(/\s+[—–-]\s+(?=[^—–-]+$)/);
                          return (
                            <li key={k} className="rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3">
                              <p className="text-ink italic">« {texte} »</p>
                              {auteur && <p className="text-xs text-lilac mt-1">— {auteur}</p>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {liste.length === 0 && <p className="text-ink-soft">Aucun moment dans cette catégorie pour l’instant.</p>}
    </div>
  );
}
