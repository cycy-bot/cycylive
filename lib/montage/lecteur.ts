"use client";

// Lecteur du Studio montage : un élément <video> / <audio> / <img> par usage (piste vidéo, chaque incrustation,
// chaque son), et un mixage en direct (Web Audio) pour que les volumes marchent aussi sur iPad (où le volume
// d'un élément vidéo ne se règle pas). Les éléments sont recalés sur le temps du montage à chaque image.

import { duree, etatA, mediaDe, vitesse, type DocMontage, type Media } from "@/lib/montage/projet";

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
  private boite: HTMLDivElement;
  ctx: AudioContext | null = null;
  constructor(private url: (mid: string) => string | undefined, private medias: () => Media[]) {
    this.boite = document.createElement("div");
    this.boite.style.cssText = "position:fixed;width:2px;height:2px;overflow:hidden;opacity:0;pointer-events:none;left:-10px;top:-10px";
    document.body.appendChild(this.boite);
  }
  /** Branche un élément existant (la vidéo du projet). */
  adopter(cle: string, el: HTMLVideoElement) { el.dataset.src = this.url(cle.slice(2)) || el.currentSrc || el.src; this.els.set(cle, el); this.brancher(el); }
  /** À appeler pendant un clic (Safari) : crée le mixage en direct. */
  debloquer() {
    if (this.ctx) { this.ctx.resume().catch(() => {}); return; }
    try { this.ctx = new AudioContext(); this.ctx.resume().catch(() => {}); for (const el of this.els.values()) this.brancher(el); } catch { this.ctx = null; }
  }
  private brancher(el: ElSon) {
    if (!this.ctx || this.gains.has(el)) return;
    try { const s = this.ctx.createMediaElementSource(el), g = this.ctx.createGain(); s.connect(g); g.connect(this.ctx.destination); this.gains.set(el, g); } catch { /* déjà branché */ }
  }
  private volume(el: ElSon, v: number) {
    const g = this.gains.get(el);
    if (g) { g.gain.value = v; el.volume = 1; el.muted = v <= 0; }
    else { el.volume = Math.max(0, Math.min(1, v)); el.muted = v <= 0; }
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
  synchroniser(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, r: number, lecture: boolean, o: { pilote?: string; rythme?: number; tolerance?: number; muet?: boolean } = {}) {
    const e = etatA(d, r), rythme = o.rythme ?? 1, tol = o.tolerance ?? 0.25;
    const vus = new Set<ElSon>();
    const caler = (el: ElSon, src: number, vit: number, vol: number, cle: string) => {
      vus.add(el);
      this.volume(el, o.muet ? 0 : vol);
      const rate = vit * rythme;
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
      const m = e.morceau, cle = "p:" + mediaDe(m), el = this.media(cle, mediaDe(m), "video");
      const t0 = e.src - m.a;
      if (el) caler(el, e.src, vitesse(m), m.muet ? 0 : (m.vol ?? 1) * fondu(t0 / vitesse(m), duree(m), m.fE, m.fS), cle);
    }
    for (const { c, src } of e.incrust) {
      if (this.typeDe(c.media) !== "video") continue;
      const el = this.media("i:" + c.id, c.media, "video");
      if (el) caler(el, src, vitesse(c), c.muet ? 0 : c.vol, "i:" + c.id);
    }
    for (const { s, src } of e.sons) {
      const el = this.media("s:" + s.id, s.media, this.typeDe(s.media) === "video" ? "video" : "son");
      if (el) caler(el, src, vitesse(s), s.vol * fondu((src - s.a) / vitesse(s), duree(s), s.fE, s.fS), "s:" + s.id);
    }
    for (const el of this.els.values()) if (!vus.has(el) && !el.paused) el.pause();
  }
  pauseTout() { for (const el of this.els.values()) if (!el.paused) el.pause(); }
  /** Attend que les éléments utiles à l'instant r aient leur image (export). */
  async attendrePret(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, r: number, limite = 2500) {
    const e = etatA(d, r), fin = Date.now() + limite;
    const attendus: (HTMLVideoElement | HTMLImageElement)[] = [];
    if (e.morceau) { const s = this.source("p:" + mediaDe(e.morceau), mediaDe(e.morceau)); if (s) attendus.push(s.el); }
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
    for (const [cle, el] of this.els) if (!cle.startsWith("p:principal")) { el.removeAttribute("src"); el.load(); }
    this.boite.remove();
    try { this.ctx?.close(); } catch { /* rien */ }
  }
}
