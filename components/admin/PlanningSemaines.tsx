"use client";

// Planning de l'admin : la semaine en cours et les suivantes (jusqu'à 6), date par date,
// avec jusqu'à 3 jeux / activités par soirée, et la semaine type répétée chaque semaine.
// Une date modifiée devient une « exception » (stockée avec le calendrier) ; « Comme d'habitude »
// la retire. Tout s'enregistre en un clic, CycyBot le récupère dans les 2 minutes.

import { useMemo, useState } from "react";
import { MAX_JEUX, CATEGORIES, categorieDe, jeuxDe, libelleSoiree, type JourPlanning } from "@/data/planning";
import { dateParis, type DonneesCalendrier, type ExceptionPlanning } from "@/data/calendrier";

const CHAMP = "rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60";
const NOMS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const SEMAINES = 6;
const court = (ymd: string) => `${Number(ymd.slice(8, 10))}/${ymd.slice(5, 7)}`;

function semainesAVenir(): string[][] {
  const ymd = dateParis(new Date());
  const jour = new Date(`${ymd}T12:00:00Z`);
  const lundi = new Date(jour.getTime() - ((jour.getUTCDay() + 6) % 7) * 86400000);
  return Array.from({ length: SEMAINES }, (_, s) =>
    Array.from({ length: 7 }, (_, i) => new Date(lundi.getTime() + (s * 7 + i) * 86400000).toISOString().slice(0, 10))
  );
}
const nomSemaine = (i: number) => (i === 0 ? "Cette semaine" : i === 1 ? "Semaine prochaine" : `Dans ${i} semaines`);

/** Jusqu'à 3 jeux / activités : un champ par partie de la soirée, ajout et retrait (les champs vides restent pendant la saisie). */
function ChampsJeux({ jeux, onChange, suggestions, disabled }: { jeux: string[]; onChange: (j: string[]) => void; suggestions: string[]; disabled?: boolean }) {
  const liste = jeux.length ? jeux : [""];
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {liste.map((j, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-5 shrink-0 text-center text-[11px] text-ink-soft">{liste.length > 1 ? i + 1 : "🎮"}</span>
          <input
            list="cycy-jeux"
            value={j}
            disabled={disabled}
            aria-label={`Jeu ${i + 1}`}
            placeholder={i === 0 ? "Jeu (facultatif) : Goose Goose Duck…" : "Puis…"}
            maxLength={60}
            onChange={(e) => onChange(liste.map((x, k) => (k === i ? e.target.value : x)))}
            className={`${CHAMP} flex-1 min-w-0`}
          />
          {liste.length > 1 || j ? (
            <button type="button" disabled={disabled} aria-label="Retirer ce jeu" title="Retirer ce jeu" onClick={() => onChange(liste.length > 1 ? liste.filter((_, k) => k !== i) : [""])} className="shrink-0 rounded-full w-7 h-7 border border-violet/20 text-ink-soft hover:text-red-300 hover:border-red-400/40">✕</button>
          ) : null}
        </div>
      ))}
      {liste.length < MAX_JEUX && !disabled ? (
        <button type="button" onClick={() => onChange([...liste, ""])} className="self-start ml-6 text-xs text-lilac hover:underline">
          ＋ Ajouter un jeu ({liste.length}/{MAX_JEUX})
        </button>
      ) : null}
    </div>
  );
}

// Soirée telle que saisie (les jeux vides sont gardés tant qu'on écrit)
type Soiree = { jeux: string[]; titre: string; categorie: string };
const soireeDe = (x: { jeu?: string; jeux?: string[]; titre?: string; categorie?: string } | null | undefined): Soiree => ({
  jeux: x && Array.isArray(x.jeux) ? x.jeux.map((v) => String(v ?? "")) : jeuxDe(x),
  titre: x?.titre || "",
  categorie: x?.categorie || "",
});
const aSoiree = (x: { jeux?: string[]; titre?: string; categorie?: string } | undefined) => Boolean(x && (x.titre !== undefined || x.categorie !== undefined || Array.isArray(x.jeux)));

type Props = {
  planning: JourPlanning[];
  calendrier: DonneesCalendrier;
  modifierJour: (index: number, patch: Partial<JourPlanning>) => void;
  setCalendrier: (c: DonneesCalendrier) => void;
  enregistrement: boolean;
  onEnregistrer: () => void;
};

