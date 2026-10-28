"use client";

// ============================================================
// LE GRAPPIN COSMIQUE — 3 tirages par jour, récompense Discord
// ============================================================
// Une vraie borne à pinces (illustrations de Cycylive) remplie de peluches
// cosmiques. CycyBot (bot.cycylive.fr/api/grappin) remplit la vitrine du jour
// et décide de chaque prise : le site ne fait qu'afficher. Chaque peluche
// cache un lot mystère, sans lien avec son apparence. Jamais de tirage à vide :
// si l'objet glisse, une étoile porte-bonheur s'accroche à la pince. À la fin
// des tirages, le total est ajouté directement au compte Discord.
//
// La machine (public/grappin/machine-pres.webp) sert de décor : toutes les
// positions sont en fractions de sa largeur (W) et de sa hauteur (H).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";

type Look = string;
type Objet = { id: number; look: Look; couche: number; x: number; a: number };
type Lot = { look: Look; nom: string; rarete: string; rareteLabel: string; label: string };
type Prise = Lot & { glisse: { look: Look; nom: string } | null; x: number };
type Resultat = { cible: number | null; look: Look; attrape: Lot; glisse: { look: Look; nom: string } | null; vide: boolean };
type Partie = {
  jour?: string;
  restants: number;
  tirages: number;
  bonus?: number;
  objets: Objet[];
  prises: Prise[];
  fini: boolean;
  total: { xp: number; eclats: number; boosters: number; fragments: number; label: string } | null;
  prisesTotal?: { xp: number; eclats: number; boosters: number; fragments: number; label: string };
  garanti?: number;
  boosterAttrape?: boolean;
  recupere: boolean;
  given: string[] | null;
  resultat?: Resultat | null;
};

