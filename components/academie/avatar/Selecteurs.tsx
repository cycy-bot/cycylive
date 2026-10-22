// Sélecteurs du créateur : grille de vignettes et pastilles de
// couleur. Ce sont des groupes de boutons radio accessibles :
// Tab entre dans le groupe, les flèches changent la sélection.

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Couleur, Morphologie } from "@/data/academie/avatar/types";
import { libellesMorphologie } from "@/data/academie/avatar/catalogue";
import IconeCreateur from "./Icones";

/** Navigation au clavier dans un groupe radio (flèches, Début, Fin). */
function useNavigationRadio(nombre: number, indexActif: number, choisir: (i: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const surClavier = (e: KeyboardEvent, i: number) => {
    const cibles: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowDown: i + 1,
      ArrowLeft: i - 1,
      ArrowUp: i - 1,
      Home: 0,
      End: nombre - 1,
    };
    if (!(e.key in cibles)) return;
    e.preventDefault();
    const j = (cibles[e.key] + nombre) % nombre;
    choisir(j);
    refs.current[j]?.focus();
  };
  const tabIndex = (i: number) => (i === (indexActif >= 0 ? indexActif : 0) ? 0 : -1);
  return { refs, surClavier, tabIndex };
}

export type OptionVignette = { id: string; label: string; vignette: string; morphologie?: Morphologie };

export function GrilleVignettes({
  label,
  options,
  valeur,
  onChoisir,
  onSurvol,
  format = "carre",
}: {
  label: string;
  options: OptionVignette[];
  valeur: string;
  onChoisir: (id: string) => void;
  onSurvol?: (id: string) => void;
  format?: "carre" | "portrait" | "large";
}) {
  const morphos = Array.from(new Set(options.map((o) => o.morphologie).filter(Boolean))) as Morphologie[];
  const [filtre, setFiltre] = useState<Morphologie | "tous">("tous");
  const visibles = filtre === "tous" ? options : options.filter((o) => !o.morphologie || o.morphologie === filtre || o.id === valeur);
  const actif = visibles.findIndex((o) => o.id === valeur);
  const nav = useNavigationRadio(visibles.length, actif, (i) => onChoisir(visibles[i].id));

  return (
    <div>
      {morphos.length > 1 && (
        <div className="ada-filtres" role="group" aria-label={`Filtrer : ${label}`}>
          {(["tous", ...morphos] as const).map((m) => (
            <button key={m} type="button" aria-pressed={filtre === m} onClick={() => setFiltre(m)}>
              {m === "tous" ? "Tous" : libellesMorphologie[m]}
            </button>
          ))}
        </div>
      )}
      <div role="radiogroup" aria-label={label} className={`ada-grille ada-grille--${format}`}>
        {visibles.map((o, i) => {
          const choisi = o.id === valeur;
          return (
            <button
              key={o.id}
              ref={(el) => {
                nav.refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={choisi}
              tabIndex={nav.tabIndex(i)}
              onClick={() => onChoisir(o.id)}
              onKeyDown={(e) => nav.surClavier(e, i)}
              onPointerEnter={() => onSurvol?.(o.id)}
              onFocus={() => onSurvol?.(o.id)}
              className="ada-vignette"
            >
              <span className="ada-vignette-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={o.vignette}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onError={(e) => e.currentTarget.parentElement?.classList.add("ada-vignette-image--absente")}
                />
                {choisi && (
                  <span className="ada-vignette-coche" aria-hidden>
                    <IconeCreateur nom="coche" className="h-3 w-3" />
                  </span>
                )}
              </span>
              <span className="ada-vignette-nom">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PastillesCouleur({
  label,
  couleurs,
  valeur,
  onChoisir,
  note,
  extra,
}: {
  label: string;
  couleurs: Couleur[];
  valeur: string | undefined;
  onChoisir: (valeur: string) => void;
  /** Remarque affichée sous les pastilles. */
  note?: string;
  /** Pastille supplémentaire en tête (ex. « comme les cheveux »). */
  extra?: { label: string; actif: boolean; onChoisir: () => void; apercu: string };
}) {
  const actif = couleurs.findIndex((c) => c.valeur === valeur);
  const decalage = extra ? 1 : 0;
  const total = couleurs.length + decalage;
  const indexActif = extra?.actif ? 0 : actif + decalage;
  const nav = useNavigationRadio(total, indexActif, (i) => (extra && i === 0 ? extra.onChoisir() : onChoisir(couleurs[i - decalage].valeur)));
  const nomActif = extra?.actif ? extra.label : couleurs[actif]?.label;

  return (
    <div>
      <div className="ada-sous-titre">
        <span>{label}</span>
        {nomActif && <span className="ada-sous-titre-valeur">{nomActif}</span>}
      </div>
      <div role="radiogroup" aria-label={label} className="ada-pastilles">
        {extra && (
          <button
            ref={(el) => {
              nav.refs.current[0] = el;
            }}
            type="button"
            role="radio"
            aria-checked={extra.actif}
            aria-label={extra.label}
            title={extra.label}
            tabIndex={nav.tabIndex(0)}
            onClick={extra.onChoisir}
            onKeyDown={(e) => nav.surClavier(e, 0)}
            className="ada-pastille-couleur ada-pastille-couleur--lien"
            style={{ ["--teinte" as string]: extra.apercu }}
          >
            <span aria-hidden>=</span>
          </button>
        )}
        {couleurs.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              nav.refs.current[i + decalage] = el;
            }}
            type="button"
            role="radio"
            aria-checked={!extra?.actif && c.valeur === valeur}
            aria-label={c.label}
            title={c.label}
            tabIndex={nav.tabIndex(i + decalage)}
            onClick={() => onChoisir(c.valeur)}
            onKeyDown={(e) => nav.surClavier(e, i + decalage)}
            className="ada-pastille-couleur"
            style={{ ["--teinte" as string]: c.valeur }}
          />
        ))}
      </div>
      {note && (
        <p className="ada-note">
          <IconeCreateur nom="info" className="h-3.5 w-3.5 shrink-0" />
          {note}
        </p>
      )}
    </div>
  );
}

export function Section({ titre, aide, children }: { titre: string; aide?: ReactNode; children: ReactNode }) {
  return (
    <section className="ada-section">
      <h3 className="ada-section-titre">
        {titre}
        {aide && <span className="ada-section-aide">{aide}</span>}
      </h3>
      {children}
    </section>
  );
}
