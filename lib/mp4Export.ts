// Export vidéo image par image (WebCodecs) → fichier MP4 propre (H.264 + AAC), sans bibliothèque.
// Pourquoi : l'enregistrement « MediaRecorder » donnait des fichiers sans durée (lus « 3000 h » en boucle),
// et le son pouvait se décaler (ou repartir de la fin du clip) car il était capté en direct pendant la lecture.
// Ici : le son est décodé depuis le fichier puis mixé hors ligne (coupe exacte + cinématique de fin), et chaque
// image porte l'horodatage de la vidéo source : image et son restent calés, quelle que soit la fluidité de l'appareil.

/* eslint-disable @typescript-eslint/no-explicit-any */

// WebCodecs pris sur l'objet global : le projet ne dépend pas des définitions de types d'une version précise
const WC = (): any => globalThis as any;
const SR = 48000;
const FPS = 60;
const VTS = 90000; // échelle de temps de la piste vidéo

export function webcodecsDispo(): boolean {
  return typeof window !== "undefined" && "VideoEncoder" in window && "AudioEncoder" in window && "VideoFrame" in window && "AudioData" in window && typeof OfflineAudioContext !== "undefined";
}

/** Résultat : la vidéo et l'état du son vérifié dans le fichier final. */
export type ResultatMp4 = { blob: Blob; son: "ok" | "muet-source" | "plan-b" | "perdu"; detail?: string };

const crete = (b: AudioBuffer) => { let m = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i += 16) { const v = Math.abs(d[i]); if (v > m) m = v; } } return m; };

// Configuration AAC-LC (AudioSpecificConfig) : type 2, fréquence, canaux — écrite nous-mêmes,
// car certains navigateurs (Safari) donnent une description dans un autre format que celui du MP4.
function ascAac(sr: number, ch: number): Uint8Array {
  const idx = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350].indexOf(sr);
  const f = idx < 0 ? 3 : idx;
  return new Uint8Array([(2 << 3) | (f >> 1), ((f & 1) << 7) | (ch << 3)]);
}
// Safari peut sortir des trames AAC avec un en-tête ADTS : il faut l'enlever dans un MP4
function sansAdts(d: Uint8Array): Uint8Array {
  if (d.length > 9 && d[0] === 0xff && (d[1] & 0xf6) === 0xf0) { const h = d[1] & 1 ? 7 : 9; const n = ((d[3] & 3) << 11) | (d[4] << 3) | (d[5] >> 5); if (n === d.length || n <= d.length) return d.subarray(h, n || d.length); }
  return d;
}

const versU8 = (b: unknown): Uint8Array | null => {
  if (!b) return null;
  if (b instanceof Uint8Array) return new Uint8Array(b);
  if (ArrayBuffer.isView(b)) return new Uint8Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  return new Uint8Array((b as ArrayBuffer).slice(0));
};

export async function decoderSon(src: Blob | string): Promise<AudioBuffer> {
  const buf = typeof src === "string" ? await (await fetch(src)).arrayBuffer() : await src.arrayBuffer();
  const ctx = () => new OfflineAudioContext(2, SR, SR);
  let direct: AudioBuffer | null = null, err: unknown = null;
  try { direct = await ctx().decodeAudioData(buf.slice(0)); } catch (e) { err = e; }
  // Safari ne décode pas toujours le son d'une vidéo .mov / .mp4 complète (erreur, ou son vide) :
  // on sort alors la piste AAC dans un petit fichier audio .m4a
  if (!direct || crete(direct) < 1e-4) {
    const m4a = extraireAac(new Uint8Array(buf));
    if (m4a) { try { const b = await ctx().decodeAudioData(m4a.buffer as ArrayBuffer); if (!direct || crete(b) > crete(direct)) return b; } catch (e) { err = err || e; } }
  }
  if (direct) return direct;
  throw err || new Error("son du clip illisible");
}

