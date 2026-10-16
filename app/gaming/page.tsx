import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import { liens } from "@/data/liens";
import { lireGaming } from "@/lib/gamingStore";
import { lireTimeline } from "@/lib/timelineStore";
import { lireNewsValorant, lireClipsValorant, lireProfilValorant } from "@/lib/valorantStore";
import { ajouterMiniatures } from "@/lib/miniatures";
import { rangActuel, lireRang, positionRang, PALIERS } from "@/lib/rangValorant";
import { derniersClipsTwitch, type ClipTwitch } from "@/lib/clipsTwitch";
import AccentCosmique from "@/components/AccentCosmique";
import TexteRiche from "@/components/TexteRiche";
import CarouselFleches from "@/components/CarouselFleches";
import EmblemeRang from "@/components/gaming/EmblemeRang";
import { IconValorant, IconTwitch, IconStar4 } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Gaming | Cycylive",
  description: "Valorant (rank en direct, agents, maps), les derniers clips Twitch et les autres jeux de Cycylive.",
  alternates: { canonical: "/gaming" },
  openGraph: {
    title: "Gaming | Cycylive",
    description: "Valorant, les derniers clips Twitch et les autres jeux de Cycylive.",
    url: "/gaming",
  },
};

export const revalidate = 600;

const liste = (valeur: string) =>
  valeur
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v && !/^à définir$/i.test(v));

const twitchLogin = liens.twitch.replace(/\/+$/, "").split("/").pop() || "cycylive";

