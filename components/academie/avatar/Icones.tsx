// Icônes au trait du créateur de personnage (24 × 24, trait 1.7).

import type { ReactNode } from "react";

const traits: Record<string, ReactNode> = {
  identite: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  visage: (
    <>
      <path d="M12 3.5c-4 0-6.5 3-6.5 7.2 0 4.6 3 8.8 6.5 8.8s6.5-4.2 6.5-8.8C18.5 6.5 16 3.5 12 3.5z" />
      <path d="M9.5 15.5c1.4 1 3.6 1 5 0" />
    </>
  ),
  yeux: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  sourcils: (
    <>
      <path d="M3.5 11c2-2.6 5-3.2 7.5-2" />
      <path d="M20.5 11c-2-2.6-5-3.2-7.5-2" />
      <path d="M5 15.5h5M14 15.5h5" opacity={0.5} />
    </>
  ),
  nez: <path d="M12.5 4c-.3 4-1.6 7.5-3.6 10.4-.6.9 0 2 1 2.1 1.6.2 3.2-.2 4.4-1" />,
  bouche: (
    <>
      <path d="M4 12c2.4-2.4 5-3 8-1.6 3-1.4 5.6-.8 8 1.6-2.6 3.4-5.2 4.8-8 4.8S6.6 15.4 4 12z" />
      <path d="M4 12h16" />
    </>
  ),
  cheveux: (
    <>
      <path d="M5 19c-1.2-6.3.4-14 7-14s8.2 7.7 7 14" />
      <path d="M8 9.5c2 .8 5.5.6 8.5-2" />
    </>
  ),
  tenue: (
    <>
      <path d="M8.5 3.5 12 7l3.5-3.5 4 2 1.5 5-3 1.2V20.5H6V11.7L3 10.5l1.5-5z" />
      <path d="M12 7v13.5" />
    </>
  ),
  caractere: <path d="M12 3.5l2.3 5.2 5.7.5-4.3 3.8 1.3 5.6L12 15.7l-5 2.9 1.3-5.6L4 9.2l5.7-.5z" />,
  recapitulatif: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  loupe: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  moins: <path d="M5 12h14" />,
  recentrer: (
    <>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  pleinEcran: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  quitterPleinEcran: <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />,
  de: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <circle cx="8.6" cy="8.6" r="0.9" fill="currentColor" />
      <circle cx="15.4" cy="8.6" r="0.9" fill="currentColor" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
      <circle cx="8.6" cy="15.4" r="0.9" fill="currentColor" />
      <circle cx="15.4" cy="15.4" r="0.9" fill="currentColor" />
    </>
  ),
  annuler: <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  retablir: <path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />,
  reinitialiser: <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />,
  coche: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  suivant: <path d="m9 5 7 7-7 7" />,
  precedent: <path d="m15 5-7 7 7 7" />,
  portrait: (
    <>
      <circle cx="12" cy="9" r="4" />
      <path d="M5 20.5c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5" />
    </>
  ),
  pleinPied: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M8.5 9.5h7l-1 6h-5zM10 15.5l-.5 5M14 15.5l.5 5" />
    </>
  ),
  attention: <path d="M12 4 2.8 19.5h18.4zM12 10v4.5M12 17v.1" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.8v.1" />
    </>
  ),
};

export default function IconeCreateur({ nom, className }: { nom: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
      {traits[nom] ?? traits.info}
    </svg>
  );
}
