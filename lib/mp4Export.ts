// Export vidéo image par image (WebCodecs) → fichier MP4 propre (H.264 + AAC), sans bibliothèque.
// Pourquoi : l'enregistrement « MediaRecorder » donnait des fichiers sans durée (lus « 3000 h » en boucle),
// et le son pouvait se décaler (ou repartir de la fin du clip) car il était capté en direct pendant la lecture.
// Ici : le son est décodé depuis le fichier puis mixé hors ligne (coupe exacte + cinématique de fin), et chaque
// image porte l'horodatage de la vidéo source : image et son restent calés, quelle que soit la fluidité de l'appareil.

/* eslint-disable @typescript-eslint/no-explicit-any */

const SR = 48000;
const FPS = 60;
const VTS = 90000; // échelle de temps de la piste vidéo

export function webcodecsDispo(): boolean {
  return typeof window !== "undefined" && "VideoEncoder" in window && "AudioEncoder" in window && "VideoFrame" in window && "AudioData" in window && typeof OfflineAudioContext !== "undefined";
}

type Opts = {
  video: HTMLVideoElement;
  source: Blob | string; // le fichier du clip (ou son adresse)
  debut: number;
  fin: number;
  W: number;
  H: number;
  dessiner: (c: CanvasRenderingContext2D, v: HTMLVideoElement, t: number) => void;
  ending: { el: HTMLVideoElement; url: string } | null; // cinématique de fin (fondu de 0,4 s)
  progres: (p: number) => void;
};

const versU8 = (b: unknown): Uint8Array | null => {
  if (!b) return null;
  if (b instanceof Uint8Array) return new Uint8Array(b);
  if (ArrayBuffer.isView(b)) return new Uint8Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  return new Uint8Array((b as ArrayBuffer).slice(0));
};

async function decoderSon(src: Blob | string): Promise<AudioBuffer> {
  const buf = typeof src === "string" ? await (await fetch(src)).arrayBuffer() : await src.arrayBuffer();
  const ctx = new OfflineAudioContext(2, SR, SR);
  return await ctx.decodeAudioData(buf);
}

async function choisirCodecVideo(W: number, H: number): Promise<VideoEncoderConfig> {
  // profils sans images B (l'ordre de décodage = l'ordre d'affichage) : baseline puis main, niveaux 5.x
  for (const codec of ["avc1.42E032", "avc1.42E033", "avc1.4D0032", "avc1.42E02A", "avc1.4D002A"]) {
    const cfg: VideoEncoderConfig = { codec, width: W, height: H, bitrate: 14_000_000, framerate: FPS, latencyMode: "realtime", avc: { format: "avc" } } as VideoEncoderConfig;
    try { const s = await VideoEncoder.isConfigSupported(cfg); if (s.supported) return cfg; } catch { /* suivant */ }
  }
  throw new Error("encodeur H.264 indisponible");
}

