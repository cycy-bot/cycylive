"use client";

// Lecteur du Studio montage : un élément <video> / <audio> / <img> par usage (piste vidéo, chaque incrustation,
// chaque son), et un mixage en direct (Web Audio) pour que les volumes marchent aussi sur iPad (où le volume
// d'un élément vidéo ne se règle pas). Les éléments sont recalés sur le temps du montage à chaque image.

import { duree, etatA, mediaDe, vitesse, type DocMontage, type Media, type Morceau } from "@/lib/montage/projet";

/**
 * Élément d'un morceau de la piste vidéo. Deux éléments par média, en alternance (morceaux pairs / impairs) :
 * pendant qu'un morceau joue, le suivant est déjà calé sur sa première image dans l'autre élément,
 * et le raccord se fait sans attendre (pas de micro-pause à la coupe).
 */
const AVANCE = 0.6; // élan du morceau suivant (s)
export const clePiste = (m: Morceau, k: number) => "p:" + mediaDe(m) + ":" + (k % 2);

type ElSon = HTMLVideoElement | HTMLAudioElement;
export type Source = { el: HTMLVideoElement | HTMLImageElement; w: number; h: number; pret: boolean };

const fondu = (t: number, len: number, fE = 0, fS = 0) => {
  let g = 1;
  if (fE > 0 && t < fE) g = Math.min(g, t / fE);
  if (fS > 0 && t > len - fS) g = Math.min(g, Math.max(0, (len - t) / fS));
  return Math.max(0, g);
};

export class Lecteur {
  private els = new Map<string, ElSon>();
  private imgs = new Map<string, HTMLImageElement>();
  private gains = new Map<ElSon, GainNode>();
  private suivi = new WeakMap<ElSon, { ecart: number; corr: number; vu: number }>();
  private boite: HTMLDivElement;
  ctx: AudioContext | null = null;
  constructor(private url: (mid: string) => string | undefined, private medias: () => Media[]) {
    this.boite = document.createElement("div");
    this.boite.style.cssText = "position:fixed;width:2px;height:2px;overflow:hidden;opacity:0.01;pointer-events:none;left:0;top:0";
    document.body.appendChild(this.boite);
  }
  /** Branche un élément existant (la vidéo du projet). */
  private adopte: HTMLVideoElement | null = null;
  adopter(cle: string, mid: string, el: HTMLVideoElement) { el.dataset.src = this.url(mid) || el.currentSrc || el.src; this.adopte = el; this.els.set(cle, el); this.brancher(el); }
  /** À appeler pendant un clic (Safari) : crée le mixage en direct. */
  debloquer() {
    if (this.ctx) { this.ctx.resume().catch(() => {}); return; }
    // iPad / iPhone : session audio « lecture » (son plein, haut-parleur, même en mode silencieux) au lieu du mode
    // « ambiance » que Safari choisit sinon pour une page avec des vidéos muettes, où le son sort beaucoup plus bas
    try { const n = navigator as Navigator & { audioSession?: { type: string } }; if (n.audioSession) n.audioSession.type = "playback"; } catch { /* navigateur sans réglage */ }
    try { this.ctx = new AudioContext(); this.ctx.resume().catch(() => {}); for (const el of this.els.values()) this.brancher(el); } catch { this.ctx = null; }
  }
  private brancher(el: ElSon) {
    if (!this.ctx || this.gains.has(el)) return;
    try { const s = this.ctx.createMediaElementSource(el), g = this.ctx.createGain(); s.connect(g); g.connect(this.ctx.destination); this.gains.set(el, g); } catch { /* déjà branché */ }
  }
  private volume(el: ElSon, v: number) {
    const g = this.gains.get(el);
    // on n'écrit que ce qui change : sur iPad, réécrire muted / volume à chaque image fait hoqueter la vidéo
    if (g) { if (Math.abs(g.gain.value - v) > 1e-3) g.gain.value = v; if (el.volume !== 1) el.volume = 1; if (el.muted !== v <= 0) el.muted = v <= 0; }
    else { const vv = Math.max(0, Math.min(1, v)); if (Math.abs(el.volume - vv) > 1e-3) el.volume = vv; if (el.muted !== v <= 0) el.muted = v <= 0; }
  }
  media(cle: string, mid: string, type: "video" | "son"): ElSon | null {
    let el = this.els.get(cle);
    const u = this.url(mid);
    if (!u) return null;
    if (el && el.dataset.src !== u) { el.src = u; el.dataset.src = u; }
    if (!el) {
      el = document.createElement(type === "son" ? "audio" : "video") as ElSon;
      el.preload = "auto"; el.src = u; el.dataset.src = u;
      if (el instanceof HTMLVideoElement) { el.playsInline = true; el.muted = false; }
      (el as HTMLMediaElement & { preservesPitch?: boolean }).preservesPitch = false; // vitesse : comme à l'export
      this.boite.appendChild(el); this.els.set(cle, el); this.brancher(el);
    }
    return el;
  }
  image(mid: string): HTMLImageElement | null {
    const u = this.url(mid); if (!u) return null;
    let i = this.imgs.get(mid);
    if (!i || i.dataset.src !== u) { i = new Image(); i.decoding = "async"; i.src = u; i.dataset.src = u; this.imgs.set(mid, i); }
    return i;
  }
  /** L'image (ou la vidéo) à dessiner pour un média, à son temps. */
  source(cle: string, mid: string): Source | null {
    const m = this.medias().find((x) => x.id === mid);
    if (m?.type === "image") { const i = this.image(mid); return i ? { el: i, w: i.naturalWidth || m.w || 1, h: i.naturalHeight || m.h || 1, pret: i.complete && i.naturalWidth > 0 } : null; }
    const v = this.media(cle, mid, "video") as HTMLVideoElement | null;
    return v ? { el: v, w: v.videoWidth || m?.w || 16, h: v.videoHeight || m?.h || 9, pret: v.readyState >= 2 } : null;
  }
  typeDe(mid: string) { return this.medias().find((x) => x.id === mid)?.type || "video"; }

