// Rendu des calques de l'avatar. Un seul conteneur porte la
// transformation (cadrage, zoom, déplacement) : tous les calques
// bougent ensemble. Chaque calque garde son image affichée tant que
// la suivante n'est pas décodée, ce qui évite tout flash entre deux
// variantes.

import { memo, useEffect, useRef, useState } from "react";
import type { CategorieCalque } from "@/data/academie/avatar/types";
import { TAILLE_ESPACE, racineAssets } from "@/data/academie/avatar/catalogue";
import type { Calque } from "@/lib/academie/avatar/composition";
import { imageTeintee } from "@/lib/academie/avatar/teinte";

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
        <CalqueStable key={c.id ?? c.cle} calque={c} z={i} onEtat={onEtat} />
      ))}
    </div>
  );
}

export default memo(AvatarCalques);

/** Charge et décode l'image suivante avant de remplacer l'actuelle. */
type Affiche = Calque & { url: string; cleImage: string };
const cleImageDe = (c: Calque) => c.src + (c.teinte ? "|" + JSON.stringify(c.teinte) : "");

function CalqueStable({ calque, z, onEtat }: { calque: Calque; z: number; onEtat?: Props["onEtat"] }) {
  const [affiche, setAffiche] = useState<Affiche | null>(null);
  const [erreur, setErreur] = useState(false);
  const rappel = useRef(onEtat);
  rappel.current = onEtat;

  useEffect(() => {
    const cleImage = cleImageDe(calque);
    // Même image (seule la position change) : mise à jour immédiate.
    if (affiche?.cleImage === cleImage) {
      setAffiche({ ...calque, url: affiche.url, cleImage });
      return;
    }
    let annule = false;
    const echec = () => {
      if (annule) return;
      setErreur(true);
      setAffiche(null);
      rappel.current?.(calque.cle, "erreur");
    };
    // Image teintée (couleurs de l'apparence) préparée hors écran, puis décodée avant affichage.
    imageTeintee(calque.src, calque.teinte, racineAssets).then((url) => {
      if (annule) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        (img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).then(() => {
          if (annule) return;
          setErreur(false);
          setAffiche({ ...calque, url, cleImage });
          rappel.current?.(calque.cle, "pret");
        });
      };
      img.onerror = echec;
      img.src = url;
    }, echec);
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
      src={affiche.url}
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
