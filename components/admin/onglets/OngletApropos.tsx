"use client";

// Administration — rubrique « apropos » (état partagé : components/admin/contexteAdmin.tsx)
import type { SectionAPropos } from "@/data/aproposSections";
import EditeurRiche from "@/components/admin/EditeurRiche";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletApropos() {
  const { onglet, timeline, sectionsApropos, enregistrement, modifierSection, ajouterSection, supprimerSection, deplacerSection, enregistrer } = useAdmin();
  return (
        <>
          <p className="text-ink-soft mb-6 text-sm">
            Ajoute, modifie et réordonne (↑ ↓) les blocs de la page À
            propos. La première section (type "Texte") s'affiche à côté de
            ta photo. Tu peux aussi insérer un bloc "Setup" ou "Timeline" à
            l'endroit exact où tu veux qu'il apparaisse.
          </p>

          <div className="space-y-3 mb-4">
            {sectionsApropos.map((section, index) => (
              <div
                key={section.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2 items-center">
                  <select
                    value={section.type}
                    onChange={(e) =>
                      modifierSection(index, {
                        type: e.target.value as SectionAPropos["type"],
                      })
                    }
                    className="rounded-lg bg-card border border-violet/20 px-2 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  >
                    <option value="texte">Texte</option>
                    <option value="setup">Bloc Setup</option>
                    <option value="timeline">Bloc Timeline</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Titre de la section"
                    value={section.titre}
                    onChange={(e) => modifierSection(index, { titre: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                    disabled={section.type === "timeline"}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deplacerSection(index, -1)}
                      disabled={index === 0}
                      aria-label="Monter"
                      title="Monter"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerSection(index, 1)}
                      disabled={index === sectionsApropos.length - 1}
                      aria-label="Descendre"
                      title="Descendre"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerSection(index)}
                      aria-label="Supprimer"
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                {section.type === "texte" && (
                  <EditeurRiche
                    value={section.texte}
                    onChange={(html) => modifierSection(index, { texte: html })}
                  />
                )}
                {section.type === "setup" && (
                  <p className="text-ink-soft/60 text-xs px-1">
                    Le contenu du setup (PC, matériel, liens) se modifie dans l'onglet "Setup".
                  </p>
                )}
                {section.type === "timeline" && (
                  <p className="text-ink-soft/60 text-xs px-1">
                    Le contenu de la timeline se modifie dans l'onglet "Timeline" ci-dessus.
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={ajouterSection}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-6"
          >
            + Ajouter une section
          </button>

          <button
            onClick={() =>
              enregistrer(
                "/api/apropos-sections",
                { sections: sectionsApropos },
                "Sections enregistrées et visibles sur le site !"
              )
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les sections"}
          </button>
        </>
  );
}
