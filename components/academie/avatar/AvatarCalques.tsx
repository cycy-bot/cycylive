// Rendu des calques de l'avatar. Un seul conteneur porte la
// transformation (cadrage, zoom, déplacement) : tous les calques
// bougent ensemble. Chaque calque garde son image affichée tant que
// la suivante n'est pas décodée, ce qui évite tout flash entre deux
// variantes.

import { memo, useEffect, useRef, useState } from "react";
import type { CategorieCalque } from "@/data/academie/avatar/types";
import { TAILLE_ESPACE } from "@/data/academie/avatar/catalogue";
import type { Calque } from "@/lib/academie/avatar/composition";

type Props = {
  calques: Calque[];
  /** Transformation CSS de l'ensemble (translate + scale, origine 0 0). */
  transform: { x: number; y: number; s: number };
  anime?: boolean;
  onEtat?: (cle: CategorieCalque, etat: "pret" | "erreur") => void;
};

function AvatarCalques({ calques, transform, anime = true, onEtat }: Props) {
  return (
    <div
      className={`ada-avatar-scene${anime ? " ada-avatar-scene--anime" : ""}`}
      style={{
        width: TAILLE_ESPACE,
        height: TAILLE_ESPACE,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.s})`,
      }}
    >
      {calques.map((c, i) => (
        <CalqueStable key={c.cle} calque={c} z={i} onEtat={onEtat} />
      ))}
    </div>
  );
}

export default memo(AvatarCalques);

/** Charge et décode l'image suivante avant de remplacer l'actuelle. */
function CalqueStable({ calque, z, onEtat }: { calque: Calque; z: number; onEtat?: Props["onEtat"] }) {
  const [affiche, setAffiche] = useState<Calque | null>(null);
  const [erreur, setErreur] = useState(false);
  const rappel = useRef(onEtat);
  rappel.current = onEtat;

  useEffect(() => {
    // Même image (seule la position change) : mise à jour immédiate.
    if (affiche?.src === calque.src) {
      if (affiche !== calque) setAffiche(calque);
      return;
    }
    let annule = false;
    const img = new Image();
    img.decoding = "async";
    const pret = () => {
      if (annule) return;
      setErreur(false);
      setAffiche(calque);
      rappel.current?.(calque.cle, "pret");
    };
    img.onload = () => {
      (img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).then(pret);
    };
    img.onerror = () => {
      if (annule) return;
      setErreur(true);
      setAffiche(null);
      rappel.current?.(calque.cle, "erreur");
    };
    img.src = calque.src;
    return () => {
      annule = true;
    };
    // `affiche` volontairement absent : seul le calque demandé déclenche un chargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calque]);

  if (!affiche || erreur) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={affiche.src}
      alt=""
      draggable={false}
      className="ada-avatar-calque"
      style={{
        left: affiche.x,
        top: affiche.y,
        width: affiche.l,
        height: affiche.h,
        zIndex: z,
        WebkitMaskImage: affiche.masque,
        maskImage: affiche.masque,
      }}
    />
  );
}
