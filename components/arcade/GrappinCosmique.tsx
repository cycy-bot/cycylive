"use client";

// ============================================================
// LE GRAPPIN COSMIQUE — 3 tirages par jour, récompense Discord
// ============================================================
// Une machine à pinces néon des années 80, remplie de Gloups (les petits
// habitants de la galaxie Cycylive) et de lots. CycyBot
// (bot.cycylive.fr/api/grappin) remplit la vitrine du jour et décide de
// chaque prise : le site ne fait qu'afficher. Jamais de tirage à vide :
// si l'objet glisse, un petit Gloup s'accroche au grappin. À la fin des
// 3 tirages, le total est ajouté directement au compte Discord.

import { useCallback, useEffect, useRef, useState } from "react";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";

type TypeObjet = "gloup" | "cristal" | "peluche" | "orbe" | "fusee" | "capsule" | "fragment" | "doree" | "reine" | "soucoupe";
type Objet = { id: number; type: TypeObjet; couche: number; x: number; a: number };
type Lot = { type: TypeObjet; nom: string; rarete: string; rareteLabel: string; label: string };
type Prise = Lot & { glisse: Lot | null; x: number };
type Resultat = { cible: number | null; type: TypeObjet; attrape: Lot; glisse: Lot | null; vide: boolean };
type Partie = {
  restants: number;
  tirages: number;
  objets: Objet[];
  prises: Prise[];
  fini: boolean;
  total: { xp: number; eclats: number; boosters: number; fragments: number; label: string } | null;
  recupere: boolean;
  given: string[] | null;
  resultat?: Resultat | null;
};

// Géométrie de la vitrine (px) : hauteur fixe, largeur fluide
const H = 470;
const RAIL = 34; // haut du chariot
const TETE = 58; // hauteur de la tête du grappin (pinces comprises)
const SOL = 18;
const BAS_COUCHE = [104, 60, 16]; // bas des objets selon la couche (0 = dessus du tas)
const PIT_G = 0.15, PIT_L = 0.83; // le tas occupe 15 % → 98 % de la largeur ; à gauche, la sortie
const SORTIE = 0.07;
const PORTEE = 0.06, GENE = 0.025; // mêmes règles que CycyBot
const taille = (t: TypeObjet) => (t === "reine" || t === "soucoupe" ? 86 : t === "capsule" || t === "doree" ? 62 : 58);
const versVitrine = (x: number) => PIT_G + x * PIT_L;
const versTas = (gx: number) => (gx - PIT_G) / PIT_L;

const COULEUR_RARETE: Record<string, string> = { commune: "#c9c3e6", peu: "#7ee2a8", rare: "#5fd4ff", epique: "#ff5cf0", legendaire: "#ffb627", mythique: "#ff4f9a" };
const LEGENDE: [TypeObjet, string, string, string][] = [
  ["gloup", "Petit Gloup", "3 points stellaires + 4 Éclats", "commune"],
  ["cristal", "Cristal lunaire", "7 Éclats", "commune"],
  ["peluche", "Étoile en peluche", "6 points stellaires", "commune"],
  ["orbe", "Orbe néon", "12 Éclats", "peu"],
  ["fusee", "Mini-fusée", "8 points + 6 Éclats", "peu"],
  ["capsule", "Capsule booster", "1 booster", "rare"],
  ["fragment", "Fragment d'étoile", "1 fragment", "rare"],
  ["doree", "Capsule dorée", "2 boosters", "epique"],
  ["reine", "Reine des Gloups", "2 boosters + 1 fragment + 15 Éclats", "legendaire"],
  ["soucoupe", "Soucoupe JACKPOT", "4 boosters + 2 fragments + 50 Éclats", "mythique"],
];

class ConnexionRequise extends Error {}
async function appel(corps: Record<string, unknown>): Promise<Partie> {
  const r = await fetch(`${BOT}/api/grappin`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session: sessionDiscord(), ...corps }) });
  const d = await r.json().catch(() => ({}));
  if (d.connexion) throw new ConnexionRequise(d.error);
  if (!r.ok || !d.ok) throw new Error(d.error || "Le grappin est indisponible pour le moment.");
  return d as Partie;
}

/** L'objet que la pince va toucher (même calcul que CycyBot). */
function sousLaPince(objets: Objet[], x: number): Objet | null {
  const l = objets.filter((o) => Math.abs(o.x - x) <= PORTEE).sort((a, b) => Math.abs(a.x - x) + a.couche * GENE - (Math.abs(b.x - x) + b.couche * GENE));
  return l[0] || null;
}

// ─────────────── Les dessins (SVG originaux) ───────────────
const TEINTES_GLOUP = ["#9dff3d", "#3df5ff", "#ff6bd6", "#b98cff"];

