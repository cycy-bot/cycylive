"use client";

// Annuler / rétablir du Studio montage : 1 clic = 1 action. Les gestes continus (glisser un élément, taper un
// texte) comptent pour une seule action. L'historique est gardé jusqu'au prochain « Enregistrer ».
import { useCallback, useRef, useState } from "react";

type Change<T> = T | ((d: T) => T);

export function useHistorique<T>(initial: T) {
  const [doc, setDocBrut] = useState<T>(initial);
  const courant = useRef(initial);
  const passe = useRef<T[]>([]), futur = useRef<T[]>([]);
  const dernier = useRef<{ cle: string; t: number } | null>(null);
  const [version, setVersion] = useState(0); // pour rafraîchir les boutons ↶ ↷
  const [modifie, setModifie] = useState(false);

  const poser = (d: T) => { courant.current = d; setDocBrut(d); };

  /** Change le projet. `fusion` : une clé pour regrouper les changements d'un même geste (glisser, taper…). */
  const changer = useCallback((f: Change<T>, fusion?: string) => {
    const avant = courant.current;
    const apres = typeof f === "function" ? (f as (d: T) => T)(avant) : f;
    if (apres === avant) return;
    const maint = Date.now();
    const meme = fusion && dernier.current && dernier.current.cle === fusion && maint - dernier.current.t < 900;
    if (!meme) { passe.current.push(avant); if (passe.current.length > 150) passe.current.shift(); }
    dernier.current = fusion ? { cle: fusion, t: maint } : null;
    futur.current = [];
    poser(apres); setModifie(true); setVersion((v) => v + 1);
  }, []);
  /** Termine le geste en cours (le prochain changement sera une nouvelle action). */
  const couperGeste = useCallback(() => { dernier.current = null; }, []);
  const annuler = useCallback(() => {
    const d = passe.current.pop(); if (d === undefined) return;
    futur.current.push(courant.current); dernier.current = null;
    poser(d); setModifie(true); setVersion((v) => v + 1);
  }, []);
  const retablir = useCallback(() => {
    const d = futur.current.pop(); if (d === undefined) return;
    passe.current.push(courant.current); dernier.current = null;
    poser(d); setModifie(true); setVersion((v) => v + 1);
  }, []);
  /** Après « Enregistrer » : l'historique repart de zéro (comme demandé). */
  const marquerEnregistre = useCallback(() => { passe.current = []; futur.current = []; dernier.current = null; setModifie(false); setVersion((v) => v + 1); }, []);
  /** Ouvre un autre projet. */
  const reinitialiser = useCallback((d: T) => { passe.current = []; futur.current = []; dernier.current = null; poser(d); setModifie(false); setVersion((v) => v + 1); }, []);
  /** Change sans créer d'étape (réglages automatiques à l'ouverture). */
  const corriger = useCallback((f: Change<T>) => { const avant = courant.current; const apres = typeof f === "function" ? (f as (d: T) => T)(avant) : f; if (apres !== avant) poser(apres); }, []);

  return {
    doc, docRef: courant, changer, couperGeste, annuler, retablir, marquerEnregistre, reinitialiser, corriger, modifie,
    peutAnnuler: passe.current.length > 0, peutRetablir: futur.current.length > 0, nbEtapes: passe.current.length, version,
  };
}
