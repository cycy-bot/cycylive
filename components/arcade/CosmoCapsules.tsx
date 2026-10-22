"use client";

// ============================================================
// COSMO-CAPSULES — la machine gatchapon kawaii cosmique
// ============================================================
// Une capsule par jour et par compte Discord. CycyBot
// (bot.cycylive.fr/api/capsules) tire la capsule : une figurine
// Cosmo-Copain à collectionner + un gain ajouté directement au compte.
// Le site anime la machine, l'ouverture de la capsule et l'album.

import { useCallback, useEffect, useMemo, useState } from "react";
import CosmoFigurine, { COULEUR_RARETE, NOM_RARETE, type Rarete } from "@/components/arcade/CosmoFigurine";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const RARETES: Rarete[] = ["commune", "peu", "rare", "epique", "legendaire", "mythique"];
const CHANCES: Record<Rarete, string> = { commune: "52 %", peu: "27 %", rare: "13 %", epique: "5,5 %", legendaire: "2 %", mythique: "0,5 %" };
const GAINS: Record<Rarete, string> = {
  commune: "8 Éclats ou 8 points stellaires",
  peu: "1 booster ou 15 Éclats",
  rare: "1 booster + 10 Éclats, ou 2 boosters",
  epique: "2 boosters + 15 Éclats, ou 2 boosters + 1 fragment",
  legendaire: "3 boosters + 1 fragment + 25 Éclats",
  mythique: "4 boosters + 2 fragments + 60 Éclats",
};

