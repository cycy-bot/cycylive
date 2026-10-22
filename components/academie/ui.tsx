// Petits éléments d'interface partagés par les écrans de l'Académie.

import Link from "next/link";
import { useState, type ReactNode } from "react";

export function Icone({ nom, className }: { nom: "menu" | "historique" | "eclair" | "fermer" | "retour" | "recommencer" | "maison"; className?: string }) {
  const traits: Record<string, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    historique: <path d="M12 8v4l3 2M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v4h4" />,
    eclair: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
    fermer: <path d="M6 6l12 12M18 6L6 18" />,
    retour: <path d="M15 5l-7 7 7 7" />,
    recommencer: <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />,
    maison: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className ?? "h-5 w-5"} aria-hidden>
      {traits[nom]}
    </svg>
  );
}

export function BoutonIcone({ onClick, label, children, actif }: { onClick: () => void; label: string; children: ReactNode; actif?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      aria-pressed={actif}
      className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
        actif ? "border-[color:var(--ada-or)] bg-[rgba(217,178,94,0.2)] text-[color:var(--ada-or-clair)]" : "border-white/15 bg-black/35 text-[color:var(--ada-encre)] hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export function Modale({ titre, children, onFermer }: { titre: string; children: ReactNode; onFermer: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 ada-fondu" onClick={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        className="ada-panneau ada-coins w-full max-w-md rounded-2xl p-6 ada-monte"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="ada-titre mb-3 text-2xl text-[color:var(--ada-or-clair)]">{titre}</h2>
        {children}
      </div>
    </div>
  );
}

/** Menu discret en haut d'écran : badge prototype, recommencer, quitter. */
export function MenuDemo({ onRecommencer, autresActions }: { onRecommencer: () => void; autresActions?: { label: string; action: () => void }[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [confirmer, setConfirmer] = useState(false);
  return (
    <>
      <div className="relative">
        <BoutonIcone label="Menu" onClick={() => setOuvert((o) => !o)} actif={ouvert}>
          <Icone nom="menu" />
        </BoutonIcone>
        {ouvert && (
          <div className="ada-panneau absolute right-0 top-12 z-[110] w-64 overflow-hidden rounded-xl py-2 text-sm ada-monte" style={{ animationDuration: "0.2s" }}>
            {autresActions?.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  setOuvert(false);
                  a.action();
                }}
                className="block w-full px-4 py-3 text-left hover:bg-white/5"
              >
                {a.label}
              </button>
            ))}
            <button
              onClick={() => {
                setOuvert(false);
                setConfirmer(true);
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-white/5"
            >
              <Icone nom="recommencer" className="h-4 w-4" /> Recommencer toute la démo
            </button>
            <Link href="/" className="flex items-center gap-2 px-4 py-3 text-[color:var(--ada-encre-douce)] hover:bg-white/5">
              <Icone nom="maison" className="h-4 w-4" /> Retour au site Cycylive
            </Link>
          </div>
        )}
      </div>
      {confirmer && (
        <Modale titre="Recommencer la démo ?" onFermer={() => setConfirmer(false)}>
          <p className="mb-6 text-[color:var(--ada-encre-douce)]">
            Ton personnage, ta maison et tes choix seront effacés. Tu repartiras de l&apos;écran d&apos;accueil.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <button className="ada-bouton ada-bouton-fantome" onClick={() => setConfirmer(false)}>
              Annuler
            </button>
            <button
              className="ada-bouton ada-bouton-or"
              onClick={() => {
                setConfirmer(false);
                onRecommencer();
              }}
            >
              Recommencer
            </button>
          </div>
        </Modale>
      )}
    </>
  );
}

export function BadgePrototype() {
  return (
    <span className="ada-badge-prototype ada-petites-capitales rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[0.62rem] text-[color:var(--ada-encre-douce)] backdrop-blur-md">
      Prototype · démo
    </span>
  );
}