function ilYa(iso: string): string {
  const j = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (j <= 0) return "aujourd'hui";
  if (j === 1) return "hier";
  if (j < 30) return `il y a ${j} jours`;
  const m = Math.floor(j / 30);
  return m < 12 ? `il y a ${m} mois` : new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const SOURCE = { henrik: "Actualisé automatiquement", bot: "En direct, comme !rank sur le live", manuel: "Mis à jour par Cycy" } as const;

function CarteClip({ c }: { c: ClipTwitch }) {
  return (
    <a href={c.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-violet/15 bg-card/80 transition-all hover:-translate-y-1 hover:border-violet/50 hover:shadow-glow-sm">
      <div className="relative aspect-video overflow-hidden bg-nebula">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.miniature} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30" aria-hidden>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet/90 text-white opacity-0 shadow-glow transition-opacity group-hover:opacity-100">▶</span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">{mmss(c.duree)}</span>
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white">👁 {c.vues.toLocaleString("fr-FR")}</span>
      </div>
      <div className="p-3.5">
        <p className="line-clamp-2 text-sm font-medium text-ink" title={c.titre}>{c.titre}</p>
        <p className="mt-1 truncate text-xs text-ink-soft/70">
          {[c.jeu, ilYa(c.date), c.auteur ? `clippé par ${c.auteur}` : ""].filter(Boolean).join(" · ")}
        </p>
      </div>
    </a>
  );
}

export default async function GamingPage() {
  const [gaming, news, clipsManuels, profil, timeline, clipsTwitch] = await Promise.all([
    lireGaming(),
    lireNewsValorant(),
    lireClipsValorant(),
    lireProfilValorant(),
    lireTimeline(),
    derniersClipsTwitch(12).catch(() => []),
  ]);
  const clipsValorant = await ajouterMiniatures(
    clipsManuels.map((c) => ({ id: c.id, plateforme: "Twitch" as const, titre: c.titre, url: c.url, format: "vertical" as const }))
  );

  const agents = liste(profil.agents);
  const maps = liste(profil.maps);
  const skins = liste(profil.skinsArmes);
  const moments = timeline.filter((e) => `${e.titre} ${e.description ?? ""}`.toLowerCase().includes("valorant"));

  const rang = await rangActuel(profil.riotName, profil.riotTag, profil.riotRegion, profil.rankActuel);
  const objectif = lireRang(profil.objectifRank);
  const ecart = rang && objectif ? positionRang(objectif) - positionRang(rang) : null;
  const progression = rang && objectif ? Math.max(4, Math.min(100, Math.round((positionRang(rang) / Math.max(1, positionRang(objectif))) * 100))) : null;

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="fusee" />
      <EntetePage
        surtitre="🎮 Gaming"
        titre="Les jeux de mes lives"
        intro={<TexteRiche html={gaming.intro} />}
        sommaire={[
          { href: "#valorant", label: "🎯 Valorant" },
          { href: "#clips", label: "🎬 Derniers clips" },
          ...(gaming.autresJeux.length ? [{ href: "#autres-jeux", label: "🕹️ Autres jeux" }] : []),
        ]}
      />

      {/* ── Valorant ── */}
      <section id="valorant" className="scroll-mt-24 mb-14" aria-labelledby="valorant-titre">
        <div
          className="relative overflow-hidden rounded-3xl border border-rose-400/25 p-6 md:p-8"
          style={{ background: "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(255,70,85,.18), transparent 60%), linear-gradient(160deg, #1a0d18, #0d0a17 65%)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-300">
              <IconValorant className="w-5 h-5" />
            </span>
            <h2 id="valorant-titre" className="text-2xl md:text-3xl font-semibold text-ink">Valorant</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* Rank */}
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 md:p-6">
              {rang ? (
                <div className="flex items-center gap-5">
                  <div className="shrink-0">
                    <EmblemeRang palier={rang.palier} division={rang.division} taille={112} id="actuel" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-ink-soft/60">Rank actuel</p>
                    <p className="text-3xl font-semibold" style={{ color: rang.palier.clair }}>{rang.libelle}</p>
                    {rang.rr != null && rang.palier.cle !== "Radiant" && (
                      <div className="mt-2 max-w-[220px]">
                        <div className="flex justify-between text-xs text-ink-soft"><span>{rang.rr} RR</span><span>100</span></div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, rang.rr)}%`, background: `linear-gradient(90deg, ${rang.palier.couleur}, ${rang.palier.clair})` }} />
                        </div>
                      </div>
                    )}
                    {rang.rr != null && rang.palier.cle === "Radiant" && <p className="text-sm text-ink-soft">{rang.rr} RR</p>}
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft/70">
                      {rang.source !== "manuel" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />}
                      {SOURCE[rang.source]}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-soft/60">Rank actuel</p>
                  <p className="text-2xl font-semibold text-ink">{profil.rankActuel}</p>
                </div>
              )}

              {objectif && (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="flex items-center gap-3">
                    <EmblemeRang palier={objectif.palier} division={objectif.division} taille={44} id="objectif" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wide text-ink-soft/60">Objectif</p>
                      <p className="font-semibold" style={{ color: objectif.palier.clair }}>{objectif.libelle}</p>
                    </div>
                    {ecart != null && (
                      <p className="text-right text-sm text-ink-soft">
                        {ecart <= 0 ? "🎉 Objectif atteint !" : `encore ${ecart} palier${ecart > 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>
                  {progression != null && (
                    <div className="mt-3 flex gap-0.5" aria-hidden>
                      {PALIERS.map((p, i) => (
                        <span key={p.cle} className="h-1.5 flex-1 rounded-full" style={{ background: i * 3 <= positionRang(rang!) ? p.couleur : "rgba(255,255,255,.08)", outline: i === PALIERS.indexOf(objectif.palier) ? `1px solid ${p.clair}` : undefined }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!objectif && profil.objectifRank && !/^à définir$/i.test(profil.objectifRank) && (
                <p className="mt-5 text-sm text-ink-soft">🎯 Objectif : <span className="text-ink">{profil.objectifRank}</span></p>
              )}
            </div>

            {/* Présentation */}
            <div className="flex flex-col">
              <TexteRiche html={profil.intro} className="text-ink-soft leading-relaxed" />
              {profil.statsPerso && <p className="mt-3 text-sm text-ink">📈 {profil.statsPerso}</p>}

              {(agents.length > 0 || maps.length > 0 || skins.length > 0) && (
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  {agents.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wide text-ink-soft/60 mb-2">Agents joués</dt>
                      <dd className="flex flex-wrap gap-2">
                        {agents.map((a) => (
                          <span key={a} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-400/[0.07] px-3 py-1.5 text-sm text-ink">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-400/25 text-[11px] font-bold text-rose-100" aria-hidden>{a.slice(0, 2).toUpperCase()}</span>
                            {a}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {maps.length > 0 && (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-ink-soft/60 mb-2">Maps favorites</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {maps.map((m) => <span key={m} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-ink-soft">🗺️ {m}</span>)}
                      </dd>
                    </div>
                  )}
                  {skins.length > 0 && (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-ink-soft/60 mb-2">Skins & armes</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {skins.map((m) => <span key={m} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-ink-soft">🔫 {m}</span>)}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              <div className="mt-auto pt-6 flex flex-wrap gap-3">
                <a href={liens.twitch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-light hover:shadow-glow transition-all">
                  <IconTwitch className="w-4 h-4" />
                  Regarder mes ranked en live
                </a>
                {profil.trackerUrl && (
                  <a href={profil.trackerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink hover:bg-white/5 transition-all">
                    Mon profil Tracker.gg ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {(news.length > 0 || moments.length > 0) && (
            <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
              {moments.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-soft/60 mb-3">🏆 Des moments de l&apos;aventure</p>
                  <ol className="relative space-y-3 border-l border-rose-300/25 pl-4">
                    {moments.map((e) => (
                      <li key={e.id}>
                        <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden />
                        <p className="text-xs text-rose-200/80">{e.date}</p>
                        <p className="text-sm font-medium text-ink">{e.titre}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {news.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-soft/60 mb-3">📰 News Valorant</p>
                  <div className="space-y-2">
                    {news.map((n) => (
                      <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-ink hover:border-rose-300/40 transition-all">
                        <IconValorant className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                        <span className="min-w-0 flex-1">{n.titre}</span>
                        <span aria-hidden className="text-ink-soft/50">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Clips ── */}
      <section id="clips" className="scroll-mt-24 mb-14" aria-labelledby="clips-titre">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="clips-titre" className="text-2xl md:text-3xl font-semibold text-ink">🎬 Les derniers clips</h2>
            <p className="mt-1 text-ink-soft">Les meilleurs moments des lives, clippés par la commu. Tape <code className="text-lilac">!clip</code> pendant un live pour en créer un&nbsp;!</p>
          </div>
          <a href={`https://www.twitch.tv/${twitchLogin}/clips`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-lilac hover:text-ink">
            Tous les clips sur Twitch ↗
          </a>
        </div>
        {clipsTwitch.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clipsTwitch.map((c) => <CarteClip key={c.id} c={c} />)}
          </div>
        ) : (
          <a href={`https://www.twitch.tv/${twitchLogin}/clips`} target="_blank" rel="noopener noreferrer" className="carte-holo flex items-center gap-4 rounded-2xl p-6 hover:shadow-glow-sm transition-all">
            <span className="text-3xl" aria-hidden>🎬</span>
            <span className="text-ink-soft">Les clips arrivent ici automatiquement. En attendant, retrouve-les tous sur Twitch ↗</span>
          </a>
        )}

        {clipsValorant.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-ink mb-4">🎯 Mes clips Valorant préférés</h3>
            <CarouselFleches>
              {clipsValorant.map((c) => (
                <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="snap-start shrink-0 w-40 carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm transition-all">
                  <div className="relative aspect-[9/16] bg-nebula flex items-center justify-center text-ink-soft/40 text-xs overflow-hidden">
                    {c.miniature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.miniature} alt={c.titre} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span>Clip</span>
                    )}
                  </div>
                  <p className="p-3 text-sm text-ink line-clamp-2">{c.titre}</p>
                </a>
              ))}
            </CarouselFleches>
          </div>
        )}
      </section>

      {/* ── Autres jeux ── */}
      {gaming.autresJeux.length > 0 && (
        <section id="autres-jeux" className="scroll-mt-24 mb-12" aria-labelledby="autres-titre">
          <h2 id="autres-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-5">🕹️ Autres jeux</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gaming.autresJeux.map((jeu) => (
              <div key={jeu.id} className="carte-holo rounded-2xl p-5 flex flex-col">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet/15 border border-violet/25 text-violet-light mb-3">
                  <IconStar4 className="w-4 h-4" />
                </span>
                <h3 className="text-ink font-semibold mb-1.5">{jeu.nom}</h3>
                <p className="text-ink-soft text-sm mb-3">{jeu.description}</p>
                {jeu.lienClip && (
                  <a href={jeu.lienClip} target="_blank" rel="noopener noreferrer" className="mt-auto text-violet-light hover:text-lilac text-sm font-medium transition-colors">
                    Voir un contenu →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {gaming.jeuxDuMoment.length > 0 && (
        <section aria-labelledby="moment-titre">
          <h2 id="moment-titre" className="text-xl font-semibold text-ink mb-4">En ce moment sur le live</h2>
          <div className="flex flex-wrap gap-2">
            {gaming.jeuxDuMoment.map((jeu) => (
              <span key={jeu.id} className="inline-flex items-center gap-2 rounded-full border border-violet/15 bg-white/[0.03] px-4 py-2 text-sm text-ink-soft">
                {jeu.nom}
                <span className="text-violet-light/80">· {jeu.statut}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
