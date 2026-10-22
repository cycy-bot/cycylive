// Carte d'élève : aperçu pendant la création, puis mise à jour
// après la cérémonie avec les couleurs de la maison. Le portrait
// est celui de l'avatar en calques composé dans le créateur.

import { maisons } from "@/data/academie/maisons";
import type { MaisonId, Personnage } from "@/data/academie/types";
import { accordDe, libelleTrait, nomComplet } from "@/lib/academie/texte";
import { normaliserSelection } from "@/lib/academie/avatar/composition";
import Embleme from "./art/Emblemes";
import { PortraitAvatar } from "./avatar/ApercuAvatar";

function numeroEleve(p: Personnage): string {
  let h = 7;
  for (const c of nomComplet(p) || "eleve") h = (h * 31 + c.charCodeAt(0)) % 99991;
  return `AA-${String(h).padStart(5, "0")}`;
}

export default function CarteEleve({ personnage, maison, className }: { personnage: Personnage; maison: MaisonId | null; className?: string }) {
  const m = maison ? maisons[maison] : null;
  const accent = m?.couleurs.principale ?? "#C9CED8";
  const accord = accordDe(personnage);
  const traits = Object.values(personnage.traits);

  return (
    <div
      className={`ada-carte aspect-[1.586] w-full rounded-2xl p-[1px] ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${accent}, rgba(255,255,255,0.15) 40%, ${accent} 70%, rgba(0,0,0,0.3))` }}
    >
      <div
        className="relative flex h-full w-full gap-3 overflow-hidden rounded-[15px] p-3 sm:gap-4 sm:p-4"
        style={{ background: `radial-gradient(ellipse at 85% 0%, ${accent}33, transparent 55%), linear-gradient(160deg, #18143A, #0A0820)` }}
      >
        {/* Constellation décorative */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden>
          <polyline points="200,30 230,55 270,42 295,80 260,110" fill="none" stroke={accent} strokeWidth="0.6" />
          {[[200, 30], [230, 55], [270, 42], [295, 80], [260, 110]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.6" fill="#fff" />
          ))}
        </svg>

        <div className="relative w-[34%] shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: `${accent}66`, background: "linear-gradient(180deg,#2A2150,#120E2A)" }}>
          <PortraitAvatar
            selection={normaliserSelection(personnage.apparence.avatar, personnage.identite)}
            rendu={{ couleurs: { peau: personnage.apparence.peau, yeux: personnage.apparence.yeux, cheveux: personnage.apparence.cheveux, sourcils: personnage.apparence.sourcils }, maison }}
            className="absolute inset-0"
          />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="ada-petites-capitales whitespace-nowrap text-[0.5rem] !tracking-[0.12em] sm:text-[0.58rem]" style={{ color: accent }}>
                Académie des Astres
              </p>
              <p className="ada-petites-capitales whitespace-nowrap text-[0.45rem] !tracking-[0.12em] text-[color:var(--ada-encre-douce)] sm:text-[0.5rem]">Carte d&apos;élève · Année I</p>
            </div>
            {m ? (
              <Embleme maison={m.id} className="h-9 w-8 shrink-0 sm:h-11 sm:w-10" />
            ) : (
              <div className="flex h-9 w-8 items-center justify-center rounded-md border border-dashed border-white/25 text-xs text-white/40 sm:h-11 sm:w-10">?</div>
            )}
          </div>

          <p className="ada-titre mt-1 truncate text-lg leading-tight sm:mt-2 sm:text-2xl">{personnage.prenom.trim() || "Prénom"}</p>

          <div className="mt-auto space-y-1 text-[0.62rem] leading-snug sm:text-xs">
            <p>
              <span className="text-[color:var(--ada-encre-douce)]">Maison · </span>
              <span style={{ color: m ? accent : undefined }}>{m ? m.nom : "en attente de la cérémonie"}</span>
            </p>
            <p className="truncate">
              <span className="text-[color:var(--ada-encre-douce)]">Traits · </span>
              {traits.length ? traits.map((t) => libelleTrait(t, accord)).join(", ") : "à découvrir"}
            </p>
            <p className="font-mono text-[0.55rem] tracking-wider text-[color:var(--ada-encre-douce)] sm:text-[0.62rem]">N° {numeroEleve(personnage)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
