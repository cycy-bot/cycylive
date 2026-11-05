// ============================================================
// PLANNING DES LIVES — types et calculs
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Pour changer le planning au quotidien, utilise l'interface web
// sur /admin (voir le README, section "Interface d'administration
// du planning").
//
// Le tableau ci-dessous ne sert que de PLANNING PAR DÉFAUT, utilisé
// si l'interface /admin n'a encore jamais rien enregistré (ou si le
// stockage n'est pas configuré). Une fois que tu as fait une
// première sauvegarde via /admin, c'est celle-ci qui prend le relais
// partout sur le site.

export type JourPlanning = {
  jour: string;
  off: boolean;
  jeu?: string; // tous les jeux de la soirée, séparés par « + » (lu aussi par CycyBot et le compte à rebours)
  jeux?: string[]; // jusqu'à 3 jeux / activités dans la même soirée, dans l'ordre
  titre?: string; // titre libre de la soirée (« Soirée jeux communautaires »…)
  categorie?: string; // format de la soirée (voir FORMATS) : choisit l'illustration du planning
  heure?: string; // format "21h30"
  fin?: string; // heure de fin (facultative), format "1h" ou "23h30"
  aVenir?: boolean; // live prévu ce jour-là, horaires pas encore connus
  etapes?: Etape[]; // déroulé de la soirée (ex. 19h parties persos → 21h15 giveaway → parties persos)
};

/** Une partie de la soirée : heure de début (sauf la 1re, qui commence avec le live), jeu et format. */
export type Etape = { heure?: string; jeu?: string; format?: string };

export const MAX_JEUX = 3;
export const MAX_ETAPES = 5;

/** Formats de soirée (le « quoi » du live, à côté du jeu) : ils choisissent l'illustration et les couleurs du
 *  planning (site + Discord). Le jeu, lui, est le jeu joué (Valorant, Minecraft, Just Chatting…), comme sur Twitch. */
export const FORMATS = [
  { id: "ranked", label: "Ranked", emoji: "🏆" },
  { id: "pp", label: "Parties persos", emoji: "🎮" },
  { id: "communautaire", label: "Jeux communautaires", emoji: "🎲" },
  { id: "decouverte", label: "Découverte", emoji: "🧭" },
  { id: "chill", label: "Chill & discussion", emoji: "☕" },
  { id: "horreur", label: "Jeux d'horreur", emoji: "👻" },
  { id: "evenement", label: "Événement spécial", emoji: "✨" },
  { id: "caritatif", label: "Live caritatif", emoji: "💜" },
  { id: "giveaway", label: "Giveaway", emoji: "🎁" },
  { id: "tournoi", label: "Tournoi", emoji: "🥇" },
  { id: "anniversaire", label: "Anniversaire", emoji: "🎂" },
  { id: "halloween", label: "Halloween", emoji: "🎃" },
  { id: "noel", label: "Noël", emoji: "🎄" },
] as const;
/** @deprecated ancien nom */
export const CATEGORIES = FORMATS;
export const formatDe = (id?: string) => FORMATS.find((c) => c.id === id);
export const categorieDe = formatDe;

/** Jeux proposés dans l'admin (on peut toujours écrire le sien). */
export const JEUX_SUGGERES = ["Valorant", "Just Chatting", "Minecraft", "Palworld", "Goose Goose Duck", "Among Us", "The Legend of Zelda", "Animal Crossing", "Phasmophobia", "Lethal Company", "Fortnite", "League of Legends", "Mario Kart", "Fall Guys", "Dead by Daylight", "Stardew Valley", "Pokémon", "Overcooked", "Gartic Phone", "Jeux de société"];

type AvecSoiree = { jeu?: string; jeux?: string[]; titre?: string; categorie?: string; etapes?: Etape[] };

