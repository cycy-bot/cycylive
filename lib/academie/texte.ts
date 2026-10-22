// Interpolation des textes narratifs : prénom, pronoms, accords,
// maison. Les balises inconnues sont laissées telles quelles pour
// être repérées facilement pendant l'écriture.

import { maisons } from "@/data/academie/maisons";
import { pronoms, traits } from "@/data/academie/personnalisation";
import type { Accord, MaisonId, Personnage, TraitId } from "@/data/academie/types";

export type ContexteTexte = {
  personnage: Personnage;
  maison: MaisonId | null;
};

export function accordDe(personnage: Personnage): Accord {
  return pronoms[personnage.pronoms].accord;
}

const indexAccord: Record<Accord, number> = { m: 0, f: 1, n: 2 };

export function libelleTrait(trait: TraitId, accord: Accord): string {
  return traits[trait].libelle[indexAccord[accord]];
}

function majuscule(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function nomComplet(p: Personnage): string {
  return [p.prenom.trim(), p.nom.trim()].filter(Boolean).join(" ");
}

export function interpoler(texte: string, ctx: ContexteTexte): string {
  const { personnage, maison } = ctx;
  const accord = accordDe(personnage);
  const sujet = personnage.pronoms;

  return texte.replace(/\{([^{}]+)\}/g, (balise, contenu: string) => {
    if (contenu.startsWith("g:")) {
      const formes = contenu.slice(2).split("|");
      return formes[indexAccord[accord]] ?? formes[0] ?? "";
    }
    switch (contenu) {
      case "prenom":
        return personnage.prenom.trim() || "Élève";
      case "nom":
        return personnage.nom.trim();
      case "prenomNom":
        return nomComplet(personnage) || "Élève";
      case "il":
        return sujet;
      case "Il":
        return majuscule(sujet);
      case "e":
        return accord === "m" ? "" : accord === "f" ? "e" : "·e";
      case "maison":
        return maison ? maisons[maison].animal : "";
      case "Maison":
        return maison ? maisons[maison].nom : "";
      default:
        return balise;
    }
  });
}
