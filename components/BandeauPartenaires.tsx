import Link from "next/link";
import { lirePartenaires } from "@/lib/partnersStore";
import type { Partenaire } from "@/data/partners";

// Bandeau défilant des partenaires, en bas de la page d'accueil.
// Chaque logo mène à la fiche du partenaire sur /partenariats.
// Défilement en boucle (pause au survol), statique si l'animation est réduite.

function Logo({ p }: { p: Partenaire }) {
  if (p.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.logo} alt="" loading="lazy" className="h-9 w-9 md:h-10 md:w-10 rounded-xl object-contain shrink-0" />;
  }
  return (
    <span aria-hidden className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-violet/20 text-lilac font-semibold grid place-items-center shrink-0">
      {p.nom.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function Element({ p, cache = false }: { p: Partenaire; cache?: boolean }) {
  return (
    <li aria-hidden={cache || undefined} className="shrink-0 pr-4">
      <Link
        href={`/partenariats#partenaire-${p.id}`}
        tabIndex={cache ? -1 : undefined}
        className="group flex items-center gap-3 rounded-2xl border border-violet/15 bg-white/[0.03] px-4 py-2.5 hover:border-violet/45 hover:bg-violet/10 transition-colors"
      >
        <Logo p={p} />
        <span className="flex flex-col leading-tight">
          <span className="text-sm md:text-base font-semibold text-ink whitespace-nowrap">{p.nom}</span>
          {p.reduction && <span className="text-xs text-lilac whitespace-nowrap">{p.reduction}</span>}
        </span>
      </Link>
    </li>
  );
}

export default async function BandeauPartenaires() {
  const partenaires = (await lirePartenaires()).filter((p) => p.active);
  if (partenaires.length === 0) return null;

  // On répète la liste pour remplir largement l'écran, puis on la double pour une boucle sans à-coup
  const tour = Array.from({ length: Math.max(1, Math.ceil(8 / partenaires.length)) }, () => partenaires).flat();
  const duree = Math.max(20, tour.length * 4.5);

  return (
    <section aria-labelledby="bandeau-partenaires-titre" className="border-y border-violet/10 bg-void/40 py-6 md:py-8 mt-4">
      <div className="mx-auto max-w-6xl px-5 md:px-8 mb-4 flex items-center justify-between gap-4">
        <h2 id="bandeau-partenaires-titre" className="text-xs uppercase tracking-[0.2em] text-ink-soft/60">
          Ils accompagnent la chaîne
        </h2>
        <Link href="/partenariats" className="text-xs text-lilac hover:text-ink transition-colors whitespace-nowrap">
          Voir les partenaires →
        </Link>
      </div>

      <div className="bandeau-partenaires relative overflow-hidden">
        <ul className="bandeau-piste flex w-max" style={{ animationDuration: `${duree}s` }}>
          {tour.map((p, i) => (
            <Element key={`a-${p.id}-${i}`} p={p} cache={i >= partenaires.length} />
          ))}
          {tour.map((p, i) => (
            <Element key={`b-${p.id}-${i}`} p={p} cache />
          ))}
        </ul>
      </div>
    </section>
  );
}
