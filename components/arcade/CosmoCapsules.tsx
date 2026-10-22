"use client";

// ============================================================
// COSMO-CAPSULES — la machine gatchapon kawaii cosmique
// ============================================================
// Une capsule par jour et par compte Discord. CycyBot
// (bot.cycylive.fr/api/capsules) tire la capsule : une figurine
// à collectionner (4 collections, dont des exemplaires limités)
// + un gain ajouté directement au compte, plus gros selon la rareté.
// Le site anime la machine, la chute de la capsule (la figurine se
// devine à travers), son ouverture, et l'album des collections.

import { useCallback, useEffect, useMemo, useState } from "react";
import { COULEUR_RARETE, NOM_RARETE, FigurineVisuel, type Rarete } from "@/components/arcade/CosmoFigurine";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const RARETES: Rarete[] = ["commune", "peu", "rare", "epique", "legendaire", "mythique"];
const CHANCES_DEFAUT: Record<Rarete, number> = { commune: 52, peu: 27, rare: 13, epique: 5.5, legendaire: 2, mythique: 0.5 };
const NIVEAU: Record<Rarete, number> = { commune: 0, peu: 1, rare: 2, epique: 3, legendaire: 4, mythique: 5 };

type Figurine = { id: string; nom: string; rarete: Rarete; rareteLabel: string; collection: string; image: string; stock: number; distribues: number };
type Collection = { id: string; nom: string; emoji: string; description: string; bonus: string; terminee: boolean };
type Resultat = { figurine: string; nom: string; rarete: Rarete; rareteLabel: string; collection: string; collectionNom: string; image: string; stock: number; numero: number; nouvelle: boolean; label: string; bonus: { type: string; label: string }[]; garantie: boolean; given: string[] | null };
type Etat = {
  disponible: boolean;
  derniere: Resultat | null;
  album: Record<string, number>;
  numeros: Record<string, number>;
  possedees: number;
  total: number;
  garantie: { restant: number; sur: number; actif?: boolean };
  capsules: number;
  figurines: Figurine[];
  collections: Collection[];
  chances?: Record<Rarete, number>;
  gains?: Record<Rarete, string[]>;
  resultat?: Resultat;
};

class ConnexionRequise extends Error {}
async function appel(action: "etat" | "tourner"): Promise<Etat> {
  const r = await fetch(`${BOT}/api/capsules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session: sessionDiscord(), action }) });
  const d = await r.json().catch(() => ({}));
  if (d.connexion) throw new ConnexionRequise(d.error);
  if (!r.ok || !d.ok) throw new Error(d.error || "La machine est indisponible pour le moment.");
  return d as Etat;
}

// Capsules décoratives dans le globe (positions fixes : même rendu serveur / navigateur)
const BOULES: [number, number, Rarete, number][] = [
  [-62, 34, "commune", 0], [-30, 46, "peu", 1], [4, 50, "commune", 2], [38, 44, "rare", 3], [66, 30, "commune", 4],
  [-50, 4, "peu", 5], [-16, 16, "commune", 6], [20, 18, "epique", 7], [54, 0, "peu", 8], [-34, -24, "commune", 9],
  [2, -14, "rare", 10], [36, -28, "commune", 11], [-6, -46, "legendaire", 12], [-66, -6, "commune", 13], [70, -12, "peu", 14],
];

const fondCapsule = (r: Rarete) => (r === "mythique" ? "linear-gradient(135deg,#ff6bd6,#ffd23f 35%,#3df5ff 70%,#b26bff)" : COULEUR_RARETE[r]);

/** Petite capsule SVG (globe, légende). */
function CapsuleSvg({ rarete, r = 15, id }: { rarete: Rarete; r?: number; id: string }) {
  const arc = rarete === "mythique";
  return (
    <g>
      {arc ? (
        <defs>
          <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff6bd6" /><stop offset="35%" stopColor="#ffd23f" /><stop offset="70%" stopColor="#3df5ff" /><stop offset="100%" stopColor="#b26bff" /></linearGradient>
        </defs>
      ) : null}
      <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`} fill={arc ? `url(#cap-${id})` : COULEUR_RARETE[rarete]} />
      <path d={`M${-r * 0.62} ${-r * 0.5} Q${-r * 0.3} ${-r * 0.82} ${r * 0.05} ${-r * 0.86}`} stroke="#fff" strokeOpacity=".8" strokeWidth={r * 0.16} fill="none" strokeLinecap="round" />
      <path d={`M${-r} 0 A${r} ${r} 0 0 0 ${r} 0 Z`} fill="#fffaff" fillOpacity=".92" />
      <path d={`M${-r} 0 H${r}`} stroke={arc ? "#fff" : COULEUR_RARETE[rarete]} strokeWidth={r * 0.14} />
    </g>
  );
}

