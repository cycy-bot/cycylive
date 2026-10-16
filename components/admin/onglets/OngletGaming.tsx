"use client";

// Administration — rubrique « gaming » (état partagé : components/admin/contexteAdmin.tsx)
import type { JeuDuMoment } from "@/data/gaming";
import { ILLUSTRATIONS_JEU, illustrationPour } from "@/lib/illustrationJeu";
import { SousNavAdmin } from "@/components/admin/NavigationAdmin";
import EditeurRiche from "@/components/admin/EditeurRiche";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletGaming() {
  const { gaming, setGaming, enregistrement, modifierAutreJeu, ajouterAutreJeu, supprimerAutreJeu, deplacerAutreJeu, modifierJeuDuMoment, ajouterJeuDuMoment, supprimerJeuDuMoment, enregistrer } = useAdmin();
  return (
        <>
          <SousNavAdmin liens={[{ id: "adm-intro-gaming", label: "Introduction" }, { id: "adm-autres-jeux", label: "Autres jeux" }, { id: "adm-jeux-moment", label: "Jeux du moment" }]} />
          <h2 id="adm-intro-gaming" className="scroll-mt-32 text-ink font-medium mb-3">Introduction Gaming</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Le texte en haut de la page /gaming, avant le bloc Valorant.
          </p>
          <div className="mb-4">
            <EditeurRiche
              value={gaming.intro}
              onChange={(html) => setGaming((p) => ({ ...p, intro: html }))}
              minHeight={70}
            />
          </div>
          <button
            onClick={() =>
              enregistrer("/api/gaming", { gaming }, "Données Gaming enregistrées !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-2.5 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer l'introduction"}
          </button>

          <h2 id="adm-autres-jeux" className="scroll-mt-32 text-ink font-medium mb-3">Autres jeux</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Les jeux affichés en cartes sous le bloc Valorant.
          </p>
          <div className="space-y-3 mb-4">
            {gaming.autresJeux.map((jeu, index) => (
              <div
                key={jeu.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nom du jeu"
                    value={jeu.nom}
                    onChange={(e) => modifierAutreJeu(index, { nom: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deplacerAutreJeu(index, -1)}
                      disabled={index === 0}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerAutreJeu(index, 1)}
                      disabled={index === gaming.autresJeux.length - 1}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerAutreJeu(index)}
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Courte description"
                  value={jeu.description}
                  onChange={(e) => modifierAutreJeu(index, { description: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <label className="flex items-center gap-2 text-xs text-ink-soft">
                  Illustration
                  <select
                    value={jeu.illustration ?? ""}
                    onChange={(e) => modifierAutreJeu(index, { illustration: e.target.value || undefined })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  >
                    <option value="">Automatique ({illustrationPour(jeu.nom).label})</option>
                    {ILLUSTRATIONS_JEU.map((i) => (
                      <option key={i.cle} value={i.cle}>{i.label}</option>
                    ))}
                  </select>
                </label>
                <input
                  type="text"
                  placeholder="Lien vers un clip/contenu (optionnel)"
                  value={jeu.lienClip ?? ""}
                  onChange={(e) => modifierAutreJeu(index, { lienClip: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </div>
            ))}
          </div>
          <button
            onClick={ajouterAutreJeu}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter un jeu
          </button>
          <button
            onClick={() =>
              enregistrer("/api/gaming", { gaming }, "Données Gaming enregistrées !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les autres jeux"}
          </button>

          <h2 id="adm-jeux-moment" className="scroll-mt-32 text-ink font-medium mb-3">Jeux du moment</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Section facultative : laisse-la vide pour qu'elle n'apparaisse pas du tout sur le site.
          </p>
          <div className="space-y-3 mb-4">
            {gaming.jeuxDuMoment.map((jeu, index) => (
              <div
                key={jeu.id}
                className="carte-holo rounded-2xl p-4 flex gap-2 items-center border border-violet/12"
              >
                <input
                  type="text"
                  placeholder="Nom du jeu"
                  value={jeu.nom}
                  onChange={(e) => modifierJeuDuMoment(index, { nom: e.target.value })}
                  className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <select
                  value={jeu.statut}
                  onChange={(e) =>
                    modifierJeuDuMoment(index, { statut: e.target.value as JeuDuMoment["statut"] })
                  }
                  className="rounded-lg bg-card border border-violet/20 px-2 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                >
                  <option value="En ce moment">En ce moment</option>
                  <option value="En pause">En pause</option>
                  <option value="À venir">À venir</option>
                </select>
                <button
                  onClick={() => supprimerJeuDuMoment(index)}
                  className="text-ink-soft/60 hover:text-red-300 text-sm px-2 shrink-0"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={ajouterJeuDuMoment}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter un jeu du moment
          </button>
          <button
            onClick={() =>
              enregistrer("/api/gaming", { gaming }, "Données Gaming enregistrées !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les jeux du moment"}
          </button>
        </>
  );
}
