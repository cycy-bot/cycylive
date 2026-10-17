"use client";

// ============================================================
// STUDIO MINIATURES YOUTUBE — charte Cycylive (lib/miniature.ts)
// ============================================================
// Tu déposes une capture du jeu (1920 × 1080 de ta VOD) et une capture de
// ta webcam (ou une photo détourée en PNG), tu tapes 2 lignes de titre,
// tu choisis la série : la miniature 1280 × 720 se télécharge en PNG.
// Tout reste sur ton appareil (rien n'est envoyé sur internet).

import { useEffect, useRef, useState } from "react";
import { Poppins } from "next/font/google";
import { dessinerMiniature, PARAMS_DEFAUT, SERIES, type ParamsMiniature, type Recadrage, type Serie } from "@/lib/miniature";

const poppins = Poppins({ subsets: ["latin"], weight: ["800"], display: "swap" });
const CLE = "cycylive-studio-miniatures";

const champ = "rounded-xl bg-void/60 border border-violet/25 px-3 py-2 text-sm text-ink focus:outline-none focus:border-violet-light min-w-0";

function lireImage(f: File): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ko(new Error("Image illisible"));
    img.src = url;
  });
}

function Curseur({ label, valeur, min, max, pas, onChange }: { label: string; valeur: number; min: number; max: number; pas: number; onChange: (v: number) => void }) {
  return (
    <label className="grid gap-1 text-xs text-ink-soft">
      <span className="flex justify-between">
        {label}
        <span className="tabular-nums text-ink-soft/70">{Math.round(valeur * 100) / 100}</span>
      </span>
      <input type="range" min={min} max={max} step={pas} value={valeur} onChange={(e) => onChange(Number(e.target.value))} className="accent-violet-light" />
    </label>
  );
}

function Recadreur({ titre, r, onChange }: { titre: string; r: Recadrage; onChange: (r: Recadrage) => void }) {
  return (
    <div className="grid gap-2 rounded-xl border border-violet/15 p-3">
      <p className="text-xs font-semibold text-ink">{titre}</p>
      <Curseur label="Zoom" valeur={r.zoom} min={1} max={3} pas={0.05} onChange={(zoom) => onChange({ ...r, zoom })} />
      <Curseur label="Gauche ↔ droite" valeur={r.x} min={-1} max={1} pas={0.02} onChange={(x) => onChange({ ...r, x })} />
      <Curseur label="Haut ↕ bas" valeur={r.y} min={-1} max={1} pas={0.02} onChange={(y) => onChange({ ...r, y })} />
    </div>
  );
}

