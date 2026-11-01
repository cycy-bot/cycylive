"use client";

// Studio de stories (Instagram / TikTok, 1080 × 1920) : « Je lance le live », « Live ce soir »,
// planning de la semaine, soirée OFF. Les images sont dessinées dans le navigateur (canvas),
// puis partagées directement (feuille de partage du téléphone → Instagram, TikTok…) ou téléchargées.
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { JourPlanning } from "@/data/planning";
import { JOURS_ORDRE, LABEL_GENERIQUE } from "@/data/planning";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { IconTwitch } from "@/components/Icons";
import { illustrationPour } from "@/lib/illustrationJeu";
import { liens } from "@/data/liens";
import { FONDS, DUREE_BOUCLE, dessinerFondStory, type StyleFond } from "@/lib/fondsStories";

type Modele = "live" | "cesoir" | "planning" | "off";
const MODELES: { valeur: Modele; label: string; icone: NomIcone }[] = [
  { valeur: "live", label: "Je lance le live", icone: "live" },
  { valeur: "cesoir", label: "Live ce soir", icone: "horloge" },
  { valeur: "planning", label: "Planning de la semaine", icone: "calendrier" },
  { valeur: "off", label: "Soirée OFF", icone: "dodo" },
];

const L = 1080, H = 1920;
const VIOLET = "#a15cff", LILAS = "#e0b3ff", FOND = "#0d0a17";
const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";

// ── Outils de dessin ─────────────────────────────────────────

function chargerImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = src;
  });
}

