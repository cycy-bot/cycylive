import { lireSetup } from "@/lib/setupStore";
import type { GroupeSetup, ItemSetup } from "@/data/setup";
import { IconeMateriel, TYPES_MATERIEL } from "@/components/setup/IconesSetup";
import Icone from "@/components/icones/Icone";

// ============================================================
// SETUP — page À propos
// ============================================================
// Le PC en « fiche technique » (pièces maîtresses en haut, le reste en
// liste), le matériel en tuiles. Un article avec un lien devient
// cliquable (page de l'article dans un nouvel onglet).

const lienExterne = { target: "_blank", rel: "noopener noreferrer" } as const;

function Nom({ it, className }: { it: ItemSetup; className: string }) {
  if (!it.lien) return <span className={className}>{it.nom}</span>;
  return (
    <a href={it.lien} {...lienExterne} className={className + " group/lien inline-flex items-center gap-1.5 hover:text-lilac transition-colors"}>
      <span className="underline decoration-violet-light/40 underline-offset-4 group-hover/lien:decoration-lilac">{it.nom}</span>
      <Icone nom="externe" className="w-3.5 h-3.5 opacity-70" titre="(nouvel onglet)" />
    </a>
  );
}

function Fiche({ g }: { g: GroupeSetup }) {
  const vedettes = g.items.filter((i) => i.vedette);
  const reste = g.items.filter((i) => !i.vedette);
  return (
    <article className="relative overflow-hidden rounded-3xl border border-violet/25 p-5 md:p-7" style={{ background: "radial-gradient(90% 70% at 100% 0%, rgba(123,56,255,.20), transparent 60%), radial-gradient(60% 60% at 0% 100%, rgba(224,179,255,.07), transparent 60%), rgba(16,12,29,.9)" }}>
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-violet-light/35 text-lilac" style={{ background: "linear-gradient(150deg, rgba(181,124,255,.28), rgba(123,56,255,.08))", boxShadow: "0 0 30px -6px rgba(181,124,255,.55)" }}>
          <IconeMateriel type="boitier" className="w-7 h-7" />
        </span>
        <div className="min-w-0">
          <h3 className="text-2xl md:text-3xl font-semibold text-ink leading-tight">{g.titre}</h3>
          {g.sousTitre && <p className="text-ink-soft">{g.sousTitre}</p>}
        </div>
      </div>

      {vedettes.length > 0 && (
        <div className={"mt-6 grid gap-3 " + (vedettes.length >= 3 ? "sm:grid-cols-3" : vedettes.length === 2 ? "sm:grid-cols-2" : "")}>
          {vedettes.map((it) => (
            <div key={it.id} className="rounded-2xl border border-violet-light/20 bg-void/50 p-4">
              <div className="flex items-center gap-2 text-violet-light">
                <IconeMateriel type={it.type} className="w-6 h-6" />
                <span className="text-sm font-medium">{TYPES_MATERIEL[it.type]?.label}</span>
              </div>
              <p className="mt-2.5 text-ink font-semibold leading-snug">
                <Nom it={it} className="" />
              </p>
              {it.detail && <p className="mt-0.5 text-sm text-lilac/90">{it.detail}</p>}
            </div>
          ))}
        </div>
      )}

      {reste.length > 0 && (
        <ul className="mt-5 grid gap-x-6 gap-y-1 sm:grid-cols-2 border-t border-violet/15 pt-3">
          {reste.map((it) => (
            <li key={it.id} className="flex items-center gap-3 py-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet/12 text-violet-light">
                <IconeMateriel type={it.type} className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-ink-soft/70">{TYPES_MATERIEL[it.type]?.label}</span>
                <Nom it={it} className="text-sm font-medium text-ink" />
                {it.detail && <span className="text-sm text-ink-soft">, {it.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Grille({ g }: { g: GroupeSetup }) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-xl font-semibold text-ink">{g.titre}</h3>
        {g.sousTitre && <p className="text-sm text-ink-soft">{g.sousTitre}</p>}
      </div>
      <ul className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {g.items.map((it) => {
          const contenu = (
            <>
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-lilac" style={{ background: "linear-gradient(150deg, rgba(181,124,255,.22), rgba(123,56,255,.06))" }}>
                <IconeMateriel type={it.type} className="w-7 h-7" />
              </span>
              <span className="mt-3 block text-xs text-ink-soft/70">{TYPES_MATERIEL[it.type]?.label}</span>
              <span className="mt-0.5 block font-semibold text-ink leading-snug">{it.nom}</span>
              {it.detail && <span className="block text-sm text-ink-soft">{it.detail}</span>}
              {it.lien && (
                <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-light group-hover:text-lilac">
                  Voir l&apos;article <Icone nom="externe" className="w-3.5 h-3.5" />
                </span>
              )}
            </>
          );
          return (
            <li key={it.id}>
              {it.lien ? (
                <a href={it.lien} {...lienExterne} className="group flex h-full flex-col rounded-2xl border border-violet/20 bg-card/70 p-4 transition-colors hover:border-violet-light/60 hover:bg-violet/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-light">
                  {contenu}
                </a>
              ) : (
                <div className="flex h-full flex-col rounded-2xl border border-violet/12 bg-card/50 p-4">{contenu}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function SetupCards() {
  const setup = await lireSetup();
  const aDesLiens = setup.groupes.some((g) => g.items.some((i) => i.lien));
  return (
    <div className="grid gap-8">
      {setup.groupes.map((g) => (g.style === "fiche" ? <Fiche key={g.id} g={g} /> : <Grille key={g.id} g={g} />))}
      {(setup.note || (aDesLiens && setup.mentionLiens)) && (
        <div className="grid gap-1 text-sm text-ink-soft/70">
          {setup.note && <p>{setup.note}</p>}
          {aDesLiens && setup.mentionLiens && <p className="text-xs text-ink-soft/60">{setup.mentionLiens}</p>}
        </div>
      )}
    </div>
  );
}
