import { textesAcademie } from "@/data/academie/textes";
import Decor from "./art/Decors";

type Props = {
  partieEnCours: boolean;
  onCommencer: () => void;
  onReprendre: () => void;
};

export default function EcranAccueil({ partieEnCours, onCommencer, onReprendre }: Props) {
  const t = textesAcademie.accueil;
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 ada-zoom-lent">
        <Decor id="academie-crepuscule" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,4,15,0.65)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-[rgba(7,6,26,0.7)] to-transparent" />

      <div className="relative flex h-full flex-col items-center px-5 pt-[14vh] text-center sm:pt-[12vh]">
        <p className="ada-petites-capitales ada-monte text-[color:var(--ada-or)]" style={{ animationDelay: "0.2s" }}>
          {t.surtitre}
        </p>
        <h1
          className="ada-titre ada-titre-dore ada-monte mt-3 text-[2.9rem] font-semibold leading-[0.95] sm:text-7xl md:text-8xl"
          style={{ animationDelay: "0.4s" }}
        >
          {t.titre}
        </h1>
        <div className="ada-monte mt-5 flex items-center gap-3 text-[color:var(--ada-or)]" style={{ animationDelay: "0.6s" }} aria-hidden>
          <span className="h-px w-12 bg-current opacity-60" />
          <span>✦</span>
          <span className="h-px w-12 bg-current opacity-60" />
        </div>
        <p className="ada-monte mt-5 max-w-md text-lg italic text-[#f3eee4]/90 sm:text-xl" style={{ animationDelay: "0.8s" }}>
          {t.accroche}
        </p>

        <div className="mt-auto mb-[12vh] flex w-full max-w-xs flex-col gap-3 ada-monte sm:mb-[10vh]" style={{ animationDelay: "1.1s" }}>
          {partieEnCours ? (
            <>
              <button className="ada-bouton ada-bouton-or text-lg" onClick={onReprendre}>
                {t.boutonReprendre}
              </button>
              <button className="ada-bouton ada-bouton-fantome" onClick={onCommencer}>
                {t.boutonNouvelle}
              </button>
            </>
          ) : (
            <button className="ada-bouton ada-bouton-or text-lg" onClick={onCommencer}>
              {t.boutonCommencer}
            </button>
          )}
          <p className="ada-petites-capitales mt-2 text-[0.58rem] text-[#c9c2d8]/80">{t.mention}</p>
        </div>
      </div>
    </div>
  );
}