/** La grande capsule : moitié haute colorée translucide, moitié basse en verre, la figurine se devine dedans. */
function GrandeCapsule({ res, etape }: { res: Resultat; etape: "tombe" | "posee" | "ouvre" }) {
  return (
    <div className={`cc-grande ${etape === "tombe" ? "cc-chute" : etape === "posee" ? "cc-balance" : "cc-craque"}`}>
      <div className="cc-interieur"><FigurineVisuel id={res.figurine} image={res.image} taille={132} /></div>
      <div className="cc-haut" style={{ background: fondCapsule(res.rarete) }} />
      <div className="cc-bas" />
      <div className="cc-joint" style={{ background: fondCapsule(res.rarete) }} />
      <div className="cc-reflet" />
    </div>
  );
}

/** Éclats de lumière à l'ouverture : plus la figurine est rare, plus il y en a. */
function Confettis({ rarete }: { rarete: Rarete }) {
  const n = 14 + NIVEAU[rarete] * 10;
  const couleurs = rarete === "mythique" ? ["#ff6bd6", "#ffd23f", "#3df5ff", "#b26bff", "#fff"] : [COULEUR_RARETE[rarete], "#fff", "#ffd23f", "#ffb3d6"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 3) * 0.3;
        const d = 120 + ((i * 37) % 120) + NIVEAU[rarete] * 18;
        return (
          <span
            key={i}
            className="cc-confetti"
            style={{
              ["--dx" as string]: `${Math.cos(a) * d}px`, ["--dy" as string]: `${Math.sin(a) * d}px`,
              background: couleurs[i % couleurs.length], animationDelay: `${(i % 5) * 0.03}s`,
              width: i % 4 === 0 ? 12 : 7, height: i % 4 === 0 ? 12 : 7, borderRadius: i % 2 ? "50%" : "2px",
            }}
          />
        );
      })}
    </div>
  );
}

