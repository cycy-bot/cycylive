// Profil public d'un·e Cycylien·ne (utilisé sur /membres/[slug] et en aperçu sur /profil).
// Aucun hook : s'affiche côté serveur comme côté navigateur.
import type { CSSProperties } from "react";
import Creature, { especeInfo } from "@/components/arcade/Creature";
import type { ProfilPublic } from "@/lib/membres";
import { CYCYBOT_URL_PUBLIC } from "@/lib/cycybot";

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const moisAnnee = (t: number | null) => (t ? `${MOIS[new Date(t).getMonth()]} ${new Date(t).getFullYear()}` : "");
const ROMAIN = ["", "I", "II", "III"];

function Bloc({ titre, children, className = "" }: { titre: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`carte-holo rounded-3xl border border-violet/15 p-5 md:p-6 ${className}`}>
      <h2 className="text-sm uppercase tracking-[0.18em] text-ink-soft/70 mb-4">{titre}</h2>
      {children}
    </section>
  );
}

export default function ProfilCycylien({ p, apercu = false }: { p: ProfilPublic; apercu?: boolean }) {
  const t = p.theme;
  const fond: CSSProperties = { background: `radial-gradient(ellipse 80% 120% at 15% 0%, ${t.glow}55, transparent 60%), linear-gradient(135deg, ${t.bg[0]}, ${t.bg[2] || t.bg[1]})`, borderColor: `${t.a}55` };
  const o = p.orbite;
  const pct = o ? Math.min(100, Math.round((o.progress / Math.max(1, o.needed)) * 100)) : 0;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <header className="relative overflow-hidden rounded-3xl border p-6 md:p-8" style={fond}>
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.avatar} alt="" width={112} height={112} className="h-24 w-24 md:h-28 md:w-28 rounded-full object-cover shrink-0" style={{ boxShadow: `0 0 0 4px ${t.a}, 0 0 32px ${t.glow}` }} />
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-semibold text-ink leading-tight break-words" style={{ textShadow: `0 0 24px ${t.glow}` }}>{p.name}</h1>
            {p.title && <p className="text-sm font-medium mt-1" style={{ color: t.b }}>✦ {p.title}</p>}
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {p.role && <span className="rounded-full px-3 py-1 border" style={{ borderColor: `${t.a}88`, color: t.b }}>🪐 {p.role}</span>}
              <span className="rounded-full px-3 py-1 border border-white/15 text-ink-soft">🎨 Thème {t.label}</span>
              {p.joinedAt ? <span className="rounded-full px-3 py-1 border border-white/15 text-ink-soft">À bord depuis {moisAnnee(p.joinedAt)}{p.number ? ` · n° ${p.number}` : ""}</span> : null}
              {p.twitch && (
                <a href={`https://twitch.tv/${p.twitch}`} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-1 border border-[#9146ff88] text-[#c9a8ff] hover:bg-[#9146ff22]">
                  🟣 {p.twitch}
                </a>
              )}
            </div>
            {p.bio && <p className="text-ink mt-4 max-w-2xl">{p.bio}</p>}
          </div>
        </div>
        {o && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-ink font-medium">Orbite {o.orbit}</span>
              <span className="text-ink-soft">
                {o.points.toLocaleString("fr-FR")} points{o.position ? ` · ${o.position}ᵉ sur ${o.total}` : ""}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${t.a}, ${t.b})` }} />
            </div>
            <p className="text-xs text-ink-soft/70 mt-1.5">{o.progress.toLocaleString("fr-FR")} / {o.needed.toLocaleString("fr-FR")} vers l’orbite {o.orbit + 1}</p>
          </div>
        )}
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        {p.passeport && p.passeport.length > 0 && (
          <Bloc titre="🪪 Passeport">
            <dl className="grid sm:grid-cols-2 gap-3">
              {p.passeport.map((f) => (
                <div key={f.key} className={`rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 ${f.key === "anecdote" || f.key === "devise" ? "sm:col-span-2" : ""}`}>
                  <dt className="text-xs uppercase tracking-wider text-ink-soft/70">{f.emoji} {f.label}</dt>
                  <dd className="text-ink mt-0.5 break-words">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Bloc>
        )}

        {p.compagnon && (
          <Bloc titre="🐾 Compagnon">
            <div className="flex items-center gap-5">
              <div className="shrink-0">
                <Creature espece={p.compagnon.espece} humeur="content" stade={p.compagnon.stade} taille={150} tenue={p.compagnon.tenue} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink">{p.compagnon.nom || especeInfo(p.compagnon.espece).nomParDefaut}</p>
                <p className="text-ink-soft">{especeInfo(p.compagnon.espece).nom} · {["Bébé", "Enfant", "Adulte"][p.compagnon.stade]}</p>
                <a href="/jeux/compagnon" className="inline-block mt-3 text-sm text-lilac hover:text-ink">Adopter le mien →</a>
              </div>
            </div>
          </Bloc>
        )}
      </div>

      {p.succes && (
        <Bloc titre={`🏅 Succès (${p.succes.length})`}>
          {p.succes.length ? (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {p.succes.map((b) => (
                <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3">
                  <span className="text-3xl" aria-hidden>{b.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-ink font-medium">{b.label}{b.tiered && b.level > 0 ? ` ${ROMAIN[b.level]}` : ""}</span>
                    <span className="block text-xs text-ink-soft">{b.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft text-sm">Pas encore de succès… mais ça ne va pas tarder ✨</p>
          )}
        </Bloc>
      )}

      {p.cartes && (
        <Bloc titre={`🃏 Cartes Astrales · ${p.cartes.unique} / ${p.cartes.total}`}>
          <div className="flex flex-wrap gap-2 mb-5">
            {p.cartes.per.map((r) => (
              <span key={r.key} className="text-xs rounded-full px-3 py-1 border" style={{ borderColor: `${r.color}66`, color: r.color }}>
                {r.emoji} {r.label} {r.owned}/{r.total}
              </span>
            ))}
            {p.cartes.holos > 0 && <span className="text-xs rounded-full px-3 py-1 border border-white/20 text-ink-soft">✨ {p.cartes.holos} holo</span>}
          </div>
          {p.cartes.vitrine.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {p.cartes.vitrine.map((c) => (
                <li key={c.id} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${CYCYBOT_URL_PUBLIC}/api/carte/${encodeURIComponent(c.id)}.png${c.holo ? "?holo=1" : ""}`} alt={`${c.name} (${c.rarityLabel})`} loading="lazy" className="w-full rounded-xl" />
                  <span className="block text-xs text-ink-soft mt-1">{c.name}{c.count > 1 ? ` ×${c.count}` : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft text-sm">Aucune carte pour l’instant : les boosters s’ouvrent sur Discord avec /booster.</p>
          )}
        </Bloc>
      )}

      {p.tampons && p.tampons.length > 0 && (
        <Bloc titre="📜 Tampons de la Chronique">
          <ul className="flex flex-wrap gap-2">
            {p.tampons.map((s, i) => (
              <li key={i} className="rounded-full px-3 py-1.5 text-sm border" style={{ borderColor: `${s.color}88`, color: s.color }} title={s.title}>
                {s.emoji} {s.label}
              </li>
            ))}
          </ul>
        </Bloc>
      )}

      {!apercu && (
        <p className="text-center text-sm text-ink-soft/70 pt-2">
          Toi aussi, crée ton profil : <a href="/profil" className="text-lilac hover:text-ink">connecte-toi avec Discord</a>
        </p>
      )}
    </div>
  );
}
