// Studio montage : le son final, mixé hors ligne (exact à l'échantillon près) :
// morceaux de la piste vidéo (avec leur vitesse, volume, fondus), incrustations, sons / musiques, cinématique de fin.
import { debuts, duree, dureeTotale, mediaDe, vitesse, type DocMontage } from "@/lib/montage/projet";

const SR = 48000;
const F = 0.006; // anti-« clic » à chaque raccord

export async function mixer(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, sons: Map<string, AudioBuffer | null>, fin: { son: AudioBuffer | null; duree: number } | null): Promise<AudioBuffer> {
  const total = dureeTotale(d.morceaux), dureeFin = fin ? fin.duree : 0;
  const off = new OfflineAudioContext(2, Math.max(1, Math.ceil((total + dureeFin) * SR)), SR);
  const poser = (buf: AudioBuffer | null | undefined, pos: number, a: number, b: number, v: number, vol: number, fE: number, fS: number) => {
    if (!buf || vol <= 0 || pos >= total) return;
    const len = Math.min((b - a) / v, total - pos);
    if (len <= 0.01) return;
    const s = off.createBufferSource(), g = off.createGain();
    s.buffer = buf; s.playbackRate.value = v; s.connect(g); g.connect(off.destination);
    const e1 = Math.max(F, fE), e2 = Math.max(F, fS);
    g.gain.setValueAtTime(0, pos); g.gain.linearRampToValueAtTime(vol, pos + Math.min(e1, len / 2));
    g.gain.setValueAtTime(vol, Math.max(pos + Math.min(e1, len / 2), pos + len - Math.min(e2, len / 2))); g.gain.linearRampToValueAtTime(0, pos + len);
    s.start(pos, Math.max(0, a), len * v);
  };
  const deb = debuts(d.morceaux);
  d.morceaux.forEach((m, k) => { if (!m.muet) poser(sons.get(mediaDe(m)), deb[k], m.a, m.b, vitesse(m), m.vol ?? 1, m.fE || 0, m.fS || 0); });
  for (const c of d.incrustations) if (!c.muet) poser(sons.get(c.media), c.debut, c.a, c.b, vitesse(c), c.vol, 0, 0);
  for (const s of d.sons) poser(sons.get(s.media), s.debut, s.a, s.b, vitesse(s), s.vol, s.fE, s.fS);
  if (fin?.son) {
    const g = off.createGain(); g.gain.setValueAtTime(0, total); g.gain.linearRampToValueAtTime(1, total + 0.4);
    const s2 = off.createBufferSource(); s2.buffer = fin.son; s2.connect(g); g.connect(off.destination); s2.start(total);
  }
  return off.startRendering();
}

/** Durée totale d'un élément sur la timeline (pour les pistes). */
export const finDe = (x: { debut: number; a: number; b: number; v?: number }) => x.debut + duree(x);
