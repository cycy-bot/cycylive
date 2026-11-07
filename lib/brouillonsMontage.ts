// Brouillons du générateur de contenus : le clip (fichier vidéo) et tout le montage en cours
// (titre, calques, effets, cinématique de fin, coupe…).
// • Copie dans le navigateur (IndexedDB) : reprise immédiate sur le même appareil, même hors ligne.
// • Copie en ligne sur CycyBot (bot.cycylive.fr/api/montages, réservé à l'admin) : le brouillon se retrouve
//   sur tous les appareils et navigateurs. Le clip y va aussi quand le bot a un disque pour les vidéos.

import { CLE_SESSION } from "@/components/admin/communs";

export type BrouillonInfo = {
  id: string;
  nom: string;
  nomFichier: string;
  maj: number;
  duree: number;
  miniature: string; // petite image (data URL)
  etat: Record<string, unknown>;
  cree?: number; // date de création du projet
  archive?: boolean;
  // synchronisation (calculé, pas enregistré)
  ligne?: "local" | "en-ligne" | "partout";
  etatEnLigne?: boolean; // le montage le plus récent est en ligne (à télécharger en reprenant)
  clipLocal?: boolean;
  clipEnLigne?: boolean;
};

const BASE = "cycy-brouillons-montage";
const INFOS = "infos";
const FICHIERS = "fichiers";

function ouvrir(): Promise<IDBDatabase> {
  return new Promise((ok, ko) => {
    if (typeof indexedDB === "undefined") { ko(new Error("Ce navigateur ne permet pas d’enregistrer des brouillons.")); return; }
    const r = indexedDB.open(BASE, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(INFOS)) db.createObjectStore(INFOS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(FICHIERS)) db.createObjectStore(FICHIERS);
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error || new Error("Stockage des brouillons indisponible"));
  });
}

function requete<T>(magasin: string, mode: IDBTransactionMode, faire: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return ouvrir().then((db) => new Promise<T>((ok, ko) => {
    const tx = db.transaction(magasin, mode);
    const r = faire(tx.objectStore(magasin));
    tx.oncomplete = () => { ok(r.result as T); db.close(); };
    tx.onerror = () => { ko(tx.error || r.error); db.close(); };
    tx.onabort = () => { ko(tx.error || new Error("Enregistrement annulé (espace de stockage plein ?)")); db.close(); };
  }));
}

async function listerLocaux(): Promise<BrouillonInfo[]> {
  const l = await requete<BrouillonInfo[]>(INFOS, "readonly", (s) => s.getAll());
  return (l || []).sort((a, b) => b.maj - a.maj);
}

// Le clip est gardé en octets (et non en « fichier ») : sur iPhone/iPad, un fichier choisi dans la galerie
// n'est qu'un lien vers une copie temporaire qui disparaît, et le brouillon ne s'ouvrait plus.
type FichierGarde = { octets: ArrayBuffer; type: string };
async function lireFichierLocal(id: string): Promise<Blob | undefined> {
  const r = await requete<Blob | FichierGarde | undefined>(FICHIERS, "readonly", (s) => s.get(id));
  if (!r) return undefined;
  if (r instanceof Blob) {
    // ancien brouillon : on vérifie que le fichier est encore lisible
    try { const b = await r.arrayBuffer(); return new Blob([b], { type: r.type || "video/mp4" }); }
    catch { throw new Error("le clip de ce brouillon n’est plus lisible (iPhone/iPad : enregistré avant la correction). Réimporte le clip, puis enregistre à nouveau le brouillon"); }
  }
  if (r.octets) return new Blob([r.octets], { type: r.type || "video/mp4" });
  return undefined;
}

async function enregistrerLocal(info: BrouillonInfo, fichier?: Blob) {
  if (fichier) {
    const octets = await fichier.arrayBuffer();
    if (!octets.byteLength) throw new Error("le clip est vide ou illisible");
    const garde: FichierGarde = { octets, type: fichier.type || "video/mp4" };
    await requete(FICHIERS, "readwrite", (s) => s.put(garde, info.id));
  }
  await requete(INFOS, "readwrite", (s) => s.put(info));
  // demande au navigateur de ne pas effacer ces données quand l'espace manque
  try { await navigator.storage?.persist?.(); } catch { /* facultatif */ }
}

