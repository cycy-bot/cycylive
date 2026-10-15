"use client";

// Onglet « Calendrier » de /admin : le planning des 4 prochaines semaines (avec les
// changements date par date) et les événements de la communauté. CycyBot relit tout
// ça toutes les 2 minutes : planning Discord, annonces « Je participe », rappels en MP.

import { useState } from "react";
import type { JourPlanning } from "@/data/planning";
import {
  TYPES_EVENEMENT,
  dateParis,
  type DonneesCalendrier,
  type EvenementCalendrier,
  type ExceptionPlanning,
} from "@/data/calendrier";

const CHAMP = "rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60";
const NOMS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const SEMAINES = 4;

const versLocal = (t: number) => {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const court = (ymd: string) => `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
const nouvelId = () => Math.random().toString(36).slice(2, 12);

function lundisAVenir(): string[][] {
  const ymd = dateParis(new Date());
  const jour = new Date(`${ymd}T12:00:00Z`);
  const lundi = new Date(jour.getTime() - ((jour.getUTCDay() + 6) % 7) * 86400000);
  return Array.from({ length: SEMAINES }, (_, s) =>
    Array.from({ length: 7 }, (_, i) => new Date(lundi.getTime() + (s * 7 + i) * 86400000).toISOString().slice(0, 10))
  );
}

type Props = {
  planning: JourPlanning[];
  calendrier: DonneesCalendrier;
  onChange: (c: DonneesCalendrier) => void;
  onEnregistrer: () => void;
  enregistrement: boolean;
};

export default function AdminCalendrier({ planning, calendrier, onChange, onEnregistrer, enregistrement }: Props) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const aujourdHui = dateParis(new Date());
  const semaines = lundisAVenir();

  const changerException = (date: string, e: ExceptionPlanning | null) => {
    const exceptions = { ...calendrier.exceptions };
    if (e) exceptions[date] = e;
    else delete exceptions[date];
    onChange({ ...calendrier, exceptions });
  };
  const changerEvenement = (id: string, patch: Partial<EvenementCalendrier>) =>
    onChange({ ...calendrier, evenements: calendrier.evenements.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const ajouterEvenement = () => {
    const debut = new Date();
    debut.setDate(debut.getDate() + 3);
    debut.setHours(21, 0, 0, 0);
    const e: EvenementCalendrier = {
      id: nouvelId(), type: "quiz", titre: "", description: "", debut: debut.getTime(), dureeMin: 60,
      lieu: "", lien: "", places: 0, annoncer: true, mentionner: false, resultat: null,
    };
    onChange({ ...calendrier, evenements: [e, ...calendrier.evenements] });
    setOuvert(e.id);
  };

  const aVenir = calendrier.evenements.filter((e) => e.debut + e.dureeMin * 60000 >= Date.now()).sort((a, b) => a.debut - b.debut);
  const passes = calendrier.evenements.filter((e) => e.debut + e.dureeMin * 60000 < Date.now()).sort((a, b) => b.debut - a.debut);

  return (
    <div className="space-y-10">
      <p className="text-ink-soft text-sm">
        Tout ce que tu changes ici s’affiche sur{" "}
        <a href="/calendrier" target="_blank" className="text-lilac underline">cycylive.fr/calendrier</a> et sur la page d’accueil. CycyBot le
        récupère dans les 2 minutes : planning Discord, annonces avec le bouton « Je participe » et rappels en message privé.
      </p>

      {/* ── Planning des 4 prochaines semaines ── */}
      <section>
        <h2 className="text-ink font-medium mb-1">📅 Le planning des {SEMAINES} prochaines semaines</h2>
        <p className="text-ink-soft text-sm mb-4">
          Par défaut, chaque semaine reprend ton planning habituel (onglet 📅 Planning). Pour un jour précis, tu peux annuler le live, changer
          l’heure ou le jeu, et ajouter une petite note (« live spécial 2 ans », « en déplacement »…).
        </p>
        <div className="grid gap-4 xl:grid-cols-2">
          {semaines.map((dates) => (
            <div key={dates[0]} className="carte-holo rounded-2xl border border-violet/15 p-4">
              <h3 className="text-sm font-semibold text-ink mb-2">
                Semaine du {court(dates[0])} au {court(dates[6])}
                {dates.includes(aujourdHui) ? <span className="ml-2 text-xs font-normal text-lilac">(cette semaine)</span> : null}
              </h3>
              <div className="divide-y divide-violet/10">
                {dates.map((date, i) => {
                  const habituel = planning.find((p) => p.jour === NOMS[i]);
                  const ex = calendrier.exceptions[date];
                  const passe = date < aujourdHui;
                  const mode = !ex ? "habituel" : ex.off ? "off" : "change";
                  return (
                    <div key={date} className={`py-2 flex flex-wrap items-center gap-2 ${passe ? "opacity-45" : ""} ${ex ? "bg-violet/[0.06] -mx-2 px-2 rounded-lg" : ""}`}>
                      <span className={`w-24 shrink-0 text-sm ${date === aujourdHui ? "text-lilac font-semibold" : "text-ink"}`}>
                        {NOMS[i].slice(0, 3)}. {court(date)}
                      </span>
                      <span className="w-36 shrink-0 text-xs text-ink-soft">
                        {habituel && !habituel.off ? `Habituel : ${habituel.heure ?? ""}${habituel.jeu ? ` · ${habituel.jeu}` : ""}` : "Habituel : OFF"}
                      </span>
                      <select
                        aria-label={`Live du ${court(date)}`}
                        disabled={passe}
                        value={mode}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "habituel") changerException(date, null);
                          else if (v === "off") changerException(date, { off: true, note: ex?.note });
                          else changerException(date, { off: false, heure: ex?.heure || habituel?.heure || "21h30", jeu: ex?.jeu || habituel?.jeu, note: ex?.note });
                        }}
                        className={CHAMP}
                      >
                        <option value="habituel">Comme d’habitude</option>
                        <option value="off">🌙 Pas de live</option>
                        <option value="change">✏️ Changement</option>
                      </select>
                      {mode === "change" && ex ? (
                        <>
                          <input aria-label="Heure" value={ex.heure ?? ""} placeholder="21h30" onChange={(e) => changerException(date, { ...ex, heure: e.target.value })} className={`${CHAMP} w-20`} />
                          <input aria-label="Jeu" value={ex.jeu ?? ""} placeholder="Jeu" onChange={(e) => changerException(date, { ...ex, jeu: e.target.value })} className={`${CHAMP} w-32`} />
                        </>
                      ) : null}
                      {ex ? (
                        <input aria-label="Note" value={ex.note ?? ""} placeholder="Note (facultatif)" maxLength={120} onChange={(e) => changerException(date, { ...ex, note: e.target.value })} className={`${CHAMP} flex-1 min-w-[140px]`} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Événements ── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h2 className="text-ink font-medium">🎉 Les événements de la communauté</h2>
          <button type="button" onClick={ajouterEvenement} className="rounded-full px-4 py-2 bg-violet/20 border border-violet/40 text-ink text-sm hover:bg-violet/30">
            ➕ Nouvel événement
          </button>
        </div>
        <p className="text-ink-soft text-sm mb-4">
          Quiz, soirée jeux, ciné-club, projet de la commu… Les soirées PP se créent dans l’admin du bot et s’ajoutent toutes seules au
          calendrier. Une fois l’événement passé, ajoute les résultats : ils s’affichent sur le site et sous l’annonce Discord.
        </p>
        {[...aVenir, ...passes].length === 0 ? <p className="text-ink-soft text-sm">Aucun événement pour l’instant.</p> : null}
        <div className="space-y-3">
          {[...aVenir, ...passes].map((e) => {
            const passe = e.debut + e.dureeMin * 60000 < Date.now();
            const estOuvert = ouvert === e.id;
            const type = TYPES_EVENEMENT.find((t) => t.valeur === e.type);
            return (
              <div key={e.id} className={`carte-holo rounded-2xl border border-violet/15 p-4 ${passe && !estOuvert ? "opacity-75" : ""}`}>
                <button type="button" onClick={() => setOuvert(estOuvert ? null : e.id)} className="w-full flex flex-wrap items-center gap-2 text-left">
                  <span className="text-sm text-ink-soft">{type?.label ?? e.type}</span>
                  <span className="font-medium text-ink">{e.titre || "Sans titre"}</span>
                  <span className="text-xs text-ink-soft">
                    {new Date(e.debut).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {e.annoncer ? <span className="text-xs rounded-full border border-violet/30 px-2 py-0.5 text-lilac">📣 Discord</span> : null}
                  {passe ? <span className="text-xs rounded-full border border-violet/20 px-2 py-0.5 text-ink-soft">{e.resultat ? "🏁 résultats publiés" : "terminé · résultats ?"}</span> : null}
                  <span className="ml-auto text-ink-soft">{estOuvert ? "▲" : "▼"}</span>
                </button>
                {estOuvert ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="text-xs text-ink-soft">Type
                        <select value={e.type} onChange={(x) => changerEvenement(e.id, { type: x.target.value as EvenementCalendrier["type"] })} className={`${CHAMP} mt-1 w-full`}>
                          {TYPES_EVENEMENT.map((t) => <option key={t.valeur} value={t.valeur}>{t.label}</option>)}
                        </select>
                      </label>
                      <label className="text-xs text-ink-soft sm:col-span-1 lg:col-span-3">Titre
                        <input value={e.titre} maxLength={90} placeholder="Ex. Quiz musical du vendredi" onChange={(x) => changerEvenement(e.id, { titre: x.target.value })} className={`${CHAMP} mt-1 w-full`} />
                      </label>
                      <label className="text-xs text-ink-soft">Début
                        <input type="datetime-local" value={versLocal(e.debut)} onChange={(x) => { const t = new Date(x.target.value).getTime(); if (Number.isFinite(t)) changerEvenement(e.id, { debut: t }); }} className={`${CHAMP} mt-1 w-full`} />
                      </label>
                      <label className="text-xs text-ink-soft">Durée (minutes)
                        <input type="number" min={15} max={1440} step={15} value={e.dureeMin} onChange={(x) => changerEvenement(e.id, { dureeMin: Number(x.target.value) })} className={`${CHAMP} mt-1 w-full`} />
                      </label>
                      <label className="text-xs text-ink-soft">Places (0 = illimité)
                        <input type="number" min={0} max={500} value={e.places} onChange={(x) => changerEvenement(e.id, { places: Number(x.target.value) })} className={`${CHAMP} mt-1 w-full`} />
                      </label>
                      <label className="text-xs text-ink-soft">Lieu
                        <input value={e.lieu} maxLength={90} placeholder="Vocal Général, Twitch…" onChange={(x) => changerEvenement(e.id, { lieu: x.target.value })} className={`${CHAMP} mt-1 w-full`} />
                      </label>
                      <label className="text-xs text-ink-soft sm:col-span-2 lg:col-span-4">Lien (facultatif)
                        <input type="url" value={e.lien} placeholder="https://…" onChange={(x) => changerEvenement(e.id, { lien: x.target.value })} className={`${CHAMP} mt-1 w-full`} />
                      </label>
                    </div>
                    <label className="block text-xs text-ink-soft">Description
                      <textarea value={e.description} maxLength={1000} rows={3} placeholder="Ce qui va se passer, comment participer, les lots…" onChange={(x) => changerEvenement(e.id, { description: x.target.value })} className={`${CHAMP} mt-1 w-full`} />
                    </label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="accent-violet" checked={e.annoncer} onChange={(x) => changerEvenement(e.id, { annoncer: x.target.checked })} />
                        Annoncer sur Discord (bouton « Je participe » + rappel en MP)
                      </label>
                      <label className={`flex items-center gap-2 ${e.annoncer ? "" : "opacity-40"}`}>
                        <input type="checkbox" className="accent-violet" disabled={!e.annoncer} checked={e.mentionner} onChange={(x) => changerEvenement(e.id, { mentionner: x.target.checked })} />
                        Mentionner le rôle des annonces
                      </label>
                    </div>

                    <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.04] p-3 space-y-2">
                      <p className="text-sm font-medium text-amber-200">🏁 Résultats {passe ? "" : "(à remplir après l’événement)"}</p>
                      <textarea
                        value={e.resultat?.texte ?? ""}
                        maxLength={600}
                        rows={2}
                        placeholder="Gagnant·es, scores, le film élu…"
                        onChange={(x) => changerEvenement(e.id, { resultat: { texte: x.target.value, lien: e.resultat?.lien ?? "", prevenir: e.resultat?.prevenir ?? false } })}
                        className={`${CHAMP} w-full`}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="url"
                          value={e.resultat?.lien ?? ""}
                          placeholder="Lien (clip, photos…)"
                          onChange={(x) => changerEvenement(e.id, { resultat: { texte: e.resultat?.texte ?? "", lien: x.target.value, prevenir: e.resultat?.prevenir ?? false } })}
                          className={`${CHAMP} flex-1 min-w-[200px]`}
                        />
                        <label className="flex items-center gap-2 text-sm text-ink-soft">
                          <input
                            type="checkbox"
                            className="accent-violet"
                            checked={e.resultat?.prevenir ?? false}
                            onChange={(x) => changerEvenement(e.id, { resultat: { texte: e.resultat?.texte ?? "", lien: e.resultat?.lien ?? "", prevenir: x.target.checked } })}
                          />
                          Prévenir les inscrit·es en MP
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer « ${e.titre || "cet événement"} » ? (son annonce Discord sera retirée)`)) {
                          onChange({ ...calendrier, evenements: calendrier.evenements.filter((x) => x.id !== e.id) });
                        }
                      }}
                      className="rounded-full px-4 py-1.5 border border-red-400/40 text-red-300 text-sm hover:bg-red-400/10"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={onEnregistrer}
        disabled={enregistrement}
        className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
      >
        {enregistrement ? "Enregistrement..." : "Enregistrer le calendrier"}
      </button>
    </div>
  );
}
