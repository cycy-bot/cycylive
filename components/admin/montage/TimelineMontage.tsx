"use client";

// Timeline multipiste du Studio montage (inspirée de CapCut) :
//  • piste VIDÉO : les morceaux du clip mis bout à bout (pellicule + onde du son). Toucher = choisir,
//    tirer un bord = rogner, glisser = changer l'ordre. Un morceau supprimé disparaît : tout se resserre.
//  • au-dessus : une piste par élément (titre, encart, barre, sous-titres, étiquette, textes) et les flashs.
//    Glisser = déplacer, tirer un bord = changer la durée.
//  • incrustations (photo / vidéo par-dessus) et sons / musiques : chacun sur sa piste (plusieurs lignes si
//    des éléments se chevauchent). Glisser = déplacer, tirer un bord = rogner.
//  • la tête de lecture traverse tout ; la règle et le zoom en haut.
import { useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { COULEURS, NOMS, type Calque, type SousTitre } from "@/lib/habillageTikTok";
import { debuts, deplacerMorceau, duree, mediaDe, rognerMorceau, vitesse, PRINCIPAL, type Incrust, type Media, type Morceau, type PisteSon } from "@/lib/montage/projet";
import type { Onde as TOnde, Pellicule } from "@/lib/montage/apercus";

export type Selection = { type: "morceau" | "calque" | "incrust" | "son"; id: string } | null;
export type Outil = "selection" | "lame";

type Props = {
  dureeSource: number;
  morceaux: Morceau[];
  calques: Calque[];
  sousTitres: SousTitre[];
  t: number; // temps monté
  sel: Selection;
  setSel: (s: Selection) => void;
  outil: Outil;
  setMorceaux: (f: (m: Morceau[]) => Morceau[], fusion?: string) => void;
  setCalques: (f: (c: Calque[]) => Calque[], fusion?: string) => void;
  finGeste: () => void;
  onSeek: (t: number) => void;
  onCouperA: (t: number) => void;
  medias: Media[];
  incrustations: Incrust[];
  sons: PisteSon[];
  setIncrust: (f: (c: Incrust[]) => Incrust[], fusion?: string) => void;
  setSons: (f: (c: PisteSon[]) => PisteSon[], fusion?: string) => void;
  dureeMax: (media?: string) => number;
  pellicules: Map<string, Pellicule>;
  ondes: Map<string, TOnde>;
  zoom: number; // pixels par seconde
  setZoom: (z: number) => void;
};

const LABEL = 104; // largeur de la colonne des noms de pistes
const fmtRegle = (s: number) => { const m = Math.floor(s / 60), r = Math.round(s - m * 60); return `${m}:${String(r).padStart(2, "0")}`; };
const ordreCalques: Calque["type"][] = ["carte", "texte", "etiquette", "soustitres", "encart", "barre"];

/** Premier temps monté où l'on voit l'instant source `src` (ou null s'il a été coupé). */
export function monteDepuisSource(m: Morceau[], src: number): number | null {
  const d = debuts(m);
  for (let k = 0; k < m.length; k++) if (mediaDe(m[k]) === PRINCIPAL && src >= m[k].a - 1e-6 && src <= m[k].b + 1e-6) return d[k] + (src - m[k].a) / vitesse(m[k]);
  return null;
}
/** Range les éléments sur des lignes sans chevauchement. */
function lignesSans<T extends { id: string; debut: number; a: number; b: number; v?: number }>(l: T[]): T[][] {
  const out: { fin: number; el: T[] }[] = [];
  for (const x of [...l].sort((p, q) => p.debut - q.debut)) {
    const r = out.find((o) => o.fin <= x.debut + 1e-6);
    if (r) { r.el.push(x); r.fin = x.debut + duree(x); } else out.push({ fin: x.debut + duree(x), el: [x] });
  }
  return out.map((o) => o.el);
}

export default function TimelineMontage(p: Props) {
  const { morceaux, calques, sousTitres, t, sel, setSel, outil, pellicules, ondes, zoom, medias } = p;
  const mediaParId = useMemo(() => new Map(medias.map((x) => [x.id, x])), [medias]);
  const defile = useRef<HTMLDivElement>(null);
  // la piste vidéo (en bas) reste visible à l'ouverture
  useEffect(() => { const d = defile.current; if (d) d.scrollTop = d.scrollHeight; }, []);
  const [drop, setDrop] = useState<{ id: string; vers: number; x: number } | null>(null);
  const deb = useMemo(() => debuts(morceaux), [morceaux]);
  const total = morceaux.reduce((n, x) => n + duree(x), 0);
  const finObjets = Math.max(0, ...p.incrustations.map((x) => x.debut + duree(x)), ...p.sons.map((x) => x.debut + duree(x)));
  const largeur = Math.max(200, Math.max(total, finObjets) * zoom + 80);
  const px = (s: number) => s * zoom;

  // la tête de lecture reste visible pendant la lecture
  useEffect(() => {
    const b = defile.current; if (!b) return;
    const x = LABEL + px(t);
    if (x < b.scrollLeft + LABEL + 20 || x > b.scrollLeft + b.clientWidth - 30) b.scrollLeft = Math.max(0, x - LABEL - (b.clientWidth - LABEL) / 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, zoom]);

  // pincer pour zoomer (iPad) / Ctrl + molette (ordinateur)
  useEffect(() => {
    const b = defile.current; if (!b) return;
    const roue = (e: WheelEvent) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); p.setZoom(Math.max(8, Math.min(600, zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)))); };
    b.addEventListener("wheel", roue, { passive: false });
    let d0 = 0, z0 = zoom;
    const tDebut = (e: TouchEvent) => { if (e.touches.length === 2) { d0 = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); z0 = zoom; } };
    const tBouge = (e: TouchEvent) => { if (e.touches.length === 2 && d0) { e.preventDefault(); const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); p.setZoom(Math.max(8, Math.min(600, z0 * (d / d0)))); } };
    const tFin = () => { d0 = 0; };
    b.addEventListener("touchstart", tDebut, { passive: true }); b.addEventListener("touchmove", tBouge, { passive: false }); b.addEventListener("touchend", tFin);
    return () => { b.removeEventListener("wheel", roue); b.removeEventListener("touchstart", tDebut); b.removeEventListener("touchmove", tBouge); b.removeEventListener("touchend", tFin); };
  }, [zoom, p]);

  const tempsDepuis = (clientX: number) => {
    const b = defile.current!; const r = b.getBoundingClientRect();
    return Math.max(0, Math.min(total, (clientX - r.left + b.scrollLeft - LABEL) / zoom));
  };
  // promener la tête (règle ou zone vide)
  function promener(e: React.PointerEvent) {
    if (e.button > 0) return;
    if (e.pointerType === "touch" && !(e.target as HTMLElement).closest("[data-regle]")) return; // au doigt : la piste défile, la règle sert à promener
    p.onSeek(tempsDepuis(e.clientX));
    const cible = e.currentTarget as HTMLElement; cible.setPointerCapture(e.pointerId);
    const bouger = (ev: PointerEvent) => p.onSeek(tempsDepuis(ev.clientX));
    const lacher = () => { cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); cible.removeEventListener("pointercancel", lacher); };
    cible.addEventListener("pointermove", bouger); cible.addEventListener("pointerup", lacher); cible.addEventListener("pointercancel", lacher);
  }

  // ── morceaux vidéo : toucher, rogner, déplacer ──
  function saisirMorceau(e: React.PointerEvent, m: Morceau, k: number, mode: "corps" | "a" | "b") {
    e.stopPropagation();
    // au doigt, un morceau pas encore choisi laisse défiler la piste (on le choisit d'un toucher, puis on le glisse)
    if (!(e.pointerType === "touch" && mode === "corps" && !(sel?.type === "morceau" && sel.id === m.id))) e.preventDefault();
    const x0 = e.clientX, a0 = m.a, b0 = m.b, vit = vitesse(m), maxi = p.dureeMax(m.media);
    const cible = e.currentTarget as HTMLElement; try { cible.setPointerCapture(e.pointerId); } catch { /* rien */ }
    let bouge = false;
    const libre = e.pointerType === "touch" && mode === "corps" && !(sel?.type === "morceau" && sel.id === m.id);
    if (mode !== "corps") { setSel({ type: "morceau", id: m.id }); }
    const bouger = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      if (libre) return;
      if (!bouge && Math.abs(dx) < 6) return;
      bouge = true;
      if (mode === "a") p.setMorceaux((l) => rognerMorceau(l, m.id, "a", a0 + (dx / zoom) * vit, maxi), "rogner-" + m.id);
      else if (mode === "b") p.setMorceaux((l) => rognerMorceau(l, m.id, "b", b0 + (dx / zoom) * vit, maxi), "rogner-" + m.id);
      else if (morceaux.length > 1) {
        // glisser : où le poser ? (entre deux morceaux)
        const x = px(deb[k]) + px(duree(m) / 2) + dx;
        let vers = 0; for (let j = 0; j < morceaux.length; j++) if (j !== k && px(deb[j] + duree(morceaux[j]) / 2) < x) vers++;
        const gauche = morceaux.filter((_, j) => j !== k).slice(0, vers).reduce((n, y) => n + duree(y), 0);
        setDrop({ id: m.id, vers, x: px(gauche) });
      }
    };
    const annule = () => { cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); cible.removeEventListener("pointercancel", annule); setDrop(null); p.finGeste(); };
    const lacher = (ev: PointerEvent) => {
      cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); cible.removeEventListener("pointercancel", annule);
      if (mode === "corps") {
        if (!bouge) {
          const tt = tempsDepuis(ev.clientX);
          if (outil === "lame") p.onCouperA(tt);
          else { setSel({ type: "morceau", id: m.id }); p.onSeek(tt); }
        } else {
          setDrop((d) => { if (d) p.setMorceaux((l) => deplacerMorceau(l, m.id, d.vers)); return null; });
        }
      }
      p.finGeste();
    };
    cible.addEventListener("pointermove", bouger); cible.addEventListener("pointerup", lacher); cible.addEventListener("pointercancel", annule);
  }

  // ── éléments : déplacer / changer la durée ──
  function saisirCalque(e: React.PointerEvent, c: Calque, mode: "bouger" | "debut" | "fin") {
    e.stopPropagation();
    const dejaChoisi = sel?.type === "calque" && sel.id === c.id;
    if (!(e.pointerType === "touch" && !dejaChoisi)) e.preventDefault();
    setSel({ type: "calque", id: c.id });
    const x0 = e.clientX, d0 = c.debut, f0 = c.fin;
    const cible = e.currentTarget as HTMLElement; cible.setPointerCapture(e.pointerId);
    let bouge = false;
    const libre = e.pointerType === "touch" && !dejaChoisi;
    const maj = (q: Partial<Calque>) => p.setCalques((l) => l.map((x) => (x.id === c.id ? { ...x, ...q } : x)), "calque-" + c.id);
    const bouger = (ev: PointerEvent) => {
      const dx = ev.clientX - x0; if (libre) return; if (!bouge && Math.abs(dx) < 5) return; bouge = true;
      const dt = dx / zoom;
      if (mode === "bouger") { const len = f0 - d0, nd = Math.max(0, Math.min(total - Math.min(len, total), d0 + dt)); maj({ debut: +nd.toFixed(3), fin: +(nd + len).toFixed(3) }); if (c.type === "flash") p.onSeek(nd); }
      else if (mode === "debut") maj({ debut: +Math.max(0, Math.min(f0 - 0.15, d0 + dt)).toFixed(3) });
      else maj({ fin: +Math.min(total, Math.max(d0 + 0.15, f0 + dt)).toFixed(3) });
    };
    const annule = () => { cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); cible.removeEventListener("pointercancel", annule); p.finGeste(); };
    const lacher = (ev: PointerEvent) => {
      cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); cible.removeEventListener("pointercancel", annule);
      if (!bouge && mode === "bouger") p.onSeek(c.type === "flash" ? c.debut : tempsDepuis(ev.clientX));
      p.finGeste();
    };
    cible.addEventListener("pointermove", bouger); cible.addEventListener("pointerup", lacher); cible.addEventListener("pointercancel", annule);
  }

  // ── incrustations et sons : déplacer, rogner ──
  function saisirObjet(e: React.PointerEvent, x: Incrust | PisteSon, genre: "incrust" | "son", mode: "bouger" | "a" | "b") {
    e.stopPropagation();
    const deja = sel?.type === genre && sel.id === x.id;
    if (!(e.pointerType === "touch" && !deja && mode === "bouger")) e.preventDefault();
    setSel({ type: genre, id: x.id });
    const x0 = e.clientX, d0 = x.debut, a0 = x.a, b0 = x.b, vit = vitesse(x), maxi = p.dureeMax(x.media), photo = mediaParId.get(x.media)?.type === "image";
    const cible = e.currentTarget as HTMLElement; try { cible.setPointerCapture(e.pointerId); } catch { /* rien */ }
    let bouge = false; const libre = e.pointerType === "touch" && !deja && mode === "bouger";
    const appliquer = (q: Partial<Incrust & PisteSon>) => (genre === "incrust" ? p.setIncrust((l) => l.map((y) => (y.id === x.id ? { ...y, ...q } : y)), "obj-" + x.id) : p.setSons((l) => l.map((y) => (y.id === x.id ? { ...y, ...q } : y)), "obj-" + x.id));
    const bouger = (ev: PointerEvent) => {
      const dx = ev.clientX - x0; if (libre) return; if (!bouge && Math.abs(dx) < 5) return; bouge = true;
      const dt = dx / zoom;
      if (mode === "bouger") appliquer({ debut: +Math.max(0, d0 + dt).toFixed(3) });
      else if (mode === "b") appliquer({ b: +Math.min(maxi, Math.max(a0 + 0.1, b0 + dt * vit)).toFixed(3) });
      else {
        // bord gauche : le début bouge, la fin reste en place
        const dd = Math.max(-d0, Math.min(duree(x) - 0.1, dt));
        if (photo) appliquer({ debut: +(d0 + dd).toFixed(3), b: +Math.max(0.1, b0 - dd).toFixed(3) });
        else { const na = Math.max(0, Math.min(b0 - 0.1, a0 + dd * vit)), reel = (na - a0) / vit; appliquer({ a: +na.toFixed(3), debut: +(d0 + reel).toFixed(3) }); }
      }
    };
    const fin = (ev: PointerEvent, ok: boolean) => {
      cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); cible.removeEventListener("pointercancel", annule);
      if (ok && !bouge && mode === "bouger") p.onSeek(tempsDepuis(ev.clientX));
      p.finGeste();
    };
    const lacher = (ev: PointerEvent) => fin(ev, true), annule = (ev: PointerEvent) => fin(ev, false);
    cible.addEventListener("pointermove", bouger); cible.addEventListener("pointerup", lacher); cible.addEventListener("pointercancel", annule);
  }
  const tuilesDe = (mid: string, a: number, b: number, w: number, h: number) => {
    const pel = pellicules.get(mid), n = Math.max(1, Math.round(w / Math.max(30, h * 0.56)));
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 flex" style={{ height: h }}>
        {Array.from({ length: n }, (_, i) => {
          const s0 = a + ((i + 0.5) / n) * (b - a), img = pel?.images.length ? pel.images[Math.min(pel.images.length - 1, Math.floor(s0 / pel.pas))] : "";
          return img ? <img key={i} src={img} alt="" draggable={false} className="h-full min-w-0 flex-1 object-cover" /> : <span key={i} className="h-full flex-1 bg-white/5" />;
        })}
      </div>
    );
  };
  const poignees = (x: Incrust | PisteSon, genre: "incrust" | "son") => (
    <>
      <span onPointerDown={(e) => saisirObjet(e, x, genre, "a")} className="absolute left-0 top-0 z-10 flex h-full w-4 cursor-ew-resize items-center justify-center bg-white/90" aria-label="Rogner le début"><span className="h-4 w-[3px] rounded bg-violet" /></span>
      <span onPointerDown={(e) => saisirObjet(e, x, genre, "b")} className="absolute right-0 top-0 z-10 flex h-full w-4 cursor-ew-resize items-center justify-center bg-white/90" aria-label="Rogner la fin"><span className="h-4 w-[3px] rounded bg-violet" /></span>
    </>
  );
  const lignesIncrust = lignesSans(p.incrustations), lignesSons = lignesSans(p.sons);

  // graduations adaptées au zoom
  const pasGrad = [0.5, 1, 2, 5, 10, 15, 30, 60, 120].find((s) => px(s) >= 64) || 300;
  const grads: number[] = []; for (let s = 0; s <= Math.max(total, finObjets) + 1e-6; s += pasGrad) grads.push(+s.toFixed(3));
  const pistes = [...calques.filter((c) => c.type !== "flash")].sort((a, b) => ordreCalques.indexOf(a.type) - ordreCalques.indexOf(b.type));
  const flashs = calques.filter((c) => c.type === "flash");
  const tete = <div className="pointer-events-none absolute top-0 bottom-0 z-20 w-[2px] bg-white shadow-[0_0_6px_rgba(0,0,0,.8)]" style={{ left: LABEL + px(t) - 1 }} />;
  const visible = (c: Calque) => p.setCalques((l) => l.map((x) => (x.id === c.id ? { ...x, visible: !x.visible } : x)));

  // (une fonction, pas un composant : les éléments restent les mêmes pendant qu'on les glisse)
  const ligne = (cle: string, nom: string, couleur: string, h: number, children: React.ReactNode, c?: Calque) => (
    <div key={cle} className="relative flex" style={{ height: h }}>
      <div className="sticky left-0 z-10 flex shrink-0 items-center gap-1.5 border-r border-white/10 bg-[#100a1e] px-2 text-[11px] font-medium text-ink" style={{ width: LABEL }}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: couleur }} />
        <span className={`truncate ${c && !c.visible ? "opacity-40 line-through" : ""}`}>{nom}</span>
        {c && <button type="button" onClick={() => visible(c)} className="ml-auto text-ink-soft/70 hover:text-ink" aria-label={c.visible ? "Masquer" : "Afficher"} title={c.visible ? "Masquer" : "Afficher"}><Icone nom={c.visible ? "oeil" : "fermer"} className="h-3.5 w-3.5" /></button>}
      </div>
      <div className="relative flex-1 border-b border-white/[0.04]" onPointerDown={promener}>{children}</div>
    </div>
  );

  return (
    <div ref={defile} className="relative h-full overflow-auto overscroll-contain select-none [scrollbar-width:thin]" style={{ touchAction: "pan-x pan-y" }}>
      <div className="relative" style={{ width: LABEL + largeur, minWidth: "100%" }}>
        {/* règle */}
        <div className="sticky top-0 z-20 flex h-7 bg-[#0c0717]">
          <div className="sticky left-0 z-10 shrink-0 border-r border-white/10 bg-[#0c0717]" style={{ width: LABEL }} />
          <div data-regle className="relative flex-1 cursor-pointer border-b border-white/10" onPointerDown={promener} style={{ touchAction: "none" }}>
            {grads.map((g) => <span key={g} className="absolute top-0 h-full border-l border-white/15 pl-1 text-[10px] leading-7 text-ink-soft/70 tabular-nums" style={{ left: px(g) }}>{fmtRegle(g)}</span>)}
            <span className="absolute -top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[9px] border-x-transparent border-t-white" style={{ left: px(t) }} />
          </div>
        </div>

        {/* éléments */}
        {pistes.map((c) => ligne(c.id, c.type === "texte" && c.texte ? c.texte : NOMS[c.type], COULEURS[c.type], 30, c.type === "soustitres"
              ? sousTitres.map((s) => {
                const d = monteDepuisSource(morceaux, s.debut); if (d == null) return null;
                const w = Math.max(4, px(s.fin - s.debut));
                return <span key={s.id} onPointerDown={(e) => { e.stopPropagation(); setSel({ type: "calque", id: c.id }); p.onSeek(d); }} className="absolute top-1 bottom-1 truncate rounded-md px-1.5 text-[10px] leading-[22px] font-semibold text-black/80" style={{ left: px(d), width: w, background: COULEURS.soustitres + (c.visible ? "cc" : "44") }} title={s.texte}>{s.texte}</span>;
              })
              : (
                <div onPointerDown={(e) => saisirCalque(e, c, "bouger")} className={`absolute top-1 bottom-1 cursor-grab rounded-md ${sel?.type === "calque" && sel.id === c.id ? "ring-2 ring-white touch-none" : ""}`}
                  style={{ left: px(c.debut), width: Math.max(10, px(c.fin - c.debut)), background: COULEURS[c.type] + (c.visible ? "d0" : "40") }}>
                  <span onPointerDown={(e) => saisirCalque(e, c, "debut")} className="absolute -left-1 top-0 h-full w-4 cursor-ew-resize"><span className="absolute left-1 top-1 bottom-1 w-1.5 rounded bg-black/40" /></span>
                  <span className="pointer-events-none block truncate px-3 text-[11px] font-semibold leading-[22px] text-black/80">{c.texte || NOMS[c.type]}</span>
                  <span onPointerDown={(e) => saisirCalque(e, c, "fin")} className="absolute -right-1 top-0 h-full w-4 cursor-ew-resize"><span className="absolute right-1 top-1 bottom-1 w-1.5 rounded bg-black/40" /></span>
                </div>
              ), c))}
        {ligne("flashs", `⚡ Flashs (${flashs.length})`, "#ffffff", 30, <>
          {flashs.map((f) => (
            <span key={f.id} onPointerDown={(e) => saisirCalque(e, f, "bouger")} title="Flash de kill"
              className={`absolute top-[6px] h-[18px] w-[18px] -translate-x-1/2 rotate-45 cursor-grab rounded-sm border-2 ${sel?.type === "calque" && sel.id === f.id ? "border-rose-300 bg-white touch-none" : "border-white/70 bg-white/60"}`} style={{ left: px(f.debut) }} />
          ))}
        </>)}

        {/* incrustations */}
        {lignesIncrust.map((l, i) => ligne("inc" + i, `🖼️ Incrustation${lignesIncrust.length > 1 ? " " + (i + 1) : ""}`, "#22d3ee", 46, <>
          {l.map((x) => {
            const w = Math.max(10, px(duree(x))), choisi = sel?.type === "incrust" && sel.id === x.id, md = mediaParId.get(x.media);
            return (
              <div key={x.id} onPointerDown={(e) => saisirObjet(e, x, "incrust", "bouger")} title={md?.nom}
                className={`absolute top-1 bottom-1 cursor-grab overflow-hidden rounded-md border-2 bg-cyan-900/60 ${choisi ? "z-10 touch-none border-white" : "border-cyan-300/60"}`} style={{ left: px(x.debut), width: w }}>
                {tuilesDe(x.media, x.a, x.b, w, 34)}
                <span className="pointer-events-none absolute left-1 top-0.5 max-w-[80%] truncate rounded bg-black/60 px-1 text-[9px] text-white">{md?.nom || "Média"}</span>
                {choisi && poignees(x, "incrust")}
              </div>
            );
          })}
        </>))}

        {/* piste vidéo principale */}
        {ligne("video", "🎞️ Vidéo", "#7b38ff", 84, <>
          {morceaux.map((m, k) => {
            const w = Math.max(6, px(duree(m))), choisi = sel?.type === "morceau" && sel.id === m.id, mid = mediaDe(m), photo = mediaParId.get(mid)?.type === "image";
            return (
              <div key={m.id} onPointerDown={(e) => saisirMorceau(e, m, k, "corps")}
                className={`absolute top-1 bottom-1 overflow-hidden rounded-lg border-2 bg-[#2a1555] ${choisi ? "border-white z-10 touch-none" : photo ? "border-amber-300/60" : "border-violet/50"} ${drop?.id === m.id ? "opacity-50" : ""} ${outil === "lame" ? "cursor-crosshair" : "cursor-grab"}`}
                style={{ left: px(deb[k]) + 1, width: w - 2 }}>
                {tuilesDe(mid, m.a, m.b, w, 52)}
                {!photo && <Onde onde={m.muet ? null : ondes.get(mid) || null} a={m.a} b={m.b} w={w - 6} />}
                <span className="pointer-events-none absolute left-1.5 top-1 rounded bg-black/60 px-1 text-[9px] text-white tabular-nums">{photo ? "📷 " : ""}{duree(m).toFixed(1)} s{vitesse(m) !== 1 ? ` · ×${+vitesse(m).toFixed(2)}` : ""}{m.muet ? " · 🔇" : ""}</span>
                {choisi && (
                  <>
                    <span onPointerDown={(e) => saisirMorceau(e, m, k, "a")} className="absolute left-0 top-0 h-full w-5 cursor-ew-resize bg-white/90 flex items-center justify-center" aria-label="Rogner le début"><span className="h-6 w-[3px] rounded bg-violet" /></span>
                    <span onPointerDown={(e) => saisirMorceau(e, m, k, "b")} className="absolute right-0 top-0 h-full w-5 cursor-ew-resize bg-white/90 flex items-center justify-center" aria-label="Rogner la fin"><span className="h-6 w-[3px] rounded bg-violet" /></span>
                  </>
                )}
              </div>
            );
          })}
          {drop && <span className="pointer-events-none absolute top-0 bottom-0 z-30 w-1 -translate-x-1/2 rounded bg-lilac shadow-glow" style={{ left: drop.x }} />}
        </>)}

        {/* sons et musiques */}
        {lignesSons.map((l, i) => ligne("son" + i, `🎵 Son${lignesSons.length > 1 ? " " + (i + 1) : ""}`, "#34d399", 40, <>
          {l.map((x) => {
            const w = Math.max(10, px(duree(x))), choisi = sel?.type === "son" && sel.id === x.id, md = mediaParId.get(x.media);
            return (
              <div key={x.id} onPointerDown={(e) => saisirObjet(e, x, "son", "bouger")} title={md?.nom}
                className={`absolute top-1 bottom-1 cursor-grab overflow-hidden rounded-md border-2 bg-emerald-900/60 ${choisi ? "z-10 touch-none border-white" : "border-emerald-300/50"}`} style={{ left: px(x.debut), width: w }}>
                <Onde onde={ondes.get(x.media) || null} a={x.a} b={x.b} w={w - 6} couleur="rgba(167,243,208,.85)" />
                <span className="pointer-events-none absolute left-1 top-0.5 max-w-[85%] truncate text-[9px] font-medium text-emerald-50">{md?.nom || "Son"}{x.vol !== 1 ? ` · ${Math.round(x.vol * 100)} %` : ""}</span>
                {choisi && poignees(x, "son")}
              </div>
            );
          })}
        </>))}
        {tete}
      </div>
    </div>
  );
}

function Onde({ onde, a, b, w, couleur = "rgba(205,190,255,.9)" }: { onde: { cretes: Float32Array; parSeconde: number } | null; a: number; b: number; w: number; couleur?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W2 = Math.max(1, Math.min(2400, Math.round(w))), h = 22; cv.width = W2; cv.height = h;
    const g = cv.getContext("2d")!; g.clearRect(0, 0, W2, h);
    if (!onde) return;
    g.fillStyle = couleur;
    for (let x = 0; x < W2; x++) {
      const s = a + (x / W2) * (b - a), v = onde.cretes[Math.min(onde.cretes.length - 1, Math.floor(s * onde.parSeconde))] || 0, hh = Math.max(1, v * (h - 2));
      g.fillRect(x, (h - hh) / 2, 1, hh);
    }
  }, [onde, a, b, w, couleur]);
  return <canvas ref={ref} className="pointer-events-none absolute bottom-0.5 left-0 right-0 h-[22px] w-full" aria-hidden />;
}
