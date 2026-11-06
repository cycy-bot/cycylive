"use client";

// Générateur de contenus à partir d'un clip : vidéo verticale (TikTok / Reels / Shorts) avec cadrage,
// coupe, titre et sous-titres dans la DA Cycylive, miniature YouTube, story « nouveau clip », et textes
// prêts à copier. Tout est calculé dans le navigateur (canvas + MediaRecorder) : la vidéo ne quitte
// jamais l'ordinateur ou le téléphone, et la publication reste entièrement entre les mains de Cycy.
import { useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { liens } from "@/data/liens";
import TimelineHabillage from "@/components/admin/TimelineHabillage";
import { integre, ORIGINES_INTERFACE } from "@/components/admin/useEtatAdmin";
import { exporterMp4, webcodecsDispo } from "@/lib/mp4Export";
import { enregistrerBrouillon, lireEtatBrouillon, lireFichierBrouillon, listerBrouillons, supprimerBrouillon, surEnvoi, type BrouillonInfo, type EtatEnvoi } from "@/lib/brouillonsMontage";
import { calquesDepuisModele, dessinerCalques, dessinerVideo, MODELE_DEFAUT, modeleDepuisCalques, type Calque, type Modele } from "@/lib/habillageTikTok";

type ClipTwitch = { id: string; titre: string; url: string; miniature: string; vues: number; duree: number; date: string; jeu: string };
type Disposition = "vertical" | "recadre" | "floute" | "facecam";
const CLE_MODELE = "cycy-modele-tiktok";
const ENDING = "/videos/ending-cycylive.mp4";
type SousTitre = { id: string; debut: number; fin: number; texte: string };

const W = 1080, H = 1920;
const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";
const DISPOS: { valeur: Disposition; label: string; aide: string; icone: NomIcone }[] = [
  { valeur: "vertical", label: "Déjà verticale", aide: "Ta vidéo est déjà en 9:16 : on l’habille", icone: "smartphone" },
  { valeur: "floute", label: "Fond flouté", aide: "Le clip entier au centre, titre au-dessus", icone: "ecran" },
  { valeur: "recadre", label: "Recadré plein écran", aide: "Zoom sur l’action, en vertical", icone: "smartphone" },
  { valeur: "facecam", label: "Caméra + jeu", aide: "Ta caméra en haut, le jeu en bas", icone: "camera" },
];

const id = () => Math.random().toString(36).slice(2, 9);
const dans = (b: { x: number; y: number; w: number; h: number }, p: { x: number; y: number }) => p.x >= b.x - 20 && p.x <= b.x + b.w + 20 && p.y >= b.y - 20 && p.y <= b.y + b.h + 20;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}.${Math.floor((s % 1) * 10)}`;

function lignes(ctx: CanvasRenderingContext2D, texte: string, largeur: number) {
  const out: string[] = [];
  let l = "";
  for (const mot of texte.split(/\s+/).filter(Boolean)) {
    const essai = l ? `${l} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeur && l) { out.push(l); l = mot; } else l = essai;
  }
  if (l) out.push(l);
  return out;
}

function texteContour(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, taille: number, police: string, max: number, maxLignes = 2, couleur = "#fff") {
  ctx.font = `800 ${taille}px ${police}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  const ls = lignes(ctx, texte, max).slice(0, maxLignes);
  ls.forEach((l, i) => {
    const yy = y + (i - (ls.length - 1) / 2) * taille * 1.12;
    ctx.lineWidth = taille * 0.2;
    ctx.strokeStyle = "rgba(24,10,48,.92)";
    ctx.strokeText(l, x, yy);
    ctx.fillStyle = couleur;
    ctx.fillText(l, x, yy);
  });
}

// Mots-clés → hashtags
function hashtags(jeu: string) {
  const j = jeu.toLowerCase();
  const base = ["#twitchfr", "#streameuse", "#clip", "#gaming", "#cycylive"];
  if (j.includes("valorant")) return ["#valorant", "#valorantclips", "#valorantfr", "#fps", ...base];
  if (j.includes("pal")) return ["#palworld", "#palworldfr", ...base];
  if (/horr|phasmo|lethal|dead/.test(j)) return ["#horreur", "#jeudhorreur", "#peur", ...base];
  if (j.includes("minecraft")) return ["#minecraft", "#minecraftfr", ...base];
  return jeu ? [`#${jeu.replace(/[^a-z0-9]/gi, "").toLowerCase()}`, ...base] : base;
}