export default function CosmoCapsules() {
  const compte = useCompteDiscord();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  // repos → tourne → tombe → posee (à ouvrir) → ouvre (ça craque) → ouverte (la figurine)
  const [anim, setAnim] = useState<"repos" | "tourne" | "tombe" | "posee" | "ouvre" | "ouverte">("repos");
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [collection, setCollection] = useState("toutes");
  const [filtre, setFiltre] = useState<Rarete | "toutes">("toutes");
  const [reste, setReste] = useState("");

  const charger = useCallback(async () => {
    setCharge(true);
    setErreur("");
    try {
      const e = await appel("etat");
      setEtat(e);
      if (!e.disponible && e.derniere) { setResultat(e.derniere); setAnim("ouverte"); }
    } catch (e) {
      if (e instanceof ConnexionRequise) compte.oublier();
      setErreur(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Impossible de joindre CycyBot pour le moment. Réessaie dans un instant.");
    } finally {
      setCharge(false);
    }
  }, [compte]);

  useEffect(() => {
    if (compte.joueur && !etat && !charge) charger();
  }, [compte.joueur, etat, charge, charger]);

  async function tourner() {
    if (!etat?.disponible || anim !== "repos") return;
    setErreur("");
    setAnim("tourne");
    const attente = new Promise((r) => setTimeout(r, 1700));
    try {
      const [e] = await Promise.all([appel("tourner"), attente]);
      setResultat(e.resultat || null);
      setEtat(e);
      setAnim("tombe");
      setTimeout(() => setAnim("posee"), 1150);
    } catch (e) {
      if (e instanceof ConnexionRequise) compte.oublier();
      setErreur(e instanceof Error ? e.message : "La machine s'est coincée, réessaie.");
      setAnim("repos");
    }
  }

  function ouvrir() {
    if (anim !== "posee") return;
    setAnim("ouvre");
    // plus c'est rare, plus le suspense dure un peu
    setTimeout(() => setAnim("ouverte"), 900 + NIVEAU[resultat?.rarete || "commune"] * 120);
  }

  // Compte à rebours jusqu'à minuit (heure de Paris)
  useEffect(() => {
    if (!etat || etat.disponible) return;
    const maj = () => {
      const p = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
      const v = (t: string) => Number(p.find((x) => x.type === t)?.value || 0);
      const s = 86400 - (v("hour") * 3600 + v("minute") * 60 + v("second"));
      setReste(`${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")} min`);
    };
    maj();
    const t = setInterval(maj, 20000);
    return () => clearInterval(t);
  }, [etat]);

  const collections = etat?.collections || [];
  const figurines = useMemo(
    () => (etat?.figurines || []).filter((f) => (collection === "toutes" || f.collection === collection) && (filtre === "toutes" || f.rarete === filtre)),
    [etat, collection, filtre]
  );
  const rar = resultat?.rarete || "commune";
  const couleur = COULEUR_RARETE[rar];
  const chances = etat?.chances || CHANCES_DEFAUT;
  const grandeVisible = resultat && (anim === "tombe" || anim === "posee" || anim === "ouvre");

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <div>
        {/* ── La machine ── */}
        <div className="cc-scene relative overflow-hidden rounded-[28px] px-4 pb-6 pt-5">
          <div className="cc-etoiles" aria-hidden />
          <p className="cc-titre relative text-center text-2xl sm:text-3xl font-black tracking-wide">Cosmo-Capsules</p>
          <p className="relative mb-2 text-center text-sm text-[#7a5aa8]">Une capsule par jour · une figurine à collectionner · un cadeau sur Discord</p>

          <div className="relative mx-auto w-full max-w-[420px]">
            <svg viewBox="-130 -170 260 360" className={`w-full ${anim === "tourne" ? "cc-secoue" : ""}`} role="img" aria-label="Machine gatchapon Cosmo-Capsules">
              <defs>
                <radialGradient id="cc-verre" cx="38%" cy="30%" r="75%"><stop offset="0%" stopColor="#ffffff" stopOpacity=".9" /><stop offset="45%" stopColor="#f3e8ff" stopOpacity=".35" /><stop offset="100%" stopColor="#c9a8ff" stopOpacity=".35" /></radialGradient>
                <linearGradient id="cc-corps" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffb3d6" /><stop offset="100%" stopColor="#ff8fc4" /></linearGradient>
                <linearGradient id="cc-socle" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a8ff" /><stop offset="100%" stopColor="#a585f0" /></linearGradient>
                <clipPath id="cc-globe"><circle cx="0" cy="-60" r="96" /></clipPath>
              </defs>
              <path d="M0 -156 L0 -176" stroke="#c9a8ff" strokeWidth="4" />
              <circle cx="0" cy="-178" r="7" fill="#ffd23f" />
              <ellipse cx="0" cy="-158" rx="34" ry="10" fill="#c9a8ff" />
              <circle cx="0" cy="-60" r="98" fill="#fff" opacity=".35" />
              <g clipPath="url(#cc-globe)">
                <g transform="translate(0 -60)"><g className={anim === "tourne" ? "cc-brasse" : ""}>
                  {BOULES.map(([x, y, r, i]) => (
                    <g key={i} transform={`translate(${x} ${y}) rotate(${(i * 47) % 360})`}><CapsuleSvg rarete={r} r={17} id={`b${i}`} /></g>
                  ))}
                </g></g>
              </g>
              <circle cx="0" cy="-60" r="96" fill="url(#cc-verre)" stroke="#fff" strokeWidth="4" />
              <path d="M-62 -110 Q-40 -140 -6 -146" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".85" />
              <path d="M-96 30 L96 30 L110 150 Q110 168 92 168 L-92 168 Q-110 168 -110 150 Z" fill="url(#cc-corps)" stroke="#fff" strokeWidth="3" />
              <rect x="-104" y="22" width="208" height="18" rx="9" fill="url(#cc-socle)" stroke="#fff" strokeWidth="3" />
              <rect x="-60" y="52" width="120" height="30" rx="15" fill="#fff" opacity=".9" />
              <text x="0" y="72" textAnchor="middle" fontSize="15" fontWeight="900" fill="#b26bff" fontFamily="system-ui, sans-serif">1 CAPSULE / JOUR</text>
              <rect x="56" y="96" width="30" height="40" rx="8" fill="#fff" opacity=".85" />
              <rect x="68" y="104" width="6" height="22" rx="3" fill="#7a5aa8" />
              <g transform="translate(-28 118)">
                <circle r="26" fill="#fff" stroke="#c9a8ff" strokeWidth="4" />
                <g className={anim === "tourne" ? "cc-manivelle" : ""}>
                  <rect x="-24" y="-7" width="48" height="14" rx="7" fill="#b26bff" />
                  <circle r="7" fill="#ffd23f" />
                </g>
              </g>
              <rect x="26" y="142" width="58" height="22" rx="11" fill="#7a3a8a" opacity=".55" />
              <g transform="translate(-60 64)">
                <ellipse cx="-6" cy="0" rx="3" ry="4" fill="#7a3a6a" />
                <ellipse cx="8" cy="0" rx="3" ry="4" fill="#7a3a6a" />
                <path d="M-2 6 Q1 9 4 6" stroke="#7a3a6a" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </svg>

            {/* la capsule tombe, se pose, puis s'ouvre */}
            {grandeVisible && resultat ? (
              <div className="absolute inset-0 z-10 flex items-end justify-center pb-[14%]">
                <div className="cc-voile" aria-hidden />
                <button type="button" onClick={ouvrir} disabled={anim !== "posee"} className="relative" aria-label={anim === "posee" ? "Ouvrir la capsule" : "Capsule"}>
                  <div className="cc-halo" style={{ background: `radial-gradient(circle, ${couleur}aa 0%, transparent 65%)` }} aria-hidden />
                  <GrandeCapsule res={resultat} etape={anim === "tombe" ? "tombe" : anim === "posee" ? "posee" : "ouvre"} />
                  {anim === "posee" ? (
                    <span className="absolute -bottom-12 left-1/2 w-max -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-black text-[#7a3a8a] shadow">
                      Touche la capsule pour l&apos;ouvrir ! <span style={{ color: couleur }}>· {NOM_RARETE[rar]}</span>
                    </span>
                  ) : null}
                </button>
              </div>
            ) : null}

            {/* la figurine révélée */}
            {anim === "ouverte" && resultat ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-3">
                <div className="cc-carte relative w-full max-w-[330px] rounded-[26px] border-4 bg-white/95 px-5 pb-5 pt-4 text-center shadow-2xl" style={{ borderColor: couleur, boxShadow: `0 20px 60px -10px ${couleur}aa` }}>
                  <div className="cc-rayons" style={{ background: `repeating-conic-gradient(${couleur}33 0 12deg, transparent 12deg 24deg)` }} aria-hidden />
                  <Confettis rarete={rar} />
                  <div className="relative">
                    <div className="cc-pop mx-auto w-fit" style={{ filter: `drop-shadow(0 8px 18px ${couleur}99)` }}><FigurineVisuel id={resultat.figurine} image={resultat.image} taille={160} /></div>
                    {resultat.nouvelle ? <span className="absolute right-1 top-0 rounded-full bg-[#ff6bd6] px-2.5 py-0.5 text-xs font-black text-white shadow">NOUVEAU !</span> : <span className="absolute right-1 top-0 rounded-full bg-[#c9a8ff] px-2.5 py-0.5 text-xs font-bold text-white">doublon</span>}
                    <p className="mt-1 text-xs font-black uppercase tracking-widest" style={{ color: couleur }}>{resultat.rareteLabel}{resultat.garantie ? " · garantie" : ""}</p>
                    <p className="text-xl font-black leading-tight text-[#4a2470]">{resultat.nom}</p>
                    {resultat.collectionNom ? <p className="text-xs font-semibold text-[#9a7ac8]">{resultat.collectionNom}</p> : null}
                    {resultat.stock ? (
                      <p className="mt-1 inline-block rounded-full bg-[#2a1640] px-3 py-0.5 text-xs font-black text-[#ffd23f]">
                        {resultat.stock === 1 ? "👑 EXEMPLAIRE UNIQUE" : `✨ Exemplaire n°${resultat.numero} / ${resultat.stock}`}
                      </p>
                    ) : null}
                    <p className="cc-gain mt-2 rounded-2xl bg-[#f6efff] px-3 py-2 text-sm font-semibold text-[#5a3a8a]">🎁 {resultat.given ? resultat.given.map((g) => g.replace(/\*\*/g, "")).join(" · ") : resultat.label}</p>
                    {resultat.bonus.filter((b) => b.type !== "doublon").map((b) => <p key={b.label} className="mt-2 text-sm font-black text-[#b26bff]">🏆 {b.label}</p>)}
                    <p className="mt-2 text-xs text-[#7a5aa8]">{resultat.given ? "Ajouté à ton compte Discord ✅" : "Ton cadeau arrive sur ton compte Discord…"}</p>
                    <button type="button" onClick={() => setAnim("repos")} className="mt-3 rounded-full border border-[#c9a8ff] px-4 py-1 text-xs font-semibold text-[#7a3a8a] hover:bg-[#f6efff]">Revoir la machine</button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Commandes ── */}
          <div className="relative mt-3 flex flex-col items-center gap-2 text-center">
            {!compte.joueur ? (
              compte.pret ? <BoutonDiscord erreur={compte.erreur} texte="Une capsule par jour et par compte Discord : ton cadeau arrive directement sur ton profil." /> : null
            ) : !etat ? (
              <p className="text-sm text-[#7a5aa8]">{charge ? "CycyBot remplit la machine…" : ""}</p>
            ) : etat.disponible ? (
              <button type="button" onClick={tourner} disabled={anim !== "repos"} className="cc-bouton rounded-full px-9 py-3.5 text-lg font-black text-white disabled:opacity-60">
                {anim === "repos" ? "Tourner la manivelle ✨" : "Ça tourne…"}
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <p className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#7a3a8a]">Prochaine capsule dans {reste} 💤</p>
                {anim === "repos" && resultat ? <button type="button" onClick={() => setAnim("ouverte")} className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-[#7a3a8a] hover:bg-white">Revoir ma capsule du jour</button> : null}
              </div>
            )}
            {erreur ? <p className="text-sm font-semibold text-[#d6336c]">{erreur}</p> : null}
            {compte.joueur ? <div className="mt-1 rounded-full bg-[#2a1640]/85 px-4 py-1.5"><BandeauDiscord compte={compte} /></div> : null}
          </div>
        </div>

        {/* ── L'album ── */}
        {etat ? (
          <section className="carte-holo mt-5 rounded-3xl border border-violet/20 p-5" aria-labelledby="titre-album">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="titre-album" className="text-lg font-semibold text-ink">📒 Mon album</h2>
                <p className="text-sm text-ink-soft">{etat.possedees} / {etat.total} figurines · {etat.capsules} capsule{etat.capsules > 1 ? "s" : ""} ouverte{etat.capsules > 1 ? "s" : ""}</p>
              </div>
              <div className="min-w-[200px] flex-1 sm:max-w-[260px]">
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#ffb3d6] via-[#c9a8ff] to-[#7fd0ff]" style={{ width: `${(etat.possedees / Math.max(1, etat.total)) * 100}%` }} /></div>
                {etat.garantie.actif !== false ? <p className="mt-1 text-xs text-ink-soft">✨ Épique ou mieux garanti dans {etat.garantie.restant} capsule{etat.garantie.restant > 1 ? "s" : ""} au plus</p> : null}
              </div>
            </div>
            {/* collections */}
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              {collections.map((c) => {
                const figs = etat.figurines.filter((f) => f.collection === c.id);
                const n = figs.filter((f) => etat.album[f.id]).length;
                return (
                  <button key={c.id} type="button" onClick={() => setCollection(collection === c.id ? "toutes" : c.id)} className={`rounded-2xl border p-3 text-left transition-colors ${collection === c.id ? "border-violet bg-violet/15" : "border-violet/20 bg-white/[.03] hover:border-violet/50"}`}>
                    <p className="text-sm font-semibold text-ink">{c.emoji} {c.nom} <span className="text-ink-soft">· {n}/{figs.length}</span>{c.terminee ? " ✅" : ""}</p>
                    <p className="text-xs text-ink-soft">{c.description}</p>
                    <p className="mt-1 text-[11px] text-ink-soft/70">Collection complète : +{c.bonus}</p>
                  </button>
                );
              })}
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(["toutes", ...RARETES] as const).map((r) => (
                <button key={r} type="button" onClick={() => setFiltre(r)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${filtre === r ? "border-transparent bg-violet text-ink" : "border-violet/25 text-ink-soft hover:text-ink"}`}>
                  {r === "toutes" ? "Toutes les raretés" : NOM_RARETE[r]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {figurines.map((f) => {
                const n = etat.album[f.id] || 0;
                const epuisee = f.stock > 0 && f.distribues >= f.stock;
                return (
                  <div key={f.id} className="relative flex flex-col items-center rounded-2xl border-2 bg-white/[.04] p-2 text-center" style={{ borderColor: COULEUR_RARETE[f.rarete] + (n ? "aa" : "33") }} title={n ? f.nom : "Pas encore trouvée"}>
                    <FigurineVisuel id={f.id} image={f.image} silhouette={!n} taille={76} />
                    <p className={`mt-1 text-[11px] font-semibold leading-tight ${n ? "text-ink" : "text-ink-soft/50"}`}>{n ? f.nom : "???"}</p>
                    {f.stock ? (
                      <p className="mt-0.5 text-[10px] font-bold" style={{ color: "#ffd23f" }}>
                        {etat.numeros?.[f.id] ? (f.stock === 1 ? "👑 unique" : `n°${etat.numeros[f.id]}/${f.stock}`) : epuisee ? "épuisée" : f.stock === 1 ? "👑 exemplaire unique" : `${f.stock - f.distribues} / ${f.stock} restants`}
                      </p>
                    ) : null}
                    {n > 1 ? <span className="absolute right-1.5 top-1.5 rounded-full bg-violet/80 px-1.5 text-[10px] font-bold text-ink">×{n}</span> : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      {/* ── Règles et raretés ── */}
      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">Comment ça marche ?</h2>
        <ol className="mb-5 list-inside list-decimal space-y-2 text-sm text-ink-soft">
          <li>Connecte-toi avec Discord, puis tourne la manivelle : <strong className="text-ink">une capsule par jour</strong>.</li>
          <li>Ouvre-la : une figurine rejoint ton album, et un cadeau arrive sur ton compte Discord. <strong className="text-ink">Plus la figurine est rare, plus le cadeau est gros</strong>. Jamais de capsule vide !</li>
          <li>Pas de chance pendant 10 jours ? La capsule suivante est <strong className="text-ink">Épique ou mieux</strong>, garanti.</li>
          <li>Doublon = petit bonus d&apos;Éclats. Une collection complète donne un gros bonus !</li>
          <li>Certaines figurines n&apos;existent qu&apos;en <strong className="text-ink">quelques exemplaires</strong>, voire en un seul sur tout le serveur 👑</li>
        </ol>
        <h3 className="mb-2 text-sm font-semibold text-ink">Les capsules</h3>
        <ul className="space-y-2 text-sm">
          {RARETES.map((r) => (
            <li key={r} className="flex items-start gap-2.5">
              <svg viewBox="-20 -20 40 40" width="28" height="28" className="mt-0.5 shrink-0"><CapsuleSvg rarete={r} r={15} id={`l${r}`} /></svg>
              <span className="flex-1 text-ink-soft">
                <span className="font-semibold" style={{ color: COULEUR_RARETE[r] }}>{NOM_RARETE[r]}</span> <span className="text-ink-soft/60">· {String(chances[r] ?? 0).replace(".", ",")} %</span>
                {etat?.gains?.[r] ? <><br />{etat.gains[r].join(", ou ")}</> : null}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <style>{`
        .cc-scene{background:radial-gradient(ellipse at 50% 0%,#fff1fa 0%,#f3e6ff 45%,#e3d6ff 100%);box-shadow:0 0 0 3px #ffffffaa,0 30px 80px -30px #c9a8ff}
        .cc-etoiles{position:absolute;inset:0;background-image:radial-gradient(#ffffff 1.5px,transparent 2px),radial-gradient(#ffd23f 1.2px,transparent 1.8px),radial-gradient(#ffb3d6 1.5px,transparent 2px);background-size:90px 90px,140px 140px,60px 60px;background-position:10px 20px,60px 70px,30px 40px;opacity:.8;animation:cc-scintille 4s ease-in-out infinite alternate}
        @keyframes cc-scintille{to{opacity:.4}}
        .cc-titre{color:#b26bff;text-shadow:0 3px 0 #fff,0 0 18px #ffb3d6}
        .cc-bouton{background:linear-gradient(180deg,#ff8fc4,#b26bff);box-shadow:0 6px 0 #8a4fd6,0 12px 30px -6px #b26bffaa}
        .cc-bouton:not(:disabled):hover{filter:brightness(1.08)}
        .cc-bouton:not(:disabled):active{transform:translateY(4px);box-shadow:0 2px 0 #8a4fd6}
        .cc-secoue{animation:cc-secoue .18s ease-in-out 8}
        @keyframes cc-secoue{25%{transform:rotate(-1.5deg)}75%{transform:rotate(1.5deg)}}
        .cc-brasse{animation:cc-brasse 1.6s cubic-bezier(.4,0,.2,1)}
        @keyframes cc-brasse{to{transform:rotate(360deg)}}
        .cc-manivelle{animation:cc-tour 1.6s cubic-bezier(.4,0,.2,1)}
        @keyframes cc-tour{to{transform:rotate(720deg)}}
        .cc-voile{position:absolute;inset:-10%;background:radial-gradient(closest-side at 50% 74%,#2a164040,transparent);animation:cc-fondu .4s both;pointer-events:none}
        @keyframes cc-fondu{from{opacity:0}}
        .cc-halo{position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;animation:cc-pulse 1.4s ease-in-out infinite;pointer-events:none}
        @keyframes cc-pulse{50%{transform:scale(1.12);opacity:.7}}
        .cc-grande{position:relative;width:170px;height:170px;border-radius:50%}
        .cc-interieur{position:absolute;inset:14px;display:flex;align-items:center;justify-content:center;filter:blur(1.2px) saturate(.9);opacity:.85;transition:filter .5s,opacity .5s}
        .cc-haut,.cc-bas{position:absolute;left:0;right:0;height:50%;border:4px solid #fff}
        .cc-haut{top:0;border-radius:85px 85px 0 0;border-bottom:0;opacity:.62;box-shadow:inset 0 10px 24px #ffffff88}
        .cc-bas{bottom:0;border-radius:0 0 85px 85px;border-top:0;background:linear-gradient(180deg,#ffffff22,#ffffff66);box-shadow:inset 0 -10px 24px #ffffffaa}
        .cc-joint{position:absolute;left:-4px;right:-4px;top:calc(50% - 6px);height:12px;border-radius:6px;border:3px solid #fff}
        .cc-reflet{position:absolute;left:24px;top:18px;width:50px;height:26px;border-radius:50%;background:#fff;opacity:.7;transform:rotate(-30deg);filter:blur(1px)}
        .cc-chute{animation:cc-chute 1.1s cubic-bezier(.55,0,.6,1.35) both}
        @keyframes cc-chute{0%{transform:translate(40px,-260px) scale(.25) rotate(-90deg);opacity:0}15%{opacity:1}70%{transform:translate(0,8px) scale(1.02,.96) rotate(8deg)}85%{transform:translate(0,-14px) scale(.98,1.03) rotate(-3deg)}100%{transform:none}}
        .cc-balance{animation:cc-balance 1.3s ease-in-out infinite}
        @keyframes cc-balance{0%,55%,100%{transform:rotate(0)}65%{transform:rotate(-9deg)}75%{transform:rotate(8deg)}85%{transform:rotate(-4deg)}}
        .cc-balance .cc-interieur{filter:blur(.8px);opacity:.9}
        .cc-craque{animation:cc-tremble2 .09s linear infinite}
        @keyframes cc-tremble2{25%{transform:translate(-3px,1px) rotate(-3deg)}75%{transform:translate(3px,-1px) rotate(3deg)}}
        .cc-craque .cc-haut{animation:cc-haut .5s .5s cubic-bezier(.3,0,.6,1) forwards}
        .cc-craque .cc-joint{animation:cc-joint .5s .5s ease-out forwards}
        .cc-craque .cc-bas{animation:cc-bas .5s .5s ease-in forwards}
        .cc-craque .cc-interieur{filter:none;opacity:1}
        @keyframes cc-haut{to{transform:translate(-40px,-160px) rotate(-75deg);opacity:0}}
        @keyframes cc-bas{to{transform:translate(30px,120px) rotate(40deg);opacity:0}}
        @keyframes cc-joint{to{transform:scaleX(1.8);opacity:0}}
        .cc-carte{animation:cc-apparait .5s cubic-bezier(.3,1.6,.5,1) both;overflow:hidden}
        @keyframes cc-apparait{from{transform:scale(.5);opacity:0}}
        .cc-rayons{position:absolute;inset:-40%;animation:cc-rayons 14s linear infinite;pointer-events:none}
        @keyframes cc-rayons{to{transform:rotate(360deg)}}
        .cc-pop{animation:cc-pop .8s cubic-bezier(.3,1.8,.5,1) both}
        @keyframes cc-pop{from{transform:translateY(40px) scale(.2) rotate(-20deg)}}
        .cc-confetti{position:absolute;left:50%;top:35%;animation:cc-confetti 1.3s cubic-bezier(.2,.8,.4,1) both}
        @keyframes cc-confetti{from{transform:translate(-50%,-50%) scale(.3);opacity:1}to{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) rotate(400deg) scale(1);opacity:0}}
        .cc-gain{animation:cc-gain .6s .5s both}
        @keyframes cc-gain{from{transform:scale(.6);opacity:0}}
        @media (prefers-reduced-motion: reduce){.cc-etoiles,.cc-rayons,.cc-halo,.cc-balance,.cc-craque{animation:none}}
      `}</style>
    </div>
  );
}