/** Plan B du son : le mixage est joué et enregistré par le navigateur (AAC), puis remis dans le MP4. */
async function aacParEnregistrement(mix: AudioBuffer, ctxDonne?: AudioContext | null): Promise<{ asc: Uint8Array; trames: Uint8Array[]; sr: number } | null> {
  const MR = (globalThis as any).MediaRecorder;
  if (!MR) return null;
  const type = ["audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/aac"].find((t) => { try { return MR.isTypeSupported(t); } catch { return false; } });
  if (!type) return null;
  const ctx = ctxDonne || new AudioContext();
  try { await ctx.resume(); } catch { /* déjà actif */ }
  if (ctx.state !== "running") return null;
  const dest = ctx.createMediaStreamDestination();
  const src = ctx.createBufferSource(); src.buffer = mix; src.connect(dest);
  const rec = new MR(dest.stream, { mimeType: type, audioBitsPerSecond: 192000 });
  const parts: Blob[] = [];
  rec.ondataavailable = (e: any) => { if (e.data && e.data.size) parts.push(e.data); };
  const fini = new Promise((r) => { rec.onstop = r; });
  rec.start();
  await new Promise((r) => setTimeout(r, 120));
  const joue = new Promise((r) => { src.onended = r; });
  src.start();
  await joue;
  await new Promise((r) => setTimeout(r, 250));
  rec.stop(); await fini;
  const d = new Uint8Array(await new Blob(parts).arrayBuffer());
  const p = lirePisteAac(d);
  if (!p || !p.trames.length) return null;
  // l'enregistrement commence ~0,12 s avant le son : on retire ces trames vides pour rester calé
  const avance = Math.round((0.12 * (p.sr || SR)) / 1024);
  return { sr: p.sr || SR, asc: p.asc, trames: p.trames.slice(Math.min(avance, Math.max(0, p.trames.length - 1))) };
}

// ── Lecture de la piste son AAC d'un fichier MP4 / MOV (iPhone, Android, OBS…) ──
function lireBoites(d: Uint8Array, debut: number, fin: number): { type: string; deb: number; fin: number; corps: number }[] {
  const out: { type: string; deb: number; fin: number; corps: number }[] = [];
  const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
  let p = debut;
  while (p + 8 <= fin) {
    let taille = dv.getUint32(p); const type = String.fromCharCode(d[p + 4], d[p + 5], d[p + 6], d[p + 7]);
    let corps = p + 8;
    if (taille === 1) { taille = Number(dv.getBigUint64(p + 8)); corps = p + 16; } else if (taille === 0) taille = fin - p;
    if (taille < 8 || p + taille > fin) break;
    out.push({ type, deb: p, fin: p + taille, corps });
    p += taille;
  }
  return out;
}
export function extraireAac(d: Uint8Array): Uint8Array | null {
  const p = lirePisteAac(d);
  if (!p || !p.trames.length) return null;
  return assemblerAudio(p.asc, p.trames, p.sr, p.ch);
}