// Une icône React (banque Cycylive ou Twitch) transformée en image pour le canvas
async function iconeEnImage(element: React.ReactElement, couleur: string): Promise<HTMLImageElement | null> {
  const div = document.createElement("div");
  const racine = createRoot(div);
  flushSync(() => racine.render(element));
  const svg = div.querySelector("svg");
  if (!svg) return null;
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "240");
  svg.setAttribute("height", "240");
  const code = svg.outerHTML.replace(/currentColor/g, couleur);
  racine.unmount();
  return chargerImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(code)}`);
}

function pilule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function lignes(ctx: CanvasRenderingContext2D, texte: string, largeur: number): string[] {
  const mots = texte.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let ligne = "";
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeur && ligne) {
      out.push(ligne);
      ligne = mot;
    } else ligne = essai;
  }
  if (ligne) out.push(ligne);
  return out;
}

function texteCentre(ctx: CanvasRenderingContext2D, texte: string, y: number, taille: number, police: string, couleur: string, poids = 700, max = 920, interligne = 1.12, maxLignes = 3) {
  ctx.font = `${poids} ${taille}px ${police}`;
  ctx.fillStyle = couleur;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const ls = lignes(ctx, texte, max).slice(0, maxLignes);
  ls.forEach((l, i) => ctx.fillText(l, L / 2, y + i * taille * interligne));
  return y + (ls.length - 1) * taille * interligne;
}

type Ressources = {
  fond: HTMLImageElement | null;
  photo: HTMLImageElement | null;
  logo: HTMLImageElement | null;
  twitch: HTMLImageElement | null;
  icones: Record<string, HTMLImageElement | null>;
  display: string;
  sans: string;
};

function dessinerLogo(ctx: CanvasRenderingContext2D, r: Ressources) {
  if (r.logo) {
    // logo limité à 190 px de haut : de l'air au-dessus et une vraie marge avant le badge
    const h = Math.min(190, (r.logo.height / r.logo.width) * 520), w = (r.logo.width / r.logo.height) * h;
    ctx.drawImage(r.logo, (L - w) / 2, 96, w, h);
  } else {
    texteCentre(ctx, "Cycylive", 220, 80, r.display, "#fff");
  }
}

function dessinerBadge(ctx: CanvasRenderingContext2D, r: Ressources, texte: string, y: number, couleur: string, point = false) {
  ctx.font = `700 40px ${r.sans}`;
  const w = ctx.measureText(texte).width + (point ? 120 : 90);
  const x = (L - w) / 2;
  pilule(ctx, x, y, w, 86, 43);
  ctx.fillStyle = couleur;
  ctx.shadowColor = couleur;
  ctx.shadowBlur = 40;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texte, L / 2 + (point ? 18 : 0), y + 45);
  if (point) {
    ctx.beginPath();
    ctx.arc(x + 52, y + 43, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textBaseline = "alphabetic";
}

function dessinerPhoto(ctx: CanvasRenderingContext2D, r: Ressources, cx: number, cy: number, rayon: number, teinte: string) {
  // anneaux d'orbite
  ctx.strokeStyle = "rgba(224,179,255,.18)";
  ctx.lineWidth = 3;
  for (const k of [1.2, 1.4]) {
    ctx.beginPath();
    ctx.arc(cx, cy, rayon * k, 0, Math.PI * 2);
    ctx.stroke();
  }
  // halo + anneau dégradé
  ctx.save();
  ctx.shadowColor = `rgba(${teinte},.9)`;
  ctx.shadowBlur = 90;
  const anneau = ctx.createLinearGradient(cx - rayon, cy - rayon, cx + rayon, cy + rayon);
  anneau.addColorStop(0, LILAS);
  anneau.addColorStop(0.5, VIOLET);
  anneau.addColorStop(1, `rgb(${teinte})`);
  ctx.fillStyle = anneau;
  ctx.beginPath();
  ctx.arc(cx, cy, rayon + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
  ctx.clip();
  if (r.photo) {
    const s = Math.max((rayon * 2) / r.photo.width, (rayon * 2) / r.photo.height);
    const w = r.photo.width * s, h = r.photo.height * s;
    ctx.drawImage(r.photo, cx - w / 2, cy - h / 2, w, h); // photo centrée dans le cercle
  } else {
    ctx.fillStyle = "#1c1430";
    ctx.fillRect(cx - rayon, cy - rayon, rayon * 2, rayon * 2);
  }
  ctx.restore();
  // petites étoiles signature
  const etoile = (x: number, y: number, t: number) => {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x, y - t);
    ctx.quadraticCurveTo(x, y, x + t, y);
    ctx.quadraticCurveTo(x, y, x, y + t);
    ctx.quadraticCurveTo(x, y, x - t, y);
    ctx.quadraticCurveTo(x, y, x, y - t);
    ctx.fill();
  };
  etoile(cx + rayon * 0.98, cy - rayon * 0.9, 24);
  etoile(cx - rayon * 1.12, cy + rayon * 0.55, 15);
  etoile(cx + rayon * 1.28, cy + rayon * 0.22, 10);
}

function dessinerJeu(ctx: CanvasRenderingContext2D, r: Ressources, jeu: string, y: number) {
  const illu = illustrationPour(jeu);
  const icone = r.icones[illu.icone];
  ctx.font = `600 50px ${r.sans}`;
  const w = Math.min(960, ctx.measureText(jeu).width + 190);
  const x = (L - w) / 2;
  pilule(ctx, x, y, w, 120, 60);
  ctx.fillStyle = `rgba(${illu.couleur},.18)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${illu.couleur},.55)`;
  ctx.lineWidth = 3;
  ctx.stroke();
  if (icone) ctx.drawImage(icone, x + 36, y + 26, 68, 68);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(jeu, x + 124, y + 62, w - 160);
  ctx.textBaseline = "alphabetic";
}

function dessinerPied(ctx: CanvasRenderingContext2D, r: Ressources) {
  // en bas, au-dessus de la zone des réponses d'Instagram
  ctx.font = `600 46px ${r.sans}`;
  const texte = `twitch.tv/${chaine}`;
  const w = ctx.measureText(texte).width + 150;
  const x = (L - w) / 2, y = 1712;
  pilule(ctx, x, y, w, 104, 52);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(224,179,255,.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
  if (r.twitch) ctx.drawImage(r.twitch, x + 34, y + 27, 50, 50);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(texte, x + 104, y + 54);
  ctx.textBaseline = "alphabetic";
}

export type ReglagesStory = { modele: Modele; jeu: string; heure: string; message: string; planning: JourPlanning[]; aujourdhui: string };

export const teinteStory = (o: Pick<ReglagesStory, "modele" | "jeu">) => (o.modele === "off" ? "129,140,248" : illustrationPour(o.jeu).couleur);

/** Tout sauf le fond : logo, badge, photo, textes, lien Twitch (dessiné une fois, posé sur le fond animé). */
export function dessinerContenu(ctx: CanvasRenderingContext2D, r: Ressources, o: ReglagesStory) {
  const teinte = teinteStory(o);
  dessinerLogo(ctx, r);

  if (o.modele === "planning") {
    dessinerBadge(ctx, r, "PLANNING DE LA SEMAINE", 340, "rgba(161,92,255,.9)");
    dessinerPhoto(ctx, r, L / 2, 600, 105, "161,92,255");
    let y = 790;
    for (const j of o.planning) {
      const auj = j.jour === o.aujourdhui;
      pilule(ctx, 90, y, L - 180, 100, 28);
      ctx.fillStyle = auj ? "rgba(161,92,255,.38)" : j.off ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.09)";
      ctx.fill();
      if (auj) {
        ctx.strokeStyle = LILAS;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.font = `700 42px ${r.display}`;
      ctx.fillStyle = j.off ? "rgba(255,255,255,.45)" : "#fff";
      ctx.fillText(j.jour, 134, y + 52);
      const nomJeu = j.off ? "OFF" : j.jeu || LABEL_GENERIQUE;
      const icone = r.icones[j.off ? "dodo" : illustrationPour(nomJeu).icone];
      if (icone) ctx.drawImage(icone, 404, y + 25, 50, 50);
      ctx.font = `500 38px ${r.sans}`;
      ctx.fillStyle = j.off ? "rgba(255,255,255,.45)" : LILAS;
      ctx.fillText(nomJeu, 476, y + 52, 320);
      ctx.textAlign = "right";
      ctx.font = `700 40px ${r.sans}`;
      ctx.fillStyle = "#fff";
      if (!j.off && j.heure) ctx.fillText(j.heure, L - 134, y + 52);
      ctx.textBaseline = "alphabetic";
      y += 114;
    }
    dessinerPied(ctx, r);
    return;
  }

  if (o.modele === "live") dessinerBadge(ctx, r, "EN LIVE MAINTENANT", 340, "#e11d48", true);
  if (o.modele === "cesoir") dessinerBadge(ctx, r, `CE SOIR · ${o.heure || "21h30"}`, 340, "rgba(161,92,255,.95)");
  if (o.modele === "off") dessinerBadge(ctx, r, "PAS DE LIVE CE SOIR", 340, "rgba(99,102,241,.9)");

  // photo : centre à 790, anneaux jusqu'à ~320 px → entre le badge (bas à 426) et le titre
  dessinerPhoto(ctx, r, L / 2, 790, 220, teinte);

  const titre = o.modele === "live" ? "On se retrouve en live !" : o.modele === "cesoir" ? "Rendez-vous ce soir !" : "Soirée repos";
  const finTitre = texteCentre(ctx, titre, 1222, 100, r.display, "#fff", 700, 920, 1.08, 2);
  let y = finTitre + 74;
  if (o.modele !== "off") {
    dessinerJeu(ctx, r, o.jeu || LABEL_GENERIQUE, y);
    y += 120 + 92;
  } else y += 30;
  if (o.message) texteCentre(ctx, o.message, y, 44, r.sans, "rgba(255,255,255,.85)", 500, 880, 1.28, 2);
  dessinerPied(ctx, r);
}

export function dessinerStory(ctx: CanvasRenderingContext2D, r: Ressources, o: ReglagesStory, style: StyleFond = "fixe", t = 0) {
  dessinerFondStory(ctx, L, H, style, teinteStory(o), t, r.fond);
  dessinerContenu(ctx, r, o);
}

// ── Composant ────────────────────────────────────────────────

const LEGENDES: Record<Modele, (jeu: string, heure: string) => string> = {
  live: (jeu) => `🔴 En live maintenant sur Twitch${jeu ? ` : ${jeu}` : ""} ! Viens me rejoindre 💜 twitch.tv/${chaine}`,
  cesoir: (jeu, heure) => `Ce soir ${heure || ""} en live${jeu ? ` sur ${jeu}` : ""} ✨ On se retrouve sur twitch.tv/${chaine}`,
  planning: () => `Le planning de la semaine est là 🗓️ On se retrouve sur twitch.tv/${chaine}`,
  off: () => `Pas de live ce soir, on se retrouve très vite 🌙 En attendant, passe sur le Discord !`,
};

export default function StudioStories({ planning }: { planning: JourPlanning[] }) {
  const aujourdhui = JOURS_ORDRE[new Date().getDay()];
  const duJour = planning.find((j) => j.jour === aujourdhui);
  const [modele, setModele] = useState<Modele>(duJour?.off ? "off" : "live");
  const [jeu, setJeu] = useState(duJour?.jeu || "");
  const [heure, setHeure] = useState(duJour?.heure || "21h30");
  const [message, setMessage] = useState("");
  const [legende, setLegende] = useState("");
  const [ressources, setRessources] = useState<Ressources | null>(null);
  const [info, setInfo] = useState("");
  const [fond, setFond] = useState<StyleFond>(() => {
    try {
      const f = localStorage.getItem("cycy-story-fond") as StyleFond | null;
      return f && FONDS.some((x) => x.valeur === f) ? f : "etoiles";
    } catch {
      return "etoiles";
    }
  });
  const [enregistrement, setEnregistrement] = useState(0); // progression de la vidéo (0 = rien en cours)
  const canvas = useRef<HTMLCanvasElement>(null);
  const calque = useRef<HTMLCanvasElement | null>(null); // le contenu (textes, photo…) dessiné une fois
  const animee = FONDS.find((f) => f.valeur === fond)?.anime ?? false;

  // Ordre de la semaine : du lundi au dimanche
  const semaine = [...planning].sort((a, b) => ((JOURS_ORDRE.indexOf(a.jour) + 6) % 7) - ((JOURS_ORDRE.indexOf(b.jour) + 6) % 7));

  useEffect(() => {
    let annule = false;
    (async () => {
      const sonde = (classe: string) => {
        const s = document.createElement("span");
        s.className = classe;
        document.body.appendChild(s);
        const f = getComputedStyle(s).fontFamily;
        s.remove();
        return f;
      };
      const display = `${sonde("font-display")}, system-ui, sans-serif`, sans = `${sonde("font-sans")}, system-ui, sans-serif`;
      await Promise.all([
        document.fonts.load(`700 100px ${display}`),
        document.fonts.load(`600 50px ${sans}`),
        document.fonts.load(`500 40px ${sans}`),
      ]).catch(() => {});
      const nomsIcones = [...new Set<NomIcone>(["dodo", "manette", "fantome", "monstre", "cube", "epee", "volant", "viseur", "fete"])];
      const icones: Record<string, HTMLImageElement | null> = {};
      await Promise.all(nomsIcones.map(async (n) => (icones[n] = await iconeEnImage(<Icone nom={n} />, LILAS))));
      const [fond, photo, logo, twitch] = await Promise.all([
        chargerImage("/images/starfield-bg.jpg"),
        chargerImage("/images/cycy-photo.jpg"),
        chargerImage("/logo/cycylive-wordmark.png"),
        iconeEnImage(<IconTwitch className="" />, "#c7a6ff"),
      ]);
      if (!annule) setRessources({ fond, photo, logo, twitch, icones, display, sans });
    })();
    return () => {
      annule = true;
    };
  }, []);

  useEffect(() => {
    setLegende(LEGENDES[modele](jeu, heure));
  }, [modele, jeu, heure]);

  useEffect(() => {
    try {
      localStorage.setItem("cycy-story-fond", fond);
    } catch {}
  }, [fond]);

  // Le contenu est dessiné une seule fois sur un calque transparent, puis posé sur le fond à chaque image
  useEffect(() => {
    if (!ressources) return;
    const c = calque.current ?? document.createElement("canvas");
    c.width = L;
    c.height = H;
    const cx = c.getContext("2d");
    if (!cx) return;
    cx.clearRect(0, 0, L, H);
    dessinerContenu(cx, ressources, { modele, jeu, heure, message, planning: semaine, aujourdhui });
    calque.current = c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ressources, modele, jeu, heure, message, planning]);

  const teinte = teinteStory({ modele, jeu });
  const image = (ctx: CanvasRenderingContext2D, t: number) => {
    dessinerFondStory(ctx, L, H, fond, teinte, t, ressources?.fond ?? null);
    if (calque.current) ctx.drawImage(calque.current, 0, 0);
  };

  // Aperçu : animé en boucle (30 images/s) si le fond l'est
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !ressources) return;
    if (!animee || enregistrement) {
      if (!enregistrement) image(ctx, 0.35);
      return;
    }
    let id = 0, dernier = 0;
    const debut = performance.now();
    const boucle = (now: number) => {
      id = requestAnimationFrame(boucle);
      if (now - dernier < 33) return;
      dernier = now;
      image(ctx, (((now - debut) / 1000) % DUREE_BOUCLE) / DUREE_BOUCLE);
    };
    id = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ressources, modele, jeu, heure, message, planning, fond, animee, enregistrement]);

  // Vignettes des fonds (une image fixe de chaque, à la teinte du jeu)
  const vignettes = useRef<Record<string, HTMLCanvasElement | null>>({});
  useEffect(() => {
    for (const f of FONDS) {
      const v = vignettes.current[f.valeur];
      const ctx = v?.getContext("2d");
      if (!ctx) continue;
      ctx.save();
      ctx.scale(v!.width / L, v!.height / H);
      dessinerFondStory(ctx, L, H, f.valeur, teinte, 0.35, ressources?.fond ?? null);
      ctx.restore();
    }
  }, [teinte, ressources]);

  // Vidéo de la story (une boucle de 6 s, ×2 pour ~12 s) : MP4 si le navigateur sait faire, sinon WebM
  async function enregistrerVideo() {
    const c = canvas.current, ctx = c?.getContext("2d");
    if (!c || !ctx || !ressources) return;
    if (typeof MediaRecorder === "undefined" || !c.captureStream) {
      setInfo("Ce navigateur ne sait pas créer de vidéo : essaie avec Chrome ou Safari à jour.");
      return;
    }
    const types = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
    const type = types.find((x) => MediaRecorder.isTypeSupported(x)) || "";
    const flux = c.captureStream(30);
    const rec = new MediaRecorder(flux, { mimeType: type || undefined, videoBitsPerSecond: 8_000_000 });
    const morceaux: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && morceaux.push(e.data);
    const fini = new Promise<void>((ok) => (rec.onstop = () => ok()));
    setEnregistrement(1);
    setInfo("");
    rec.start();
    const total = DUREE_BOUCLE * 2 * 1000, debut = performance.now();
    await new Promise<void>((ok) => {
      const pas = (now: number) => {
        const e = now - debut;
        image(ctx, ((e / 1000) % DUREE_BOUCLE) / DUREE_BOUCLE);
        setEnregistrement(Math.max(1, Math.round((e / total) * 100)));
        if (e < total) requestAnimationFrame(pas);
        else ok();
      };
      requestAnimationFrame(pas);
    });
    rec.stop();
    await fini;
    setEnregistrement(0);
    const ext = (rec.mimeType || type).includes("mp4") ? "mp4" : "webm";
    const fichier = new File(morceaux, `story-${modele}-${fond}.${ext}`, { type: ext === "mp4" ? "video/mp4" : "video/webm" });
    const donnees = { files: [fichier], text: legende };
    if (navigator.canShare?.(donnees)) {
      try {
        await navigator.share(donnees);
        return;
      } catch {}
    }
    telecharger(fichier);
    if (ext === "webm") setInfo("Vidéo enregistrée en WebM (ce navigateur ne fait pas le MP4) : Instagram l’accepte depuis un ordinateur ; sur iPhone, enregistre-la depuis Safari.");
  }

  function enFichier(): Promise<File | null> {
    const ctx = canvas.current?.getContext("2d");
    if (ctx) image(ctx, 0.35);
    return new Promise((ok) => {
      canvas.current?.toBlob((b) => ok(b ? new File([b], `story-${modele}.jpg`, { type: "image/jpeg" }) : null), "image/jpeg", 0.92);
    });
  }

  async function partager() {
    const fichier = await enFichier();
    if (!fichier) return;
    const donnees = { files: [fichier], text: legende };
    if (navigator.canShare?.(donnees)) {
      try {
        await navigator.share(donnees);
      } catch {}
    } else {
      telecharger(fichier);
      setInfo("Le partage direct n'est pas disponible sur cet appareil : l'image a été téléchargée.");
    }
  }

  async function telecharger(f?: File | null) {
    const fichier = f ?? (await enFichier());
    if (!fichier) return;
    const url = URL.createObjectURL(fichier);
    const a = document.createElement("a");
    a.href = url;
    a.download = fichier.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function copierLegende() {
    try {
      await navigator.clipboard.writeText(legende);
      setInfo("Légende copiée !");
    } catch {
      setInfo("Copie impossible : sélectionne le texte à la main.");
    }
  }

  const champ = "w-full rounded-lg bg-card border border-violet/20 px-3 py-2 text-sm text-ink outline-none focus:border-violet/60";

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {MODELES.map((m) => (
            <button
              key={m.valeur}
              onClick={() => setModele(m.valeur)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left transition-all ${modele === m.valeur ? "border-violet-light bg-violet/20 text-ink" : "border-violet/20 text-ink-soft hover:bg-violet/10"}`}
            >
              <Icone nom={m.icone} className="w-5 h-5 text-lilac" />
              {m.label}
            </button>
          ))}
        </div>
        {modele !== "planning" && modele !== "off" && (
          <label className="block text-sm text-ink-soft">
            Jeu
            <input value={jeu} onChange={(e) => setJeu(e.target.value)} placeholder="Valorant, Palworld…" className={`${champ} mt-1`} />
          </label>
        )}
        {modele === "cesoir" && (
          <label className="block text-sm text-ink-soft">
            Heure
            <input value={heure} onChange={(e) => setHeure(e.target.value)} placeholder="21h30" className={`${champ} mt-1`} />
          </label>
        )}
        {modele !== "planning" && (
          <label className="block text-sm text-ink-soft">
            Petit message (facultatif)
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Objectif Immortel ce soir !" maxLength={90} className={`${champ} mt-1`} />
          </label>
        )}
        <div>
          <p className="text-sm text-ink-soft mb-2">Fond {animee ? "(animé : la story peut partir en vidéo)" : "(fixe)"}</p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {FONDS.map((f) => (
              <button
                key={f.valeur}
                onClick={() => setFond(f.valeur)}
                aria-pressed={fond === f.valeur}
                className={`group rounded-xl border p-1 text-center transition-all ${fond === f.valeur ? "border-violet-light bg-violet/20" : "border-violet/20 hover:bg-violet/10"}`}
              >
                <canvas ref={(n) => { vignettes.current[f.valeur] = n; }} width={72} height={128} className="w-full aspect-[9/16] rounded-lg bg-[#0d0a17]" />
                <span className={`block mt-1 text-[11px] leading-tight ${fond === f.valeur ? "text-ink" : "text-ink-soft"}`}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm text-ink-soft">
          Légende à coller avec la story
          <textarea value={legende} onChange={(e) => setLegende(e.target.value)} rows={3} className={`${champ} mt-1`} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button onClick={partager} disabled={!ressources} className="inline-flex items-center gap-2 rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50">
            <Icone nom="megaphone" className="w-4 h-4" /> Partager l&apos;image
          </button>
          {animee && (
            <button onClick={enregistrerVideo} disabled={!ressources || Boolean(enregistrement)} className="inline-flex items-center gap-2 rounded-full bg-violet/25 border border-violet-light/50 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-violet/35 transition-all disabled:opacity-60">
              <Icone nom="clap" className="w-4 h-4" /> {enregistrement ? `Création de la vidéo… ${enregistrement} %` : "Partager en vidéo (12 s)"}
            </button>
          )}
          <button onClick={() => telecharger()} disabled={!ressources} className="rounded-full border border-violet/30 px-5 py-2.5 text-sm text-ink-soft hover:bg-violet/10 transition-all disabled:opacity-50">
            Télécharger l&apos;image
          </button>
          <button onClick={copierLegende} className="rounded-full border border-violet/30 px-5 py-2.5 text-sm text-ink-soft hover:bg-violet/10 transition-all">
            Copier la légende
          </button>
        </div>
        {info && <p className="text-xs text-ink-soft" role="status">{info}</p>}
        <p className="text-xs text-ink-soft/60 leading-relaxed">
          Sur téléphone, « Partager » ouvre la feuille de partage : choisis Instagram (Story) ou TikTok. Avec un fond animé, « Partager en vidéo » crée une story
          animée de 12 s (la page doit rester ouverte pendant la création). Ajoute le sticker « Lien » vers ta chaîne Twitch sous le jeu.
        </p>
      </div>
      <div>
        <canvas ref={canvas} width={L} height={H} className="w-full max-w-[280px] mx-auto rounded-2xl border border-violet/25 shadow-glow-sm bg-[#0d0a17]" aria-label="Aperçu de la story" />
        {!ressources && <p className="mt-2 text-center text-xs text-ink-soft">Préparation de l&apos;aperçu…</p>}
      </div>
    </div>
  );
}