const nettoyerEtape = (e: Etape | null | undefined): Etape => ({
  heure: String(e?.heure ?? "").trim().slice(0, 10) || undefined,
  jeu: String(e?.jeu ?? "").trim().slice(0, 60) || undefined,
  format: formatDe(String(e?.format ?? ""))?.id,
});
/** Le déroulé enregistré (2 parties ou plus), sinon rien : une soirée simple garde ses jeux et son format. */
export function deroule(j: AvecSoiree | null | undefined): Etape[] {
  if (!j || !Array.isArray(j.etapes)) return [];
  const l = j.etapes.map(nettoyerEtape).filter((e) => e.jeu || e.format).slice(0, MAX_ETAPES);
  return l.length > 1 ? l : [];
}
/** Le déroulé pour l'édition : celui enregistré, sinon construit à partir des jeux et du format. */
export function etapesDe(j: AvecSoiree | null | undefined): Etape[] {
  const d = deroule(j);
  if (d.length) return d;
  if (Array.isArray(j?.etapes) && j!.etapes.length) return j!.etapes.map((e) => ({ heure: e?.heure || "", jeu: e?.jeu || "", format: e?.format || "" }));
  const jeux = jeuxDe(j), f = formatDe(j?.categorie)?.id;
  if (jeux.length) return jeux.map((jeu, i) => ({ jeu, format: i === 0 ? f : undefined }));
  return [{ format: f }];
}
/** Les jeux (sans doublon) et le format principal (le 1er choisi) d'un déroulé. */
export function resumeEtapes(etapes: Etape[]): { jeux: string[]; categorie?: string } {
  const l = etapes.map(nettoyerEtape);
  // format principal (illustration du planning) : un format spécial (giveaway, tournoi…) passe avant ranked / parties persos
  const special = l.find((e) => e.format && !["ranked", "pp", "decouverte", "chill"].includes(e.format));
  return { jeux: [...new Set(l.map((e) => e.jeu).filter(Boolean) as string[])].slice(0, MAX_JEUX), categorie: (special || l.find((e) => e.format))?.format };
}
/** Texte d'une partie : « Valorant — Parties persos », « Giveaway »… */
export function texteEtape(e: Etape): string {
  const f = formatDe(e.format);
  return e.jeu && f ? `${e.jeu} — ${f.label}` : e.jeu || f?.label || "";
}

// Anciens libellés « Valorant — RANKED » / « Valorant — Soirée PP » : le jeu d'un côté, le format de l'autre
const ANCIENS_FORMATS: [RegExp, string][] = [[/^ranked$/i, "ranked"], [/^(soir[ée]e\s+)?pp$|^parties?\s+persos?$/i, "pp"]];
export function separerJeuFormat(jeux: string[], categorie?: string): { jeux: string[]; categorie?: string } {
  if (categorie) return { jeux, categorie };
  let cat: string | undefined;
  const out = jeux.map((j) => {
    const m = String(j).match(/^(.+?)\s+[—–-]\s+(.+)$/);
    const f = m && ANCIENS_FORMATS.find(([re]) => re.test(m[2].trim()));
    if (m && f) { cat = cat || f[1]; return m[1].trim(); }
    return j;
  });
  return { jeux: [...new Set(out)], categorie: cat };
}

/** Les jeux / activités d'une soirée (1 à 3), quel que soit l'ancien ou le nouveau format. */
export function jeuxDe(j: AvecSoiree | null | undefined): string[] {
  if (!j) return [];
  const liste = Array.isArray(j.jeux) ? j.jeux.map((x) => String(x || "").trim()).filter(Boolean) : [];
  if (liste.length) return liste.slice(0, MAX_JEUX);
  // Ancien format : « jeu » seul (sans titre ni catégorie, sinon « jeu » est le libellé calculé)
  if (j.titre || j.categorie) return [];
  return j.jeu ? [String(j.jeu).trim()].filter(Boolean) : [];
}

/** Libellé complet de la soirée (lu par CycyBot, le compte à rebours, les stories) : « Titre : jeu + jeu ». */
export function libelleSoiree(j: AvecSoiree | null | undefined): string {
  if (!j) return "";
  // Soirée en plusieurs parties : « Valorant — Parties persos · 21h15 Giveaway · Parties persos »
  const d = deroule(j);
  if (d.length) {
    const t = String(j.titre || "").trim();
    const txt = d.map((e, i) => (i > 0 && e.heure ? `${e.heure} ` : "") + texteEtape(e)).join(" · ");
    return t ? `${t} : ${txt}` : txt;
  }
  const jeux = jeuxDe(j);
  const f = formatDe(j.categorie);
  const titre = String(j.titre || "").trim();
  // « Titre : jeux » ; sans titre « Jeux — Format » (ex. « Valorant — Ranked ») ; sinon ce qu'on a
  if (titre) return jeux.length ? `${titre} : ${jeux.join(" + ")}` : titre;
  if (f && jeux.length) return `${jeux.join(" + ")} — ${f.label}`;
  return jeux.join(" + ") || (f ? f.label : "");
}

