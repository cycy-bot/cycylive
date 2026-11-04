"use client";

// Timeline de l'habillage TikTok : une piste par calque (glisser pour déplacer, tirer les bords pour changer la durée),
// les flashs de kill en losanges, la tête de lecture à promener, et le panneau du calque choisi.
import { useRef } from "react";
import { ANIMS, COULEURS, NOMS, nouveauFlash, nouveauTexte, type Calque, type SousTitre } from "@/lib/habillageTikTok";

type Props = {
  duree: number; t: number; enLecture: boolean;
  calques: Calque[]; setCalques: (f: (c: Calque[]) => Calque[]) => void;
  sel: string; setSel: (id: string) => void;
  sousTitres: SousTitre[]; debutCoupe: number;
  onSeek: (t: number) => void; onLecture: () => void;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}.${String(Math.floor((s % 1) * 100)).padStart(2, "0")}`;
const IMAGE = 1 / 30;

export default function TimelineHabillage({ duree, t, enLecture, calques, setCalques, sel, setSel, sousTitres, debutCoupe, onSeek, onLecture }: Props) {
  const piste = useRef<HTMLDivElement>(null);
  const D = Math.max(0.5, duree);
  const pct = (x: number) => `${(Math.max(0, Math.min(D, x)) / D) * 100}%`;
  const tempsDepuis = (clientX: number) => { const r = piste.current!.getBoundingClientRect(); return Math.max(0, Math.min(D, ((clientX - r.left) / r.width) * D)); };
  const maj = (id: string, p: Partial<Calque>) => setCalques((l) => l.map((c) => (c.id === id ? { ...c, ...p } : c)));

  // glisser une barre : déplacer (milieu) ou changer le début / la fin (bords)
  function saisir(e: React.PointerEvent, c: Calque, mode: "bouger" | "debut" | "fin") {
    e.stopPropagation(); e.preventDefault(); setSel(c.id);
    const x0 = e.clientX, d0 = c.debut, f0 = c.fin, r = piste.current!.getBoundingClientRect();
    const cible = e.currentTarget as HTMLElement; cible.setPointerCapture(e.pointerId);
    const bouger = (ev: PointerEvent) => {
      const dt = ((ev.clientX - x0) / r.width) * D;
      if (mode === "bouger") { const len = f0 - d0; const nd = Math.max(0, Math.min(D - len, d0 + dt)); maj(c.id, { debut: +nd.toFixed(3), fin: +(nd + len).toFixed(3) }); if (c.type === "flash") onSeek(nd); }
      else if (mode === "debut") maj(c.id, { debut: +Math.max(0, Math.min(f0 - 0.2, d0 + dt)).toFixed(3) });
      else maj(c.id, { fin: +Math.min(D, Math.max(d0 + 0.2, f0 + dt)).toFixed(3) });
    };
    const lacher = () => { cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); };
    cible.addEventListener("pointermove", bouger); cible.addEventListener("pointerup", lacher);
  }
  function promener(e: React.PointerEvent) {
    onSeek(tempsDepuis(e.clientX));
    const cible = e.currentTarget as HTMLElement; cible.setPointerCapture(e.pointerId);
    const bouger = (ev: PointerEvent) => onSeek(tempsDepuis(ev.clientX));
    const lacher = () => { cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", lacher); };
    cible.addEventListener("pointermove", bouger); cible.addEventListener("pointerup", lacher);
  }

  const pistes = calques.filter((c) => c.type !== "flash");
  const flashs = calques.filter((c) => c.type === "flash").sort((a, b) => a.debut - b.debut);
  const choisi = calques.find((c) => c.id === sel);
  const pas = D > 90 ? 10 : D > 30 ? 5 : 1;
  const graduations = Array.from({ length: Math.floor(D / pas) + 1 }, (_, i) => i * pas);
  const champ = "rounded-lg bg-card border border-violet/20 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-violet/60";
  const btn = "rounded-full border border-violet/30 px-3 py-1.5 text-xs text-ink-soft hover:bg-violet/10 transition-all";
  const tete = <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-rose-300" style={{ left: pct(t) }} />;

  return (
    <div className="space-y-3">
      {/* commandes */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onLecture} className="rounded-full bg-violet px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-light">{enLecture ? "⏸ Pause" : "▶ Lecture"}</button>
        <button type="button" onClick={() => onSeek(Math.max(0, t - IMAGE))} className={btn} title="Image précédente">◀ 1 img</button>
        <button type="button" onClick={() => onSeek(Math.min(D, t + IMAGE))} className={btn} title="Image suivante">1 img ▶</button>
        <span className="font-mono text-sm text-ink tabular-nums">{fmt(t)} / {fmt(D)}</span>
        <span className="flex-1" />
        <button type="button" onClick={() => { const f = nouveauFlash(t); setCalques((l) => [...l, f]); setSel(f.id); }} className="rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">⚡ Flash de kill ici</button>
        <button type="button" onClick={() => { const c = nouveauTexte(t, D); setCalques((l) => [...l, c]); setSel(c.id); }} className={btn}>+ Texte ici</button>
      </div>

      {/* timeline */}
      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-x-2 gap-y-1 select-none text-xs">
        <span />
        <div className="relative h-6 cursor-pointer rounded bg-white/[0.04]" onPointerDown={promener} ref={piste}>
          {graduations.map((g) => <span key={g} className="absolute top-0 h-full border-l border-white/15 pl-1 text-[10px] text-ink-soft/70" style={{ left: pct(g) }}>{g}s</span>)}
          <div className="pointer-events-none absolute -top-1 h-8 w-0.5 bg-rose-300" style={{ left: pct(t) }}><span className="absolute -left-1.5 -top-1 h-3 w-3 rounded-full bg-rose-300" /></div>
        </div>
        {pistes.map((c) => (
          <PisteLigne key={c.id} c={c} sel={sel === c.id} onLabel={() => { setSel(c.id); onSeek(c.type === "soustitres" ? t : c.debut); }}>
            <div className="relative h-7 rounded bg-white/[0.03]" onPointerDown={promener}>
              {c.type === "soustitres"
                ? sousTitres.map((s) => <span key={s.id} className="absolute top-1 bottom-1 rounded-sm" style={{ left: pct(s.debut - debutCoupe), width: `calc(${pct(s.fin - debutCoupe)} - ${pct(s.debut - debutCoupe)})`, background: COULEURS.soustitres + (c.visible ? "aa" : "33") }} title={s.texte} />)
                : (
                  <div onPointerDown={(e) => saisir(e, c, "bouger")} className={`absolute top-0.5 bottom-0.5 cursor-grab rounded-md border ${sel === c.id ? "border-white" : "border-transparent"}`}
                    style={{ left: pct(c.debut), width: `calc(${pct(c.fin)} - ${pct(c.debut)})`, background: COULEURS[c.type] + (c.visible ? "bb" : "33") }}>
                    <span onPointerDown={(e) => saisir(e, c, "debut")} className="absolute left-0 top-0 h-full w-2 cursor-ew-resize rounded-l-md bg-black/30" />
                    <span className="pointer-events-none block truncate px-2.5 leading-6 text-[11px] font-semibold text-black/80">{c.texte || NOMS[c.type]}</span>
                    <span onPointerDown={(e) => saisir(e, c, "fin")} className="absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r-md bg-black/30" />
                  </div>
                )}
              {tete}
            </div>
          </PisteLigne>
        ))}
        <span className="flex items-center gap-1.5 truncate font-medium text-ink">⚡ Flashs <span className="text-ink-soft/70">({flashs.length})</span></span>
        <div className="relative h-7 rounded bg-white/[0.03]" onPointerDown={promener}>
          {flashs.map((f) => (
            <span key={f.id} onPointerDown={(e) => saisir(e, f, "bouger")} title={`Flash à ${fmt(f.debut)}`}
              className={`absolute top-1 h-5 w-5 -translate-x-1/2 rotate-45 cursor-grab rounded-sm border-2 ${sel === f.id ? "border-rose-300 bg-white" : "border-white/70 bg-white/60"}`} style={{ left: pct(f.debut) }} />
          ))}
          {tete}
        </div>
      </div>
      <p className="text-xs text-ink-soft/70">Clique sur la règle ou sur une piste pour te déplacer dans la vidéo · glisse une barre pour la décaler, tire ses bords pour changer sa durée · sur l’aperçu, attrape un élément pour le déplacer · « ⚡ Flash de kill ici » pose un flash pile à la tête de lecture (◀ 1 img ▶ pour viser l’image exacte).</p>

      {/* panneau du calque choisi */}
      {choisi && (
        <div className="rounded-xl border border-violet/20 bg-white/[0.03] p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: COULEURS[choisi.type] }} />
            <b className="text-sm text-ink">{NOMS[choisi.type]}</b>
            <label className="ml-auto flex items-center gap-1.5 text-xs text-ink-soft"><input type="checkbox" checked={choisi.visible} onChange={(e) => maj(choisi.id, { visible: e.target.checked })} className="accent-violet-500" /> Affiché</label>
            {(choisi.type === "flash" || choisi.type === "texte") && <button type="button" onClick={() => { setCalques((l) => l.filter((c) => c.id !== choisi.id)); setSel(""); }} className="text-xs text-red-300 underline">Supprimer</button>}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {choisi.type !== "soustitres" && (
              <label className="text-xs text-ink-soft">{choisi.type === "flash" ? "Moment du flash (s)" : "Apparaît à (s)"}
                <span className="flex gap-1"><input type="number" step={0.033} min={0} value={+choisi.debut.toFixed(3)} onChange={(e) => { const v = Math.max(0, +e.target.value), len = choisi.fin - choisi.debut; maj(choisi.id, choisi.type === "flash" ? { debut: v, fin: v + len } : { debut: Math.min(v, choisi.fin - 0.2) }); }} className={`${champ} w-full`} />
                  <button type="button" onClick={() => { const len = choisi.fin - choisi.debut; maj(choisi.id, choisi.type === "flash" ? { debut: t, fin: t + len } : { debut: Math.min(t, choisi.fin - 0.2) }); }} className={btn} title="Mettre à la tête de lecture">⌖</button></span>
              </label>
            )}
            {choisi.type !== "soustitres" && choisi.type !== "flash" && (
              <label className="text-xs text-ink-soft">Disparaît à (s)
                <span className="flex gap-1"><input type="number" step={0.1} value={+choisi.fin.toFixed(2)} onChange={(e) => maj(choisi.id, { fin: Math.max(choisi.debut + 0.2, Math.min(D, +e.target.value)) })} className={`${champ} w-full`} />
                  <button type="button" onClick={() => maj(choisi.id, { fin: Math.max(choisi.debut + 0.2, t) })} className={btn} title="Mettre à la tête de lecture">⌖</button></span>
              </label>
            )}
            {choisi.type !== "barre" && choisi.type !== "flash" && (
              <label className="text-xs text-ink-soft">Animation
                <select value={choisi.anim} onChange={(e) => maj(choisi.id, { anim: e.target.value as Calque["anim"] })} className={`${champ} w-full`}>{ANIMS.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}</select>
              </label>
            )}
            {!(choisi.type === "encart" && choisi.lie) && choisi.type !== "flash" && (
              <label className="text-xs text-ink-soft">Hauteur : {Math.round(choisi.y * 100)} %<input type="range" min={0.05} max={0.95} step={0.002} value={choisi.y} onChange={(e) => maj(choisi.id, { y: +e.target.value })} className="w-full accent-violet-500" /></label>
            )}
            {choisi.type === "flash" && (
              <>
                <label className="text-xs text-ink-soft">Durée : {(choisi.fin - choisi.debut).toFixed(2)} s<input type="range" min={0.1} max={0.6} step={0.05} value={choisi.fin - choisi.debut} onChange={(e) => maj(choisi.id, { fin: choisi.debut + +e.target.value })} className="w-full accent-violet-500" /></label>
                <label className="text-xs text-ink-soft">Intensité : {Math.round(choisi.intensite * 100)} %<input type="range" min={0.15} max={1} step={0.05} value={choisi.intensite} onChange={(e) => maj(choisi.id, { intensite: +e.target.value })} className="w-full accent-violet-500" /></label>
                <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={choisi.zoom} onChange={(e) => maj(choisi.id, { zoom: e.target.checked })} className="accent-violet-500" /> Petit zoom sur le jeu</label>
                <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={choisi.onde} onChange={(e) => maj(choisi.id, { onde: e.target.checked })} className="accent-violet-500" /> Onde au viseur (déplace-la sur l’aperçu)</label>
              </>
            )}
          </div>
          {(choisi.type === "carte" || choisi.type === "encart" || choisi.type === "etiquette" || choisi.type === "texte") && (
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={choisi.texte} onChange={(e) => maj(choisi.id, { texte: e.target.value })} maxLength={60} className={champ} placeholder={choisi.type === "carte" ? "Titre (ex. LE DUO DE CHOC)" : "Texte"} />
              {choisi.type === "carte" && <input value={choisi.sous} onChange={(e) => maj(choisi.id, { sous: e.target.value })} maxLength={70} className={champ} placeholder="Sous-titre de la carte" />}
              {choisi.type === "encart" && <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={choisi.lie} onChange={(e) => maj(choisi.id, { lie: e.target.checked })} className="accent-violet-500" /> Collé à la séparation caméra / jeu (suit la barre)</label>}
            </div>
          )}
          {choisi.type === "barre" && <p className="text-xs text-ink-soft/70">La barre marque la séparation caméra / jeu : déplace-la sur l’aperçu (ou avec la hauteur) et l’encart la suit.</p>}
          {choisi.type === "soustitres" && <p className="text-xs text-ink-soft/70">Les temps des sous-titres se règlent dans la liste « Sous-titres » ci-dessous ; ici, leur hauteur et leur animation.</p>}
        </div>
      )}
    </div>
  );
}

function PisteLigne({ c, sel, onLabel, children }: { c: Calque; sel: boolean; onLabel: () => void; children: React.ReactNode }) {
  return (
    <>
      <button type="button" onClick={onLabel} className={`flex items-center gap-1.5 truncate rounded px-1 text-left font-medium ${sel ? "bg-violet/25 text-white" : "text-ink"} ${c.visible ? "" : "opacity-50"}`}>
        <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: COULEURS[c.type] }} />{c.texte && c.type === "texte" ? c.texte : NOMS[c.type]}
      </button>
      {children}
    </>
  );
}
