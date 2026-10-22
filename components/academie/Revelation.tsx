import { useState } from "react";
import { maisons, ordreMaisons } from "@/data/academie/maisons";
import { textesAcademie } from "@/data/academie/textes";
import type { Personnage } from "@/data/academie/types";
import { libellesDepartage, pointsMax, type ResultatCeremonie } from "@/lib/academie/ceremonie";
import Embleme from "./art/Emblemes";
import Decor from "./art/Decors";
import CarteEleve from "./CarteEleve";

type Props = {
  personnage: Personnage;
  resultat: ResultatCeremonie;
  onContinuer: () => void;
  onRefaire: () => void;
};

export default function Revelation({ personnage, resultat, onContinuer, onRefaire }: Props) {
  const m = maisons[resultat.maison];
  const [details, setDetails] = useState(false);
  const c = m.couleurs;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ ["--ada-accent" as string]: c.principale }}>
      <div className="absolute inset-0 opacity-60">
        <Decor id="salle-astrolabe" />
      </div>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 28%, ${c.principale}40, rgba(7,6,26,0.85) 55%, rgba(5,4,15,0.97))` }} />

      {/* Rayons */}
      <div className="pointer-events-none absolute left-1/2 top-[22%] h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2">
        <div
          className="ada-rayons h-full w-full rounded-full"
          style={{ background: `repeating-conic-gradient(from 0deg, ${c.claire}22 0deg 4deg, transparent 4deg 18deg)`, maskImage: "radial-gradient(circle, black 0%, transparent 45%)", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 45%)" }}
        />
      </div>

      <div className="ada-defilement relative h-full overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-12 pt-20 text-center md:pt-16">
          <p className="ada-petites-capitales ada-monte text-[0.65rem]" style={{ color: c.claire }}>
            {textesAcademie.revelation.surtitre}
          </p>
          <Embleme maison={m.id} className="ada-embleme mt-4 h-40 w-36 drop-shadow-[0_0_40px_rgba(255,220,150,0.25)] sm:h-52 sm:w-44" />
          <h1 className="ada-titre ada-monte mt-4 text-5xl font-semibold sm:text-6xl" style={{ color: c.claire, animationDelay: "0.9s", textShadow: `0 0 30px ${c.principale}66` }}>
            {m.nom}
          </h1>
          <p className="ada-titre ada-monte mt-2 text-xl italic sm:text-2xl" style={{ animationDelay: "1.1s" }}>
            « {m.devise} »
          </p>

          <div className="mt-8 grid w-full gap-6 text-left md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className="ada-panneau ada-coins ada-monte rounded-2xl p-6" style={{ animationDelay: "1.3s" }}>
              <p className="text-lg leading-relaxed">{m.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {m.valeurs.map((v) => (
                  <span key={v} className="ada-petites-capitales rounded-full border px-3 py-1 text-[0.6rem]" style={{ borderColor: `${c.principale}88`, color: c.claire }}>
                    {v}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <span className="ada-petites-capitales text-[0.58rem] text-[color:var(--ada-encre-douce)]">Couleurs</span>
                {[c.principale, c.claire, c.sombre, c.secondaire].map((couleur) => (
                  <span key={couleur} className="h-6 w-6 rounded-full border border-white/20" style={{ background: couleur }} title={couleur} />
                ))}
              </div>
            </div>
            <div className="ada-monte mx-auto w-full max-w-[420px]" style={{ animationDelay: "1.5s" }}>
              <p className="ada-petites-capitales mb-2 text-center text-[0.6rem] text-[color:var(--ada-encre-douce)]">Carte d&apos;élève mise à jour</p>
              <CarteEleve personnage={personnage} maison={m.id} />
            </div>
          </div>

          <div className="ada-monte mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center" style={{ animationDelay: "1.7s" }}>
            <button type="button" className="ada-bouton ada-bouton-or w-full sm:w-auto" onClick={onContinuer}>
              {textesAcademie.revelation.boutonScene}
            </button>
            <button type="button" className="ada-bouton ada-bouton-fantome w-full sm:w-auto" onClick={onRefaire}>
              {textesAcademie.revelation.boutonRefaire}
            </button>
          </div>

          <button type="button" onClick={() => setDetails((d) => !d)} className="mt-6 text-sm text-[color:var(--ada-encre-douce)] underline decoration-dotted underline-offset-4">
            {details ? "Masquer" : "Afficher"} le détail du test (outil de démo)
          </button>
          {details && (
            <div className="ada-panneau mt-3 w-full max-w-md rounded-xl p-4 text-left text-sm ada-fondu">
              {ordreMaisons.map((id) => (
                <div key={id} className="mb-2 flex items-center gap-3">
                  <span className="w-36">{maisons[id].nom}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${(resultat.totaux[id] / pointsMax(id)) * 100}%`, background: maisons[id].couleurs.principale }} />
                  </div>
                  <span className="w-10 text-right font-mono">{resultat.totaux[id]}/{pointsMax(id)}</span>
                </div>
              ))}
              <p className="mt-2 text-xs text-[color:var(--ada-encre-douce)]">{libellesDepartage[resultat.departage]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