/** Range un jour avant l'enregistrement : jeux nettoyés (3 max), titre, catégorie et « jeu » recalculé. */
export function avecJeux<T extends AvecSoiree>(j0: T): T {
  // une seule partie : elle redevient un jeu + un format
  const r1 = Array.isArray(j0.etapes) && !deroule(j0).length ? resumeEtapes(j0.etapes) : null;
  const j: T = r1 ? { ...j0, jeux: Array.isArray(j0.jeux) && j0.jeux.length ? j0.jeux : r1.jeux, categorie: j0.categorie || r1.categorie } : j0;
  const titre = String(j.titre || "").trim().slice(0, 80) || undefined;
  // déroulé en plusieurs parties : il décide des jeux et du format principal
  const d = deroule(j);
  if (d.length) {
    const r = resumeEtapes(d);
    const propre = { ...j, titre, etapes: d, jeux: r.jeux.length ? r.jeux : undefined, categorie: r.categorie };
    return { ...propre, jeu: libelleSoiree(propre) || undefined };
  }
  // anciennes catégories : « Valorant » devient le jeu, « Autre » / « Discussion » disparaissent
  const ancien = String(j.categorie || "");
  const categorie = formatDe(ancien === "discussion" ? "chill" : ancien)?.id;
  const brut = Array.isArray(j.jeux) ? j.jeux : !titre && !ancien && j.jeu ? [j.jeu] : [];
  let jeux = brut.map((x) => String(x || "").trim().slice(0, 60)).filter(Boolean).slice(0, MAX_JEUX);
  if (ancien === "valorant" && !jeux.some((x) => /valorant/i.test(x))) jeux = ["Valorant", ...jeux].slice(0, MAX_JEUX);
  const sep = separerJeuFormat(jeux, categorie);
  jeux = sep.jeux;
  const propre = { ...j, titre, categorie: sep.categorie, jeux: jeux.length ? jeux : undefined, etapes: undefined };
  return { ...propre, jeu: libelleSoiree(propre) || undefined };
}

export const LABEL_GENERIQUE = "Stream";

export const planningParDefaut: JourPlanning[] = [
  { jour: "Lundi", off: false, heure: "21h30" },
  { jour: "Mardi", off: false, heure: "21h30" },
  { jour: "Mercredi", off: false, heure: "21h30" },
  { jour: "Jeudi", off: false, heure: "21h30" },
  { jour: "Vendredi", off: true },
  { jour: "Samedi", off: false, heure: "21h30" },
  { jour: "Dimanche", off: false, heure: "21h30" },
];

// ------------------------------------------------------------
// Calculs automatiques (rien à modifier en dessous de cette ligne)
// ------------------------------------------------------------

export const JOURS_ORDRE = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function formatCourt(date: Date): string {
  const jour = String(date.getDate()).padStart(2, "0");
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  return `${jour}/${mois}`;
}

/** Les 7 dates (« 2026-10-19 »…) de la semaine en cours, du lundi au dimanche, à Paris. */
export function datesSemaineActuelle(): string[] {
  const ymd = anneeMoisJourAParis(new Date());
  const jour = new Date(`${ymd}T12:00:00Z`);
  const lundi = new Date(jour.getTime() - ((jour.getUTCDay() + 6) % 7) * 86400000);
  return Array.from({ length: 7 }, (_, i) => new Date(lundi.getTime() + i * 86400000).toISOString().slice(0, 10));
}

export function getSemaineActuelle(): { du: string; au: string } {
  const aujourdhui = new Date();
  const jourSemaine = aujourdhui.getDay();
  const decalageLundi = jourSemaine === 0 ? -6 : 1 - jourSemaine;

  const lundi = new Date(aujourdhui);
  lundi.setDate(aujourdhui.getDate() + decalageLundi);

  const dimanche = new Date(lundi);
  dimanche.setDate(lundi.getDate() + 6);

  return { du: formatCourt(lundi), au: formatCourt(dimanche) };
}