// ── Les peluches (planche découpée dans public/grappin/peluches) ──
const PELUCHES = [
  "chat-nuit", "chat-dodo", "chat-sorcier", "chat-capuche", "dragon", "dragon-dodo", "astronaute", "ourson-astro",
  "lapin", "lapin-lune", "nuage", "nuage-rose", "arc-en-ciel", "comete", "lune", "lune-bonnet",
  "lune-breloque", "lune-cristal", "etoile", "etoile-rose", "etoile-mer", "etoile-cristal", "planete", "planete-donut",
  "orbe", "boule-velours", "poulpe", "fusee", "soucoupe", "soucoupe-bulle", "sac", "bocal",
  "boule-etoiles", "coeur-planete", "coeur", "coeur-ailes", "chauve-chat", "pingouin", "baleine", "meduse",
  "axolotl", "renard", "mouton", "escargot", "licorne", "macaron", "tortue",
];
// Tailles : grosses peluches (animaux), moyennes (lunes, planètes, nuages…), petites (orbes, cœurs, breloques)
const MOYENNES = new Set(["lune", "chat-sorcier", "nuage-rose", "arc-en-ciel", "comete", "lune-bonnet", "lune-cristal", "etoile", "etoile-rose", "etoile-mer", "planete", "planete-donut", "poulpe", "fusee", "sac", "mouton", "escargot", "tortue"]);
const PETITES = new Set(["lune-breloque", "etoile-cristal", "orbe", "boule-velours", "soucoupe-bulle", "bocal", "boule-etoiles", "coeur-planete", "coeur", "coeur-ailes", "macaron"]);
const fichier = (look: Look) => {
  if (look === "porte-bonheur") return "etoile";
  if (PELUCHES.includes(look)) return look;
  // ancienne apparence : une peluche choisie d'après son nom (toujours la même)
  let h = 0;
  for (const c of String(look)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PELUCHES[h % PELUCHES.length];
};
const src = (look: Look) => `/grappin/peluches/${fichier(look)}.webp`;
const echelle = (look: Look) => (look === "porte-bonheur" ? 0.7 : PETITES.has(fichier(look)) ? 0.62 : MOYENNES.has(fichier(look)) ? 0.8 : 1);

// ── Géométrie de la borne (fractions de la largeur W / hauteur H de l'image) ──
const RATIO = 1087 / 1447; // H / W
const PINCE_L = 0.2; // largeur de la pince (× W)
const PINCE_RATIO = 940 / 760; // hauteur / largeur de l'image de la pince
const BOUT_OUVERT = 0.97; // bout des doigts (fraction de la hauteur de la pince), ouverte
const TENU_Y = 0.79; // centre de l'objet tenu, pince fermée
const CABLE_X = -0.17, CABLE_Y = 0.16, CABLE_L = 0.12; // câble spiralé (× largeur de la pince)
const TAS_G = 0.27, TAS_D = 0.87; // les lots occupent 27 % → 87 % de la largeur ; à gauche, la sortie
const SORTIE = 0.19;
const TAILLE = 0.138; // taille d'une grosse peluche × W
const PORTEE = 0.06, GENE = 0.025; // mêmes règles que CycyBot
const MIN_X = 0.17, MAX_X = 0.84;
const versVitrine = (x: number) => TAS_G + x * (TAS_D - TAS_G);
const versTas = (gx: number) => (gx - TAS_G) / (TAS_D - TAS_G);

const COULEUR_RARETE: Record<string, string> = { commune: "#e0d6ff", peu: "#7ee2a8", rare: "#5fd4ff", epique: "#ff5cf0", legendaire: "#ffb627", mythique: "#ff4f9a" };

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

// ── Le tas de peluches, en rangs qui montent vers le fond de la machine ──
// Vu de face, les peluches de devant sont en bas et plus grosses ; chaque rang plus au fond est plus haut,
// un peu plus petit et plus dans l'ombre : le tas « monte » jusqu'en haut de la vitrine. Les lots se placent
// dans un rang selon leur couche (les plus précieux plutôt au fond), puis des peluches de décor (qui ne
// s'attrapent pas) comblent les trous de chaque rang sur toute la largeur.
const hasard = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
const OMBRE = "drop-shadow(0 6px 5px rgba(22,6,44,.5)) drop-shadow(0 1px 1px rgba(22,6,44,.35))";
type Rang = { bas: number; g: number; d: number; k: number; lum: number; z: number };
const RANGS: Rang[] = [
  { bas: 0.84, g: 0.45, d: 0.93, k: 1.15, lum: 1, z: 18 }, // devant (le bas est caché par le pupitre)
  { bas: 0.775, g: 0.3, d: 0.92, k: 1.05, lum: 0.95, z: 16 },
  { bas: 0.705, g: 0.12, d: 0.91, k: 0.95, lum: 0.88, z: 14 },
  { bas: 0.635, g: 0.13, d: 0.9, k: 0.87, lum: 0.8, z: 12 },
  { bas: 0.565, g: 0.15, d: 0.88, k: 0.8, lum: 0.72, z: 10 },
  { bas: 0.5, g: 0.18, d: 0.85, k: 0.72, lum: 0.64, z: 8 }, // tout au fond, en haut du tas
];
const RANGS_COUCHE = [[1, 2, 0], [3, 2, 1, 0], [4, 5, 3]];
const tailleDe = (look: Look, n: number, k: number) => {
  const base = PETITES.has(fichier(look)) ? 0.085 + hasard(n) * 0.035 : MOYENNES.has(fichier(look)) ? 0.12 + hasard(n) * 0.05 : 0.15 + hasard(n) * 0.08;
  return base * k; // × largeur de la borne
};
type Place = { x: number; bas: number; t: number; a: number; rang: number };

/** Range les lots dans les rangs (une seule fois par lot, pour qu'ils ne bougent plus). */
function placerLots(objets: Objet[], deja: Map<number, Place>) {
  const parRang: number[][] = RANGS.map(() => []);
  for (const p of deja.values()) parRang[p.rang].push(p.x);
  for (const o of [...objets].filter((o) => !deja.has(o.id)).sort((a, b) => a.couche - b.couche || a.id - b.id)) {
    const x = versVitrine(o.x);
    const choix = (RANGS_COUCHE[o.couche] || [3]).filter((r) => x >= RANGS[r].g && x <= RANGS[r].d);
    let rang = choix[0] ?? 3, mieux = -1;
    choix.forEach((r, i) => {
      const ecart = Math.min(1, ...parRang[r].map((v) => Math.abs(v - x))) - i * 0.025;
      if (ecart > mieux) { mieux = ecart; rang = r; }
    });
    parRang[rang].push(x);
    const R = RANGS[rang];
    deja.set(o.id, { x, rang, t: tailleDe(o.look, o.id, R.k), bas: R.bas + (hasard(o.id + 3) - 0.5) * 0.02, a: o.a * 0.3 });
  }
}

// toutes les peluches dans un ordre mélangé (toujours le même) : le décor les fait toutes défiler
const PAQUET = PELUCHES.map((p, i) => [p, hasard(i * 17 + 5)] as const).sort((a, b) => a[1] - b[1]).map(([p]) => p);

/** Les peluches de décor : elles comblent chaque rang d'un bord à l'autre, entre les lots. */
function decorDe(lots: Place[]) {
  const out: (Place & { look: Look })[] = [];
  let n = 0;
  RANGS.forEach((R, r) => {
    const pris = lots.filter((p) => p.rang === r).map((p) => [p.x - p.t * 0.38, p.x + p.t * 0.38]).sort((a, b) => a[0] - b[0]);
    let cur = R.g;
    const remplir = (fin: number) => {
      while (fin - cur > 0.03) {
        n++;
        const look = PAQUET[(n * 5 + r * 11) % PAQUET.length];
        let t = tailleDe(look, r * 31 + n, R.k);
        if (t * 0.76 > fin - cur) t = Math.max(0.05, (fin - cur) / 0.76);
        out.push({ look, x: cur + t * 0.38, t, bas: R.bas + (hasard(r * 7 + n) - 0.5) * 0.02, a: (hasard(n * 3 + r) - 0.5) * 16, rang: r });
        cur += t * 0.76;
      }
    };
    for (const [a, b] of pris) { remplir(a); cur = Math.max(cur, b); }
    remplir(R.d);
  });
  return out;
}

function Peluche({ look, taille, className = "", style }: { look: Look; taille: number; className?: string; style?: React.CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src(look)} alt="" draggable={false} width={taille} height={taille} className={`pointer-events-none select-none object-contain object-bottom ${className}`} style={{ width: taille, height: taille, ...style }} />;
}

type Phase = "viser" | "descente" | "remontee" | "retour" | "lot";

export default function GrappinCosmique() {
  const compte = useCompteDiscord();
  const [partie, setPartie] = useState<Partie | null>(null);
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);
  const [W, setW] = useState(860);
  const [gx, setGx] = useState(0.58); // position du grappin (× W)
  const [haut, setHaut] = useState(0); // descente de la pince (px)
  const [fermee, setFermee] = useState(false);
  const [penche, setPenche] = useState(0); // balancement (degrés)
  const [phase, setPhase] = useState<Phase>("viser");
  const [duree, setDuree] = useState(0);
  const [tenu, setTenu] = useState<{ look: Look; chute?: boolean } | null>(null);
  const [cache, setCache] = useState<number | null>(null);
  const [glisse, setGlisse] = useState<Objet | null>(null);
  const [annonce, setAnnonce] = useState<Lot | null>(null);
  const [eclat, setEclat] = useState(0); // nombre de gains (paillettes)
  const [flash, setFlash] = useState(false); // flash des néons quand un lot sort
  const [chrono, setChrono] = useState(20);
  const dir = useRef(0);
  const zone = useRef<HTMLDivElement | null>(null);
  const places = useRef(new Map<number, Place>());
  const jourPlaces = useRef<string | undefined>(undefined);
  const occupe = phase !== "viser" || charge;
  const H = W * RATIO;
  const PL = W * PINCE_L, PH = PL * PINCE_RATIO;
  const S = W * TAILLE;

  // La borne s'adapte à la largeur disponible
  useEffect(() => {
    const el = zone.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // Déplacement continu (boutons maintenus ou flèches du clavier) + balancement de la pince
  useEffect(() => {
    if (!partie || partie.fini) return;
    let raf = 0, avant = performance.now(), dernier = 0;
    const pas = (t: number) => {
      const dt = Math.min(0.05, (t - avant) / 1000);
      avant = t;
      if (phase === "viser") {
        if (dir.current) setGx((x) => Math.max(MIN_X, Math.min(MAX_X, x + dir.current * 0.3 * dt)));
        if (dir.current !== dernier) { dernier = dir.current; setPenche(-dir.current * 4); }
      }
      raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [partie, phase]);

  const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const lacher = useCallback(async () => {
    if (!partie || partie.fini || phase !== "viser" || charge) return;
    dir.current = 0;
    setPenche(0);
    const x = versTas(gx);
    const vise = sousLaPince(partie.objets, x);
    // les doigts descendent autour de l'objet visé (ou jusqu'au fond)
    const pv = vise ? places.current.get(vise.id) : null;
    const bas = pv ? pv.bas * H - pv.t * W * 0.45 : 0.8 * H - S * 0.1;
    const descente = Math.max(H * 0.08, bas - PH * BOUT_OUVERT);
    const requete = appel({ action: "tirer", x }).then((p) => ({ p }), (e: unknown) => ({ e }));
    // 1. descente
    setPhase("descente");
    setDuree(1500);
    setHaut(descente);
    await attendre(1550);
    // 2. la pince se referme
    setDuree(350);
    setFermee(true);
    await attendre(420);
    const rep = await requete;
    if ("e" in rep) {
      setDuree(1000); setHaut(0); setFermee(false);
      await attendre(1050);
      setPhase("viser");
      const e = rep.e;
      if (e instanceof ConnexionRequise) compte.oublier();
      setErreur(e instanceof Error ? e.message : "Tirage impossible, réessaie.");
      return;
    }
    const p = rep.p, r = p.resultat;
    if (!r) { setPartie(p); setPhase("viser"); setHaut(0); setFermee(false); return; }
    // 3. remontée, avec l'objet visé
    setPhase("remontee");
    const cibleObj = r.cible != null ? partie.objets.find((o) => o.id === r.cible) || null : null;
    if (cibleObj) { setCache(cibleObj.id); setTenu({ look: cibleObj.look }); }
    else setTenu({ look: "porte-bonheur" });
    setDuree(r.glisse ? 750 : 1400);
    setHaut(r.glisse ? descente * 0.5 : 0);
    await attendre(r.glisse ? 800 : 1450);
    if (r.glisse && cibleObj) {
      // l'objet glisse… et retombe dans le tas, une étoile porte-bonheur s'accroche à sa place
      setPenche(5);
      setGlisse(cibleObj);
      setTenu({ look: "porte-bonheur" });
      await attendre(160);
      setCache(null);
      setPenche(0);
      setDuree(750);
      setHaut(0);
      await attendre(800);
      setGlisse(null);
    }
    // 4. direction la sortie (la pince penche un peu dans le virage)
    setPhase("retour");
    setDuree(1100);
    setPenche(5);
    setGx(SORTIE);
    await attendre(1150);
    setPenche(-3);
    await attendre(220);
    setPenche(0);
    setDuree(300);
    setFermee(false);
    setTenu((t) => (t ? { ...t, chute: true } : t));
    await attendre(520);
    setTenu(null);
    setCache(null);
    setPartie(p);
    setAnnonce(r.attrape);
    setEclat((n) => n + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 1150);
    setPhase("lot");
    await attendre(2600);
    setAnnonce(null);
    setDuree(900);
    setGx(0.58);
    await attendre(300);
    setPhase("viser");
    setChrono(20);
  }, [partie, phase, charge, gx, compte, H, S, PH]);

  // Clavier : ← → pour viser, Espace / Entrée pour lâcher
  useEffect(() => {
    if (!partie || partie.fini) return;
    const enBas = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); setDuree(0); dir.current = e.key === "ArrowLeft" ? -1 : 1; }
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); lacher(); }
    };
    const enHaut = (e: KeyboardEvent) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") dir.current = 0; };
    window.addEventListener("keydown", enBas);
    window.addEventListener("keyup", enHaut);
    return () => { window.removeEventListener("keydown", enBas); window.removeEventListener("keyup", enHaut); };
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
    const y = (ev.clientY - r.top) / r.height;
    if (y > 0.8) return; // le pupitre a ses propres boutons
    const cible = Math.max(MIN_X, Math.min(MAX_X, (ev.clientX - r.left) / r.width));
    setDuree(550);
    setPenche(cible < gx ? 4 : -4);
    setGx(cible);
    setTimeout(() => setPenche(0), 320);
  };
  const maintenir = (d: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); e.stopPropagation(); setDuree(0); dir.current = d; },
    onPointerUp: () => { dir.current = 0; },
    onPointerLeave: () => { dir.current = 0; },
    onPointerCancel: () => { dir.current = 0; },
  });

  const objets = partie ? partie.objets : [];
  if (partie && partie.jour !== jourPlaces.current) { places.current = new Map(); jourPlaces.current = partie.jour; }
  placerLots(objets, places.current);
  const decor = useMemo(() => decorDe(objets.map((o) => places.current.get(o.id)!).filter(Boolean)), [objets]);
  const enCours = Boolean(partie && !partie.fini);
  const courbe = "cubic-bezier(.45,.05,.35,1)";
  const transition = `${duree}ms ${courbe}`;
  const vise = enCours && phase === "viser" ? sousLaPince(objets, versTas(gx)) : null;
  // décor recadré de la machine (vitre avant, pupitre) posé PAR-DESSUS les peluches
  const recadre = (x0: number, y0: number, x1: number, y1: number, opacite = 1): React.CSSProperties => ({
    left: x0 * W, top: y0 * H, width: (x1 - x0) * W, height: (y1 - y0) * H, opacity: opacite,
    backgroundImage: "url(/grappin/machine-pres.webp)", backgroundSize: `${W}px ${H}px`, backgroundPosition: `${-x0 * W}px ${-y0 * H}px`,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start">
      <div>
        {/* ── La salle d'arcade et la borne ── */}
        <div className="gr-salle relative overflow-hidden rounded-[28px] p-2 sm:p-4">
          <div className="gr-fronton relative z-10 mb-2 sm:mb-3 flex items-center justify-center gap-3 rounded-2xl py-2 sm:py-3">
            <span className="gr-ampoules" aria-hidden />
            <h2 className="gr-neon text-center text-lg sm:text-3xl font-black uppercase tracking-[0.18em]">Grappin cosmique</h2>
            <span className="gr-ampoules" aria-hidden />
          </div>

          <div
            ref={zone}
            onPointerDown={viserIci}
            className={`gr-borne relative z-10 mx-auto select-none overflow-hidden rounded-2xl touch-none ${flash ? "gr-flash" : ""}`}
            // toute la borne doit tenir à l'écran (pince comprise) : largeur limitée par la hauteur de la fenêtre
            style={{ width: `min(100%, calc((100svh - 210px) / ${RATIO}))`, minWidth: "min(100%, 320px)", height: H, backgroundImage: "url(/grappin/machine-pres.webp)", backgroundSize: "100% 100%" }}
          >
            {/* néons qui respirent + lumière qui court le long du rail */}
            <div className="gr-halo absolute" style={{ left: 0, top: 0, width: W * 0.05, height: H * 0.8 }} aria-hidden />
            <div className="gr-halo gr-halo-d absolute" style={{ right: 0, top: 0, width: W * 0.05, height: H * 0.8 }} aria-hidden />
            <div className="gr-halo-haut absolute" style={{ left: W * 0.1, top: H * 0.03, width: W * 0.8, height: H * 0.06 }} aria-hidden />
            <span className="gr-coureur absolute" style={{ top: H * 0.05 }} aria-hidden />

            {/* rail et chariot */}
            <div className="absolute rounded-full bg-gradient-to-b from-[#f5d6ff] via-[#9b6bb5] to-[#3a2048] shadow-[0_2px_10px_#0008]" style={{ left: W * 0.12, width: W * 0.76, top: H * 0.005, height: Math.max(4, H * 0.012) }} aria-hidden />

            {/* le tas : des rangs de peluches qui montent vers le fond (décor + lots mystère) */}
            <div className="pointer-events-none absolute" style={{ left: 0.06 * W, width: 0.88 * W, top: 0.74 * H, height: 0.1 * H, background: "radial-gradient(closest-side, rgba(16,4,34,.6), rgba(16,4,34,0))", zIndex: 1 }} aria-hidden />
            {decor.map((d, i) => {
              const t = d.t * W;
              return (
                <div key={`d${i}`} className="pointer-events-none absolute" style={{ left: d.x * W - t / 2, top: d.bas * H - t, width: t, height: t, zIndex: RANGS[d.rang].z, filter: `brightness(${RANGS[d.rang].lum * 0.95}) ${OMBRE}` }} aria-hidden>
                  <Peluche look={d.look} taille={t} style={{ transform: `rotate(${d.a}deg)` }} />
                </div>
              );
            })}
            {objets.map((o) => {
              const p = places.current.get(o.id);
              if (!p || o.id === cache) return null;
              const t = p.t * W;
              return (
                <div
                  key={o.id}
                  className={`absolute transition-[filter] duration-200 ${vise?.id === o.id ? "gr-vise" : ""}`}
                  style={{ left: p.x * W - t / 2, top: p.bas * H - t, width: t, height: t, zIndex: RANGS[p.rang].z + 1, filter: vise?.id === o.id ? undefined : `brightness(${RANGS[p.rang].lum}) ${OMBRE}` }}
                  title="Une peluche mystère : à toi de voir ce qu'elle cache !"
                >
                  <Peluche look={o.look} taille={t} style={{ transform: `rotate(${p.a}deg)` }} />
                </div>
              );
            })}
            {/* la peluche qui glisse retombe à sa place */}
            {glisse && places.current.get(glisse.id) ? (() => {
              const p = places.current.get(glisse.id)!, t = p.t * W;
              return (
                <div className="gr-retombe absolute" style={{ left: p.x * W - t / 2, top: p.bas * H - t, zIndex: RANGS[p.rang].z + 1, filter: OMBRE }}>
                  <Peluche look={glisse.look} taille={t} />
                </div>
              );
            })() : null}

            {/* repère de visée : un fin rayon sous la pince */}
            {enCours && phase === "viser" ? (
              <div className="gr-rayon pointer-events-none absolute" style={{ left: gx * W - 1, top: PH * 0.95, height: 0.8 * H - PH * 0.95, zIndex: 12, transition: `left ${transition}` }} aria-hidden />
            ) : null}

            {/* le grappin : chariot, tige, câble spiralé, pince */}
            <div className="absolute" style={{ left: gx * W, top: 0, zIndex: 20, transition: `left ${transition}` }}>
              <div className="absolute rounded-md border border-white/30 bg-gradient-to-b from-[#e9c8ff] to-[#5b3473] shadow-[0_0_10px_#ffb46b88]" style={{ left: -PL * 0.18, width: PL * 0.36, top: 0, height: H * 0.03 }} />
              <div className="absolute" style={{ left: 0, top: 0, transformOrigin: "0 0", transform: `rotate(${penche}deg)`, transition: `transform ${penche === 0 ? "700ms cubic-bezier(.3,1.7,.5,1)" : "350ms ease-out"}` }}>
                {/* tige métallique */}
                <div className="absolute bg-gradient-to-r from-[#5b3473] via-[#f3dcff] to-[#5b3473]" style={{ left: -PL * 0.022, width: PL * 0.044, top: 0, height: haut + PH * 0.03, transition: `height ${transition}` }} />
                {/* câble spiralé */}
                <div className="gr-spirale absolute rounded-full" style={{ left: PL * (CABLE_X - CABLE_L / 2), width: PL * CABLE_L, top: H * 0.01, height: haut + PH * CABLE_Y, transition: `height ${transition}` }} />
                {/* tête de la pince : ouverte / fermée en fondu, l'objet tenu entre les doigts */}
                <div className="absolute" style={{ left: -PL / 2, top: haut, width: PL, height: PH, transition: `top ${transition}` }}>
                  {tenu ? (
                    <div className={`absolute left-1/2 ${tenu.chute ? "gr-chute" : ""}`} style={{ top: PH * TENU_Y - (S * echelle(tenu.look) * 0.92) / 2, marginLeft: -(S * echelle(tenu.look) * 0.92) / 2 }}>
                      <Peluche look={tenu.look} taille={S * echelle(tenu.look) * 0.92} />
                    </div>
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/grappin/pince-ouverte.webp" alt="" draggable={false} className="absolute inset-0 h-full w-full drop-shadow-[0_8px_10px_rgba(0,0,0,.45)]" style={{ opacity: fermee ? 0 : 1, transition: "opacity 260ms ease" }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/grappin/pince-fermee.webp" alt="" draggable={false} className="absolute inset-0 h-full w-full drop-shadow-[0_8px_10px_rgba(0,0,0,.45)]" style={{ opacity: fermee ? 1 : 0, transition: "opacity 260ms ease" }} />
                </div>
              </div>
            </div>

            {/* vitre avant (la petite barrière de la sortie) et pupitre, devant les peluches */}
            <div className="pointer-events-none absolute" style={{ ...recadre(0.09, 0.685, 0.435, 0.81, 0.6), zIndex: 25 }} aria-hidden />
            <div className="pointer-events-none absolute" style={{ ...recadre(0, 0.8, 1, 1), zIndex: 26 }} aria-hidden />
            <span className="gr-neon-rose pointer-events-none absolute font-black tracking-[0.3em]" style={{ left: W * 0.125, top: H * 0.635, fontSize: Math.max(9, W * 0.018), zIndex: 27 }}>SORTIE</span>
            <div className="gr-sortie pointer-events-none absolute" style={{ left: W * 0.1, top: H * 0.7, width: W * 0.2, height: H * 0.1, zIndex: 24 }} aria-hidden />

            {/* le pupitre de l'image devient cliquable : joystick (◀ ▶) et gros bouton */}
            {enCours ? (
              <>
                <button type="button" aria-label="Déplacer à gauche" disabled={occupe} {...maintenir(-1)} className="gr-touche absolute grid place-items-center rounded-full disabled:opacity-30" style={{ left: W * 0.205, top: H * 0.82, width: W * 0.06, height: W * 0.06, zIndex: 30 }}>◀</button>
                <button type="button" aria-label="Déplacer à droite" disabled={occupe} {...maintenir(1)} className="gr-touche absolute grid place-items-center rounded-full disabled:opacity-30" style={{ left: W * 0.355, top: H * 0.82, width: W * 0.06, height: W * 0.06, zIndex: 30 }}>▶</button>
                <button type="button" aria-label="Lâcher la pince" onClick={(e) => { e.stopPropagation(); lacher(); }} onPointerDown={(e) => e.stopPropagation()} disabled={occupe} className={`absolute rounded-full ${occupe ? "" : "gr-gros-bouton"}`} style={{ left: W * 0.62, top: H * 0.835, width: W * 0.155, height: H * 0.14, zIndex: 30 }} />
              </>
            ) : null}

            {/* paillettes quand on gagne */}
            {eclat && phase === "lot" ? (
              <div className="pointer-events-none absolute" style={{ left: SORTIE * W, top: H * 0.66, zIndex: 31 }} aria-hidden>
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} className="gr-paillette" style={{ ["--a" as string]: `${(i / 14) * 360}deg`, ["--d" as string]: `${40 + (i % 3) * 22}px`, background: ["#ffe066", "#ff6bd6", "#b98cff", "#7fd0ff"][i % 4], animationDelay: `${(i % 4) * 40}ms` }} />
                ))}
              </div>
            ) : null}

            {/* annonce du lot */}
            {annonce ? (
              <div className="gr-annonce absolute left-1/2 top-[14%] z-40 w-[min(78%,300px)] -translate-x-1/2 rounded-2xl border-2 bg-[#12062a]/90 px-5 py-4 text-center backdrop-blur" style={{ borderColor: COULEUR_RARETE[annonce.rarete], boxShadow: `0 0 34px ${COULEUR_RARETE[annonce.rarete]}88` }}>
                <Peluche look={annonce.look} taille={Math.min(110, W * 0.16)} className="mx-auto drop-shadow-[0_6px_14px_rgba(0,0,0,.5)]" />
                <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color: COULEUR_RARETE[annonce.rarete] }}>{annonce.rareteLabel}</p>
                <p className="text-lg font-bold text-ink">{annonce.nom}</p>
                <p className="text-sm text-ink-soft">{annonce.label}</p>
              </div>
            ) : null}

            {/* écran d'accueil */}
            {!partie ? (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0418]/70 p-4 text-center backdrop-blur-[3px]">
                <div className="flex max-w-xl items-center gap-4 sm:gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/grappin/machine-pleine.webp" alt="La borne du Grappin cosmique remplie de peluches" className="gr-flotte hidden sm:block h-auto w-[34%] drop-shadow-[0_10px_30px_#c56bff88]" />
                  <div className="text-left sm:text-left">
                    <p className="gr-neon mb-2 text-xl sm:text-2xl font-black uppercase tracking-widest">Insert coin</p>
                    <p className="mb-4 text-sm text-ink-soft">
                      {`Trois tirages par jour. Chaque peluche cache un `}<strong className="text-ink">lot mystère</strong>{` : impossible de savoir lequel avant de l'avoir sortie… Tu gagnes exactement ce que tu attrapes, et si aucune de tes prises ne contient de booster, CycyBot t'en offre 1 à la fin.`}
                    </p>
                    {compte.joueur ? (
                      <>
                        <button type="button" onClick={entrer} disabled={charge} className="gr-bouton rounded-full px-8 py-3 font-black uppercase tracking-wider text-[#12062a] disabled:opacity-60">
                          {charge ? "CycyBot remplit la vitrine…" : "Jouer ▸"}
                        </button>
                        <div className="mt-3"><BandeauDiscord compte={compte} /></div>
                      </>
                    ) : compte.pret ? (
                      <BoutonDiscord erreur={compte.erreur} texte="3 tirages par jour et par compte Discord : ta récompense arrive directement sur ton profil." />
                    ) : null}
                    {erreur ? <p className="mt-3 text-sm text-red-300">{erreur}</p> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Le pupitre (tirages, chrono, commandes) ── */}
          {partie ? (
            <div className="relative z-10 mt-2 sm:mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/45 px-3 py-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-2" aria-label={`${partie.restants} tirage(s) restant(s)`}>
                {Array.from({ length: partie.tirages }, (_, i) => (
                  <span key={i} className={`h-7 w-7 rounded-full border-2 text-center text-xs font-black leading-6 ${i < partie.restants ? "border-[#ffe066] bg-[#ffe066]/25 text-[#ffe066] shadow-[0_0_10px_#ffe06688]" : "border-white/15 text-white/20"}`}>¢</span>
                ))}
                <span className="ml-1 text-sm text-ink-soft">
                  {partie.fini ? "Plus de tirages aujourd'hui" : `${partie.restants} tirage${partie.restants > 1 ? "s" : ""}`}
                  {partie.bonus ? <span className="ml-1.5 rounded-full bg-[#ffe066]/20 px-2 py-0.5 text-[11px] font-bold text-[#ffe066]">🎁 +{partie.bonus} bonus aujourd&apos;hui</span> : null}
                </span>
              </div>
              {enCours ? (
                <div className="flex items-center gap-2">
                  <span className={`w-10 text-right text-sm tabular-nums ${chrono <= 5 ? "text-[#ff4f9a]" : "text-ink-soft"}`}>{phase === "viser" ? `${chrono}s` : ""}</span>
                  <button type="button" aria-label="Déplacer à gauche" disabled={occupe} {...maintenir(-1)} className="gr-fleche h-11 w-11 rounded-full text-lg font-black disabled:opacity-40">◀</button>
                  <button type="button" aria-label="Déplacer à droite" disabled={occupe} {...maintenir(1)} className="gr-fleche h-11 w-11 rounded-full text-lg font-black disabled:opacity-40">▶</button>
                  <button type="button" onClick={lacher} disabled={occupe} className="gr-bouton h-12 rounded-full px-6 font-black uppercase tracking-wider text-[#12062a] disabled:opacity-50">
                    Lâcher ⬇
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          {partie && erreur ? <p className="relative z-10 mt-2 text-center text-sm text-red-300">{erreur}</p> : null}
        </div>

        {/* ── Le butin du jour ── */}
        {partie && partie.prises.length ? (
          <div className="carte-holo mt-5 rounded-3xl border border-violet/20 p-5" aria-live="polite">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-ink">{partie.fini ? "🎁 Ta récompense du jour" : "Ton butin pour l'instant"}</h3>
              {partie.garanti && !partie.fini ? (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${partie.boosterAttrape ? "bg-emerald-400/15 text-emerald-300" : "bg-[#ffe066]/15 text-[#ffe066]"}`}>
                  {partie.boosterAttrape ? "🎴 Booster du jour attrapé ✅" : `🎴 Pas encore de booster : si tu n'en attrapes pas, ${partie.garanti} booster t'est offert à la fin`}
                </span>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {partie.prises.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border bg-black/20 p-3" style={{ borderColor: COULEUR_RARETE[p.rarete] + "66" }}>
                  <Peluche look={p.look} taille={52} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft/70">Prise {i + 1}</p>
                    <p className="text-sm font-semibold text-ink">{p.nom}</p>
                    <p className="text-sm font-bold" style={{ color: COULEUR_RARETE[p.rarete] }}>{p.label}</p>
                    {p.glisse ? <p className="text-[11px] text-ink-soft/60">{p.glisse.nom} a glissé… une étoile porte-bonheur s&apos;est accrochée !</p> : null}
                  </div>
                </div>
              ))}
            </div>
            {partie.fini && partie.total ? (
              <div className="mt-4 rounded-2xl bg-violet/10 p-4 text-center">
                <p className="text-ink font-semibold">✅ {partie.recupere ? "Ajouté à ton compte Discord !" : "Ta récompense arrive sur ton compte Discord…"}</p>
                <div className="mx-auto mt-3 max-w-md space-y-1.5 text-left text-sm">
                  {partie.prises.map((p, i) => (
                    <div key={i} className="flex justify-between gap-3 text-ink-soft"><span>Prise {i + 1} · {p.nom}</span><span className="shrink-0 font-semibold text-ink">{p.label}</span></div>
                  ))}
                  {partie.prisesTotal && partie.total.boosters > partie.prisesTotal.boosters ? (
                    <div className="flex justify-between gap-3 text-[#ffe066]"><span>🎁 Booster garanti du jour (aucune prise n&apos;en contenait)</span><span className="shrink-0 font-semibold">+ {partie.total.boosters - partie.prisesTotal.boosters} booster</span></div>
                  ) : null}
                  <div className="flex justify-between gap-3 border-t border-white/10 pt-2 text-base font-bold text-ink"><span>Total</span><span className="text-right">{partie.total.label}</span></div>
                </div>
                <p className="mt-2 text-xs text-ink-soft/60">Une nouvelle vitrine t&apos;attend demain, dès minuit.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ── Règles ── */}
      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">Comment jouer ?</h2>
        <ol className="mb-5 list-inside list-decimal space-y-2 text-sm text-ink-soft">
          <li>Place la pince avec ◀ ▶ (le joystick de la borne, les flèches du clavier, ou en touchant la vitrine).</li>
          <li>Appuie sur le <strong className="text-ink">gros bouton</strong> (ou Lâcher, ou Espace) : 20 secondes par tirage !</li>
          <li>La pince attrape la peluche la plus centrée sous elle. Celles du dessus passent devant : vise juste pour atteindre le fond.</li>
          <li>Les lots précieux glissent plus souvent… mais tu ne repars <strong className="text-ink">jamais les mains vides</strong> : une étoile porte-bonheur s&apos;accroche toujours.</li>
          <li>Tu gagnes <strong className="text-ink">la somme des lots que tu as attrapés</strong>, écrite sous chaque peluche. Si aucune ne contenait de booster, <strong className="text-ink">1 booster garanti</strong> s&apos;ajoute (c&apos;est indiqué dans le calcul). Tout arrive sur ton compte Discord.</li>
        </ol>
        <h3 className="mb-2 text-sm font-semibold text-ink">Que cache la vitrine ?</h3>
        <p className="text-sm text-ink-soft">Chats de minuit, bébés dragons, planètes, soucoupes… <strong className="text-ink">chaque peluche cache un lot mystère</strong>, et son apparence ne dit rien de ce qu&apos;il y a dedans ! Des Éclats, un booster, un fragment… ou peut-être le <strong className="text-ink">JACKPOT</strong>.</p>
        <div className="mt-3 grid grid-cols-6 gap-1.5" aria-hidden>
          {["chat-nuit", "lapin", "dragon", "astronaute", "lune", "planete-rose", "soucoupe", "poulpe", "sac", "fusee", "coeur", "comete"].map((t) => (
            <Peluche key={t} look={t} taille={40} className="mx-auto" />
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-soft/60">La vitrine change chaque jour et est remplie par CycyBot. Il faut être membre du Discord Cycylive pour recevoir sa récompense.</p>
      </aside>

      <style>{`
        .gr-salle{background:#120822 url(/grappin/salle.webp) center/cover no-repeat;box-shadow:0 30px 80px -30px #c56bff88}
        .gr-salle::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 80% 70% at 50% 45%,transparent 30%,#0b0418cc 100%),linear-gradient(#0b041855,#0b0418aa)}
        .gr-fronton{background:linear-gradient(90deg,#1b0835e6,#2b0d4de6,#1b0835e6);border:2px solid #ffb46b88;box-shadow:inset 0 0 20px #c56bff55,0 0 24px #c56bff44}
        .gr-neon{color:#fff;text-shadow:0 0 4px #fff,0 0 10px #c56bff,0 0 22px #c56bff,0 0 40px #ff6bd6;animation:gr-gresille 5s infinite}
        .gr-neon-rose{color:#ffe7f3;text-shadow:0 0 6px #ff6bd6,0 0 14px #ff6bd6}
        @keyframes gr-gresille{0%,92%,100%{opacity:1}93%{opacity:.55}94%{opacity:1}96%{opacity:.7}}
        .gr-ampoules{width:38px;height:10px;background:radial-gradient(circle,#ffd08a 2.5px,transparent 3px) 0 0/10px 10px;animation:gr-chenille .6s steps(2) infinite;filter:drop-shadow(0 0 4px #ffb46b)}
        @keyframes gr-chenille{50%{background-position:5px 0;opacity:.6}}
        .gr-borne{box-shadow:0 0 0 2px #ffb46b55,0 18px 50px -18px #000,0 0 50px -10px #c56bff88}
        .gr-borne::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:28;background:linear-gradient(115deg,transparent 30%,#ffffff10 38%,transparent 46%);background-size:250% 100%;animation:gr-reflet 9s ease-in-out infinite}
        @keyframes gr-reflet{0%,100%{background-position:120% 0}50%{background-position:-20% 0}}
        .gr-halo{mix-blend-mode:screen;background:radial-gradient(ellipse 60% 50% at 40% 50%,#ffb46b66,transparent 70%);filter:blur(6px);animation:gr-respire 3.2s ease-in-out infinite;pointer-events:none;z-index:2}
        .gr-halo-d{animation-delay:1.6s}
        .gr-halo-haut{mix-blend-mode:screen;background:radial-gradient(ellipse 50% 60% at 50% 50%,#ffc58a55,transparent 70%);filter:blur(8px);animation:gr-respire 4s ease-in-out infinite;pointer-events:none;z-index:2}
        @keyframes gr-respire{0%,100%{opacity:.35}50%{opacity:1}}
        .gr-coureur{left:10%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:#fff3dc;box-shadow:0 0 12px 4px #ffb46b,0 0 30px 8px #ff6bd688;mix-blend-mode:screen;animation:gr-court 4.5s linear infinite;pointer-events:none;z-index:3}
        @keyframes gr-court{0%{left:12%;opacity:0}8%{opacity:1}92%{opacity:1}100%{left:88%;opacity:0}}
        .gr-spirale{background:repeating-linear-gradient(180deg,#24102e 0 2px,#6d4a7d 3px,#c79fd6 4px,#4a2a58 6px,#24102e 8px);box-shadow:inset 2px 0 3px #0008,inset -1px 0 2px #ffffff22}
        .gr-rayon{width:2px;background:linear-gradient(#ff6bd600,#ff6bd6aa 30%,#ff6bd600);filter:drop-shadow(0 0 4px #ff6bd6)}
        .gr-vise{filter:drop-shadow(0 0 10px #ff9ae0) drop-shadow(0 0 2px #fff)}
        .gr-sortie{background:radial-gradient(ellipse 50% 60% at 50% 60%,#ff6bd655,transparent 70%);animation:gr-respire 2.4s ease-in-out infinite}
        .gr-touche{background:#2a1a4acc;color:#f0d6ff;border:2px solid #c56bffaa;box-shadow:0 0 12px #c56bff77;font-size:clamp(10px,1.6vw,16px);touch-action:none}
        .gr-touche:not(:disabled):active{background:#c56bff;color:#12062a}
        .gr-gros-bouton{box-shadow:0 0 0 3px #ffd08a66,0 0 30px 6px #ffb46b88;animation:gr-pulse 1.6s ease-in-out infinite}
        .gr-gros-bouton:active{transform:scale(.96);box-shadow:0 0 0 3px #ffd08a,0 0 40px 10px #ffb46b}
        @keyframes gr-pulse{0%,100%{box-shadow:0 0 0 2px #ffd08a44,0 0 18px 2px #ffb46b55}50%{box-shadow:0 0 0 4px #ffd08aaa,0 0 34px 8px #ffb46baa}}
        .gr-bouton{background:linear-gradient(180deg,#ffe066,#ffb627);box-shadow:0 0 0 3px #12062a,0 0 0 5px #ffe06688,0 0 22px #ffb62788,inset 0 -4px 0 #c97f0a}
        .gr-bouton:not(:disabled):active{transform:translateY(2px);box-shadow:0 0 0 3px #12062a,0 0 0 5px #ffe06688,inset 0 -1px 0 #c97f0a}
        .gr-fleche{background:#2a1a4a;color:#e9c8ff;border:2px solid #c56bff;box-shadow:0 0 12px #c56bff66;touch-action:none}
        .gr-fleche:not(:disabled):active{background:#c56bff;color:#12062a}
        .gr-chute{animation:gr-chute .55s cubic-bezier(.5,0,.8,.4) forwards}
        @keyframes gr-chute{to{transform:translateY(170%) scale(.75) rotate(14deg);opacity:0}}
        .gr-retombe{animation:gr-retombe .7s cubic-bezier(.5,0,.75,0) both}
        @keyframes gr-retombe{from{transform:translateY(-150%) rotate(-14deg)}70%{transform:translateY(0) rotate(5deg)}85%{transform:translateY(-9%)}to{transform:translateY(0)}}
        .gr-flash{animation:gr-flash 1.1s ease-out}
        @keyframes gr-flash{0%{filter:none}15%{filter:brightness(1.35) saturate(1.3)}35%{filter:brightness(1.05)}55%{filter:brightness(1.25) saturate(1.2)}100%{filter:none}}
        .gr-paillette{position:absolute;width:8px;height:8px;border-radius:2px;transform:rotate(var(--a)) translateY(0);animation:gr-paillette .9s ease-out forwards}
        @keyframes gr-paillette{from{transform:rotate(var(--a)) translateY(0) scale(1);opacity:1}to{transform:rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(.3);opacity:0}}
        .gr-annonce{animation:gr-pop .45s cubic-bezier(.3,1.6,.5,1) both}
        @keyframes gr-pop{from{transform:translate(-50%,10px) scale(.4);opacity:0}}
        .gr-flotte{animation:gr-flotte 4s ease-in-out infinite}
        @keyframes gr-flotte{50%{transform:translateY(-6px)}}
        @media (prefers-reduced-motion: reduce){.gr-neon,.gr-ampoules,.gr-halo,.gr-halo-haut,.gr-coureur,.gr-borne::after,.gr-gros-bouton,.gr-flotte,.gr-sortie{animation:none}}
      `}</style>
    </div>
  );
}
