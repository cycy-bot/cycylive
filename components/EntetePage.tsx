// En-tête commun des pages : sur-titre, titre, introduction et, au besoin, un sommaire en pastilles.
import Link from "next/link";

export type LienSommaire = { href: string; label: string };

export function Sommaire({ liens, className = "" }: { liens: LienSommaire[]; className?: string }) {
  if (!liens.length) return null;
  return (
    <nav aria-label="Sur cette page" className={`flex flex-wrap gap-2 ${className}`}>
      {liens.map((l) => (
        <a key={l.href} href={l.href} className="rounded-full border border-violet/20 bg-card px-4 py-2 text-sm text-ink-soft hover:text-ink hover:border-violet/50 transition-all">
          {l.label}
        </a>
      ))}
    </nav>
  );
}

export default function EntetePage({
  surtitre,
  titre,
  intro,
  retour,
  sommaire = [],
  children,
  className = "mb-10",
}: {
  surtitre?: string;
  titre: React.ReactNode;
  intro?: React.ReactNode;
  retour?: { href: string; label: string };
  sommaire?: LienSommaire[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={`max-w-3xl ${className}`}>
      {retour && (
        <Link href={retour.href} className="mb-4 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink transition-colors">
          <span aria-hidden>‹</span> {retour.label}
        </Link>
      )}
      {surtitre && <p className="eyebrow text-lilac mb-3">{surtitre}</p>}
      <h1 className="text-4xl md:text-5xl leading-[1.15] font-semibold text-ink glow-text">{titre}</h1>
      {intro && <div className="mt-4 text-lg text-ink-soft leading-relaxed">{intro}</div>}
      {children}
      {sommaire.length > 0 && <Sommaire liens={sommaire} className="mt-6" />}
    </header>
  );
}
