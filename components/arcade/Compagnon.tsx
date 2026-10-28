"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { DECOS, RAYONS_DECO, FONDS, DecorScene, DecoApercu, migrerHabitat, placesDe, placeDe, type EmplacementDeco, type RayonDeco, type Habitat } from "@/components/arcade/Habitat";
import Creature, { ESPECES, ACCESSOIRES, AccessoireApercu, Oeuf, especeInfo, type Emplacement, type Espece, type Humeur, type Tenue } from "@/components/arcade/Creature";
import { idAppareil } from "@/components/arcade/appareil";
import Sticker, { stickerDuGain, type NomSticker } from "@/components/arcade/Stickers";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";

// ============================================================
// COMPAGNON GALACTIQUE — façon Tamagotchi, sans compte
// ============================================================
// 1. On choisit une créature → un œuf apparaît.
// 2. On clique vite dessus (une dizaine de secondes) → il éclot.
// 3. On s'en occupe : nourrir, laver, nettoyer les cacas, caresser, jouer, dormir.
//    Ses jauges baissent avec le temps, même quand la page est fermée.
// 4. Les 5 quêtes du jour faites → un code à récupérer sur Discord avec /compagnon.
// Tout est gardé dans le navigateur (localStorage).

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const DISCORD = "https://discord.gg/sER6tztDSz";
const CLE = "cycylive-compagnon-v1";
const MIN = 60 * 1000;
const HEURE = 60 * MIN;

type Stats = { faim: number; proprete: number; bonheur: number; energie: number };
type Caca = { id: string; x: number; y: number };
type Gain = { key: string; emoji: string; label: string; rarity: string; rarityLabel: string };
type Quetes = { jour: string; repas: number; bains: number; cacas: number; calins: number; jeux: number; recompense: { code: string; prize: Gain; credited?: boolean; given?: string[]; note?: string } | null };
type Etat = {
  espece: Espece | null;
  nom: string;
  neLe: number; // 0 = encore dans l'œuf
  stats: Stats;
  maj: number;
  cacas: Caca[];
  cacasEnAttente: number[]; // moments où un caca va apparaître (après chaque repas)
  dort: boolean;
  quetes: Quetes;
  joursParfaits: number;
  dernierJourParfait: string;
  // Boutique : bonbons cosmiques gagnés en s'occupant de lui, accessoires achetés et portés
  bonbons: number;
  possedes: string[];
  tenue: Tenue;
  // Habitat : décorations achetées et installées dans la chambre
  decos: string[];
  habitat: Habitat;
  gains: { jour: string; calins: number; visite: boolean };
};

const OBJECTIFS: { key: keyof Omit<Quetes, "jour" | "recompense">; icone: NomIcone; label: string; but: number }[] = [
  { key: "repas", icone: "repas" as NomIcone, label: "Le nourrir", but: 3 },
  { key: "bains", icone: "bain" as NomIcone, label: "Le laver", but: 1 },
  { key: "cacas", icone: "eclats" as NomIcone, label: "Nettoyer ses cacas", but: 3 },
  { key: "calins", icone: "coeur" as NomIcone, label: "Le caresser", but: 15 },
  { key: "jeux", icone: "etoile" as NomIcone, label: "Jouer avec lui", but: 2 },
];

// Bonbons cosmiques 🍬 : ce que rapporte chaque soin (les câlins sont plafonnés chaque jour)
const BONBONS = { repas: 2, bain: 3, caca: 2, calinsParBonbon: 3, calinsMaxJour: 10, jeu: 6, visite: 5, journeeParfaite: 25 };

/** Ajoute des bonbons (en tenant le compteur du jour). */
function avecBonbons(e: Etat, n: number): Etat {
  return { ...e, bonbons: Math.max(0, (e.bonbons || 0) + n) };
}

// Baisse des jauges par heure
const BAISSE = { faim: 12, proprete: 7, bonheur: 9, energie: 6 };

const JOUR_FMT = typeof Intl !== "undefined" ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }) : null;
const jourDe = (t = Date.now()) => (JOUR_FMT ? JOUR_FMT.format(new Date(t)) : new Date(t).toISOString().slice(0, 10));
const borne = (n: number) => Math.max(0, Math.min(100, n));
const hasard = (a: number, b: number) => a + Math.random() * (b - a);
const idCourt = () => Math.random().toString(36).slice(2, 9);

function quetesVides(): Quetes {
  return { jour: jourDe(), repas: 0, bains: 0, cacas: 0, calins: 0, jeux: 0, recompense: null };
}

function etatVide(): Etat {
  return {
    espece: null, nom: "", neLe: 0, stats: { faim: 40, proprete: 60, bonheur: 50, energie: 80 }, maj: Date.now(),
    cacas: [], cacasEnAttente: [], dort: false, quetes: quetesVides(), joursParfaits: 0, dernierJourParfait: "",
    bonbons: 0, possedes: [], tenue: {}, decos: [], habitat: {}, gains: { jour: "", calins: 0, visite: false },
  };
}

function lireEtat(): Etat {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return etatVide();
    const e = { ...etatVide(), ...JSON.parse(brut) } as Etat;
    e.possedes = Array.isArray(e.possedes) ? e.possedes.filter((k) => ACCESSOIRES.some((a) => a.key === k)) : [];
    e.tenue = e.tenue && typeof e.tenue === "object" ? e.tenue : {};
    e.decos = Array.isArray(e.decos) ? e.decos.filter((k) => DECOS.some((d) => d.key === k)) : [];
    e.habitat = e.habitat && typeof e.habitat === "object" ? migrerHabitat(e.habitat as Record<string, unknown>, e.decos) : {};
    e.gains = e.gains && typeof e.gains === "object" ? e.gains : { jour: "", calins: 0, visite: false };
    e.bonbons = Number(e.bonbons) || 0;
    if (!ESPECES.some((x) => x.key === e.espece)) e.espece = null;
    return e;
  } catch {
    return etatVide();
  }
}

