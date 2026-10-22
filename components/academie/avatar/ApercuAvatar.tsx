// Zone d'aperçu de l'avatar : cadrage automatique à partir des
// limites réelles des calques, bascule Portrait / Plein pied, zoom
// (boutons, molette, pincement) et déplacement quand on est agrandi.
// Le cadrage automatique reste toujours la position de référence.

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as PE } from "react";
import type { CategorieCalque, VueAvatar } from "@/data/academie/avatar/types";
import {
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_NEUTRE,
  borner,
  composer,
  transformation,
  zoneCadrage,
  zoomerAutour,
  centreCadre,
  type Cadre,
  type EtatZoom,
  type SelectionComplete,
} from "@/lib/academie/avatar/composition";
import { optionsParCalque, ordreCalques } from "@/data/academie/avatar/catalogue";
import AvatarCalques from "./AvatarCalques";
import IconeCreateur from "./Icones";

const LIBELLES_CALQUES: Record<CategorieCalque, string> = {
  visage: "visage",
  yeux: "yeux",
  sourcils: "sourcils",
  nez: "nez",
  bouche: "bouche",
  cheveux: "coiffure",
  tenue: "tenue",
};

/** Suit la taille d'un élément (ResizeObserver). */
function useTaille<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [taille, setTaille] = useState({ l: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setTaille((t) => (Math.abs(t.l - width) < 0.5 && Math.abs(t.h - height) < 0.5 ? t : { l: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, taille] as const;
}

/** Suit les calques chargés ou en erreur, réinitialisé quand l'image demandée change. */
function useEtatsCalques(cleSources: string) {
  const [etats, setEtats] = useState<Partial<Record<CategorieCalque, "pret" | "erreur">>>({});
  const onEtat = useCallback((cle: CategorieCalque, etat: "pret" | "erreur") => {
    setEtats((e) => (e[cle] === etat ? e : { ...e, [cle]: etat }));
  }, []);
  // Une nouvelle source remet "en erreur" à zéro (elle sera re-signalée si besoin).
  useEffect(() => {
    setEtats((e) => {
      const suivant = { ...e };
      for (const k of Object.keys(suivant) as CategorieCalque[]) if (suivant[k] === "erreur") delete suivant[k];
      return suivant;
    });
  }, [cleSources]);
  return [etats, onEtat] as const;
}

type Props = {
  selection: SelectionComplete;
  vue: VueAvatar;
  onVue: (v: VueAvatar) => void;
  pleinEcran: boolean;
  onPleinEcran: (v: boolean) => void;
  titre: string;
};

export default function ApercuAvatar({ selection, vue, onVue, pleinEcran, onPleinEcran, titre }: Props) {
  const [ref, taille] = useTaille<HTMLDivElement>();
  const [zoom, setZoom] = useState<EtatZoom>(ZOOM_NEUTRE);
  const [geste, setGeste] = useState(false);
  const calques = useMemo(() => composer(selection, vue), [selection, vue]);
  const cleSources = calques.map((c) => c.src).join("|");
  const [etats, onEtat] = useEtatsCalques(cleSources);

  const enErreur = useMemo(
    () => new Set((Object.keys(etats) as CategorieCalque[]).filter((k) => etats[k] === "erreur")),
    [etats]
  );
  const zone = useMemo(() => zoneCadrage(calques, vue, enErreur), [calques, vue, enErreur]);

  const cadre: Cadre = useMemo(
    () => ({
      largeur: taille.l,
      hauteur: taille.h,
      reserve: pleinEcran ? { haut: 72, bas: 84, gauche: 16, droite: 16 } : { haut: 12, bas: 64, gauche: 12, droite: 12 },
    }),
    [taille, pleinEcran]
  );

  // Le cadrage automatique redevient la référence quand on change de vue.
  useEffect(() => setZoom(ZOOM_NEUTRE), [vue]);
  // Nouvelle zone ou nouvelle taille : on garde le zoom mais on reste dans les bornes.
  useEffect(() => setZoom((z) => borner(z, zone, cadre)), [zone, cadre]);

  const t = taille.l > 0 ? transformation(zone, cadre, zoom) : null;
  const chargement = !calques.some((c) => etats[c.cle] === "pret");
  const manquants = calques.filter((c) => etats[c.cle] === "erreur");
  const agrandi = zoom.zoom > 1.001;

  // ---------- Zoom ----------

  const zoomerVers = useCallback(
    (cible: number, point?: { x: number; y: number }) => {
      setZoom((z) => zoomerAutour(z, cible, point ?? centreCadre(cadre), zone, cadre));
    },
    [cadre, zone]
  );
  const recentrer = useCallback(() => setZoom(ZOOM_NEUTRE), []);

  // Molette : uniquement quand le curseur survole l'aperçu. L'écouteur
  // est non passif pour ne pas faire défiler le panneau en même temps.
  const etatsRef = useRef({ zoom, zone, cadre });
  etatsRef.current = { zoom, zone, cadre };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const surMolette = (e: WheelEvent) => {
      if (e.ctrlKey && Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const { zoom: z, zone: zn, cadre: cd } = etatsRef.current;
      const facteur = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0018));
      setZoom(zoomerAutour(z, z.zoom * facteur, { x: e.clientX - r.left, y: e.clientY - r.top }, zn, cd));
    };
    el.addEventListener("wheel", surMolette, { passive: false });
    return () => el.removeEventListener("wheel", surMolette);
  }, [ref]);

  // ---------- Déplacement et pincement ----------

  const pointeurs = useRef(new Map<number, { x: number; y: number }>());
  const depart = useRef<{ zoom: EtatZoom; distance: number; milieu: { x: number; y: number } } | null>(null);

  const local = (e: PE) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const memoriserDepart = () => {
    const p = [...pointeurs.current.values()];
    const milieu = p.length > 1 ? { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 } : p[0];
    const distance = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
    depart.current = { zoom: etatsRef.current.zoom, distance, milieu };
  };

  const surPointerDown = (e: PE<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    pointeurs.current.set(e.pointerId, local(e));
    e.currentTarget.setPointerCapture(e.pointerId);
    memoriserDepart();
    setGeste(true);
  };
  const surPointerMove = (e: PE<HTMLDivElement>) => {
    if (!pointeurs.current.has(e.pointerId) || !depart.current) return;
    pointeurs.current.set(e.pointerId, local(e));
    const p = [...pointeurs.current.values()];
    const d = depart.current;
    const { zone: zn, cadre: cd } = etatsRef.current;
    if (p.length > 1 && d.distance > 0) {
      const milieu = { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 };
      const distance = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const zoome = zoomerAutour(d.zoom, d.zoom.zoom * (distance / d.distance), d.milieu, zn, cd);
      setZoom(borner({ ...zoome, px: zoome.px + milieu.x - d.milieu.x, py: zoome.py + milieu.y - d.milieu.y }, zn, cd));
    } else if (d.zoom.zoom > 1.001) {
      setZoom(borner({ ...d.zoom, px: d.zoom.px + p[0].x - d.milieu.x, py: d.zoom.py + p[0].y - d.milieu.y }, zn, cd));
    }
  };
  const surPointerUp = (e: PE<HTMLDivElement>) => {
    pointeurs.current.delete(e.pointerId);
    if (pointeurs.current.size) memoriserDepart();
    else {
      depart.current = null;
      setGeste(false);
    }
  };

  const surClavier = (e: React.KeyboardEvent) => {
    const pas = 40;
    const actions: Record<string, () => void> = {
      "+": () => zoomerVers(zoom.zoom * 1.25),
      "=": () => zoomerVers(zoom.zoom * 1.25),
      "-": () => zoomerVers(zoom.zoom / 1.25),
      "0": recentrer,
      ArrowLeft: () => setZoom((z) => borner({ ...z, px: z.px + pas }, zone, cadre)),
      ArrowRight: () => setZoom((z) => borner({ ...z, px: z.px - pas }, zone, cadre)),
      ArrowUp: () => setZoom((z) => borner({ ...z, py: z.py + pas }, zone, cadre)),
      ArrowDown: () => setZoom((z) => borner({ ...z, py: z.py - pas }, zone, cadre)),
    };
    const action = actions[e.key];
    if (action && !(e.target as HTMLElement).closest("button")) {
      e.preventDefault();
      action();
    }
  };

  // Échap quitte le plein écran.
  useEffect(() => {
    if (!pleinEcran) return;
    const surEchap = (e: KeyboardEvent) => e.key === "Escape" && onPleinEcran(false);
    window.addEventListener("keydown", surEchap);
    return () => window.removeEventListener("keydown", surEchap);
  }, [pleinEcran, onPleinEcran]);

  const resume = calques
    .filter((c) => c.cle !== "visage")
    .map((c) => `${LIBELLES_CALQUES[c.cle]} : ${c.label.toLowerCase()}`)
    .join(", ");

  return (
    <div
      ref={ref}
      className={`ada-apercu ${pleinEcran ? "ada-apercu--plein-ecran" : ""} ${agrandi ? "ada-apercu--agrandi" : ""} ${geste ? "ada-apercu--geste" : ""}`}
      data-vue={vue}
      role="group"
      aria-roledescription="aperçu"
      aria-label={`${titre} — vue ${vue === "portrait" ? "portrait" : "en pied"}. ${resume}`}
      tabIndex={0}
      onKeyDown={surClavier}
      onPointerDown={surPointerDown}
      onPointerMove={surPointerMove}
      onPointerUp={surPointerUp}
      onPointerCancel={surPointerUp}
      onDoubleClick={(e) => !(e.target as HTMLElement).closest("button") && (agrandi ? recentrer() : zoomerVers(2, local(e as unknown as PE)))}
    >
      <div className="ada-apercu-fond" aria-hidden />
      {t && <AvatarCalques calques={calques} transform={t} anime={!geste} onEtat={onEtat} />}

      {chargement && (
        <div className="ada-apercu-chargement" aria-live="polite">
          <span className="ada-anneau" aria-hidden />
          <span className="sr-only">Chargement de l&apos;avatar…</span>
        </div>
      )}

      {manquants.length > 0 && (
        <p className="ada-apercu-alerte" role="status">
          <IconeCreateur nom="attention" className="h-4 w-4 shrink-0" />
          Élément indisponible : {manquants.map((c) => LIBELLES_CALQUES[c.cle]).join(", ")}
        </p>
      )}

      {pleinEcran && (
        <button type="button" className="ada-bouton-rond ada-apercu-fermer" onClick={() => onPleinEcran(false)} aria-label="Revenir à la personnalisation">
          <IconeCreateur nom="quitterPleinEcran" />
        </button>
      )}

      <div className="ada-apercu-barre">
        <div className="ada-segment" role="group" aria-label="Vue de l'aperçu">
          {(["portrait", "pleinPied"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={vue === v} onClick={() => onVue(v)}>
              <IconeCreateur nom={v} className="h-4 w-4" />
              <span>{v === "portrait" ? "Portrait" : "Plein pied"}</span>
            </button>
          ))}
        </div>

        <div className="ada-zoom" role="group" aria-label="Zoom">
          <IconeCreateur nom="loupe" className="ada-zoom-loupe h-4 w-4" />
          <button type="button" onClick={() => zoomerVers(zoom.zoom / 1.3)} disabled={zoom.zoom <= ZOOM_MIN + 0.001} aria-label="Dézoomer">
            <IconeCreateur nom="moins" className="h-4 w-4" />
          </button>
          <span className="ada-zoom-valeur" aria-live="polite">{Math.round(zoom.zoom * 100)} %</span>
          <button type="button" onClick={() => zoomerVers(zoom.zoom * 1.3)} disabled={zoom.zoom >= ZOOM_MAX - 0.001} aria-label="Zoomer">
            <IconeCreateur nom="plus" className="h-4 w-4" />
          </button>
          <button type="button" onClick={recentrer} disabled={!agrandi && zoom.px === 0 && zoom.py === 0} aria-label="Recentrer (cadrage automatique)">
            <IconeCreateur nom="recentrer" className="h-4 w-4" />
          </button>
          {!pleinEcran && (
            <button type="button" onClick={() => onPleinEcran(true)} aria-label="Afficher l'aperçu en plein écran">
              <IconeCreateur nom="pleinEcran" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Portrait fixe (carte d'élève...) : même composition, sans commandes. */
export function PortraitAvatar({ selection, className, vue = "portrait" }: { selection: SelectionComplete; className?: string; vue?: VueAvatar }) {
  const [ref, taille] = useTaille<HTMLDivElement>();
  // Clé de contenu : la sélection est souvent recréée par le parent à chaque rendu.
  const cle = ordreCalques.map((c) => selection[c]).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calques = useMemo(() => composer(selection, vue), [cle, vue]);
  const [etats, onEtat] = useEtatsCalques(calques.map((c) => c.src).join("|"));
  const enErreur = useMemo(() => new Set((Object.keys(etats) as CategorieCalque[]).filter((k) => etats[k] === "erreur")), [etats]);
  const zone = useMemo(() => zoneCadrage(calques, vue, enErreur), [calques, vue, enErreur]);
  const cadre: Cadre = { largeur: taille.l, hauteur: taille.h, reserve: { haut: 0, bas: 0, gauche: 0, droite: 0 } };
  const t = taille.l > 0 ? transformation(zone, cadre, ZOOM_NEUTRE) : null;
  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`} aria-hidden>
      {t && <AvatarCalques calques={calques} transform={t} anime={false} onEtat={onEtat} />}
    </div>
  );
}

/** Précharge l'image d'une option (survol ou focus d'une vignette). */
export function prechargerOption(cat: CategorieCalque, id: string, racine: string) {
  const option = (optionsParCalque[cat] as { id: string; fichier: string }[]).find((o) => o.id === id);
  if (!option) return;
  const img = new Image();
  img.decoding = "async";
  img.src = racine + option.fichier;
}
