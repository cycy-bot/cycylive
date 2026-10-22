import { useEffect, useState } from "react";
import { introCeremonie, questionsCeremonie } from "@/data/academie/maisons";
import { textesAcademie } from "@/data/academie/textes";
import type { ReponsesCeremonie } from "@/lib/academie/ceremonie";
import Decor from "./art/Decors";
import { Icone } from "./ui";

type Props = {
  reponses: ReponsesCeremonie;
  /** 0 = introduction, 1..n = questions. */
  position: number;
  onPosition: (n: number) => void;
  onRepondre: (questionId: string, reponseId: string) => void;
  onRetourCreation: () => void;
  onTerminer: () => void;
};

const ROMAINS = ["I", "II", "III", "IV"];

export default function Ceremonie({ reponses, position, onPosition, onRepondre, onRetourCreation, onTerminer }: Props) {
  const [delibere, setDelibere] = useState(false);
  const question = position > 0 ? questionsCeremonie[position - 1] : null;

  useEffect(() => {
    if (!delibere) return;
    const t = setTimeout(onTerminer, 2200);
    return () => clearTimeout(t);
  }, [delibere, onTerminer]);

  const repondre = (reponseId: string) => {
    if (!question) return;
    onRepondre(question.id, reponseId);
    if (position < questionsCeremonie.length) onPosition(position + 1);
    else setDelibere(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <Decor id="salle-astrolabe" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,26,0.25)_0%,rgba(7,6,26,0.55)_45%,rgba(7,6,26,0.92)_100%)]" />

      {delibere ? (
        <button type="button" onClick={onTerminer} className="absolute inset-0 flex flex-col items-center justify-center gap-4 ada-fondu">
          <div className="h-20 w-20 rounded-full border-2 border-[color:var(--ada-or)] border-t-transparent ada-rotation-lente" style={{ animationDuration: "1.4s" }} />
          <p className="ada-titre text-3xl text-[color:var(--ada-or-clair)]">{textesAcademie.ceremonie.deliberation}</p>
          <p className="text-sm text-[color:var(--ada-encre-douce)]">Touchez pour passer</p>
        </button>
      ) : (
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-20 sm:px-6 sm:pb-10">
          {/* Progression : quatre étoiles */}
          <div className="mb-auto flex items-center justify-center gap-3 pt-2" aria-label={`Vision ${Math.max(position, 0)} sur ${questionsCeremonie.length}`}>
            {questionsCeremonie.map((q, i) => {
              const faite = !!reponses[q.id];
              const active = position === i + 1;
              return (
                <span
                  key={q.id}
                  className={`text-lg transition-all ${active ? "scale-125 text-[color:var(--ada-or-clair)]" : faite ? "text-[color:var(--ada-or)]" : "text-white/25"}`}
                >
                  ✦
                </span>
              );
            })}
          </div>

          <div key={position} className="ada-panneau ada-coins ada-monte max-h-[70%] overflow-y-auto rounded-2xl p-5 ada-defilement sm:p-7">
            {question ? (
              <>
                <p className="ada-petites-capitales text-[0.62rem] text-[color:var(--ada-or)]">{question.titre}</p>
                <p className="mt-3 text-lg leading-relaxed sm:text-xl">{question.situation}</p>
                <div className="mt-5 space-y-2.5">
                  {question.reponses.map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => repondre(r.id)}
                      className={`ada-choix ada-monte ${reponses[question.id] === r.id ? "ada-choix-selectionne" : ""}`}
                      style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                    >
                      <span className="ada-choix-numero">{ROMAINS[i]}</span>
                      {r.texte}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="ada-titre ada-titre-dore text-3xl sm:text-4xl">{introCeremonie.titre}</h2>
                <p className="mt-4 text-lg leading-relaxed sm:text-xl">{introCeremonie.texte}</p>
                <button type="button" className="ada-bouton ada-bouton-or mt-6 w-full sm:w-auto" onClick={() => onPosition(1)}>
                  Approcher de l&apos;Astrolabe
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => (position <= 0 ? onRetourCreation() : onPosition(position - 1))}
            className="mt-3 flex items-center gap-1 self-start rounded-full px-3 py-2 text-sm text-[color:var(--ada-encre-douce)] hover:text-[color:var(--ada-encre)]"
          >
            <Icone nom="retour" className="h-4 w-4" />
            {position <= 0 ? "Modifier mon personnage" : "Vision précédente"}
          </button>
        </div>
      )}
    </div>
  );
}
