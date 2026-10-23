import ImageMiniature from "@/components/ImageMiniature";
import type { Metadata } from "next";
import EntetePage from "@/components/EntetePage";
import { liens } from "@/data/liens";
import { lireGaming } from "@/lib/gamingStore";
import { contenusDuJeu } from "@/data/gaming";
import { lireChoixClips, clipsAffiches } from "@/lib/clipsChoixStore";
import { lireTimeline } from "@/lib/timelineStore";
import LecteurMoment from "@/components/LecteurMoment";
import { liensEtape } from "@/lib/videoMoment";
import { categorieDe } from "@/lib/timelineDesign";
import { lireNewsValorant, lireClipsValorant, lireProfilValorant } from "@/lib/valorantStore";
import { apercusLiens } from "@/lib/apercuLien";
import { ajouterMiniatures } from "@/lib/miniatures";
import { rangActuel, lireRang, positionRang, PALIERS } from "@/lib/rangValorant";
import { derniersClipsTwitch, type ClipTwitch } from "@/lib/clipsTwitch";
import AccentCosmique from "@/components/AccentCosmique";
import TexteRiche from "@/components/TexteRiche";
import CarouselFleches from "@/components/CarouselFleches";
import EmblemeRang from "@/components/gaming/EmblemeRang";
import { IconValorant, IconTwitch } from "@/components/Icons";
import { illustrationPour } from "@/lib/illustrationJeu";
import Icone, { Pastille } from "@/components/icones/Icone";
import TitreSection from "@/components/icones/TitreSection";

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
        <ImageMiniature src={c.miniature} video={c.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30" aria-hidden>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet/90 text-white opacity-0 shadow-glow transition-opacity group-hover:opacity-100"><Icone nom="lecture" className="w-6 h-6" /></span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">{mmss(c.duree)}</span>
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white inline-flex items-center gap-1"><Icone nom="oeil" className="w-3.5 h-3.5" /> {c.vues.toLocaleString("fr-FR")}</span>
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
  const [gaming, news, clipsManuels, profil, timeline, clipsRecents, choixClips] = await Promise.all([
    lireGaming(),
    lireNewsValorant(),
    lireClipsValorant(),
    lireProfilValorant(),
    lireTimeline(),
    derniersClipsTwitch(24).catch(() => []),
    lireChoixClips(),
  ]);
  // Clips : ceux choisis dans l'admin (mode « mon choix »), sinon les plus récents sauf ceux masqués
  const clipsTwitch: ClipTwitch[] = clipsAffiches(choixClips, clipsRecents);
  // Plusieurs clips / vidéos par jeu (TikTok, Instagram, YouTube, Twitch), avec leur miniature quand c'est possible
  const contenusJeux = await Promise.all(
    gaming.autresJeux.map((jeu) =>
      ajouterMiniatures(contenusDuJeu(jeu).map((c) => ({ id: c.id, plateforme: c.plateforme, titre: c.titre || "", url: c.url, format: c.plateforme === "YouTube" || c.plateforme === "Twitch" ? ("horizontal" as const) : ("vertical" as const) })))
    )
  );
  const clipsValorant = await ajouterMiniatures(
    clipsManuels.map((c) => ({ id: c.id, plateforme: "Twitch" as const, titre: c.titre, url: c.url, format: "vertical" as const }))
  );

  const agents = liste(profil.agents);
  const maps = liste(profil.maps);
  const skins = liste(profil.skinsArmes);
  const moments = timeline.filter((e) => !e.masque && (categorieDe(e) === "valorant" || `${e.titre} ${e.description ?? ""}`.toLowerCase().includes("valorant")));

  const apercus = await apercusLiens(news.map((n) => n.url).filter(Boolean));
  const rang = await rangActuel(profil.riotName, profil.riotTag, profil.riotRegion, profil.rankActuel);
  const objectif = lireRang(profil.objectifRank);
  const ecart = rang && objectif ? positionRang(objectif) - positionRang(rang) : null;
  const progression = rang && objectif ? Math.max(4, Math.min(100, Math.round((positionRang(rang) / Math.max(1, positionRang(objectif))) * 100))) : null;

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="fusee" />
      <EntetePage
        surtitre="Gaming" icone="manette"
        titre="Les jeux de mes lives"
        intro={<TexteRiche html={gaming.intro} />}
        sommaire={[
          { href: "#valorant", label: "Valorant", icone: "cible" as const },
          { href: "#clips", label: "Derniers clips", icone: "clap" as const },
          ...(gaming.autresJeux.length ? [{ href: "#autres-jeux", label: "Autres jeux", icone: "joystick" as const }] : []),
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
                        {ecart <= 0 ? <><Icone nom="fete" className="w-4 h-4 text-amber-300" /> Objectif atteint !</> : `encore ${ecart} palier${ecart > 1 ? "s" : ""}`}
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
                <p className="mt-5 text-sm text-ink-soft"><Icone nom="cible" className="w-4 h-4 text-rose-300" /> Objectif : <span className="text-ink">{profil.objectifRank}</span></p>
              )}
            </div>

            {/* Présentation */}
            <div className="flex flex-col">
              <TexteRiche html={profil.intro} className="text-ink-soft leading-relaxed" />
              {profil.statsPerso && <p className="mt-3 text-sm text-ink"><Icone nom="boost" className="w-4 h-4 text-emerald-300" /> {profil.statsPerso}</p>}

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
                        {maps.map((m) => <span key={m} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-ink-soft inline-flex items-center gap-1.5"><Icone nom="carte" className="w-4 h-4 text-ink-soft/70" />{m}</span>)}
                      </dd>
                    </div>
                  )}
                  {skins.length > 0 && (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-ink-soft/60 mb-2">Skins & armes</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {skins.map((m) => <span key={m} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-ink-soft inline-flex items-center gap-1.5"><Icone nom="viseur" className="w-4 h-4 text-ink-soft/70" />{m}</span>)}
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
                    Mon profil Tracker.gg <Icone nom="externe" className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {(news.length > 0 || moments.length > 0) && (
            <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
              {moments.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-soft/60 mb-3 flex items-center gap-2"><Icone nom="trophee" className="w-4 h-4 text-amber-300" /> Des moments de l&apos;aventure</p>
                  <ol className="relative space-y-3 border-l border-rose-300/25 pl-4">
                    {moments.map((e) => (
                      <li key={e.id}>
                        <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden />
                        <p className="text-xs text-rose-200/80">{e.date}</p>
                        <p className="text-sm font-medium text-ink">{e.titre}</p>
                        <LecteurMoment liens={liensEtape(e)} titre={e.titre} compact />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {news.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-soft/60 mb-3 flex items-center gap-2"><Icone nom="journal" className="w-4 h-4 text-rose-300" /> News Valorant</p>
                  <div className="space-y-3">
                    {news.map((n) => {
                      const a = apercus[n.url];
                      return (
                        <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" className="group flex overflow-hidden rounded-xl border border-white/10 bg-black/25 text-sm text-ink transition-all hover:border-rose-300/40 hover:bg-black/35">
                          <span className="relative w-28 sm:w-36 shrink-0 overflow-hidden bg-gradient-to-br from-rose-500/25 to-violet/25" style={{ aspectRatio: "16 / 10" }}>
                            {a?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <IconValorant className="absolute left-1/2 top-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 text-rose-300/80" />
                            )}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-2">
                            <span className="text-[11px] uppercase tracking-wide text-ink-soft/60">{a?.site || "Valorant"}</span>
                            <span className="font-semibold leading-snug line-clamp-2">{n.titre || a?.titre || n.url}</span>
                            {a?.resume ? <span className="hidden sm:block text-xs text-ink-soft line-clamp-2">{a.resume}</span> : null}
                          </span>
                          <Icone nom="externe" className="m-3 w-4 h-4 shrink-0 self-start text-ink-soft/60" />
                        </a>
                      );
                    })}
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
            <TitreSection id="clips-titre" icone="clap">Les derniers clips</TitreSection>
            <p className="mt-1 text-ink-soft">Les meilleurs moments des lives, clippés par la commu. Tape <code className="text-lilac">!clip</code> pendant un live pour en créer un&nbsp;!</p>
          </div>
          <a href={`https://www.twitch.tv/${twitchLogin}/clips`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-lilac hover:text-ink">
            Tous les clips sur Twitch <Icone nom="externe" className="w-4 h-4" />
          </a>
        </div>
        {clipsTwitch.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clipsTwitch.map((c) => <CarteClip key={c.id} c={c} />)}
          </div>
        ) : (
          <a href={`https://www.twitch.tv/${twitchLogin}/clips`} target="_blank" rel="noopener noreferrer" className="carte-holo flex items-center gap-4 rounded-2xl p-6 hover:shadow-glow-sm transition-all">
            <Pastille nom="clap" taille="lg" />
            <span className="text-ink-soft">Les clips arrivent ici automatiquement. En attendant, retrouve-les tous sur Twitch.</span>
          </a>
        )}

        {clipsValorant.length > 0 && (
          <div className="mt-8">
            <TitreSection niveau={3} icone="cible" teinte="rose" taille="xs" className="mb-4">Mes clips Valorant préférés</TitreSection>
            <CarouselFleches>
              {clipsValorant.map((c) => (
                <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="snap-start shrink-0 w-40 carte-holo rounded-xl overflow-hidden hover:shadow-glow-sm transition-all">
                  <div className="relative aspect-[9/16] bg-nebula flex items-center justify-center text-ink-soft/60 text-xs overflow-hidden">
                    {c.miniature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <ImageMiniature src={c.miniature} video={c.url} alt={c.titre} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
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
          <TitreSection id="autres-titre" icone="joystick" className="mb-5">Autres jeux</TitreSection>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gaming.autresJeux.map((jeu, ij) => {
              const illu = illustrationPour(jeu.nom, jeu.illustration);
              const contenus = contenusJeux[ij] || [];
              return (
                <div key={jeu.id} className="group carte-holo rounded-2xl overflow-hidden flex flex-col">
                  {/* illustration : icône du genre sur un halo coloré + petites étoiles */}
                  <div
                    className="relative h-32 flex items-center justify-center overflow-hidden border-b border-white/5"
                    style={{ background: `radial-gradient(circle at 50% 60%, rgba(${illu.couleur},.38), transparent 62%), linear-gradient(160deg, rgba(${illu.couleur},.16), rgba(13,10,23,.9))` }}
                    aria-hidden
                  >
                    <span className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(1px 1px at 18% 30%, #fff, transparent), radial-gradient(1px 1px at 78% 22%, #fff, transparent), radial-gradient(1.5px 1.5px at 66% 78%, #fff, transparent), radial-gradient(1px 1px at 30% 80%, #fff, transparent)" }} />
                    <span className="absolute h-24 w-24 rounded-full border border-white/10" />
                    <span className="absolute h-36 w-36 rounded-full border border-white/5" />
                    <Icone nom={illu.icone} className={`relative w-14 h-14 ${illu.texte} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`} style={{ filter: `drop-shadow(0 0 14px rgba(${illu.couleur},.7))` }} />
                    <span className="absolute bottom-2 right-3 rounded-full bg-black/35 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">{illu.label.split(" /")[0]}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-ink font-semibold mb-1.5">{jeu.nom}</h3>
                    <p className="text-ink-soft text-sm mb-3">{jeu.description}</p>
                    {contenus.length > 0 && (
                      <div className="mt-auto">
                        <div className={`grid gap-2 ${contenus.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
                          {contenus.slice(0, 6).map((c) => (
                            <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" title={c.titre || `Voir sur ${c.plateforme}`} className={`group/c relative block overflow-hidden rounded-lg border border-white/10 bg-nebula ${contenus.length === 1 ? "aspect-video" : "aspect-[4/5]"}`}>
                              {c.miniature ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <ImageMiniature src={c.miniature} video={c.url} alt={c.titre || ""} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/c:scale-105" />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(160deg, rgba(${illu.couleur},.35), rgba(13,10,23,.95))` }}><Icone nom="clap" className="w-6 h-6 text-white/70" /></span>
                              )}
                              <span className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">{c.plateforme}</span>
                              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4 text-[10.5px] leading-tight text-white line-clamp-2">{c.titre || "▶ Voir"}</span>
                            </a>
                          ))}
                        </div>
                        {contenus.length > 6 ? <p className="mt-2 text-xs text-ink-soft">+ {contenus.length - 6} autres contenus</p> : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {gaming.jeuxDuMoment.filter((j) => j.nom.trim()).length > 0 && (
        <section aria-labelledby="moment-titre">
          <h2 id="moment-titre" className="text-xl font-semibold text-ink mb-1">
            {gaming.jeuxDuMoment.filter((j) => j.nom.trim()).length > 1 ? "Mes jeux du moment" : "Mon jeu du moment"}
          </h2>
          <p className="text-sm text-ink-soft mb-4">Ce à quoi je joue en ce moment, en live ou hors stream.</p>
          <div className="flex flex-wrap gap-3">
            {gaming.jeuxDuMoment.filter((j) => j.nom.trim()).map((jeu) => {
              const statut = jeu.statut === "En ce moment" ? "J'y joue en ce moment" : jeu.statut === "En pause" ? "En pause" : "Bientôt en live";
              const pastille = jeu.statut === "En ce moment" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : jeu.statut === "En pause" ? "bg-amber-300" : "bg-violet-light";
              const contenu = (
                <>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${pastille}`} aria-hidden />
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{jeu.nom}</span>
                    <span className="block text-xs text-ink-soft">{statut}</span>
                  </span>
                  {jeu.lien ? <Icone nom="externe" className="w-4 h-4 shrink-0 text-lilac" /> : null}
                </>
              );
              const classe = "inline-flex items-center gap-3 rounded-2xl border border-violet/20 bg-white/[0.04] px-4 py-3 transition-colors";
              return jeu.lien ? (
                <a key={jeu.id} href={jeu.lien} target="_blank" rel="noopener noreferrer" className={`${classe} hover:border-violet/50 hover:bg-violet/10`}>{contenu}</a>
              ) : (
                <span key={jeu.id} className={classe}>{contenu}</span>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