  /**
   * Recale tout sur l'instant r. `lecture` : les éléments jouent ; sinon ils montrent l'image exacte.
   * `pilote` : la clé de l'élément qui donne le temps (il n'est pas recalé). `rythme` : vitesse générale (export).
   */
  synchroniser(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, r: number, lecture: boolean, o: { pilote?: string; rythme?: number; tolerance?: number; muet?: boolean; doux?: boolean } = {}) {
    const e = etatA(d, r), rythme = o.rythme ?? 1, tol = o.tolerance ?? 0.25;
    const vus = new Set<ElSon>();
    // doux : l'horloge est le son ; la vidéo la suit en accélérant / ralentissant très légèrement (sans saut d'image)
    // L'écart est lissé (la position d'une vidéo est imprécise d'une image à l'autre, surtout sur iPad) et la vitesse
    // ne change qu'avec une marge : avant, elle changeait presque à chaque image, et chaque changement fait hoqueter
    // la vidéo sur Safari. Maintenant : vitesse normale tant que l'écart reste petit, petite correction (± 5 %) gardée
    // jusqu'à ce qu'il soit rattrapé, et un saut seulement si la vidéo est vraiment partie ailleurs.
    const suivre = (el: ElSon, src: number, rate: number) => {
      const st = this.suivi.get(el) || { ecart: 0, corr: 0, vu: 0 };
      this.suivi.set(el, st);
      if (el.paused) { if (Math.abs(el.currentTime - src) > 0.04) el.currentTime = src; if (Math.abs(el.playbackRate - rate) > 1e-3) el.playbackRate = rate; st.ecart = 0; st.corr = 0; el.play().catch(() => {}); return; }
      if (el.seeking) return;
      const brut = src - el.currentTime;
      if (Math.abs(brut) > 0.45) { el.currentTime = src; st.ecart = 0; st.corr = 0; if (Math.abs(el.playbackRate - rate) > 1e-3) el.playbackRate = rate; return; }
      const now = performance.now();
      st.ecart = now - st.vu > 400 ? brut : st.ecart * 0.85 + brut * 0.15; st.vu = now;
      if (st.corr === 0 && Math.abs(st.ecart) > 0.07) st.corr = st.ecart > 0 ? 1 : -1;
      else if (st.corr !== 0 && (Math.abs(st.ecart) < 0.015 || Math.sign(st.ecart) !== st.corr)) st.corr = 0;
      const r2 = rate * (1 + 0.05 * st.corr);
      if (Math.abs(el.playbackRate - r2) > 1e-3) el.playbackRate = r2;
    };
    const caler = (el: ElSon, src: number, vit: number, vol: number, cle: string) => {
      vus.add(el);
      this.volume(el, o.muet ? 0 : vol);
      const rate = vit * rythme;
      if (lecture && o.doux) { suivre(el, src, rate); return; }
      if (Math.abs(el.playbackRate - rate) > 1e-3) el.playbackRate = rate;
      if (cle === o.pilote) return;
      if (lecture) {
        if (el.paused) { if (Math.abs(el.currentTime - src) > 0.04) el.currentTime = src; el.play().catch(() => {}); }
        else if (Math.abs(el.currentTime - src) > tol) el.currentTime = src;
      } else {
        if (!el.paused) el.pause();
        if (Math.abs(el.currentTime - src) > 0.02 && !el.seeking) el.currentTime = src;
      }
    };
    if (e.morceau && this.typeDe(mediaDe(e.morceau)) === "video") {
      const m = e.morceau, cle = clePiste(m, e.k), el = this.media(cle, mediaDe(m), "video");
      const t0 = e.src - m.a;
      if (el) caler(el, e.src, vitesse(m), m.muet ? 0 : (m.vol ?? 1) * fondu(t0 / vitesse(m), duree(m), m.fE, m.fS), cle);
    }
    // le morceau suivant attend, déjà calé sur sa première image ; pendant la lecture, il démarre (muet)
    // un peu avant le raccord pour que l'enchaînement soit immédiat
    const suiv = e.k >= 0 ? d.morceaux[e.k + 1] : undefined;
    if (suiv && this.typeDe(mediaDe(suiv)) === "video") {
      const cleS = clePiste(suiv, e.k + 1), el = this.media(cleS, mediaDe(suiv), "video");
      if (el) {
        vus.add(el);
        const reste = e.morceau ? (e.morceau.b - e.src) / vitesse(e.morceau) : Infinity;
        const elan = lecture && reste < AVANCE ? suiv.a - reste * vitesse(suiv) : -1;
        if (elan >= 0) {
          this.volume(el, 0);
          if (o.doux) suivre(el, elan, vitesse(suiv) * rythme);
          else {
            if (Math.abs(el.playbackRate - vitesse(suiv) * rythme) > 1e-3) el.playbackRate = vitesse(suiv) * rythme;
            if (el.paused) { if (Math.abs(el.currentTime - elan) > 0.03) el.currentTime = elan; el.play().catch(() => {}); }
          }
        } else {
          if (Math.abs(el.playbackRate - vitesse(suiv) * rythme) > 1e-3) el.playbackRate = vitesse(suiv) * rythme;
          if (!el.paused && o.pilote !== cleS) el.pause();
          if (el.paused && !el.seeking && Math.abs(el.currentTime - suiv.a) > 0.02) el.currentTime = suiv.a;
        }
      }
    }
    for (const { c, src } of e.incrust) {
      if (this.typeDe(c.media) !== "video") continue;
      const el = this.media("i:" + c.id, c.media, "video");
      if (el) caler(el, src, vitesse(c), c.muet ? 0 : c.vol, "i:" + c.id);
    }
    if (!(o.doux && o.muet)) for (const { s, src } of e.sons) {
      const el = this.media("s:" + s.id, s.media, this.typeDe(s.media) === "video" ? "video" : "son");
      if (el) caler(el, src, vitesse(s), s.vol * fondu((src - s.a) / vitesse(s), duree(s), s.fE, s.fS), "s:" + s.id);
    }
    for (const el of this.els.values()) if (!vus.has(el) && !el.paused) el.pause();
  }
  /**
   * Export image par image : chaque vidéo utile est placée EXACTEMENT sur l'image de l'instant r (et on attend
   * qu'elle soit affichée). Rien ne dépend de la fluidité de la lecture : pas de saut, pas d'accélération.
   */
  async caler(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, r: number) {
    const e = etatA(d, r), attentes: Promise<void>[] = [], vus = new Set<ElSon>();
    const placer = (el: HTMLVideoElement, t: number) => {
      vus.add(el); if (!el.paused) el.pause();
      // + 3 ms : on vise l'intérieur de l'image (un instant pile sur la frontière peut donner l'image d'avant)
      const cible = Math.max(0, Math.min((Number.isFinite(el.duration) ? el.duration : 1e9) - 0.002, t + 0.003));
      if (!el.seeking && el.readyState >= 2 && Math.abs(el.currentTime - cible) < 1 / 480) return;
      // image suivante toute proche : on avance en lisant (bien plus rapide qu'un saut), sinon on saute
      const aRvfc = "requestVideoFrameCallback" in el;
      if (aRvfc && rvfcMarche !== false && !el.seeking && el.readyState >= 2 && cible > el.currentTime && cible - el.currentTime < 0.5) attentes.push(avancerA(el, cible));
      else attentes.push(allerA(el, cible));
    };
    if (e.morceau && this.typeDe(mediaDe(e.morceau)) === "video") { const el = this.media(clePiste(e.morceau, e.k), mediaDe(e.morceau), "video"); if (el) placer(el as HTMLVideoElement, e.src); }
    for (const { c, src } of e.incrust) if (this.typeDe(c.media) === "video") { const el = this.media("i:" + c.id, c.media, "video"); if (el) placer(el as HTMLVideoElement, src); }
    for (const el of this.els.values()) if (!vus.has(el) && !el.paused) el.pause();
    await Promise.all(attentes);
  }
  pauseTout() { for (const el of this.els.values()) if (!el.paused) el.pause(); }
  /** Attend que les éléments utiles à l'instant r aient leur image (export). */
  async attendrePret(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, r: number, limite = 2500) {
    const e = etatA(d, r), fin = Date.now() + limite;
    const attendus: (HTMLVideoElement | HTMLImageElement)[] = [];
    if (e.morceau) { const s = this.source(clePiste(e.morceau, e.k), mediaDe(e.morceau)); if (s) attendus.push(s.el); }
    for (const { c } of e.incrust) { const s = this.source("i:" + c.id, c.media); if (s) attendus.push(s.el); }
    while (Date.now() < fin) {
      const ok = attendus.every((x) => (x instanceof HTMLImageElement ? x.complete : !x.seeking && x.readyState >= 2));
      if (ok) return;
      await new Promise((r2) => setTimeout(r2, 20));
    }
  }
  /** Va à l'instant r et attend que tout soit calé (export). */
  async allerEtAttendre(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, r: number) {
    this.synchroniser(d, r, false, { muet: true });
    await new Promise((x) => setTimeout(x, 30));
    await this.attendrePret(d, r);
  }
  detruire() {
    this.pauseTout();
    for (const el of this.els.values()) if (el !== this.adopte) { el.removeAttribute("src"); el.load(); }
    this.boite.remove();
    try { this.ctx?.close(); } catch { /* rien */ }
  }
}

