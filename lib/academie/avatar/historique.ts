// Historique annuler / rétablir du créateur. Il vit en mémoire
// uniquement : la sauvegarde ne contient que l'état courant, et
// annuler produit simplement un nouvel état courant à enregistrer.

import { useCallback, useRef, useState } from "react";

const LIMITE = 60;
/** Deux modifications d'un même champ à moins de ce délai n'en font qu'une (saisie du prénom...). */
const DELAI_FUSION = 900;

export function useHistorique<T>(valeur: T, onChange: (v: T) => void) {
  const passe = useRef<T[]>([]);
  const futur = useRef<T[]>([]);
  const derniere = useRef<{ cle: string; quand: number } | null>(null);
  // Compteur de rendu : les piles sont dans des refs pour rester stables.
  const [, setVersion] = useState(0);
  const rafraichir = () => setVersion((v) => v + 1);

  const appliquer = useCallback(
    (suivant: T, cleFusion?: string) => {
      const maintenant = Date.now();
      const fusion = cleFusion && derniere.current?.cle === cleFusion && maintenant - derniere.current.quand < DELAI_FUSION;
      if (!fusion) {
        passe.current = [...passe.current, valeur].slice(-LIMITE);
      }
      futur.current = [];
      derniere.current = cleFusion ? { cle: cleFusion, quand: maintenant } : null;
      onChange(suivant);
      rafraichir();
    },
    [valeur, onChange]
  );

  const annuler = useCallback(() => {
    const precedent = passe.current[passe.current.length - 1];
    if (precedent === undefined) return;
    passe.current = passe.current.slice(0, -1);
    futur.current = [valeur, ...futur.current];
    derniere.current = null;
    onChange(precedent);
    rafraichir();
  }, [valeur, onChange]);

  const retablir = useCallback(() => {
    const suivant = futur.current[0];
    if (suivant === undefined) return;
    futur.current = futur.current.slice(1);
    passe.current = [...passe.current, valeur];
    derniere.current = null;
    onChange(suivant);
    rafraichir();
  }, [valeur, onChange]);

  return {
    appliquer,
    annuler,
    retablir,
    peutAnnuler: passe.current.length > 0,
    peutRetablir: futur.current.length > 0,
  };
}
