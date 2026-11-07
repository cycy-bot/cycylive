"use client";

// 🎬 Studio montage — l'éditeur d'un projet (disposition inspirée de CapCut, pensée pour l'iPad à l'horizontale) :
//   barre du haut : retour aux projets, nom du projet, annuler / rétablir, Enregistrer, Télécharger ;
//   à gauche : Textes, Sous-titres, Effets, Médias ;  au centre : l'aperçu 9:16 dans un cadre 16:9 ;
//   à droite : les réglages de l'élément choisi (ou de la vidéo) ;  en bas : outils + timeline multipiste.
// Tout est calculé dans le navigateur : la vidéo ne part sur internet que pour être gardée dans le projet.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { liens } from "@/data/liens";
import { integre, ORIGINES_INTERFACE } from "@/components/admin/useEtatAdmin";
import { exporterMp4, webcodecsDispo } from "@/lib/mp4Export";
import { enregistrerBrouillon, type BrouillonInfo } from "@/lib/brouillonsMontage";
import { ANIMS, calquesDepuisModele, COULEURS, dessinerCalques, dessinerVideo, MODELE_DEFAUT, modeleDepuisCalques, NOMS, nouveauFlash, nouveauTexte, nouvelId, type Calque, type Modele } from "@/lib/habillageTikTok";
import { aTempsMonte, ajusterCalques, couper, debuts, DOC_VIDE, docDepuisEtat, dupliquerMorceau, dureeTotale, nouvelIdMorceau, supprimerMorceau, type ClipTwitch, type Disposition, type DocMontage, type Morceau } from "@/lib/montage/projet";
import { useHistorique } from "@/lib/montage/historique";
import { useOnde, usePellicule } from "@/lib/montage/apercus";
import TimelineMontage, { monteDepuisSource, type Outil, type Selection } from "@/components/admin/montage/TimelineMontage";

const CLE_MODELE = "cycy-modele-tiktok";
const ENDING = "/videos/ending-cycylive.mp4";
const W = 1080, H = 1920;
const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";
const DISPOS: { valeur: Disposition; label: string; aide: string; icone: NomIcone }[] = [
  { valeur: "vertical", label: "Déjà verticale", aide: "Vidéo déjà en 9:16 : on l’habille", icone: "smartphone" },
  { valeur: "facecam", label: "Caméra + jeu", aide: "Ta caméra en haut, le jeu en bas", icone: "camera" },
  { valeur: "floute", label: "Fond flouté", aide: "Le clip entier au centre", icone: "ecran" },
  { valeur: "recadre", label: "Recadré plein écran", aide: "Zoom sur l’action", icone: "smartphone" },
];
const ZOOMS = [25, 50, 75, 100, 125, 150, 200];

export type ProjetOuvert = { id: string; nom: string; nomFichier: string; cree: number; archive: boolean; fichier: Blob; etat: Record<string, unknown> | null; fichierEnLigne: boolean; clip: ClipTwitch | null; nouveau: boolean; exporter?: boolean };