/** Fait vivre la créature depuis la dernière visite (jauges, cacas, nouveau jour). */
function vieillir(e: Etat, maintenant = Date.now()): Etat {
  if (!e.espece || !e.neLe) return { ...e, maj: maintenant };
  const h = Math.max(0, (maintenant - e.maj) / HEURE);
  const s = { ...e.stats };
  const sale = e.cacas.length;
  s.faim = borne(s.faim - BAISSE.faim * h);
  s.proprete = borne(s.proprete - (BAISSE.proprete + sale * 3) * h);
  s.bonheur = borne(s.bonheur - (BAISSE.bonheur + (s.faim < 25 ? 6 : 0) + sale * 2) * h);
  s.energie = e.dort ? borne(s.energie + 30 * h) : borne(s.energie - BAISSE.energie * h);
  // Cacas prévus après les repas
  const prets = e.cacasEnAttente.filter((t) => t <= maintenant);
  const cacas = [...e.cacas];
  // Les cacas se posent sur les côtés (pas sous la créature), sans se chevaucher
  const places = [6, 16, 26, 68, 78, 88];
  for (let i = 0; i < prets.length && cacas.length < 6; i++) {
    const libres = places.filter((px) => !cacas.some((c) => Math.abs(c.x - px) < 6));
    const x = (libres.length ? libres[Math.floor(Math.random() * libres.length)] : hasard(6, 88)) + hasard(-2, 2);
    cacas.push({ id: idCourt(), x, y: hasard(72, 82) });
  }
  const quetes = e.quetes.jour === jourDe(maintenant) ? e.quetes : quetesVides();
  const gains = e.gains?.jour === jourDe(maintenant) ? e.gains : { jour: jourDe(maintenant), calins: 0, visite: false };
  return { ...e, gains, stats: s, cacas, cacasEnAttente: e.cacasEnAttente.filter((t) => t > maintenant), quetes, maj: maintenant, dort: e.dort && s.energie < 100 };
}

function stadeDe(e: Etat): 0 | 1 | 2 {
  return e.joursParfaits >= 6 ? 2 : e.joursParfaits >= 2 ? 1 : 0;
}

function humeurDe(e: Etat): Humeur {
  const s = e.stats;
  const min = Math.min(s.faim, s.proprete, s.bonheur, s.energie);
  // très sale ou affamé : il boude ; un peu délaissé : il est triste
  if (e.cacas.length >= 3 || s.proprete < 15 || s.faim < 12) return "fache";
  if (min < 25) return "triste";
  if (min >= 55 && e.cacas.length === 0) return "content";
  return "normal";
}

function phraseDe(e: Etat): string {
  const s = e.stats;
  if (e.dort) return "Zzz… je fais de beaux rêves d'étoiles…";
  if (s.faim < 25) return "J'ai faiiim… 🍖";
  if (e.cacas.length >= 2) return "Beurk, ça sent pas très bon par ici… 💩";
  if (s.proprete < 30) return "Je suis tout sale, un petit bain ? 🛁";
  if (s.energie < 20) return "Je suis épuisé… je peux faire dodo ? 🌙";
  if (s.bonheur < 30) return "Je m'ennuie… on joue ? ⭐";
  const content = ["Je t'aime fort ! 💜", "Quelle belle journée galactique ✨", "On va voir Cycy en live ce soir ?", "Je me sens au top !", "Tu es le meilleur des capitaines 🚀"];
  return content[Math.floor((Date.now() / 20000) % content.length)];
}

// ── Petits composants ───────────────────────────────────────

function Jauge({ icone, label, valeur, couleur }: { icone: NomIcone; label: string; valeur: number; couleur: string }) {
  const v = Math.round(valeur);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-ink-soft mb-1">
        <span>
          <Icone nom={icone} className="w-4 h-4 mr-1" style={{ color: couleur }} />{label}
        </span>
        <span className={v < 25 ? "text-red-300 font-semibold" : ""}>{v} %</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden" role="meter" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v}%`, background: v < 25 ? "#ff6b8b" : couleur }} />
      </div>
    </div>
  );
}

type Effet = { id: string; x: number; y: number; nom: NomSticker; type: "coeur" | "bulle" | "miam" };

// Les emojis des phrases du compagnon sont remplacés par nos illustrations
const EMOJI_STICKER: Record<string, NomSticker> = { "🍖": "viande", "💩": "caca", "🛁": "bulle", "🌙": "lune", "⭐": "etoile", "💜": "coeur", "✨": "etincelle", "🎉": "fete", "☀️": "soleil", "🍬": "bonbon" };
const RE_EMOJI = new RegExp("(" + Object.keys(EMOJI_STICKER).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "g");
function avecStickers(texte: string) {
  return texte.split(RE_EMOJI).map((part, i) => (EMOJI_STICKER[part] ? <Sticker key={i} nom={EMOJI_STICKER[part]} taille={22} className="mx-0.5 -mt-1" /> : part));
}

// ── Le jeu ──────────────────────────────────────────────────

