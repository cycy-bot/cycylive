import Link from "next/link";
import { lirePartenaires } from "@/lib/partnersStore";
import { lireTextes } from "@/lib/textesStore";
import type { Partenaire } from "@/data/partners";

// Bandeau des partenaires, en bas de la page d'accueil (réglé dans /admin, onglet Partenaires).
// « fixe » : partenaires centrés · « defilant » : boucle continue (pause au survol) · « masque » : caché.
// Chaque logo mène à la fiche du partenaire sur /partenariats.

function Logo({ p }: { p: Partenaire }) {
  if (p.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.logo} alt="" loading="lazy" className="h-10 w-10 md:h-11 md:w-11 rounded-xl object-contain shrink-0" />;
  }
  return (
    <span aria-hidden className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-violet/20 text-lilac font-semibold grid place-items-center shrink-0">
      {p.nom.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function Pastille({ p, reductions, cache = false }: { p: Partenaire; reductions: boolean; cache?: boolean }) {
  return (
    <Link
      href={`/partenariats#partenaire-${p.id}`}
      tabIndex={cache ? -1 : undefined}
      className="group flex items-center gap-3 rounded-2xl border border-violet/15 bg-white/[0.03] px-4 py-2.5 hover:border-violet/45 hover:bg-violet/10 hover:shadow-glow-sm transition-all"
    >
      <Logo p={p} />
      <span className="flex flex-col leading-tight">
        <span className="text-sm md:text-base font-semibold text-ink whitespace-nowrap">{p.nom}</span>
        {reductions && p.reduction && <span className="text-xs text-lilac whitespace-nowrap">{p.reduction}</span>}
      </span>
    </Link>
  );
}

export default async function BandeauPartenaires() {
  const [tous, textes] = await Promise.all([lirePartenaires(), lireTextes()]);
  const reglages = textes.bandeauPartenaires;
  const mode = reglages.mode === "defilant" || reglages.mode === "masque" ? reglages.mode : "fixe";
  const partenaires = tous.filter((p) => p.active && p.dansBandeau !== false);
  if (mode === "masque" || partenaires.length === 0) return null;
  const reductions = reglages.reductions !== "non";

  const lienPage = reglages.lien?.trim() && (
    <Link href="/partenariats" className="text-xs text-lilac hover:text-ink transition-colors whitespace-nowrap">
      {reglages.lien.trim()} →
    </Link>
  );

  if (mode === "fixe") {
    return (
      <section aria-labelledby="bandeau-partenaires-titre" className="border-y border-violet/10 bg-void/40 py-7 md:py-9 mt-4">
        <div className="mx-auto max-w-6xl px-5 md:px-8 text-center">
          {reglages.titre?.trim() && (
            <h2 id="bandeau-partenaires-titre" className="text-xs uppercase tracking-[0.2em] text-ink-soft/60 mb-5">
              {reglages.titre.trim()}
            </h2>
          )}
          <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
            {partenaires.map((p) => (
              <li key={p.id}>
                <Pastille p={p} reductions={reductions} />
              </li>
            ))}
          </ul>
          {lienPage && <div className="mt-5">{lienPage}</div>}
        </div>
      </section>
    );
  }

  // Défilant : on répète la liste pour remplir l'écran, puis on la double pour une boucle sans à-coup
  const tour = Array.from({ length: Math.max(1, Math.ceil(8 / partenaires.length)) }, () => partenaires).flat();
  const duree = Math.max(20, tour.length * 4.5);
  return (
    <section aria-labelledby="bandeau-partenaires-titre" className="border-y border-violet/10 bg-void/40 py-6 md:py-8 mt-4">
      <div className="mx-auto max-w-6xl px-5 md:px-8 mb-4 flex items-center justify-between gap-4">
        <h2 id="bandeau-partenaires-titre" className="text-xs uppercase tracking-[0.2em] text-ink-soft/60">
          {reglages.titre?.trim() || "Partenaires"}
        </h2>
        {lienPage}
      </div>
      <div className="bandeau-partenaires relative overflow-hidden">
        <ul className="bandeau-piste flex w-max" style={{ animationDuration: `${duree}s` }}>
          {[...tour, ...tour].map((p, i) => {
            const cache = i >= partenaires.length;
            return (
              <li key={`${p.id}-${i}`} aria-hidden={cache || undefined} className="shrink-0 pr-4">
                <Pastille p={p} reductions={reductions} cache={cache} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
