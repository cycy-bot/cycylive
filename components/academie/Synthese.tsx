import { maisons } from "@/data/academie/maisons";
import { personnages } from "@/data/academie/personnages";
import type { PersoId, Scene } from "@/data/academie/types";
import type { ContexteJeu, EtatScene } from "@/lib/academie/moteur";
import { interpoler } from "@/lib/academie/texte";
import Decor from "./art/Decors";
import Portrait from "./art/Portrait";
import CarteEleve from "./CarteEleve";

type Props = {
  scene: Scene;
  etat: EtatScene;
  ctx: ContexteJeu;
  onRejouerScene: () => void;
  onRefaireCeremonie: () => void;
  onRecommencerDemo: () => void;
};

const BORNE = 5;

function humeur(valeur: number): string {
  if (valeur >= 4) return "Complicité naissante";
  if (valeur >= 2) return "Bonne impression";
  if (valeur >= 1) return "Sympathie";
  if (valeur === 0) return "Neutre";
  return "Un peu piqué·e";
}

export default function Synthese({ scene, etat, ctx, onRejouerScene, onRefaireCeremonie, onRecommencerDemo }: Props) {
  const suivis = (Object.keys(personnages) as PersoId[]).filter((p) => personnages[p].relationSuivie);
  const consequences = Object.keys(etat.drapeaux)
    .filter((d) => etat.drapeaux[d] && scene.drapeaux?.[d])
    .map((d) => interpoler(scene.drapeaux![d], ctx));
  const accent = ctx.maison ? maisons[ctx.maison].couleurs.principale : "#D9B25E";

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ ["--ada-accent" as string]: accent }}>
      <div className="absolute inset-0 opacity-70">
        <Decor id="academie-crepuscule" />
      </div>
      <div className="absolute inset-0 bg-[rgba(7,6,26,0.78)]" />

      <div className="ada-defilement relative h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-20">
          <p className="ada-petites-capitales text-center text-[0.62rem] text-[color:var(--ada-or)]">Fin de la démonstration</p>
          <h1 className="ada-titre ada-titre-dore mt-2 text-center text-4xl sm:text-5xl">Bilan de ta première journée</h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm italic text-[color:var(--ada-encre-douce)]">
            Scène de test non canonique — elle sert uniquement à évaluer le système de choix et de relations.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="ada-panneau ada-coins ada-monte rounded-2xl p-6">
              <h2 className="ada-titre text-2xl">Tes décisions</h2>
              <ol className="mt-4 space-y-4">
                {etat.decisions.map((d, i) => (
                  <li key={d.choixId}>
                    <p className="ada-petites-capitales text-[0.58rem] text-[color:var(--ada-encre-douce)]">
                      Décision {i + 1} · {d.question}
                    </p>
                    <p className="mt-1">{d.texte}</p>
                    {d.note && <p className="mt-0.5 text-sm italic text-[color:var(--ada-or-clair)]">✦ {interpoler(d.note, ctx)}</p>}
                  </li>
                ))}
              </ol>
            </section>

            <section className="ada-panneau ada-coins ada-monte rounded-2xl p-6" style={{ animationDelay: "0.15s" }}>
              <h2 className="ada-titre text-2xl">Relations</h2>
              <div className="mt-4 space-y-5">
                {suivis.map((p) => {
                  const v = etat.relations[p];
                  const pourcent = Math.max(0, Math.min(100, ((v + BORNE) / (BORNE * 2)) * 100));
                  return (
                    <div key={p} className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#1E1838]">
                        <Portrait apparence={personnages[p].apparence} expression={v > 0 ? "sourire" : v < 0 ? "pensif" : "neutre"} cadrage="tete" className="h-full w-full" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="ada-titre text-xl">{personnages[p].nom}</span>
                          <span className="text-sm" style={{ color: v > 0 ? "#9BE3B6" : v < 0 ? "#F0A0A0" : undefined }}>
                            {v > 0 ? "+" : ""}
                            {v} · {humeur(v)}
                          </span>
                        </div>
                        <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                          <div className="h-full rounded-full bg-gradient-to-r from-[#6B4BB8] to-[#F3D489] transition-all" style={{ width: `${pourcent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {consequences.length > 0 && (
                <>
                  <h3 className="ada-titre mt-7 text-xl">Conséquences</h3>
                  <ul className="mt-2 space-y-1.5 text-[color:var(--ada-encre-douce)]">
                    {consequences.map((c) => (
                      <li key={c}>✦ {c}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <div className="mx-auto mt-8 max-w-[420px]">
            <CarteEleve personnage={ctx.personnage} maison={ctx.maison} />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button type="button" className="ada-bouton ada-bouton-or w-full sm:w-auto" onClick={onRejouerScene}>
              Rejouer la scène
            </button>
            <button type="button" className="ada-bouton ada-bouton-fantome w-full sm:w-auto" onClick={onRefaireCeremonie}>
              Refaire la cérémonie
            </button>
            <button type="button" className="ada-bouton ada-bouton-fantome w-full sm:w-auto" onClick={onRecommencerDemo}>
              Recommencer toute la démo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