async function supprimerLocal(id: string) {
  await requete(INFOS, "readwrite", (s) => s.delete(id));
  await requete(FICHIERS, "readwrite", (s) => s.delete(id));
  await requete(FICHIERS, "readwrite", (s) => s.delete(IDBKeyRange.bound(id + "::", id + "::\uffff"))).catch(() => {});
}
const propre = (b: BrouillonInfo): BrouillonInfo => { const { ligne, etatEnLigne, clipLocal, clipEnLigne, ...r } = b as BrouillonInfo & { clip?: unknown }; void ligne; void etatEnLigne; void clipLocal; void clipEnLigne; delete (r as { clip?: unknown }).clip; return r; };

// ─────────────────────────────────────────────────────────────
//  Copie en ligne (CycyBot)
// ─────────────────────────────────────────────────────────────
const BOT = (process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr").replace(/\/+$/, "");
const MORCEAU = 8 * 1024 * 1024;
function jeton(): string { try { return sessionStorage.getItem(CLE_SESSION) || ""; } catch { return ""; } }
async function api(chemin: string, init: RequestInit = {}): Promise<Response> {
  const j = jeton();
  if (!j) throw new Error("connexion à l’admin introuvable");
  const r = await fetch(BOT + "/api/montages" + chemin, { ...init, headers: { ...(init.headers || {}), Authorization: "Bearer " + j } });
  if (!r.ok) { let m = ""; try { m = (await r.json()).error || ""; } catch { /* pas de détail */ } throw new Error(m || "le bot répond " + r.status); }
  return r;
}
type Distant = { disque: boolean; supprimes: Record<string, number>; brouillons: (Omit<BrouillonInfo, "etat"> & { clip: { taille: number; type: string } | null })[] };

/** Avancement de l'envoi des clips en ligne (pour l'affichage). */
export type EtatEnvoi = { id: string; nom: string; pct: number; fini?: boolean; erreur?: string };
const ecouteurs = new Set<(e: EtatEnvoi) => void>();
export function surEnvoi(fn: (e: EtatEnvoi) => void) { ecouteurs.add(fn); return () => { ecouteurs.delete(fn); }; }
const signaler = (e: EtatEnvoi) => ecouteurs.forEach((f) => { try { f(e); } catch { /* rien */ } });

const envoisEnCours = new Set<string>();
async function envoyerClip(info: BrouillonInfo, fichier: Blob) {
  if (envoisEnCours.has(info.id)) return;
  envoisEnCours.add(info.id);
  try {
    const n = Math.max(1, Math.ceil(fichier.size / MORCEAU));
    for (let i = 0; i < n; i++) {
      signaler({ id: info.id, nom: info.nom, pct: Math.round((i / n) * 100) });
      let essai = 0;
      for (;;) {
        try { await api(`/${info.id}/clip?i=${i}&n=${n}&type=${encodeURIComponent(fichier.type || "video/mp4")}`, { method: "POST", body: fichier.slice(i * MORCEAU, (i + 1) * MORCEAU) }); break; }
        catch (e) { if (++essai >= 3) throw e; await new Promise((r) => setTimeout(r, 1500 * essai)); }
      }
    }
    signaler({ id: info.id, nom: info.nom, pct: 100, fini: true });
  } catch (e) {
    signaler({ id: info.id, nom: info.nom, pct: 0, erreur: e instanceof Error ? e.message : String(e) });
  } finally { envoisEnCours.delete(info.id); }
}
async function envoyerInfo(info: BrouillonInfo): Promise<{ disque: boolean }> {
  const r = await api("/" + info.id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(propre(info)) });
  return r.json();
}
// enregistrements automatiques rapprochés : un seul envoi en ligne toutes les 6 s au plus
const enAttente = new Map<string, { info: BrouillonInfo; t: ReturnType<typeof setTimeout> }>();
function envoyerPlusTard(info: BrouillonInfo) {
  const a = enAttente.get(info.id); if (a) clearTimeout(a.t);
  enAttente.set(info.id, { info, t: setTimeout(() => { enAttente.delete(info.id); envoyerInfo(info).catch(() => { /* réessayé au prochain enregistrement */ }); }, 6000) });
}
if (typeof window !== "undefined") {
  // en quittant la page : on n'attend pas les 6 s
  window.addEventListener("pagehide", () => { for (const { info, t } of enAttente.values()) { clearTimeout(t); try { fetch(BOT + "/api/montages/" + info.id, { method: "PUT", keepalive: true, headers: { "Content-Type": "application/json", Authorization: "Bearer " + jeton() }, body: JSON.stringify(propre(info)) }); } catch { /* rien */ } } enAttente.clear(); });
}

