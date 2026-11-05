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

// Le clip est gardé en octets (et non en « fichier ») : sur iPhone/iPad, un fichier choisi dans la galerie
// n'est qu'un lien vers une copie temporaire qui disparaît, et le brouillon ne s'ouvrait plus.
type FichierGarde = { octets: ArrayBuffer; type: string };
export async function lireFichierBrouillon(id: string): Promise<Blob | undefined> {
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

/** Enregistre les infos du brouillon ; le fichier vidéo n'est écrit que s'il est fourni (une seule fois par brouillon). */
export async function enregistrerBrouillon(info: BrouillonInfo, fichier?: Blob) {
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

export async function supprimerBrouillon(id: string) {
  await requete(INFOS, "readwrite", (s) => s.delete(id));
  await requete(FICHIERS, "readwrite", (s) => s.delete(id));
}
