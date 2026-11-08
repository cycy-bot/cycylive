"use client";

// 🎬 Studio montage — l'éditeur d'un projet (disposition inspirée de CapCut, pensée pour l'iPad à l'horizontale) :
//   barre du haut : retour aux projets, nom du projet, annuler / rétablir, Enregistrer, Télécharger ;
//   à gauche : Médias, Audios, Textes, Sous-titres, Effets ;  au centre : l'aperçu 9:16 ;
//   à droite : les réglages de l'élément choisi (ou de la vidéo) ;  en bas : outils + timeline multipiste.
// Tout est calculé dans le navigateur : les fichiers ne partent sur internet que pour être gardés dans le projet.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { liens } from "@/data/liens";
import { integre, ORIGINES_INTERFACE } from "@/components/admin/useEtatAdmin";
import { decoderSon, exporterMp4, webcodecsDispo } from "@/lib/mp4Export";
import { enregistrerBrouillon, envoyerMedias, garderMedia, lireMedia, type BrouillonInfo } from "@/lib/brouillonsMontage";
import { ANIMS, calquesDepuisModele, COULEURS, dessinerCalques, dessinerVideo, MODELE_DEFAUT, modeleDepuisCalques, NOMS, nouveauFlash, nouveauTexte, nouvelId, type Calque, type Modele } from "@/lib/habillageTikTok";
import {
  aTempsMonte, ajusterCalques, couper, debuts, DOC_VIDE, docDepuisEtat, dupliquerMorceau, duree, DUREE_PHOTO, dureeMedia, dureeTotale, etatA, mediaDe, nouvelIdMedia, nouvelIdMorceau, PRINCIPAL, supprimerMorceau, vitesse,
  cropValide, type Cadre, type ClipTwitch, type Crop, type TypeTransition, type Disposition, type DocMontage, type Incrust, type Media, type Morceau, type PisteSon, type TypeMedia,
} from "@/lib/montage/projet";
import { useHistorique } from "@/lib/montage/historique";
import { sonDe, useApercusMedias } from "@/lib/montage/apercus";
import { allerA as allerAImage, clePiste, Lecteur, type Source } from "@/lib/montage/lecteur";
import { mixer } from "@/lib/montage/mixage";
import Recadrage from "@/components/admin/montage/Recadrage";
import TimelineMontage, { monteDepuisSource, type Outil, type Selection } from "@/components/admin/montage/TimelineMontage";

const CLE_MODELE = "cycy-modele-tiktok";
const ENDING = "/videos/ending-cycylive.mp4";
const W = 1080, H = 1920;
const FPS_EXPORT = 30; // images par seconde de la vidéo créée
const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";
const DISPOS: { valeur: Disposition; label: string; aide: string; icone: NomIcone }[] = [
  { valeur: "vertical", label: "Déjà verticale", aide: "Vidéo déjà en 9:16 : on l’habille", icone: "smartphone" },
  { valeur: "facecam", label: "Caméra + jeu", aide: "Ta caméra en haut, le jeu en bas", icone: "camera" },
  { valeur: "floute", label: "Fond flouté", aide: "Le clip entier au centre", icone: "ecran" },
  { valeur: "recadre", label: "Recadré plein écran", aide: "Zoom sur l’action", icone: "smartphone" },
];
const CADRES: { v: Cadre; l: string }[] = [{ v: "projet", l: "Comme le projet" }, { v: "ajuster", l: "En entier (fond flouté)" }, { v: "remplir", l: "Plein écran" }];
const VITESSES = [0.25, 0.5, 1, 1.5, 2, 3];
const ZOOMS = [25, 50, 75, 100, 125, 150, 200];
// curseur de l'aperçu : 100 % au milieu
const zoomDepuisCurseur = (v: number) => Math.round(v <= 50 ? 25 + v * 1.5 : 100 + (v - 50) * 2);
const curseurDepuisZoom = (z: number) => (z <= 100 ? (z - 25) / 1.5 : 50 + (z - 100) / 2);
const TRANSITIONS: { v: TypeTransition | ""; l: string }[] = [{ v: "", l: "Coupe franche" }, { v: "fondu", l: "Fondu enchaîné" }, { v: "noir", l: "Fondu au noir" }, { v: "flash", l: "Flash blanc" }, { v: "zoom", l: "Zoom" }, { v: "glisse", l: "Glisser" }];

export type ProjetOuvert = { id: string; nom: string; nomFichier: string; cree: number; archive: boolean; fichier: Blob; etat: Record<string, unknown> | null; fichierEnLigne: boolean; clip: ClipTwitch | null; nouveau: boolean; exporter?: boolean };

const fmtLong = (s: number) => { const x = Math.max(0, s), h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), r = Math.floor(x % 60); return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`; };
const fmtPrecis = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
const fmtCourt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
type Boite = { x: number; y: number; w: number; h: number };
const dans = (b: Boite, p: { x: number; y: number }, m = 20) => p.x >= b.x - m && p.x <= b.x + b.w + m && p.y >= b.y - m && p.y <= b.y + b.h + m;
const sansExt = (n: string) => n.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").trim() || "Média";
const easeOut = (x: number) => 1 - (1 - Math.max(0, Math.min(1, x))) ** 3;

function lignes(ctx: CanvasRenderingContext2D, texte: string, largeur: number) {
  const out: string[] = []; let l = "";
  for (const mot of texte.split(/\s+/).filter(Boolean)) { const essai = l ? `${l} ${mot}` : mot; if (ctx.measureText(essai).width > largeur && l) { out.push(l); l = mot; } else l = essai; }
  if (l) out.push(l); return out;
}
function texteContour(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, taille: number, police: string, max: number, maxLignes = 2, couleur = "#fff") {
  ctx.font = `800 ${taille}px ${police}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  const ls = lignes(ctx, texte, max).slice(0, maxLignes);
  ls.forEach((l, i) => { const yy = y + (i - (ls.length - 1) / 2) * taille * 1.12; ctx.lineWidth = taille * 0.2; ctx.strokeStyle = "rgba(24,10,48,.92)"; ctx.strokeText(l, x, yy); ctx.fillStyle = couleur; ctx.fillText(l, x, yy); });
}
function hashtags(jeu: string) {
  const j = jeu.toLowerCase(), base = ["#twitchfr", "#streameuse", "#clip", "#gaming", "#cycylive"];
  if (j.includes("valorant")) return ["#valorant", "#valorantclips", "#valorantfr", "#fps", ...base];
  if (j.includes("pal")) return ["#palworld", "#palworldfr", ...base];
  if (/horr|phasmo|lethal|dead/.test(j)) return ["#horreur", "#jeudhorreur", "#peur", ...base];
  if (j.includes("minecraft")) return ["#minecraft", "#minecraftfr", ...base];
  return jeu ? [`#${jeu.replace(/[^a-z0-9]/gi, "").toLowerCase()}`, ...base] : base;
}
/** Type, durée et taille d'un fichier importé. */
async function sonder(f: File): Promise<{ type: TypeMedia; duree: number; w: number; h: number }> {
  const ext = (f.name.split(".").pop() || "").toLowerCase();
  const type: TypeMedia = f.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "avif"].includes(ext) ? "image"
    : f.type.startsWith("audio/") || ["mp3", "m4a", "wav", "aac", "ogg", "flac", "caf", "weba"].includes(ext) ? "son" : "video";
  const u = URL.createObjectURL(f);
  try {
    if (type === "image") {
      const i = new Image();
      await new Promise<void>((ok, ko) => { i.onload = () => ok(); i.onerror = () => ko(new Error("photo illisible dans ce navigateur (format HEIC ? exporte-la en JPEG)")); i.src = u; });
      return { type, duree: 0, w: i.naturalWidth, h: i.naturalHeight };
    }
    const el = document.createElement(type === "son" ? "audio" : "video");
    el.preload = "metadata"; el.muted = true; el.src = u;
    await new Promise<void>((ok, ko) => { el.onloadedmetadata = () => ok(); el.onerror = () => ko(new Error(type === "son" ? "son illisible dans ce navigateur" : "vidéo illisible dans ce navigateur")); setTimeout(() => ko(new Error("fichier trop long à lire")), 20000); });
    let d = el.duration;
    if (!Number.isFinite(d) || d <= 0) { await new Promise<void>((ok) => { el.ondurationchange = () => { if (Number.isFinite(el.duration) && el.duration > 0) ok(); }; el.currentTime = 1e7; setTimeout(ok, 4000); }); d = el.duration; }
    const v = el as HTMLVideoElement;
    if (type === "video" && !v.videoWidth) return { type: "son", duree: d || 1, w: 0, h: 0 }; // vidéo sans image (son seul)
    return { type, duree: Number.isFinite(d) && d > 0 ? d : 1, w: v.videoWidth || 0, h: v.videoHeight || 0 };
  } finally { URL.revokeObjectURL(u); }
}
// formes des incrustations
function cheminForme(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, forme: Incrust["forme"]) {
  ctx.beginPath();
  if (forme === "rond") { const r = Math.min(w, h) / 2; ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2); }
  else if (forme === "arrondi") ctx.roundRect(x, y, w, h, Math.min(w, h) * 0.08);
  else ctx.rect(x, y, w, h);
}

