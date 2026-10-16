"use client";

// Page d'accueil de l'administration : état des connexions et accès rapide à chaque rubrique.
import Icone from "@/components/icones/Icone";
import type { RubriqueAdmin } from "@/components/admin/NavigationAdmin";

export default function VueEnsembleAdmin<T extends string>({
  rubriques,
  resumes,
  modifiees,
  onChoisir,
  twitchConnecte,
  twitchFollowers,
}: {
  rubriques: RubriqueAdmin<T>[];
  resumes: Partial<Record<T, string>>;
  modifiees: T[];
  onChoisir: (valeur: T) => void;
  twitchConnecte: boolean | null;
  twitchFollowers: number | null;
}) {
  const groupes = [...new Set(rubriques.map((r) => r.groupe))];
  return (
    <div>
      <div className="carte-holo rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4 border border-violet/12 text-sm">
        <div>
          <p className="text-ink font-medium mb-0.5">
            <span aria-hidden className={`inline-block h-2 w-2 rounded-full mr-2 align-middle ${twitchConnecte ? "bg-emerald-400" : twitchConnecte === null ? "bg-ink-soft/40" : "bg-amber-400"}`} />
            Compteur de followers Twitch
          </p>
          <p className="text-ink-soft/70">
            {twitchConnecte === null
              ? "Vérification..."
              : twitchConnecte
              ? `Connecté — ${twitchFollowers ?? "?"} followers`
              : "Pas encore connecté : le compteur de l’accueil est masqué"}
          </p>
        </div>
        <a href="/api/twitch-connect" className="shrink-0 rounded-full px-4 py-2 border border-violet/30 text-ink-soft hover:bg-violet/10 transition-all">
          {twitchConnecte ? "Reconnecter" : "Connecter Twitch"}
        </a>
      </div>

      {groupes.map((g) => (
        <section key={g} className="mb-8">
          <h2 className="text-xs uppercase tracking-[0.16em] text-ink-soft/60 mb-3">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {rubriques
              .filter((r) => r.groupe === g)
              .map((r) => (
                <button
                  key={r.valeur}
                  onClick={() => onChoisir(r.valeur)}
                  className="group text-left carte-holo rounded-2xl border border-violet/12 p-4 hover:border-violet/40 hover:bg-violet/[0.06] transition-all"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/15 ring-1 ring-violet/25 text-lilac">
                      <Icone nom={r.icone} className="w-5 h-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 text-ink font-medium">
                        {r.label}
                        {modifiees.includes(r.valeur) && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">non enregistré</span>}
                      </span>
                      <span className="block text-xs text-ink-soft/70 truncate">{resumes[r.valeur] ?? r.description}</span>
                    </span>
                    <Icone nom="fleche" className="w-4 h-4 text-ink-soft/60 group-hover:text-lilac transition-colors" />
                  </span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