function Gloup({ teinte, couronne = false }: { teinte: string; couronne?: boolean }) {
  return (
    <g>
      {/* antennes à pompon étoilé */}
      <path d="M-9 -16 Q-14 -27 -18 -29 M9 -16 Q14 -27 18 -29" stroke={teinte} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="-18" cy="-29" r="3.6" fill="#ffe066" />
      <circle cx="18" cy="-29" r="3.6" fill="#ffe066" />
      {/* corps en goutte */}
      <path d="M0 -20 C15 -20 22 -6 22 8 C22 20 12 24 0 24 C-12 24 -22 20 -22 8 C-22 -6 -15 -20 0 -20 Z" fill={teinte} />
      <path d="M-14 -6 C-12 -13 -6 -16 -1 -16" stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* petits bras */}
      <path d="M-21 8 Q-28 4 -27 -2 M21 8 Q28 4 27 -2" stroke={teinte} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* deux grands yeux */}
      <ellipse cx="-7.5" cy="2" rx="6" ry="7" fill="#fff" />
      <ellipse cx="7.5" cy="2" rx="6" ry="7" fill="#fff" />
      <circle cx="-6.5" cy="3.5" r="3.4" fill="#1a0b2e" />
      <circle cx="8.5" cy="3.5" r="3.4" fill="#1a0b2e" />
      <circle cx="-5.3" cy="2" r="1.2" fill="#fff" />
      <circle cx="9.7" cy="2" r="1.2" fill="#fff" />
      <path d="M-5 14 Q0 18 5 14" stroke="#1a0b2e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="-15" cy="12" rx="3" ry="2" fill="#ff7ab8" opacity=".6" />
      <ellipse cx="15" cy="12" rx="3" ry="2" fill="#ff7ab8" opacity=".6" />
      {couronne && (
        <g transform="translate(0 -22)">
          <path d="M-12 0 L-12 -11 L-6 -5 L0 -14 L6 -5 L12 -11 L12 0 Z" fill="#ffd23f" stroke="#fff6c8" strokeWidth="1.2" />
          <circle cx="0" cy="-5" r="2" fill="#ff4f9a" />
        </g>
      )}
    </g>
  );
}