type Figurine = { id: string; nom: string; rarete: Rarete; rareteLabel: string };
type Resultat = { figurine: string; nom: string; rarete: Rarete; rareteLabel: string; nouvelle: boolean; label: string; bonus: { type: string; label: string }[]; garantie: boolean; given: string[] | null };
type Etat = {
  disponible: boolean;
  derniere: Resultat | null;
  album: Record<string, number>;
  possedees: number;
  total: number;
  garantie: { restant: number; sur: number };
  capsules: number;
  figurines: Figurine[];
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

function Capsule({ rarete, r = 15, ouverte = 0, id }: { rarete: Rarete; r?: number; ouverte?: number; id: string }) {
  const c = COULEUR_RARETE[rarete];
  const arc = rarete === "mythique";
  return (
    <g>
      {arc ? (
        <defs>
          <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff6bd6" /><stop offset="35%" stopColor="#ffd23f" /><stop offset="70%" stopColor="#3df5ff" /><stop offset="100%" stopColor="#b26bff" /></linearGradient>
        </defs>
      ) : null}
      <g transform={`translate(0 ${-ouverte * r * 1.4}) rotate(${-ouverte * 25})`}>
        <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`} fill={arc ? `url(#cap-${id})` : c} />
        <path d={`M${-r * 0.62} ${-r * 0.5} Q${-r * 0.3} ${-r * 0.82} ${r * 0.05} ${-r * 0.86}`} stroke="#fff" strokeOpacity=".8" strokeWidth={r * 0.16} fill="none" strokeLinecap="round" />
      </g>
      <g transform={`translate(0 ${ouverte * r * 0.5})`}>
        <path d={`M${-r} 0 A${r} ${r} 0 0 0 ${r} 0 Z`} fill="#fffaff" fillOpacity=".92" />
        <path d={`M${-r} 0 H${r}`} stroke={arc ? "#fff" : c} strokeWidth={r * 0.14} />
      </g>
    </g>
  );
}

export default function CosmoCapsules() {
  const compte = useCompteDiscord();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  // tourne → secoue → tombe → posée (à ouvrir) → ouverte
  const [anim, setAnim] = useState<"repos" | "tourne" | "tombe" | "posee" | "ouverte">("repos");
  const [resultat, setResultat] = useState<Resultat | null>(null);
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
      setTimeout(() => setAnim("posee"), 900);
    } catch (e) {
      if (e instanceof ConnexionRequise) compte.oublier();
      setErreur(e instanceof Error ? e.message : "La machine s'est coincée, réessaie.");
      setAnim("repos");
    }
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

  const figurines = useMemo(() => (etat?.figurines || []).filter((f) => filtre === "toutes" || f.rarete === filtre), [etat, filtre]);
  const rar = resultat?.rarete || "commune";
  const couleur = COULEUR_RARETE[rar];

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
              {/* antenne et petite planète au sommet */}
              <path d="M0 -156 L0 -176" stroke="#c9a8ff" strokeWidth="4" />
              <circle cx="0" cy="-178" r="7" fill="#ffd23f" />
              <ellipse cx="0" cy="-158" rx="34" ry="10" fill="#c9a8ff" />
              {/* globe de verre et capsules */}
              <circle cx="0" cy="-60" r="98" fill="#fff" opacity=".35" />
              <g clipPath="url(#cc-globe)">
                <g transform="translate(0 -60)"><g className={anim === "tourne" ? "cc-brasse" : ""}>
                  {BOULES.map(([x, y, r, i]) => (
                    <g key={i} transform={`translate(${x} ${y}) rotate(${(i * 47) % 360})`}><Capsule rarete={r} r={17} id={`b${i}`} /></g>
                  ))}
                </g></g>
              </g>
              <circle cx="0" cy="-60" r="96" fill="url(#cc-verre)" stroke="#fff" strokeWidth="4" />
              <path d="M-62 -110 Q-40 -140 -6 -146" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".85" />
              {/* corps */}
              <path d="M-96 30 L96 30 L110 150 Q110 168 92 168 L-92 168 Q-110 168 -110 150 Z" fill="url(#cc-corps)" stroke="#fff" strokeWidth="3" />
              <rect x="-104" y="22" width="208" height="18" rx="9" fill="url(#cc-socle)" stroke="#fff" strokeWidth="3" />
              {/* étiquette */}
              <rect x="-60" y="52" width="120" height="30" rx="15" fill="#fff" opacity=".9" />
              <text x="0" y="72" textAnchor="middle" fontSize="15" fontWeight="900" fill="#b26bff" fontFamily="system-ui, sans-serif">1 CAPSULE / JOUR</text>
              {/* fente à pièce */}
              <rect x="56" y="96" width="30" height="40" rx="8" fill="#fff" opacity=".85" />
              <rect x="68" y="104" width="6" height="22" rx="3" fill="#7a5aa8" />
              {/* manivelle */}
              <g transform="translate(-28 118)">
                <circle r="26" fill="#fff" stroke="#c9a8ff" strokeWidth="4" />
                <g className={anim === "tourne" ? "cc-manivelle" : ""}>
                  <rect x="-24" y="-7" width="48" height="14" rx="7" fill="#b26bff" />
                  <circle r="7" fill="#ffd23f" />
                </g>
              </g>
              {/* trappe de sortie */}
              <rect x="26" y="142" width="58" height="22" rx="11" fill="#7a3a8a" opacity=".55" />
              {/* la capsule qui tombe */}
              {anim === "tombe" || anim === "posee" ? (
                <g className={anim === "tombe" ? "cc-tombe" : "cc-attend"} style={{ transformOrigin: "55px 150px" }}>
                  <g transform="translate(55 146)"><Capsule rarete={rar} r={16} id="sortie" /></g>
                </g>
              ) : null}
              {/* visage kawaii de la machine */}
              <g transform="translate(-60 64)">
                <ellipse cx="-6" cy="0" rx="3" ry="4" fill="#7a3a6a" />
                <ellipse cx="8" cy="0" rx="3" ry="4" fill="#7a3a6a" />
                <path d="M-2 6 Q1 9 4 6" stroke="#7a3a6a" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            </svg>

            {/* ouverture de la capsule */}
            {anim === "posee" || anim === "ouverte" ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-3">
                <button
                  type="button"
                  onClick={() => setAnim("ouverte")}
                  disabled={anim === "ouverte"}
                  className={`cc-carte relative w-full max-w-[320px] rounded-[26px] border-4 bg-white/95 px-5 pb-5 pt-4 text-center shadow-2xl ${anim === "posee" ? "cursor-pointer" : "cursor-default"}`}
                  style={{ borderColor: couleur, boxShadow: `0 20px 60px -10px ${couleur}aa` }}
                  aria-label={anim === "posee" ? "Ouvrir la capsule" : undefined}
                >
                  {anim === "posee" ? (
                    <>
                      <svg viewBox="-40 -40 80 80" className="cc-tremble mx-auto h-36 w-36"><Capsule rarete={rar} r={30} id="ouvrir" /></svg>
                      <p className="mt-2 text-lg font-black text-[#7a3a8a]">Touche la capsule pour l&apos;ouvrir !</p>
                      <p className="text-sm" style={{ color: couleur }}>Capsule {NOM_RARETE[rar].toLowerCase()}…</p>
                    </>
                  ) : resultat ? (
                    <>
                      <div className="cc-rayons" style={{ background: `repeating-conic-gradient(${couleur}33 0 12deg, transparent 12deg 24deg)` }} aria-hidden />
                      <div className="relative">
                        <div className="cc-pop mx-auto w-fit"><CosmoFigurine id={resultat.figurine} taille={150} /></div>
                        {resultat.nouvelle ? <span className="absolute right-2 top-1 rounded-full bg-[#ff6bd6] px-2.5 py-0.5 text-xs font-black text-white shadow">NOUVEAU !</span> : <span className="absolute right-2 top-1 rounded-full bg-[#c9a8ff] px-2.5 py-0.5 text-xs font-bold text-white">doublon</span>}
                        <p className="mt-1 text-xs font-black uppercase tracking-widest" style={{ color: couleur }}>{resultat.rareteLabel}{resultat.garantie ? " · garantie" : ""}</p>
                        <p className="text-xl font-black text-[#4a2470]">{resultat.nom}</p>
                        <p className="mt-2 rounded-2xl bg-[#f6efff] px-3 py-2 text-sm font-semibold text-[#5a3a8a]">🎁 {resultat.given ? resultat.given.map((g) => g.replace(/\*\*/g, "")).join(" · ") : resultat.label}</p>
                        {resultat.bonus.filter((b) => b.type !== "doublon").map((b) => <p key={b.label} className="mt-2 text-sm font-black text-[#b26bff]">🏆 {b.label}</p>)}
                        <p className="mt-2 text-xs text-[#7a5aa8]">{resultat.given ? "Ajouté à ton compte Discord ✅" : "Ton cadeau arrive sur ton compte Discord…"}</p>
                        <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setAnim("repos"); }} onKeyDown={(e) => { if (e.key === "Enter") setAnim("repos"); }} className="mt-3 inline-block rounded-full border border-[#c9a8ff] px-4 py-1 text-xs font-semibold text-[#7a3a8a] hover:bg-[#f6efff]">Revoir la machine</span>
                      </div>
                    </>
                  ) : null}
                </button>
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
                <h2 id="titre-album" className="text-lg font-semibold text-ink">📒 Mon album des Cosmo-Copains</h2>
                <p className="text-sm text-ink-soft">{etat.possedees} / {etat.total} figurines · {etat.capsules} capsule{etat.capsules > 1 ? "s" : ""} ouverte{etat.capsules > 1 ? "s" : ""}</p>
              </div>
              <div className="min-w-[200px] flex-1 sm:max-w-[260px]">
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#ffb3d6] via-[#c9a8ff] to-[#7fd0ff]" style={{ width: `${(etat.possedees / Math.max(1, etat.total)) * 100}%` }} /></div>
                <p className="mt-1 text-xs text-ink-soft">✨ Épique ou mieux garanti dans {etat.garantie.restant} capsule{etat.garantie.restant > 1 ? "s" : ""} au plus</p>
              </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(["toutes", ...RARETES] as const).map((r) => (
                <button key={r} type="button" onClick={() => setFiltre(r)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${filtre === r ? "border-transparent bg-violet text-ink" : "border-violet/25 text-ink-soft hover:text-ink"}`}>
                  {r === "toutes" ? "Toutes" : NOM_RARETE[r]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {figurines.map((f) => {
                const n = etat.album[f.id] || 0;
                return (
                  <div key={f.id} className="relative flex flex-col items-center rounded-2xl border-2 bg-white/[.04] p-2 text-center" style={{ borderColor: COULEUR_RARETE[f.rarete] + (n ? "aa" : "33") }} title={n ? f.nom : "Pas encore trouvée"}>
                    <CosmoFigurine id={f.id} silhouette={!n} taille={64} />
                    <p className={`mt-1 text-[11px] font-semibold leading-tight ${n ? "text-ink" : "text-ink-soft/50"}`}>{n ? f.nom : "???"}</p>
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
          <li>Ouvre-la : un <strong className="text-ink">Cosmo-Copain</strong> rejoint ton album, et un cadeau arrive sur ton compte Discord. Jamais de capsule vide !</li>
          <li>Pas de chance pendant 10 jours ? La capsule suivante est <strong className="text-ink">Épique ou mieux</strong>, garanti.</li>
          <li>Doublon = petit bonus d&apos;Éclats. Une rareté complète, ou l&apos;album entier (24 figurines), donne un gros bonus !</li>
        </ol>
        <h3 className="mb-2 text-sm font-semibold text-ink">Les capsules</h3>
        <ul className="space-y-2 text-sm">
          {RARETES.map((r) => (
            <li key={r} className="flex items-start gap-2.5">
              <svg viewBox="-20 -20 40 40" width="28" height="28" className="mt-0.5 shrink-0"><Capsule rarete={r} r={15} id={`l${r}`} /></svg>
              <span className="flex-1 text-ink-soft">
                <span className="font-semibold" style={{ color: COULEUR_RARETE[r] }}>{NOM_RARETE[r]}</span> <span className="text-ink-soft/60">· {CHANCES[r]}</span>
                <br />
                {GAINS[r]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-soft/60">Bonus de collection : rareté commune complète = 1 booster, peu commune = 2 boosters, rare = 2 boosters + 1 fragment, épique = 3 boosters + 1 fragment ; album complet = 5 boosters + 2 fragments + 100 Éclats.</p>
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
        .cc-tombe{animation:cc-tombe .9s cubic-bezier(.5,0,.5,1.4) both}
        @keyframes cc-tombe{from{transform:translate(-30px,-110px) scale(.6);opacity:0}60%{transform:translate(0,4px) scale(1)}to{transform:none;opacity:1}}
        .cc-attend{animation:cc-hop 1s ease-in-out infinite}
        @keyframes cc-hop{50%{transform:translateY(-6px)}}
        .cc-tremble{animation:cc-tremble 1.1s ease-in-out infinite}
        @keyframes cc-tremble{0%,60%,100%{transform:rotate(0)}70%{transform:rotate(-10deg)}80%{transform:rotate(9deg)}90%{transform:rotate(-5deg)}}
        .cc-carte{animation:cc-apparait .45s cubic-bezier(.3,1.6,.5,1) both;overflow:hidden}
        @keyframes cc-apparait{from{transform:scale(.5);opacity:0}}
        .cc-rayons{position:absolute;inset:-40%;animation:cc-rayons 14s linear infinite;pointer-events:none}
        @keyframes cc-rayons{to{transform:rotate(360deg)}}
        .cc-pop{animation:cc-pop .7s cubic-bezier(.3,1.8,.5,1) both}
        @keyframes cc-pop{from{transform:translateY(40px) scale(.2) rotate(-20deg)}}
        @media (prefers-reduced-motion: reduce){.cc-etoiles,.cc-rayons,.cc-attend,.cc-tremble{animation:none}}
      `}</style>
    </div>
  );
}
