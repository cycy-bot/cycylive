// <Icone nom="trophee" /> : une icône de la banque Cycylive (couleur = couleur du texte).
// <Pastille nom="trophee" teinte="or" /> : la même, posée sur un carré arrondi teinté (cartes, statistiques…).
import { BANQUE, type NomIcone } from "@/components/icones/banque";

export type { NomIcone } from "@/components/icones/banque";

export default function Icone({ nom, className = "w-5 h-5", titre, style }: { nom: NomIcone; className?: string; titre?: string; style?: React.CSSProperties }) {
  const def = BANQUE[nom];
  if (!def) return null;
  return (
    <svg viewBox="0 0 24 24" style={style} className={`inline-block shrink-0 align-[-0.15em] ${className}`} role={titre ? "img" : undefined} aria-hidden={titre ? undefined : true} aria-label={titre}>
      {def.dessin}
    </svg>
  );
}

export const TEINTES = {
  violet: "text-violet-light bg-violet/15 ring-violet/25",
  lilas: "text-lilac bg-lilac/10 ring-lilac/20",
  rose: "text-rose-300 bg-rose-400/12 ring-rose-300/20",
  or: "text-amber-300 bg-amber-300/12 ring-amber-300/25",
  ciel: "text-sky-300 bg-sky-400/12 ring-sky-300/20",
  vert: "text-emerald-300 bg-emerald-400/12 ring-emerald-300/20",
  indigo: "text-indigo-300 bg-indigo-400/12 ring-indigo-300/20",
  fuchsia: "text-fuchsia-300 bg-fuchsia-400/12 ring-fuchsia-300/20",
} as const;
export type Teinte = keyof typeof TEINTES;

const TAILLES = { xs: ["h-7 w-7 rounded-lg", "w-4 h-4"], sm: ["h-9 w-9 rounded-xl", "w-[18px] h-[18px]"], md: ["h-11 w-11 rounded-xl", "w-6 h-6"], lg: ["h-14 w-14 rounded-2xl", "w-7 h-7"] } as const;

export function Pastille({ nom, teinte = "violet", taille = "md", className = "" }: { nom: NomIcone; teinte?: Teinte; taille?: keyof typeof TAILLES; className?: string }) {
  const [boite, icone] = TAILLES[taille];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ring-1 ${boite} ${TEINTES[teinte]} ${className}`} aria-hidden>
      <Icone nom={nom} className={icone} />
    </span>
  );
}
