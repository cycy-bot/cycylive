"use client";

// Administration — rubrique « planning » (état partagé : components/admin/contexteAdmin.tsx)
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletPlanning() {
  const { planning, calendrier, enregistrement, changerOnglet, modifierJour, enregistrer } = useAdmin();
  return (
        <>
          <p className="text-ink-soft mb-6 text-sm">
            Coche "OFF" pour un jour sans live, ou remplis l'heure de début, l'heure
            de fin (facultative, ex. « 1h ») et le jeu si tu veux. Le jeu est optionnel : sans jeu, le site affiche
            "Stream". C'est ton planning habituel, répété chaque semaine : pour
            changer une date précise (live annulé, horaire décalé…), va dans{" "}
            <button type="button" onClick={() => changerOnglet("calendrier")} className="text-lilac underline">Calendrier</button>.
          </p>

          <div className="space-y-3 mb-8">
            {planning.map((jour, index) => (
              <div
                key={jour.jour}
                className="carte-holo rounded-2xl p-4 flex flex-wrap items-center gap-4 border border-violet/12"
              >
                <span className="w-24 font-medium text-ink shrink-0">{jour.jour}</span>

                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    checked={jour.off}
                    onChange={(e) => modifierJour(index, { off: e.target.checked })}
                    className="accent-violet"
                  />
                  OFF
                </label>

                {!jour.off && (
                  <>
                    <input
                      type="text"
                      placeholder="21h30"
                      value={jour.heure ?? ""}
                      onChange={(e) => modifierJour(index, { heure: e.target.value })}
                      className="w-24 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                    />
                    <span className="text-ink-soft text-sm" aria-hidden>→</span>
                    <input
                      type="text"
                      placeholder="Fin (1h)"
                      aria-label={`Heure de fin du ${jour.jour}`}
                      value={jour.fin ?? ""}
                      onChange={(e) => modifierJour(index, { fin: e.target.value })}
                      className="w-24 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                    />
                    <input
                      type="text"
                      placeholder="Jeu (optionnel)"
                      value={jour.jeu ?? ""}
                      onChange={(e) => modifierJour(index, { jeu: e.target.value })}
                      className="flex-1 min-w-[140px] rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              enregistrer("/api/planning", { planning }, "Planning enregistré et visible sur le site !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer le planning"}
          </button>
        </>
  );
}
