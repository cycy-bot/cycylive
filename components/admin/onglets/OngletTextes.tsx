"use client";

// Administration — rubrique « textes » (état partagé : components/admin/contexteAdmin.tsx)
import { type Textes } from "@/data/textes";
import EditeurRiche from "@/components/admin/EditeurRiche";
import { SECTIONS_TEXTES } from "@/components/admin/communs";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletTextes() {
  const { textes, enregistrement, modifierTexte, enregistrer } = useAdmin();
  return (
        <>
          <p className="text-ink-soft mb-6 text-sm">
            Modifie n'importe quel texte du site, regroupé par section.
          </p>

          <div className="space-y-6 mb-6">
            {SECTIONS_TEXTES.map((section) => (
              <div
                key={section.cle}
                className="carte-holo rounded-2xl p-4 space-y-3 border border-violet/12"
              >
                <h2 className="text-ink font-medium">{section.titre}</h2>
                {section.champs.map((champ) => (
                  <div key={champ.cle}>
                    <label className="block text-xs text-ink-soft/70 mb-1">
                      {champ.label}
                    </label>
                    {champ.type === "textarea" ? (
                      <EditeurRiche
                        value={(textes[section.cle] as Record<string, string>)[champ.cle] ?? ""}
                        onChange={(html) => modifierTexte(section.cle, champ.cle, html)}
                      />
                    ) : (
                      <input
                        type="text"
                        value={(textes[section.cle] as Record<string, string>)[champ.cle] ?? ""}
                        onChange={(e) =>
                          modifierTexte(section.cle, champ.cle, e.target.value)
                        }
                        className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              enregistrer("/api/textes", { textes }, "Textes enregistrés et visibles sur le site !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les textes"}
          </button>
        </>
  );
}
