// Brouillons du générateur de contenus : le clip (fichier vidéo) et tout le montage en cours
// (titre, calques, effets, cinématique de fin, coupe…) sont gardés dans le navigateur (IndexedDB).
// Rien n'est envoyé sur internet : le brouillon se retrouve sur le même appareil, dans le même navigateur.

export type BrouillonInfo = {
  id: string;
  nom: string;
  nomFichier: string;
  maj: number;
  duree: number;
  miniature: string; // petite image (data URL)
  etat: Record<string, unknown>;
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

export async function listerBrouillons(): Promise<BrouillonInfo[]> {
  const l = await requete<BrouillonInfo[]>(INFOS, "readonly", (s) => s.getAll());
  return (l || []).sort((a, b) => b.maj - a.maj);
}

export function lireFichierBrouillon(id: string): Promise<Blob | undefined> {
  return requete<Blob | undefined>(FICHIERS, "readonly", (s) => s.get(id));
}

/** Enregistre les infos du brouillon ; le fichier vidéo n'est écrit que s'il est fourni (une seule fois par brouillon). */
export async function enregistrerBrouillon(info: BrouillonInfo, fichier?: Blob) {
  if (fichier) await requete(FICHIERS, "readwrite", (s) => s.put(fichier, info.id));
  await requete(INFOS, "readwrite", (s) => s.put(info));
  // demande au navigateur de ne pas effacer ces données quand l'espace manque
  try { await navigator.storage?.persist?.(); } catch { /* facultatif */ }
}

export async function supprimerBrouillon(id: string) {
  await requete(INFOS, "readwrite", (s) => s.delete(id));
  await requete(FICHIERS, "readwrite", (s) => s.delete(id));
}