export default function Compagnon() {
  const [etat, setEtatBrut] = useState<Etat | null>(null);
  const [choix, setChoix] = useState<Espece>("chat");
  const [eclosion, setEclosion] = useState(0); // 0 → 1
  const [eclot, setEclot] = useState(false);
  const [nomTemp, setNomTemp] = useState("");
  const [effets, setEffets] = useState<Effet[]>([]);
  const [message, setMessage] = useState("");
  const [saut, setSaut] = useState(0);
  const [jeu, setJeu] = useState<{ fin: number; attrapees: number; etoiles: { id: string; x: number; y: number; nee: number }[] } | null>(null);
  const [envoi, setEnvoi] = useState<{ etat: "libre" | "envoi" | "erreur"; texte: string }>({ etat: "libre", texte: "" });
  const [copie, setCopie] = useState(false);
  const compte = useCompteDiscord();
  const dernierCalin = useRef(0);
  const minuteurMessage = useRef(0);
  const partieGagnee = useRef(false);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  // Largeur de la scène : sur téléphone, la créature rapetisse pour laisser la place aux décorations des côtés
  const [largeurScene, setLargeurScene] = useState(700);
  const sceneVisible = Boolean(etat?.espece);
  useEffect(() => {
    const n = sceneRef.current;
    if (!n || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setLargeurScene(e.contentRect.width));
    ro.observe(n);
    return () => ro.disconnect();
  }, [sceneVisible]);
  const tailleCreature = Math.round(Math.max(140, Math.min(210, largeurScene * 0.42)));

  const setEtat = useCallback((f: (e: Etat) => Etat) => {
    setEtatBrut((cur) => {
      if (!cur) return cur;
      const suivant = f(vieillir(cur));
      try {
        localStorage.setItem(CLE, JSON.stringify(suivant));
      } catch {
        /* navigateur sans stockage */
      }
      return suivant;
    });
  }, []);

  // Chargement + la créature vit chaque seconde
  useEffect(() => {
    const e = vieillir(lireEtat());
    setEtatBrut(e);
    if (e.espece) setChoix(e.espece);
    const t = setInterval(() => setEtat((x) => x), 1000);
    return () => clearInterval(t);
  }, [setEtat]);

  // L'œuf « refroidit » : il faut cliquer vite pour le faire éclore
  useEffect(() => {
    if (!etat?.espece || etat.neLe || eclot) return;
    const t = setInterval(() => setEclosion((p) => Math.max(0, p - 0.008)), 100);
    return () => clearInterval(t);
  }, [etat?.espece, etat?.neLe, eclot]);

  const effet = useCallback((nom: NomSticker, type: Effet["type"], x = hasard(35, 65), y = hasard(30, 50)) => {
    const id = idCourt();
    setEffets((l) => [...l.slice(-14), { id, x, y, nom, type }]);
    setTimeout(() => setEffets((l) => l.filter((f) => f.id !== id)), 1700);
  }, []);

  const dire = useCallback((t: string) => {
    setMessage(t);
    window.clearTimeout(minuteurMessage.current);
    minuteurMessage.current = window.setTimeout(() => setMessage(""), 3200);
  }, []);

  const sauter = () => setSaut((n) => n + 1);

  // ── Actions ──
  const adopter = (espece: Espece) => {
    const e = { ...etatVide(), espece, maj: Date.now() };
    try {
      localStorage.setItem(CLE, JSON.stringify(e));
    } catch {
      /* rien */
    }
    setEtatBrut(e);
    setEclosion(0);
    setEclot(false);
  };

  const cliquerOeuf = () => {
    if (eclot) return;
    const n = Math.min(1, eclosion + 0.055);
    setEclosion(n);
    if (n >= 1) {
      setEclot(true);
      setNomTemp(etat?.espece ? especeInfo(etat.espece).nomParDefaut : "");
    }
  };

  const nommer = (e: React.FormEvent) => {
    e.preventDefault();
    const nom = nomTemp.trim().slice(0, 18) || (etat?.espece ? especeInfo(etat.espece).nomParDefaut : "Bébé");
    setEtat((x) => ({ ...x, nom, neLe: Date.now(), maj: Date.now() }));
    setEclot(false);
    dire(`Bonjour ! Je m'appelle ${nom} 💜`);
  };

  const compter = (q: Quetes, key: keyof Omit<Quetes, "jour" | "recompense">) => ({ ...q, [key]: q[key] + 1 });

  const nourrir = () => {
    if (!etat) return;
    if (etat.dort) return dire("Chut… il dort 🌙");
    if (etat.stats.faim >= 97) return dire("Il est rassasié, reviens un peu plus tard !");
    setEtat((x) => ({
      ...x,
      stats: { ...x.stats, faim: borne(x.stats.faim + 18), bonheur: borne(x.stats.bonheur + 3) },
      cacasEnAttente: [...x.cacasEnAttente, Date.now() + hasard(12, 25) * 1000],
      quetes: compter(x.quetes, "repas"),
      bonbons: (x.bonbons || 0) + BONBONS.repas,
    }));
    effet((["viande", "donut", "taco", "fraise", "bonbon"] as NomSticker[])[Math.floor(Math.random() * 5)], "miam");
    sauter();
    dire("Miam, délicieux !");
  };

  const laver = () => {
    if (!etat) return;
    if (etat.dort) return dire("Chut… il dort 🌙");
    if (etat.stats.proprete >= 97) return dire("Il est déjà tout propre ✨");
    setEtat((x) => avecBonbons({ ...x, stats: { ...x.stats, proprete: 100, bonheur: borne(x.stats.bonheur + 4) }, quetes: compter(x.quetes, "bains") }, BONBONS.bain));
    for (let i = 0; i < 9; i++) setTimeout(() => effet("bulle", "bulle", hasard(28, 72), hasard(30, 65)), i * 120);
    dire("Splash ! Tout propre 🛁");
  };

  const nettoyer = (id: string) => {
    setEtat((x) => (x.cacas.some((c) => c.id === id) ? avecBonbons({ ...x, cacas: x.cacas.filter((c) => c.id !== id), stats: { ...x.stats, proprete: borne(x.stats.proprete + 5) }, quetes: compter(x.quetes, "cacas") }, BONBONS.caca) : x));
    effet("etincelle", "bulle");
  };

  const caresser = (ev: React.PointerEvent) => {
    if (!etat || !sceneRef.current) return;
    const now = Date.now();
    if (now - dernierCalin.current < 280) return;
    dernierCalin.current = now;
    const r = sceneRef.current.getBoundingClientRect();
    if (etat.dort) {
      effet("zzz", "coeur", ((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 100);
      return;
    }
    setEtat((x) => {
      const n = (x.gains?.calins || 0) + 1;
      const bonus = n % BONBONS.calinsParBonbon === 0 && n / BONBONS.calinsParBonbon <= BONBONS.calinsMaxJour ? 1 : 0;
      return avecBonbons({ ...x, gains: { ...x.gains, calins: n }, stats: { ...x.stats, bonheur: borne(x.stats.bonheur + 2) }, quetes: compter(x.quetes, "calins") }, bonus);
    });
    effet("coeur", "coeur", ((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 100);
  };

  const jouer = () => {
    if (!etat || jeu) return;
    if (etat.dort) return dire("Chut… il dort 🌙");
    if (etat.stats.energie < 15) return dire("Il est trop fatigué pour jouer… mets-le au lit 🌙");
    partieGagnee.current = false;
    setJeu({ fin: Date.now() + 9000, attrapees: 0, etoiles: [] });
    dire("Attrape 5 étoiles avant qu'elles disparaissent ! ⭐");
  };

  // Mini-jeu : des étoiles apparaissent, il faut en attraper 5
  useEffect(() => {
    if (!jeu) return;
    const t = setInterval(() => {
      setJeu((j) => {
        if (!j) return j;
        const now = Date.now();
        if (now >= j.fin) return null;
        const vivantes = j.etoiles.filter((s) => now - s.nee < 2400);
        if (vivantes.length < 3 && Math.random() < 0.7) vivantes.push({ id: idCourt(), x: hasard(10, 85), y: hasard(12, 62), nee: now });
        return { ...j, etoiles: vivantes };
      });
    }, 350);
    return () => clearInterval(t);
  }, [jeu !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (jeu && Date.now() >= jeu.fin) setJeu(null);
  }, [jeu]);

  const attraper = (id: string) => {
    setJeu((j) => {
      if (!j) return j;
      const attrapees = j.attrapees + 1;
      if (attrapees >= 5) {
        partieGagnee.current = true;
        setEtat((x) => avecBonbons({ ...x, stats: { ...x.stats, bonheur: borne(x.stats.bonheur + 15), energie: borne(x.stats.energie - 8) }, quetes: compter(x.quetes, "jeux") }, BONBONS.jeu));
        sauter();
        dire("Bravo ! On s'est bien amusés 🎉");
        return null;
      }
      return { ...j, attrapees, etoiles: j.etoiles.filter((s) => s.id !== id) };
    });
  };

  // Partie de jeu ratée (temps écoulé)
  const jeuEnCours = jeu !== null;
  const prec = useRef(false);
  useEffect(() => {
    if (prec.current && !jeuEnCours && !partieGagnee.current) dire("Raté, les étoiles sont parties… on réessaie ? ⭐");
    prec.current = jeuEnCours;
  }, [jeuEnCours, dire]);

  const dormir = () => {
    if (!etat) return;
    setEtat((x) => ({ ...x, dort: !x.dort }));
    dire(etat.dort ? "Debout ! Bien dormi ? ☀️" : "Bonne nuit… 🌙");
  };

  const toutFait = etat ? OBJECTIFS.every((o) => etat.quetes[o.key] >= o.but) : false;

  // Journée parfaite : la créature grandit
  useEffect(() => {
    if (!etat || !toutFait || etat.dernierJourParfait === etat.quetes.jour) return;
    setEtat((x) => avecBonbons({ ...x, joursParfaits: x.joursParfaits + 1, dernierJourParfait: x.quetes.jour }, BONBONS.journeeParfaite));
    dire(`Journée parfaite ! +${BONBONS.journeeParfaite} 🍬`);
  }, [toutFait, etat, setEtat]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bonbons de la visite du jour
  useEffect(() => {
    if (!etat?.neLe || etat.gains?.visite) return;
    setEtat((x) => (x.gains?.visite ? x : avecBonbons({ ...x, gains: { ...x.gains, visite: true } }, BONBONS.visite)));
  }, [etat?.neLe, etat?.gains?.visite, setEtat]);

  // ── Boutique ──
  const [rayon, setRayon] = useState<Emplacement>("tete");
  const acheter = (k: string) => {
    const a = ACCESSOIRES.find((x) => x.key === k);
    if (!a || !etat) return;
    if (etat.possedes.includes(k)) return;
    if ((etat.bonbons || 0) < a.prix) return dire(`Il te manque ${a.prix - (etat.bonbons || 0)} 🍬 pour ${a.nom.toLowerCase()}…`);
    setEtat((x) => (x.possedes.includes(k) || (x.bonbons || 0) < a.prix ? x : { ...x, bonbons: x.bonbons - a.prix, possedes: [...x.possedes, k], tenue: { ...x.tenue, [a.emplacement]: k } }));
    effet("etincelle", "coeur");
    sauter();
    dire(`Trop stylé ! Merci pour ${a.nom.toLowerCase()} 💜`);
  };
  const [boutique, setBoutique] = useState<"accessoires" | "habitat">("accessoires");
  const [rayonDeco, setRayonDeco] = useState<RayonDeco>("fond");
  /** La place libre pour un objet (son côté préféré d'abord), sinon la première place. */
  const placeLibre = (h: Habitat, k: string): EmplacementDeco | null => {
    const places = placesDe(k);
    if (!places.length) return null;
    const d = DECOS.find((x) => x.key === k);
    const ordre = d?.cote === "droite" ? [...places].reverse() : places;
    return ordre.find((em) => !h[em]) || ordre[0];
  };
  const acheterDeco = (k: string) => {
    const d = DECOS.find((x) => x.key === k);
    if (!d || !etat || etat.decos.includes(k)) return;
    if ((etat.bonbons || 0) < d.prix) return dire(`Il te manque ${d.prix - (etat.bonbons || 0)} 🍬 pour ${d.nom.toLowerCase()}…`);
    setEtat((x) => (x.decos.includes(k) || (x.bonbons || 0) < d.prix ? x : { ...x, bonbons: x.bonbons - d.prix, decos: [...x.decos, k], habitat: (() => { const h: Habitat = { ...x.habitat }; const em = placeLibre(h, k); if (em) h[em] = k; return h; })() }));
    effet("maison", "coeur");
    sauter();
    dire(`Ouaaah, ${d.nom.toLowerCase()} ! Ma chambre est trop belle 💜`);
  };
  /** Installe un objet à un emplacement (gauche / droite…), le range s'il y est déjà. L'objet déjà posé à cet
   *  endroit est rangé ; un objet ne peut être qu'à un seul endroit à la fois. */
  const installerDeco = (k: string, em?: EmplacementDeco) => {
    setEtat((x) => {
      const h: Habitat = { ...x.habitat };
      const ici = placeDe(h, k);
      const cible = em || (ici ? null : placeLibre(h, k));
      if (ici) delete h[ici];
      if (cible && cible !== ici) h[cible] = k;
      return { ...x, habitat: h };
    });
  };
  const porter = (k: string) => {
    const a = ACCESSOIRES.find((x) => x.key === k);
    if (!a) return;
    setEtat((x) => {
      const t: Tenue = { ...x.tenue };
      if (t[a.emplacement] === k) delete t[a.emplacement];
      else t[a.emplacement] = k;
      return { ...x, tenue: t };
    });
  };

  const recuperer = async () => {
    setEnvoi({ etat: "envoi", texte: "" });
    try {
      const r = await fetch(`${BOT}/api/pet`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quests: OBJECTIFS.length, appareil: idAppareil(), session: sessionDiscord() }) });
      const d = await r.json().catch(() => ({}));
      if (d.connexion) compte.oublier();
      if (!r.ok || !d.ok) throw new Error(d.error || "Récompense indisponible pour le moment.");
      setEtat((x) => ({ ...x, quetes: { ...x.quetes, recompense: { code: d.code, prize: d.prize, credited: d.credited, given: d.given, note: d.note } } }));
      setEnvoi({ etat: "libre", texte: "" });
    } catch (e) {
      setEnvoi({ etat: "erreur", texte: e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Impossible de joindre CycyBot pour le moment. Réessaie dans un instant." });
    }
  };

  const changer = () => {
    if (!confirm("Adopter une autre créature ? Ton compagnon actuel partira explorer la galaxie (il ne reviendra pas).")) return;
    try {
      localStorage.removeItem(CLE);
    } catch {
      /* rien */
    }
    setEtatBrut(etatVide());
    setEclosion(0);
    setEclot(false);
  };

  const humeur = useMemo(() => (etat ? humeurDe(etat) : "normal"), [etat]);

  if (!etat) return <p className="text-ink-soft">Chargement de ton compagnon…</p>;

  // ── 1. Choix de la créature ──
  if (!etat.espece) {
    return (
      <div className="carte-holo rounded-3xl border border-violet/20 p-5 md:p-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-2 text-center">Choisis ton compagnon galactique</h2>
        <p className="text-ink-soft text-center max-w-2xl mx-auto mb-8">
          Il naîtra d&apos;un œuf. Nourris-le, lave-le, câline-le et joue avec lui chaque jour : quand toutes ses quêtes du jour sont faites, tu gagnes
          une récompense sur le Discord !
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {ESPECES.map((e) => (
            <button
              key={e.key}
              type="button"
              onClick={() => setChoix(e.key)}
              aria-pressed={choix === e.key}
              className={`rounded-2xl p-4 text-center border transition-all ${
                choix === e.key ? "border-violet bg-violet/15 shadow-glow-sm" : "border-violet/15 bg-white/[0.03] hover:border-violet/40"
              }`}
            >
              <div className="flex justify-center cp-flotte">
                <Creature espece={e.key} humeur="content" stade={0} taille={130} />
              </div>
              <p className="font-semibold text-ink mt-1">{e.nom}</p>
              <p className="text-xs text-ink-soft mt-1">{e.description}</p>
            </button>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => adopter(choix)}
            className="rounded-full px-8 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow transition-all"
          >
            <Icone nom="oeuf" className="w-5 h-5 mr-1.5" />Adopter {especeInfo(choix).nom}
          </button>
        </div>
      </div>
    );
  }

  const info = especeInfo(etat.espece);

  // ── 2. L'œuf ──
  if (!etat.neLe) {
    return (
      <div className="carte-holo rounded-3xl border border-violet/20 p-5 md:p-8 text-center">
        {!eclot ? (
          <>
            <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-2">Ton œuf de {info.nom.toLowerCase()} va éclore !</h2>
            <p className="text-ink-soft mb-6">Clique très vite dessus (ou tapote avec ton doigt) pour le réchauffer. S&apos;il refroidit, il faut recommencer !</p>
            <button
              type="button"
              onClick={cliquerOeuf}
              className="mx-auto block select-none touch-manipulation focus:outline-none"
              aria-label="Cliquer sur l'œuf"
              style={{ ["--vitesse" as string]: `${Math.max(0.15, 1.2 - eclosion * 1.1)}s` } as React.CSSProperties}
            >
              <span className={eclosion > 0.02 ? "inline-block cp-oeuf" : "inline-block"}>
                <Oeuf espece={etat.espece} progres={eclosion} taille={tailleCreature} />
              </span>
            </button>
            <div className="max-w-sm mx-auto mt-5">
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${eclosion * 100}%`, background: `linear-gradient(90deg, ${info.couleur}, #ffd66b)` }} />
              </div>
              <p className="text-xs text-ink-soft mt-2">{eclosion < 0.05 ? "Clique sur l'œuf !" : eclosion < 0.5 ? "Continue, il bouge !" : eclosion < 0.85 ? "Plus vite, il craque !" : "Encore un peu !!!"}</p>
            </div>
          </>
        ) : (
          <form onSubmit={nommer} className="max-w-md mx-auto">
            <div className="relative flex justify-center">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute left-1/2 top-1/2 text-2xl cp-eclat"
                  style={{ ["--dx" as string]: `${Math.cos(i * 0.63) * 140}px`, ["--dy" as string]: `${Math.sin(i * 0.63) * 110 - 40}px`, ["--rot" as string]: `${i * 50}deg` } as React.CSSProperties}
                >
                  <Sticker nom={i % 2 ? "etincelle" : "oeuf"} taille={28} />
                </span>
              ))}
              <div className="cp-saut">
                <Creature espece={etat.espece} humeur="content" stade={0} taille={200} />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-ink mt-2 mb-1">C&apos;est un {info.nom.toLowerCase()} !</h2>
            <p className="text-ink-soft mb-4">Comment veux-tu l&apos;appeler ?</p>
            <div className="flex gap-2">
              <input
                value={nomTemp}
                onChange={(e) => setNomTemp(e.target.value)}
                maxLength={18}
                autoFocus
                aria-label="Nom de ton compagnon"
                className="flex-1 rounded-full bg-card border border-violet/25 px-4 py-2.5 text-ink outline-none focus:border-violet/60"
              />
              <button type="submit" className="rounded-full px-5 py-2.5 bg-violet text-ink font-semibold hover:bg-violet-light">
                C&apos;est parti !
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // ── 3. La vie de la créature ──
  const q = etat.quetes;
  const faites = OBJECTIFS.filter((o) => q[o.key] >= o.but).length;
  const stade = stadeDe(etat);
  const stadeNom = ["Bébé", "Enfant", "Adulte"][stade];
  const prochainStade = stade === 0 ? 2 : stade === 1 ? 6 : 0;
  const recompense = q.recompense;

  const bouton = (icone: NomIcone, label: string, action: () => void, actif = true) => (
    <button
      type="button"
      onClick={action}
      disabled={!actif}
      className="flex flex-col items-center gap-1 rounded-2xl border border-violet/20 bg-white/[0.04] px-3 py-3 text-sm text-ink hover:bg-violet/15 hover:border-violet/50 transition-all disabled:opacity-40"
    >
      <Icone nom={icone} className="w-7 h-7 text-lilac" />
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
      <div className="carte-holo rounded-3xl border border-violet/20 p-4 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-ink">
            {etat.nom} <span className="text-sm font-normal text-ink-soft">· {info.nom} · {stadeNom}</span>
          </h2>
          <span className="rounded-full border border-pink-300/30 bg-pink-400/10 px-3 py-1 text-sm font-semibold text-ink" title="Bonbons cosmiques : gagne-les en t'occupant de ton compagnon">
            <Icone nom="bonbon" className="w-4 h-4 mr-1 text-pink-300" />{etat.bonbons || 0} <span className="font-normal text-ink-soft text-xs">bonbons</span>
          </span>
          <button type="button" onClick={changer} className="text-xs text-ink-soft/60 hover:text-ink-soft underline">
            Adopter une autre créature
          </button>
        </div>

        {/* La scène */}
        <div
          ref={sceneRef}
          className="relative h-[360px] md:h-[440px] rounded-2xl overflow-hidden select-none"
          style={{
            containerType: "size",
            background: etat.habitat?.fond && FONDS[etat.habitat.fond]
              ? FONDS[etat.habitat.fond][etat.dort ? "nuit" : "jour"]
              : etat.dort
              ? "radial-gradient(ellipse at 50% 120%, #1b1240 0%, #07040f 70%)"
              : "radial-gradient(ellipse at 50% 120%, #4b2a8f 0%, #1a0f38 55%, #0b0817 100%)",
          }}
        >
          {/* étoiles du décor (sans ambiance) */}
          {!etat.habitat?.fond && Array.from({ length: 26 }).map((_, i) => (
            <span key={i} aria-hidden className="absolute rounded-full bg-white" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%`, width: 2, height: 2, opacity: 0.35 + ((i * 7) % 5) / 10 }} />
          ))}
          {!etat.habitat?.fond && (
            <>
              <div aria-hidden className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #ffe7b0, #ff9f5a 60%, transparent 70%)", opacity: etat.dort ? 0.15 : 0.5 }} />
              {/* sol */}
              <div aria-hidden className="absolute left-[-10%] right-[-10%] bottom-[-60px] h-[150px] rounded-[50%]" style={{ background: "linear-gradient(#5b3aa8, #2a1857)" }} />
            </>
          )}
          {/* habitat : décorations installées */}
          <DecorScene habitat={etat.habitat || {}} nuit={etat.dort} />

          {/* bulle de dialogue */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 max-w-[85%] rounded-2xl bg-white/90 px-4 py-2 text-sm text-[#2a1552] font-medium text-center shadow-lg">
            {avecStickers(message || phraseDe(etat))}
          </div>

          {/* la créature : caresse-la ! */}
          <div className={`absolute left-1/2 -translate-x-1/2 cursor-pointer ${etat.habitat?.fond ? "bottom-[6%]" : "bottom-[30px]"}`} onPointerDown={caresser} onPointerMove={(e) => e.buttons && caresser(e)}>
            <div key={saut} className={saut ? "cp-saut" : ""}>
              <Creature espece={etat.espece} humeur={humeur} dort={etat.dort} nuit={etat.dort} sale={etat.stats.proprete < 35} stade={stade} taille={tailleCreature} tenue={etat.tenue} />
            </div>
          </div>

          {/* cacas */}
          {etat.cacas.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => nettoyer(c.id)}
              className="absolute hover:scale-125 transition-transform"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              aria-label="Nettoyer ce caca"
            >
              <Sticker nom="caca" taille={42} />
            </button>
          ))}

          {/* mini-jeu : étoiles */}
          {jeu &&
            jeu.etoiles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => attraper(s.id)}
                className="absolute cp-etoile"
                style={{ left: `${s.x}%`, top: `${s.y}%`, filter: "drop-shadow(0 0 10px #ffd66b)" }}
                aria-label="Attraper l'étoile"
              >
                <Sticker nom="etoile" taille={50} />
              </button>
            ))}
          {jeu && (
            <div className="absolute right-3 bottom-3 rounded-full bg-black/40 px-3 py-1 text-xs text-ink">
              <Sticker nom="etoile" taille={16} className="mr-1 -mt-0.5" />{jeu.attrapees}/5 · {Math.max(0, Math.ceil((jeu.fin - Date.now()) / 1000))} s
            </div>
          )}

          {/* effets */}
          {effets.map((f) => (
            <span
              key={f.id}
              aria-hidden
              className={`absolute pointer-events-none ${f.type === "bulle" ? "cp-bulle" : "cp-monte"}`}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            >
              <Sticker nom={f.nom} taille={f.type === "bulle" ? 30 : 34} />
            </span>
          ))}
          {etat.dort && !etat.habitat?.fond && <div aria-hidden className="absolute inset-0 bg-[#05020d]/40 pointer-events-none" />}
        </div>

        {/* jauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Jauge icone="repas" label="Ventre" valeur={etat.stats.faim} couleur="#ffb15c" />
          <Jauge icone="bain" label="Propreté" valeur={etat.stats.proprete} couleur="#7ec8ff" />
          <Jauge icone="coeur" label="Bonheur" valeur={etat.stats.bonheur} couleur="#f472b6" />
          <Jauge icone="eclair" label="Énergie" valeur={etat.stats.energie} couleur="#7ee2a8" />
        </div>

        {/* actions */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
          {bouton("repas", "Nourrir", nourrir, !etat.dort)}
          {bouton("bain", "Laver", laver, !etat.dort)}
          {bouton("etoile", "Jouer", jouer, !etat.dort && !jeu)}
          {bouton(etat.dort ? "soleil" : "lune", etat.dort ? "Réveiller" : "Dormir", dormir)}
          <div className="col-span-3 md:col-span-1 flex items-center justify-center rounded-2xl border border-dashed border-violet/20 px-3 py-3 text-xs text-ink-soft text-center">
            <span><Icone nom="coeur" className="w-4 h-4 mr-1 text-pink-300" />Clique sur {etat.nom} pour le caresser · clique sur ses cacas pour les nettoyer</span>
          </div>
        </div>

        {/* Boutique d'accessoires */}
        <section aria-labelledby="cp-boutique" className="mt-6 rounded-2xl border border-violet/15 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex gap-1.5" role="tablist" aria-label="Boutique">
              {(
                [
                  ["accessoires", "Accessoires"],
                  ["habitat", "Habitat"],
                ] as const
              ).map(([k, t]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={boutique === k}
                  onClick={() => setBoutique(k)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${boutique === k ? "bg-pink-400/25 border border-pink-300/50 text-ink" : "border border-violet/20 text-ink-soft hover:bg-violet/10"}`}
                >
                  {t}
                </button>
              ))}
              <h3 id="cp-boutique" className="sr-only">Boutique</h3>
            </div>
            {boutique === "habitat" ? (
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Emplacements">
                {RAYONS_DECO.map((e) => (
                  <button
                    key={e.key}
                    type="button"
                    role="tab"
                    aria-selected={rayonDeco === e.key}
                    onClick={() => setRayonDeco(e.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${rayonDeco === e.key ? "bg-violet text-ink" : "border border-violet/25 text-ink-soft hover:bg-violet/10"}`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            ) : (
            <div className="flex gap-1.5" role="tablist" aria-label="Rayons">
              {(
                [
                  ["tete", "Tête"],
                  ["yeux", "Yeux"],
                  ["cou", "Cou"],
                ] as [Emplacement, string][]
              ).map(([k, t]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={rayon === k}
                  onClick={() => setRayon(k)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${rayon === k ? "bg-violet text-ink" : "border border-violet/25 text-ink-soft hover:bg-violet/10"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            )}
          </div>
          {boutique === "habitat" && (rayonDeco === "mur" || rayonDeco === "sol") ? (
            <p className="mb-2 text-xs text-ink-soft">Pose un objet à gauche et un autre à droite de la pièce : touche le côté de ton choix (le même côté une 2ᵉ fois pour le ranger).</p>
          ) : null}
          {boutique === "habitat" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DECOS.filter((d) => d.rayon === rayonDeco).map((d) => {
                const possede = etat.decos.includes(d.key);
                const ou = placeDe(etat.habitat || {}, d.key);
                const installe = Boolean(ou);
                const cotes = placesDe(d.key).length > 1 ? placesDe(d.key) : null;
                const assez = (etat.bonbons || 0) >= d.prix;
                return (
                  <div key={d.key} className={`flex flex-col items-center rounded-2xl border px-2 pt-3 pb-2 text-center transition-all ${installe ? "border-violet bg-violet/15" : "border-violet/15 bg-white/[0.04]"}`}>
                    <div className="h-[58px] flex items-center justify-center">
                      <DecoApercu k={d.key} />
                    </div>
                    <p className="text-xs font-semibold text-ink mt-1 leading-tight min-h-[2rem] flex items-center">{d.nom}</p>
                    {possede && cotes ? (
                      <div className="mt-1 grid w-full grid-cols-2 gap-1" role="group" aria-label={`Placer ${d.nom.toLowerCase()}`}>
                        {cotes.map((em) => {
                          const actif = ou === em;
                          const occupe = !actif && etat.habitat?.[em] ? DECOS.find((x) => x.key === etat.habitat?.[em])?.nom : "";
                          return (
                            <button key={em} type="button" onClick={() => installerDeco(d.key, em)} aria-pressed={actif} title={actif ? "Ranger" : occupe ? `Remplace ${occupe.toLowerCase()}` : "Installer ici"} className={`whitespace-nowrap rounded-full px-1 py-1.5 text-[11px] font-semibold ${actif ? "bg-violet text-ink ring-1 ring-violet-light" : "border border-violet/30 text-ink-soft hover:bg-violet/15"}`}>
                              {em.endsWith("gauche") ? "◀ Gauche" : "Droite ▶"}
                            </button>
                          );
                        })}
                      </div>
                    ) : possede ? (
                      <button type="button" onClick={() => installerDeco(d.key)} className={`mt-1 w-full rounded-full px-2 py-1.5 text-xs font-semibold ${installe ? "border border-violet/40 text-ink-soft hover:bg-violet/10" : "bg-violet text-ink hover:bg-violet-light"}`}>
                        {installe ? "Ranger" : "Installer"}
                      </button>
                    ) : (
                      <button type="button" onClick={() => acheterDeco(d.key)} disabled={!assez} className="mt-1 w-full rounded-full px-2 py-1.5 text-xs font-semibold bg-pink-400/20 border border-pink-300/40 text-ink hover:bg-pink-400/30 disabled:opacity-40">
                        <Icone nom="bonbon" className="w-4 h-4 mr-1 text-pink-300" />{d.prix}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ACCESSOIRES.filter((a) => a.emplacement === rayon).map((a) => {
              const possede = etat.possedes.includes(a.key);
              const porte = etat.tenue[a.emplacement] === a.key;
              const assez = (etat.bonbons || 0) >= a.prix;
              return (
                <div
                  key={a.key}
                  className={`flex flex-col items-center rounded-2xl border px-2 pt-3 pb-2 text-center transition-all ${porte ? "border-violet bg-violet/15" : "border-violet/15 bg-white/[0.04]"}`}
                >
                  <div className="h-[52px] flex items-center justify-center">
                    <AccessoireApercu k={a.key} taille={66} />
                  </div>
                  <p className="text-xs font-semibold text-ink mt-1 leading-tight min-h-[2rem] flex items-center">{a.nom}</p>
                  {possede ? (
                    <button
                      type="button"
                      onClick={() => porter(a.key)}
                      className={`mt-1 w-full rounded-full px-2 py-1.5 text-xs font-semibold ${porte ? "border border-violet/40 text-ink-soft hover:bg-violet/10" : "bg-violet text-ink hover:bg-violet-light"}`}
                    >
                      {porte ? "Retirer" : "Porter"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => acheter(a.key)}
                      disabled={!assez}
                      className="mt-1 w-full rounded-full px-2 py-1.5 text-xs font-semibold bg-pink-400/20 border border-pink-300/40 text-ink hover:bg-pink-400/30 disabled:opacity-40"
                    >
                      <Icone nom="bonbon" className="w-4 h-4 mr-1 text-pink-300" />{a.prix}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          )}
          <p className="text-[11px] text-ink-soft/60 mt-3">
            <Icone nom="bonbon" className="w-4 h-4 mr-1 text-pink-300" />Gagne des bonbons en t&apos;occupant de {etat.nom} : repas +{BONBONS.repas}, bain +{BONBONS.bain}, caca nettoyé +{BONBONS.caca}, partie gagnée +{BONBONS.jeu}, câlins (+1 tous les {BONBONS.calinsParBonbon}), visite du jour +{BONBONS.visite} et journée parfaite +{BONBONS.journeeParfaite}.
          </p>
        </section>
      </div>

      {/* Quêtes du jour */}
      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="text-lg font-semibold text-ink mb-1">Quêtes du jour</h2>
        <p className="text-xs text-ink-soft/60 mb-4">
          {faites}/{OBJECTIFS.length} faites · elles se renouvellent à minuit
        </p>
        <ul className="space-y-3 mb-5">
          {OBJECTIFS.map((o) => {
            const v = Math.min(o.but, q[o.key]);
            const ok = v >= o.but;
            return (
              <li key={o.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className={ok ? "text-ink-soft line-through" : "text-ink"}>
                    <Icone nom={ok ? "valide" : o.icone} className={`w-4 h-4 mr-1.5 ${ok ? "text-emerald-300" : "text-lilac"}`} />{o.label}
                  </span>
                  <span className="text-xs text-ink-soft tabular-nums">
                    {v}/{o.but}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(v / o.but) * 100}%`, background: ok ? "#7ee2a8" : info.couleur }} />
                </div>
              </li>
            );
          })}
        </ul>

        {!toutFait ? (
          <p className="text-sm text-ink-soft rounded-xl bg-white/[0.04] px-4 py-3">
            <Icone nom="cadeau" className="w-4 h-4 mr-1.5 text-lilac" />Termine les {OBJECTIFS.length} quêtes pour débloquer ta récompense du jour sur le Discord (points, Éclats, booster…).
          </p>
        ) : recompense?.credited ? (
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
            <p className="text-ink font-semibold mb-1">
              <Sticker nom={stickerDuGain(recompense.prize.key, recompense.prize.label)} taille={30} className="mr-1.5 -mt-1" />{recompense.prize.label}
            </p>
            <p className="text-xs text-ink-soft">
              <Icone nom="valide" className="w-4 h-4 mr-1 text-emerald-300" />
              {recompense.given ? "Ajoutée directement à ton compte Discord !" : "Ta récompense du jour est déjà sur ton compte Discord."} Reviens demain pour de nouvelles quêtes.
            </p>
          </div>
        ) : recompense ? (
          <div className="rounded-2xl border border-violet/30 bg-violet/10 p-4">
            {recompense.note && <p className="text-xs text-amber-200 mb-2">{recompense.note}</p>}
            <p className="text-ink font-semibold mb-1">
              <Sticker nom={stickerDuGain(recompense.prize.key, recompense.prize.label)} taille={30} className="mr-1.5 -mt-1" />{recompense.prize.label}
            </p>
            <p className="text-xs text-ink-soft mb-3">{recompense.prize.rarityLabel} · à récupérer sur le Discord</p>
            <ol className="text-xs text-ink-soft space-y-1 list-decimal list-inside mb-3">
              <li>Copie ton code avec le bouton « Copier le code ».</li>
              <li>
                Dans le salon <strong className="text-ink">CycyBot</strong>, tape <code className="text-lilac">/compagnon</code>.
              </li>
              <li>Colle uniquement le code dans la case « code », puis valide.</li>
            </ol>
            <div className="flex flex-wrap items-center gap-2">
              <code className="select-all rounded-xl bg-void/70 border border-violet/30 px-3 py-2 font-mono text-lilac tracking-wider">{recompense.code}</code>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard
                    ?.writeText(recompense.code)
                    .then(() => {
                      setCopie(true);
                      setTimeout(() => setCopie(false), 2000);
                    })
                    .catch(() => {})
                }
                className="rounded-full px-4 py-2 bg-violet/20 border border-violet/40 text-ink text-xs font-medium hover:bg-violet/30"
              >
                {copie ? "Code copié ✓" : "Copier le code"}
              </button>
              <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 bg-violet text-ink text-xs font-medium hover:bg-violet-light">
                Ouvrir Discord
              </a>
            </div>
            <p className="text-[11px] text-ink-soft/60 mt-2">Code valable 48 h · une récompense par jour</p>
          </div>
        ) : (
          <div>
            {!compte.joueur ? (
              compte.pret ? <BoutonDiscord erreur={compte.erreur} texte="Une récompense par jour et par compte Discord : elle arrive directement sur ton profil." /> : null
            ) : (
            <>
            <button
              type="button"
              onClick={recuperer}
              disabled={envoi.etat === "envoi"}
              className="w-full rounded-full px-5 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
            >
              {envoi.etat === "envoi" ? "Ouverture du coffre…" : <><Icone nom="cadeau" className="w-5 h-5 mr-1.5" />Récupérer ma récompense</>}
            </button>
            <div className="mt-3"><BandeauDiscord compte={compte} /></div>
            </>
            )}
            {envoi.etat === "erreur" && <p className="text-sm text-red-300 mt-2">{envoi.texte}</p>}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-violet/10 text-xs text-ink-soft space-y-1">
          <p>
            <Icone nom="pousse" className="w-4 h-4 mr-1 text-emerald-300" />{etat.nom} est <strong className="text-ink">{stadeNom.toLowerCase()}</strong>
            {prochainStade ? ` · il grandit après ${prochainStade} journées parfaites (${etat.joursParfaits}/${prochainStade})` : " · il a atteint sa taille adulte !"}
          </p>
          <p><Icone nom="sablier" className="w-4 h-4 mr-1 text-lilac" />Ses jauges baissent même quand tu n&apos;es pas là : reviens le voir chaque jour !</p>
        </div>
      </aside>
    </div>
  );
}