// Convertit "21h30" -> { heures: 21, minutes: 30 }
function parseHeure(heure?: string): { heures: number; minutes: number } {
  if (!heure) return { heures: 0, minutes: 0 };
  const [h, m] = heure.replace("h", ":").split(":");
  return { heures: parseInt(h, 10) || 0, minutes: parseInt(m, 10) || 0 };
}

const FUSEAU_CYCYLIVE = "Europe/Paris";

// Le serveur (Vercel) tourne en UTC, pas en heure française. "21h" dans
// le planning veut dire 21h à Paris, pas 21h UTC — sans cette
// conversion, tout le compte à rebours est décalé (1h en hiver, 2h en
// été à cause du changement d'heure).
function decalageMinutes(date: Date, fuseau: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: fuseau,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const valeur = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const commeUTC = Date.UTC(
    parseInt(valeur("year")),
    parseInt(valeur("month")) - 1,
    parseInt(valeur("day")),
    parseInt(valeur("hour")),
    parseInt(valeur("minute")),
    parseInt(valeur("second"))
  );
  return (commeUTC - date.getTime()) / 60000;
}

function anneeMoisJourAParis(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU_CYCYLIVE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // "2026-09-24"
}

// Jour de la semaine (0 = dimanche) selon le calendrier de Paris —
// important autour de minuit, où le jour côté serveur (UTC) et côté
// Paris peuvent différer.
function jourSemaineAParis(date: Date): number {
  const ymd = anneeMoisJourAParis(date);
  return new Date(`${ymd}T00:00:00Z`).getUTCDay();
}

// Construit l'instant exact (UTC) correspondant à "heures:minutes" à
// Paris, pour le jour calendaire de `date` (vu depuis Paris).
function dateLiveAParis(date: Date, heures: number, minutes: number): Date {
  const anneeMoisJour = anneeMoisJourAParis(date);
  const essai = new Date(
    `${anneeMoisJour}T${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`
  );
  const decalage = decalageMinutes(essai, FUSEAU_CYCYLIVE);
  return new Date(essai.getTime() - decalage * 60000);
}

export type ProchainLive = {
  jour: string;
  heure: string;
  jeu: string;
  estAujourdhui: boolean;
  timestamp: string; // date/heure exacte (ISO), pour calculer un compte à rebours
};

// Trouve le prochain live à venir à partir d'UN planning donné
// (celui par défaut, ou celui enregistré via /admin).
export function calculerProchainLive(
  planning: JourPlanning[],
  exceptions: Record<string, { off: boolean; heure?: string; jeu?: string; aVenir?: boolean }> = {}
): ProchainLive | null {
  const maintenant = new Date();

  for (let decalage = 0; decalage < 22; decalage++) {
    const date = new Date(maintenant);
    date.setDate(maintenant.getDate() + decalage);
    const nomJour = JOURS_ORDRE[jourSemaineAParis(date)];

    const habituel = planning.find((p) => p.jour === nomJour);
    const exception = exceptions[anneeMoisJourAParis(date)];
    const jourPlanning: JourPlanning | undefined = exception
      ? exception.off
        ? { jour: nomJour, off: true }
        : { jour: nomJour, off: false, heure: exception.heure || habituel?.heure, jeu: exception.jeu || habituel?.jeu, aVenir: exception.aVenir }
      : habituel;
    // horaires « à venir » : pas de compte à rebours tant que l'heure n'est pas fixée
    if (!jourPlanning || jourPlanning.off || !jourPlanning.heure || jourPlanning.aVenir) continue;

    const { heures, minutes } = parseHeure(jourPlanning.heure);
    const dateLive = dateLiveAParis(date, heures, minutes);

    if (decalage === 0 && dateLive.getTime() < maintenant.getTime()) continue;

    return {
      jour: jourPlanning.jour,
      heure: jourPlanning.heure ?? "",
      jeu: jourPlanning.jeu ?? LABEL_GENERIQUE,
      estAujourdhui: decalage === 0,
      timestamp: dateLive.toISOString(),
    };
  }

  return null;
}