export default function PlanningSemaines({ planning, calendrier, modifierJour, setCalendrier, enregistrement, onEnregistrer }: Props) {
  const semaines = useMemo(semainesAVenir, []);
  const [semaine, setSemaine] = useState(0);
  const [vue, setVue] = useState<"semaines" | "type">("semaines");
  const aujourdHui = dateParis(new Date());
  // Jeux déjà utilisés : proposés en suggestion
  const suggestions = useMemo(() => {
    const s = new Set<string>();
    for (const j of planning) jeuxDe(j).forEach((x) => s.add(x));
    for (const e of Object.values(calendrier.exceptions)) jeuxDe(e).forEach((x) => s.add(x));
    ["Valorant", "Valorant — RANKED", "Valorant — Soirée PP", "Goose Goose Duck", "Among Us", "Just Chatting", "Phasmophobia", "Minecraft"].forEach((x) => s.add(x));
    return [...s].slice(0, 40);
  }, [planning, calendrier.exceptions]);

  const changerException = (date: string, e: ExceptionPlanning | null) => {
    const exceptions = { ...calendrier.exceptions };
    if (e) exceptions[date] = e;
    else delete exceptions[date];
    setCalendrier({ ...calendrier, exceptions });
  };
  const habituelDe = (i: number) => planning.find((p) => p.jour === NOMS[i]);
  const effectif = (date: string, i: number) => {
    const h = habituelDe(i), ex = calendrier.exceptions[date];
    if (!ex) return { off: h?.off ?? true, heure: h?.heure, fin: h?.fin, ...soireeDe(h), note: "", modifie: false };
    if (ex.off) return { off: true, heure: undefined, fin: undefined, ...soireeDe(h), note: ex.note || "", modifie: true };
    // Soirée personnalisée ce jour-là, sinon celle de la semaine type
    const soiree = aSoiree(ex) ? soireeDe(ex) : soireeDe(h);
    return { off: false, heure: ex.heure ?? h?.heure, fin: ex.fin ?? h?.fin, ...soiree, note: ex.note || "", modifie: true };
  };
  // Modifier une date : on part de ce qui est affiché et on l'enregistre comme exception
  const modifierDate = (date: string, i: number, patch: Partial<ExceptionPlanning>) => {
    const e = effectif(date, i);
    const base: ExceptionPlanning = { off: e.off, heure: e.heure, fin: e.fin, jeux: e.jeux, titre: e.titre, categorie: e.categorie, note: e.note || undefined };
    const suivant = { ...base, ...patch };
    if (patch.off === false && !suivant.heure) suivant.heure = habituelDe(i)?.heure || "21h30";
    changerException(date, { ...suivant, jeu: libelleSoiree({ ...suivant, titre: suivant.titre || undefined, categorie: suivant.categorie || undefined }) || undefined });
  };
  const copierSemaine = (de: number, vers: number) => {
    const exceptions = { ...calendrier.exceptions };
    semaines[vers].forEach((date, i) => {
      const src = semaines[de][i], ex = calendrier.exceptions[src];
      if (ex) exceptions[date] = { ...ex };
      else delete exceptions[date];
    });
    setCalendrier({ ...calendrier, exceptions });
  };
  const remettreSemaine = (s: number) => {
    const exceptions = { ...calendrier.exceptions };
    semaines[s].forEach((d) => delete exceptions[d]);
    setCalendrier({ ...calendrier, exceptions });
  };
  const nbModifs = (s: number) => semaines[s].filter((d) => calendrier.exceptions[d]).length;

  const carteJour = (date: string | null, i: number) => {
    const estType = date === null;
    const h = habituelDe(i);
    const e = estType ? { off: h?.off ?? true, heure: h?.heure, fin: h?.fin, ...soireeDe(h), note: "", modifie: false } : effectif(date!, i);
    const passe = !estType && date! < aujourdHui;
    const indexType = planning.findIndex((p) => p.jour === NOMS[i]);
    const maj = (patch: Partial<ExceptionPlanning>) => {
      if (estType) {
        const p: Partial<JourPlanning> = { ...patch } as Partial<JourPlanning>;
        const apres = { ...soireeDe(h), ...patch };
        p.jeu = libelleSoiree({ jeux: apres.jeux, titre: apres.titre || undefined, categorie: apres.categorie || undefined }) || undefined;
        if (patch.off === false && !h?.heure) p.heure = "21h30";
        if (indexType >= 0) modifierJour(indexType, p);
      } else modifierDate(date!, i, patch);
    };
    const cat = categorieDe(e.categorie);
    const apercu = libelleSoiree({ jeux: e.jeux, titre: e.titre || undefined, categorie: e.categorie || undefined });
    return (
      <div
        key={date || NOMS[i]}
        className={`carte-holo rounded-2xl border p-3.5 flex flex-col gap-2.5 ${passe ? "opacity-45" : ""} ${
          date === aujourdHui ? "border-violet-light shadow-glow-sm" : e.modifie ? "border-amber-300/40" : "border-violet/15"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-semibold ${date === aujourdHui ? "text-lilac" : "text-ink"}`}>{NOMS[i]}</span>
          {date ? <span className="text-xs text-ink-soft">{court(date)}</span> : null}
          {date === aujourdHui ? <span className="rounded-full bg-violet px-2 py-0.5 text-[10px] font-semibold text-white">Aujourd’hui</span> : null}
          {e.modifie ? <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">Modifié</span> : null}
          <div className="ml-auto flex rounded-full border border-violet/20 p-0.5 text-xs">
            <button type="button" disabled={passe} onClick={() => maj({ off: false })} className={`rounded-full px-2.5 py-1 ${!e.off ? "bg-violet text-white" : "text-ink-soft"}`}>Live</button>
            <button type="button" disabled={passe} onClick={() => maj({ off: true })} className={`rounded-full px-2.5 py-1 ${e.off ? "bg-violet/40 text-white" : "text-ink-soft"}`}>OFF</button>
          </div>
        </div>
        {!e.off ? (
          <>
            <div className="flex items-center gap-2">
              <input aria-label={`Début du ${NOMS[i]}`} value={e.heure ?? ""} placeholder="21h30" disabled={passe} onChange={(x) => maj({ heure: x.target.value })} className={`${CHAMP} w-20`} />
              <span className="text-ink-soft text-sm">→</span>
              <input aria-label={`Fin du ${NOMS[i]}`} value={e.fin ?? ""} placeholder="Fin (1h)" disabled={passe} onChange={(x) => maj({ fin: x.target.value })} className={`${CHAMP} w-24`} />
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-ink-soft/70">Catégorie</span>
              <select value={e.categorie} disabled={passe} onChange={(x) => maj({ categorie: x.target.value })} className={`${CHAMP} w-full`}>
                <option value="">— Aucune (selon le jeu) —</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-ink-soft/70">Titre de la soirée</span>
              <input value={e.titre} disabled={passe} maxLength={80} onChange={(x) => maj({ titre: x.target.value })}
                placeholder={cat && cat.id !== "autre" && cat.id !== "valorant" ? `${cat.label} (titre libre, facultatif)` : "Titre libre, facultatif"} className={`${CHAMP} w-full`} />
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-ink-soft/70">Jeu(x)</span>
              <ChampsJeux jeux={e.jeux} suggestions={suggestions} disabled={passe} onChange={(jeux) => maj({ jeux })} />
            </div>
            {apercu ? <p className="text-[11px] text-ink-soft">Affiché : <span className="text-lilac">{cat ? cat.emoji + " " : ""}{apercu}</span></p> : null}
          </>
        ) : (
          <p className="text-sm text-ink-soft">🌙 Pas de live</p>
        )}
        {!estType ? (
          <div className="flex items-center gap-2 mt-auto">
            <input aria-label="Note" value={e.note} placeholder="Note (« live spécial 2 ans »…)" maxLength={120} disabled={passe} onChange={(x) => maj({ note: x.target.value })} className={`${CHAMP} flex-1 min-w-0 text-xs`} />
            {e.modifie && !passe ? (
              <button type="button" title="Revenir à la semaine type pour ce jour" onClick={() => changerException(date!, null)} className="text-xs text-ink-soft hover:text-lilac whitespace-nowrap">↺ Habituel</button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <datalist id="cycy-jeux">{suggestions.map((x) => <option key={x} value={x} />)}</datalist>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-violet/25 p-1">
          <button type="button" onClick={() => setVue("semaines")} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${vue === "semaines" ? "bg-violet text-ink" : "text-ink-soft"}`}>📅 Semaines à venir</button>
          <button type="button" onClick={() => setVue("type")} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${vue === "type" ? "bg-violet text-ink" : "text-ink-soft"}`}>🔁 Semaine type</button>
        </div>
        <p className="text-xs text-ink-soft">
          {vue === "semaines"
            ? "Prépare les semaines suivantes à l’avance : le site n’affiche que la semaine en cours (et la suivante si on clique)."
            : "Ta semaine habituelle, répétée chaque semaine tant qu’un jour n’est pas modifié."}
        </p>
      </div>

      {vue === "semaines" ? (
        <>
          <div className="flex flex-wrap gap-2" role="tablist">
            {semaines.map((d, s) => (
              <button
                key={d[0]}
                type="button"
                role="tab"
                aria-selected={semaine === s}
                onClick={() => setSemaine(s)}
                className={`rounded-2xl border px-3.5 py-2 text-left transition-all ${semaine === s ? "border-violet-light bg-violet/20" : "border-violet/15 hover:border-violet/35"}`}
              >
                <span className="block text-sm font-semibold text-ink">{nomSemaine(s)}</span>
                <span className="block text-[11px] text-ink-soft">
                  {court(d[0])} → {court(d[6])}
                  {nbModifs(s) ? <span className="ml-1 text-amber-200">· {nbModifs(s)} modif.</span> : null}
                </span>
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 items-start">{semaines[semaine].map((date, i) => carteJour(date, i))}</div>
          <div className="flex flex-wrap gap-2 text-sm">
            {semaine > 0 ? (
              <button type="button" onClick={() => copierSemaine(semaine - 1, semaine)} className="rounded-full border border-violet/25 px-4 py-1.5 text-ink-soft hover:bg-violet/10">
                ⧉ Reprendre les changements de la semaine d’avant
              </button>
            ) : null}
            {nbModifs(semaine) ? (
              <button type="button" onClick={() => remettreSemaine(semaine)} className="rounded-full border border-violet/25 px-4 py-1.5 text-ink-soft hover:bg-violet/10">
                ↺ Remettre toute la semaine comme d’habitude
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 items-start">{NOMS.map((_, i) => carteJour(null, i))}</div>
      )}

      <button
        type="button"
        onClick={onEnregistrer}
        disabled={enregistrement}
        className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
      >
        {enregistrement ? "Enregistrement..." : "Enregistrer le planning"}
      </button>
    </div>
  );
}
