"use client";

// Administration — rubrique « timeline » (état partagé : components/admin/contexteAdmin.tsx)
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletTimeline() {
  const { timeline, enregistrement, modifierEtape, ajouterEtape, supprimerEtape, deplacerEtape, enregistrer } = useAdmin();
  return (
        <>
          <p className="text-ink-soft mb-6 text-sm">
            Ajoute les étapes marquantes de ton parcours (dans l'ordre
            chronologique). Elles s'affichent sur la page À propos, et les
            3 dernières en aperçu sur l'accueil.
          </p>

          <div className="space-y-3 mb-4">
            {timeline.map((etape, index) => (
              <div
                key={etape.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Date (ex: 2024, Juin 2025...)"
                    value={etape.date}
                    onChange={(e) => modifierEtape(index, { date: e.target.value })}
                    className="w-40 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => deplacerEtape(index, -1)}
                      disabled={index === 0}
                      aria-label="Monter"
                      title="Monter"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerEtape(index, 1)}
                      disabled={index === timeline.length - 1}
                      aria-label="Descendre"
                      title="Descendre"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerEtape(index)}
                      aria-label="Supprimer"
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Titre de l'étape"
                  value={etape.titre}
                  onChange={(e) => modifierEtape(index, { titre: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <textarea
                  rows={2}
                  placeholder="Description (optionnel)"
                  value={etape.description ?? ""}
                  onChange={(e) => modifierEtape(index, { description: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60 resize-none"
                />
              </div>
            ))}
          </div>

          <button
            onClick={ajouterEtape}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-6"
          >
            + Ajouter une étape
          </button>

          <button
            onClick={() =>
              enregistrer("/api/timeline", { timeline }, "Timeline enregistrée et visible sur le site !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer la timeline"}
          </button>
        </>
  );
}