/** Piste son AAC d'un MP4 / MOV / M4A (classique ou en fragments) : configuration + trames. */
export function lirePisteAac(d: Uint8Array): { asc: Uint8Array; trames: Uint8Array[]; sr: number; ch: number } | null {
  try {
    const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
    const enfant = (b: { corps: number; fin: number }, t: string, saut = 0) => lireBoites(d, b.corps + saut, b.fin).find((x) => x.type === t);
    const moov = lireBoites(d, 0, d.length).find((x) => x.type === "moov"); if (!moov) return null;
    for (const trak of lireBoites(d, moov.corps, moov.fin).filter((x) => x.type === "trak")) {
      const mdia = enfant(trak, "mdia"); if (!mdia) continue;
      const hdlr = enfant(mdia, "hdlr"); if (!hdlr || String.fromCharCode(...d.subarray(hdlr.corps + 8, hdlr.corps + 12)) !== "soun") continue;
      const stbl = enfant(enfant(mdia, "minf")!, "stbl"); if (!stbl) continue;
      const stsd = enfant(stbl, "stsd")!; const entree = lireBoites(d, stsd.corps + 8, stsd.fin)[0];
      if (!entree || entree.type !== "mp4a") return null;
      // version de l'entrée son (QuickTime v1/v2 : champs en plus avant les sous-boîtes)
      const version = dv.getUint16(entree.corps + 8);
      const saut = 28 + (version === 1 ? 16 : version === 2 ? 36 : 0);
      let esds = lireBoites(d, entree.corps + saut, entree.fin).find((x) => x.type === "esds");
      if (!esds) { const wave = lireBoites(d, entree.corps + saut, entree.fin).find((x) => x.type === "wave"); if (wave) esds = lireBoites(d, wave.corps, wave.fin).find((x) => x.type === "esds"); }
      if (!esds) return null;
      // DecoderSpecificInfo (tag 0x05) = configuration AAC
      let q = esds.corps + 4, asc: Uint8Array | null = null;
      while (q < esds.fin - 2) { if (d[q] === 0x05) { let n = 0, k = q + 1; for (let i = 0; i < 4; i++) { const b = d[k++]; n = (n << 7) | (b & 127); if (!(b & 128)) break; } asc = d.slice(k, k + n); break; } q++; }
      if (!asc) return null;
      const stsz = enfant(stbl, "stsz")!, stsc = enfant(stbl, "stsc")!, stco = enfant(stbl, "stco") || enfant(stbl, "co64")!;
      const tailleFixe = dv.getUint32(stsz.corps + 4), nb = dv.getUint32(stsz.corps + 8);
      const tailles = Array.from({ length: nb }, (_, i) => (tailleFixe || dv.getUint32(stsz.corps + 12 + i * 4)));
      const co64 = stco.type === "co64", nChunks = dv.getUint32(stco.corps + 4);
      const offs = Array.from({ length: nChunks }, (_, i) => (co64 ? Number(dv.getBigUint64(stco.corps + 8 + i * 8)) : dv.getUint32(stco.corps + 8 + i * 4)));
      const nE = dv.getUint32(stsc.corps + 4), regles = Array.from({ length: nE }, (_, i) => ({ premier: dv.getUint32(stsc.corps + 8 + i * 12), n: dv.getUint32(stsc.corps + 12 + i * 12) }));
      const trames: Uint8Array[] = []; let s = 0;
      for (let c = 0; c < nChunks && s < nb; c++) {
        let n = regles[0].n; for (const r of regles) if (c + 1 >= r.premier) n = r.n;
        let o = offs[c];
        for (let k = 0; k < n && s < nb; k++) { trames.push(d.subarray(o, o + tailles[s])); o += tailles[s]; s++; }
      }
      const sr = (() => { const idx = ((asc[0] & 7) << 1) | (asc[1] >> 7); return [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350][idx] || 44100; })();
      const ch = (asc[1] >> 3) & 15 || 2;
      if (!trames.length) {
        // MP4 en fragments (enregistrement du navigateur) : les trames sont dans les boîtes moof / mdat
        const tkhd = enfant(trak, "tkhd"); const idPiste = tkhd ? dv.getUint32(tkhd.corps + (d[tkhd.corps] === 1 ? 20 : 12)) : 0;
        for (const moof of lireBoites(d, 0, d.length).filter((x) => x.type === "moof")) {
          for (const traf of lireBoites(d, moof.corps, moof.fin).filter((x) => x.type === "traf")) {
            const tfhd = enfant(traf, "tfhd"); if (!tfhd) continue;
            const fl = dv.getUint32(tfhd.corps) & 0xffffff; if (dv.getUint32(tfhd.corps + 4) !== idPiste && idPiste) continue;
            let q = tfhd.corps + 8, base = moof.deb, tailleDef = 0;
            if (fl & 1) { base = Number(dv.getBigUint64(q)); q += 8; }
            if (fl & 2) q += 4; if (fl & 8) q += 4;
            if (fl & 16) { tailleDef = dv.getUint32(q); q += 4; }
            for (const trun of lireBoites(d, traf.corps, traf.fin).filter((x) => x.type === "trun")) {
              const tf = dv.getUint32(trun.corps) & 0xffffff, n = dv.getUint32(trun.corps + 4);
              let r = trun.corps + 8, off = base;
              if (tf & 1) { off = base + dv.getInt32(r); r += 4; }
              if (tf & 4) r += 4;
              for (let i = 0; i < n; i++) {
                if (tf & 0x100) r += 4;
                let t = tailleDef; if (tf & 0x200) { t = dv.getUint32(r); r += 4; }
                if (tf & 0x400) r += 4; if (tf & 0x800) r += 4;
                if (t > 0 && off + t <= d.length) trames.push(d.subarray(off, off + t));
                off += t;
              }
            }
          }
        }
      }
      return { asc, trames: trames.map(sansAdts), sr, ch };
    }
    return null;
  } catch { return null; }
}