/** Crée le MP4. Lève une erreur si le navigateur ne sait pas faire (l'appelant repasse alors à l'ancien mode). */
export async function exporterMp4(o: Opts): Promise<Blob> {
  const { video: v, debut, W, H } = o;
  const finT = Math.min(o.fin || v.duration, v.duration || o.fin);
  const dureeClip = Math.max(0.1, finT - debut);

  // ── 1. Le son : décodé puis mixé hors ligne ──
  const son = await decoderSon(o.source);
  let sonFin: AudioBuffer | null = null;
  if (o.ending) { try { sonFin = await decoderSon(o.ending.url); } catch { sonFin = null; } }
  const dureeFin = o.ending ? (Number.isFinite(o.ending.el.duration) && o.ending.el.duration > 0 ? o.ending.el.duration : sonFin?.duration || 0) : 0;
  const total = dureeClip + dureeFin;
  const off = new OfflineAudioContext(2, Math.ceil(total * SR), SR);
  const s1 = off.createBufferSource(); s1.buffer = son; s1.connect(off.destination); s1.start(0, debut, dureeClip);
  if (sonFin) {
    const g = off.createGain(); g.gain.setValueAtTime(0, dureeClip); g.gain.linearRampToValueAtTime(1, dureeClip + 0.4);
    const s2 = off.createBufferSource(); s2.buffer = sonFin; s2.connect(g); g.connect(off.destination); s2.start(dureeClip);
  }
  const mix = await off.startRendering();

  // ── 2. Encodage du son (AAC) ──
  const aChunks: { data: Uint8Array; ts: number }[] = [];
  let aDesc: Uint8Array | null = null, aErr: unknown = null;
  const ae = new AudioEncoder({
    output: (ch, meta) => { const d = new Uint8Array(ch.byteLength); ch.copyTo(d); aChunks.push({ data: d, ts: ch.timestamp }); if (meta?.decoderConfig?.description) aDesc = versU8(meta.decoderConfig.description); },
    error: (e) => { aErr = e; },
  });
  const aCfg: AudioEncoderConfig = { codec: "mp4a.40.2", sampleRate: SR, numberOfChannels: 2, bitrate: 192_000 };
  if (!(await AudioEncoder.isConfigSupported(aCfg)).supported) throw new Error("encodeur AAC indisponible");
  ae.configure(aCfg);
  const g0 = mix.getChannelData(0), g1 = mix.numberOfChannels > 1 ? mix.getChannelData(1) : g0;
  for (let i = 0; i < mix.length; i += 4800) {
    const n = Math.min(4800, mix.length - i), d = new Float32Array(n * 2);
    d.set(g0.subarray(i, i + n), 0); d.set(g1.subarray(i, i + n), n);
    const ad = new AudioData({ format: "f32-planar", sampleRate: SR, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((i / SR) * 1e6), data: d });
    ae.encode(ad); ad.close();
  }
  await ae.flush(); ae.close();
  if (aErr) throw aErr;
  // configuration AAC-LC 48 kHz stéréo si l'encodeur ne l'a pas donnée
  const asc: Uint8Array = aDesc || new Uint8Array([0x11, 0x90]);

  // ── 3. Les images : lecture de la vidéo, chaque image horodatée sur le temps de la vidéo source ──
  const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
  const c = canvas.getContext("2d")!;
  const vChunks: { data: Uint8Array; ts: number; cle: boolean }[] = [];
  let vDesc: Uint8Array | null = null, vErr: unknown = null;
  const ve = new VideoEncoder({
    output: (ch, meta) => { const d = new Uint8Array(ch.byteLength); ch.copyTo(d); vChunks.push({ data: d, ts: ch.timestamp, cle: ch.type === "key" }); if (meta?.decoderConfig?.description) vDesc = versU8(meta.decoderConfig.description); },
    error: (e) => { vErr = e; },
  });
  ve.configure(await choisirCodecVideo(W, H));
  let dernier = -1e9, derniereCle = -1e12;
  const image = (ts: number) => {
    if (ts <= dernier + 4000 || ve.encodeQueueSize > 12) return; // image déjà faite, ou encodeur débordé : on passe
    const f = new VideoFrame(canvas, { timestamp: ts });
    const cle = ts - derniereCle >= 2e6; if (cle) derniereCle = ts;
    ve.encode(f, { keyFrame: cle }); f.close();
    dernier = ts;
  };
  const sourdine = v.muted;
  v.muted = true;
  v.pause();
  v.currentTime = debut;
  await new Promise((ok) => v.addEventListener("seeked", ok, { once: true }));
  o.dessiner(c, v, debut); image(0);
  await v.play();
  await new Promise<void>((ok) => {
    const pas = () => {
      const t = v.currentTime;
      if (vErr) { ok(); return; }
      if (t >= finT || v.ended) { v.pause(); ok(); return; }
      o.dessiner(c, v, t); image(Math.round((t - debut) * 1e6));
      o.progres(Math.min(0.97, ((t - debut) / dureeClip) * (o.ending ? 0.85 : 0.97)));
      requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  });
  v.pause(); v.muted = sourdine;
  // cinématique de fin : fondu enchaîné de 0,4 s depuis la dernière image
  if (o.ending && !vErr) {
    const fv = o.ending.el, fige = document.createElement("canvas"); fige.width = W; fige.height = H; fige.getContext("2d")!.drawImage(canvas, 0, 0);
    const fm = fv.muted; fv.muted = true; fv.currentTime = 0;
    try {
      await fv.play();
      const limite = Date.now() + (dureeFin + 2) * 1000;
      await new Promise<void>((ok) => {
        const pas = () => {
          c.globalAlpha = 1; c.drawImage(fige, 0, 0);
          c.globalAlpha = Math.min(1, fv.currentTime / 0.4); c.drawImage(fv, 0, 0, W, H); c.globalAlpha = 1;
          image(Math.round((dureeClip + fv.currentTime) * 1e6));
          o.progres(0.85 + 0.12 * Math.min(1, fv.currentTime / Math.max(0.1, dureeFin)));
          if (fv.ended || fv.currentTime >= dureeFin - 0.02 || Date.now() > limite) { ok(); return; }
          requestAnimationFrame(pas);
        };
        requestAnimationFrame(pas);
      });
    } catch { /* cinématique illisible : la vidéo est livrée sans */ }
    fv.pause(); fv.muted = fm;
  }
  await ve.flush(); ve.close();
  if (vErr) throw vErr;
  if (!vDesc || !vChunks.length) throw new Error("aucune image encodée");
  for (let i = 1; i < vChunks.length; i++) if (vChunks[i].ts <= vChunks[i - 1].ts) throw new Error("images dans le désordre");
  o.progres(0.99);
  return assembler({ W, H, vDesc, vChunks, asc, aChunks, dureeAudio: mix.length });
}

// ─────────────────────────────────────────────────────────────
//  Écriture du fichier MP4 (ftyp · moov · mdat), « fast start » : l'index est au début
// ─────────────────────────────────────────────────────────────
type Morceau = Uint8Array;
const u32 = (n: number) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const u16 = (n: number) => new Uint8Array([(n >>> 8) & 255, n & 255]);
const u8 = (n: number) => new Uint8Array([n & 255]);
const txt = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));
const zeros = (n: number) => new Uint8Array(n);
function joindre(l: Morceau[]): Uint8Array { const n = l.reduce((a, b) => a + b.length, 0), o = new Uint8Array(n); let p = 0; for (const x of l) { o.set(x, p); p += x.length; } return o; }
const boite = (type: string, ...l: Morceau[]) => { const c = joindre(l); return joindre([u32(c.length + 8), txt(type), c]); };
const pleine = (type: string, version: number, flags: number, ...l: Morceau[]) => boite(type, u8(version), new Uint8Array([(flags >> 16) & 255, (flags >> 8) & 255, flags & 255]), ...l);
const MATRICE = joindre([u32(0x00010000), u32(0), u32(0), u32(0), u32(0x00010000), u32(0), u32(0), u32(0), u32(0x40000000)]);
// descripteur MPEG-4 (taille sur 4 octets)
const desc = (tag: number, ...l: Morceau[]) => { const c = joindre(l); return joindre([u8(tag), new Uint8Array([0x80 | ((c.length >> 21) & 127), 0x80 | ((c.length >> 14) & 127), 0x80 | ((c.length >> 7) & 127), c.length & 127]), c]); };