/** Place une vidéo sur un instant précis et attend que l'image soit prête à être dessinée. */
export function allerA(el: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((ok) => {
    let fini = false;
    const fin = () => { if (!fini) { fini = true; clearTimeout(secours); ok(); } };
    const secours = setTimeout(fin, 4000);
    el.addEventListener("seeked", () => {
      const v = el as HTMLVideoElement & { requestVideoFrameCallback?: (f: () => void) => number };
      if (v.requestVideoFrameCallback) { v.requestVideoFrameCallback(() => fin()); setTimeout(fin, 50); } else fin();
    }, { once: true });
    el.currentTime = t;
  });
}

// ce navigateur prévient-il quand une image s'affiche ? (sinon on n'avance que par sauts)
let rvfcMarche: boolean | null = null;
/** Avance une vidéo jusqu'à l'image de l'instant t en la lisant, puis la met en pause sur cette image exacte. */
function avancerA(el: HTMLVideoElement, t: number): Promise<void> {
  type Rvfc = HTMLVideoElement & { requestVideoFrameCallback: (f: (n: number, m: { mediaTime: number }) => void) => number };
  const v = el as Rvfc;
  return new Promise((ok) => {
    let fini = false;
    const fin = async (precis: boolean) => {
      if (fini) return; fini = true; clearTimeout(secours); el.pause();
      if (!precis) await allerA(el, t); // image dépassée ou lecture bloquée : on y va directement
      ok();
    };
    // lecture qui ne repart pas (ou navigateur qui ne prévient pas) : on n'insiste plus, on passe aux sauts
    const secours = setTimeout(() => { rvfcMarche = false; fin(false); }, 300);
    const image = (_n: number, m: { mediaTime: number }) => {
      if (fini) return;
      if (m.mediaTime >= t - 0.006) { fin(m.mediaTime <= t + 0.012); return; }
      v.requestVideoFrameCallback(image);
    };
    v.requestVideoFrameCallback(image);
    el.muted = true;
    el.play().catch(() => fin(false));
  });
}