/** Tous les brouillons : ceux de cet appareil et ceux enregistrés ailleurs (en ligne). */
export async function listerBrouillons(): Promise<BrouillonInfo[]> {
  const locaux = await listerLocaux().catch(() => [] as BrouillonInfo[]);
  let d: Distant | null = null;
  try { d = await (await api("")).json(); } catch { d = null; }
  if (!d) return locaux.map((b) => ({ ...b, ligne: "local" as const, clipLocal: true }));
  const out: BrouillonInfo[] = [];
  const parId = new Map(d.brouillons.map((x) => [x.id, x]));
  for (const b of locaux) {
    // supprimé sur un autre appareil
    if (d.supprimes[b.id] && d.supprimes[b.id] >= b.maj) { supprimerLocal(b.id).catch(() => {}); continue; }
    const x = parId.get(b.id);
    if (!x) {
      out.push({ ...b, ligne: "local", clipLocal: true });
      // pas encore en ligne (brouillon d'avant, ou fait hors connexion) : on l'envoie maintenant
      envoyerInfo(b).then(async (r) => { if (r.disque) { const f = await lireFichierLocal(b.id).catch(() => undefined); if (f) envoyerClip(b, f); } }).catch(() => {});
      continue;
    }
    parId.delete(b.id);
    if (x.maj > b.maj) out.push({ ...b, ...x, etat: b.etat, etatEnLigne: true, ligne: "partout", clipLocal: true, clipEnLigne: !!x.clip });
    else {
      out.push({ ...b, ligne: "partout", clipLocal: true, clipEnLigne: !!x.clip });
      if (b.maj > x.maj) envoyerInfo(b).catch(() => {});
    }
    if (!x.clip && d.disque) lireFichierLocal(b.id).then((f) => { if (f) envoyerClip(b, f); }).catch(() => {});
  }
  for (const x of parId.values()) out.push({ ...x, etat: {}, etatEnLigne: true, ligne: "en-ligne", clipLocal: false, clipEnLigne: !!x.clip });
  return out.sort((a, b) => b.maj - a.maj);
}

/** Le montage complet (téléchargé si la version la plus récente a été faite sur un autre appareil). */
export async function lireEtatBrouillon(b: BrouillonInfo): Promise<BrouillonInfo> {
  if (!b.etatEnLigne) return b;
  const x = await (await api("/" + b.id)).json();
  return { ...b, ...x, etat: x.etat || {} };
}

/** Le clip : sur cet appareil, sinon téléchargé depuis la copie en ligne (et gardé ici pour la suite). */
export async function lireFichierBrouillon(id: string, info?: BrouillonInfo): Promise<Blob | undefined> {
  const local = await lireFichierLocal(id).catch(() => undefined);
  if (local) return local;
  try {
    const r = await api("/" + id + "/clip");
    const blob = await r.blob();
    if (info) enregistrerLocal(propre(info), blob).catch(() => {});
    return blob.type ? blob : new Blob([blob], { type: "video/mp4" });
  } catch { return undefined; }
}

/** Enregistre le brouillon ici et en ligne. Le clip n'est fourni qu'une fois par brouillon. */
export async function enregistrerBrouillon(info: BrouillonInfo, fichier?: Blob, { immediat = false } = {}): Promise<{ enLigne: boolean; clipEnLigne?: boolean }> {
  const brut = propre(info);
  let errLocal: unknown = null;
  try { await enregistrerLocal(brut, fichier); } catch (e) { errLocal = e; }
  if (immediat && !fichier) {
    // « Enregistrer » : envoyé en ligne tout de suite (chaque enregistrement compte)
    const a = enAttente.get(info.id); if (a) { clearTimeout(a.t); enAttente.delete(info.id); }
    try { await envoyerInfo(brut); return { enLigne: true }; }
    catch (e) { if (errLocal) throw errLocal; void e; return { enLigne: false }; }
  }
  if (fichier) {
    // premier enregistrement : tout de suite, puis le clip
    try { const r = await envoyerInfo(brut); if (r.disque) envoyerClip(brut, fichier); return { enLigne: true, clipEnLigne: r.disque }; }
    catch (e) { if (errLocal) throw errLocal; return { enLigne: false }; void e; }
  }
  envoyerPlusTard(brut);
  if (errLocal && !jeton()) throw errLocal;
  return { enLigne: true };
}