function stts(durees: number[]): Uint8Array {
  const runs: [number, number][] = [];
  for (const d of durees) { const r = runs[runs.length - 1]; if (r && r[1] === d) r[0]++; else runs.push([1, d]); }
  return pleine("stts", 0, 0, u32(runs.length), ...runs.flatMap(([n, d]) => [u32(n), u32(d)]));
}
function stbl(entree: Uint8Array, durees: number[], tailles: number[], offsets: number[], cles: number[] | null): Uint8Array {
  return boite("stbl",
    pleine("stsd", 0, 0, u32(1), entree),
    stts(durees),
    ...(cles ? [pleine("stss", 0, 0, u32(cles.length), ...cles.map(u32))] : []),
    pleine("stsc", 0, 0, u32(1), u32(1), u32(1), u32(1)),
    pleine("stsz", 0, 0, u32(0), u32(tailles.length), ...tailles.map(u32)),
    pleine("stco", 0, 0, u32(offsets.length), ...offsets.map(u32)));
}
function piste(id: number, video: boolean, W: number, H: number, echelle: number, dureeMedia: number, dureeFilm: number, table: Uint8Array): Uint8Array {
  return boite("trak",
    pleine("tkhd", 0, 3, u32(0), u32(0), u32(id), u32(0), u32(dureeFilm), zeros(8), u16(0), u16(video ? 0 : 1), u16(video ? 0 : 0x0100), u16(0), MATRICE, u32(video ? W << 16 : 0), u32(video ? H << 16 : 0)),
    boite("mdia",
      pleine("mdhd", 0, 0, u32(0), u32(0), u32(echelle), u32(dureeMedia), u16(0x55c4), u16(0)),
      pleine("hdlr", 0, 0, u32(0), txt(video ? "vide" : "soun"), zeros(12), txt(video ? "VideoHandler" : "SoundHandler"), u8(0)),
      boite("minf",
        video ? pleine("vmhd", 0, 1, zeros(8)) : pleine("smhd", 0, 0, zeros(4)),
        boite("dinf", pleine("dref", 0, 0, u32(1), pleine("url ", 0, 1))),
        table)));
}