export default function EditeurMontage({ projet, onFermer }: { projet: ProjetOuvert; onFermer: (maj?: BrouillonInfo) => void }) {
  const H_ = useHistorique<DocMontage>(DOC_VIDE);
  const { doc, changer, couperGeste, annuler, retablir, marquerEnregistre, reinitialiser, corriger, modifie, peutAnnuler, peutRetablir } = H_;
  const [nom, setNom] = useState(projet.nom);
  const [nomModifie, setNomModifie] = useState(false);
  const [url] = useState(() => URL.createObjectURL(projet.fichier));
  const [dureeSource, setDureeSource] = useState(0);
  const [pret, setPret] = useState(false);
  const [sel, setSel] = useState<Selection>(null);
  const [outil, setOutil] = useState<Outil>("selection");
  const [tM, setTM] = useState(0); // temps monté (tête de lecture)
  const [enLecture, setEnLecture] = useState(false);
  const [zoomApercu, setZoomApercu] = useState(100);
  const [zoomTl, setZoomTl] = useState(40);
  const [onglet, setOnglet] = useState<"medias" | "audios" | "textes" | "soustitres" | "effets">("medias");
  const [filtre, setFiltre] = useState<"tout" | "video" | "image" | "son">("tout");
  const [recherche, setRecherche] = useState("");
  const [mediaChoisi, setMediaChoisi] = useState("");
  const [import_, setImport] = useState<{ n: number; fait: number; erreur?: string } | null>(null);
  const [modele, setModele] = useState<Modele>(MODELE_DEFAUT);
  const [polices, setPolices] = useState({ display: "system-ui, sans-serif", sans: "system-ui, sans-serif" });
  const [sauve, setSauve] = useState<{ etat: "repos" | "enreg" | "ok" | "erreur"; maj?: number; message?: string; medias?: string }>({ etat: projet.nouveau ? "repos" : "ok" });
  const [quitter, setQuitter] = useState(false);
  const [menu, setMenu] = useState(false);
  const [panneauExport, setPanneauExport] = useState(Boolean(projet.exporter));
  const [export_, setExport] = useState<{ etat: "repos" | "en-cours" | "fini" | "erreur"; progres: number; url?: string; ext?: string; message?: string; mode?: string; etape?: string; debut?: number }>({ etat: "repos", progres: 0 });
  const [vt, setVt] = useState<{ titre: string; desc: string; tags: string[]; etat: "repos" | "envoi" | "ok" | "erreur"; pct: number; message?: string }>({ titre: "", desc: "", tags: [], etat: "repos", pct: 0 });
  const [copie, setCopie] = useState("");
  const [recadre, setRecadre] = useState<{ type: "morceau" | "incrust"; id: string } | null>(null);
  const [aimant, setAimant] = useState(true);
  const [, setVersionMedias] = useState(0);
  const pressePapier = useRef<{ type: "morceau"; m: Morceau } | { type: "calque"; c: Calque } | { type: "incrust"; c: Incrust } | { type: "son"; s: PisteSon } | null>(null);
  const fichierEnLigne = useRef(projet.fichierEnLigne);
  const creeLe = useRef(projet.cree);

  // fichiers des médias (en mémoire) et leurs adresses locales
  const fichiers = useRef(new Map<string, Blob>([[PRINCIPAL, projet.fichier]]));
  const urls = useRef(new Map<string, string>([[PRINCIPAL, url]]));
  const [manquants, setManquants] = useState<Set<string>>(new Set());
  const video = useRef<HTMLVideoElement>(null);
  const apercu = useRef<HTMLCanvasElement>(null);
  const finVideo = useRef<HTMLVideoElement>(null);
  const lecteur = useRef<Lecteur | null>(null);
  const zones = useRef<Record<string, Boite>>({});
  const tRef = useRef(0);
  const lectureRef = useRef(false);
  const pilote = useRef<{ k: number; t0: number; rel0: number }>({ k: -1, t0: 0, rel0: 0 });
  const rafRef = useRef(0);
  const exportEnCours = useRef(false);

  const total = Math.max(0.1, dureeTotale(doc.morceaux));
  const habille = doc.dispo === "vertical" || doc.dispo === "facecam";
  const etat = useRef({ doc, sel, polices, total, dureeSource });
  etat.current = { doc, sel, polices, total, dureeSource };
  const mediaParId = useMemo(() => new Map(doc.medias.map((x) => [x.id, x])), [doc.medias]);
  const nomMedia = (id: string) => (id === PRINCIPAL ? "Vidéo du projet" : mediaParId.get(id)?.nom || "Média");
  const dureeMax = useCallback((id?: string) => dureeMedia(etat.current.doc.medias, id, etat.current.dureeSource), []);

  const apercus = useApercusMedias(useMemo(() => [
    ...(dureeSource > 0 ? [{ id: PRINCIPAL, url, duree: dureeSource, type: "video" as const }] : []),
    ...doc.medias.map((m) => ({ id: m.id, url: urls.current.get(m.id) || "", duree: m.duree, type: m.type })),
  ], [dureeSource, url, doc.medias, manquants])); // eslint-disable-line react-hooks/exhaustive-deps

  // ── mise en place ──
  useEffect(() => {
    try { window.parent.postMessage({ type: "cycy-plein-ecran", actif: true }, "*"); } catch { /* hors interface */ }
    const sonde = (c: string) => { const s = document.createElement("span"); s.className = c; document.body.appendChild(s); const f = getComputedStyle(s).fontFamily; s.remove(); return f; };
    setPolices({ display: `${sonde("font-display")}, system-ui, sans-serif`, sans: `${sonde("font-sans")}, system-ui, sans-serif` });
    for (const [n, f] of [["CyAnton", "Anton-Regular.ttf"], ["CyBarlowC", "BarlowCondensed-Bold.ttf"], ["CyBarlow", "Barlow-SemiBold.ttf"]]) new FontFace(n, `url(/fonts/${f})`).load().then((x) => document.fonts.add(x)).catch(() => {});
    try { const m = JSON.parse(localStorage.getItem(CLE_MODELE) || "null"); if (m) setModele({ ...MODELE_DEFAUT, ...m }); } catch { /* modèle d'origine */ }
    const avant = document.body.style.overflow; document.body.style.overflow = "hidden";
    const l = new Lecteur((mid) => urls.current.get(mid), () => etat.current.doc.medias);
    if (video.current) l.adopter("p:" + PRINCIPAL + ":0", PRINCIPAL, video.current);
    lecteur.current = l;
    return () => {
      document.body.style.overflow = avant;
      try { window.parent.postMessage({ type: "cycy-plein-ecran", actif: false }, "*"); } catch { /* rien */ }
      l.detruire();
      for (const u of urls.current.values()) URL.revokeObjectURL(u);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // quitter la page avec des modifications : le navigateur prévient
  useEffect(() => {
    const avant = (e: BeforeUnloadEvent) => { if (modifie || nomModifie) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", avant);
    return () => window.removeEventListener("beforeunload", avant);
  }, [modifie, nomModifie]);

  function poserFichier(mid: string, b: Blob) {
    const ancien = urls.current.get(mid); if (ancien) URL.revokeObjectURL(ancien);
    fichiers.current.set(mid, b); urls.current.set(mid, URL.createObjectURL(b));
  }
  async function chargerMedias(liste: Media[]) {
    const perdus = new Set<string>();
    await Promise.all(liste.map(async (m) => { const b = await lireMedia(projet.id, m.id).catch(() => undefined); if (b) poserFichier(m.id, b); else perdus.add(m.id); }));
    setManquants(perdus); setVersionMedias((n) => n + 1);
  }

  function auChargement(v: HTMLVideoElement) {
    const appliquer = (d: number) => {
      setDureeSource(d);
      const base = docDepuisEtat(projet.etat, d);
      if (!projet.etat) {
        base.titre = projet.clip?.titre || ""; base.jeu = projet.clip?.jeu || "";
        base.ending = modele.ending;
        base.dispo = v.videoHeight > v.videoWidth * 1.4 ? "vertical" : "floute";
      }
      if (!base.calques.length) base.calques = calquesDepuisModele(modele, dureeTotale(base.morceaux), base.titre, "");
      reinitialiser(base);
      if (base.medias.length) chargerMedias(base.medias);
      tRef.current = 0; v.currentTime = base.morceaux[0]?.a ?? 0;
      setPret(true);
      if (projet.nouveau) setTimeout(() => { if (v.videoHeight > v.videoWidth * 1.4) detecterSeparation(); enregistrer(true); }, 600);
    };
    if (Number.isFinite(v.duration) && v.duration > 0) return appliquer(v.duration);
    const lire = () => { if (Number.isFinite(v.duration) && v.duration > 0) { v.removeEventListener("durationchange", lire); appliquer(v.duration); } };
    v.addEventListener("durationchange", lire); v.currentTime = 1e7;
  }

  // ── changements (passent tous par l'historique) ──
  const setMorceaux = useCallback((f: (m: Morceau[]) => Morceau[], fusion?: string) => changer((d) => { const m = f(d.morceaux); return m === d.morceaux ? d : { ...d, morceaux: m, calques: ajusterCalques(d.calques, dureeTotale(m)) }; }, fusion), [changer]);
  const setCalques = useCallback((f: (c: Calque[]) => Calque[], fusion?: string) => changer((d) => ({ ...d, calques: f(d.calques) }), fusion), [changer]);
  const setIncrust = useCallback((f: (c: Incrust[]) => Incrust[], fusion?: string) => changer((d) => ({ ...d, incrustations: f(d.incrustations) }), fusion), [changer]);
  const setSons = useCallback((f: (c: PisteSon[]) => PisteSon[], fusion?: string) => changer((d) => ({ ...d, sons: f(d.sons) }), fusion), [changer]);
  const maj = useCallback(<K extends keyof DocMontage>(k: K, v: DocMontage[K], fusion?: string) => changer((d) => ({ ...d, [k]: v }), fusion ?? "champ-" + String(k)), [changer]);
  const majCalque = (id: string, q: Partial<Calque>, fusion = "calque-" + id) => setCalques((l) => l.map((c) => (c.id === id ? { ...c, ...q } : c)), fusion);
  const majMorceau = (id: string, q: Partial<Morceau>, fusion = "morceau-" + id) => setMorceaux((l) => l.map((c) => (c.id === id ? { ...c, ...q } : c)), fusion);
  const majIncrust = (id: string, q: Partial<Incrust>, fusion = "incrust-" + id) => setIncrust((l) => l.map((c) => (c.id === id ? { ...c, ...q } : c)), fusion);
  const majSon = (id: string, q: Partial<PisteSon>, fusion = "son-" + id) => setSons((l) => l.map((c) => (c.id === id ? { ...c, ...q } : c)), fusion);
  function majTitre(t: string) { changer((d) => ({ ...d, titre: t, calques: d.calques.map((c) => (c.type === "carte" ? { ...c, texte: t } : c)) }), "titre"); }

  // le modèle (positions, durées, animations, textes fixes) est gardé pour les prochaines vidéos
  useEffect(() => {
    if (!pret || !doc.calques.length) return;
    try { localStorage.setItem(CLE_MODELE, JSON.stringify(modeleDepuisCalques(doc.calques, total, doc.ending))); } catch { /* rien */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.calques, doc.ending]);

  // ── lecture : les morceaux à la suite, incrustations et sons calés dessus ──
  const allerA = useCallback((r: number) => {
    const tot = dureeTotale(etat.current.doc.morceaux), x = Math.max(0, Math.min(tot, r));
    tRef.current = x; pilote.current = { k: -1, t0: performance.now(), rel0: x }; setTM(x);
  }, []);
  // Lecture : le son du montage est mixé à l'avance (exact, sans coupure aux raccords) et sert d'horloge ;
  // les vidéos le suivent en douceur. Si le son ne peut pas être préparé, les vidéos donnent l'horloge.
  const mode = useRef<"elements" | "attente" | "son">("elements");
  const lectureSon = useRef<{ src: AudioBufferSourceNode; t0: number; cle: unknown[] } | null>(null);
  const mixCache = useRef<{ cle: unknown[]; buf: AudioBuffer } | null>(null);
  const [prepSon, setPrepSon] = useState(false);
  const cleSon = (d: DocMontage) => [d.morceaux, d.incrustations, d.sons, d.medias];
  const memeCle = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((x, i) => x === b[i]);
  async function mixApercu(d: DocMontage) {
    const cle = cleSon(d);
    if (mixCache.current && memeCle(mixCache.current.cle, cle)) return mixCache.current.buf;
    const sons = new Map<string, AudioBuffer | null>();
    const utiles = new Set<string>([...d.morceaux.filter((m) => !m.muet).map(mediaDe), ...d.incrustations.filter((c) => !c.muet).map((c) => c.media), ...d.sons.map((x) => x.media)]);
    for (const mid of utiles) { if (mid !== PRINCIPAL && mediaParId.get(mid)?.type === "image") continue; const u = urls.current.get(mid); sons.set(mid, u ? await sonDe(u) : null); }
    const buf = await mixer(d, sons, null);
    mixCache.current = { cle, buf };
    return buf;
  }
  function couperSon() { try { lectureSon.current?.src.stop(); } catch { /* déjà arrêté */ } lectureSon.current = null; }
  function arreter() { lectureRef.current = false; mode.current = "elements"; setEnLecture(false); couperSon(); lecteur.current?.pauseTout(); }
  /** Lance le son mixé, calé sur l'image que montre la vidéo. */
  async function lancerSon(): Promise<boolean> {
    const l = lecteur.current, ctx = l?.ctx; if (!l || !ctx) return false;
    const d = etat.current.doc;
    const buf = await mixApercu(d).catch(() => null);
    if (!buf || !lectureRef.current) return false;
    await ctx.resume().catch(() => {});
    let r = tRef.current;
    const e = etatA(d, r);
    if (e.morceau && l.typeDe(mediaDe(e.morceau)) === "video") {
      // la vidéo démarre d'abord ; le son part exactement de l'image qu'elle montre
      const el = l.media(clePiste(e.morceau, e.k), mediaDe(e.morceau), "video") as HTMLVideoElement | null;
      l.synchroniser(d, r, true, { muet: true, doux: true });
      if (el && (el.paused || el.readyState < 3)) await new Promise<void>((ok) => { const fin = () => { el.removeEventListener("playing", fin); ok(); }; el.addEventListener("playing", fin); setTimeout(fin, 600); });
      if (!lectureRef.current) return false;
      if (el && !el.seeking) r = debuts(d.morceaux)[e.k] + Math.max(0, el.currentTime - e.morceau.a) / vitesse(e.morceau);
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
    const quand = ctx.currentTime + 0.02;
    src.start(quand, Math.max(0, Math.min(buf.duration - 0.01, r)));
    couperSon();
    lectureSon.current = { src, t0: quand - r, cle: cleSon(d) };
    mode.current = "son";
    return true;
  }
  async function demarrer() {
    mode.current = "attente"; lectureRef.current = true; setEnLecture(true);
    const t = setTimeout(() => setPrepSon(true), 200);
    const ok = await lancerSon();
    clearTimeout(t); setPrepSon(false);
    if (!ok && lectureRef.current) { mode.current = "elements"; pilote.current = { k: -1, t0: performance.now(), rel0: tRef.current }; }
  }
  function lectureOuPause() {
    lecteur.current?.debloquer();
    if (lectureRef.current) { arreter(); return; }
    if (tRef.current >= etat.current.total - 0.05) allerA(0);
    pilote.current = { k: -1, t0: performance.now(), rel0: tRef.current };
    demarrer();
  }
  useEffect(() => {
    let dernier = -1;
    const boucle = () => {
      rafRef.current = requestAnimationFrame(boucle);
      const l = lecteur.current, c = apercu.current?.getContext("2d");
      if (exportEnCours.current || !l || !c) return;
      const d = etat.current.doc, tot = dureeTotale(d.morceaux);
      if (!d.morceaux.length) return;
      let rel = tRef.current;
      if (lectureRef.current && mode.current !== "elements") {
        const ls = lectureSon.current, ctx = l.ctx;
        if (mode.current === "son" && ls && ctx) {
          const lat = (ctx as AudioContext & { outputLatency?: number }).outputLatency || ctx.baseLatency || 0;
          rel = Math.max(0, ctx.currentTime - ls.t0 - lat);
          if (rel >= tot) { rel = tot; arreter(); }
          else if (!memeCle(ls.cle, cleSon(d))) { mode.current = "attente"; lancerSon().then((ok) => { if (!ok && lectureRef.current) mode.current = "elements"; }); } // le montage a changé : nouveau son
          tRef.current = rel;
          if (lectureRef.current) l.synchroniser(d, Math.min(rel, tot - 1e-3), true, { muet: true, doux: true });
        }
      } else if (lectureRef.current) {
        const e = etatA(d, rel), m = e.morceau!, mid = mediaDe(m), cle = clePiste(m, e.k), p = pilote.current;
        if (l.typeDe(mid) === "video") {
          const el = l.media(cle, mid, "video") as HTMLVideoElement | null;
          if (el) {
            const deb = debuts(d.morceaux)[e.k];
            if (p.k === e.k && !el.seeking && (el.ended || el.currentTime >= m.b - 0.012)) rel = deb + duree(m) + 1e-4; // fin du morceau : au suivant
            else if (p.k !== e.k || el.paused) {
              // déjà lancé en avance (raccord) : on le prend tel quel s'il est juste
              if (Math.abs(el.currentTime - e.src) > (el.paused ? 0.04 : 0.15)) el.currentTime = e.src;
              el.playbackRate = vitesse(m); el.play().catch(() => {});
              pilote.current = { k: e.k, t0: performance.now(), rel0: rel };
            } else if (!el.seeking) rel = deb + Math.max(0, el.currentTime - m.a) / vitesse(m);
          }
        } else {
          if (p.k !== e.k) pilote.current = { k: e.k, t0: performance.now(), rel0: rel };
          rel = pilote.current.rel0 + (performance.now() - pilote.current.t0) / 1000;
        }
        if (rel >= tot) { rel = tot; arreter(); }
        tRef.current = rel;
        l.synchroniser(d, Math.min(rel, tot - 1e-3), lectureRef.current, { pilote: cle });
      } else l.synchroniser(d, Math.min(rel, tot - 1e-3), false);
      dessiner(c, Math.min(rel, tot - 1e-3), true);
      if (process.env.NEXT_PUBLIC_DEBUG_MONTAGE) Object.assign(window, { __t: rel, __montage: { l, doc: () => etat.current.doc, figer: (x: boolean) => { exportEnCours.current = x; } } });
      // tête de lecture : ~12 fois par seconde pendant la lecture (redessiner tout l'éditeur 50 fois par seconde
      // ralentissait la vidéo sur iPad), précise à l'arrêt
      if (Math.abs(rel - dernier) > (lectureRef.current ? 0.08 : 0.02)) { dernier = rel; setTM(rel); }
    };
    rafRef.current = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── dessin d'une image (aperçu et export) ──
  // la source, une fois recadrée : on dessine toujours une zone (ox, oy, w, h) de l'image d'origine
  type Zone = { el: HTMLVideoElement | HTMLImageElement; ox: number; oy: number; w: number; h: number };
  const zoneDe = (s: Source, crop?: Crop): Zone => { const c = cropValide(crop); return c ? { el: s.el, ox: c.x * s.w, oy: c.y * s.h, w: Math.max(1, c.w * s.w), h: Math.max(1, c.h * s.h) } : { el: s.el, ox: 0, oy: 0, w: s.w, h: s.h }; };
  const peindre = (ctx: CanvasRenderingContext2D, z: Zone, dx: number, dy: number, dw: number, dh: number, sx = 0, sy = 0, sw = z.w, sh = z.h) => ctx.drawImage(z.el, z.ox + sx, z.oy + sy, sw, sh, dx, dy, dw, dh);
  function dessinerFond(ctx: CanvasRenderingContext2D, s: Source, m: Morceau, rel0: number, d: DocMontage, e: typeof etat.current, fx: { k: number; dx: number } = { k: 1, dx: 0 }) {
    const z = zoneDe(s, m.crop), vw = z.w, vh = z.h, mid = mediaDe(m);
    const cadre: Cadre = m.cadre || (mid === PRINCIPAL ? "projet" : "ajuster");
    const filtres = [m.lum && m.lum !== 1 ? `brightness(${m.lum})` : "", m.con && m.con !== 1 ? `contrast(${m.con})` : "", m.sat != null && m.sat !== 1 ? `saturate(${m.sat})` : ""].filter(Boolean).join(" ");
    ctx.save(); if (filtres) ctx.filter = filtres;
    if (fx.dx) ctx.translate(fx.dx, 0);
    // zoom lent (photos) et zoom de transition
    const kb = (m.kb ? 1 + 0.08 * Math.max(0, Math.min(1, (aTempsMonte(d.morceaux, rel0).src - m.a) / Math.max(0.1, m.b - m.a))) : 1) * fx.k;
    if (kb !== 1) { ctx.translate(W / 2, H / 2); ctx.scale(kb, kb); ctx.translate(-W / 2, -H / 2); }
    const flou = () => { const k = Math.max(W / vw, H / vh); ctx.save(); ctx.filter = (filtres ? filtres + " " : "") + "blur(36px) brightness(.55) saturate(1.2)"; peindre(ctx, z, (W - vw * k) / 2, (H - vh * k) / 2, vw * k, vh * k); ctx.restore(); };
    if (cadre === "remplir") { const k = Math.max(W / vw, H / vh); peindre(ctx, z, (W - vw * k) / 2, (H - vh * k) / 2, vw * k, vh * k); }
    else if (cadre === "ajuster") { flou(); const k2 = Math.min(W / vw, H / vh); peindre(ctx, z, (W - vw * k2) / 2, (H - vh * k2) / 2, vw * k2, vh * k2); }
    else if (d.dispo === "vertical") dessinerVideo(ctx, z.el, rel0, d.calques, { sx: z.ox, sy: z.oy, sw: z.w, sh: z.h });
    else if (d.dispo === "floute") {
      flou();
      const fh = (W * vh) / vw, y = (H - fh) / 2 + 60;
      ctx.save(); ctx.shadowColor = "rgba(161,92,255,.6)"; ctx.shadowBlur = 40; peindre(ctx, z, 0, y, W, fh); ctx.restore();
      if (d.titre) { ctx.filter = "none"; texteContour(ctx, d.titre, W / 2, y - 150, 76, e.polices.display, W - 120, 2); }
    } else if (d.dispo === "recadre") {
      const sh = vh / d.zoom, sw = Math.min(vw, (sh * W) / H), sx = Math.max(0, Math.min(vw - sw, (vw - sw) * d.focusX)), sy = (vh - sh) / 2;
      peindre(ctx, z, 0, 0, W, H, sx, sy, sw, sh);
      ctx.filter = "none";
      const g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, "rgba(13,10,23,.75)"); g.addColorStop(1, "rgba(13,10,23,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
      if (d.titre) texteContour(ctx, d.titre, W / 2, 220, 72, e.polices.display, W - 120, 2);
    } else {
      const hautH = Math.round(H * 0.38), cw = vw * d.cam.taille, ch = (cw * hautH) / W;
      const cx = Math.max(0, Math.min(vw - cw, vw * d.cam.x)), cy = Math.max(0, Math.min(vh - ch, vh * d.cam.y));
      peindre(ctx, z, 0, 0, W, hautH, cx, cy, cw, ch);
      const basH = H - hautH, sh = vh / d.zoom, sw = Math.min(vw, (sh * W) / basH), sx = Math.max(0, Math.min(vw - sw, (vw - sw) * d.focusX));
      peindre(ctx, z, 0, hautH, W, basH, sx, (vh - sh) / 2, sw, sh);
      ctx.filter = "none"; ctx.fillStyle = "#b57cff"; ctx.fillRect(0, hautH - 4, W, 8);
    }
    ctx.restore();
  }
  // dernière image du morceau précédent (pour les transitions « fondu » et « glisser »)
  const fige = useRef<{ k: number; c: HTMLCanvasElement | null }>({ k: -1, c: null });
  function dessiner(ctx: CanvasRenderingContext2D, rel: number, enApercu = false) {
    const e = etat.current, d = e.doc, l = lecteur.current;
    ctx.fillStyle = "#0d0a17"; ctx.fillRect(0, 0, W, H);
    if (!l) return;
    const tot = Math.max(0.5, dureeTotale(d.morceaux));
    const x = etatA(d, rel), z: Record<string, Boite> = {};
    if (x.morceau) {
      const m = x.morceau, mid = mediaDe(m), s = l.source(clePiste(m, x.k), mid);
      const deb = debuts(d.morceaux)[x.k], t0 = rel - deb, len = duree(m);
      const tr = x.k > 0 && m.tr && t0 < m.tr.d ? m.tr : null, p = tr ? easeOut(t0 / tr.d) : 1;
      const avant = tr && (tr.type === "fondu" || tr.type === "glisse") && fige.current.k === x.k - 1 ? fige.current.c : null;
      if (s && s.w > 0) {
        if (avant && tr?.type === "glisse") ctx.drawImage(avant, -W * p, 0);
        dessinerFond(ctx, s, m, rel, d, e, { k: tr?.type === "zoom" ? 1 + 0.18 * (1 - p) : 1, dx: avant && tr?.type === "glisse" ? W * (1 - p) : 0 });
        if (avant && tr?.type === "fondu") { ctx.save(); ctx.globalAlpha = 1 - p; ctx.drawImage(avant, 0, 0); ctx.restore(); }
        if (tr?.type === "noir") { ctx.fillStyle = `rgba(0,0,0,${(1 - p).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
        if (tr?.type === "flash") { ctx.fillStyle = `rgba(255,250,255,${((1 - p) ** 2).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
        // garde la dernière image si le morceau suivant commence par un fondu
        const suiv = d.morceaux[x.k + 1];
        if (suiv?.tr && (suiv.tr.type === "fondu" || suiv.tr.type === "glisse") && t0 > len - 0.25) {
          if (!fige.current.c) { fige.current.c = document.createElement("canvas"); fige.current.c.width = W; fige.current.c.height = H; }
          const g = fige.current.c.getContext("2d")!; g.drawImage(ctx.canvas, 0, 0, W, H); fige.current.k = x.k;
        }
      } else if (manquantsRef.current.has(mid)) { ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = `600 40px ${e.polices.sans}`; ctx.textAlign = "center"; ctx.fillText("Média introuvable : réimporte-le", W / 2, H / 2); }
    }
    // incrustations (photo / vidéo par-dessus)
    for (const { c } of x.incrust) {
      const s0 = l.source("i:" + c.id, c.media); if (!s0 || !s0.w) continue;
      const zs = zoneDe(s0, c.crop);
      const w = c.w * W, h = (w * zs.h) / zs.w;
      const t0 = rel - c.debut, len = duree(c);
      let a = c.opacite, k = 1;
      if (c.anim !== "aucune") { const pe = Math.min(1, t0 / 0.3), ps = Math.min(1, (len - t0) / 0.3), p = Math.max(0, Math.min(pe, ps)); a *= c.anim === "fondu" ? p : Math.min(1, p * 1.6); if (c.anim === "pop") k = 0.6 + 0.4 * easeOut(p) + (p < 1 ? 0.06 * Math.sin(p * Math.PI) : 0); }
      if (a <= 0.01) continue;
      const cx = c.x * W, cy = c.y * H;
      const bw = c.forme === "rond" ? Math.min(w, h) : w, bh = c.forme === "rond" ? Math.min(w, h) : h;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(k, k);
      if (c.contour) { ctx.save(); ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 30; cheminForme(ctx, -bw / 2 - 6, -bh / 2 - 6, bw + 12, bh + 12, c.forme); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore(); }
      cheminForme(ctx, -bw / 2, -bh / 2, bw, bh, c.forme); ctx.clip();
      const kk = Math.max(bw / w, bh / h); peindre(ctx, zs, -(w * kk) / 2, -(h * kk) / 2, w * kk, h * kk);
      ctx.restore();
      z[c.id] = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
    }
    // à l'arrêt, l'élément choisi est montré en entier (sans son animation d'entrée) pour le régler
    const idSel = enApercu && !lectureRef.current && e.sel?.type === "calque" ? e.sel.id : "";
    const cal = idSel ? d.calques.map((c) => (c.id === idSel ? { ...c, anim: "aucune" as const } : c)) : d.calques;
    const tSrc = x.morceau && mediaDe(x.morceau) === PRINCIPAL ? x.src : -1; // les sous-titres suivent la vidéo du projet
    if (habilleDe(d)) Object.assign(z, dessinerCalques(ctx, rel, tot, cal, d.sousTitres, 0, tSrc));
    else {
      const libres = cal.filter((c) => c.type === "texte" || c.type === "flash");
      if (libres.length) Object.assign(z, dessinerCalques(ctx, rel, tot, libres, [], 0, tSrc));
      const st = tSrc >= 0 ? d.sousTitres.find((y) => tSrc >= y.debut && tSrc < y.fin) : null;
      if (st?.texte) texteContour(ctx, st.texte.toUpperCase(), W / 2, H * 0.72, 70, e.polices.display, W - 140, 2, "#ffffff");
      ctx.font = `600 34px ${e.polices.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillText(`twitch.tv/${chaine}`, W / 2, H - 120);
    }
    zones.current = z;
    const b = enApercu && (e.sel?.type === "calque" || e.sel?.type === "incrust") ? z[e.sel.id] : null;
    if (b) {
      ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,170,235,.95)"; ctx.strokeRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16); ctx.restore();
      ctx.save(); ctx.fillStyle = "#fff"; ctx.strokeStyle = "#a970ff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(b.x + b.w + 8, b.y + b.h + 8, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }
  const habilleDe = (d: DocMontage) => d.dispo === "vertical" || d.dispo === "facecam";
  const manquantsRef = useRef(manquants); manquantsRef.current = manquants;

  // repère la séparation caméra / jeu (la ligne horizontale la plus marquée entre 25 et 55 %)
  function detecterSeparation() {
    const v = video.current; if (!v || !v.videoWidth) return false;
    const c = document.createElement("canvas"); c.width = 108; c.height = 192;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    const vw = v.videoWidth, vh = v.videoHeight, s = Math.max(108 / vw, 192 / vh);
    g.drawImage(v, (108 - vw * s) / 2, (192 - vh * s) / 2, vw * s, vh * s);
    const dd = g.getImageData(0, 0, 108, 192).data, lum = (x: number, y: number) => { const i = (y * 108 + x) * 4; return dd[i] + dd[i + 1] + dd[i + 2]; };
    let best = 73, score = -1;
    for (let y = 52; y < 102; y++) { let n = 0; for (let x = 0; x < 108; x++) n += Math.abs(lum(x, y + 1) - lum(x, y - 1)); if (n > score) { score = n; best = y; } }
    if (score < 108 * 40) return false;
    corriger((d) => ({ ...d, calques: d.calques.map((x) => (x.type === "barre" ? { ...x, y: best / 192 } : x)) }));
    return true;
  }

  // ── aperçu : attraper un élément pour le déplacer, ou sa poignée pour l'agrandir ──
  function saisirApercu(e: React.PointerEvent<HTMLCanvasElement>) {
    const cv = e.currentTarget, r = cv.getBoundingClientRect();
    const pt = (cx: number, cy: number) => ({ x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H });
    const p0 = pt(e.clientX, e.clientY);
    const d = etat.current.doc, cal = d.calques, s0 = etat.current.sel;
    const selId = s0?.type === "calque" || s0?.type === "incrust" ? s0.id : "";
    const zSel = selId ? zones.current[selId] : null;
    const suivre = (bouger: (q: { x: number; y: number }) => void) => {
      cv.setPointerCapture(e.pointerId);
      const mv = (ev: PointerEvent) => bouger(pt(ev.clientX, ev.clientY));
      const fin = () => { cv.removeEventListener("pointermove", mv); cv.removeEventListener("pointerup", fin); cv.removeEventListener("pointercancel", fin); couperGeste(); };
      cv.addEventListener("pointermove", mv); cv.addEventListener("pointerup", fin); cv.addEventListener("pointercancel", fin);
    };
    // poignée d'agrandissement de l'élément choisi
    if (zSel && Math.hypot(p0.x - (zSel.x + zSel.w + 8), p0.y - (zSel.y + zSel.h + 8)) < 60) {
      const cx = zSel.x + zSel.w / 2, cy = zSel.y + zSel.h / 2, d0 = Math.hypot(p0.x - cx, p0.y - cy) || 1;
      if (s0?.type === "incrust") {
        const w0 = d.incrustations.find((c) => c.id === selId)?.w || 0.4;
        suivre((q) => majIncrust(selId, { w: +Math.max(0.08, Math.min(1.4, (w0 * Math.hypot(q.x - cx, q.y - cy)) / d0)).toFixed(3) }, "taille-" + selId));
      } else {
        const k0 = cal.find((c) => c.id === selId)?.echelle || 1;
        suivre((q) => majCalque(selId, { echelle: +Math.max(0.4, Math.min(2.6, (k0 * Math.hypot(q.x - cx, q.y - cy)) / d0)).toFixed(3) }, "taille-" + selId));
      }
      return;
    }
    // ce qui est sous le doigt : d'abord l'élément choisi, puis les textes, puis les incrustations
    const actives = etatA(d, tRef.current).incrust.map((x) => x.c);
    const ids = [...[...cal].reverse().map((c) => c.id), ...[...actives].reverse().map((c) => c.id)];
    let id = ids.find((x) => x === selId && zones.current[x] && dans(zones.current[x], p0));
    if (!id) id = ids.find((x) => zones.current[x] && dans(zones.current[x], p0, 0));
    if (!id) id = ids.find((x) => zones.current[x] && dans(zones.current[x], p0));
    if (!id) { setSel(null); return; }
    const inc = actives.find((c) => c.id === id);
    if (inc) {
      setSel({ type: "incrust", id: inc.id });
      const x0 = inc.x, y0 = inc.y;
      suivre((q) => majIncrust(inc.id, { x: +Math.max(0, Math.min(1, x0 + (q.x - p0.x) / W)).toFixed(4), y: +Math.max(0, Math.min(1, y0 + (q.y - p0.y) / H)).toFixed(4) }, "deplacer-" + inc.id));
      return;
    }
    const c0 = cal.find((c) => c.id === id)!;
    setSel({ type: "calque", id: c0.id });
    const y0 = c0.type === "encart" && c0.lie ? (cal.find((x) => x.type === "barre")?.y ?? c0.y) : c0.y, x0 = c0.x;
    suivre((q) => {
      const dy = (q.y - p0.y) / H, dx = (q.x - p0.x) / W;
      const ny = Math.max(0.03, Math.min(0.97, y0 + dy)), nx = Math.max(0.05, Math.min(0.95, x0 + dx));
      setCalques((l) => l.map((c) => {
        if (c0.type === "encart" && c0.lie) return c.type === "barre" ? { ...c, y: ny } : c;
        if (c.id !== c0.id) return c;
        return c.type === "flash" || c.type === "texte" || c.type === "etiquette" || c.type === "carte" ? { ...c, y: ny, x: nx } : { ...c, y: ny };
      }), "deplacer-" + c0.id);
    });
  }

  // ── médias : importer, ajouter à la piste, en incrustation, au son ──
  async function importer(liste: FileList | File[], remplace?: string) {
    const fs = Array.from(liste); if (!fs.length) return;
    setImport({ n: fs.length, fait: 0 });
    const ajouts: Media[] = []; const erreurs: string[] = [];
    for (const f of fs) {
      try {
        const s = await sonder(f);
        const id = remplace || nouvelIdMedia();
        await garderMedia(projet.id, id, f);
        poserFichier(id, f);
        ajouts.push({ id, type: s.type, nom: sansExt(f.name), duree: s.duree, w: s.w, h: s.h, ajoute: Date.now() });
      } catch (er) { erreurs.push(`${f.name} : ${er instanceof Error ? er.message : er}`); }
      setImport((x) => (x ? { ...x, fait: x.fait + 1 } : x));
    }
    if (remplace && ajouts.length) {
      setManquants((m) => { const n = new Set(m); n.delete(remplace); return n; });
      corriger((d) => ({ ...d, medias: d.medias.map((m) => (m.id === remplace ? { ...ajouts[0], ajoute: m.ajoute } : m)) }));
    } else if (ajouts.length) {
      changer((d) => ({ ...d, medias: [...d.medias, ...ajouts] }));
      setMediaChoisi(ajouts[ajouts.length - 1].id);
      if (ajouts.every((a) => a.type === "son")) setOnglet("audios");
    }
    setVersionMedias((n) => n + 1);
    setImport(erreurs.length ? { n: fs.length, fait: fs.length, erreur: erreurs.join(" · ") } : null);
  }
  function aLaSuite(mid: string) {
    const m = mid === PRINCIPAL ? null : mediaParId.get(mid);
    const len = m?.type === "image" ? DUREE_PHOTO : m ? m.duree : dureeSource;
    const nouveau: Morceau = { id: nouvelIdMorceau(), a: 0, b: len, ...(mid === PRINCIPAL ? {} : { media: mid }) };
    const r = tRef.current;
    setMorceaux((l) => {
      const { k, src } = aTempsMonte(l, r);
      if (k < 0) return [nouveau];
      const x = l[k];
      if (src - x.a > 0.1 && x.b - src > 0.1) { const c = couper(l, r); const i = c.morceaux.findIndex((y) => y.id === c.droite); const out = [...c.morceaux]; out.splice(i, 0, nouveau); return out; }
      const out = [...l]; out.splice(r - debuts(l)[k] < duree(x) / 2 ? k : k + 1, 0, nouveau); return out;
    });
    setSel({ type: "morceau", id: nouveau.id });
  }
  function enIncrustation(mid: string) {
    const m = mid === PRINCIPAL ? null : mediaParId.get(mid);
    const len = m?.type === "image" ? Math.min(5, Math.max(1, total - tRef.current)) : m ? m.duree : dureeSource;
    const c: Incrust = { id: nouvelId(), media: mid, debut: +tRef.current.toFixed(3), a: 0, b: len, x: 0.5, y: 0.3, w: 0.5, forme: "arrondi", contour: true, opacite: 1, vol: 1, muet: false, anim: "pop" };
    setIncrust((l) => [...l, c]); setSel({ type: "incrust", id: c.id });
  }
  function ajouterSon(mid: string) {
    const m = mediaParId.get(mid); if (!m) return;
    const s: PisteSon = { id: nouvelId(), media: mid, debut: +tRef.current.toFixed(3), a: 0, b: Math.min(m.duree, Math.max(1, total - tRef.current)), vol: 0.8, fE: 0.5, fS: 1 };
    setSons((l) => [...l, s]); setSel({ type: "son", id: s.id });
  }
  function retirerMedia(mid: string) {
    const n = doc.morceaux.filter((m) => m.media === mid).length + doc.incrustations.filter((c) => c.media === mid).length + doc.sons.filter((s) => s.media === mid).length;
    if (n && !confirm(`Ce média est utilisé ${n} fois dans le montage : le retirer partout ?`)) return;
    if (doc.morceaux.length && doc.morceaux.every((m) => m.media === mid)) { alert("La piste vidéo ne peut pas être vide : ajoute d’abord autre chose."); return; }
    changer((d) => { const m = d.morceaux.filter((x) => x.media !== mid); return { ...d, medias: d.medias.filter((x) => x.id !== mid), morceaux: m, calques: ajusterCalques(d.calques, dureeTotale(m)), incrustations: d.incrustations.filter((x) => x.media !== mid), sons: d.sons.filter((x) => x.media !== mid) }; });
    setMediaChoisi(""); setSel(null);
  }

  // ── outils ──
  function diviser() {
    const r = tRef.current;
    if (sel?.type === "calque") {
      const c = doc.calques.find((x) => x.id === sel.id);
      if (c && c.type !== "soustitres" && c.type !== "barre" && c.type !== "encart" && r > c.debut + 0.1 && r < c.fin - 0.1) {
        const d2 = { ...c, id: nouvelId(), debut: r };
        setCalques((l) => [...l.map((x) => (x.id === c.id ? { ...x, fin: r } : x)), d2]); setSel({ type: "calque", id: d2.id }); return;
      }
    }
    if (sel?.type === "incrust" || sel?.type === "son") {
      const l0 = sel.type === "incrust" ? doc.incrustations : doc.sons, x = l0.find((y) => y.id === sel.id);
      if (x && r > x.debut + 0.1 && r < x.debut + duree(x) - 0.1) {
        const cut = x.a + (r - x.debut) * vitesse(x), id2 = nouvelId();
        const part = <T extends Incrust | PisteSon>(l: T[]) => l.flatMap((y) => (y.id === x.id ? [{ ...y, b: cut, ...("fS" in y ? { fS: 0 } : {}) }, { ...y, id: id2, a: cut, debut: r, ...("fE" in y ? { fE: 0 } : {}) }] : [y]));
        if (sel.type === "incrust") setIncrust((l) => part(l)); else setSons((l) => part(l));
        setSel({ type: sel.type, id: id2 }); return;
      }
    }
    const c = couper(doc.morceaux, r);
    if (c.droite) { setMorceaux(() => c.morceaux); setSel({ type: "morceau", id: c.droite }); }
  }
  function couperA(r: number) { allerA(r); const x = couper(etat.current.doc.morceaux, r); if (x.droite) { setMorceaux(() => x.morceaux); setSel({ type: "morceau", id: x.droite }); } }
  function supprimer() {
    if (!sel) return;
    if (sel.type === "morceau") {
      if (doc.morceaux.length <= 1) return;
      const k = doc.morceaux.findIndex((m) => m.id === sel.id);
      setMorceaux((m) => supprimerMorceau(m, sel.id));
      setSel(null);
      setTimeout(() => { const m = etat.current.doc.morceaux, tot = dureeTotale(m); allerA(Math.min(debuts(m)[Math.max(0, k)] ?? tot, Math.max(0, tot - 0.05))); }, 0);
      return;
    }
    if (sel.type === "incrust") { setIncrust((l) => l.filter((x) => x.id !== sel.id)); setSel(null); return; }
    if (sel.type === "son") { setSons((l) => l.filter((x) => x.id !== sel.id)); setSel(null); return; }
    const c = doc.calques.find((x) => x.id === sel.id);
    if (!c) return;
    if (c.type === "flash" || c.type === "texte") { setCalques((l) => l.filter((x) => x.id !== c.id)); setSel(null); }
    else majCalque(c.id, { visible: false }, "visible-" + c.id); // les éléments du thème se masquent (réaffichables)
  }
  function copier() {
    if (sel?.type === "morceau") { const m = doc.morceaux.find((x) => x.id === sel.id); if (m) pressePapier.current = { type: "morceau", m }; }
    else if (sel?.type === "incrust") { const c = doc.incrustations.find((x) => x.id === sel.id); if (c) pressePapier.current = { type: "incrust", c }; }
    else if (sel?.type === "son") { const s = doc.sons.find((x) => x.id === sel.id); if (s) pressePapier.current = { type: "son", s }; }
    else if (sel?.type === "calque") { const c = doc.calques.find((x) => x.id === sel.id); if (c && (c.type === "flash" || c.type === "texte")) pressePapier.current = { type: "calque", c }; }
  }
  function coller() {
    const pp = pressePapier.current, r = tRef.current; if (!pp) return;
    if (pp.type === "morceau") {
      const { k } = aTempsMonte(doc.morceaux, r); const nouveau = { ...pp.m, id: nouvelIdMorceau() };
      setMorceaux((m) => { const out = [...m]; out.splice(k + 1, 0, nouveau); return out; }); setSel({ type: "morceau", id: nouveau.id });
    } else if (pp.type === "incrust") { const c = { ...pp.c, id: nouvelId(), debut: r }; setIncrust((l) => [...l, c]); setSel({ type: "incrust", id: c.id }); }
    else if (pp.type === "son") { const s = { ...pp.s, id: nouvelId(), debut: r }; setSons((l) => [...l, s]); setSel({ type: "son", id: s.id }); }
    else { const len = pp.c.fin - pp.c.debut, c = { ...pp.c, id: nouvelId(), debut: r, fin: Math.min(total, r + len) }; setCalques((l) => [...l, c]); setSel({ type: "calque", id: c.id }); }
  }
  function dupliquer() {
    if (sel?.type === "morceau") { const r = dupliquerMorceau(doc.morceaux, sel.id); if (r.id) { setMorceaux(() => r.morceaux); setSel({ type: "morceau", id: r.id }); } }
    else if (sel?.type === "incrust") { const c = doc.incrustations.find((x) => x.id === sel.id); if (c) { const n = { ...c, id: nouvelId(), debut: c.debut + duree(c) }; setIncrust((l) => [...l, n]); setSel({ type: "incrust", id: n.id }); } }
    else if (sel?.type === "son") { const s = doc.sons.find((x) => x.id === sel.id); if (s) { const n = { ...s, id: nouvelId(), debut: s.debut + duree(s) }; setSons((l) => [...l, n]); setSel({ type: "son", id: n.id }); } }
    else if (sel?.type === "calque") { const c = doc.calques.find((x) => x.id === sel.id); if (c && (c.type === "flash" || c.type === "texte")) { const len = c.fin - c.debut, n = { ...c, id: nouvelId(), debut: Math.min(total - 0.1, c.fin), fin: Math.min(total, c.fin + len) }; setCalques((l) => [...l, n]); setSel({ type: "calque", id: n.id }); } }
  }
  const ajouterFlash = () => { const f = nouveauFlash(tRef.current); setCalques((l) => [...l, f]); setSel({ type: "calque", id: f.id }); };
  const ajouterTexte = () => { const c = nouveauTexte(tRef.current, total); setCalques((l) => [...l, c]); setSel({ type: "calque", id: c.id }); };
  const image = (n: number) => { arreter(); allerA(tRef.current + n / 30); };

  // ── recadrer ──
  function ouvrirRecadrage() {
    arreter();
    if (sel?.type === "incrust") { const c = doc.incrustations.find((x) => x.id === sel.id); if (c) { if (tRef.current < c.debut || tRef.current >= c.debut + duree(c)) allerA(c.debut + 0.05); setRecadre({ type: "incrust", id: c.id }); } return; }
    let k = sel?.type === "morceau" ? doc.morceaux.findIndex((m) => m.id === sel.id) : -1;
    if (k < 0) k = aTempsMonte(doc.morceaux, tRef.current).k;
    if (k < 0) return;
    const deb = debuts(doc.morceaux)[k];
    if (tRef.current < deb || tRef.current >= deb + duree(doc.morceaux[k])) allerA(deb + 0.05);
    setSel({ type: "morceau", id: doc.morceaux[k].id }); setRecadre({ type: "morceau", id: doc.morceaux[k].id });
  }
  const recadrage = (() => {
    if (!recadre || !lecteur.current) return null;
    const l = lecteur.current;
    if (recadre.type === "incrust") {
      const c = doc.incrustations.find((x) => x.id === recadre.id); if (!c) return null;
      const s0 = l.source("i:" + c.id, c.media); if (!s0) return null;
      return { titre: nomMedia(c.media), el: () => l.source("i:" + c.id, c.media)?.el || null, w: s0.w, h: s0.h, depart: c.crop, appliquer: (cr: Crop | undefined) => majIncrust(c.id, { crop: cr }) };
    }
    const k = doc.morceaux.findIndex((x) => x.id === recadre.id), m = doc.morceaux[k]; if (!m) return null;
    const cle = clePiste(m, k), s0 = l.source(cle, mediaDe(m)); if (!s0) return null;
    return { titre: nomMedia(mediaDe(m)), el: () => l.source(cle, mediaDe(m))?.el || null, w: s0.w, h: s0.h, depart: m.crop, appliquer: (cr: Crop | undefined) => majMorceau(m.id, { crop: cr }) };
  })();

  // raccourcis clavier
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      const c = e.target as HTMLElement | null;
      if (c && (c.tagName === "INPUT" || c.tagName === "TEXTAREA" || c.tagName === "SELECT" || c.isContentEditable)) return;
      const k = e.key.toLowerCase(), mod = e.metaKey || e.ctrlKey;
      if (mod && k === "z") { e.preventDefault(); if (e.shiftKey) retablir(); else annuler(); }
      else if (mod && k === "y") { e.preventDefault(); retablir(); }
      else if (mod && k === "s") { e.preventDefault(); enregistrer(); }
      else if (mod && k === "c") { copier(); }
      else if (mod && k === "v") { e.preventDefault(); coller(); }
      else if (mod && k === "d") { e.preventDefault(); dupliquer(); }
      else if (mod || e.altKey) return;
      else if (k === " ") { e.preventDefault(); lectureOuPause(); }
      else if (k === "s" || k === "b") { e.preventDefault(); diviser(); }
      else if (k === "delete" || k === "backspace") { e.preventDefault(); supprimer(); }
      else if (k === "arrowleft") { e.preventDefault(); image(e.shiftKey ? -30 : -1); }
      else if (k === "arrowright") { e.preventDefault(); image(e.shiftKey ? 30 : 1); }
      else if (k === "home") { e.preventDefault(); arreter(); allerA(0); }
      else if (k === "end") { e.preventDefault(); arreter(); allerA(total); }
      else if (k === "a") setOutil("selection");
      else if (k === "c") ouvrirRecadrage();
      else if (k === "escape") setSel(null);
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  });

  // ── enregistrer ──
  function miniatureApercu() {
    try { const src = apercu.current; if (!src) return ""; const c = document.createElement("canvas"); c.width = 270; c.height = 480; c.getContext("2d")!.drawImage(src, 0, 0, 270, 480); return c.toDataURL("image/jpeg", 0.72); } catch { return ""; }
  }
  async function enregistrer(premier = false) {
    if (sauve.etat === "enreg" && !premier) return;
    setSauve((s) => ({ ...s, etat: "enreg" }));
    try {
      const d = etat.current.doc;
      const info: BrouillonInfo = {
        id: projet.id, nom: nom.trim() || projet.nomFichier.replace(/\.[^.]+$/, "") || "Projet", nomFichier: projet.nomFichier, maj: Date.now(), cree: creeLe.current, archive: projet.archive,
        duree: dureeTotale(d.morceaux), miniature: miniatureApercu(),
        etat: { version: 2, ...d, modele: modeleDepuisCalques(d.calques, dureeTotale(d.morceaux), d.ending), clipChoisi: projet.clip, duree: dureeSource },
      };
      const avecClip = !fichierEnLigne.current;
      await enregistrerBrouillon(info, avecClip ? projet.fichier : undefined, { immediat: true });
      fichierEnLigne.current = true;
      marquerEnregistre(); setNomModifie(false);
      setSauve({ etat: "ok", maj: info.maj });
      // les médias ajoutés partent en ligne derrière (pour les retrouver sur les autres appareils)
      const mids = d.medias.map((m) => m.id).filter((m) => !manquantsRef.current.has(m));
      if (mids.length) envoyerMedias(projet.id, mids, (f, n) => setSauve((s) => ({ ...s, medias: f < n ? `Médias en ligne ${f}/${n}…` : "" }))).then((ok) => { if (!ok) setSauve((s) => ({ ...s, medias: "⚠️ Médias pas encore en ligne (réessayé au prochain enregistrement)" })); });
      return info;
    } catch (e) {
      setSauve({ etat: "erreur", message: "Projet non enregistré : " + (e instanceof Error ? e.message : String(e)) });
      return null;
    }
  }
  async function fermer(sauver: boolean | null) {
    if (sauver === null && (modifie || nomModifie)) { setQuitter(true); return; }
    arreter();
    const info = sauver ? await enregistrer() : null;
    if (sauver && !info) return; // l'erreur est affichée, on reste
    onFermer(info || undefined);
  }

  // ── export ──
  async function preparerSon(avecFin: boolean) {
    const d = etat.current.doc, sons = new Map<string, AudioBuffer | null>();
    const utiles = new Set<string>([...d.morceaux.filter((m) => !m.muet).map(mediaDe), ...d.incrustations.filter((c) => !c.muet).map((c) => c.media), ...d.sons.map((s) => s.media)]);
    for (const mid of utiles) {
      if (mid !== PRINCIPAL && mediaParId.get(mid)?.type === "image") continue;
      const u = urls.current.get(mid);
      sons.set(mid, u ? await sonDe(u) : null);
    }
    let fin: { son: AudioBuffer | null; duree: number } | null = null;
    if (avecFin && finVideo.current) {
      const s = await decoderSon(ENDING).catch(() => null), fv = finVideo.current;
      fin = { son: s, duree: Number.isFinite(fv.duration) && fv.duration > 0 ? fv.duration : s?.duration || 4 };
    }
    return mixer(d, sons, fin);
  }
  async function exporter() {
    const l = lecteur.current; if (!l) return;
    arreter(); l.debloquer();
    const fv = finVideo.current, avecFin = habille && doc.ending && Boolean(fv);
    if (avecFin && fv) { fv.muted = true; fv.play().then(() => { fv.pause(); fv.currentTime = 0; }).catch(() => {}); }
    exportEnCours.current = true;
    setExport({ etat: "en-cours", progres: 0, etape: "Préparation du son…", debut: Date.now() });
    try { await exporterVideo(avecFin); }
    catch (er) { setExport({ etat: "erreur", progres: 0, message: "La création a échoué : " + (er instanceof Error ? er.message : String(er)) + ". Réessaie (garde l’onglet ouvert pendant la création)." }); }
    finally { exportEnCours.current = false; l.pauseTout(); allerA(tRef.current); }
  }
  function livrer(blob: Blob, ext: string, mode = "") {
    const u = URL.createObjectURL(blob);
    setExport({ etat: "fini", progres: 1, url: u, ext, mode });
    setVt({ titre: etat.current.doc.titre || nom, desc: descriptions[0]?.texte || "", tags: hashtags(doc.jeu), etat: "repos", pct: 0 });
    const a = document.createElement("a"); a.href = u; a.download = `${(nom || "tiktok-cycylive").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 50)}.${ext}`;
    document.body.appendChild(a); a.click(); a.remove();
  }
  /** Joue la cinématique de fin dans le canvas (fondu de 0,4 s depuis la dernière image). */
  async function jouerFin(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement, base: number, rythme: number, surImage: (t: number) => void, avance: (p: number) => void) {
    const fv = finVideo.current; if (!fv) return;
    const fige = document.createElement("canvas"); fige.width = W; fige.height = H; fige.getContext("2d")!.drawImage(canvas, 0, 0);
    fv.muted = true; fv.currentTime = 0; fv.playbackRate = rythme;
    const dureeFin = Number.isFinite(fv.duration) && fv.duration > 0 ? fv.duration : 4;
    try {
      await fv.play();
      const limite = Date.now() + ((dureeFin / rythme) + 2) * 1000;
      await new Promise<void>((ok) => {
        const pas = () => {
          c.globalAlpha = 1; c.drawImage(fige, 0, 0); c.globalAlpha = Math.min(1, fv.currentTime / 0.4); c.drawImage(fv, 0, 0, W, H); c.globalAlpha = 1;
          surImage(base + fv.currentTime); avance(Math.min(1, fv.currentTime / dureeFin));
          if (fv.ended || fv.currentTime >= dureeFin - 0.02 || Date.now() > limite) { ok(); return; }
          requestAnimationFrame(pas);
        };
        requestAnimationFrame(pas);
      });
    } catch { /* cinématique illisible : la vidéo est livrée sans */ }
    fv.pause(); fv.playbackRate = 1;
  }
  /** Cinématique de fin, image par image (fondu de 0,4 s depuis la dernière image). */
  async function finImageParImage(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement, base: number, surImage: (t: number) => void, souffler: () => Promise<void>, avance: (p: number) => void) {
    const fv = finVideo.current; if (!fv) return;
    const fige = document.createElement("canvas"); fige.width = W; fige.height = H; fige.getContext("2d")!.drawImage(canvas, 0, 0);
    fv.muted = true; fv.pause();
    if (!(fv.readyState >= 1)) await new Promise((ok) => { fv.addEventListener("loadedmetadata", ok, { once: true }); setTimeout(ok, 3000); });
    const dureeFin = Number.isFinite(fv.duration) && fv.duration > 0 ? fv.duration : 4, N = Math.round(dureeFin * FPS_EXPORT);
    for (let n = 0; n < N; n++) {
      const t = n / FPS_EXPORT;
      await allerAImage(fv, Math.min(dureeFin - 0.01, t));
      c.globalAlpha = 1; c.drawImage(fige, 0, 0); c.globalAlpha = Math.min(1, t / 0.4); c.drawImage(fv, 0, 0, W, H); c.globalAlpha = 1;
      surImage(base + t); avance((n + 1) / N);
      await souffler();
    }
  }
  async function exporterVideo(avecFin: boolean) {
    const l = lecteur.current!, d = etat.current.doc, m = d.morceaux, deb = debuts(m), tot = dureeTotale(m);
    const mix = await preparerSon(avecFin);
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    const c = canvas.getContext("2d")!;
    const part = avecFin ? 0.9 : 1;
    let raison = webcodecsDispo() ? "" : "ce navigateur ne sait pas encoder image par image";
    if (webcodecsDispo()) {
      setExport((x) => ({ ...x, etat: "en-cours", progres: 0, etape: "Création image par image…", debut: Date.now() }));
      try {
                const r = await exporterMp4({
          W, H, mix, canvas, ctxAudio: l.ctx, etape: (t) => setExport((x) => ({ ...x, etape: t })),
          progres: (x) => setExport((e) => ({ ...e, progres: x })),
          fps: FPS_EXPORT,
          rendre: async ({ image: img, charge, vider, erreur }) => {
            // image par image : chaque vidéo est placée exactement sur la bonne image avant d'être dessinée.
            // Les raccords tombent donc pile (aucune image perdue, répétée ou accélérée), quelle que soit la machine.
            l.pauseTout();
            const N = Math.max(1, Math.round(tot * FPS_EXPORT));
            let dm = 0;
            for (let n = 0; n < N && !erreur(); n++) {
              const rel = Math.min(tot - 1e-4, n / FPS_EXPORT);
              await l.caler(d, rel);
              dessiner(c, rel); img(n / FPS_EXPORT);
              if (charge()) await vider();
              const t = performance.now(); if (t - dm > 200) { dm = t; setExport((e) => ({ ...e, progres: Math.min(0.97, (n / N) * part) })); }
            }
            if (avecFin && !erreur()) { setExport((x) => ({ ...x, etape: "Cinématique de fin…" })); await finImageParImage(c, canvas, N / FPS_EXPORT, (t) => img(t), async () => { if (charge()) await vider(); }, (p) => setExport((e) => ({ ...e, progres: part + (0.97 - part) * p }))); }
          },
        });
        if (r.son === "ok" || r.son === "plan-b" || r.son === "muet-source") { livrer(r.blob, "mp4", r.son === "ok" ? "✓ MP4 image par image (raccords exacts), son vérifié dans le fichier" : r.son === "plan-b" ? "✓ MP4 image par image (raccords exacts) · son enregistré par ce navigateur et vérifié" : "✓ MP4 image par image · montage sans son"); return; }
        raison = (r.detail || "son introuvable dans le fichier") + " : la vidéo est refaite en direct";
      } catch (er) { raison = er instanceof Error ? er.message : String(er); }
    }
    // secours : enregistrement en direct (le son mixé est joué en même temps)
    setExport({ etat: "en-cours", progres: 0, etape: "Enregistrement en direct…" });
    const ctx = l.ctx || new AudioContext(); await ctx.resume().catch(() => {});
    const dest = ctx.createMediaStreamDestination();
    const flux = canvas.captureStream(30);
    dest.stream.getAudioTracks().forEach((t) => flux.addTrack(t));
    const types = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
    const type = types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
    if (!type) { setExport({ etat: "erreur", progres: 0, message: "Ce navigateur ne sait pas enregistrer de vidéo : utilise Chrome, Edge ou Safari récent." }); return; }
    const parts: Blob[] = [];
    const rec = new MediaRecorder(flux, { mimeType: type, videoBitsPerSecond: 16_000_000 });
    rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
    const termine = new Promise<void>((ok) => { rec.onstop = () => ok(); });
    await l.allerEtAttendre(d, 0);
    dessiner(c, 0);
    rec.start(250);
    const src = ctx.createBufferSource(); src.buffer = mix; src.connect(dest);
    const t0 = ctx.currentTime + 0.05; src.start(t0);
    await new Promise<void>((ok) => {
      let dm = 0;
      const pas = () => {
        const rel = Math.max(0, ctx.currentTime - t0);
        if (rel >= tot) { ok(); return; }
        l.synchroniser(d, rel, true, { tolerance: 0.15, muet: true });
        dessiner(c, rel);
        const mt = performance.now(); if (mt - dm > 200) { dm = mt; setExport((e) => ({ ...e, progres: Math.min(part, (rel / tot) * part) })); }
        requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    });
    l.pauseTout();
    if (avecFin) await jouerFin(c, canvas, tot, 1, () => {}, (p) => setExport((e) => ({ ...e, progres: part + (1 - part) * p })));
    await new Promise((ok) => setTimeout(ok, 250));
    rec.stop(); await termine; try { src.stop(); } catch { /* déjà fini */ }
    livrer(new Blob(parts, { type: type.split(";")[0] }), type.includes("mp4") ? "mp4" : "webm", "Mode de secours (enregistrement en direct, 30 images/s) · raison : " + raison);
  }

  // images fixes (miniature YouTube / story) à partir de l'image en cours
  function visuel(type: "miniature" | "story") {
    const src = apercu.current; if (!src) return;
    const x = etatA(doc, tRef.current), mid = x.morceau ? mediaDe(x.morceau) : PRINCIPAL, s = lecteur.current?.source(x.morceau ? clePiste(x.morceau, x.k) : "p:" + PRINCIPAL + ":0", mid);
    if (!s) return;
    const [w, h] = type === "miniature" ? [1280, 720] : [1080, 1920];
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const c = canvas.getContext("2d")!;
    const vw = s.w, vh = s.h, k = Math.max(w / vw, h / vh), titre = doc.titre || nom;
    if (type === "story") c.filter = "blur(30px) brightness(.5)";
    c.drawImage(s.el, (w - vw * k) / 2, (h - vh * k) / 2, vw * k, vh * k); c.filter = "none";
    if (type === "miniature") {
      const g = c.createLinearGradient(0, h, 0, h * 0.35); g.addColorStop(0, "rgba(13,10,23,.95)"); g.addColorStop(1, "rgba(13,10,23,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = "#9146ff"; c.fillRect(48, h - 250, 14, 170);
      c.font = `800 82px ${polices.display}`; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
      lignes(c, (titre || "Nouveau clip").toUpperCase(), w - 160).slice(0, 2).forEach((l, i, arr) => { const y = h - 90 - (arr.length - 1 - i) * 88; c.lineWidth = 14; c.strokeStyle = "rgba(24,10,48,.95)"; c.strokeText(l, 84, y); c.fillStyle = "#fff"; c.fillText(l, 84, y); });
      if (doc.jeu) { c.font = `700 30px ${polices.sans}`; c.fillStyle = "#e0b3ff"; c.fillText(doc.jeu.toUpperCase(), 86, h - 270); }
    } else {
      const fh = (w * vh) / vw, y = (h - fh) / 2;
      c.save(); c.shadowColor = "rgba(161,92,255,.7)"; c.shadowBlur = 50; c.drawImage(s.el, 0, y, w, fh); c.restore();
      c.fillStyle = "#e11d48"; c.beginPath(); c.roundRect(w / 2 - 230, y - 300, 460, 90, 45); c.fill();
      c.font = `800 42px ${polices.sans}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText("NOUVEAU CLIP", w / 2, y - 254);
      texteContour(c, titre || "", w / 2, y - 120, 70, polices.display, w - 120, 2);
      c.font = `600 40px ${polices.sans}`; c.fillStyle = "rgba(255,255,255,.85)"; c.fillText("Le clip complet est sur mes réseaux ✨", w / 2, y + fh + 120);
    }
    canvas.toBlob((b) => { if (!b) return; const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${type}-${(titre || "clip").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40)}.jpg`; a.click(); }, "image/jpeg", 0.92);
  }

  // textes prêts à copier
  const sousCarte = doc.calques.find((c) => c.type === "carte")?.sous || "";
  const textes = useMemo(() => {
    const t = doc.titre || "ce moment", jeu = doc.jeu, tags = hashtags(jeu).join(" ");
    return [
      { plateforme: "TikTok", texte: `${t} 😱 ${jeu ? `#${jeu.replace(/\s+/g, "")}` : ""}\nRetrouve-moi en live sur Twitch : ${chaine} 💜\n${tags}`.trim() },
      { plateforme: "TikTok (version courte)", texte: `${t}${sousCarte ? `\n${sousCarte}` : ""}\n${tags}` },
      { plateforme: "Reels Instagram", texte: `${t} ✨\n\nTous les lives sont sur Twitch (lien en bio) 💜\n\n${tags}` },
      { plateforme: "YouTube Shorts", texte: `${t}${jeu ? ` | ${jeu}` : ""} #shorts\n\nLive sur Twitch : https://twitch.tv/${chaine}\n${tags}` },
    ];
  }, [doc.titre, doc.jeu, sousCarte]);
  const sansHashtags = (t: string) => t.split("\n").map((l) => l.replace(/(\s*#[\p{L}\d_]+)+\s*$/u, "")).filter((l) => l.trim()).join("\n");
  const descriptions = textes.map((t) => ({ nom: t.plateforme, texte: sansHashtags(t.texte) }));
  async function copierTexte(t: string, k: string) { try { await navigator.clipboard.writeText(t); setCopie(k); setTimeout(() => setCopie(""), 2000); } catch { /* sélection manuelle */ } }
  async function partager() {
    if (!export_.url) return;
    const blob = await fetch(export_.url).then((r) => r.blob()), f = new File([blob], `clip-cycylive.${export_.ext}`, { type: blob.type });
    if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], text: textes[0].texte }); } catch { /* annulé */ } }
    else { const a = document.createElement("a"); a.href = export_.url; a.download = f.name; a.click(); }
  }
  async function ajouterVideotheque() {
    if (!export_.url || vt.etat === "envoi") return;
    if (!integre()) { setVt((x) => ({ ...x, etat: "erreur", message: "Ouvre le Studio montage depuis CycyBot pour l’ajouter à ta vidéothèque." })); return; }
    setVt((x) => ({ ...x, etat: "envoi", pct: 0, message: "" }));
    const fichier = await fetch(export_.url).then((r) => r.blob());
    const miniature = await new Promise<Blob | null>((ok) => { const src = apercu.current; if (!src) return ok(null); src.toBlob((b) => ok(b), "image/jpeg", 0.86); });
    const idm = Math.random().toString(36).slice(2);
    await new Promise<void>((fini) => {
      let recu = false;
      const stop = (q: Partial<typeof vt>) => { window.removeEventListener("message", ecoute); clearTimeout(attente); setVt((x) => ({ ...x, ...q })); fini(); };
      const ecoute = (ev: MessageEvent) => {
        const d = ev.data as { type?: string; id?: string; pct?: number; message?: string; enLigne?: boolean };
        if (!ORIGINES_INTERFACE.includes(ev.origin) || !d || d.id !== idm) return;
        if (d.type === "cycy-videotheque-recu") recu = true;
        if (d.type === "cycy-videotheque-etat") setVt((x) => ({ ...x, pct: d.pct || 0 }));
        if (d.type === "cycy-videotheque-ok") stop({ etat: "ok", pct: 100, message: d.enLigne === false ? "Ajoutée (fiche seulement : garde ton fichier)." : "" });
        if (d.type === "cycy-videotheque-erreur") stop({ etat: "erreur", message: "L’ajout a échoué : " + (d.message || "erreur inconnue") });
      };
      window.addEventListener("message", ecoute);
      const attente = setTimeout(() => { if (!recu) stop({ etat: "erreur", message: "CycyBot n’a pas répondu : recharge la page puis réessaie." }); }, 6000);
      const msg = { type: "cycy-videotheque", id: idm, fichier, miniature, ext: export_.ext, nom: vt.titre.trim() || nom, legende: vt.desc.trim(), hashtags: vt.tags.join(" ") };
      for (const o of [...new Set<string>(ORIGINES_INTERFACE)]) { try { window.parent.postMessage(msg, o); } catch { /* autre origine */ } }
    });
  }

  // ── rendu ──
  const calqueSel = sel?.type === "calque" ? doc.calques.find((c) => c.id === sel.id) || null : null;
  const morceauSel = sel?.type === "morceau" ? doc.morceaux.find((m) => m.id === sel.id) || null : null;
  const incrustSel = sel?.type === "incrust" ? doc.incrustations.find((m) => m.id === sel.id) || null : null;
  const sonSel = sel?.type === "son" ? doc.sons.find((m) => m.id === sel.id) || null : null;
  const champ = "w-full rounded-lg bg-[#0e0a1c] border border-violet/25 px-3 py-2 text-sm text-ink outline-none focus:border-violet/70";
  const etiquette = "block text-xs text-ink-soft";
  const glissiere = "mt-1 w-full accent-violet-500";
  const btnOutil = (actif = false) => `flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm transition-all disabled:opacity-35 disabled:pointer-events-none ${actif ? "bg-violet text-white" : "text-ink-soft hover:bg-white/10 hover:text-ink"}`;
  const puce = (actif: boolean) => `rounded-full border px-2.5 py-1 text-xs transition-all ${actif ? "border-violet-light bg-violet/25 text-ink" : "border-white/10 text-ink-soft hover:bg-white/5"}`;
  const ongletBtn = (k: typeof onglet, ic: NomIcone, t: string) => (
    <button type="button" onClick={() => setOnglet(k)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[10.5px] font-medium transition-all ${onglet === k ? "bg-violet/25 text-ink" : "text-ink-soft hover:bg-white/5"}`}><Icone nom={ic} className="h-5 w-5" /><span className="max-w-full truncate">{t}</span></button>
  );
  const etatSauve = sauve.etat === "enreg" ? "Enregistrement…" : sauve.etat === "erreur" ? "⚠️ Non enregistré" : modifie || nomModifie ? "Modifications non enregistrées" : sauve.maj ? `Enregistré à ${new Date(sauve.maj).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "";
  const glisser = (label: string, v: number, min: number, max: number, pas: number, f: (x: number) => void, affiche?: string) => (
    <label className={etiquette}>{label} : {affiche ?? v}<input type="range" min={min} max={max} step={pas} value={v} onChange={(e) => f(+e.target.value)} className={glissiere} /></label>
  );
  // bibliothèque
  const bib: { id: string; type: TypeMedia; nom: string; duree: number }[] = [{ id: PRINCIPAL, type: "video", nom: "Vidéo du projet", duree: dureeSource }, ...doc.medias];
  const bibFiltree = bib.filter((m) => (onglet === "audios" ? m.type === "son" : filtre === "tout" || m.type === filtre) && (!recherche.trim() || m.nom.toLowerCase().includes(recherche.trim().toLowerCase())));
  const vignette = (id: string) => apercus.pellicules.get(id)?.images.find(Boolean) || "";
  const utilisations = (id: string) => doc.morceaux.filter((m) => mediaDe(m) === id).length + doc.incrustations.filter((c) => c.media === id).length + doc.sons.filter((s) => s.media === id).length;
  const listeMedias = (
    <>
      <div className="flex gap-1.5">
        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet px-3 py-2.5 text-sm font-semibold text-white shadow-glow-sm hover:bg-violet-light">
          <Icone nom="plus" className="h-4 w-4" /> Importer
          <input type="file" multiple accept={onglet === "audios" ? "audio/*,.mp3,.m4a,.wav,.aac" : "image/*,video/*,audio/*"} className="sr-only" onChange={(e) => { const f = e.target.files; if (f) importer(Array.from(f)); e.target.value = ""; }} />
        </label>
      </div>
      {import_ && <p className={`rounded-lg px-2.5 py-1.5 text-xs ${import_.erreur ? "bg-red-500/15 text-red-100" : "bg-white/5 text-ink-soft"}`}>{import_.erreur ? <>⚠️ {import_.erreur} <button type="button" className="ml-1 underline" onClick={() => setImport(null)}>OK</button></> : `Import… ${import_.fait}/${import_.n}`}</p>}
      {onglet === "medias" && (
        <div className="flex flex-wrap gap-1">
          {([["tout", "Tout"], ["video", "Vidéos"], ["image", "Photos"], ["son", "Sons"]] as const).map(([v, t]) => <button key={v} type="button" onClick={() => setFiltre(v)} className={puce(filtre === v)}>{t}</button>)}
        </div>
      )}
      <div className="relative">
        <Icone nom="loupe" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
        <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher" className={`${champ} pl-8 py-1.5`} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {bibFiltree.map((m) => {
          const img = m.type === "image" ? urls.current.get(m.id) : vignette(m.id), choisi = mediaChoisi === m.id, perdu = manquants.has(m.id), n = utilisations(m.id);
          return (
            <div key={m.id} className={`overflow-hidden rounded-xl border transition-all ${choisi ? "col-span-2 border-violet-light bg-violet/15" : "border-white/10 bg-white/[0.03]"}`}>
              <button type="button" onClick={() => setMediaChoisi(choisi ? "" : m.id)} className={`flex w-full text-left ${choisi ? "flex-row items-center gap-2 p-1.5" : "flex-col"}`}>
                <span className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-black/40 ${choisi ? "h-14 w-14 rounded-lg" : "aspect-square w-full"}`}>
                  {m.type === "son" ? <Icone nom="note" className="h-7 w-7 text-emerald-300" /> : img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <span className="text-xl">{perdu ? "⚠️" : "🎞️"}</span>}
                  {m.type !== "image" && m.duree > 0 && <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[9px] text-white tabular-nums">{fmtCourt(m.duree)}</span>}
                  {n > 0 && <span className="absolute left-1 top-1 rounded bg-violet/90 px-1 text-[9px] font-semibold text-white">✓ {n}</span>}
                </span>
                <span className={`block min-w-0 truncate text-[11px] text-ink ${choisi ? "" : "px-1.5 py-1"}`}>{m.nom}{perdu ? " · introuvable" : ""}</span>
              </button>
              {choisi && (
                <div className="flex flex-wrap gap-1 border-t border-white/10 p-1.5">
                  {perdu ? (
                    <label className="cursor-pointer rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-xs text-amber-100">Réimporter ce fichier<input type="file" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) importer([f], m.id); e.target.value = ""; }} /></label>
                  ) : m.type === "son" ? (
                    <button type="button" onClick={() => ajouterSon(m.id)} className="rounded-lg bg-emerald-500/80 px-2.5 py-1.5 text-xs font-semibold text-white">＋ Ajouter le son ici</button>
                  ) : (
                    <>
                      <button type="button" onClick={() => aLaSuite(m.id)} className="rounded-lg bg-violet px-2.5 py-1.5 text-xs font-semibold text-white">＋ Sur la piste vidéo</button>
                      <button type="button" onClick={() => enIncrustation(m.id)} className="rounded-lg bg-cyan-500/80 px-2.5 py-1.5 text-xs font-semibold text-white">▣ En incrustation</button>
                      {m.type === "video" && <button type="button" onClick={() => ajouterSon(m.id)} disabled={m.id === PRINCIPAL} className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs text-ink-soft disabled:hidden">♪ Son seul</button>}
                    </>
                  )}
                  {m.id !== PRINCIPAL && <button type="button" onClick={() => retirerMedia(m.id)} className="ml-auto rounded-lg px-2 py-1.5 text-xs text-ink-soft hover:text-red-300" title="Retirer du projet"><Icone nom="corbeille" className="h-4 w-4" /></button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!bibFiltree.length && <p className="rounded-xl border border-dashed border-violet/30 p-3 text-center text-xs text-ink-soft">{onglet === "audios" ? "Importe une musique ou un son (MP3, M4A, WAV…) : il se pose à la tête de lecture, sur sa propre piste." : "Rien ici pour l’instant."}</p>}
      <p className="text-[11px] text-ink-soft/70">Touche un média pour l’ajouter à la tête de lecture : à la suite sur la piste vidéo, ou par-dessus (incrustation).</p>
    </>
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#0a0614] text-ink">
      <video ref={finVideo} src={ENDING} preload="auto" playsInline muted className="pointer-events-none fixed left-0 top-0 h-[2px] w-[2px] opacity-[0.01]" />
      <video ref={video} src={url} playsInline preload="auto" className="pointer-events-none fixed left-0 top-0 h-[2px] w-[2px] opacity-[0.01]"
        onLoadedMetadata={(e) => auChargement(e.currentTarget)}
        onError={() => setSauve({ etat: "erreur", message: "Ce clip ne peut pas être lu ici : réimporte-le en MP4." })} />

      {/* ── barre du haut ── */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#110b20] px-2 md:px-3">
        <button type="button" onClick={() => fermer(null)} className={btnOutil()} title="Retour à mes projets"><Icone nom="retour" className="h-5 w-5" /><span className="hidden lg:inline">Projets</span></button>
        <input value={nom} onChange={(e) => { setNom(e.target.value); setNomModifie(true); }} maxLength={120} aria-label="Nom du projet"
          className="min-w-0 max-w-[340px] flex-1 rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-[15px] font-semibold text-ink outline-none hover:border-white/15 focus:border-violet/60 focus:bg-black/30" />
        <span className={`hidden text-xs md:inline ${sauve.etat === "erreur" ? "text-red-300" : modifie || nomModifie ? "text-amber-200" : "text-ink-soft/70"}`} title={sauve.message}>{(modifie || nomModifie) && sauve.etat !== "enreg" ? "● " : ""}{etatSauve}{sauve.medias ? ` · ${sauve.medias}` : ""}</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={annuler} disabled={!peutAnnuler} className={btnOutil()} title="Annuler (⌘/Ctrl Z)"><Icone nom="annuler" className="h-5 w-5" /></button>
          <button type="button" onClick={retablir} disabled={!peutRetablir} className={btnOutil()} title="Rétablir (⌘/Ctrl ⇧ Z)"><Icone nom="retablir" className="h-5 w-5" /></button>
          <button type="button" onClick={() => enregistrer()} disabled={sauve.etat === "enreg"} className="ml-1 inline-flex h-10 items-center gap-2 rounded-xl border border-violet/40 px-3.5 text-sm font-semibold text-ink hover:bg-violet/15 disabled:opacity-50" title="Enregistrer (⌘/Ctrl S)"><Icone nom="disquette" className="h-5 w-5" /><span className="hidden sm:inline">Enregistrer</span></button>
          <button type="button" onClick={() => setPanneauExport(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet px-3.5 text-sm font-semibold text-white shadow-glow-sm hover:bg-violet-light"><Icone nom="telecharger" className="h-5 w-5" /><span className="hidden sm:inline">Télécharger</span></button>
          <div className="relative">
            <button type="button" onClick={() => setMenu((x) => !x)} className={btnOutil(menu)} aria-label="Plus d’options"><Icone nom="points" className="h-5 w-5" /></button>
            {menu && (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-violet/25 bg-[#1a1033] p-1.5 shadow-[0_18px_40px_rgba(0,0,0,.6)]" onClick={() => setMenu(false)}>
                <button type="button" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-violet/15" onClick={() => visuel("miniature")}><Icone nom="image" className="h-4 w-4 text-lilac" /> Miniature YouTube (image en cours)</button>
                <button type="button" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-violet/15" onClick={() => visuel("story")}><Icone nom="smartphone" className="h-4 w-4 text-lilac" /> Image story « Nouveau clip »</button>
                <button type="button" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-violet/15" onClick={() => setPanneauExport(true)}><Icone nom="document" className="h-4 w-4 text-lilac" /> Textes prêts à copier</button>
                <a className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-violet/15" href="https://bot.cycylive.fr/admin#studio" target="_top"><Icone nom="calendrier" className="h-4 w-4 text-lilac" /> Planifier (calendrier)</a>
              </div>
            )}
          </div>
        </div>
      </header>
      {sauve.etat === "erreur" && <p className="shrink-0 bg-red-500/15 px-4 py-1.5 text-xs text-red-100" role="alert">{sauve.message}</p>}

      {/* ── partie haute : bibliothèque · aperçu · réglages ── */}
      <div className="grid min-h-0 flex-[1.1] grid-cols-[minmax(230px,0.95fr)_minmax(0,1.6fr)_minmax(240px,1fr)] gap-2 p-2">
        {/* bibliothèque */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[#120c22]">
          <div className="flex gap-0.5 border-b border-white/10 p-1.5">
            {ongletBtn("medias", "image", "Médias")}
            {ongletBtn("audios", "note", "Audios")}
            {ongletBtn("textes", "lettres", "Textes")}
            {ongletBtn("soustitres", "bulle", "Sous-titres")}
            {ongletBtn("effets", "eclair", "Effets")}
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {(onglet === "medias" || onglet === "audios") && listeMedias}
            {onglet === "textes" && (
              <>
                <label className={etiquette}>{habille ? "Titre (carte d’ouverture)" : "Titre affiché"}<input value={doc.titre} onChange={(e) => majTitre(e.target.value)} maxLength={70} className={`${champ} mt-1`} placeholder="Le clutch le plus fou de la saison" /></label>
                {habille && <label className={etiquette}>Titre secondaire<input value={sousCarte} onChange={(e) => setCalques((l) => l.map((c) => (c.type === "carte" ? { ...c, sous: e.target.value } : c)), "sous-carte")} maxLength={70} className={`${champ} mt-1`} placeholder="Cycy (Phoenix) & Mamen (Raze) · Pearl" /></label>}
                <label className={etiquette}>Jeu (hashtags)<input value={doc.jeu} onChange={(e) => maj("jeu", e.target.value)} className={`${champ} mt-1`} placeholder="VALORANT" /></label>
                <button type="button" onClick={ajouterTexte} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-violet/40 px-3 py-2.5 text-sm text-ink hover:bg-violet/10"><Icone nom="plus" className="h-4 w-4 text-lilac" /> Texte à la tête de lecture</button>
                <div className="space-y-1.5">
                  {doc.calques.filter((c) => c.type === "texte").map((c) => (
                    <button key={c.id} type="button" onClick={() => { setSel({ type: "calque", id: c.id }); allerA(c.debut); }} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${sel?.id === c.id ? "bg-violet/25" : "bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COULEURS.texte }} /><span className="truncate">{c.texte || "Texte"}</span><span className="ml-auto text-ink-soft/70 tabular-nums">{fmtPrecis(c.debut)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {onglet === "soustitres" && (
              <>
                <p className="text-xs text-ink-soft">Colle ce qui est dit, puis « Répartir » : le texte est découpé en cartons, calés sur la vidéo du projet.{habille && " Entoure un mot d’astérisques (*ACE*) pour l’écrire en rose."}</p>
                <textarea value={doc.transcription} onChange={(e) => maj("transcription", e.target.value)} rows={3} className={champ} placeholder="Non mais c’est pas possible…" />
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" disabled={!doc.transcription.trim()} onClick={() => {
                    const mots = doc.transcription.split(/\s+/).filter(Boolean); if (!mots.length) return;
                    const cartons: string[] = []; for (let i = 0; i < mots.length;) { const n = Math.min(mots.length - i, mots.length - i <= 6 ? mots.length - i : 4); cartons.push(mots.slice(i, i + n).join(" ")); i += n; }
                    let r = 0; const out = cartons.map((texte) => { const dd = (total * texte.split(" ").length) / mots.length; const s0 = aTempsMonte(doc.morceaux, r).src; const st = { id: nouvelId(), debut: +s0.toFixed(2), fin: +(s0 + dd).toFixed(2), texte }; r += dd; return st; });
                    maj("sousTitres", out, "repartir");
                  }} className="rounded-full bg-violet px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-40">Répartir</button>
                  <button type="button" onClick={() => { const s0 = aTempsMonte(doc.morceaux, tM).src; maj("sousTitres", [...doc.sousTitres, { id: nouvelId(), debut: +s0.toFixed(2), fin: +(s0 + 2.5).toFixed(2), texte: "" }].sort((a, b) => a.debut - b.debut), "ajout-st"); }} className="rounded-full border border-violet/30 px-3.5 py-2 text-xs">+ Carton ici</button>
                  {doc.sousTitres.length > 0 && <button type="button" onClick={() => maj("sousTitres", [], "vider-st")} className="rounded-full border border-violet/30 px-3.5 py-2 text-xs text-ink-soft">Tout effacer</button>}
                </div>
                <div className="space-y-1.5">
                  {doc.sousTitres.map((s, i) => {
                    const r = monteDepuisSource(doc.morceaux, s.debut);
                    return (
                      <div key={s.id} className={`rounded-lg border border-white/5 bg-white/[0.03] p-1.5 ${r == null ? "opacity-45" : ""}`}>
                        <div className="flex items-center gap-1 text-[11px] text-ink-soft">
                          <button type="button" onClick={() => r != null && allerA(r)} className="text-lilac tabular-nums">{r == null ? "coupé" : fmtPrecis(r)}</button>
                          <span className="ml-auto">durée</span>
                          <input type="number" step={0.1} min={0.3} value={+(s.fin - s.debut).toFixed(2)} onChange={(e) => maj("sousTitres", doc.sousTitres.map((x, j) => (j === i ? { ...x, fin: x.debut + Math.max(0.3, +e.target.value) } : x)), "st-duree-" + s.id)} className="w-14 rounded bg-black/30 px-1 py-0.5 text-ink" />
                          <button type="button" onClick={() => maj("sousTitres", doc.sousTitres.filter((_, j) => j !== i), "st-suppr")} className="px-1 hover:text-red-300" aria-label="Retirer">✕</button>
                        </div>
                        <input value={s.texte} onChange={(e) => maj("sousTitres", doc.sousTitres.map((x, j) => (j === i ? { ...x, texte: e.target.value } : x)), "st-texte-" + s.id)} className="mt-1 w-full rounded bg-black/30 px-2 py-1 text-xs text-ink outline-none" placeholder="Texte du carton" />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {onglet === "effets" && (
              <>
                <button type="button" onClick={ajouterFlash} className="flex w-full items-center gap-3 rounded-xl border border-white/20 bg-white/[0.06] px-3 py-3 text-left text-sm hover:bg-white/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#2a1555]"><Icone nom="eclair" className="h-5 w-5" /></span>
                  <span><b className="block text-ink">Flash de kill</b><span className="text-xs text-ink-soft">À la tête de lecture : flash, onde au viseur et petit zoom</span></span>
                </button>
                <p className="text-xs text-ink-soft">Astuce : vise l’image exacte avec ← → (une image) puis appuie ici.</p>
                {habille && <label className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm"><input type="checkbox" checked={doc.ending} onChange={(e) => maj("ending", e.target.checked)} className="accent-violet-500" /> Cinématique de fin Cycylive (4 s)</label>}
                {doc.dispo === "vertical" && <button type="button" onClick={() => { if (!detecterSeparation()) alert("Pas de séparation nette trouvée sur cette image : place la tête de lecture sur une image où l’on voit bien la caméra et le jeu."); }} className="w-full rounded-xl border border-violet/30 px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-violet/10">Détecter la séparation caméra / jeu</button>}
                <button type="button" onClick={() => { try { localStorage.removeItem(CLE_MODELE); } catch { /* rien */ } setModele(MODELE_DEFAUT); setCalques((l) => [...calquesDepuisModele(MODELE_DEFAUT, total, doc.titre, sousCarte), ...l.filter((c) => c.type === "flash" || c.type === "texte")]); }} className="w-full rounded-xl border border-violet/30 px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-violet/10">Revenir au thème d’origine</button>
              </>
            )}
          </div>
        </section>

        {/* aperçu */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[#07040e]">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center overflow-auto">
              <canvas ref={apercu} width={W} height={H} onPointerDown={saisirApercu} className="shrink-0 cursor-move touch-none rounded-md bg-[#0d0a17] shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
                style={{ height: `calc(${zoomApercu}% - 16px)`, aspectRatio: "9 / 16" }} aria-label="Aperçu de la vidéo" />
            </div>
            {!pret && <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-soft">Chargement du clip…</p>}
          </div>
          <div className="flex h-12 shrink-0 items-center gap-2 border-t border-white/10 px-3">
            <span className="w-40 whitespace-nowrap font-mono text-xs tabular-nums"><span className="text-lilac">{fmtLong(tM)}</span><span className="text-ink-soft/70"> / {fmtLong(total)}</span></span>
            <div className="flex flex-1 items-center justify-center gap-1">
              <button type="button" onClick={() => image(-1)} className={btnOutil()} title="Image précédente (←)"><Icone nom="retour" className="h-4 w-4" /></button>
              <button type="button" onClick={lectureOuPause} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2a1555] shadow-glow-sm hover:scale-105" aria-label={enLecture ? "Pause" : "Lecture"} title="Lecture / pause (espace)"><Icone nom={enLecture ? "pause" : "lecture"} className="h-6 w-6" /></button>
              {prepSon && <span className="text-[11px] text-ink-soft">Préparation du son…</span>}
              <button type="button" onClick={() => image(1)} className={btnOutil()} title="Image suivante (→)"><Icone nom="fleche" className="h-4 w-4" /></button>
            </div>
            <div className="flex w-44 items-center gap-1.5">
              <input type="range" min={0} max={100} step={1} value={curseurDepuisZoom(zoomApercu)} onChange={(e) => setZoomApercu(zoomDepuisCurseur(+e.target.value))} onDoubleClick={() => setZoomApercu(100)} className="w-full accent-violet-500" aria-label="Taille de l’aperçu" />
              <select value={ZOOMS.includes(zoomApercu) ? zoomApercu : ""} onChange={(e) => setZoomApercu(+e.target.value || 100)} className="rounded-md border border-white/15 bg-black/40 px-1 py-1 text-xs" aria-label="Pourcentage">
                {!ZOOMS.includes(zoomApercu) && <option value="">{zoomApercu} %</option>}
                {ZOOMS.map((z) => <option key={z} value={z}>{z} %</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* réglages */}
        <section className="min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-[#120c22] p-3">
          {calqueSel ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: COULEURS[calqueSel.type] }} />
                <b className="text-sm">{NOMS[calqueSel.type]}</b>
                <label className="ml-auto flex items-center gap-1.5 text-xs text-ink-soft"><input type="checkbox" checked={calqueSel.visible} onChange={(e) => majCalque(calqueSel.id, { visible: e.target.checked }, "visible-" + calqueSel.id)} className="accent-violet-500" /> Affiché</label>
              </div>
              {(calqueSel.type === "carte" || calqueSel.type === "encart" || calqueSel.type === "etiquette" || calqueSel.type === "texte") && (
                <label className={etiquette}>Texte<input value={calqueSel.texte} onChange={(e) => (calqueSel.type === "carte" ? majTitre(e.target.value) : majCalque(calqueSel.id, { texte: e.target.value }, "texte-" + calqueSel.id))} maxLength={60} className={`${champ} mt-1`} /></label>
              )}
              {calqueSel.type === "carte" && <label className={etiquette}>Titre secondaire<input value={calqueSel.sous} onChange={(e) => majCalque(calqueSel.id, { sous: e.target.value }, "sous-" + calqueSel.id)} maxLength={70} className={`${champ} mt-1`} /></label>}
              {calqueSel.type !== "soustitres" && (
                <div className="grid grid-cols-2 gap-2">
                  <label className={etiquette}>{calqueSel.type === "flash" ? "Moment" : "Début"} (s)<input type="number" step={0.033} min={0} value={+calqueSel.debut.toFixed(2)} onChange={(e) => { const v = Math.max(0, +e.target.value), len = calqueSel.fin - calqueSel.debut; majCalque(calqueSel.id, calqueSel.type === "flash" ? { debut: v, fin: v + len } : { debut: Math.min(v, calqueSel.fin - 0.15) }); }} className={`${champ} mt-1`} /></label>
                  {calqueSel.type !== "flash" && <label className={etiquette}>Fin (s)<input type="number" step={0.1} value={+calqueSel.fin.toFixed(2)} onChange={(e) => majCalque(calqueSel.id, { fin: Math.max(calqueSel.debut + 0.15, Math.min(total, +e.target.value)) })} className={`${champ} mt-1`} /></label>}
                  <button type="button" onClick={() => { const len = calqueSel.fin - calqueSel.debut; majCalque(calqueSel.id, calqueSel.type === "flash" ? { debut: tM, fin: tM + len } : { debut: Math.min(tM, calqueSel.fin - 0.15) }, "tete-" + calqueSel.id); }} className="col-span-2 rounded-lg border border-violet/30 px-2 py-1.5 text-xs text-ink-soft hover:bg-violet/10">⌖ Commencer à la tête de lecture</button>
                </div>
              )}
              {calqueSel.type !== "barre" && calqueSel.type !== "flash" && (
                <label className={etiquette}>Animation (entrée / sortie)<select value={calqueSel.anim} onChange={(e) => majCalque(calqueSel.id, { anim: e.target.value as Calque["anim"] }, "anim")} className={`${champ} mt-1`}>{ANIMS.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}</select></label>
              )}
              {calqueSel.type !== "barre" && calqueSel.type !== "flash" && glisser("Taille", calqueSel.echelle || 1, 0.4, 2.6, 0.02, (v) => majCalque(calqueSel.id, { echelle: v }, "taille-" + calqueSel.id), `${Math.round((calqueSel.echelle || 1) * 100)} %`)}
              {!(calqueSel.type === "encart" && calqueSel.lie) && calqueSel.type !== "flash" && glisser("Hauteur", calqueSel.y, 0.05, 0.95, 0.002, (v) => majCalque(calqueSel.id, { y: v }), `${Math.round(calqueSel.y * 100)} %`)}
              {calqueSel.type === "encart" && <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={calqueSel.lie} onChange={(e) => majCalque(calqueSel.id, { lie: e.target.checked })} className="accent-violet-500" /> Collé à la séparation caméra / jeu</label>}
              {calqueSel.type === "flash" && (
                <>
                  {glisser("Durée", calqueSel.fin - calqueSel.debut, 0.1, 0.6, 0.05, (v) => majCalque(calqueSel.id, { fin: calqueSel.debut + v }), `${(calqueSel.fin - calqueSel.debut).toFixed(2)} s`)}
                  {glisser("Intensité", calqueSel.intensite, 0.15, 1, 0.05, (v) => majCalque(calqueSel.id, { intensite: v }), `${Math.round(calqueSel.intensite * 100)} %`)}
                  <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={calqueSel.zoom} onChange={(e) => majCalque(calqueSel.id, { zoom: e.target.checked })} className="accent-violet-500" /> Petit zoom sur le jeu</label>
                  <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={calqueSel.onde} onChange={(e) => majCalque(calqueSel.id, { onde: e.target.checked })} className="accent-violet-500" /> Onde au viseur (déplace-la sur l’aperçu)</label>
                </>
              )}
              {calqueSel.type === "barre" && <p className="text-xs text-ink-soft/80">La barre marque la séparation caméra / jeu : déplace-la sur l’aperçu, l’encart la suit.</p>}
              {calqueSel.type === "soustitres" && <p className="text-xs text-ink-soft/80">Les cartons se règlent dans l’onglet « Sous-titres » à gauche ; ici leur style.</p>}
            </div>
          ) : morceauSel ? (() => {
            const mid = mediaDe(morceauSel), photo = mediaParId.get(mid)?.type === "image", v = vitesse(morceauSel), maxi = dureeMax(morceauSel.media);
            return (
              <div className="space-y-3">
                <div><b className="block text-sm">{photo ? "📷 Photo" : "🎞️ Morceau de vidéo"}</b><span className="block truncate text-xs text-ink-soft">{nomMedia(mid)} · {duree(morceauSel).toFixed(2)} s à l’écran</span></div>
                {photo ? (
                  <>
                    {glisser("Durée", +(morceauSel.b - morceauSel.a).toFixed(1), 0.5, 20, 0.1, (x) => majMorceau(morceauSel.id, { b: morceauSel.a + x }, "duree-" + morceauSel.id), `${(morceauSel.b - morceauSel.a).toFixed(1)} s`)}
                    <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={Boolean(morceauSel.kb)} onChange={(e) => majMorceau(morceauSel.id, { kb: e.target.checked })} className="accent-violet-500" /> Zoom lent (effet « Ken Burns »)</label>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={etiquette}>Début (s)<input type="number" step={0.033} value={+morceauSel.a.toFixed(2)} onChange={(e) => majMorceau(morceauSel.id, { a: Math.max(0, Math.min(morceauSel.b - 0.1, +e.target.value)) }, "m-a-" + morceauSel.id)} className={`${champ} mt-1`} /></label>
                      <label className={etiquette}>Fin (s)<input type="number" step={0.033} value={+morceauSel.b.toFixed(2)} onChange={(e) => majMorceau(morceauSel.id, { b: Math.min(maxi, Math.max(morceauSel.a + 0.1, +e.target.value)) }, "m-b-" + morceauSel.id)} className={`${champ} mt-1`} /></label>
                    </div>
                    <div>
                      <span className={etiquette}>Vitesse : ×{+v.toFixed(2)}</span>
                      <div className="mt-1 flex flex-wrap gap-1">{VITESSES.map((x) => <button key={x} type="button" onClick={() => majMorceau(morceauSel.id, { v: x }, "vitesse-" + morceauSel.id)} className={puce(Math.abs(v - x) < 1e-3)}>×{x}</button>)}</div>
                      <input type="range" min={0.25} max={4} step={0.05} value={v} onChange={(e) => majMorceau(morceauSel.id, { v: +e.target.value }, "vitesse-" + morceauSel.id)} className={glissiere} />
                    </div>
                    <div className="rounded-xl bg-white/[0.03] p-2.5 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-ink"><input type="checkbox" checked={!morceauSel.muet} onChange={(e) => majMorceau(morceauSel.id, { muet: !e.target.checked })} className="accent-violet-500" /> Son du morceau</label>
                      {!morceauSel.muet && (
                        <>
                          {glisser("Volume", morceauSel.vol ?? 1, 0, 2, 0.05, (x) => majMorceau(morceauSel.id, { vol: x }, "vol-" + morceauSel.id), `${Math.round((morceauSel.vol ?? 1) * 100)} %`)}
                          <div className="grid grid-cols-2 gap-2">
                            {glisser("Fondu entrée", morceauSel.fE || 0, 0, 3, 0.1, (x) => majMorceau(morceauSel.id, { fE: x }, "fe-" + morceauSel.id), `${(morceauSel.fE || 0).toFixed(1)} s`)}
                            {glisser("Fondu sortie", morceauSel.fS || 0, 0, 3, 0.1, (x) => majMorceau(morceauSel.id, { fS: x }, "fs-" + morceauSel.id), `${(morceauSel.fS || 0).toFixed(1)} s`)}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
                {doc.morceaux.indexOf(morceauSel) > 0 && (
                  <div className="rounded-xl bg-white/[0.03] p-2.5 space-y-2">
                    <label className={etiquette}>Transition avec le morceau d’avant<select value={morceauSel.tr?.type || ""} onChange={(e) => majMorceau(morceauSel.id, { tr: e.target.value ? { type: e.target.value as TypeTransition, d: morceauSel.tr?.d || 0.4 } : undefined })} className={`${champ} mt-1`}>{TRANSITIONS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select></label>
                    {morceauSel.tr && glisser("Durée", morceauSel.tr.d, 0.15, 1.2, 0.05, (x) => majMorceau(morceauSel.id, { tr: { ...morceauSel.tr!, d: x } }, "tr-" + morceauSel.id), `${morceauSel.tr.d.toFixed(2)} s`)}
                    {morceauSel.tr && <button type="button" onClick={() => { const tr = morceauSel.tr!; setMorceaux((l) => l.map((m, i) => (i > 0 ? { ...m, tr: { ...tr } } : m))); }} className="text-xs text-lilac underline">Mettre cette transition à tous les raccords</button>}
                  </div>
                )}
                <button type="button" onClick={ouvrirRecadrage} className="flex w-full items-center gap-2 rounded-xl border border-violet/30 px-3 py-2 text-left text-sm hover:bg-violet/10"><Icone nom="recadrer" className="h-4 w-4 text-lilac" /> Recadrer{morceauSel.crop ? ` · ${morceauSel.crop.ratio && morceauSel.crop.ratio !== "libre" ? morceauSel.crop.ratio : "libre"}` : ""}</button>
                <label className={etiquette}>Cadrage<select value={morceauSel.cadre || (mid === PRINCIPAL ? "projet" : "ajuster")} onChange={(e) => majMorceau(morceauSel.id, { cadre: e.target.value as Cadre })} className={`${champ} mt-1`}>{CADRES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}</select></label>
                <div className="rounded-xl bg-white/[0.03] p-2.5 space-y-2">
                  <span className="block text-xs font-medium text-ink">Image</span>
                  {glisser("Luminosité", morceauSel.lum ?? 1, 0.4, 1.8, 0.02, (x) => majMorceau(morceauSel.id, { lum: x }, "lum-" + morceauSel.id), `${Math.round((morceauSel.lum ?? 1) * 100)} %`)}
                  {glisser("Contraste", morceauSel.con ?? 1, 0.5, 1.8, 0.02, (x) => majMorceau(morceauSel.id, { con: x }, "con-" + morceauSel.id), `${Math.round((morceauSel.con ?? 1) * 100)} %`)}
                  {glisser("Saturation", morceauSel.sat ?? 1, 0, 2, 0.02, (x) => majMorceau(morceauSel.id, { sat: x }, "sat-" + morceauSel.id), `${Math.round((morceauSel.sat ?? 1) * 100)} %`)}
                  {(morceauSel.lum ?? 1) !== 1 || (morceauSel.con ?? 1) !== 1 || (morceauSel.sat ?? 1) !== 1 ? <button type="button" onClick={() => majMorceau(morceauSel.id, { lum: 1, con: 1, sat: 1 })} className="text-xs text-lilac underline">Image d’origine</button> : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={diviser} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">✂️ Diviser à la tête</button>
                  <button type="button" onClick={dupliquer} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">Dupliquer</button>
                  <button type="button" onClick={supprimer} disabled={doc.morceaux.length <= 1} className="rounded-full border border-red-300/40 px-3 py-1.5 text-xs text-red-100 disabled:opacity-40">Supprimer</button>
                </div>
              </div>
            );
          })() : incrustSel ? (() => {
            const md = mediaParId.get(incrustSel.media), photo = md?.type === "image";
            return (
              <div className="space-y-3">
                <div><b className="block text-sm">▣ Incrustation</b><span className="block truncate text-xs text-ink-soft">{nomMedia(incrustSel.media)} · tire-la sur l’aperçu, poignée ronde pour la taille</span></div>
                <div className="grid grid-cols-2 gap-2">
                  <label className={etiquette}>Apparaît à (s)<input type="number" step={0.05} min={0} value={+incrustSel.debut.toFixed(2)} onChange={(e) => majIncrust(incrustSel.id, { debut: Math.max(0, +e.target.value) })} className={`${champ} mt-1`} /></label>
                  <label className={etiquette}>Durée (s)<input type="number" step={0.1} min={0.2} value={+duree(incrustSel).toFixed(2)} onChange={(e) => majIncrust(incrustSel.id, { b: Math.min(dureeMax(incrustSel.media), incrustSel.a + Math.max(0.2, +e.target.value) * vitesse(incrustSel)) })} className={`${champ} mt-1`} /></label>
                  <button type="button" onClick={() => majIncrust(incrustSel.id, { debut: +tM.toFixed(3) }, "tete-" + incrustSel.id)} className="col-span-2 rounded-lg border border-violet/30 px-2 py-1.5 text-xs text-ink-soft hover:bg-violet/10">⌖ Commencer à la tête de lecture</button>
                </div>
                <button type="button" onClick={ouvrirRecadrage} className="flex w-full items-center gap-2 rounded-xl border border-violet/30 px-3 py-2 text-left text-sm hover:bg-violet/10"><Icone nom="recadrer" className="h-4 w-4 text-lilac" /> Recadrer{incrustSel.crop ? ` · ${incrustSel.crop.ratio && incrustSel.crop.ratio !== "libre" ? incrustSel.crop.ratio : "libre"}` : ""}</button>
                {glisser("Taille", incrustSel.w, 0.08, 1.4, 0.01, (x) => majIncrust(incrustSel.id, { w: x }, "taille-" + incrustSel.id), `${Math.round(incrustSel.w * 100)} %`)}
                {glisser("Opacité", incrustSel.opacite, 0.1, 1, 0.02, (x) => majIncrust(incrustSel.id, { opacite: x }, "op-" + incrustSel.id), `${Math.round(incrustSel.opacite * 100)} %`)}
                <div>
                  <span className={etiquette}>Forme</span>
                  <div className="mt-1 flex flex-wrap gap-1">{([["rect", "Carrée"], ["arrondi", "Arrondie"], ["rond", "Ronde"]] as const).map(([f, t]) => <button key={f} type="button" onClick={() => majIncrust(incrustSel.id, { forme: f })} className={puce(incrustSel.forme === f)}>{t}</button>)}</div>
                </div>
                <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={incrustSel.contour} onChange={(e) => majIncrust(incrustSel.id, { contour: e.target.checked })} className="accent-violet-500" /> Contour blanc et ombre</label>
                <label className={etiquette}>Apparition<select value={incrustSel.anim} onChange={(e) => majIncrust(incrustSel.id, { anim: e.target.value as Incrust["anim"] })} className={`${champ} mt-1`}><option value="pop">Pop (rebond)</option><option value="fondu">Fondu</option><option value="aucune">Aucune</option></select></label>
                <div className="flex flex-wrap gap-1">
                  {([["Haut gauche", 0.27, 0.16], ["Haut droite", 0.73, 0.16], ["Centre", 0.5, 0.5], ["Bas gauche", 0.27, 0.8], ["Bas droite", 0.73, 0.8]] as const).map(([t, x, y]) => <button key={t} type="button" onClick={() => majIncrust(incrustSel.id, { x, y })} className={puce(false)}>{t}</button>)}
                </div>
                {!photo && (
                  <div className="rounded-xl bg-white/[0.03] p-2.5 space-y-2">
                    <label className="flex items-center gap-2 text-xs text-ink"><input type="checkbox" checked={!incrustSel.muet} onChange={(e) => majIncrust(incrustSel.id, { muet: !e.target.checked })} className="accent-violet-500" /> Son de l’incrustation</label>
                    {!incrustSel.muet && glisser("Volume", incrustSel.vol, 0, 2, 0.05, (x) => majIncrust(incrustSel.id, { vol: x }, "vol-" + incrustSel.id), `${Math.round(incrustSel.vol * 100)} %`)}
                    <div>
                      <span className={etiquette}>Vitesse : ×{+vitesse(incrustSel).toFixed(2)}</span>
                      <div className="mt-1 flex flex-wrap gap-1">{VITESSES.map((x) => <button key={x} type="button" onClick={() => majIncrust(incrustSel.id, { v: x })} className={puce(Math.abs(vitesse(incrustSel) - x) < 1e-3)}>×{x}</button>)}</div>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={diviser} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">✂️ Diviser à la tête</button>
                  <button type="button" onClick={dupliquer} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">Dupliquer</button>
                  <button type="button" onClick={supprimer} className="rounded-full border border-red-300/40 px-3 py-1.5 text-xs text-red-100">Supprimer</button>
                </div>
              </div>
            );
          })() : sonSel ? (
            <div className="space-y-3">
              <div><b className="block text-sm">🎵 Son</b><span className="block truncate text-xs text-ink-soft">{nomMedia(sonSel.media)} · {duree(sonSel).toFixed(1)} s</span></div>
              {glisser("Volume", sonSel.vol, 0, 2, 0.05, (x) => majSon(sonSel.id, { vol: x }, "vol-" + sonSel.id), `${Math.round(sonSel.vol * 100)} %`)}
              <div className="grid grid-cols-2 gap-2">
                {glisser("Fondu entrée", sonSel.fE, 0, 5, 0.1, (x) => majSon(sonSel.id, { fE: x }, "fe-" + sonSel.id), `${sonSel.fE.toFixed(1)} s`)}
                {glisser("Fondu sortie", sonSel.fS, 0, 5, 0.1, (x) => majSon(sonSel.id, { fS: x }, "fs-" + sonSel.id), `${sonSel.fS.toFixed(1)} s`)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className={etiquette}>Commence à (s)<input type="number" step={0.05} min={0} value={+sonSel.debut.toFixed(2)} onChange={(e) => majSon(sonSel.id, { debut: Math.max(0, +e.target.value) })} className={`${champ} mt-1`} /></label>
                <label className={etiquette}>Départ dans le son (s)<input type="number" step={0.1} min={0} value={+sonSel.a.toFixed(2)} onChange={(e) => majSon(sonSel.id, { a: Math.max(0, Math.min(sonSel.b - 0.2, +e.target.value)) })} className={`${champ} mt-1`} /></label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => majSon(sonSel.id, { debut: +tM.toFixed(3) }, "tete-" + sonSel.id)} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">⌖ À la tête de lecture</button>
                <button type="button" onClick={() => majSon(sonSel.id, { b: Math.min(dureeMax(sonSel.media), sonSel.a + Math.max(0.2, total - sonSel.debut) * vitesse(sonSel)) })} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">⇥ Jusqu’à la fin de la vidéo</button>
              </div>
              <button type="button" onClick={() => setMorceaux((l) => l.map((m) => ({ ...m, vol: Math.min(m.vol ?? 1, 0.35) })))} className="w-full rounded-xl border border-white/10 px-3 py-2 text-left text-xs text-ink-soft hover:bg-white/5">🔉 Baisser le son de la vidéo (35 %) pour entendre la musique</button>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={diviser} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">✂️ Diviser à la tête</button>
                <button type="button" onClick={dupliquer} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">Dupliquer</button>
                <button type="button" onClick={supprimer} className="rounded-full border border-red-300/40 px-3 py-1.5 text-xs text-red-100">Supprimer</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <b className="block text-sm">Vidéo</b>
              <div className="grid grid-cols-2 gap-1.5">
                {DISPOS.map((d) => (
                  <button key={d.valeur} type="button" onClick={() => maj("dispo", d.valeur, "dispo")} className={`rounded-xl border px-2.5 py-2 text-left text-xs transition-all ${doc.dispo === d.valeur ? "border-violet-light bg-violet/20" : "border-white/10 text-ink-soft hover:bg-white/5"}`}>
                    <span className="flex items-center gap-1.5 font-medium text-ink"><Icone nom={d.icone} className="h-4 w-4 text-lilac" />{d.label}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-soft/70">{d.aide}</span>
                  </button>
                ))}
              </div>
              {doc.dispo !== "floute" && doc.dispo !== "vertical" && glisser("Cadrage (gauche ↔ droite)", doc.focusX, 0, 1, 0.01, (v) => maj("focusX", v), `${Math.round(doc.focusX * 100)} %`)}
              {doc.dispo !== "floute" && doc.dispo !== "vertical" && glisser("Zoom", doc.zoom, 1, 2.5, 0.05, (v) => maj("zoom", v), `×${doc.zoom.toFixed(2)}`)}
              {doc.dispo === "facecam" && (
                <>
                  {glisser("Caméra : horizontal", doc.cam.x, 0, 1, 0.01, (v) => maj("cam", { ...doc.cam, x: v }), `${Math.round(doc.cam.x * 100)} %`)}
                  {glisser("Caméra : vertical", doc.cam.y, 0, 1, 0.01, (v) => maj("cam", { ...doc.cam, y: v }), `${Math.round(doc.cam.y * 100)} %`)}
                  {glisser("Caméra : taille", doc.cam.taille, 0.12, 0.6, 0.01, (v) => maj("cam", { ...doc.cam, taille: v }), `${Math.round(doc.cam.taille * 100)} %`)}
                </>
              )}
              <div className="rounded-xl bg-white/[0.03] p-2.5 space-y-2">
                <span className="block text-xs font-medium text-ink">Son de la piste vidéo</span>
                {glisser("Volume de tous les morceaux", doc.morceaux[0]?.vol ?? 1, 0, 2, 0.05, (v) => setMorceaux((l) => l.map((m) => ({ ...m, vol: v })), "vol-tous"), `${Math.round((doc.morceaux[0]?.vol ?? 1) * 100)} %`)}
              </div>
              <p className="text-xs text-ink-soft/70">Touche un élément sur l’aperçu ou la timeline pour le régler ici.</p>
            </div>
          )}
        </section>
      </div>

      {/* ── outils + timeline ── */}
      <div className="flex min-h-0 flex-1 flex-col border-t border-white/10 bg-[#0d0818]">
        <div className="flex h-12 shrink-0 items-center gap-1 overflow-x-auto border-b border-white/10 px-2">
          <button type="button" onClick={() => setOutil("selection")} className={btnOutil(outil === "selection")} title="Sélection (A)"><Icone nom="selection" className="h-5 w-5" /></button>
          <button type="button" onClick={() => setOutil(outil === "lame" ? "selection" : "lame")} className={btnOutil(outil === "lame")} title="Lame : touche la vidéo pour la couper à cet endroit"><Icone nom="ciseaux" className="h-5 w-5" /><span className="hidden xl:inline text-xs">Lame</span></button>
          <span className="mx-1 h-6 w-px bg-white/10" />
          <button type="button" onClick={annuler} disabled={!peutAnnuler} className={btnOutil()} title="Annuler (⌘/Ctrl Z)"><Icone nom="annuler" className="h-5 w-5" /></button>
          <button type="button" onClick={retablir} disabled={!peutRetablir} className={btnOutil()} title="Rétablir"><Icone nom="retablir" className="h-5 w-5" /></button>
          <span className="mx-1 h-6 w-px bg-white/10" />
          <button type="button" onClick={diviser} className={btnOutil()} title="Diviser à la tête de lecture (S)"><Icone nom="ciseaux" className="h-5 w-5" /><span className="text-xs">Diviser</span></button>
          <button type="button" onClick={copier} disabled={!sel} className={btnOutil()} title="Copier (⌘/Ctrl C)"><Icone nom="copier" className="h-5 w-5" /></button>
          <button type="button" onClick={coller} className={btnOutil()} title="Coller à la tête de lecture (⌘/Ctrl V)"><Icone nom="coller" className="h-5 w-5" /></button>
          <button type="button" onClick={dupliquer} disabled={!sel} className={btnOutil()} title="Dupliquer (⌘/Ctrl D)"><Icone nom="dupliquer" className="h-5 w-5" /></button>
          <button type="button" onClick={supprimer} disabled={!sel || (sel.type === "morceau" && doc.morceaux.length <= 1)} className={btnOutil()} title="Supprimer (Suppr)"><Icone nom="corbeille" className="h-5 w-5" /></button>
          <button type="button" onClick={ouvrirRecadrage} disabled={!pret} className={btnOutil()} title="Recadrer le morceau ou l’incrustation (C)"><Icone nom="recadrer" className="h-5 w-5" /><span className="text-xs">Recadrer</span></button>
          <span className="mx-1 h-6 w-px bg-white/10" />
          <button type="button" onClick={ajouterTexte} className={btnOutil()} title="Texte à la tête de lecture"><Icone nom="lettres" className="h-5 w-5" /><span className="text-xs">Texte</span></button>
          <button type="button" onClick={ajouterFlash} className={btnOutil()} title="Flash de kill à la tête de lecture"><Icone nom="eclair" className="h-5 w-5" /><span className="text-xs">Flash</span></button>
          <button type="button" onClick={() => setOnglet("audios")} className={btnOutil(onglet === "audios")} title="Ajouter un son ou une musique"><Icone nom="note" className="h-5 w-5" /><span className="hidden xl:inline text-xs">Son</span></button>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => setAimant((x) => !x)} className={btnOutil(aimant)} title="Aimant : les éléments se collent à la tête de lecture et aux autres éléments" aria-pressed={aimant}><Icone nom="aimant" className="h-5 w-5" /></button>
            <button type="button" onClick={() => setZoomTl((z) => Math.max(8, z / 1.4))} className={btnOutil()} aria-label="Dézoomer la timeline"><Icone nom="loupeMoins" className="h-5 w-5" /></button>
            <input type="range" min={8} max={400} value={zoomTl} onChange={(e) => setZoomTl(+e.target.value)} className="w-28 accent-violet-500" aria-label="Zoom de la timeline" />
            <button type="button" onClick={() => setZoomTl((z) => Math.min(600, z * 1.4))} className={btnOutil()} aria-label="Zoomer la timeline"><Icone nom="loupePlus" className="h-5 w-5" /></button>
            <button type="button" onClick={() => { const w = (typeof window !== "undefined" ? window.innerWidth : 1000) - 180; setZoomTl(Math.max(8, Math.min(600, w / total))); }} className={btnOutil()} title="Toute la vidéo">⤢</button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          {pret && (
            <TimelineMontage dureeSource={dureeSource} morceaux={doc.morceaux} calques={habille ? doc.calques : doc.calques.filter((c) => c.type === "texte" || c.type === "flash")} sousTitres={doc.sousTitres} t={tM} sel={sel} setSel={setSel} outil={outil}
              setMorceaux={setMorceaux} setCalques={setCalques} finGeste={couperGeste} onSeek={(r) => { arreter(); allerA(r); }} onCouperA={couperA}
              medias={doc.medias} incrustations={doc.incrustations} sons={doc.sons} setIncrust={setIncrust} setSons={setSons} dureeMax={dureeMax}
              pellicules={apercus.pellicules} ondes={apercus.ondes} zoom={zoomTl} setZoom={setZoomTl} aimant={aimant}
              onTransition={(k) => { const m = doc.morceaux[k]; if (m) { setSel({ type: "morceau", id: m.id }); if (!m.tr) majMorceau(m.id, { tr: { type: "fondu", d: 0.4 } }); } }} />
          )}
        </div>
      </div>

      {recadrage && <Recadrage key={recadre?.id} titre={recadrage.titre} el={recadrage.el} w={recadrage.w} h={recadrage.h} depart={recadrage.depart} onFermer={() => setRecadre(null)} onAppliquer={(cr) => { recadrage.appliquer(cr); couperGeste(); setRecadre(null); }} />}

      {/* ── quitter sans enregistrer ? ── */}
      {quitter && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-violet/30 bg-[#1a1033] p-5 shadow-2xl">
            <p className="text-lg font-semibold">Enregistrer avant de quitter ?</p>
            <p className="mt-1 text-sm text-ink-soft">Tu as des modifications pas encore enregistrées dans « {nom} ».</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setQuitter(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm">Rester</button>
              <button type="button" onClick={() => { setQuitter(false); fermer(false); }} className="rounded-full border border-red-300/40 px-4 py-2 text-sm text-red-100">Quitter sans enregistrer</button>
              <button type="button" onClick={() => { setQuitter(false); fermer(true); }} className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white">Enregistrer et quitter</button>
            </div>
          </div>
        </div>
      )}

      {/* ── télécharger (export) ── */}
      {panneauExport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-violet/30 bg-[#150d28] p-5 shadow-2xl">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold">Télécharger la vidéo</p>
              <button type="button" onClick={() => export_.etat !== "en-cours" && setPanneauExport(false)} disabled={export_.etat === "en-cours"} className="ml-auto rounded-full p-2 hover:bg-white/10 disabled:opacity-40" aria-label="Fermer"><Icone nom="fermer" className="h-5 w-5" /></button>
            </div>
            <p className="mt-1 text-sm text-ink-soft">MP4 vertical 1080×1920 · {fmtLong(total)}{habille && doc.ending ? " + cinématique de fin" : ""}. Garde l’onglet ouvert pendant la création ; à la fin, la vidéo se télécharge toute seule.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={exporter} disabled={export_.etat === "en-cours" || !pret} className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm hover:bg-violet-light disabled:opacity-50">
                <Icone nom="clap" className="h-4 w-4" /> {export_.etat === "en-cours" ? `Création… ${Math.round(export_.progres * 100)} %` : export_.etat === "fini" ? "Recréer la vidéo" : "Créer et télécharger"}
              </button>
              {export_.etat === "en-cours" && export_.etape && <span className="text-xs text-ink-soft">{export_.etape}{export_.debut && export_.progres > 0.04 ? ` · encore ≈ ${Math.max(1, Math.round(((Date.now() - export_.debut) * (1 - export_.progres)) / export_.progres / 60000))} min` : ""}</span>}
            </div>
            {export_.etat === "en-cours" && <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-violet transition-all" style={{ width: `${Math.round(export_.progres * 100)}%` }} /></div>}
            {export_.etat === "erreur" && <p className="mt-3 text-sm text-red-300" role="alert">{export_.message}</p>}
            {export_.etat === "fini" && export_.url && (
              <div className="mt-4 flex flex-wrap gap-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
                <video src={export_.url} controls playsInline className="h-56 rounded-xl bg-black" />
                <div className="min-w-[240px] flex-1 space-y-2">
                  <p className="text-sm text-emerald-100">Ta vidéo est prête ({export_.ext?.toUpperCase()}) !</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={export_.url} download={`${(nom || "clip-cycylive").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${export_.ext}`} className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white">Télécharger</a>
                    <button type="button" onClick={ajouterVideotheque} disabled={vt.etat === "envoi" || vt.etat === "ok"} className="rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{vt.etat === "envoi" ? `Ajout… ${vt.pct} %` : vt.etat === "ok" ? "✓ Dans ta vidéothèque" : "📼 Ajouter à la vidéothèque"}</button>
                    <button type="button" onClick={partager} className="rounded-full border border-violet/30 px-4 py-2 text-sm text-ink-soft">Partager</button>
                  </div>
                  {vt.etat === "ok" && <p className="text-xs text-emerald-100">Elle t’attend dans Studio créatrice → Vidéothèque, prête à planifier. {vt.message}</p>}
                  {vt.etat === "erreur" && <p className="text-xs text-red-300">{vt.message}</p>}
                  {export_.mode && <p className={`text-xs ${export_.mode.startsWith("✓") ? "text-emerald-300/90" : "text-amber-200/90"}`}>{export_.mode}</p>}
                </div>
              </div>
            )}
            <p className="mt-5 mb-2 text-sm font-semibold">Textes prêts à copier</p>
            <div className="grid gap-2 md:grid-cols-2">
              {textes.map((t) => (
                <div key={t.plateforme} className="rounded-xl border border-violet/15 bg-white/[0.02] p-3">
                  <div className="mb-1 flex items-center justify-between"><span className="text-sm font-medium">{t.plateforme}</span><button type="button" onClick={() => copierTexte(t.texte, t.plateforme)} className="text-xs text-lilac underline">{copie === t.plateforme ? "Copié ✓" : "Copier"}</button></div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-ink-soft">{t.texte}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
