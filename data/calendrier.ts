// ============================================================
// CALENDRIER — exceptions au planning (par date) et événements
// ============================================================
// Le planning habituel (lundi → dimanche) reste dans data/planning.ts.
// Ici on ajoute, date par date, ce qui change une semaine donnée
// (live annulé, horaire décalé, jeu spécial…) et les événements de
// la communauté (quiz, soirées Discord, projets…). Tout se gère dans
// /admin, onglet « Calendrier ». CycyBot relit ces données toutes les
// 2 minutes pour les annonces Discord, les inscriptions et les rappels.

import { type JourPlanning, avecJeux, jeuxDe, libelleSoiree } from "@/data/planning";

/** Ce qui change pour une date précise (« 2026-10-20 »). */
export type ExceptionPlanning = { off: boolean; heure?: string; fin?: string; jeu?: string; jeux?: string[]; titre?: string; categorie?: string; note?: string };

export type TypeEvenement = "quiz" | "discord" | "projet" | "live" | "autre";

export type EvenementCalendrier = {
  id: string;
  type: TypeEvenement;
  titre: string;
  description: string;
  debut: number; // instant (ms)
  dureeMin: number;
  lieu: string;
  lien: string;
  places: number; // 0 = illimité
  annoncer: boolean; // annonce Discord avec « Je participe »
  mentionner: boolean; // mentionner le rôle choisi dans l'admin du bot
  resultat: { texte: string; lien: string; prevenir: boolean } | null;
};

export type DonneesCalendrier = {
  exceptions: Record<string, ExceptionPlanning>;
  evenements: EvenementCalendrier[];
};

export const calendrierVide: DonneesCalendrier = { exceptions: {}, evenements: [] };

export const TYPES_EVENEMENT: { valeur: TypeEvenement; label: string }[] = [
  { valeur: "quiz", label: "🧠 Quiz" },
  { valeur: "discord", label: "🎉 Événement Discord" },
  { valeur: "projet", label: "🛠️ Projet communautaire" },
  { valeur: "live", label: "🔴 Live spécial" },
  { valeur: "autre", label: "✨ Autre" },
];

/** « 2026-10-20 » à l'heure de Paris. */
export function dateParis(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(d);
}

/** Le jour du planning habituel, avec l'exception de cette date si elle existe. */
export function jourAvecException(jour: JourPlanning, exception?: ExceptionPlanning): JourPlanning & { note?: string; modifie?: boolean } {
  if (!exception) return jour;
  if (exception.off) return { jour: jour.jour, off: true, note: exception.note, modifie: true };
  // Soirée personnalisée ce jour-là (titre, catégorie ou jeux) ; sinon celle de la semaine type
  const perso = Boolean(exception.titre || exception.categorie || jeuxDe(exception).length);
  const src = perso ? exception : jour;
  const soiree = { jeux: jeuxDe(src), titre: src.titre, categorie: src.categorie };
  return { jour: jour.jour, off: false, heure: exception.heure || jour.heure, fin: exception.fin || jour.fin, ...soiree, jeu: libelleSoiree(soiree) || undefined, note: exception.note, modifie: true };
}

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const TYPES = TYPES_EVENEMENT.map((t) => t.valeur);

/** Nettoie ce qui arrive de l'admin (rien d'inattendu n'est enregistré). */
export function nettoyerCalendrier(brut: unknown): DonneesCalendrier | null {
  if (!brut || typeof brut !== "object") return null;
  const b = brut as { exceptions?: unknown; evenements?: unknown };
  const exceptions: Record<string, ExceptionPlanning> = {};
  const limite = dateParis(new Date(Date.now() - 14 * 86400000));
  if (b.exceptions && typeof b.exceptions === "object") {
    for (const [date, v] of Object.entries(b.exceptions as Record<string, unknown>)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < limite || !v || typeof v !== "object") continue;
      const e = v as Record<string, unknown>;
      exceptions[date] = avecJeux({ off: Boolean(e.off), heure: texte(e.heure, 10) || undefined, fin: texte(e.fin, 10) || undefined, jeu: texte(e.jeu, 200) || undefined, jeux: Array.isArray(e.jeux) ? e.jeux.map((x) => texte(x, 60)) : undefined, titre: texte(e.titre, 80) || undefined, categorie: texte(e.categorie, 20) || undefined, note: texte(e.note, 120) || undefined });
    }
  }
  const evenements: EvenementCalendrier[] = [];
  if (Array.isArray(b.evenements)) {
    for (const v of b.evenements.slice(0, 200)) {
      if (!v || typeof v !== "object") continue;
      const e = v as Record<string, unknown>;
      const titre = texte(e.titre, 90);
      const debut = Number(e.debut);
      if (!titre || !Number.isFinite(debut)) continue;
      const lien = texte(e.lien, 300);
      const r = e.resultat as Record<string, unknown> | null | undefined;
      const resTexte = r ? texte(r.texte, 600) : "";
      const resLien = r ? texte(r.lien, 300) : "";
      evenements.push({
        id: /^[a-z0-9]{6,20}$/.test(String(e.id)) ? String(e.id) : Math.random().toString(36).slice(2, 12),
        type: TYPES.includes(e.type as TypeEvenement) ? (e.type as TypeEvenement) : "autre",
        titre,
        description: texte(e.description, 1000),
        debut,
        dureeMin: Math.max(15, Math.min(1440, Math.round(Number(e.dureeMin) || 60))),
        lieu: texte(e.lieu, 90),
        lien: /^https:\/\//i.test(lien) ? lien : "",
        places: Math.max(0, Math.min(500, Math.round(Number(e.places) || 0))),
        annoncer: Boolean(e.annoncer),
        mentionner: Boolean(e.mentionner),
        resultat: resTexte || resLien ? { texte: resTexte, lien: /^https:\/\//i.test(resLien) ? resLien : "", prevenir: Boolean(r?.prevenir) } : null,
      });
    }
  }
  evenements.sort((a, b2) => a.debut - b2.debut);
  return { exceptions, evenements };
}