function DessinObjet({ type, id = 0 }: { type: TypeObjet; id?: number }) {
  switch (type) {
    case "gloup":
      return <Gloup teinte={TEINTES_GLOUP[id % TEINTES_GLOUP.length]} />;
    case "reine":
      return <g transform="scale(1.05)"><Gloup teinte="#c56bff" couronne /></g>;
    case "cristal":
      return (
        <g>
          <path d="M0 -26 L14 -10 L10 20 L-10 20 L-14 -10 Z" fill="#3df5ff" fillOpacity=".35" stroke="#3df5ff" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M0 -26 L4 -8 L0 20 M-14 -10 L4 -8 L14 -10" stroke="#bffcff" strokeWidth="1.4" fill="none" opacity=".8" />
          <circle cx="-5" cy="-6" r="2" fill="#fff" />
        </g>
      );
    case "peluche":
      return (
        <g>
          <path d="M0 -25 L7 -8 L25 -7 L11 5 L16 23 L0 13 L-16 23 L-11 5 L-25 -7 L-7 -8 Z" fill="#ffe066" stroke="#fff3b0" strokeWidth="2" strokeLinejoin="round" />
          <path d="M0 -25 L7 -8 L25 -7 L11 5 L16 23 L0 13 L-16 23 L-11 5 L-25 -7 L-7 -8 Z" fill="none" stroke="#b8860b" strokeWidth="1" strokeDasharray="2 2.5" transform="scale(.82)" />
          <circle cx="-4.5" cy="0" r="2" fill="#2b1640" />
          <circle cx="4.5" cy="0" r="2" fill="#2b1640" />
          <path d="M-3 5 Q0 8 3 5" stroke="#2b1640" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case "orbe":
      return (
        <g>
          <circle r="18" fill="#ff5cf0" fillOpacity=".3" stroke="#ff5cf0" strokeWidth="2.4" />
          <circle r="9" fill="#ffb3f7" />
          <ellipse rx="27" ry="7" fill="none" stroke="#3df5ff" strokeWidth="2.2" transform="rotate(-18)" />
          <circle cx="-7" cy="-8" r="3" fill="#fff" opacity=".8" />
        </g>
      );
    case "fusee":
      return (
        <g transform="rotate(-20)">
          <path d="M0 -26 C9 -16 10 0 7 14 L-7 14 C-10 0 -9 -16 0 -26 Z" fill="#f3ecff" stroke="#ff5cf0" strokeWidth="2" />
          <circle cy="-6" r="4.5" fill="#3df5ff" stroke="#1a0b2e" strokeWidth="1.5" />
          <path d="M-7 6 L-15 18 L-7 15 Z M7 6 L15 18 L7 15 Z" fill="#ff5cf0" />
          <path d="M-4 15 L0 26 L4 15 Z" fill="#ffb627" />
        </g>
      );
    case "capsule":
    case "doree": {
      const or = type === "doree";
      return (
        <g>
          <path d="M-22 0 A22 22 0 0 1 22 0 Z" fill={or ? "#ffd23f" : "#9146ff"} opacity=".95" />
          <path d="M-22 0 A22 22 0 0 0 22 0 Z" fill="#ffffff" fillOpacity=".18" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
          <rect x="-8" y="-5" width="16" height="22" rx="3" fill={or ? "#fff6c8" : "#e0b3ff"} stroke={or ? "#b8860b" : "#5a2ab0"} strokeWidth="1.5" transform="rotate(-8)" />
          <path d="M-3 4 L0 -1 L3 4 L0 9 Z" fill={or ? "#ff4f9a" : "#9146ff"} transform="rotate(-8)" />
          {or && <rect x="1" y="-3" width="14" height="19" rx="3" fill="#fff6c8" stroke="#b8860b" strokeWidth="1.2" transform="rotate(14)" />}
          <path d="M-22 0 H22" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
          <path d="M-14 -12 Q-8 -17 -2 -18" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    }
    case "fragment":
      return (
        <g>
          <path d="M-4 -24 L14 -12 L18 8 L4 24 L-16 14 L-18 -6 Z" fill="#ffb627" fillOpacity=".35" stroke="#ffd23f" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M0 -10 L3 -3 L10 -2 L4 3 L6 10 L0 6 L-6 10 L-4 3 L-10 -2 L-3 -3 Z" fill="#fff6c8" />
        </g>
      );
    case "soucoupe":
      return (
        <g>
          <ellipse cy="10" rx="40" ry="14" fill="#ff4f9a" fillOpacity=".25" />
          <path d="M-16 -2 A16 16 0 0 1 16 -2 Z" fill="#3df5ff" fillOpacity=".55" stroke="#bffcff" strokeWidth="2" />
          <ellipse cy="2" rx="36" ry="10" fill="#c9c3e6" stroke="#fff" strokeWidth="2" />
          <ellipse cy="2" rx="36" ry="10" fill="url(#gr-arcenciel)" opacity=".6" />
          {[-24, -8, 8, 24].map((x) => <circle key={x} cx={x} cy="4" r="2.6" fill="#ffe066" />)}
          <g transform="translate(0 -9) scale(.42)"><Gloup teinte="#9dff3d" /></g>
          <text y="-24" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffe066" letterSpacing="1.5" style={{ filter: "drop-shadow(0 0 3px #ff4f9a)" }}>JACKPOT</text>
        </g>
      );
  }
}

function Pince({ ouverture }: { ouverture: number }) {
  const a = 8 + ouverture * 26; // angle des branches
  return (
    <svg width="64" height={TETE} viewBox="-32 0 64 58" className="overflow-visible drop-shadow-[0_0_6px_#3df5ff]">
      <rect x="-14" y="0" width="28" height="16" rx="6" fill="#2a1a4a" stroke="#3df5ff" strokeWidth="2" />
      <circle cx="0" cy="8" r="3.2" fill="#ff4f9a" />
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${s * 8} 14) rotate(${s * (a - 14)})`}>
          <path d={`M0 0 Q${s * 15} 17 ${s * 4} 36`} stroke="#d9d2f2" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <circle cx={s * 4} cy="36" r="2.6" fill="#3df5ff" />
        </g>
      ))}
    </svg>
  );
}

// ─────────────── Le jeu ───────────────
type Phase = "viser" | "descente" | "remontee" | "retour" | "lot";

export default function GrappinCosmique() {
  const compte = useCompteDiscord();
  const [partie, setPartie] = useState<Partie | null>(null);
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);
  const [gx, setGx] = useState(0.56); // position du grappin dans la vitrine (0-1)
  const [cable, setCable] = useState(0); // longueur du câble (px)
  const [ouverture, setOuverture] = useState(1);
  const [phase, setPhase] = useState<Phase>("viser");
  const [duree, setDuree] = useState(0); // durée des transitions (ms)
  const [tenu, setTenu] = useState<{ type: TypeObjet; id: number; chute?: boolean } | null>(null);
  const [cache, setCache] = useState<number | null>(null); // objet en train d'être soulevé (masqué du tas)
  const [glisse, setGlisse] = useState<{ type: TypeObjet; id: number; o: Objet } | null>(null);
  const [annonce, setAnnonce] = useState<Lot | null>(null);
  const [chrono, setChrono] = useState(20);
  const dir = useRef(0);
  const zone = useRef<HTMLDivElement | null>(null);
  const occupe = phase !== "viser" || charge;

  const entrer = useCallback(async () => {
    setCharge(true);
    setErreur("");
    try {
      setPartie(await appel({ action: "etat" }));
    } catch (e) {
      if (e instanceof ConnexionRequise) compte.oublier();
      setErreur(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Impossible de joindre CycyBot pour le moment. Réessaie dans un instant.");
    } finally {
      setCharge(false);
    }
  }, [compte]);

  // Déplacement continu (boutons maintenus ou flèches du clavier)
  useEffect(() => {
    if (!partie || partie.fini) return;
    let raf = 0, avant = performance.now();
    const pas = (t: number) => {
      const dt = Math.min(0.05, (t - avant) / 1000);
      avant = t;
      if (dir.current && phase === "viser") setGx((x) => Math.max(versVitrine(0.02), Math.min(versVitrine(0.99), x + dir.current * 0.42 * dt)));
      raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [partie, phase]);

  const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const lacher = useCallback(async () => {
    if (!partie || partie.fini || phase !== "viser" || charge) return;
    dir.current = 0;
    const x = versTas(gx);
    const vise = sousLaPince(partie.objets, x);
    const fond = vise ? H - BAS_COUCHE[vise.couche] - taille(vise.type) * 0.55 : H - SOL - 20;
    const longueur = Math.max(40, fond - RAIL - TETE + 14);
    const requete = appel({ action: "tirer", x }).then((p) => ({ p }), (e: unknown) => ({ e }));
    // 1. descente
    setPhase("descente");
    setDuree(1300);
    setCable(longueur);
    await attendre(1350);
    // 2. la pince se referme
    setDuree(300);
    setOuverture(0.05);
    await attendre(380);
    const rep = await requete;
    if ("e" in rep) {
      setDuree(900); setCable(0); setOuverture(1);
      await attendre(950);
      setPhase("viser");
      const e = rep.e;
      if (e instanceof ConnexionRequise) compte.oublier();
      setErreur(e instanceof Error ? e.message : "Tirage impossible, réessaie.");
      return;
    }
    const p = rep.p, r = p.resultat;
    if (!r) { setPartie(p); setPhase("viser"); setCable(0); setOuverture(1); return; }
    // 3. remontée, avec l'objet visé
    setPhase("remontee");
    const cibleObj = r.cible != null ? partie.objets.find((o) => o.id === r.cible) || null : null;
    if (cibleObj) { setCache(cibleObj.id); setTenu({ type: cibleObj.type, id: cibleObj.id }); }
    else setTenu({ type: "gloup", id: Math.floor(Math.random() * 4) });
    setDuree(r.glisse ? 650 : 1200);
    setCable(r.glisse ? longueur * 0.45 : 0);
    await attendre(r.glisse ? 700 : 1250);
    if (r.glisse && cibleObj) {
      // l'objet glisse… et retombe dans le tas, un Gloup s'accroche à sa place
      setGlisse({ type: cibleObj.type, id: cibleObj.id, o: cibleObj });
      setTenu({ type: "gloup", id: cibleObj.id + 1 });
      await attendre(150);
      setCache(null);
      setDuree(650);
      setCable(0);
      await attendre(700);
      setGlisse(null);
    }
    // 4. direction la sortie
    setPhase("retour");
    setDuree(900);
    setGx(SORTIE);
    await attendre(950);
    setDuree(250);
    setOuverture(1);
    setTenu((t) => (t ? { ...t, chute: true } : t));
    await attendre(450);
    setTenu(null);
    setCache(null);
    setPartie(p);
    setAnnonce(r.attrape);
    setPhase("lot");
    await attendre(2300);
    setAnnonce(null);
    setDuree(700);
    setGx(0.56);
    setPhase("viser");
    setChrono(20);
  }, [partie, phase, charge, gx, compte]);

  // Clavier : ← → pour viser, Espace / Entrée pour lâcher
  useEffect(() => {
    if (!partie || partie.fini) return;
    const bas = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); setDuree(0); dir.current = e.key === "ArrowLeft" ? -1 : 1; }
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); lacher(); }
    };
    const haut = (e: KeyboardEvent) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") dir.current = 0; };
    window.addEventListener("keydown", bas);
    window.addEventListener("keyup", haut);
    return () => { window.removeEventListener("keydown", bas); window.removeEventListener("keyup", haut); };
  }, [partie, lacher]);

  // Compte à rebours de l'arcade : le grappin tombe tout seul au bout de 20 s
  useEffect(() => {
    if (!partie || partie.fini || phase !== "viser") return;
    const t = setInterval(() => setChrono((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [partie, phase]);
  useEffect(() => {
    if (chrono <= 0 && phase === "viser") { setChrono(20); lacher(); }
  }, [chrono, phase, lacher]);

  const viserIci = (ev: React.PointerEvent) => {
    if (!zone.current || phase !== "viser" || !partie || partie.fini) return;
    const r = zone.current.getBoundingClientRect();
    setDuree(450);
    setGx(Math.max(versVitrine(0.02), Math.min(versVitrine(0.99), (ev.clientX - r.left) / r.width)));
  };
  const maintenir = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); setDuree(0); dir.current = d; },
    onPointerUp: () => { dir.current = 0; },
    onPointerLeave: () => { dir.current = 0; },
    onPointerCancel: () => { dir.current = 0; },
  });

  const objets = partie ? partie.objets : [];
  const enCours = partie && !partie.fini;
  const transition = `${duree}ms cubic-bezier(.45,.05,.35,1)`;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
      <div>
        {/* ── La borne ── */}
        <div className="gr-borne relative rounded-[28px] p-3 sm:p-4">
          <div className="gr-fronton mb-3 flex items-center justify-center gap-3 rounded-2xl py-3">
            <span className="gr-ampoules" aria-hidden />
            <h2 className="gr-neon text-center text-xl sm:text-3xl font-black uppercase tracking-[0.18em]">Grappin cosmique</h2>
            <span className="gr-ampoules" aria-hidden />
          </div>

          <div ref={zone} onPointerDown={viserIci} className="gr-vitre relative select-none overflow-hidden rounded-2xl touch-none" style={{ height: H }}>
            {/* décor synthwave */}
            <div className="gr-soleil" aria-hidden />
            <div className="gr-grille" aria-hidden />
            <svg width="0" height="0" className="absolute" aria-hidden>
              <defs>
                <linearGradient id="gr-arcenciel" x1="0" x2="1">
                  <stop offset="0%" stopColor="#ff4f9a" /><stop offset="33%" stopColor="#ffe066" /><stop offset="66%" stopColor="#3df5ff" /><stop offset="100%" stopColor="#b98cff" />
                </linearGradient>
              </defs>
            </svg>

            {/* rail du chariot */}
            <div className="absolute inset-x-3 h-2 rounded-full bg-[#3df5ff]/30 shadow-[0_0_12px_#3df5ff]" style={{ top: RAIL - 6 }} />

            {/* la sortie */}
            <div className="absolute bottom-0 left-0 flex flex-col items-center justify-end" style={{ width: `${PIT_G * 100 - 2}%`, height: 150 }}>
              <span className="gr-neon-rose mb-1 text-[10px] sm:text-xs font-black tracking-widest">SORTIE</span>
              <div className="h-[110px] w-[86%] rounded-t-xl border-2 border-b-0 border-[#ff4f9a] bg-black/50 shadow-[inset_0_0_18px_#ff4f9a66,0_0_14px_#ff4f9a66]" />
            </div>
            <div className="absolute bottom-0 h-[150px] w-1 rounded-full bg-[#ff4f9a]/70 shadow-[0_0_10px_#ff4f9a]" style={{ left: `${PIT_G * 100 - 1.5}%` }} />

            {/* le monticule de billes néon sous les lots */}
            <svg className="pointer-events-none absolute bottom-0" style={{ left: `${PIT_G * 100}%`, width: `${PIT_L * 100 + 1}%`, height: 120 }} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
              <defs>
                <radialGradient id="gr-tas" cx="50%" cy="100%" r="80%"><stop offset="0%" stopColor="#ff4f9a" stopOpacity=".45" /><stop offset="100%" stopColor="#3df5ff" stopOpacity=".08" /></radialGradient>
              </defs>
              <path d="M0 120 L0 70 Q60 28 130 44 Q200 8 270 40 Q340 22 400 62 L400 120 Z" fill="url(#gr-tas)" />
              {Array.from({ length: 46 }, (_, i) => {
                const x = (i * 83) % 400, y = 64 + ((i * 37) % 52);
                return <circle key={i} cx={x} cy={y} r={5 + (i % 4)} fill={["#ff4f9a", "#3df5ff", "#ffe066", "#b98cff"][i % 4]} opacity=".28" />;
              })}
            </svg>
            {/* le tas de lots */}
            {[...objets].sort((a, b) => b.couche - a.couche).map((o) => {
              if (o.id === cache) return null;
              const t = taille(o.type);
              const vise = enCours && phase === "viser" && sousLaPince(objets, versTas(gx))?.id === o.id;
              return (
                <div
                  key={o.id}
                  className={`absolute transition-[filter] duration-200 ${vise ? "gr-vise" : ""}`}
                  style={{ left: `calc(${versVitrine(o.x) * 100}% - ${t / 2}px)`, bottom: BAS_COUCHE[o.couche], width: t, height: t, zIndex: 10 - o.couche }}
                  title={LEGENDE.find((l) => l[0] === o.type)?.[1]}
                >
                  <svg viewBox="-32 -34 64 64" width={t} height={t} className="overflow-visible" style={{ transform: `rotate(${o.a}deg)` }}>
                    <DessinObjet type={o.type} id={o.id} />
                  </svg>
                </div>
              );
            })}
            {/* l'objet qui glisse retombe à sa place */}
            {glisse ? (
              <div className="gr-retombe absolute" style={{ left: `calc(${versVitrine(glisse.o.x) * 100}% - ${taille(glisse.type) / 2}px)`, bottom: BAS_COUCHE[glisse.o.couche], width: taille(glisse.type), height: taille(glisse.type), zIndex: 9 }}>
                <svg viewBox="-32 -34 64 64" width={taille(glisse.type)} height={taille(glisse.type)} className="overflow-visible"><DessinObjet type={glisse.type} id={glisse.id} /></svg>
              </div>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#ff4f9a]/25 to-transparent" style={{ height: SOL + 10 }} />

            {/* le grappin */}
            <div className="absolute z-20" style={{ left: `${gx * 100}%`, top: RAIL - 14, transition: `left ${transition}` }}>
              <div className="absolute -left-6 -top-2 h-5 w-12 rounded-md border-2 border-[#3df5ff] bg-[#2a1a4a] shadow-[0_0_10px_#3df5ff]" />
              <div className="absolute left-[-1px] top-3 w-[2px] bg-[#d9d2f2]" style={{ height: cable + 2, transition: `height ${transition}` }} />
              <div className="absolute -translate-x-1/2" style={{ top: cable + 4, transition: `top ${transition}`, left: 0 }}>
                <div style={{ transition: `transform ${transition}` }}>
                  <Pince ouverture={ouverture} />
                </div>
                {tenu ? (
                  <div className={`absolute left-1/2 -translate-x-1/2 ${tenu.chute ? "gr-chute" : ""}`} style={{ top: TETE - 18 }}>
                    <svg viewBox="-32 -34 64 64" width={taille(tenu.type) * 0.9} height={taille(tenu.type) * 0.9} className="overflow-visible">
                      <DessinObjet type={tenu.type} id={tenu.id} />
                    </svg>
                  </div>
                ) : null}
              </div>
            </div>

            {/* annonce du lot */}
            {annonce ? (
              <div className="gr-annonce absolute left-1/2 top-[22%] z-30 -translate-x-1/2 rounded-2xl border-2 bg-[#12062a]/90 px-6 py-4 text-center backdrop-blur" style={{ borderColor: COULEUR_RARETE[annonce.rarete], boxShadow: `0 0 30px ${COULEUR_RARETE[annonce.rarete]}88` }}>
                <svg viewBox="-32 -34 64 64" width="70" height="70" className="mx-auto overflow-visible"><DessinObjet type={annonce.type} id={3} /></svg>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: COULEUR_RARETE[annonce.rarete] }}>{annonce.rareteLabel}</p>
                <p className="text-lg font-bold text-ink">{annonce.nom}</p>
                <p className="text-sm text-ink-soft">{annonce.label}</p>
              </div>
            ) : null}

            {/* écran d'accueil */}
            {!partie ? (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0b0418]/75 p-5 text-center backdrop-blur-[2px]">
                <div className="max-w-md">
                  <p className="gr-neon mb-2 text-2xl font-black uppercase tracking-widest">Insert coin</p>
                  <p className="mb-5 text-sm text-ink-soft">Trois tirages par jour. Les Gloups gardent la vitrine, mais les capsules à boosters et la soucoupe <strong className="text-ink">JACKPOT</strong> sont tout au fond… À toi de bien viser !</p>
                  {compte.joueur ? (
                    <>
                      <button type="button" onClick={entrer} disabled={charge} className="gr-bouton rounded-full px-8 py-3 font-black uppercase tracking-wider text-[#12062a] disabled:opacity-60">
                        {charge ? "CycyBot remplit la vitrine…" : "Jouer ▸"}
                      </button>
                      <div className="mt-4"><BandeauDiscord compte={compte} /></div>
                    </>
                  ) : compte.pret ? (
                    <BoutonDiscord erreur={compte.erreur} texte="3 tirages par jour et par compte Discord : ta récompense arrive directement sur ton profil." />
                  ) : null}
                  {erreur ? <p className="mt-4 text-sm text-red-300">{erreur}</p> : null}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Le pupitre ── */}
          {partie ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/30 px-3 py-3">
              <div className="flex items-center gap-2" aria-label={`${partie.restants} tirage(s) restant(s)`}>
                {Array.from({ length: partie.tirages }, (_, i) => (
                  <span key={i} className={`h-7 w-7 rounded-full border-2 text-center text-xs font-black leading-6 ${i < partie.restants ? "border-[#ffe066] bg-[#ffe066]/25 text-[#ffe066] shadow-[0_0_10px_#ffe06688]" : "border-white/15 text-white/20"}`}>¢</span>
                ))}
                <span className="ml-1 text-sm text-ink-soft">{partie.fini ? "Plus de tirages aujourd'hui" : `${partie.restants} tirage${partie.restants > 1 ? "s" : ""}`}</span>
              </div>
              {enCours ? (
                <div className="flex items-center gap-2">
                  <span className={`w-10 text-right text-sm tabular-nums ${chrono <= 5 ? "text-[#ff4f9a]" : "text-ink-soft"}`}>{phase === "viser" ? `${chrono}s` : ""}</span>
                  <button type="button" aria-label="Déplacer à gauche" disabled={occupe} {...maintenir(-1)} className="gr-fleche h-12 w-12 rounded-full text-xl font-black disabled:opacity-40">◀</button>
                  <button type="button" aria-label="Déplacer à droite" disabled={occupe} {...maintenir(1)} className="gr-fleche h-12 w-12 rounded-full text-xl font-black disabled:opacity-40">▶</button>
                  <button type="button" onClick={lacher} disabled={occupe} className="gr-bouton h-14 rounded-full px-6 font-black uppercase tracking-wider text-[#12062a] disabled:opacity-50">
                    Lâcher ⬇
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          {partie && erreur ? <p className="mt-2 text-center text-sm text-red-300">{erreur}</p> : null}
        </div>

        {/* ── Le butin du jour ── */}
        {partie && partie.prises.length ? (
          <div className="carte-holo mt-5 rounded-3xl border border-violet/20 p-5" aria-live="polite">
            <h3 className="mb-3 text-lg font-semibold text-ink">{partie.fini ? "🎁 Ta récompense du jour" : "Ton butin pour l'instant"}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {partie.prises.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border bg-black/20 p-3" style={{ borderColor: COULEUR_RARETE[p.rarete] + "66" }}>
                  <svg viewBox="-32 -34 64 64" width="48" height="48" className="shrink-0 overflow-visible"><DessinObjet type={p.type} id={i} /></svg>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{p.nom}</p>
                    <p className="text-xs text-ink-soft">{p.label}</p>
                    {p.glisse ? <p className="text-[11px] text-ink-soft/60">{p.glisse.nom} a glissé… un Gloup s&apos;est accroché !</p> : null}
                  </div>
                </div>
              ))}
            </div>
            {partie.fini && partie.total ? (
              <div className="mt-4 rounded-2xl bg-violet/10 p-4 text-center">
                <p className="text-ink font-semibold">
                  ✅{" "}
                  {partie.recupere ? "Ajouté à ton compte Discord !" : "Ta récompense arrive sur ton compte Discord…"}
                </p>
                <p className="mt-1 text-ink-soft">{partie.given ? partie.given.map((g) => g.replace(/\*\*/g, "")).join(" · ") : partie.total.label}</p>
                <p className="mt-2 text-xs text-ink-soft/60">Une nouvelle vitrine t&apos;attend demain, dès minuit.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ── Règles et lots ── */}
      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">Comment jouer ?</h2>
        <ol className="mb-5 list-inside list-decimal space-y-2 text-sm text-ink-soft">
          <li>Place le grappin avec ◀ ▶ (ou les flèches, ou en touchant la vitrine).</li>
          <li>Appuie sur <strong className="text-ink">Lâcher</strong> (ou Espace) : 20 secondes par tirage !</li>
          <li>La pince attrape l&apos;objet le plus centré sous elle. Ceux du dessus passent devant : vise juste pour atteindre le fond.</li>
          <li>Les lots précieux glissent plus souvent… mais tu ne repars <strong className="text-ink">jamais les mains vides</strong> : un petit Gloup s&apos;accroche toujours.</li>
          <li>Après 3 tirages, tout est ajouté à ton compte Discord.</li>
        </ol>
        <h3 className="mb-2 text-sm font-semibold text-ink">Dans la vitrine</h3>
        <ul className="space-y-1.5 text-sm">
          {LEGENDE.map(([t, nom, lot, r]) => (
            <li key={t} className="flex items-center gap-2">
              <svg viewBox="-32 -34 64 64" width="30" height="30" className="shrink-0 overflow-visible"><DessinObjet type={t} id={0} /></svg>
              <span className="flex-1 text-ink-soft"><span className="text-ink">{nom}</span> · {lot}</span>
              <span className="whitespace-nowrap text-[11px]" style={{ color: COULEUR_RARETE[r] }}>{r === "commune" ? "commun" : r === "peu" ? "peu commun" : r === "epique" ? "épique" : r === "legendaire" ? "légendaire" : r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-soft/60">La vitrine change chaque jour et est remplie par CycyBot : la Reine des Gloups et la soucoupe JACKPOT ne sont pas là tous les jours. Il faut être membre du Discord Cycylive pour recevoir sa récompense.</p>
      </aside>

      <style>{`
        .gr-borne{background:linear-gradient(160deg,#2a0f4a,#14072a 55%,#2a0a33);box-shadow:0 0 0 2px #ff4f9a55,0 0 0 6px #14072a,0 0 0 8px #3df5ff55,0 30px 80px -30px #ff4f9a88}
        .gr-fronton{background:linear-gradient(90deg,#1b0835,#2b0d4d,#1b0835);border:2px solid #ff4f9a88;box-shadow:inset 0 0 20px #ff4f9a44}
        .gr-neon{color:#fff;text-shadow:0 0 4px #fff,0 0 10px #ff4f9a,0 0 22px #ff4f9a,0 0 40px #ff4f9a;animation:gr-gresille 5s infinite}
        .gr-neon-rose{color:#ffd1e6;text-shadow:0 0 6px #ff4f9a,0 0 14px #ff4f9a}
        @keyframes gr-gresille{0%,92%,100%{opacity:1}93%{opacity:.55}94%{opacity:1}96%{opacity:.7}}
        .gr-ampoules{width:38px;height:10px;background:radial-gradient(circle,#ffe066 2.5px,transparent 3px) 0 0/10px 10px;animation:gr-chenille .6s steps(2) infinite;filter:drop-shadow(0 0 4px #ffe066)}
        @keyframes gr-chenille{50%{background-position:5px 0;opacity:.6}}
        .gr-vitre{background:linear-gradient(180deg,#12052b 0%,#2a0a4a 45%,#5a1260 72%,#12052b 73%);border:2px solid #3df5ff66;box-shadow:inset 0 0 40px #3df5ff22,inset 0 0 0 1px #ffffff10}
        .gr-vitre::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:35;background:linear-gradient(115deg,transparent 30%,#ffffff12 38%,transparent 46%),repeating-linear-gradient(0deg,#ffffff05 0 2px,transparent 2px 4px)}
        .gr-soleil{position:absolute;left:50%;top:29%;width:180px;height:180px;margin-left:-90px;border-radius:50%;background:linear-gradient(#ffe066,#ff4f9a 70%);-webkit-mask:linear-gradient(#000 0 52%,transparent 52% 57%,#000 57% 66%,transparent 66% 70%,#000 70% 77%,transparent 77% 80%,#000 80%);mask:linear-gradient(#000 0 52%,transparent 52% 57%,#000 57% 66%,transparent 66% 70%,#000 70% 77%,transparent 77% 80%,#000 80%);opacity:.55;filter:blur(.3px) drop-shadow(0 0 24px #ff4f9a)}
        .gr-grille{position:absolute;left:-50%;right:-50%;bottom:0;height:27%;background:linear-gradient(#ff4f9a99 1.5px,transparent 1.5px) 0 0/100% 22px,linear-gradient(90deg,#3df5ff88 1.5px,transparent 1.5px) 0 0/44px 100%;transform:perspective(220px) rotateX(55deg);transform-origin:bottom;opacity:.55}
        .gr-vise{filter:drop-shadow(0 0 8px #3df5ff) drop-shadow(0 0 2px #fff)}
        .gr-bouton{background:linear-gradient(180deg,#ffe066,#ffb627);box-shadow:0 0 0 3px #12062a,0 0 0 5px #ffe06688,0 0 22px #ffb62788,inset 0 -4px 0 #c97f0a}
        .gr-bouton:not(:disabled):active{transform:translateY(2px);box-shadow:0 0 0 3px #12062a,0 0 0 5px #ffe06688,inset 0 -1px 0 #c97f0a}
        .gr-fleche{background:#2a1a4a;color:#3df5ff;border:2px solid #3df5ff;box-shadow:0 0 12px #3df5ff66;touch-action:none}
        .gr-fleche:not(:disabled):active{background:#3df5ff;color:#12062a}
        .gr-chute{animation:gr-chute .45s ease-in forwards}
        @keyframes gr-chute{to{transform:translate(-50%,160px) scale(.6);opacity:0}}
        .gr-retombe{animation:gr-retombe .6s cubic-bezier(.5,0,.75,0) both}
        @keyframes gr-retombe{from{transform:translateY(-140px) rotate(-12deg)}70%{transform:translateY(0) rotate(4deg)}85%{transform:translateY(-10px)}to{transform:translateY(0)}}
        .gr-annonce{animation:gr-pop .4s cubic-bezier(.3,1.6,.5,1) both}
        @keyframes gr-pop{from{transform:translate(-50%,0) scale(.4);opacity:0}}
        @media (prefers-reduced-motion: reduce){.gr-neon,.gr-ampoules{animation:none}}
      `}</style>
    </div>
  );
}