export default function GenerateurContenus() {
  const [clips, setClips] = useState<ClipTwitch[]>([]);
  const [clipChoisi, setClipChoisi] = useState<ClipTwitch | null>(null);
  const [fichier, setFichier] = useState<string>("");
  const [nomFichier, setNomFichier] = useState("");
  const [duree, setDuree] = useState(0);
  const [debut, setDebut] = useState(0);
  const [fin, setFin] = useState(0);
  const [dispo, setDispo] = useState<Disposition>("vertical");
  const [modele, setModele] = useState<Modele>(MODELE_DEFAUT);
  const [calques, setCalques] = useState<Calque[]>([]);
  const [sel, setSel] = useState("");
  const [tCur, setTCur] = useState(0);
  const [enLecture, setEnLecture] = useState(false);
  const [voirFin, setVoirFin] = useState(false);
  const [focusX, setFocusX] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [cam, setCam] = useState({ x: 0.02, y: 0.02, taille: 0.3 });
  const [titre, setTitre] = useState("");
  const [jeu, setJeu] = useState("");
  const [sousTitres, setSousTitres] = useState<SousTitre[]>([]);
  const [transcription, setTranscription] = useState("");
  const [export_, setExport] = useState<{ etat: "repos" | "en-cours" | "fini" | "erreur"; progres: number; url?: string; ext?: string; message?: string; mode?: string }>({ etat: "repos", progres: 0 });
  const ctxDebloque = useRef<AudioContext | null>(null); // son « débloqué » pendant le clic (Safari refuse de le lancer plus tard)
  const [copie, setCopie] = useState("");
  // « Ajouter à la vidéothèque » (Studio créatrice de CycyBot)
  const [vt, setVt] = useState<{ titre: string; desc: string; tags: string[]; etat: "repos" | "envoi" | "ok" | "erreur"; pct: number; message?: string }>({ titre: "", desc: "", tags: [], etat: "repos", pct: 0 });
  const [nouveauTag, setNouveauTag] = useState("");
  // Brouillons : reprendre un montage plus tard (clip + réglages gardés dans le navigateur)
  const [brouillons, setBrouillons] = useState<BrouillonInfo[]>([]);
  const [brouillonId, setBrouillonId] = useState("");
  const [envoiClip, setEnvoiClip] = useState<EtatEnvoi | null>(null); // envoi du clip en ligne
  const [attenteClip, setAttenteClip] = useState<BrouillonInfo | null>(null); // brouillon repris dont le clip est resté sur l'autre appareil
  const reprendreApres = useRef<BrouillonInfo | null>(null);
  const [brEtat, setBrEtat] = useState<{ etat: "repos" | "enreg" | "ok" | "erreur"; maj?: number; message?: string; enLigne?: boolean }>({ etat: "repos" });
  const fichierBlob = useRef<Blob | null>(null);
  const fichierEnregistre = useRef("");
  const restauration = useRef<Record<string, any> | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const restaure = useRef(false);
  const [polices, setPolices] = useState({ display: "system-ui, sans-serif", sans: "system-ui, sans-serif" });

  const video = useRef<HTMLVideoElement>(null);
  const apercu = useRef<HTMLCanvasElement>(null);
  const audio = useRef<{ ctx: AudioContext; dest: MediaStreamAudioDestinationNode; gain: GainNode; principal: GainNode; finGain: GainNode | null } | null>(null);
  const finVideo = useRef<HTMLVideoElement>(null);
  const zones = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const dernierT = useRef(0);
  const rafRef = useRef(0);
  const etat = useRef({ dispo, focusX, zoom, cam, titre, sousTitres, polices, calques, debut, fin, sel });
  etat.current = { dispo, focusX, zoom, cam, titre, sousTitres, polices, calques, debut, fin, sel };
  const habille = dispo === "vertical" || dispo === "facecam";

  useEffect(() => {
    fetch("/api/clips-recents").then((r) => r.json()).then((d) => setClips(d.clips || [])).catch(() => {});
    const sonde = (c: string) => { const s = document.createElement("span"); s.className = c; document.body.appendChild(s); const f = getComputedStyle(s).fontFamily; s.remove(); return f; };
    setPolices({ display: `${sonde("font-display")}, system-ui, sans-serif`, sans: `${sonde("font-sans")}, system-ui, sans-serif` });
    // polices du thème des TikToks (Anton, Barlow Condensed, Barlow)
    for (const [nom, f] of [["CyAnton", "Anton-Regular.ttf"], ["CyBarlowC", "BarlowCondensed-Bold.ttf"], ["CyBarlow", "Barlow-SemiBold.ttf"]]) {
      new FontFace(nom, `url(/fonts/${f})`).load().then((x) => document.fonts.add(x)).catch(() => {});
    }
    try { const m = JSON.parse(localStorage.getItem(CLE_MODELE) || "null"); if (m) setModele({ ...MODELE_DEFAUT, ...m }); } catch { /* modèle d’origine */ }
    listerBrouillons().then(setBrouillons).catch(() => {});
    const fin = surEnvoi((e) => {
      setEnvoiClip(e);
      if (e.fini) { setBrouillons((l) => l.map((b) => (b.id === e.id ? { ...b, clipEnLigne: true, ligne: "partout" } : b))); setTimeout(() => setEnvoiClip((x) => (x && x.id === e.id && x.fini ? null : x)), 4000); }
    });
    // revenir sur l'onglet : les brouillons faits entre-temps sur un autre appareil apparaissent
    const vu = () => { if (document.visibilityState === "visible") listerBrouillons().then(setBrouillons).catch(() => {}); };
    document.addEventListener("visibilitychange", vu);
    return () => { fin(); document.removeEventListener("visibilitychange", vu); };
  }, []);

  // ── Habillage : le modèle (positions, durées, animations, textes fixes) est gardé pour les prochaines vidéos ──
  const total = Math.max(0.5, (fin || duree) - debut);
  useEffect(() => {
    if (!calques.length) return;
    const m = modeleDepuisCalques(calques, total, modele.ending);
    try { localStorage.setItem(CLE_MODELE, JSON.stringify(m)); } catch { /* navigation privée */ }
    const carte = calques.find((c) => c.type === "carte");
    if (carte && carte.texte !== titre) setTitre(carte.texte);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calques, modele.ending]);
  useEffect(() => { try { const m = JSON.parse(localStorage.getItem(CLE_MODELE) || "{}"); localStorage.setItem(CLE_MODELE, JSON.stringify({ ...m, ending: modele.ending })); } catch { /* rien */ } }, [modele.ending]);
  // la coupe change : les éléments « toute la vidéo » suivent, l'étiquette de fin reste collée à la fin
  useEffect(() => {
    setCalques((l) => l.map((c) => {
      if (c.type === "barre" || c.type === "encart" || c.type === "soustitres") return { ...c, debut: 0, fin: total };
      if (c.type === "etiquette") { const len = Math.min(total, Math.max(0.5, c.fin - c.debut)); return { ...c, debut: total - len, fin: total }; }
      return { ...c, debut: Math.min(c.debut, Math.max(0, total - 0.3)), fin: Math.min(c.fin, total) };
    }));
  }, [total]);
  function majTitre(t: string) {
    setTitre(t);
    setCalques((l) => l.map((c) => (c.type === "carte" ? { ...c, texte: t } : c)));
  }
  function aller(tRel: number) {
    const v = video.current; if (!v) return;
    v.currentTime = Math.max(debut, Math.min((fin || duree), debut + tRel));
    setTCur(Math.max(0, tRel));
  }
  function lectureOuPause() {
    const v = video.current; if (!v) return;
    if (v.paused) { if (v.currentTime >= (fin || duree) - 0.05) v.currentTime = debut; v.play(); } else v.pause();
  }
  // Repère la ligne de séparation caméra / jeu : la ligne horizontale la plus marquée entre 25 et 55 % de la hauteur
  function detecterSeparation() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = 108; c.height = 192;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    const vw = v.videoWidth, vh = v.videoHeight, s = Math.max(108 / vw, 192 / vh);
    g.drawImage(v, (108 - vw * s) / 2, (192 - vh * s) / 2, vw * s, vh * s);
    const d = g.getImageData(0, 0, 108, 192).data;
    const lum = (x: number, y: number) => { const i = (y * 108 + x) * 4; return d[i] + d[i + 1] + d[i + 2]; };
    let best = 73, score = -1;
    for (let y = 52; y < 102; y++) { let n = 0; for (let x = 0; x < 108; x++) n += Math.abs(lum(x, y + 1) - lum(x, y - 1)); if (n > score) { score = n; best = y; } }
    // image pas encore décodée (noire) ou pas de séparation nette : on garde la position actuelle
    if (score < 108 * 40) return false;
    const sep = best / 192;
    setCalques((l) => l.map((c) => (c.type === "barre" ? { ...c, y: sep } : c)));
    return true;
  }
  // Aperçu : attraper un élément pour le déplacer
  function saisirApercu(e: React.PointerEvent<HTMLCanvasElement>) {
    const cv = e.currentTarget, r = cv.getBoundingClientRect();
    const px = (cx: number, cy: number) => ({ x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H });
    const p = px(e.clientX, e.clientY);
    const ordre = [...etat.current.calques].reverse();
    let cible = ordre.find((c) => c.id === etat.current.sel && zones.current[c.id] && dans(zones.current[c.id], p));
    if (!cible) cible = ordre.find((c) => zones.current[c.id] && dans(zones.current[c.id], p));
    if (!cible) { setSel(""); return; }
    setSel(cible.id);
    const c0 = cible, y0 = c0.type === "encart" && c0.lie ? (etat.current.calques.find((x) => x.type === "barre")?.y ?? c0.y) : c0.y, x0 = c0.x;
    cv.setPointerCapture(e.pointerId);
    const bouger = (ev: PointerEvent) => {
      const q = px(ev.clientX, ev.clientY), dy = (q.y - p.y) / H, dx = (q.x - p.x) / W;
      const ny = Math.max(0.03, Math.min(0.97, y0 + dy)), nx = Math.max(0.05, Math.min(0.95, x0 + dx));
      setCalques((l) => l.map((c) => {
        if (c0.type === "encart" && c0.lie) return c.type === "barre" ? { ...c, y: ny } : c;
        if (c.id !== c0.id) return c;
        return c.type === "flash" || c.type === "texte" || c.type === "etiquette" || c.type === "carte" ? { ...c, y: ny, x: nx } : { ...c, y: ny };
      }));
    };
    const lacher = () => { cv.removeEventListener("pointermove", bouger); cv.removeEventListener("pointerup", lacher); };
    cv.addEventListener("pointermove", bouger); cv.addEventListener("pointerup", lacher);
  }

  // ── Dessin d'une image (aperçu et export) ──
  function dessiner(ctx: CanvasRenderingContext2D, v: HTMLVideoElement, t: number, apercu = false) {
    const e = etat.current;
    const vw = v.videoWidth || 1920, vh = v.videoHeight || 1080;
    ctx.fillStyle = "#0d0a17";
    ctx.fillRect(0, 0, W, H);
    const rel = t - e.debut, duree_ = Math.max(0.5, (e.fin || v.duration || 1) - e.debut);
    if (e.dispo === "vertical") {
      dessinerVideo(ctx, v, rel, e.calques);
    } else if (e.dispo === "floute") {
      const s = Math.max(W / vw, H / vh);
      ctx.save();
      ctx.filter = "blur(36px) brightness(.55) saturate(1.2)";
      ctx.drawImage(v, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);
      ctx.restore();
      const fh = (W * vh) / vw;
      const y = (H - fh) / 2 + 60;
      ctx.save();
      ctx.shadowColor = "rgba(161,92,255,.6)";
      ctx.shadowBlur = 40;
      ctx.drawImage(v, 0, y, W, fh);
      ctx.restore();
      if (e.titre) texteContour(ctx, e.titre, W / 2, y - 150, 76, e.polices.display, W - 120, 2);
    } else if (e.dispo === "recadre") {
      const sh = vh / e.zoom, sw = (sh * W) / H;
      const sx = Math.max(0, Math.min(vw - sw, (vw - sw) * e.focusX));
      const sy = (vh - sh) / 2;
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, 420);
      g.addColorStop(0, "rgba(13,10,23,.75)");
      g.addColorStop(1, "rgba(13,10,23,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, 420);
      if (e.titre) texteContour(ctx, e.titre, W / 2, 220, 72, e.polices.display, W - 120, 2);
    } else {
      // Caméra (en haut, 38 %) + jeu (en bas)
      const hautH = Math.round(H * 0.38);
      const cw = vw * e.cam.taille, ch = (cw * hautH) / W;
      const cx = Math.max(0, Math.min(vw - cw, vw * e.cam.x)), cy = Math.max(0, Math.min(vh - ch, vh * e.cam.y));
      ctx.drawImage(v, cx, cy, cw, ch, 0, 0, W, hautH);
      const basH = H - hautH;
      const sh = vh / e.zoom, sw = Math.min(vw, (sh * W) / basH);
      const sx = Math.max(0, Math.min(vw - sw, (vw - sw) * e.focusX));
      ctx.drawImage(v, sx, (vh - sh) / 2, sw, sh, 0, hautH, W, basH);
      ctx.fillStyle = "#b57cff";
      ctx.fillRect(0, hautH - 4, W, 8);
    }
    if (e.dispo === "vertical" || e.dispo === "facecam") {
      zones.current = dessinerCalques(ctx, rel, duree_, e.calques, e.sousTitres, e.debut);
      // repère du calque choisi (aperçu seulement)
      const z = apercu && e.sel ? zones.current[e.sel] : null;
      if (z) { ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,170,235,.95)"; ctx.strokeRect(z.x - 8, z.y - 8, z.w + 16, z.h + 16); ctx.restore(); }
      return;
    }
    // Sous-titres
    const st = e.sousTitres.find((x) => t >= x.debut && t < x.fin);
    if (st?.texte) texteContour(ctx, st.texte.toUpperCase(), W / 2, H * 0.72, 70, e.polices.display, W - 140, 2, "#ffffff");
    // Signature
    ctx.font = `600 34px ${e.polices.sans}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.fillText(`twitch.tv/${chaine}`, W / 2, H - 120);
  }

  // Boucle d'aperçu
  useEffect(() => {
    const boucle = () => {
      // pendant la création, l'aperçu et la timeline se mettent en pause : tout le temps de calcul va à la vidéo exportée (plus fluide)
      if (export_.etat === "en-cours") { rafRef.current = requestAnimationFrame(boucle); return; }
      const v = video.current, c = apercu.current?.getContext("2d");
      if (v && c && v.readyState >= 2) dessiner(c, v, v.currentTime, true);
      if (v && Math.abs(v.currentTime - dernierT.current) > 0.03) { dernierT.current = v.currentTime; setTCur(Math.max(0, v.currentTime - debut)); }
      if (v && fin && v.currentTime >= fin && !v.paused) { v.currentTime = debut; }
      rafRef.current = requestAnimationFrame(boucle);
    };
    rafRef.current = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fichier, debut, fin, export_.etat]);

  function charger(f: File) {
    // clip réimporté pour un brouillon fait sur un autre appareil : on reprend son montage avec ce fichier
    if (reprendreApres.current) {
      const b = reprendreApres.current; reprendreApres.current = null; setAttenteClip(null);
      f.arrayBuffer().then((buf) => appliquerBrouillon(b, new Blob([buf], { type: f.type || "video/mp4" }), true)).catch(() => setBrEtat({ etat: "erreur", message: "Ce fichier est illisible." }));
      return;
    }
    if (fichier) URL.revokeObjectURL(fichier);
    fichierBlob.current = f; fichierEnregistre.current = ""; restauration.current = null;
    // copie en mémoire tout de suite : sur iPhone/iPad, le fichier de la galerie est temporaire
    f.arrayBuffer().then((b) => { if (fichierBlob.current === f) fichierBlob.current = new Blob([b], { type: f.type || "video/mp4" }); }).catch(() => {});
    setBrouillonId(""); setBrEtat({ etat: "repos" });
    setFichier(URL.createObjectURL(f));
    setNomFichier(f.name);
    setExport({ etat: "repos", progres: 0 });
    setSousTitres([]);
    setCalques([]); setSel("");
  }

  // ── Brouillons ──
  const etatMontage = () => ({ titre, jeu, dispo, focusX, zoom, cam, sousTitres, transcription, debut, fin, calques, modele, clipChoisi, duree });
  function miniatureApercu() {
    try {
      const src = apercu.current; if (!src) return "";
      const c = document.createElement("canvas"); c.width = 180; c.height = 320;
      c.getContext("2d")!.drawImage(src, 0, 0, 180, 320);
      return c.toDataURL("image/jpeg", 0.72);
    } catch { return ""; }
  }
  async function enregistrerEnBrouillon(auto = false) {
    if (!fichierBlob.current || restauration.current) return;
    const bid = brouillonId || id() + id();
    setBrEtat((x) => ({ ...x, etat: "enreg" }));
    try {
      const ancien = brouillons.find((b) => b.id === bid);
      const info: BrouillonInfo = { id: bid, nom: titre.trim() || nomFichier.replace(/\.[^.]+$/, "") || "Brouillon", nomFichier, maj: Date.now(), duree, miniature: miniatureApercu() || ancien?.miniature || "", etat: etatMontage() };
      const r = await enregistrerBrouillon(info, fichierEnregistre.current === bid ? undefined : fichierBlob.current);
      fichierEnregistre.current = bid;
      setBrouillonId(bid);
      setBrEtat({ etat: "ok", maj: info.maj, enLigne: r.enLigne });
      setBrouillons((l) => { const a = l.find((b) => b.id === bid); return [{ ...info, ligne: r.enLigne ? "partout" : "local", clipLocal: true, clipEnLigne: r.clipEnLigne ?? a?.clipEnLigne }, ...l.filter((b) => b.id !== bid)]; });
    } catch (er) {
      setBrEtat({ etat: "erreur", message: (auto ? "Enregistrement automatique impossible : " : "Brouillon non enregistré : ") + (er instanceof Error ? er.message : String(er)) });
    }
  }
  async function reprendreBrouillon(b0: BrouillonInfo) {
    try {
      setBrEtat({ etat: "enreg" });
      const b = await lireEtatBrouillon(b0);
      const blob = await lireFichierBrouillon(b.id, b);
      if (!blob) {
        // le clip est resté sur l'appareil où le brouillon a été fait : on le redemande, le montage est gardé
        reprendreApres.current = b; setAttenteClip(b); setBrEtat({ etat: "repos" });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      appliquerBrouillon(b, blob, false);
    } catch (er) {
      setBrEtat({ etat: "erreur", message: "Impossible de reprendre ce brouillon : " + (er instanceof Error ? er.message : String(er)) });
    }
  }
  function appliquerBrouillon(b: BrouillonInfo, blob: Blob, clipReimporte: boolean) {
    try {
      const r = b.etat as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (fichier) URL.revokeObjectURL(fichier);
      restauration.current = r; restaure.current = true;
      // clip réimporté : il sera enregistré (ici et en ligne) au prochain enregistrement du brouillon
      fichierBlob.current = blob; fichierEnregistre.current = clipReimporte ? "" : b.id;
      setBrouillonId(b.id); setBrEtat({ etat: "ok", maj: b.maj });
      setExport({ etat: "repos", progres: 0 }); setSel("");
      setNomFichier(b.nomFichier);
      setTitre(r.titre || ""); setJeu(r.jeu || ""); setSousTitres(r.sousTitres || []); setTranscription(r.transcription || "");
      setClipChoisi(r.clipChoisi || null);
      if (r.modele) setModele({ ...MODELE_DEFAUT, ...r.modele });
      if (r.dispo) setDispo(r.dispo);
      if (typeof r.focusX === "number") setFocusX(r.focusX);
      if (typeof r.zoom === "number") setZoom(r.zoom);
      if (r.cam) setCam(r.cam);
      setFichier(URL.createObjectURL(blob));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (er) {
      setBrEtat({ etat: "erreur", message: "Impossible de reprendre ce brouillon : " + (er instanceof Error ? er.message : String(er)) });
    }
  }
  async function effacerBrouillon(b: BrouillonInfo) {
    if (!confirm(`Supprimer le brouillon « ${b.nom} » ?`)) return;
    try { await supprimerBrouillon(b.id); } catch { /* déjà parti */ }
    setBrouillons((l) => l.filter((x) => x.id !== b.id));
    if (b.id === brouillonId) { setBrouillonId(""); fichierEnregistre.current = ""; setBrEtat({ etat: "repos" }); }
  }
  // une fois enregistré, le brouillon se met à jour tout seul à chaque modification
  useEffect(() => {
    if (!brouillonId || restauration.current || export_.etat === "en-cours") return;
    const t = setTimeout(() => { enregistrerEnBrouillon(true); }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titre, jeu, dispo, focusX, zoom, cam, sousTitres, transcription, debut, fin, calques, modele]);

  function choisirClip(c: ClipTwitch) {
    setClipChoisi(c);
    setTitre(c.titre);
    setJeu(c.jeu);
  }

  function brancherAudio() {
    const v = video.current;
    if (!v || audio.current) return;
    const ctx = ctxDebloque.current || new AudioContext();
    const src = ctx.createMediaElementSource(v);
    const dest = ctx.createMediaStreamDestination();
    const gain = ctx.createGain();
    const principal = ctx.createGain();
    src.connect(principal);
    principal.connect(dest);
    src.connect(gain);
    gain.connect(ctx.destination);
    let finGain: GainNode | null = null;
    if (finVideo.current) { const fs = ctx.createMediaElementSource(finVideo.current); finGain = ctx.createGain(); fs.connect(finGain); finGain.connect(dest); }
    audio.current = { ctx, dest, gain, principal, finGain };
  }

  // ── Sous-titres ──
  function ajouterSousTitre() {
    const t = video.current?.currentTime ?? debut;
    setSousTitres((l) => [...l, { id: id(), debut: +t.toFixed(1), fin: +Math.min(fin || duree, t + 2.5).toFixed(1), texte: "" }].sort((a, b) => a.debut - b.debut));
  }
  function repartir() {
    // Répartit le texte collé sur la durée coupée, au prorata du nombre de mots (3 à 6 mots par carton)
    const mots = transcription.split(/\s+/).filter(Boolean);
    if (!mots.length) return;
    const cartons: string[] = [];
    for (let i = 0; i < mots.length; ) {
      const n = Math.min(mots.length - i, mots.length - i <= 6 ? mots.length - i : 4);
      cartons.push(mots.slice(i, i + n).join(" "));
      i += n;
    }
    const total = (fin || duree) - debut;
    let t = debut;
    setSousTitres(cartons.map((texte) => {
      const d = (total * texte.split(" ").length) / mots.length;
      const s = { id: id(), debut: +t.toFixed(1), fin: +(t + d).toFixed(1), texte };
      t += d;
      return s;
    }));
  }

  // ── Export vidéo (temps réel) ──
  async function exporter() {
    const v = video.current;
    if (!v) return;
    // la cinématique de fin est « débloquée » tout de suite, pendant le clic (sinon le navigateur peut refuser de la lire 1 min plus tard)
    const fv = finVideo.current;
    const avecFin = habille && modele.ending && Boolean(fv);
    if (avecFin && fv) { fv.muted = true; fv.play().then(() => { fv.pause(); fv.currentTime = 0; fv.muted = false; }).catch(() => { fv.muted = false; }); }
    // le son est débloqué maintenant, pendant le clic : sinon Safari le laisse muet si l'enregistrement de secours prend le relais
    if (!audio.current && !ctxDebloque.current) { try { ctxDebloque.current = new AudioContext(); ctxDebloque.current.resume().catch(() => {}); } catch { /* pas de son possible */ } }
    try { await exporterVideo(v, avecFin); }
    catch (er) { setExport({ etat: "erreur", progres: 0, message: "La création a échoué : " + (er instanceof Error ? er.message : String(er)) + ". Réessaie (garde l’onglet ouvert pendant la création)." }); }
  }
  // Fin de l'export : lien, vidéothèque et téléchargement automatique
  function livrer(blob: Blob, ext: string, mode = "") {
    const url = URL.createObjectURL(blob);
    setExport({ etat: "fini", progres: 1, url, ext, mode });
    preparerVideotheque();
    const lien = document.createElement("a"); lien.href = url; lien.download = `${(etat.current.titre || "tiktok-cycylive").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 50)}.${ext}`;
    document.body.appendChild(lien); lien.click(); lien.remove();
  }
  async function exporterVideo(v: HTMLVideoElement, avecFin: boolean) {
    // 1) export image par image (MP4 propre, son calé) quand le navigateur sait le faire
    let raison = webcodecsDispo() ? "" : "ce navigateur ne sait pas encoder image par image";
    if (webcodecsDispo()) {
      setExport({ etat: "en-cours", progres: 0 });
      try {
        const r = await exporterMp4({
          video: v, source: fichierBlob.current || v.currentSrc, debut, fin: fin || v.duration, W, H,
          dessiner: (c, vv, t) => dessiner(c, vv, t),
          ending: avecFin && finVideo.current ? { el: finVideo.current, url: ENDING } : null,
          progres: (x) => setExport((e) => ({ ...e, progres: x })),
          ctxAudio: audio.current?.ctx || ctxDebloque.current,
        });
        // le son est relu dans le fichier final : on n'annonce « son calé » que s'il y est vraiment
        if (r.son === "ok" || r.son === "plan-b") {
          livrer(r.blob, "mp4", r.son === "ok" ? "✓ Créée image par image : MP4, 60 images/s, son vérifié dans le fichier" : "✓ Créée image par image : MP4, 60 images/s · son réenregistré pour ce navigateur et vérifié");
          return;
        }
        raison = (r.detail || "son introuvable dans le fichier") + " : la vidéo est refaite en direct, avec le son du lecteur";
      } catch (er) { raison = er instanceof Error ? er.message : String(er); console.warn("Export image par image impossible, enregistrement classique :", er); }
    }
    // 2) sinon : enregistrement en direct (ancien mode)
    v.muted = false; v.playbackRate = 1;
    brancherAudio();
    const a = audio.current!;
    await a.ctx.resume();
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext("2d")!;
    // 60 images/s : les zooms, flashs et textes animés restent fluides (même si le clip source est en 30)
    const flux = canvas.captureStream(30); // mode de secours : 30 images/s, plus stable sur téléphone
    a.dest.stream.getAudioTracks().forEach((t) => flux.addTrack(t));
    const types = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
    const type = types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
    if (!type) { setExport({ etat: "erreur", progres: 0, message: "Ce navigateur ne sait pas enregistrer de vidéo : utilise Chrome, Edge ou Safari récent." }); return; }
    const morceaux: Blob[] = [];
    const rec = new MediaRecorder(flux, { mimeType: type, videoBitsPerSecond: 16_000_000 });
    rec.ondataavailable = (e) => { if (e.data.size) morceaux.push(e.data); };
    const termine = new Promise<void>((ok) => { rec.onstop = () => ok(); });
    setExport({ etat: "en-cours", progres: 0 });
    a.gain.gain.value = 0; // export silencieux pour toi, le son est bien dans la vidéo
    // un export précédent a pu laisser le son coupé ou la cinématique audible : tout est remis à zéro
    a.principal.gain.cancelScheduledValues(a.ctx.currentTime); a.principal.gain.value = 1;
    if (a.finGain) { a.finGain.gain.cancelScheduledValues(a.ctx.currentTime); a.finGain.gain.value = 0; }
    v.pause();
    v.currentTime = debut;
    await new Promise((ok) => v.addEventListener("seeked", ok, { once: true }));
    // laisse le son de l'ancienne position se vider avant d'enregistrer (sinon on entendait la fin du clip au début)
    await new Promise((ok) => setTimeout(ok, 350));
    rec.start(250);
    await v.play();
    const finT = fin || v.duration;
    await new Promise<void>((ok) => {
      let dernierMaj = 0;
      const pas = () => {
        dessiner(c, v, v.currentTime);
        // la barre de progression n'est mise à jour que 5 fois par seconde : la redessiner à chaque image ralentissait l'enregistrement
        const maint = performance.now();
        if (maint - dernierMaj > 200) { dernierMaj = maint; setExport((x) => ({ ...x, progres: Math.min(avecFin ? 0.95 : 1, (v.currentTime - debut) / Math.max(0.1, finT - debut) * (avecFin ? 0.95 : 1)) })); }
        if (v.currentTime >= finT || v.ended) { v.pause(); ok(); return; }
        requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    });
    // cinématique de fin Cycylive : fondu enchaîné de 0,4 s depuis la dernière image, avec son jingle
    const fv = finVideo.current;
    if (avecFin && fv && a.finGain) {
      try {
        const fige = document.createElement("canvas"); fige.width = W; fige.height = H; fige.getContext("2d")!.drawImage(canvas, 0, 0);
        fv.currentTime = 0;
        const n = a.ctx.currentTime;
        a.principal.gain.setValueAtTime(1, n); a.principal.gain.linearRampToValueAtTime(0, n + 0.4);
        a.finGain.gain.setValueAtTime(0, n); a.finGain.gain.linearRampToValueAtTime(1, n + 0.4);
        await fv.play();
        const limite = Date.now() + ((fv.duration || 5) + 2) * 1000;
        await new Promise<void>((ok) => {
          const pas = () => {
            c.globalAlpha = 1; c.drawImage(fige, 0, 0);
            c.globalAlpha = Math.min(1, fv.currentTime / 0.4); c.drawImage(fv, 0, 0, W, H); c.globalAlpha = 1;
            if (fv.ended || fv.currentTime >= (fv.duration || 4) - 0.03 || Date.now() > limite) { ok(); return; }
            requestAnimationFrame(pas);
          };
          requestAnimationFrame(pas);
        });
      } catch { /* la cinématique n'a pas pu être lue : la vidéo est livrée sans */ }
      fv.pause();
      a.principal.gain.cancelScheduledValues(a.ctx.currentTime); a.principal.gain.value = 1;
    }
    rec.stop();
    await termine;
    a.gain.gain.value = 1;
    livrer(new Blob(morceaux, { type: type.split(";")[0] }), type.includes("mp4") ? "mp4" : "webm", "Mode de secours (enregistrement en direct, 30 images/s) · raison : " + raison);
  }

  // ── Visuels fixes (miniature, story) à partir de l'image en cours ──
  function visuel(type: "miniature" | "story") {
    const v = video.current;
    if (!v) return;
    const [w, h] = type === "miniature" ? [1280, 720] : [1080, 1920];
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const c = canvas.getContext("2d")!;
    const vw = v.videoWidth || 1920, vh = v.videoHeight || 1080;
    const s = Math.max(w / vw, h / vh);
    if (type === "story") { c.filter = "blur(30px) brightness(.5)"; }
    c.drawImage(v, (w - vw * s) / 2, (h - vh * s) / 2, vw * s, vh * s);
    c.filter = "none";
    const d = polices.display;
    if (type === "miniature") {
      const g = c.createLinearGradient(0, h, 0, h * 0.35);
      g.addColorStop(0, "rgba(13,10,23,.95)"); g.addColorStop(1, "rgba(13,10,23,0)");
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = "#9146ff"; c.fillRect(48, h - 250, 14, 170);
      c.font = `800 82px ${d}`; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
      lignes(c, (titre || "Nouveau clip").toUpperCase(), w - 160).slice(0, 2).forEach((l, i, arr) => {
        const y = h - 90 - (arr.length - 1 - i) * 88;
        c.lineWidth = 14; c.strokeStyle = "rgba(24,10,48,.95)"; c.strokeText(l, 84, y); c.fillStyle = "#fff"; c.fillText(l, 84, y);
      });
      if (jeu) { c.font = `700 30px ${polices.sans}`; c.fillStyle = "#e0b3ff"; c.fillText(jeu.toUpperCase(), 86, h - 270); }
    } else {
      const fh = (w * vh) / vw, y = (h - fh) / 2;
      c.save(); c.shadowColor = "rgba(161,92,255,.7)"; c.shadowBlur = 50; c.drawImage(v, 0, y, w, fh); c.restore();
      c.fillStyle = "#e11d48";
      c.beginPath(); c.roundRect(w / 2 - 230, y - 300, 460, 90, 45); c.fill();
      c.font = `800 42px ${polices.sans}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff";
      c.fillText("NOUVEAU CLIP", w / 2, y - 254);
      texteContour(c, titre || "", w / 2, y - 120, 70, d, w - 120, 2);
      c.font = `600 40px ${polices.sans}`; c.fillStyle = "rgba(255,255,255,.85)"; c.fillText("Le clip complet est sur mes réseaux ✨", w / 2, y + fh + 120);
    }
    canvas.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `${type}-${(titre || "clip").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40)}.jpg`;
      a.click();
    }, "image/jpeg", 0.92);
  }

  // ── Textes prêts à copier ──
  const sousCarte = calques.find((c) => c.type === "carte")?.sous || "";
  const textes = useMemo(() => {
    const t = titre || "ce moment";
    const tags = hashtags(jeu).join(" ");
    return [
      { plateforme: "TikTok", texte: `${t} 😱 ${jeu ? `#${jeu.replace(/\s+/g, "")}` : ""}\nRetrouve-moi en live sur Twitch : ${chaine} 💜\n${tags}`.trim() },
      { plateforme: "TikTok (version courte)", texte: `${t}${sousCarte ? `\n${sousCarte}` : ""}\n${tags}` },
      { plateforme: "Reels Instagram", texte: `${t} ✨\n\nTous les lives sont sur Twitch (lien en bio) 💜\n\n${tags}` },
      { plateforme: "YouTube Shorts", texte: `${t}${jeu ? ` | ${jeu}` : ""} #shorts\n\nLive sur Twitch : https://twitch.tv/${chaine}\n${tags}` },
      { plateforme: "Titres alternatifs", texte: [`POV : ${t.toLowerCase()}`, `Personne ne s’attendait à ça… ${jeu ? `(${jeu})` : ""}`.trim(), `${t} 💀`, `Le moment où tout bascule${jeu ? ` sur ${jeu}` : ""}`].join("\n") },
    ];
  }, [titre, jeu, sousCarte]);

  async function copier(t: string, k: string) {
    try { await navigator.clipboard.writeText(t); setCopie(k); setTimeout(() => setCopie(""), 2000); } catch { /* sélection manuelle */ }
  }

  async function partager() {
    if (!export_.url) return;
    const blob = await fetch(export_.url).then((r) => r.blob());
    const f = new File([blob], `clip-cycylive.${export_.ext}`, { type: blob.type });
    if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], text: textes[0].texte }); } catch { /* annulé */ } }
    else { const a = document.createElement("a"); a.href = export_.url; a.download = f.name; a.click(); }
  }

  // ── Vidéothèque : titre, description et hashtags choisis parmi les propositions ──
  const sansHashtags = (t: string) => t.split("\n").map((l) => l.replace(/(\s*#[\p{L}\d_]+)+\s*$/u, "")).filter((l) => l.trim()).join("\n");
  const descriptions = textes.filter((t) => t.plateforme !== "Titres alternatifs").map((t) => ({ nom: t.plateforme, texte: sansHashtags(t.texte) }));
  const titresProposes = [titre, ...(textes.find((t) => t.plateforme === "Titres alternatifs")?.texte.split("\n") || [])].map((t) => t.trim()).filter((t, i, a) => t && a.indexOf(t) === i);
  const tagsProposes = [...new Set([...hashtags(jeu), ...vt.tags])];
  function preparerVideotheque() {
    setVt({ titre: etat.current.titre || titre || "", desc: descriptions[0]?.texte || "", tags: hashtags(jeu), etat: "repos", pct: 0 });
  }
  async function miniatureDepuis(url: string): Promise<Blob | null> {
    try {
      const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
      await new Promise((ok, ko) => { v.onloadeddata = ok; v.onerror = ko; setTimeout(ko, 8000); });
      // image prise pendant la carte titre (début du clip)
      v.currentTime = Math.min(1.2, (Number.isFinite(v.duration) ? v.duration : 3) * 0.3);
      await new Promise((ok) => { v.onseeked = ok; setTimeout(ok, 3000); });
      const cv = document.createElement("canvas"); cv.width = 720; cv.height = 1280;
      cv.getContext("2d")!.drawImage(v, 0, 0, cv.width, cv.height);
      return await new Promise((ok) => cv.toBlob((b) => ok(b), "image/jpeg", 0.86));
    } catch { return null; }
  }
  async function ajouterVideotheque() {
    if (!export_.url || vt.etat === "envoi") return;
    if (!integre()) { setVt((x) => ({ ...x, etat: "erreur", message: "Ouvre le générateur depuis CycyBot (Création de contenus) pour l’ajouter à ta vidéothèque." })); return; }
    setVt((x) => ({ ...x, etat: "envoi", pct: 0, message: "" }));
    const fichier = await fetch(export_.url).then((r) => r.blob());
    const miniature = await miniatureDepuis(export_.url);
    const id = Math.random().toString(36).slice(2);
    await new Promise<void>((fini) => {
      let recu = false;
      const stop = (maj: Partial<typeof vt>) => { window.removeEventListener("message", ecoute); clearTimeout(attente); setVt((x) => ({ ...x, ...maj })); fini(); };
      const ecoute = (ev: MessageEvent) => {
        const d = ev.data as { type?: string; id?: string; pct?: number; message?: string; enLigne?: boolean };
        if (!ORIGINES_INTERFACE.includes(ev.origin) || !d || d.id !== id) return;
        if (d.type === "cycy-videotheque-recu") recu = true;
        if (d.type === "cycy-videotheque-etat") setVt((x) => ({ ...x, pct: d.pct || 0 }));
        if (d.type === "cycy-videotheque-ok") stop({ etat: "ok", pct: 100, message: d.enLigne === false ? "Ajoutée (fiche seulement : le stockage vidéo n’est pas activé, garde ton fichier)." : "" });
        if (d.type === "cycy-videotheque-erreur") stop({ etat: "erreur", message: "L’ajout a échoué : " + (d.message || "erreur inconnue") });
      };
      window.addEventListener("message", ecoute);
      const attente = setTimeout(() => { if (!recu) stop({ etat: "erreur", message: "CycyBot n’a pas répondu : recharge la page de l’interface puis réessaie." }); }, 6000);
      const msg = { type: "cycy-videotheque", id, fichier, miniature, ext: export_.ext, nom: vt.titre.trim() || titre || "Vidéo montée", legende: vt.desc.trim(), hashtags: vt.tags.join(" ") };
      for (const o of [...new Set<string>(ORIGINES_INTERFACE)]) { try { window.parent.postMessage(msg, o); } catch { /* autre origine */ } }
    });
  }

  const boutonBrouillon = (
    <button type="button" onClick={() => enregistrerEnBrouillon()} disabled={brEtat.etat === "enreg"} title={brouillonId ? "Le brouillon se met à jour tout seul à chaque modification" : "Garder ce montage pour le reprendre plus tard"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all disabled:opacity-60 ${brouillonId ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100" : "border-violet/30 text-ink hover:bg-violet/10"}`}>
      💾 {brEtat.etat === "enreg" ? "Enregistrement…" : brouillonId ? `Brouillon enregistré${brEtat.enLigne ? " partout" : ""}${brEtat.maj ? " · " + new Date(brEtat.maj).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}` : "Enregistrer en brouillon"}
    </button>
  );

  const champBase = "rounded-lg bg-card border border-violet/20 px-3 py-2 text-sm text-ink outline-none focus:border-violet/60";
  const champ = `w-full ${champBase}`;
  const curseur = "w-full accent-violet-500";

  return (
    <div className="space-y-6">
      <video ref={finVideo} src={ENDING} preload="auto" playsInline className="hidden" />
      {attenteClip && (
        <section className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-4 text-sm text-amber-50" role="status">
          <p className="font-semibold">🎞️ Reprendre « {attenteClip.nom} »</p>
          <p className="mt-1 text-amber-50/85">Le montage est bien là, mais le clip est resté sur l’appareil où tu l’avais importé{attenteClip.nomFichier ? <> (<b>{attenteClip.nomFichier}</b>)</> : null}. Choisis le même fichier ci-dessous : titre, calques, coupe et sous-titres se remettent tout seuls.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white">Choisir le clip<input type="file" accept="video/*" className="sr-only" onChange={(e) => e.target.files?.[0] && charger(e.target.files[0])} /></label>
            <button type="button" className="rounded-full border border-amber-200/40 px-4 py-2 text-sm" onClick={() => { reprendreApres.current = null; setAttenteClip(null); }}>Annuler</button>
          </div>
        </section>
      )}
      {/* Brouillons */}
      {brouillons.length > 0 && (
        <section className="carte-holo rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="document" className="w-5 h-5 text-lilac" /> 📝 Mes brouillons <span className="text-xs font-normal text-ink-soft/70">montages pas terminés, à reprendre quand tu veux</span></h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {brouillons.map((b) => (
              <div key={b.id} className={`w-40 shrink-0 overflow-hidden rounded-xl border transition-all ${b.id === brouillonId ? "border-violet-light ring-2 ring-violet/40" : "border-violet/15"}`}>
                <button type="button" onClick={() => reprendreBrouillon(b)} className="block w-full text-left" title="Reprendre ce montage">
                  {b.miniature ? <img src={b.miniature} alt="" className="aspect-[9/14] w-full object-cover bg-black" /> : <span className="flex aspect-[9/14] w-full items-center justify-center bg-violet/10 text-2xl">🎬</span>}
                  <span className="block px-2.5 pt-2 text-xs font-medium text-ink line-clamp-2 min-h-[2rem]">{b.nom}</span>
                  <span className="block px-2.5 text-[11px] text-ink-soft/70">{new Date(b.maj).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{b.duree ? ` · ${Math.round(b.duree)} s` : ""}</span>
                  <span className="block px-2.5 pt-0.5 text-[11px] text-ink-soft/80" title={b.ligne === "local" ? "Pas encore en ligne (envoi en cours ou pas de connexion)" : b.clipLocal || b.clipEnLigne ? "Montage et clip disponibles sur tous tes appareils" : "Le montage est partout ; le clip est resté sur l’appareil où il a été importé"}>
                    {b.ligne === "local" ? "📱 Cet appareil" : b.clipLocal || b.clipEnLigne ? "☁️ Partout" : "☁️ Montage · 🎞️ clip à réimporter"}
                  </span>
                </button>
                <div className="flex items-center justify-between px-2.5 pb-2 pt-1.5">
                  <button type="button" onClick={() => reprendreBrouillon(b)} className="text-xs font-semibold text-lilac">{b.id === brouillonId ? "En cours ✎" : "Reprendre"}</button>
                  <button type="button" onClick={() => effacerBrouillon(b)} className="text-xs text-ink-soft/60 hover:text-red-300" title="Supprimer le brouillon">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 1. Source */}
      <section className="carte-holo rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="clap" className="w-5 h-5 text-lilac" /> 1. Le clip</h3>
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet/30 bg-violet/5 p-6 text-center cursor-pointer hover:bg-violet/10 transition-all">
          <Icone nom="plus" className="w-6 h-6 text-lilac" />
          <span className="text-sm text-ink">{nomFichier ? `Clip chargé : ${nomFichier} (changer)` : "Importer le fichier du clip (MP4, MOV…)"}</span>
          <span className="text-xs text-ink-soft/70">Il reste sur ton appareil : rien n’est envoyé sur internet.</span>
          <input type="file" accept="video/*" className="sr-only" onChange={(e) => e.target.files?.[0] && charger(e.target.files[0])} />
        </label>
        {clips.length > 0 && (
          <div>
            <p className="text-sm text-ink-soft mb-2">Ou pars d’un de tes clips Twitch récents : le titre et le jeu se remplissent, et « Télécharger » ouvre le clip sur Twitch pour récupérer le fichier.</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {clips.map((c) => (
                <button key={c.id} type="button" onClick={() => choisirClip(c)} className={`w-48 shrink-0 rounded-xl border text-left overflow-hidden transition-all ${clipChoisi?.id === c.id ? "border-violet-light ring-2 ring-violet/40" : "border-violet/15 hover:border-violet/40"}`}>
                  <img src={c.miniature} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                  <span className="block px-2.5 pt-2 text-xs font-medium text-ink line-clamp-2 min-h-[2rem]">{c.titre}</span>
                  <span className="block px-2.5 pb-2 text-[11px] text-ink-soft/70">{c.jeu} · {c.duree} s · {c.vues} vues</span>
                </button>
              ))}
            </div>
            {clipChoisi && <a href={clipChoisi.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-sm text-lilac underline underline-offset-2">Télécharger « {clipChoisi.titre} » sur Twitch ↗</a>}
          </div>
        )}
      </section>

      {fichier && (
        <>
          {/* 2. Montage */}
          <section className="carte-holo rounded-2xl p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="smartphone" className="w-5 h-5 text-lilac" /> 2. Vidéo verticale</h3>
              {boutonBrouillon}
            </div>
            {brEtat.etat === "erreur" && <p className="-mt-2 mb-3 text-xs text-red-300" role="alert">{brEtat.message}</p>}
            {envoiClip && envoiClip.id === brouillonId && (
              <p className={`-mt-2 mb-3 text-xs ${envoiClip.erreur ? "text-amber-200" : "text-ink-soft"}`} role="status">
                {envoiClip.erreur ? `☁️ Le clip n’a pas pu être mis en ligne (${envoiClip.erreur}) : le montage, lui, est bien partout. Réessai à la prochaine ouverture.` : envoiClip.fini ? "☁️ Clip en ligne : ce brouillon s’ouvre sur tous tes appareils." : `☁️ Envoi du clip en ligne… ${envoiClip.pct} %`}
              </p>
            )}
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4 min-w-0">
                <video ref={video} src={fichier} controls playsInline className={habille ? "w-full max-h-48 rounded-xl bg-black" : "w-full rounded-xl bg-black"} crossOrigin="anonymous"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    const appliquer = (d: number) => {
                      const r = restauration.current;
                      if (r) {
                        // reprise d'un brouillon : on remet la coupe et les calques tels qu'ils étaient
                        setDuree(d); setDebut(Math.min(r.debut || 0, d)); setFin(r.fin && r.fin <= d ? r.fin : d);
                        setCalques(Array.isArray(r.calques) && r.calques.length ? r.calques : calquesDepuisModele(modele, d, r.titre || titre, ""));
                        setTimeout(() => { restauration.current = null; }, 0);
                        return;
                      }
                      setDuree(d); setDebut(0); setFin(d);
                      setCalques(calquesDepuisModele(modele, d, titre, ""));
                      if (v.videoHeight > v.videoWidth * 1.4) setDispo("vertical");
                      else if (v.videoWidth > v.videoHeight) setDispo((x) => (x === "vertical" ? "floute" : x));
                    };
                    if (Number.isFinite(v.duration) && v.duration > 0) return appliquer(v.duration);
                    // Certains fichiers (WebM enregistrés) n'indiquent pas leur durée : on la fait calculer
                    const lire = () => { if (Number.isFinite(v.duration) && v.duration > 0) { v.removeEventListener("durationchange", lire); appliquer(v.duration); v.currentTime = 0; } };
                    v.addEventListener("durationchange", lire);
                    v.currentTime = 1e7;
                  }}
                  onLoadedData={(e) => { const v = e.currentTarget; if (restaure.current) { restaure.current = false; return; } if (v.videoHeight > v.videoWidth * 1.4) { const essai = (n: number) => { if (!detecterSeparation() && n > 0) setTimeout(() => essai(n - 1), 400); }; setTimeout(() => essai(5), 150); } }}
                  onError={() => setBrEtat({ etat: "erreur", message: "Ce clip ne peut pas être lu ici : réimporte-le depuis ta galerie (ou exporte-le en MP4)." })}
                  onPlay={() => setEnLecture(true)} onPause={() => setEnLecture(false)} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {DISPOS.map((d) => (
                    <button key={d.valeur} type="button" onClick={() => setDispo(d.valeur)} className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${dispo === d.valeur ? "border-violet-light bg-violet/20 text-ink" : "border-violet/20 text-ink-soft hover:bg-violet/10"}`}>
                      <span className="flex items-center gap-2 font-medium"><Icone nom={d.icone} className="w-4 h-4 text-lilac" />{d.label}</span>
                      <span className="block text-xs text-ink-soft/70 mt-0.5">{d.aide}</span>
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-ink-soft">Début : {fmt(debut)}<input type="range" min={0} max={duree} step={0.1} value={debut} onChange={(e) => { const v = Math.min(+e.target.value, fin - 0.5); setDebut(v); if (video.current) video.current.currentTime = v; }} className={curseur} /></label>
                  <label className="text-xs text-ink-soft">Fin : {fmt(fin)} · durée {fmt(Math.max(0, fin - debut))}<input type="range" min={0} max={duree} step={0.1} value={fin} onChange={(e) => setFin(Math.max(+e.target.value, debut + 0.5))} className={curseur} /></label>
                  {dispo !== "floute" && <label className="text-xs text-ink-soft">Cadrage (gauche ↔ droite)<input type="range" min={0} max={1} step={0.01} value={focusX} onChange={(e) => setFocusX(+e.target.value)} className={curseur} /></label>}
                  {dispo !== "floute" && <label className="text-xs text-ink-soft">Zoom : ×{zoom.toFixed(2)}<input type="range" min={1} max={2.5} step={0.05} value={zoom} onChange={(e) => setZoom(+e.target.value)} className={curseur} /></label>}
                  {dispo === "facecam" && (
                    <>
                      <label className="text-xs text-ink-soft">Caméra : position horizontale<input type="range" min={0} max={1} step={0.01} value={cam.x} onChange={(e) => setCam({ ...cam, x: +e.target.value })} className={curseur} /></label>
                      <label className="text-xs text-ink-soft">Caméra : position verticale<input type="range" min={0} max={1} step={0.01} value={cam.y} onChange={(e) => setCam({ ...cam, y: +e.target.value })} className={curseur} /></label>
                      <label className="text-xs text-ink-soft sm:col-span-2">Caméra : taille<input type="range" min={0.12} max={0.6} step={0.01} value={cam.taille} onChange={(e) => setCam({ ...cam, taille: +e.target.value })} className={curseur} /></label>
                    </>
                  )}
                </div>
                <label className="block text-sm text-ink-soft">{habille ? "Titre de la carte d’ouverture" : "Titre affiché sur la vidéo"}
                  <input value={titre} onChange={(e) => majTitre(e.target.value)} maxLength={70} className={`${champ} mt-1`} placeholder="Le clutch le plus fou de la saison" />
                </label>
                {habille && (
                  <label className="block text-sm text-ink-soft">Sous-titre de la carte
                    <input value={calques.find((c) => c.type === "carte")?.sous || ""} onChange={(e) => setCalques((l) => l.map((c) => (c.type === "carte" ? { ...c, sous: e.target.value } : c)))} maxLength={70} className={`${champ} mt-1`} placeholder="Cycy (Phoenix) & Mamen (Raze) · Pearl" />
                  </label>
                )}
                <label className="block text-sm text-ink-soft">Jeu (pour les hashtags)
                  <input value={jeu} onChange={(e) => setJeu(e.target.value)} className={`${champ} mt-1`} placeholder="VALORANT" />
                </label>
              </div>
              {!habille && (
                <div>
                  <canvas ref={apercu} width={W} height={H} className="w-full max-w-[260px] mx-auto rounded-2xl border border-violet/25 bg-[#0d0a17] shadow-glow-sm" aria-label="Aperçu vertical" />
                  <p className="mt-2 text-center text-xs text-ink-soft/70">Aperçu 1080×1920 · lance la vidéo pour le voir bouger</p>
                </div>
              )}
            </div>
          </section>

          {/* 2 bis. Aperçu du rendu + timeline de l'habillage */}
          {habille && (
            <section className="carte-holo rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="eclats" className="w-5 h-5 text-lilac" /> Aperçu du rendu et habillage Cycylive</h3>
                <div className="flex flex-wrap gap-2">
                  {dispo === "vertical" && <button type="button" onClick={() => { detecterSeparation(); }} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs text-ink-soft hover:bg-violet/10">Détecter la séparation cam / jeu</button>}
                  <button type="button" onClick={() => { localStorage.removeItem(CLE_MODELE); setModele(MODELE_DEFAUT); setCalques((l) => [...calquesDepuisModele(MODELE_DEFAUT, total, titre, l.find((c) => c.type === "carte")?.sous || ""), ...l.filter((c) => c.type === "flash" || c.type === "texte")]); }} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs text-ink-soft hover:bg-violet/10">Revenir au thème d’origine</button>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <canvas ref={apercu} width={W} height={H} onPointerDown={saisirApercu} className="w-full max-w-[340px] mx-auto rounded-2xl border border-violet/25 bg-[#0d0a17] shadow-glow-sm cursor-move touch-none" aria-label="Aperçu du rendu final" />
                  <p className="text-center text-xs text-ink-soft/70">Le rendu exact de ta vidéo · attrape un élément pour le déplacer</p>
                  <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={modele.ending} onChange={(e) => setModele((m) => ({ ...m, ending: e.target.checked }))} className="accent-violet-500" /> Cinématique de fin Cycylive (4 s, jingle)</label>
                  <button type="button" onClick={() => setVoirFin((x) => !x)} className="text-xs text-lilac underline underline-offset-2">{voirFin ? "Masquer la cinématique" : "Voir la cinématique de fin"}</button>
                  {voirFin && <video src={ENDING} controls autoPlay playsInline className="w-full max-w-[220px] rounded-lg bg-black" />}
                </div>
                <TimelineHabillage duree={total} t={tCur} enLecture={enLecture} calques={calques} setCalques={setCalques} sel={sel} setSel={setSel}
                  sousTitres={sousTitres} debutCoupe={debut} onSeek={aller} onLecture={lectureOuPause} />
              </div>
              <p className="text-xs text-ink-soft/70">Tes réglages (positions, durées, animations, textes de l’encart et de l’étiquette) sont gardés comme modèle pour tes prochaines vidéos. Les flashs et les textes libres sont propres à chaque vidéo.</p>
            </section>
          )}

          {/* 3. Sous-titres */}
          <section className="carte-holo rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="bulle" className="w-5 h-5 text-lilac" /> 3. Sous-titres</h3>
            <p className="text-sm text-ink-soft">Colle ce qui est dit dans le clip et clique « Répartir » : le texte est découpé en cartons sur la durée. Ajuste ensuite les temps, ou ajoute un carton au moment où la vidéo est en pause.{habille && " Astuce : entoure un mot d’astérisques (*ACE*) pour l’écrire en rose."}</p>
            <textarea value={transcription} onChange={(e) => setTranscription(e.target.value)} rows={3} className={champ} placeholder="Non mais c’est pas possible, il était derrière moi depuis le début…" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={repartir} disabled={!transcription.trim()} className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white hover:bg-violet-light transition-all disabled:opacity-50">Répartir sur la vidéo</button>
              <button type="button" onClick={ajouterSousTitre} className="rounded-full border border-violet/30 px-4 py-2 text-sm text-ink-soft hover:bg-violet/10 transition-all">+ Carton à cet instant</button>
              {sousTitres.length > 0 && <button type="button" onClick={() => setSousTitres([])} className="rounded-full border border-violet/30 px-4 py-2 text-sm text-ink-soft hover:bg-red-500/10 transition-all">Tout effacer</button>}
            </div>
            {sousTitres.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {sousTitres.map((s, i) => (
                  <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-violet/12 bg-white/[0.02] p-2">
                    <input type="number" step={0.1} value={s.debut} onChange={(e) => setSousTitres((l) => l.map((x, j) => (j === i ? { ...x, debut: +e.target.value } : x)))} className={`${champBase} w-20`} aria-label="Début (s)" />
                    <span className="text-ink-soft/60 text-xs">→</span>
                    <input type="number" step={0.1} value={s.fin} onChange={(e) => setSousTitres((l) => l.map((x, j) => (j === i ? { ...x, fin: +e.target.value } : x)))} className={`${champBase} w-20`} aria-label="Fin (s)" />
                    <input value={s.texte} onChange={(e) => setSousTitres((l) => l.map((x, j) => (j === i ? { ...x, texte: e.target.value } : x)))} className={`${champBase} flex-1 min-w-[160px]`} placeholder="Texte du carton" />
                    <button type="button" onClick={() => { if (video.current) video.current.currentTime = s.debut; }} className="text-xs text-lilac underline">voir</button>
                    <button type="button" onClick={() => setSousTitres((l) => l.filter((_, j) => j !== i))} className="text-ink-soft/60 hover:text-red-300 px-1" aria-label="Retirer">✕</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Export */}
          <section className="carte-holo rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="fusee" className="w-5 h-5 text-lilac" /> 4. Exporter</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exporter} disabled={export_.etat === "en-cours"} className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm hover:bg-violet-light transition-all disabled:opacity-50">
                <Icone nom="clap" className="w-4 h-4" /> {export_.etat === "en-cours" ? (export_.progres >= 0.95 && habille && modele.ending ? "Cinématique de fin…" : `Création… ${Math.round(export_.progres * 100)} %`) : habille ? "Créer et télécharger ma vidéo" : "Créer la vidéo verticale"}
              </button>
              {boutonBrouillon}
              {!habille && <button type="button" onClick={() => visuel("miniature")} className="rounded-full border border-violet/30 px-4 py-2.5 text-sm text-ink-soft hover:bg-violet/10 transition-all">Miniature YouTube (image en cours)</button>}
              {!habille && <button type="button" onClick={() => visuel("story")} className="rounded-full border border-violet/30 px-4 py-2.5 text-sm text-ink-soft hover:bg-violet/10 transition-all">Image story « Nouveau clip »</button>}
            </div>
            {export_.etat === "en-cours" && (
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-violet transition-all" style={{ width: `${Math.round(export_.progres * 100)}%` }} /></div>
            )}
            <p className="text-xs text-ink-soft/70">La vidéo se crée en temps réel (un clip de 30 s prend 30 s{habille && modele.ending ? ", plus 4 s pour la fin" : ""}) : garde l’onglet ouvert. À la fin, elle se télécharge toute seule sur ton appareil. Rien n’est publié : tu la postes toi-même sur tes réseaux, ou tu l’ajoutes à ta vidéothèque pour la planifier.</p>
            {export_.etat === "erreur" && <p className="text-sm text-red-300" role="alert">{export_.message}</p>}
            {export_.etat === "fini" && export_.url && (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
                <video src={export_.url} controls playsInline className="h-56 rounded-xl bg-black" />
                <div className="space-y-2">
                  <p className="text-sm text-emerald-100">Ta vidéo est prête ({export_.ext?.toUpperCase()}) !</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={export_.url} download={`clip-cycylive.${export_.ext}`} className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white hover:bg-violet-light transition-all">Télécharger</a>
                    <button type="button" onClick={ajouterVideotheque} disabled={vt.etat === "envoi" || vt.etat === "ok"} className="rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-all disabled:opacity-60">
                      {vt.etat === "envoi" ? `Ajout… ${vt.pct} %` : vt.etat === "ok" ? "✓ Dans ta vidéothèque" : "📼 Ajouter à la vidéothèque"}
                    </button>
                    <button type="button" onClick={partager} className="rounded-full border border-violet/30 px-4 py-2 text-sm text-ink-soft hover:bg-violet/10 transition-all">Partager (TikTok, Insta…)</button>
                  </div>
                  {vt.etat === "ok" && <p className="text-xs text-emerald-100">Elle t’attend dans Studio créatrice → Vidéothèque, prête à planifier. {vt.message}</p>}
                  {vt.etat === "erreur" && <p className="text-xs text-red-300" role="alert">{vt.message}</p>}
                  {vt.etat !== "ok" && (
                    <div className="mt-2 w-full max-w-xl space-y-2.5 rounded-xl border border-violet/20 bg-white/[0.03] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-lilac">Pour la vidéothèque</p>
                      <label className="block text-xs text-ink-soft">Titre
                        <input value={vt.titre} onChange={(e) => setVt((x) => ({ ...x, titre: e.target.value }))} className={`${champ} mt-1`} />
                      </label>
                      {titresProposes.length > 1 && <div className="flex flex-wrap gap-1.5">{titresProposes.map((t) => <button key={t} type="button" onClick={() => setVt((x) => ({ ...x, titre: t }))} className={`rounded-full border px-2.5 py-1 text-xs transition-all ${vt.titre === t ? "border-violet bg-violet/25 text-white" : "border-violet/25 text-ink-soft hover:bg-violet/10"}`}>{t}</button>)}</div>}
                      <label className="block text-xs text-ink-soft">Description
                        <textarea value={vt.desc} onChange={(e) => setVt((x) => ({ ...x, desc: e.target.value }))} rows={3} className={`${champ} mt-1 resize-y`} />
                      </label>
                      <div className="flex flex-wrap gap-1.5">{descriptions.map((d) => <button key={d.nom} type="button" onClick={() => setVt((x) => ({ ...x, desc: d.texte }))} className={`rounded-full border px-2.5 py-1 text-xs transition-all ${vt.desc === d.texte ? "border-violet bg-violet/25 text-white" : "border-violet/25 text-ink-soft hover:bg-violet/10"}`}>{d.nom}</button>)}</div>
                      <p className="text-xs text-ink-soft">Hashtags <span className="opacity-60">(clique pour ajouter ou retirer)</span></p>
                      <div className="flex flex-wrap gap-1.5">
                        {tagsProposes.map((h) => { const on = vt.tags.includes(h); return <button key={h} type="button" onClick={() => setVt((x) => ({ ...x, tags: on ? x.tags.filter((t) => t !== h) : [...x.tags, h] }))} className={`rounded-full border px-2.5 py-1 text-xs transition-all ${on ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100" : "border-white/15 text-ink-soft/70 hover:bg-white/5"}`}>{on ? "" : "+ "}{h}</button>; })}
                        <form onSubmit={(e) => { e.preventDefault(); const h = "#" + nouveauTag.replace(/^#+/, "").replace(/\s+/g, "").toLowerCase(); if (h.length > 1 && !vt.tags.includes(h)) setVt((x) => ({ ...x, tags: [...x.tags, h] })); setNouveauTag(""); }} className="inline-flex">
                          <input value={nouveauTag} onChange={(e) => setNouveauTag(e.target.value)} placeholder="+ nouveau" className="w-24 rounded-full border border-dashed border-white/20 bg-transparent px-2.5 py-1 text-xs text-ink outline-none focus:border-violet/60" />
                        </form>
                      </div>
                    </div>
                  )}
                  {export_.mode ? <p className={`text-xs ${export_.mode.startsWith("✓") ? "text-emerald-300/90" : "text-amber-200/90"}`}>{export_.mode}</p> : null}
                  {export_.ext === "webm" && <p className="text-xs text-ink-soft/70">Format WebM : accepté par TikTok et YouTube. Pour Instagram, exporte plutôt depuis Safari ou un Chrome récent (MP4).</p>}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* 5. Textes */}
      {(titre || jeu) && (
        <section className="carte-holo rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="document" className="w-5 h-5 text-lilac" /> 5. Titres et descriptions</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {textes.map((t) => (
              <div key={t.plateforme} className="rounded-xl border border-violet/15 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink">{t.plateforme}</span>
                  <button type="button" onClick={() => copier(t.texte, t.plateforme)} className="text-xs text-lilac underline underline-offset-2">{copie === t.plateforme ? "Copié ✓" : "Copier"}</button>
                </div>
                <pre className="whitespace-pre-wrap text-xs text-ink-soft font-sans">{t.texte}</pre>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