async function choisirCodecVideo(W: number, H: number): Promise<any> {
  // profils sans images B (l'ordre de décodage = l'ordre d'affichage) : baseline puis main, niveaux 5.x
  for (const codec of ["avc1.42E032", "avc1.42E033", "avc1.4D0032", "avc1.42E02A", "avc1.4D002A"]) {
    const cfg = { codec, width: W, height: H, bitrate: 14_000_000, framerate: FPS, latencyMode: "realtime", avc: { format: "avc" } };
    try { const s = await WC().VideoEncoder.isConfigSupported(cfg); if (s.supported) return cfg; } catch { /* suivant */ }
  }
  throw new Error("encodeur H.264 indisponible");
}

/** Ce que l'appelant fournit : le son déjà mixé, et le rendu des images (il dessine dans `canvas`, puis appelle `image(t)`). */
export type OptsMp4 = {
  W: number; H: number;
  mix: AudioBuffer;
  canvas: HTMLCanvasElement;
  // rendre : dessine chaque image dans le canvas puis appelle image(t) (t = temps de la vidéo finale).
  // charge() : l'encodeur prend du retard → mettre la lecture en pause et attendre vider().
  rendre: (outils: { image: (t: number) => boolean; charge: () => boolean; vider: () => Promise<void>; erreur: () => unknown }) => Promise<void>;
  progres?: (p: number) => void;
  ctxAudio?: AudioContext | null; // contexte son « débloqué » au clic (Safari), pour le plan B du son
  etape?: (texte: string) => void;
};

