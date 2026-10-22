// Calcul de la maison à partir des réponses de la cérémonie.
// La grille et la règle de départage sont documentées en tête de
// data/academie/maisons.ts.

import { ordreMaisons, questionCoeurId, questionsCeremonie } from "@/data/academie/maisons";
import type { MaisonId, QuestionCeremonie } from "@/data/academie/types";

/** Réponses du joueur : questionId -> reponseId. */
export type ReponsesCeremonie = Record<string, string>;

export type ResultatCeremonie = {
  maison: MaisonId;
  totaux: Record<MaisonId, number>;
  /** Critère qui a fait la différence, pour l'affichage de démo. */
  departage: "total" | "coeur" | "franches" | "recente" | "ordre";
};

const zero = (): Record<MaisonId, number> => ({ lion: 0, cygne: 0, dragon: 0 });

function pointsDe(question: QuestionCeremonie, reponseId: string | undefined) {
  return question.reponses.find((r) => r.id === reponseId)?.points ?? {};
}

export function calculerMaison(
  reponses: ReponsesCeremonie,
  questions: QuestionCeremonie[] = questionsCeremonie
): ResultatCeremonie {
  const totaux = zero();
  const coeur = zero();
  const franches = zero();
  const parQuestion: Record<MaisonId, number>[] = [];

  for (const question of questions) {
    const points = pointsDe(question, reponses[question.id]);
    const ligne = zero();
    const maisonsTouchees = Object.keys(points) as MaisonId[];
    for (const m of maisonsTouchees) {
      const p = points[m] ?? 0;
      totaux[m] += p;
      ligne[m] = p;
      if (question.id === questionCoeurId) coeur[m] += p;
    }
    if (maisonsTouchees.length === 1) franches[maisonsTouchees[0]] += 1;
    parQuestion.push(ligne);
  }

  // Départage successif : on ne garde que les maisons à égalité.
  let candidates = [...ordreMaisons];
  const garderMeilleures = (score: (m: MaisonId) => number) => {
    const max = Math.max(...candidates.map(score));
    candidates = candidates.filter((m) => score(m) === max);
    return candidates.length === 1;
  };

  if (garderMeilleures((m) => totaux[m])) return { maison: candidates[0], totaux, departage: "total" };
  if (garderMeilleures((m) => coeur[m])) return { maison: candidates[0], totaux, departage: "coeur" };
  if (garderMeilleures((m) => franches[m])) return { maison: candidates[0], totaux, departage: "franches" };
  for (let i = parQuestion.length - 1; i >= 0; i--) {
    if (garderMeilleures((m) => parQuestion[i][m])) return { maison: candidates[0], totaux, departage: "recente" };
  }
  return { maison: candidates[0], totaux, departage: "ordre" };
}

/** Score maximal atteignable par une maison avec la grille actuelle. */
export function pointsMax(maison: MaisonId, questions: QuestionCeremonie[] = questionsCeremonie): number {
  return questions.reduce((total, q) => total + Math.max(0, ...q.reponses.map((r) => r.points[maison] ?? 0)), 0);
}

export const libellesDepartage: Record<ResultatCeremonie["departage"], string> = {
  total: "Total de points le plus élevé.",
  coeur: "Égalité départagée par la dernière vision, « Le Cœur ».",
  franches: "Égalité départagée par le nombre de réponses franches.",
  recente: "Égalité départagée par la vision la plus récente.",
  ordre: "Égalité départagée par l'ordre fixe des maisons.",
};