// ─────────────────────────────────────────────────────────────
//  Médias ajoutés au projet (photos, vidéos, sons) : gardés ici et en ligne, comme le clip
// ─────────────────────────────────────────────────────────────
type MediaGarde = FichierGarde & { enLigne?: boolean };
const cleMedia = (id: string, mid: string) => id + "::" + mid;
const envoisMedias = new Map<string, Promise<boolean>>();

/** Garde un média sur cet appareil (tout de suite) ; il part en ligne au prochain enregistrement du projet. */
export async function garderMedia(id: string, mid: string, fichier: Blob, enLigne = false) {
  const octets = await fichier.arrayBuffer();
  const g: MediaGarde = { octets, type: fichier.type || "application/octet-stream", enLigne };
  await requete(FICHIERS, "readwrite", (s) => s.put(g, cleMedia(id, mid)));
}
/** Le média : sur cet appareil, sinon téléchargé depuis la copie en ligne. */
export async function lireMedia(id: string, mid: string): Promise<Blob | undefined> {
  const r = await requete<MediaGarde | undefined>(FICHIERS, "readonly", (s) => s.get(cleMedia(id, mid))).catch(() => undefined);
  if (r?.octets) return new Blob([r.octets], { type: r.type });
  try {
    const blob = await (await api(`/${id}/media/${mid}`)).blob();
    garderMedia(id, mid, blob, true).catch(() => {});
    return blob;
  } catch { return undefined; }
}
/** Envoie en ligne les médias qui n'y sont pas encore (après l'enregistrement du projet). */
export async function envoyerMedias(id: string, mids: string[], signal?: (fait: number, total: number) => void): Promise<boolean> {
  let tout = true, fait = 0;
  for (const mid of mids) {
    const k = cleMedia(id, mid);
    let p = envoisMedias.get(k);
    if (!p) {
      p = (async () => {
        const r = await requete<MediaGarde | undefined>(FICHIERS, "readonly", (s) => s.get(k)).catch(() => undefined);
        if (!r?.octets) return true; // pas sur cet appareil : il est déjà en ligne (on l'a téléchargé) ou perdu
        if (r.enLigne) return true;
        const b = new Blob([r.octets], { type: r.type }), n = Math.max(1, Math.ceil(b.size / MORCEAU));
        for (let i = 0; i < n; i++) {
          let essai = 0;
          for (;;) {
            try { await api(`/${id}/media/${mid}?i=${i}&n=${n}&type=${encodeURIComponent(r.type)}`, { method: "POST", body: b.slice(i * MORCEAU, (i + 1) * MORCEAU) }); break; }
            catch (e) { if (++essai >= 3) throw e; await new Promise((x) => setTimeout(x, 1500 * essai)); }
          }
        }
        await requete(FICHIERS, "readwrite", (s) => s.put({ ...r, enLigne: true }, k));
        return true;
      })().catch(() => false).finally(() => envoisMedias.delete(k));
      envoisMedias.set(k, p);
    }
    if (!(await p)) tout = false;
    signal?.(++fait, mids.length);
  }
  return tout;
}
/** Copie les médias d'un projet vers un autre (dupliquer). */
export async function copierMedias(de: string, vers: string, mids: string[]) {
  for (const mid of mids) { const b = await lireMedia(de, mid); if (b) await garderMedia(vers, mid, b); }
}

export async function supprimerBrouillon(id: string) {
  const a = enAttente.get(id); if (a) { clearTimeout(a.t); enAttente.delete(id); }
  await supprimerLocal(id).catch(() => {});
  await api("/" + id, { method: "DELETE" }).catch(() => {});
}
