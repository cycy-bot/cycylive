"use client";

// Administration — rubrique « valorant » (état partagé : components/admin/contexteAdmin.tsx)
import { SousNavAdmin } from "@/components/admin/NavigationAdmin";
import EditeurRiche from "@/components/admin/EditeurRiche";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletValorant() {
  const { newsValorant, clipsValorant, profilValorant, setProfilValorant, enregistrement, modifierNews, ajouterNews, supprimerNews, deplacerNews, modifierClip, ajouterClip, supprimerClip, deplacerClip, enregistrer } = useAdmin();
  return (
        <>
          <SousNavAdmin liens={[{ id: "adm-news", label: "News" }, { id: "adm-clips", label: "Clips marquants" }, { id: "adm-profil", label: "Profil & rank" }]} />
          <h2 id="adm-news" className="scroll-mt-32 text-ink font-medium mb-3">News Valorant</h2>
          <p className="text-ink-soft mb-4 text-sm">
            Ajoute des liens vers des news Valorant (le site officiel n'a
            pas de flux automatique fiable, donc tu les ajoutes toi-même).
          </p>

          <div className="space-y-3 mb-4">
            {newsValorant.map((n, index) => (
              <div
                key={n.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Titre de la news"
                    value={n.titre}
                    onChange={(e) => modifierNews(index, { titre: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deplacerNews(index, -1)}
                      disabled={index === 0}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerNews(index, 1)}
                      disabled={index === newsValorant.length - 1}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerNews(index)}
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Lien (https://...)"
                  value={n.url}
                  onChange={(e) => modifierNews(index, { url: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </div>
            ))}
          </div>

          <button
            onClick={ajouterNews}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter une news
          </button>

          <button
            onClick={() =>
              enregistrer("/api/valorant-news", { news: newsValorant }, "News enregistrées !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les news"}
          </button>

          <h2 id="adm-clips" className="scroll-mt-32 text-ink font-medium mb-3">Clips marquants</h2>
          <div className="space-y-3 mb-4">
            {clipsValorant.map((c, index) => (
              <div
                key={c.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Titre du clip"
                    value={c.titre}
                    onChange={(e) => modifierClip(index, { titre: e.target.value })}
                    className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deplacerClip(index, -1)}
                      disabled={index === 0}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerClip(index, 1)}
                      disabled={index === clipsValorant.length - 1}
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerClip(index)}
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Lien du clip Twitch (https://clips.twitch.tv/...)"
                  value={c.url}
                  onChange={(e) => modifierClip(index, { url: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </div>
            ))}
          </div>

          <button
            onClick={ajouterClip}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-4"
          >
            + Ajouter un clip
          </button>

          <button
            onClick={() =>
              enregistrer("/api/valorant-clips", { clips: clipsValorant }, "Clips enregistrés !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-8"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les clips"}
          </button>

          <h2 id="adm-profil" className="scroll-mt-32 text-ink font-medium mb-3">Mon rapport à Valorant</h2>
          <div className="carte-holo rounded-2xl p-4 space-y-3 border border-violet/12 mb-4">
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">
                Introduction (place de Valorant dans la chaîne)
              </label>
              <EditeurRiche
                value={profilValorant.intro}
                onChange={(html) => setProfilValorant((p) => ({ ...p, intro: html }))}
                minHeight={70}
              />
            </div>
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">
                Rank actuel (utilisé seulement si le Riot ID ci-dessous est vide)
              </label>
              <input
                type="text"
                placeholder="Ex: Immortal 2"
                value={profilValorant.rankActuel}
                onChange={(e) => setProfilValorant((p) => ({ ...p, rankActuel: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
            </div>

            <div className="rounded-lg border border-violet/15 bg-void/30 p-3 space-y-2.5">
              <p className="text-xs text-violet-light font-medium">
                ⚡ Rank automatique (recommandé)
              </p>
              <p className="text-ink-soft/60 text-xs">
                Renseigne ton Riot ID pour que le rank s'actualise tout seul, sans jamais y retoucher.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pseudo (avant le #)"
                  value={profilValorant.riotName}
                  onChange={(e) => setProfilValorant((p) => ({ ...p, riotName: e.target.value }))}
                  className="flex-1 min-w-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <input
                  type="text"
                  placeholder="Tag (après le #)"
                  value={profilValorant.riotTag}
                  onChange={(e) => setProfilValorant((p) => ({ ...p, riotTag: e.target.value }))}
                  className="w-24 shrink-0 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </div>
              <select
                value={profilValorant.riotRegion}
                onChange={(e) => setProfilValorant((p) => ({ ...p, riotRegion: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              >
                <option value="eu">Europe (eu)</option>
                <option value="na">Amérique du Nord (na)</option>
                <option value="ap">Asie-Pacifique (ap)</option>
                <option value="kr">Corée (kr)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">Objectif de rank</label>
              <input
                type="text"
                placeholder="Ex: Ascendant"
                value={profilValorant.objectifRank}
                onChange={(e) => setProfilValorant((p) => ({ ...p, objectifRank: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">
                Agents joués/favoris (séparés par des virgules)
              </label>
              <input
                type="text"
                placeholder="Ex: Jett, Reyna, Omen"
                value={profilValorant.agents}
                onChange={(e) => setProfilValorant((p) => ({ ...p, agents: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">
                Maps favorites (séparées par des virgules)
              </label>
              <input
                type="text"
                placeholder="Ex: Ascent, Bind"
                value={profilValorant.maps}
                onChange={(e) => setProfilValorant((p) => ({ ...p, maps: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">Skins / armes favoris</label>
              <input
                type="text"
                value={profilValorant.skinsArmes}
                onChange={(e) => setProfilValorant((p) => ({ ...p, skinsArmes: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">
                Stat ou note personnelle (optionnel — laisse vide pour ne rien afficher)
              </label>
              <input
                type="text"
                placeholder="Ex: Winrate 55% ce mois-ci"
                value={profilValorant.statsPerso}
                onChange={(e) => setProfilValorant((p) => ({ ...p, statsPerso: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-soft/70 mb-1">Lien Tracker.gg</label>
              <input
                type="text"
                placeholder="https://tracker.gg/valorant/profile/riot/..."
                value={profilValorant.trackerUrl}
                onChange={(e) => setProfilValorant((p) => ({ ...p, trackerUrl: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
            </div>
          </div>

          <button
            onClick={() =>
              enregistrer("/api/valorant-profil", { profil: profilValorant }, "Ton rapport à Valorant est enregistré !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer"}
          </button>
        </>
  );
}