/** Crée le MP4. Lève une erreur si le navigateur ne sait pas faire (l'appelant repasse alors au mode de secours). */
export async function exporterMp4(o: OptsMp4): Promise<ResultatMp4> {
  const { W, H, mix, canvas } = o;
  // ── 1. Encodage du son (AAC) ──
  const aChunks: { data: Uint8Array; ts: number }[] = [];
  let aDesc: Uint8Array | null = null, aErr: unknown = null;
  const ae = new (WC().AudioEncoder)({
    output: (ch: any, meta: any) => { const d0 = new Uint8Array(ch.byteLength); ch.copyTo(d0); const d = sansAdts(d0); aChunks.push({ data: d, ts: ch.timestamp }); if (meta?.decoderConfig?.description) aDesc = versU8(meta.decoderConfig.description); },
    error: (e: unknown) => { aErr = e; },
  });
  let aCfg: any = { codec: "mp4a.40.2", sampleRate: SR, numberOfChannels: 2, bitrate: 192_000, aac: { format: "aac" } };
  if (!(await WC().AudioEncoder.isConfigSupported(aCfg).catch(() => ({ supported: false }))).supported) { aCfg = { codec: "mp4a.40.2", sampleRate: SR, numberOfChannels: 2, bitrate: 192_000 }; }
  if (!(await WC().AudioEncoder.isConfigSupported(aCfg)).supported) throw new Error("encodeur AAC indisponible");
  ae.configure(aCfg);
  const g0 = mix.getChannelData(0), g1 = mix.numberOfChannels > 1 ? mix.getChannelData(1) : g0;
  for (let i = 0; i < mix.length; i += 4800) {
    const n = Math.min(4800, mix.length - i), d = new Float32Array(n * 2);
    d.set(g0.subarray(i, i + n), 0); d.set(g1.subarray(i, i + n), n);
    const ad = new (WC().AudioData)({ format: "f32-planar", sampleRate: SR, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((i / SR) * 1e6), data: d });
    ae.encode(ad); ad.close();
  }
  await ae.flush(); ae.close();
  if (aErr) throw aErr;
  const ascCalc = ascAac(SR, 2);
  const da = aDesc as Uint8Array | null;
  const asc: Uint8Array = da && da.length >= 2 && da.length <= 5 && (da[0] >> 3) === 2 ? da : ascCalc;

  // ── 2. Les images, sur une grille fixe de 60 images/s ──
  const vChunks: { data: Uint8Array; ts: number; cle: boolean }[] = [];
  let vDesc: Uint8Array | null = null, vErr: unknown = null;
  const ve = new (WC().VideoEncoder)({
    output: (ch: any, meta: any) => { const d = new Uint8Array(ch.byteLength); ch.copyTo(d); vChunks.push({ data: d, ts: ch.timestamp, cle: ch.type === "key" }); if (meta?.decoderConfig?.description) vDesc = versU8(meta.decoderConfig.description); },
    error: (e: unknown) => { vErr = e; },
  });
  ve.configure(await choisirCodecVideo(W, H));
  let derniereImage = -1;
  const image = (t: number) => {
    if (vErr) return false;
    const n = Math.floor(t * FPS + 1e-6);
    if (n <= derniereImage) return false;
    const f = new (WC().VideoFrame)(canvas, { timestamp: Math.round((n * 1e6) / FPS) });
    ve.encode(f, { keyFrame: n % (FPS * 2) === 0 || derniereImage < 0 }); f.close();
    derniereImage = n;
    return true;
  };
  await o.rendre({
    image,
    charge: () => ve.encodeQueueSize > 3,
    vider: async () => { while (ve.encodeQueueSize > 1 && !vErr) await new Promise((ok) => setTimeout(ok, 15)); },
    erreur: () => vErr,
  });
  await ve.flush(); ve.close();
  if (vErr) throw vErr;
  if (!vDesc || !vChunks.length) throw new Error("aucune image encodée");
  for (let i = 1; i < vChunks.length; i++) if (vChunks[i].ts <= vChunks[i - 1].ts) throw new Error("images dans le désordre");

  // ── 3. Contrôle du son dans le fichier final : on le relit comme le ferait un lecteur ──
  const sourceMuette = crete(mix) < 1e-4;
  const blob = assembler({ W, H, vDesc, vChunks, asc, aChunks, dureeAudio: mix.length });
  if (sourceMuette) { o.progres?.(1); return { blob, son: "muet-source", detail: "aucun son dans le montage (ou son illisible dans ce navigateur)" }; }
  const verifier = async (b: Blob) => {
    try { const m4a = extraireAac(new Uint8Array(await b.arrayBuffer())); if (!m4a) return false; const r = await new OfflineAudioContext(2, SR, SR).decodeAudioData(m4a.buffer as ArrayBuffer); return crete(r) > 1e-4; }
    catch { return false; }
  };
  if (await verifier(blob)) { o.progres?.(1); return { blob, son: "ok" }; }
  o.etape?.("Le son est réenregistré pour ce navigateur…");
  const b2 = await aacParEnregistrement(mix, o.ctxAudio).catch(() => null);
  if (b2) {
    const n = b2.trames.length;
    const essai = assembler({ W, H, vDesc, vChunks, asc: b2.asc, aChunks: b2.trames.map((t, i) => ({ data: t, ts: Math.round((i * 1024 * 1e6) / b2.sr) })), dureeAudio: n * 1024, srA: b2.sr });
    if (await verifier(essai)) { o.progres?.(1); return { blob: essai, son: "plan-b" }; }
  }
  o.progres?.(1);
  return { blob, son: "perdu", detail: "ce navigateur n’a pas réussi à encoder le son" };
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

function assemblerAudio(asc: Uint8Array, trames: Uint8Array[], sr: number, ch: number): Uint8Array {
  const mp4a = boite("mp4a", zeros(6), u16(1), zeros(8), u16(ch), u16(16), u16(0), u16(0), u32(sr << 16),
    pleine("esds", 0, 0, desc(0x03, u16(1), u8(0), desc(0x04, u8(0x40), u8(0x15), zeros(3), u32(256000), u32(192000), desc(0x05, asc)), desc(0x06, u8(0x02)))));
  const duree = trames.length * 1024, ms = Math.round((duree / sr) * 1000);
  const ftyp = boite("ftyp", txt("M4A "), u32(0), txt("M4A "), txt("isom"), txt("mp42"));
  const moov = (offs: number[]) => boite("moov",
    pleine("mvhd", 0, 0, u32(0), u32(0), u32(1000), u32(ms), u32(0x00010000), u16(0x0100), zeros(10), MATRICE, zeros(24), u32(2)),
    piste(1, false, 0, 0, sr, duree, ms, stbl(mp4a, trames.map(() => 1024), trames.map((t) => t.length), offs, null)));
  const taille = moov(trames.map(() => 0)).length;
  let pos = ftyp.length + taille + 8; const offs = trames.map((t) => { const o = pos; pos += t.length; return o; });
  return joindre([ftyp, moov(offs), u32(pos - ftyp.length - taille), txt("mdat"), ...trames]);
}

export function assembler(p: { W: number; H: number; vDesc: Uint8Array; vChunks: { data: Uint8Array; ts: number; cle: boolean }[]; asc: Uint8Array; aChunks: { data: Uint8Array; ts: number }[]; dureeAudio: number; srA?: number }): Blob {
  const { W, H } = p;
  const SRA = p.srA || SR;
  // temps vidéo dans l'échelle 90 kHz (arrondis cumulés sans dérive)
  const tv = p.vChunks.map((x) => Math.round((x.ts * VTS) / 1e6));
  const dv = tv.map((t, i) => (i + 1 < tv.length ? Math.max(1, tv[i + 1] - t) : Math.round(VTS / FPS)));
  const dureeV = tv[tv.length - 1] + dv[dv.length - 1];
  const da = p.aChunks.map(() => 1024);
  const dureeA = p.aChunks.length * 1024;
  const dureeFilm = Math.round(Math.max(dureeV / VTS, dureeA / SRA) * 1000);
  // ordre dans mdat : son et images entrelacés selon le temps
  const ordre: { v: boolean; i: number; t: number }[] = [
    ...p.vChunks.map((x, i) => ({ v: true, i, t: x.ts })),
    ...p.aChunks.map((x, i) => ({ v: false, i, t: x.ts })),
  ].sort((a, b) => a.t - b.t || Number(b.v) - Number(a.v));
  const avc1 = boite("avc1", zeros(6), u16(1), u16(0), u16(0), zeros(12), u16(W), u16(H), u32(0x00480000), u32(0x00480000), u32(0), u16(1), zeros(32), u16(0x0018), u16(0xffff), boite("avcC", p.vDesc));
  const mp4a = boite("mp4a", zeros(6), u16(1), zeros(8), u16(2), u16(16), u16(0), u16(0), u32(SRA << 16),
    pleine("esds", 0, 0, desc(0x03, u16(2), u8(0), desc(0x04, u8(0x40), u8(0x15), zeros(3), u32(192000), u32(192000), desc(0x05, p.asc)), desc(0x06, u8(0x02)))));
  const cles = p.vChunks.map((x, i) => (x.cle ? i + 1 : 0)).filter(Boolean);
  const construireMoov = (offV: number[], offA: number[]) => boite("moov",
    pleine("mvhd", 0, 0, u32(0), u32(0), u32(1000), u32(dureeFilm), u32(0x00010000), u16(0x0100), zeros(10), MATRICE, zeros(24), u32(3)),
    piste(1, true, W, H, VTS, dureeV, dureeFilm, stbl(avc1, dv, p.vChunks.map((x) => x.data.length), offV, cles)),
    piste(2, false, W, H, SRA, dureeA, dureeFilm, stbl(mp4a, da, p.aChunks.map((x) => x.data.length), offA, null)));
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
