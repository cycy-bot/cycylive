"use client";

// Navigation de l'administration : rubriques rangées par thème (barre latérale sur ordinateur,
// liste déroulante sur téléphone), pastille orange si des modifications ne sont pas enregistrées,
// et recherche d'un réglage par mot-clé.
import { useMemo, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";

export type RubriqueAdmin<T extends string> = {
  valeur: T;
  label: string;
  icone: NomIcone;
  groupe: string;
  description: string;
  motsCles?: string;
};

export default function NavigationAdmin<T extends string>({
  rubriques,
  active,
  modifiees,
  onChoisir,
}: {
  rubriques: RubriqueAdmin<T>[];
  active: T;
  modifiees: T[];
  onChoisir: (valeur: T) => void;
}) {
  const [recherche, setRecherche] = useState("");
  const groupes = useMemo(() => [...new Set(rubriques.map((r) => r.groupe))], [rubriques]);
  const q = recherche.trim().toLowerCase();
  const visibles = q
    ? rubriques.filter((r) => `${r.label} ${r.description} ${r.motsCles ?? ""} ${r.groupe}`.toLowerCase().includes(q))
    : rubriques;
  const courante = rubriques.find((r) => r.valeur === active);

  return (
    <>
      {/* Téléphone : liste déroulante compacte */}
      <div className="lg:hidden sticky top-20 z-40 -mx-5 px-5 py-3 mb-6 bg-void/90 backdrop-blur-md border-b border-violet/10">
        <label htmlFor="rubrique-mobile" className="sr-only">Rubrique</label>
        <div className="relative">
          {courante && <Icone nom={courante.icone} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-lilac" />}
          <select
            id="rubrique-mobile"
            value={active}
            onChange={(e) => onChoisir(e.target.value as T)}
            className="w-full appearance-none rounded-2xl bg-card border border-violet/25 pl-11 pr-10 py-3 text-ink font-medium outline-none focus:border-violet/60"
          >
            {groupes.map((g) => (
              <optgroup key={g} label={g}>
                {rubriques
                  .filter((r) => r.groupe === g)
                  .map((r) => (
                    <option key={r.valeur} value={r.valeur}>
                      {r.label}
                      {modifiees.includes(r.valeur) ? " • non enregistré" : ""}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft">▾</span>
        </div>
      </div>

      {/* Ordinateur : barre latérale */}
      <nav aria-label="Rubriques de l'administration" className="hidden lg:block sticky top-28 self-start">
        <label className="relative block mb-4">
          <span className="sr-only">Rechercher un réglage</span>
          <Icone nom="loupe" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/60" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un réglage…"
            className="w-full rounded-xl bg-card border border-violet/20 pl-9 pr-3 py-2 text-sm text-ink outline-none focus:border-violet/60"
          />
        </label>
        {groupes.map((g) => {
          const items = visibles.filter((r) => r.groupe === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-4">
              <p className="px-3 mb-1 text-[11px] uppercase tracking-[0.16em] text-ink-soft/60">{g}</p>
              <ul className="space-y-0.5">
                {items.map((r) => {
                  const estActive = r.valeur === active;
                  const modifie = modifiees.includes(r.valeur);
                  return (
                    <li key={r.valeur}>
                      <button
                        onClick={() => {
                          onChoisir(r.valeur);
                          setRecherche("");
                        }}
                        aria-current={estActive ? "page" : undefined}
                        title={modifie ? "Modifications non enregistrées" : r.description}
                        className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-left transition-all ${
                          estActive ? "bg-violet/25 text-ink ring-1 ring-violet/40" : "text-ink-soft hover:bg-violet/10 hover:text-ink"
                        }`}
                      >
                        <Icone nom={r.icone} className={`w-[18px] h-[18px] ${estActive ? "text-lilac" : "text-ink-soft/70"}`} />
                        <span className="flex-1">{r.label}</span>
                        {modifie && <span aria-label="non enregistré" className="h-2 w-2 rounded-full bg-amber-400" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {q && visibles.length === 0 && <p className="px-3 text-sm text-ink-soft/60">Aucun réglage ne correspond.</p>}
      </nav>
    </>
  );
}

/** Petite barre de raccourcis vers les sous-parties d'une rubrique longue. */
export function SousNavAdmin({ liens }: { liens: { id: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {liens.map((l) => (
        <a
          key={l.id}
          href={`#${l.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(l.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="rounded-full border border-violet/20 bg-white/[0.03] px-3 py-1 text-xs text-ink-soft hover:text-ink hover:bg-violet/10 transition-all"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
