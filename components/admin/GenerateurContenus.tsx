"use client";

// Générateur de contenus à partir d'un clip : vidéo verticale (TikTok / Reels / Shorts) avec cadrage,
// coupe, titre et sous-titres dans la DA Cycylive, miniature YouTube, story « nouveau clip », et textes
// prêts à copier. Tout est calculé dans le navigateur (canvas + MediaRecorder) : la vidéo ne quitte
// jamais l'ordinateur ou le téléphone, et la publication reste entièrement entre les mains de Cycy.
import { useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { liens } from "@/data/liens";

type ClipTwitch = { id: string; titre: string; url: string; miniature: string; vues: number; duree: number; date: string; jeu: string };
type Disposition = "recadre" | "floute" | "facecam";
type SousTitre = { id: string; debut: number; fin: number; texte: string };

const W = 1080, H = 1920;
const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";
const DISPOS: { valeur: Disposition; label: string; aide: string; icone: NomIcone }[] = [
  { valeur: "floute", label: "Fond flouté", aide: "Le clip entier au centre, titre au-dessus", icone: "ecran" },
  { valeur: "recadre", label: "Recadré plein écran", aide: "Zoom sur l’action, en vertical", icone: "smartphone" },
  { valeur: "facecam", label: "Caméra + jeu", aide: "Ta caméra en haut, le jeu en bas", icone: "camera" },
];

const id = () => Math.random().toString(36).slice(2, 9);
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
  const [dispo, setDispo] = useState<Disposition>("floute");
  const [focusX, setFocusX] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [cam, setCam] = useState({ x: 0.02, y: 0.02, taille: 0.3 });
  const [titre, setTitre] = useState("");
  const [jeu, setJeu] = useState("");
  const [sousTitres, setSousTitres] = useState<SousTitre[]>([]);
  const [transcription, setTranscription] = useState("");
  const [export_, setExport] = useState<{ etat: "repos" | "en-cours" | "fini" | "erreur"; progres: number; url?: string; ext?: string; message?: string }>({ etat: "repos", progres: 0 });
  const [copie, setCopie] = useState("");
  const [polices, setPolices] = useState({ display: "system-ui, sans-serif", sans: "system-ui, sans-serif" });

  const video = useRef<HTMLVideoElement>(null);
  const apercu = useRef<HTMLCanvasElement>(null);
  const audio = useRef<{ ctx: AudioContext; dest: MediaStreamAudioDestinationNode; gain: GainNode } | null>(null);
  const rafRef = useRef(0);
  const etat = useRef({ dispo, focusX, zoom, cam, titre, sousTitres, polices });
  etat.current = { dispo, focusX, zoom, cam, titre, sousTitres, polices };

  useEffect(() => {
    fetch("/api/clips-recents").then((r) => r.json()).then((d) => setClips(d.clips || [])).catch(() => {});
    const sonde = (c: string) => { const s = document.createElement("span"); s.className = c; document.body.appendChild(s); const f = getComputedStyle(s).fontFamily; s.remove(); return f; };
    setPolices({ display: `${sonde("font-display")}, system-ui, sans-serif`, sans: `${sonde("font-sans")}, system-ui, sans-serif` });
  }, []);

  // ── Dessin d'une image (aperçu et export) ──
  function dessiner(ctx: CanvasRenderingContext2D, v: HTMLVideoElement, t: number) {
    const e = etat.current;
    const vw = v.videoWidth || 1920, vh = v.videoHeight || 1080;
    ctx.fillStyle = "#0d0a17";
    ctx.fillRect(0, 0, W, H);
    if (e.dispo === "floute") {
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
      if (e.titre) texteContour(ctx, e.titre, W / 2, hautH + 120, 66, e.polices.display, W - 120, 2);
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
      const v = video.current, c = apercu.current?.getContext("2d");
      if (v && c && v.readyState >= 2) dessiner(c, v, v.currentTime);
      if (v && fin && v.currentTime >= fin && !v.paused && export_.etat !== "en-cours") { v.currentTime = debut; }
      rafRef.current = requestAnimationFrame(boucle);
    };
    rafRef.current = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fichier, debut, fin, export_.etat]);

  function charger(f: File) {
    if (fichier) URL.revokeObjectURL(fichier);
    setFichier(URL.createObjectURL(f));
    setNomFichier(f.name);
    setExport({ etat: "repos", progres: 0 });
    setSousTitres([]);
  }

  function choisirClip(c: ClipTwitch) {
    setClipChoisi(c);
    setTitre(c.titre);
    setJeu(c.jeu);
  }

  function brancherAudio() {
    const v = video.current;
    if (!v || audio.current) return;
    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(v);
    const dest = ctx.createMediaStreamDestination();
    const gain = ctx.createGain();
    src.connect(dest);
    src.connect(gain);
    gain.connect(ctx.destination);
    audio.current = { ctx, dest, gain };
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
    brancherAudio();
    const a = audio.current!;
    await a.ctx.resume();
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext("2d")!;
    const flux = canvas.captureStream(30);
    a.dest.stream.getAudioTracks().forEach((t) => flux.addTrack(t));
    const types = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
    const type = types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
    if (!type) { setExport({ etat: "erreur", progres: 0, message: "Ce navigateur ne sait pas enregistrer de vidéo : utilise Chrome, Edge ou Safari récent." }); return; }
    const morceaux: Blob[] = [];
    const rec = new MediaRecorder(flux, { mimeType: type, videoBitsPerSecond: 8_000_000 });
    rec.ondataavailable = (e) => { if (e.data.size) morceaux.push(e.data); };
    const termine = new Promise<void>((ok) => { rec.onstop = () => ok(); });
    setExport({ etat: "en-cours", progres: 0 });
    a.gain.gain.value = 0; // export silencieux pour toi, le son est bien dans la vidéo
    v.pause();
    v.currentTime = debut;
    await new Promise((ok) => v.addEventListener("seeked", ok, { once: true }));
    rec.start(250);
    await v.play();
    const finT = fin || v.duration;
    await new Promise<void>((ok) => {
      const pas = () => {
        dessiner(c, v, v.currentTime);
        setExport((x) => ({ ...x, progres: Math.min(1, (v.currentTime - debut) / Math.max(0.1, finT - debut)) }));
        if (v.currentTime >= finT || v.ended) { v.pause(); ok(); return; }
        requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    });
    rec.stop();
    await termine;
    a.gain.gain.value = 1;
    const blob = new Blob(morceaux, { type: type.split(";")[0] });
    setExport({ etat: "fini", progres: 1, url: URL.createObjectURL(blob), ext: type.includes("mp4") ? "mp4" : "webm" });
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
  const textes = useMemo(() => {
    const t = titre || "ce moment";
    const tags = hashtags(jeu).join(" ");
    return [
      { plateforme: "TikTok", texte: `${t} 😱 ${jeu ? `#${jeu.replace(/\s+/g, "")}` : ""}\nRetrouve-moi en live sur Twitch : ${chaine} 💜\n${tags}`.trim() },
      { plateforme: "Reels Instagram", texte: `${t} ✨\n\nTous les lives sont sur Twitch (lien en bio) 💜\n\n${tags}` },
      { plateforme: "YouTube Shorts", texte: `${t}${jeu ? ` | ${jeu}` : ""} #shorts\n\nLive sur Twitch : https://twitch.tv/${chaine}\n${tags}` },
      { plateforme: "Titres alternatifs", texte: [`POV : ${t.toLowerCase()}`, `Personne ne s’attendait à ça… ${jeu ? `(${jeu})` : ""}`.trim(), `${t} 💀`, `Le moment où tout bascule${jeu ? ` sur ${jeu}` : ""}`].join("\n") },
    ];
  }, [titre, jeu]);

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

  const champBase = "rounded-lg bg-card border border-violet/20 px-3 py-2 text-sm text-ink outline-none focus:border-violet/60";
  const champ = `w-full ${champBase}`;
  const curseur = "w-full accent-violet-500";

  return (
    <div className="space-y-6">
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
            <h3 className="font-semibold text-ink flex items-center gap-2 mb-4"><Icone nom="smartphone" className="w-5 h-5 text-lilac" /> 2. Vidéo verticale</h3>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4 min-w-0">
                <video ref={video} src={fichier} controls playsInline className="w-full rounded-xl bg-black" crossOrigin="anonymous"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    const appliquer = (d: number) => { setDuree(d); setDebut(0); setFin(d); };
                    if (Number.isFinite(v.duration) && v.duration > 0) return appliquer(v.duration);
                    // Certains fichiers (WebM enregistrés) n'indiquent pas leur durée : on la fait calculer
                    const lire = () => { if (Number.isFinite(v.duration) && v.duration > 0) { v.removeEventListener("durationchange", lire); appliquer(v.duration); v.currentTime = 0; } };
                    v.addEventListener("durationchange", lire);
                    v.currentTime = 1e7;
                  }}
                  onPlay={brancherAudio} />
                <div className="grid gap-2 sm:grid-cols-3">
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
                <label className="block text-sm text-ink-soft">Titre affiché sur la vidéo
                  <input value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={70} className={`${champ} mt-1`} placeholder="Le clutch le plus fou de la saison" />
                </label>
                <label className="block text-sm text-ink-soft">Jeu (pour les hashtags)
                  <input value={jeu} onChange={(e) => setJeu(e.target.value)} className={`${champ} mt-1`} placeholder="VALORANT" />
                </label>
              </div>
              <div>
                <canvas ref={apercu} width={W} height={H} className="w-full max-w-[260px] mx-auto rounded-2xl border border-violet/25 bg-[#0d0a17] shadow-glow-sm" aria-label="Aperçu vertical" />
                <p className="mt-2 text-center text-xs text-ink-soft/70">Aperçu 1080×1920 · lance la vidéo pour le voir bouger</p>
              </div>
            </div>
          </section>

          {/* 3. Sous-titres */}
          <section className="carte-holo rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-ink flex items-center gap-2"><Icone nom="bulle" className="w-5 h-5 text-lilac" /> 3. Sous-titres</h3>
            <p className="text-sm text-ink-soft">Colle ce qui est dit dans le clip et clique « Répartir » : le texte est découpé en cartons sur la durée. Ajuste ensuite les temps, ou ajoute un carton au moment où la vidéo est en pause.</p>
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
                <Icone nom="clap" className="w-4 h-4" /> {export_.etat === "en-cours" ? `Création… ${Math.round(export_.progres * 100)} %` : "Créer la vidéo verticale"}
              </button>
              <button type="button" onClick={() => visuel("miniature")} className="rounded-full border border-violet/30 px-4 py-2.5 text-sm text-ink-soft hover:bg-violet/10 transition-all">Miniature YouTube (image en cours)</button>
              <button type="button" onClick={() => visuel("story")} className="rounded-full border border-violet/30 px-4 py-2.5 text-sm text-ink-soft hover:bg-violet/10 transition-all">Story « Nouveau clip »</button>
            </div>
            {export_.etat === "en-cours" && (
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-violet transition-all" style={{ width: `${Math.round(export_.progres * 100)}%` }} /></div>
            )}
            <p className="text-xs text-ink-soft/70">La vidéo se crée en temps réel (un clip de 30 s prend 30 s) : garde l’onglet ouvert. Astuce : pour la miniature et la story, mets d’abord la vidéo en pause sur la meilleure image.</p>
            {export_.etat === "erreur" && <p className="text-sm text-red-300" role="alert">{export_.message}</p>}
            {export_.etat === "fini" && export_.url && (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
                <video src={export_.url} controls playsInline className="h-56 rounded-xl bg-black" />
                <div className="space-y-2">
                  <p className="text-sm text-emerald-100">Ta vidéo est prête ({export_.ext?.toUpperCase()}) !</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={export_.url} download={`clip-cycylive.${export_.ext}`} className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white hover:bg-violet-light transition-all">Télécharger</a>
                    <button type="button" onClick={partager} className="rounded-full border border-violet/30 px-4 py-2 text-sm text-ink-soft hover:bg-violet/10 transition-all">Partager (TikTok, Insta…)</button>
                  </div>
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