export default function StudioMiniatures() {
  const toile = useRef<HTMLCanvasElement | null>(null);
  const [p, setP] = useState<ParamsMiniature>(PARAMS_DEFAUT);
  const [fond, setFond] = useState<HTMLImageElement | null>(null);
  const [visage, setVisage] = useState<HTMLImageElement | null>(null);
  const [police, setPolice] = useState(false);
  const maj = (x: Partial<ParamsMiniature>) => setP((v) => ({ ...v, ...x }));

  // Derniers réglages (sans les images)
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(CLE) || "null");
      if (s) setP((v) => ({ ...v, ...s }));
    } catch {
      /* rien */
    }
    const famille = poppins.style.fontFamily;
    document.fonts.load(`800 100px ${famille}`).finally(() => setPolice(true));
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(p));
    } catch {
      /* rien */
    }
  }, [p]);

  useEffect(() => {
    const c = toile.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const famille = poppins.style.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
    dessinerMiniature(ctx, { ...p, police: famille }, { fond, visage });
  }, [p, fond, visage, police]);

  const telecharger = () => {
    toile.current?.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      const nom = [p.ligne1, p.ligne2].join(" ").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "miniature";
      a.href = URL.createObjectURL(b);
      a.download = "miniature-" + nom + ".png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  };

  const fichier = (set: (i: HTMLImageElement | null) => void) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) set(await lireImage(f).catch(() => null));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] items-start">
      <div className="grid gap-3">
        <canvas ref={toile} width={1280} height={720} className="w-full h-auto rounded-2xl border border-violet/20 bg-void" aria-label="Aperçu de la miniature" />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={telecharger} className="rounded-full px-6 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow transition-all">
            Télécharger la miniature (1280 × 720)
          </button>
          <p className="text-xs text-ink-soft/70 max-w-md">
            Astuce : regarde l&apos;aperçu en tout petit (comme sur YouTube) : si le titre se lit encore, c&apos;est gagné. 2 à 4 mots maximum.
          </p>
        </div>
        <div className="rounded-2xl border border-violet/15 bg-card/50 p-4 text-sm text-ink-soft">
          <p className="font-semibold text-ink mb-1">La charte en 4 règles</p>
          <ul className="list-disc list-inside space-y-1">
            <li>En fond, une <strong className="text-ink">vraie image de ta partie</strong> (mets ta VOD en pause au moment fort et fais une capture), jamais un décor dessiné.</li>
            <li>Ta <strong className="text-ink">vraie réaction</strong> : la capture de ta webcam au même moment.</li>
            <li>Un titre court qui donne envie de cliquer, la 2ᵉ ligne dans la couleur de la série.</li>
            <li>Toujours le même badge de série et le numéro au même endroit : on reconnaît ta chaîne d&apos;un coup d&apos;œil.</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-3 rounded-2xl border border-violet/20 bg-card/60 p-4">
          <label className="grid gap-1 text-sm text-ink-soft">
            Capture du jeu (fond)
            <input type="file" accept="image/*" onChange={fichier(setFond)} className="text-xs" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            Capture de ta webcam (ou photo détourée PNG)
            <input type="file" accept="image/*" onChange={fichier(setVisage)} className="text-xs" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select value={p.modeVisage} onChange={(e) => maj({ modeVisage: e.target.value as ParamsMiniature["modeVisage"] })} className={champ} aria-label="Affichage de ta photo">
              <option value="cadre">Cadre webcam</option>
              <option value="detoure">Photo détourée</option>
              <option value="aucun">Sans photo</option>
            </select>
            <select value={p.cote} onChange={(e) => maj({ cote: e.target.value as ParamsMiniature["cote"] })} className={champ} aria-label="Côté de ta photo">
              <option value="droite">Photo à droite</option>
              <option value="gauche">Photo à gauche</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-violet/20 bg-card/60 p-4">
          <div className="grid grid-cols-2 gap-2">
            <select value={p.serie} onChange={(e) => maj({ serie: e.target.value as Serie })} className={champ} aria-label="Série">
              {(Object.keys(SERIES) as Serie[]).map((k) => (
                <option key={k} value={k}>
                  {SERIES[k].nom}
                </option>
              ))}
            </select>
            <input value={p.numero} onChange={(e) => maj({ numero: e.target.value })} placeholder="Numéro (ex. 4)" className={champ} maxLength={3} />
          </div>
          <input value={p.badge} onChange={(e) => maj({ badge: e.target.value })} placeholder={"Badge (par défaut : " + SERIES[p.serie].badge + ")"} className={champ} maxLength={24} />
          <input value={p.ligne1} onChange={(e) => maj({ ligne1: e.target.value })} placeholder="Ligne 1 (blanche)" className={champ} maxLength={24} />
          <input value={p.ligne2} onChange={(e) => maj({ ligne2: e.target.value })} placeholder="Ligne 2 (en couleur)" className={champ} maxLength={24} />
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={p.logo} onChange={(e) => maj({ logo: e.target.checked })} /> Logo « ✦ CYCYLIVE » en bas
          </label>
        </div>

        <div className="grid gap-3 rounded-2xl border border-violet/20 bg-card/60 p-4">
          <Curseur label="Assombrir le fond (lisibilité)" valeur={p.assombrir} min={0} max={1} pas={0.05} onChange={(assombrir) => maj({ assombrir })} />
          <Curseur label="Flou du fond" valeur={p.flou} min={0} max={24} pas={1} onChange={(flou) => maj({ flou })} />
          <Curseur label="Taille de ta photo" valeur={p.tailleVisage} min={0.6} max={1.4} pas={0.05} onChange={(tailleVisage) => maj({ tailleVisage })} />
          <Recadreur titre="Cadrage du fond" r={p.fond} onChange={(fond) => maj({ fond })} />
          <Recadreur titre="Cadrage de ta photo" r={p.visage} onChange={(visage) => maj({ visage })} />
          <button type="button" onClick={() => setP({ ...PARAMS_DEFAUT, serie: p.serie })} className="text-xs text-ink-soft underline justify-self-start">
            Remettre les réglages par défaut
          </button>
        </div>
      </div>
    </div>
  );
}
