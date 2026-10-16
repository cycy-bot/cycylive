"use client";

// Administration — rubrique « partenaires » (état partagé : components/admin/contexteAdmin.tsx)
import { AFFICHAGES_PARTENAIRE, type Partenaire } from "@/data/partners";
import { SousNavAdmin } from "@/components/admin/NavigationAdmin";
import ChampImage from "@/components/admin/ChampImage";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletPartenaires() {
  const { motDePasse, textes, partenaires, bonsPlans, enregistrement, modifierTexte, modifierPartenaire, ajouterPartenaire, supprimerPartenaire, deplacerPartenaire, modifierBonPlan, ajouterBonPlan, supprimerBonPlan, deplacerBonPlan, enregistrer } = useAdmin();
  return (
        <>
          <SousNavAdmin liens={[{ id: "adm-partenaires", label: "Mes partenaires" }, { id: "adm-bandeau", label: "Bandeau de l'accueil" }, { id: "adm-bons-plans", label: "Bons plans" }]} />
          <h2 id="adm-partenaires" className="scroll-mt-32 text-ink font-medium mb-3">Mes partenaires</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Décoche "Actif" pour masquer un partenaire sans le supprimer. Tu peux coller l'adresse d'une image ou envoyer un fichier : il est compressé automatiquement. Coche « Lien affilié » pour que la mention s'affiche (obligatoire pour les liens d'affiliation).
          </p>
          <div className="space-y-3 mb-4">
            {partenaires.map((p, index) => (
              <div key={p.id} className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12">
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    type="text"
                    placeholder="Nom du partenaire"
                    value={p.nom}
                    onChange={(e) => modifierPartenaire(index, { nom: e.target.value })}
                    className="flex-1 min-w-[140px] rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft shrink-0">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={(e) => modifierPartenaire(index, { active: e.target.checked })}
                      className="accent-violet"
                    />
                    Actif
                  </label>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => deplacerPartenaire(index, -1)} disabled={index === 0} className="text-ink-soft/60 hover:text-ink disabled:opacity-25 text-sm px-1.5">↑</button>
                    <button onClick={() => deplacerPartenaire(index, 1)} disabled={index === partenaires.length - 1} className="text-ink-soft/60 hover:text-ink disabled:opacity-25 text-sm px-1.5">↓</button>
                    <button onClick={() => supprimerPartenaire(index)} className="text-ink-soft/60 hover:text-red-300 text-sm px-2">Supprimer</button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Type de partenariat (ex: Matériel, Sponsoring...)"
                  value={p.typePartenariat}
                  onChange={(e) => modifierPartenaire(index, { typePartenariat: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <input
                  type="text"
                  placeholder="Courte description"
                  value={p.description}
                  onChange={(e) => modifierPartenaire(index, { description: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <input
                  type="text"
                  placeholder="Lien de redirection : site du partenaire ou ton lien d'affilié (https://...)"
                  value={p.url}
                  onChange={(e) => modifierPartenaire(index, { url: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input type="checkbox" checked={Boolean(p.affilie)} onChange={(e) => modifierPartenaire(index, { affilie: e.target.checked })} className="accent-violet" />
                    Lien affilié
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input type="checkbox" checked={Boolean(p.miseEnAvant)} onChange={(e) => modifierPartenaire(index, { miseEnAvant: e.target.checked })} className="accent-violet" />
                    Mettre en avant (en grand, en haut)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input type="checkbox" checked={p.dansBandeau !== false} onChange={(e) => modifierPartenaire(index, { dansBandeau: e.target.checked })} className="accent-violet" />
                    Dans le bandeau de l'accueil
                  </label>
                  <select
                    value={p.affichage ?? (p.image ? "banniere" : "carte")}
                    onChange={(e) => modifierPartenaire(index, { affichage: e.target.value as Partenaire["affichage"] })}
                    className="rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-xs text-ink outline-none focus:border-violet/60"
                    aria-label="Style d'affichage"
                  >
                    {AFFICHAGES_PARTENAIRE.map((a) => (
                      <option key={a.valeur} value={a.valeur}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <ChampImage label="Logo (carré)" valeur={p.logo ?? ""} onChange={(url) => modifierPartenaire(index, { logo: url })} motDePasse={motDePasse} largeurMax={400} forme="carre" />
                  <ChampImage label="Image / bannière cliquable" valeur={p.image ?? ""} onChange={(url) => modifierPartenaire(index, { image: url })} motDePasse={motDePasse} largeurMax={1400} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Code promo (optionnel)"
                    value={p.promoCode ?? ""}
                    onChange={(e) => modifierPartenaire(index, { promoCode: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <input
                    type="text"
                    placeholder="Réduction (ex: -10%)"
                    value={p.reduction ?? ""}
                    onChange={(e) => modifierPartenaire(index, { reduction: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Texte du bouton (ex: Découvrir, Profiter du bon plan...)"
                  value={p.ctaLabel}
                  onChange={(e) => modifierPartenaire(index, { ctaLabel: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </div>
            ))}
          </div>
          <button
            onClick={ajouterPartenaire}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter un partenaire
          </button>
          <button
            onClick={() => enregistrer("/api/partenaires", { partenaires }, "Partenaires enregistrés !")}
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les partenaires"}
          </button>

          <h2 id="adm-bandeau" className="scroll-mt-32 text-ink font-medium mb-3">Bandeau de l'accueil</h2>
          <div className="carte-holo rounded-2xl p-4 space-y-3 border border-violet/12 mb-4">
            <p className="text-ink-soft text-sm">
              Le bandeau en bas de la page d'accueil montre le logo et le nom de tes partenaires actifs. Un clic mène à leur fiche sur la page partenaires. Décoche « Dans le bandeau de l'accueil » sur un partenaire pour l'en retirer.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Style du bandeau">
              {[
                { valeur: "fixe", label: "Fixe et centré" },
                { valeur: "defilant", label: "Défilant (en boucle)" },
                { valeur: "masque", label: "Masqué" },
              ].map((o) => (
                <button
                  key={o.valeur}
                  type="button"
                  aria-pressed={textes.bandeauPartenaires.mode === o.valeur}
                  onClick={() => modifierTexte("bandeauPartenaires", "mode", o.valeur)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                    textes.bandeauPartenaires.mode === o.valeur
                      ? "bg-violet text-ink"
                      : "border border-violet/25 text-ink-soft hover:bg-violet/10"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <label className="text-xs text-ink-soft">
                Titre (laisser vide pour ne pas en mettre)
                <input
                  type="text"
                  value={textes.bandeauPartenaires.titre}
                  onChange={(e) => modifierTexte("bandeauPartenaires", "titre", e.target.value)}
                  className="mt-1 w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </label>
              <label className="text-xs text-ink-soft">
                Texte du lien vers la page partenaires (vide = pas de lien)
                <input
                  type="text"
                  value={textes.bandeauPartenaires.lien}
                  onChange={(e) => modifierTexte("bandeauPartenaires", "lien", e.target.value)}
                  className="mt-1 w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </label>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={textes.bandeauPartenaires.reductions !== "non"}
                onChange={(e) => modifierTexte("bandeauPartenaires", "reductions", e.target.checked ? "oui" : "non")}
                className="accent-violet"
              />
              Afficher la réduction sous le nom (ex. -15 %)
            </label>
          </div>
          <button
            onClick={() => enregistrer("/api/textes", { textes }, "Bandeau enregistré et visible sur l'accueil !")}
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer le bandeau"}
          </button>

          <h2 id="adm-bons-plans" className="scroll-mt-32 text-ink font-medium mb-3">Bons plans</h2>
          <div className="space-y-3 mb-4">
            {bonsPlans.map((b, index) => (
              <div key={b.id} className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12">
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    type="text"
                    placeholder="Marque"
                    value={b.marque}
                    onChange={(e) => modifierBonPlan(index, { marque: e.target.value })}
                    className="flex-1 min-w-[140px] rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft shrink-0">
                    <input
                      type="checkbox"
                      checked={b.active}
                      onChange={(e) => modifierBonPlan(index, { active: e.target.checked })}
                      className="accent-violet"
                    />
                    Actif
                  </label>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => deplacerBonPlan(index, -1)} disabled={index === 0} className="text-ink-soft/60 hover:text-ink disabled:opacity-25 text-sm px-1.5">↑</button>
                    <button onClick={() => deplacerBonPlan(index, 1)} disabled={index === bonsPlans.length - 1} className="text-ink-soft/60 hover:text-ink disabled:opacity-25 text-sm px-1.5">↓</button>
                    <button onClick={() => supprimerBonPlan(index)} className="text-ink-soft/60 hover:text-red-300 text-sm px-2">Supprimer</button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Offre (ex: -15% sur toute la boutique)"
                  value={b.offre}
                  onChange={(e) => modifierBonPlan(index, { offre: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <input
                  type="text"
                  placeholder="Lien de l'offre ou ton lien d'affilié (https://...)"
                  value={b.url}
                  onChange={(e) => modifierBonPlan(index, { url: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <input type="checkbox" checked={Boolean(b.affilie)} onChange={(e) => modifierBonPlan(index, { affilie: e.target.checked })} className="accent-violet" />
                  Lien affilié
                </label>
                <ChampImage label="Logo ou visuel (optionnel)" valeur={b.image ?? ""} onChange={(url) => modifierBonPlan(index, { image: url })} motDePasse={motDePasse} largeurMax={600} forme="carre" />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Code promo (optionnel)"
                    value={b.promoCode ?? ""}
                    onChange={(e) => modifierBonPlan(index, { promoCode: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <input
                    type="text"
                    placeholder="Date de fin (optionnel)"
                    value={b.dateFin ?? ""}
                    onChange={(e) => modifierBonPlan(index, { dateFin: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Conditions (optionnel)"
                  value={b.conditions ?? ""}
                  onChange={(e) => modifierBonPlan(index, { conditions: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </div>
            ))}
          </div>
          <button
            onClick={ajouterBonPlan}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter un bon plan
          </button>
          <button
            onClick={() => enregistrer("/api/bons-plans", { bonsPlans }, "Bons plans enregistrés !")}
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les bons plans"}
          </button>
        </>
  );
}