const fmtLong = (s: number) => { const x = Math.max(0, s), h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), r = Math.floor(x % 60); return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`; };
const fmtPrecis = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
const dans = (b: { x: number; y: number; w: number; h: number }, p: { x: number; y: number }, m = 20) => p.x >= b.x - m && p.x <= b.x + b.w + m && p.y >= b.y - m && p.y <= b.y + b.h + m;

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
  const [onglet, setOnglet] = useState<"textes" | "soustitres" | "effets" | "medias">("textes");
  const [modele, setModele] = useState<Modele>(MODELE_DEFAUT);
  const [polices, setPolices] = useState({ display: "system-ui, sans-serif", sans: "system-ui, sans-serif" });
  const [sauve, setSauve] = useState<{ etat: "repos" | "enreg" | "ok" | "erreur"; maj?: number; message?: string }>({ etat: projet.nouveau ? "repos" : "ok" });
  const [quitter, setQuitter] = useState(false);
  const [menu, setMenu] = useState(false);
  const [panneauExport, setPanneauExport] = useState(Boolean(projet.exporter));
  const [export_, setExport] = useState<{ etat: "repos" | "en-cours" | "fini" | "erreur"; progres: number; url?: string; ext?: string; message?: string; mode?: string }>({ etat: "repos", progres: 0 });
  const [vt, setVt] = useState<{ titre: string; desc: string; tags: string[]; etat: "repos" | "envoi" | "ok" | "erreur"; pct: number; message?: string }>({ titre: "", desc: "", tags: [], etat: "repos", pct: 0 });
  const [copie, setCopie] = useState("");
  const pressePapier = useRef<{ type: "morceau"; m: Morceau } | { type: "calque"; c: Calque } | null>(null);
  const fichierEnLigne = useRef(projet.fichierEnLigne);
  const creeLe = useRef(projet.cree);
  const ctxDebloque = useRef<AudioContext | null>(null);

  const video = useRef<HTMLVideoElement>(null);
  const apercu = useRef<HTMLCanvasElement>(null);
  const finVideo = useRef<HTMLVideoElement>(null);
  const audio = useRef<{ ctx: AudioContext; dest: MediaStreamAudioDestinationNode; gain: GainNode; principal: GainNode; finGain: GainNode | null } | null>(null);
  const zones = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const kLecture = useRef(0); // morceau en cours de lecture
  const rafRef = useRef(0);
  const dernierT = useRef(-1);

  const pellicule = usePellicule(url, dureeSource);
  const onde = useOnde(projet.fichier);
  const total = Math.max(0.1, dureeTotale(doc.morceaux));
  const habille = doc.dispo === "vertical" || doc.dispo === "facecam";
  const etat = useRef({ doc, sel, polices, total });
  etat.current = { doc, sel, polices, total };

  // ── mise en place ──
  useEffect(() => {
    try { window.parent.postMessage({ type: "cycy-plein-ecran", actif: true }, "*"); } catch { /* hors interface */ }
    const sonde = (c: string) => { const s = document.createElement("span"); s.className = c; document.body.appendChild(s); const f = getComputedStyle(s).fontFamily; s.remove(); return f; };
    setPolices({ display: `${sonde("font-display")}, system-ui, sans-serif`, sans: `${sonde("font-sans")}, system-ui, sans-serif` });
    for (const [n, f] of [["CyAnton", "Anton-Regular.ttf"], ["CyBarlowC", "BarlowCondensed-Bold.ttf"], ["CyBarlow", "Barlow-SemiBold.ttf"]]) new FontFace(n, `url(/fonts/${f})`).load().then((x) => document.fonts.add(x)).catch(() => {});
    try { const m = JSON.parse(localStorage.getItem(CLE_MODELE) || "null"); if (m) setModele({ ...MODELE_DEFAUT, ...m }); } catch { /* modèle d'origine */ }
    const avant = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = avant; try { window.parent.postMessage({ type: "cycy-plein-ecran", actif: false }, "*"); } catch { /* rien */ } URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // quitter la page avec des modifications : le navigateur prévient
  useEffect(() => {
    const avant = (e: BeforeUnloadEvent) => { if (modifie || nomModifie) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", avant);
    return () => window.removeEventListener("beforeunload", avant);
  }, [modifie, nomModifie]);

  function auChargement(v: HTMLVideoElement) {
    const appliquer = (d: number) => {
      setDureeSource(d);
      const base = docDepuisEtat(projet.etat, d);
      if (!projet.etat) {
        base.titre = projet.clip?.titre || ""; base.jeu = projet.clip?.jeu || "";
        base.ending = modele.ending;
        if (v.videoHeight > v.videoWidth * 1.4) base.dispo = "vertical"; else base.dispo = "floute";
      }
      if (!base.calques.length) base.calques = calquesDepuisModele(modele, dureeTotale(base.morceaux), base.titre, "");
      reinitialiser(base);
      kLecture.current = 0; v.currentTime = base.morceaux[0]?.a ?? 0;
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
  const maj = useCallback(<K extends keyof DocMontage>(k: K, v: DocMontage[K], fusion?: string) => changer((d) => ({ ...d, [k]: v }), fusion ?? "champ-" + String(k)), [changer]);
  const majCalque = (id: string, q: Partial<Calque>, fusion = "calque-" + id) => setCalques((l) => l.map((c) => (c.id === id ? { ...c, ...q } : c)), fusion);
  function majTitre(t: string) { changer((d) => ({ ...d, titre: t, calques: d.calques.map((c) => (c.type === "carte" ? { ...c, texte: t } : c)) }), "titre"); }

  // le modèle (positions, durées, animations, textes fixes) est gardé pour les prochaines vidéos
  useEffect(() => {
    if (!pret || !doc.calques.length) return;
    try { localStorage.setItem(CLE_MODELE, JSON.stringify(modeleDepuisCalques(doc.calques, total, doc.ending))); } catch { /* rien */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.calques, doc.ending]);

  // ── lecture : les morceaux sont joués à la suite ──
  const allerA = useCallback((r: number) => {
    const v = video.current; if (!v) return;
    const m = etat.current.doc.morceaux, x = aTempsMonte(m, Math.max(0, Math.min(dureeTotale(m), r)));
    if (x.k < 0) return;
    kLecture.current = x.k; v.currentTime = x.src; setTM(Math.max(0, Math.min(dureeTotale(m), r)));
  }, []);
  function lectureOuPause() {
    const v = video.current; if (!v) return;
    if (v.paused) {
      if (tM >= total - 0.05) allerA(0);
      v.play().catch(() => {});
    } else v.pause();
  }
  useEffect(() => {
    const boucle = () => {
      if (export_.etat === "en-cours") { rafRef.current = requestAnimationFrame(boucle); return; }
      const v = video.current, c = apercu.current?.getContext("2d");
      const m = etat.current.doc.morceaux;
      if (v && m.length) {
        let k = Math.min(kLecture.current, m.length - 1);
        if (!v.paused) {
          // fin du morceau : on passe au suivant (ou on s'arrête à la fin de la vidéo)
          if (v.currentTime >= m[k].b - 0.012 || v.ended) {
            if (k + 1 < m.length) { k = k + 1; kLecture.current = k; if (Math.abs(v.currentTime - m[k].a) > 0.03) v.currentTime = m[k].a; }
            else { v.pause(); v.currentTime = m[k].b; }
          } else if (v.currentTime < m[k].a - 0.25) v.currentTime = m[k].a;
        }
        const rel = debuts(m)[k] + Math.max(0, Math.min(m[k].b, v.currentTime) - m[k].a);
        if (c && v.readyState >= 2) dessiner(c, v, v.currentTime, rel, true);
        if (Math.abs(rel - dernierT.current) > 0.02) { dernierT.current = rel; setTM(rel); }
      }
      rafRef.current = requestAnimationFrame(boucle);
    };
    rafRef.current = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [export_.etat]);

  // ── dessin d'une image (aperçu et export) ──
  function dessiner(ctx: CanvasRenderingContext2D, v: HTMLVideoElement, tSrc: number, rel: number, enApercu = false) {
    const e = etat.current, d = e.doc;
    const vw = v.videoWidth || 1920, vh = v.videoHeight || 1080;
    ctx.fillStyle = "#0d0a17"; ctx.fillRect(0, 0, W, H);
    const tot = Math.max(0.5, dureeTotale(d.morceaux));
    if (d.dispo === "vertical") dessinerVideo(ctx, v, rel, d.calques);
    else if (d.dispo === "floute") {
      const s = Math.max(W / vw, H / vh);
      ctx.save(); ctx.filter = "blur(36px) brightness(.55) saturate(1.2)"; ctx.drawImage(v, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s); ctx.restore();
      const fh = (W * vh) / vw, y = (H - fh) / 2 + 60;
      ctx.save(); ctx.shadowColor = "rgba(161,92,255,.6)"; ctx.shadowBlur = 40; ctx.drawImage(v, 0, y, W, fh); ctx.restore();
      if (d.titre) texteContour(ctx, d.titre, W / 2, y - 150, 76, e.polices.display, W - 120, 2);
    } else if (d.dispo === "recadre") {
      const sh = vh / d.zoom, sw = (sh * W) / H, sx = Math.max(0, Math.min(vw - sw, (vw - sw) * d.focusX)), sy = (vh - sh) / 2;
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, "rgba(13,10,23,.75)"); g.addColorStop(1, "rgba(13,10,23,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
      if (d.titre) texteContour(ctx, d.titre, W / 2, 220, 72, e.polices.display, W - 120, 2);
    } else {
      const hautH = Math.round(H * 0.38), cw = vw * d.cam.taille, ch = (cw * hautH) / W;
      const cx = Math.max(0, Math.min(vw - cw, vw * d.cam.x)), cy = Math.max(0, Math.min(vh - ch, vh * d.cam.y));
      ctx.drawImage(v, cx, cy, cw, ch, 0, 0, W, hautH);
      const basH = H - hautH, sh = vh / d.zoom, sw = Math.min(vw, (sh * W) / basH), sx = Math.max(0, Math.min(vw - sw, (vw - sw) * d.focusX));
      ctx.drawImage(v, sx, (vh - sh) / 2, sw, sh, 0, hautH, W, basH);
      ctx.fillStyle = "#b57cff"; ctx.fillRect(0, hautH - 4, W, 8);
    }
    // à l'arrêt, l'élément choisi est montré en entier (sans son animation d'entrée) pour le régler
    const idSel = enApercu && v.paused && e.sel?.type === "calque" ? e.sel.id : "";
    const cal = idSel ? d.calques.map((c) => (c.id === idSel ? { ...c, anim: "aucune" as const } : c)) : d.calques;
    if (d.dispo === "vertical" || d.dispo === "facecam") zones.current = dessinerCalques(ctx, rel, tot, cal, d.sousTitres, 0, tSrc);
    else {
      // textes ajoutés et flashs : aussi sur les autres dispositions
      const libres = cal.filter((c) => c.type === "texte" || c.type === "flash");
      zones.current = libres.length ? dessinerCalques(ctx, rel, tot, libres, [], 0, tSrc) : {};
      const st = d.sousTitres.find((x) => tSrc >= x.debut && tSrc < x.fin);
      if (st?.texte) texteContour(ctx, st.texte.toUpperCase(), W / 2, H * 0.72, 70, e.polices.display, W - 140, 2, "#ffffff");
      ctx.font = `600 34px ${e.polices.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillText(`twitch.tv/${chaine}`, W / 2, H - 120);
    }
    const z = enApercu && e.sel?.type === "calque" ? zones.current[e.sel.id] : null;
    if (z) {
      ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.strokeStyle = "rgba(255,170,235,.95)"; ctx.strokeRect(z.x - 8, z.y - 8, z.w + 16, z.h + 16); ctx.restore();
      // poignée pour agrandir / réduire
      ctx.save(); ctx.fillStyle = "#fff"; ctx.strokeStyle = "#a970ff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(z.x + z.w + 8, z.y + z.h + 8, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }

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
    const cal = etat.current.doc.calques, selId = etat.current.sel?.type === "calque" ? etat.current.sel.id : "";
    const zSel = selId ? zones.current[selId] : null;
    // poignée d'agrandissement du calque choisi
    if (zSel && Math.hypot(p0.x - (zSel.x + zSel.w + 8), p0.y - (zSel.y + zSel.h + 8)) < 60) {
      const c0 = cal.find((c) => c.id === selId)!; const k0 = c0.echelle || 1;
      const cx = zSel.x + zSel.w / 2, cy = zSel.y + zSel.h / 2, d0 = Math.hypot(p0.x - cx, p0.y - cy) || 1;
      cv.setPointerCapture(e.pointerId);
      const bouger = (ev: PointerEvent) => { const q = pt(ev.clientX, ev.clientY); const k = Math.max(0.4, Math.min(2.6, (k0 * Math.hypot(q.x - cx, q.y - cy)) / d0)); majCalque(selId, { echelle: +k.toFixed(3) }, "taille-" + selId); };
      const lacher = () => { cv.removeEventListener("pointermove", bouger); cv.removeEventListener("pointerup", lacher); couperGeste(); };
      cv.addEventListener("pointermove", bouger); cv.addEventListener("pointerup", lacher);
      return;
    }
    const ordre = [...cal].reverse();
    let cible = ordre.find((c) => c.id === selId && zones.current[c.id] && dans(zones.current[c.id], p0));
    if (!cible) cible = ordre.find((c) => zones.current[c.id] && dans(zones.current[c.id], p0));
    if (!cible) { setSel(null); return; }
    setSel({ type: "calque", id: cible.id });
    const c0 = cible, y0 = c0.type === "encart" && c0.lie ? (cal.find((x) => x.type === "barre")?.y ?? c0.y) : c0.y, x0 = c0.x;
    cv.setPointerCapture(e.pointerId);
    const bouger = (ev: PointerEvent) => {
      const q = pt(ev.clientX, ev.clientY), dy = (q.y - p0.y) / H, dx = (q.x - p0.x) / W;
      const ny = Math.max(0.03, Math.min(0.97, y0 + dy)), nx = Math.max(0.05, Math.min(0.95, x0 + dx));
      setCalques((l) => l.map((c) => {
        if (c0.type === "encart" && c0.lie) return c.type === "barre" ? { ...c, y: ny } : c;
        if (c.id !== c0.id) return c;
        return c.type === "flash" || c.type === "texte" || c.type === "etiquette" || c.type === "carte" ? { ...c, y: ny, x: nx } : { ...c, y: ny };
      }), "deplacer-" + c0.id);
    };
    const lacher = () => { cv.removeEventListener("pointermove", bouger); cv.removeEventListener("pointerup", lacher); couperGeste(); };
    cv.addEventListener("pointermove", bouger); cv.addEventListener("pointerup", lacher);
  }

  // ── outils ──
  const morceauSous = () => aTempsMonte(doc.morceaux, tM);
  function diviser() {
    if (sel?.type === "calque") {
      const c = doc.calques.find((x) => x.id === sel.id);
      if (c && c.type !== "soustitres" && c.type !== "barre" && c.type !== "encart" && tM > c.debut + 0.1 && tM < c.fin - 0.1) {
        const d2 = { ...c, id: nouvelId(), debut: tM };
        setCalques((l) => [...l.map((x) => (x.id === c.id ? { ...x, fin: tM } : x)), d2]); setSel({ type: "calque", id: d2.id }); return;
      }
    }
    const r = couper(doc.morceaux, tM);
    if (r.droite) { setMorceaux(() => r.morceaux); setSel({ type: "morceau", id: r.droite }); }
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
    const c = doc.calques.find((x) => x.id === sel.id);
    if (!c) return;
    if (c.type === "flash" || c.type === "texte") { setCalques((l) => l.filter((x) => x.id !== c.id)); setSel(null); }
    else majCalque(c.id, { visible: false }, "visible-" + c.id); // les éléments du thème se masquent (réaffichables)
  }
  function copier() {
    if (sel?.type === "morceau") { const m = doc.morceaux.find((x) => x.id === sel.id); if (m) pressePapier.current = { type: "morceau", m }; }
    else if (sel?.type === "calque") { const c = doc.calques.find((x) => x.id === sel.id); if (c && (c.type === "flash" || c.type === "texte")) pressePapier.current = { type: "calque", c }; }
  }
  function coller() {
    const pp = pressePapier.current; if (!pp) return;
    if (pp.type === "morceau") {
      const { k } = morceauSous(); const nouveau = { ...pp.m, id: nouvelIdMorceau() };
      setMorceaux((m) => { const out = [...m]; out.splice(k + 1, 0, nouveau); return out; }); setSel({ type: "morceau", id: nouveau.id });
    } else {
      const len = pp.c.fin - pp.c.debut, c = { ...pp.c, id: nouvelId(), debut: tM, fin: Math.min(total, tM + len) };
      setCalques((l) => [...l, c]); setSel({ type: "calque", id: c.id });
    }
  }
  function dupliquer() {
    if (sel?.type === "morceau") { const r = dupliquerMorceau(doc.morceaux, sel.id); if (r.id) { setMorceaux(() => r.morceaux); setSel({ type: "morceau", id: r.id }); } }
    else if (sel?.type === "calque") { const c = doc.calques.find((x) => x.id === sel.id); if (c && (c.type === "flash" || c.type === "texte")) { const len = c.fin - c.debut, n = { ...c, id: nouvelId(), debut: Math.min(total - 0.1, c.fin), fin: Math.min(total, c.fin + len) }; setCalques((l) => [...l, n]); setSel({ type: "calque", id: n.id }); } }
  }
  const ajouterFlash = () => { const f = nouveauFlash(tM); setCalques((l) => [...l, f]); setSel({ type: "calque", id: f.id }); };
  const ajouterTexte = () => { const c = nouveauTexte(tM, total); setCalques((l) => [...l, c]); setSel({ type: "calque", id: c.id }); };
  const image = (n: number) => { video.current?.pause(); allerA(Math.max(0, Math.min(total, tM + n / 30))); };

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
      else if (k === "a") setOutil("selection");
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
      return info;
    } catch (e) {
      setSauve({ etat: "erreur", message: "Projet non enregistré : " + (e instanceof Error ? e.message : String(e)) });
      return null;
    }
  }
  async function fermer(sauver: boolean | null) {
    if (sauver === null && (modifie || nomModifie)) { setQuitter(true); return; }
    video.current?.pause();
    const info = sauver ? await enregistrer() : null;
    if (sauver && !info) return; // l'erreur est affichée, on reste
    onFermer(info || undefined);
  }

  // ── export ──
  function brancherAudio() {
    const v = video.current; if (!v || audio.current) return;
    const ctx = ctxDebloque.current || new AudioContext();
    const src = ctx.createMediaElementSource(v), dest = ctx.createMediaStreamDestination(), gain = ctx.createGain(), principal = ctx.createGain();
    src.connect(principal); principal.connect(dest); src.connect(gain); gain.connect(ctx.destination);
    let finGain: GainNode | null = null;
    if (finVideo.current) { const fs = ctx.createMediaElementSource(finVideo.current); finGain = ctx.createGain(); fs.connect(finGain); finGain.connect(dest); }
    audio.current = { ctx, dest, gain, principal, finGain };
  }
  async function exporter() {
    const v = video.current; if (!v) return;
    v.pause();
    const fv = finVideo.current, avecFin = habille && doc.ending && Boolean(fv);
    if (avecFin && fv) { fv.muted = true; fv.play().then(() => { fv.pause(); fv.currentTime = 0; fv.muted = false; }).catch(() => { fv.muted = false; }); }
    if (!audio.current && !ctxDebloque.current) { try { ctxDebloque.current = new AudioContext(); ctxDebloque.current.resume().catch(() => {}); } catch { /* pas de son */ } }
    try { await exporterVideo(v, avecFin); }
    catch (er) { setExport({ etat: "erreur", progres: 0, message: "La création a échoué : " + (er instanceof Error ? er.message : String(er)) + ". Réessaie (garde l’onglet ouvert pendant la création)." }); }
  }
  function livrer(blob: Blob, ext: string, mode = "") {
    const u = URL.createObjectURL(blob);
    setExport({ etat: "fini", progres: 1, url: u, ext, mode });
    setVt({ titre: etat.current.doc.titre || nom, desc: descriptions[0]?.texte || "", tags: hashtags(doc.jeu), etat: "repos", pct: 0 });
    const a = document.createElement("a"); a.href = u; a.download = `${(nom || "tiktok-cycylive").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 50)}.${ext}`;
    document.body.appendChild(a); a.click(); a.remove();
  }
  async function exporterVideo(v: HTMLVideoElement, avecFin: boolean) {
    const m = etat.current.doc.morceaux, segs = m.map((x) => ({ a: x.a, b: x.b }));
    let raison = webcodecsDispo() ? "" : "ce navigateur ne sait pas encoder image par image";
    if (webcodecsDispo()) {
      setExport({ etat: "en-cours", progres: 0 });
      try {
        const r = await exporterMp4({
          video: v, source: projet.fichier, debut: 0, fin: dureeSource || v.duration, W, H, segments: segs,
          dessiner: (c, vv, t, rel) => dessiner(c, vv, t, rel),
          ending: avecFin && finVideo.current ? { el: finVideo.current, url: ENDING } : null,
          progres: (x) => setExport((e) => ({ ...e, progres: x })),
          ctxAudio: audio.current?.ctx || ctxDebloque.current,
        });
        if (r.son === "ok" || r.son === "plan-b") { livrer(r.blob, "mp4", r.son === "ok" ? "✓ MP4, 60 images/s, son vérifié dans le fichier" : "✓ MP4, 60 images/s · son réenregistré pour ce navigateur et vérifié"); return; }
        raison = (r.detail || "son introuvable dans le fichier") + " : la vidéo est refaite en direct, avec le son du lecteur";
      } catch (er) { raison = er instanceof Error ? er.message : String(er); }
    }
    // secours : enregistrement en direct, morceau par morceau
    v.muted = false; v.playbackRate = 1;
    brancherAudio();
    const a = audio.current!; await a.ctx.resume();
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
    const c = canvas.getContext("2d")!;
    const flux = canvas.captureStream(30);
    a.dest.stream.getAudioTracks().forEach((t) => flux.addTrack(t));
    const types = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
    const type = types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
    if (!type) { setExport({ etat: "erreur", progres: 0, message: "Ce navigateur ne sait pas enregistrer de vidéo : utilise Chrome, Edge ou Safari récent." }); return; }
    const parts: Blob[] = [];
    const rec = new MediaRecorder(flux, { mimeType: type, videoBitsPerSecond: 16_000_000 });
    rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
    const termine = new Promise<void>((ok) => { rec.onstop = () => ok(); });
    setExport({ etat: "en-cours", progres: 0 });
    a.gain.gain.value = 0;
    a.principal.gain.cancelScheduledValues(a.ctx.currentTime); a.principal.gain.value = 1;
    if (a.finGain) { a.finGain.gain.cancelScheduledValues(a.ctx.currentTime); a.finGain.gain.value = 0; }
    v.pause();
    const dureeTot = Math.max(0.1, dureeTotale(m));
    let fait = 0;
    for (let k = 0; k < segs.length; k++) {
      const x = segs[k];
      v.currentTime = x.a; await new Promise((ok) => v.addEventListener("seeked", ok, { once: true }));
      if (k === 0) { await new Promise((ok) => setTimeout(ok, 350)); dessiner(c, v, v.currentTime, 0); rec.start(250); }
      else { dessiner(c, v, v.currentTime, fait); await new Promise((ok) => setTimeout(ok, 60)); if (rec.state === "paused") rec.resume(); }
      await v.play();
      await new Promise<void>((ok) => {
        let dm = 0;
        const pas = () => {
          const rel = fait + Math.max(0, v.currentTime - x.a);
          dessiner(c, v, v.currentTime, rel);
          const mt = performance.now(); if (mt - dm > 200) { dm = mt; setExport((e) => ({ ...e, progres: Math.min(avecFin ? 0.95 : 1, (rel / dureeTot) * (avecFin ? 0.95 : 1)) })); }
          if (v.currentTime >= x.b || v.ended) { v.pause(); ok(); return; }
          requestAnimationFrame(pas);
        };
        requestAnimationFrame(pas);
      });
      fait += x.b - x.a;
      if (k < segs.length - 1 && rec.state === "recording") rec.pause();
    }
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
          const pas = () => { c.globalAlpha = 1; c.drawImage(fige, 0, 0); c.globalAlpha = Math.min(1, fv.currentTime / 0.4); c.drawImage(fv, 0, 0, W, H); c.globalAlpha = 1; if (fv.ended || fv.currentTime >= (fv.duration || 4) - 0.03 || Date.now() > limite) { ok(); return; } requestAnimationFrame(pas); };
          requestAnimationFrame(pas);
        });
      } catch { /* sans la cinématique */ }
      fv.pause(); a.principal.gain.cancelScheduledValues(a.ctx.currentTime); a.principal.gain.value = 1;
    }
    rec.stop(); await termine; a.gain.gain.value = 1;
    livrer(new Blob(parts, { type: type.split(";")[0] }), type.includes("mp4") ? "mp4" : "webm", "Mode de secours (enregistrement en direct, 30 images/s) · raison : " + raison);
  }

  // images fixes (miniature YouTube / story) à partir de l'image en cours
  function visuel(type: "miniature" | "story") {
    const v = video.current; if (!v) return;
    const [w, h] = type === "miniature" ? [1280, 720] : [1080, 1920];
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const c = canvas.getContext("2d")!;
    const vw = v.videoWidth || 1920, vh = v.videoHeight || 1080, s = Math.max(w / vw, h / vh), titre = doc.titre || nom;
    if (type === "story") c.filter = "blur(30px) brightness(.5)";
    c.drawImage(v, (w - vw * s) / 2, (h - vh * s) / 2, vw * s, vh * s); c.filter = "none";
    if (type === "miniature") {
      const g = c.createLinearGradient(0, h, 0, h * 0.35); g.addColorStop(0, "rgba(13,10,23,.95)"); g.addColorStop(1, "rgba(13,10,23,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = "#9146ff"; c.fillRect(48, h - 250, 14, 170);
      c.font = `800 82px ${polices.display}`; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.lineJoin = "round";
      lignes(c, (titre || "Nouveau clip").toUpperCase(), w - 160).slice(0, 2).forEach((l, i, arr) => { const y = h - 90 - (arr.length - 1 - i) * 88; c.lineWidth = 14; c.strokeStyle = "rgba(24,10,48,.95)"; c.strokeText(l, 84, y); c.fillStyle = "#fff"; c.fillText(l, 84, y); });
      if (doc.jeu) { c.font = `700 30px ${polices.sans}`; c.fillStyle = "#e0b3ff"; c.fillText(doc.jeu.toUpperCase(), 86, h - 270); }
    } else {
      const fh = (w * vh) / vw, y = (h - fh) / 2;
      c.save(); c.shadowColor = "rgba(161,92,255,.7)"; c.shadowBlur = 50; c.drawImage(v, 0, y, w, fh); c.restore();
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
  const champ = "w-full rounded-lg bg-[#0e0a1c] border border-violet/25 px-3 py-2 text-sm text-ink outline-none focus:border-violet/70";
  const etiquette = "block text-xs text-ink-soft";
  const btnOutil = (actif = false) => `flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm transition-all disabled:opacity-35 disabled:pointer-events-none ${actif ? "bg-violet text-white" : "text-ink-soft hover:bg-white/10 hover:text-ink"}`;
  const ongletBtn = (k: typeof onglet, ic: NomIcone, t: string) => (
    <button type="button" onClick={() => setOnglet(k)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-all ${onglet === k ? "bg-violet/25 text-ink" : "text-ink-soft hover:bg-white/5"}`}><Icone nom={ic} className="h-5 w-5" />{t}</button>
  );
  const etatSauve = sauve.etat === "enreg" ? "Enregistrement…" : sauve.etat === "erreur" ? "⚠️ Non enregistré" : modifie || nomModifie ? "Modifications non enregistrées" : sauve.maj ? `Enregistré à ${new Date(sauve.maj).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#0a0614] text-ink">
      <video ref={finVideo} src={ENDING} preload="auto" playsInline className="hidden" />
      <video ref={video} src={url} playsInline preload="auto" className="hidden" crossOrigin="anonymous"
        onLoadedMetadata={(e) => auChargement(e.currentTarget)} onPlay={() => setEnLecture(true)} onPause={() => setEnLecture(false)}
        onError={() => setSauve({ etat: "erreur", message: "Ce clip ne peut pas être lu ici : réimporte-le en MP4." })} />

      {/* ── barre du haut ── */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#110b20] px-2 md:px-3">
        <button type="button" onClick={() => fermer(null)} className={btnOutil()} title="Retour à mes projets"><Icone nom="retour" className="h-5 w-5" /><span className="hidden lg:inline">Projets</span></button>
        <input value={nom} onChange={(e) => { setNom(e.target.value); setNomModifie(true); }} maxLength={120} aria-label="Nom du projet"
          className="min-w-0 max-w-[340px] flex-1 rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-[15px] font-semibold text-ink outline-none hover:border-white/15 focus:border-violet/60 focus:bg-black/30" />
        <span className={`hidden text-xs md:inline ${sauve.etat === "erreur" ? "text-red-300" : modifie || nomModifie ? "text-amber-200" : "text-ink-soft/70"}`} title={sauve.message}>{(modifie || nomModifie) && sauve.etat !== "enreg" ? "● " : ""}{etatSauve}</span>
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
      <div className="grid min-h-0 flex-[1.1] grid-cols-[minmax(210px,0.9fr)_minmax(0,1.7fr)_minmax(230px,1fr)] gap-2 p-2">
        {/* bibliothèque */}
        <section className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[#120c22]">
          <div className="flex gap-1 border-b border-white/10 p-1.5">
            {ongletBtn("textes", "lettres", "Textes")}
            {ongletBtn("soustitres", "bulle", "Sous-titres")}
            {ongletBtn("effets", "eclair", "Effets")}
            {ongletBtn("medias", "image", "Médias")}
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
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
                <p className="text-xs text-ink-soft">Colle ce qui est dit, puis « Répartir » : le texte est découpé en cartons. Ou ajoute un carton à la tête de lecture.{habille && " Entoure un mot d’astérisques (*ACE*) pour l’écrire en rose."}</p>
                <textarea value={doc.transcription} onChange={(e) => maj("transcription", e.target.value)} rows={3} className={champ} placeholder="Non mais c’est pas possible…" />
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" disabled={!doc.transcription.trim()} onClick={() => {
                    const mots = doc.transcription.split(/\s+/).filter(Boolean); if (!mots.length) return;
                    const cartons: string[] = []; for (let i = 0; i < mots.length;) { const n = Math.min(mots.length - i, mots.length - i <= 6 ? mots.length - i : 4); cartons.push(mots.slice(i, i + n).join(" ")); i += n; }
                    // réparti sur la vidéo montée : chaque carton est calé sur l'image source correspondante
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
            {onglet === "medias" && (
              <>
                <div className="overflow-hidden rounded-xl border border-violet/25 bg-black/40">
                  {pellicule.images[0] ? <img src={pellicule.images[Math.floor(pellicule.images.length / 3)] || pellicule.images[0]} alt="" className="aspect-video w-full object-cover" /> : <span className="flex aspect-video items-center justify-center text-2xl">🎞️</span>}
                  <p className="truncate px-2.5 py-2 text-xs text-ink">{projet.nomFichier} · {fmtPrecis(dureeSource)}</p>
                </div>
                <p className="rounded-xl border border-dashed border-violet/30 p-3 text-xs text-ink-soft">Prochaine étape du Studio montage : importer des photos, des sons / musiques et d’autres vidéos (à la suite ou en incrustation), chacun sur sa piste.</p>
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
              <button type="button" onClick={() => image(1)} className={btnOutil()} title="Image suivante (→)"><Icone nom="fleche" className="h-4 w-4" /></button>
            </div>
            <div className="flex w-44 items-center gap-1.5">
              <input type="range" min={25} max={200} step={5} value={zoomApercu} onChange={(e) => setZoomApercu(+e.target.value)} className="w-full accent-violet-500" aria-label="Taille de l’aperçu" />
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
              {calqueSel.type !== "barre" && calqueSel.type !== "flash" && (
                <label className={etiquette}>Taille : {Math.round((calqueSel.echelle || 1) * 100)} % <span className="opacity-60">(ou tire la poignée ronde sur l’aperçu)</span><input type="range" min={0.4} max={2.6} step={0.02} value={calqueSel.echelle || 1} onChange={(e) => majCalque(calqueSel.id, { echelle: +e.target.value }, "taille-" + calqueSel.id)} className="mt-1 w-full accent-violet-500" /></label>
              )}
              {!(calqueSel.type === "encart" && calqueSel.lie) && calqueSel.type !== "flash" && (
                <label className={etiquette}>Hauteur : {Math.round(calqueSel.y * 100)} %<input type="range" min={0.05} max={0.95} step={0.002} value={calqueSel.y} onChange={(e) => majCalque(calqueSel.id, { y: +e.target.value })} className="mt-1 w-full accent-violet-500" /></label>
              )}
              {calqueSel.type === "encart" && <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={calqueSel.lie} onChange={(e) => majCalque(calqueSel.id, { lie: e.target.checked })} className="accent-violet-500" /> Collé à la séparation caméra / jeu</label>}
              {calqueSel.type === "flash" && (
                <>
                  <label className={etiquette}>Durée : {(calqueSel.fin - calqueSel.debut).toFixed(2)} s<input type="range" min={0.1} max={0.6} step={0.05} value={calqueSel.fin - calqueSel.debut} onChange={(e) => majCalque(calqueSel.id, { fin: calqueSel.debut + +e.target.value })} className="mt-1 w-full accent-violet-500" /></label>
                  <label className={etiquette}>Intensité : {Math.round(calqueSel.intensite * 100)} %<input type="range" min={0.15} max={1} step={0.05} value={calqueSel.intensite} onChange={(e) => majCalque(calqueSel.id, { intensite: +e.target.value })} className="mt-1 w-full accent-violet-500" /></label>
                  <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={calqueSel.zoom} onChange={(e) => majCalque(calqueSel.id, { zoom: e.target.checked })} className="accent-violet-500" /> Petit zoom sur le jeu</label>
                  <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={calqueSel.onde} onChange={(e) => majCalque(calqueSel.id, { onde: e.target.checked })} className="accent-violet-500" /> Onde au viseur (déplace-la sur l’aperçu)</label>
                </>
              )}
              {calqueSel.type === "barre" && <p className="text-xs text-ink-soft/80">La barre marque la séparation caméra / jeu : déplace-la sur l’aperçu, l’encart la suit.</p>}
              {calqueSel.type === "soustitres" && <p className="text-xs text-ink-soft/80">Les cartons se règlent dans l’onglet « Sous-titres » à gauche ; ici leur style.</p>}
            </div>
          ) : morceauSel ? (
            <div className="space-y-3">
              <b className="block text-sm">🎞️ Morceau de vidéo</b>
              <p className="text-xs text-ink-soft">Du {fmtPrecis(morceauSel.a)} au {fmtPrecis(morceauSel.b)} du clip · {(morceauSel.b - morceauSel.a).toFixed(2)} s</p>
              <div className="grid grid-cols-2 gap-2">
                <label className={etiquette}>Début (s)<input type="number" step={0.033} value={+morceauSel.a.toFixed(2)} onChange={(e) => setMorceaux((l) => l.map((x) => (x.id === morceauSel.id ? { ...x, a: Math.max(0, Math.min(x.b - 0.1, +e.target.value)) } : x)), "m-a-" + morceauSel.id)} className={`${champ} mt-1`} /></label>
                <label className={etiquette}>Fin (s)<input type="number" step={0.033} value={+morceauSel.b.toFixed(2)} onChange={(e) => setMorceaux((l) => l.map((x) => (x.id === morceauSel.id ? { ...x, b: Math.min(dureeSource, Math.max(x.a + 0.1, +e.target.value)) } : x)), "m-b-" + morceauSel.id)} className={`${champ} mt-1`} /></label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={diviser} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">✂️ Diviser à la tête</button>
                <button type="button" onClick={dupliquer} className="rounded-full border border-violet/30 px-3 py-1.5 text-xs">Dupliquer</button>
                <button type="button" onClick={supprimer} disabled={doc.morceaux.length <= 1} className="rounded-full border border-red-300/40 px-3 py-1.5 text-xs text-red-100 disabled:opacity-40">Supprimer</button>
              </div>
              <p className="text-xs text-ink-soft/70">Sur la timeline : tire les bords blancs pour rogner, glisse le morceau pour changer l’ordre.</p>
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
              {doc.dispo !== "floute" && doc.dispo !== "vertical" && <label className={etiquette}>Cadrage (gauche ↔ droite)<input type="range" min={0} max={1} step={0.01} value={doc.focusX} onChange={(e) => maj("focusX", +e.target.value)} className="mt-1 w-full accent-violet-500" /></label>}
              {doc.dispo !== "floute" && doc.dispo !== "vertical" && <label className={etiquette}>Zoom : ×{doc.zoom.toFixed(2)}<input type="range" min={1} max={2.5} step={0.05} value={doc.zoom} onChange={(e) => maj("zoom", +e.target.value)} className="mt-1 w-full accent-violet-500" /></label>}
              {doc.dispo === "facecam" && (
                <>
                  <label className={etiquette}>Caméra : horizontal<input type="range" min={0} max={1} step={0.01} value={doc.cam.x} onChange={(e) => maj("cam", { ...doc.cam, x: +e.target.value })} className="mt-1 w-full accent-violet-500" /></label>
                  <label className={etiquette}>Caméra : vertical<input type="range" min={0} max={1} step={0.01} value={doc.cam.y} onChange={(e) => maj("cam", { ...doc.cam, y: +e.target.value })} className="mt-1 w-full accent-violet-500" /></label>
                  <label className={etiquette}>Caméra : taille<input type="range" min={0.12} max={0.6} step={0.01} value={doc.cam.taille} onChange={(e) => maj("cam", { ...doc.cam, taille: +e.target.value })} className="mt-1 w-full accent-violet-500" /></label>
                </>
              )}
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
          <span className="mx-1 h-6 w-px bg-white/10" />
          <button type="button" onClick={ajouterTexte} className={btnOutil()} title="Texte à la tête de lecture"><Icone nom="lettres" className="h-5 w-5" /><span className="text-xs">Texte</span></button>
          <button type="button" onClick={ajouterFlash} className={btnOutil()} title="Flash de kill à la tête de lecture"><Icone nom="eclair" className="h-5 w-5" /><span className="text-xs">Flash</span></button>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => setZoomTl((z) => Math.max(8, z / 1.4))} className={btnOutil()} aria-label="Dézoomer la timeline"><Icone nom="loupeMoins" className="h-5 w-5" /></button>
            <input type="range" min={8} max={400} value={zoomTl} onChange={(e) => setZoomTl(+e.target.value)} className="w-28 accent-violet-500" aria-label="Zoom de la timeline" />
            <button type="button" onClick={() => setZoomTl((z) => Math.min(600, z * 1.4))} className={btnOutil()} aria-label="Zoomer la timeline"><Icone nom="loupePlus" className="h-5 w-5" /></button>
            <button type="button" onClick={() => { const w = (typeof window !== "undefined" ? window.innerWidth : 1000) - 180; setZoomTl(Math.max(8, Math.min(600, w / total))); }} className={btnOutil()} title="Toute la vidéo">⤢</button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          {pret && (
            <TimelineMontage dureeSource={dureeSource} morceaux={doc.morceaux} calques={habille ? doc.calques : doc.calques.filter((c) => c.type === "texte" || c.type === "flash")} sousTitres={doc.sousTitres} t={tM} sel={sel} setSel={setSel} outil={outil}
              setMorceaux={setMorceaux} setCalques={setCalques} finGeste={couperGeste} onSeek={(r) => { video.current?.pause(); allerA(r); }} onCouperA={couperA}
              pellicule={pellicule} onde={onde} zoom={zoomTl} setZoom={setZoomTl} />
          )}
        </div>
      </div>

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
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={exporter} disabled={export_.etat === "en-cours" || !pret} className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm hover:bg-violet-light disabled:opacity-50">
                <Icone nom="clap" className="h-4 w-4" /> {export_.etat === "en-cours" ? `Création… ${Math.round(export_.progres * 100)} %` : export_.etat === "fini" ? "Recréer la vidéo" : "Créer et télécharger"}
              </button>
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