export function assembler(p: { W: number; H: number; vDesc: Uint8Array; vChunks: { data: Uint8Array; ts: number; cle: boolean }[]; asc: Uint8Array; aChunks: { data: Uint8Array; ts: number }[]; dureeAudio: number }): Blob {
  const { W, H } = p;
  // temps vidéo dans l'échelle 90 kHz (arrondis cumulés sans dérive)
  const tv = p.vChunks.map((x) => Math.round((x.ts * VTS) / 1e6));
  const dv = tv.map((t, i) => (i + 1 < tv.length ? Math.max(1, tv[i + 1] - t) : Math.round(VTS / FPS)));
  const dureeV = tv[tv.length - 1] + dv[dv.length - 1];
  const da = p.aChunks.map(() => 1024);
  const dureeA = p.aChunks.length * 1024;
  const dureeFilm = Math.round(Math.max(dureeV / VTS, dureeA / SR) * 1000);
  // ordre dans mdat : son et images entrelacés selon le temps
  const ordre: { v: boolean; i: number; t: number }[] = [
    ...p.vChunks.map((x, i) => ({ v: true, i, t: x.ts })),
    ...p.aChunks.map((x, i) => ({ v: false, i, t: x.ts })),
  ].sort((a, b) => a.t - b.t || Number(b.v) - Number(a.v));
  const avc1 = boite("avc1", zeros(6), u16(1), u16(0), u16(0), zeros(12), u16(W), u16(H), u32(0x00480000), u32(0x00480000), u32(0), u16(1), zeros(32), u16(0x0018), u16(0xffff), boite("avcC", p.vDesc));
  const mp4a = boite("mp4a", zeros(6), u16(1), zeros(8), u16(2), u16(16), u16(0), u16(0), u32(SR << 16),
    pleine("esds", 0, 0, desc(0x03, u16(2), u8(0), desc(0x04, u8(0x40), u8(0x15), zeros(3), u32(192000), u32(192000), desc(0x05, p.asc)), desc(0x06, u8(0x02)))));
  const cles = p.vChunks.map((x, i) => (x.cle ? i + 1 : 0)).filter(Boolean);
  const construireMoov = (offV: number[], offA: number[]) => boite("moov",
    pleine("mvhd", 0, 0, u32(0), u32(0), u32(1000), u32(dureeFilm), u32(0x00010000), u16(0x0100), zeros(10), MATRICE, zeros(24), u32(3)),
    piste(1, true, W, H, VTS, dureeV, dureeFilm, stbl(avc1, dv, p.vChunks.map((x) => x.data.length), offV, cles)),
    piste(2, false, W, H, SR, dureeA, dureeFilm, stbl(mp4a, da, p.aChunks.map((x) => x.data.length), offA, null)));
  const ftyp = boite("ftyp", txt("isom"), u32(0x200), txt("isom"), txt("iso2"), txt("avc1"), txt("mp41"));
  // 1er passage pour connaître la taille de moov, puis les vraies positions des échantillons
  const tailleMoov = construireMoov(p.vChunks.map(() => 0), p.aChunks.map(() => 0)).length;
  const offV: number[] = new Array(p.vChunks.length), offA: number[] = new Array(p.aChunks.length);
  let pos = ftyp.length + tailleMoov + 8;
  for (const e of ordre) { const d = e.v ? p.vChunks[e.i].data : p.aChunks[e.i].data; (e.v ? offV : offA)[e.i] = pos; pos += d.length; }
  const moov = construireMoov(offV, offA);
  const tailleMdat = pos - ftyp.length - tailleMoov;
  const morceaux = [ftyp, moov, u32(tailleMdat), txt("mdat")] as BlobPart[];
  for (const e of ordre) morceaux.push((e.v ? p.vChunks[e.i].data : p.aChunks[e.i].data) as BlobPart);
  return new Blob(morceaux, { type: "video/mp4" });
}
