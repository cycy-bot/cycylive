"use client";

import { useEffect, useState } from "react";
import type { JourPlanning } from "@/data/planning";
import type { Contenu } from "@/data/contenus";
import type { EtapeTimeline } from "@/data/timeline";
import { textesParDefaut, type Textes } from "@/data/textes";

type Onglet = "planning" | "contenus" | "textes" | "timeline";

const PLATEFORMES: Contenu["plateforme"][] = ["TikTok", "Instagram", "YouTube", "Twitch"];

function genererId(): string {
  return Math.random().toString(36).slice(2, 10);
}

type ChampTexte = { cle: string; label: string; type: "input" | "textarea" };
type SectionTexte = { titre: string; cle: keyof Textes; champs: ChampTexte[] };

const SECTIONS_TEXTES: SectionTexte[] = [
  {
    titre: "Hero (tout en haut de l'accueil)",
    cle: "hero",
    champs: [
      { cle: "ligneCourte", label: "Petite ligne au-dessus du titre", type: "input" },
      { cle: "accroche", label: "Titre principal", type: "input" },
      { cle: "description", label: "Description", type: "textarea" },
      { cle: "boutonPrincipal", label: "Texte du bouton Twitch", type: "input" },
      { cle: "boutonSecondaire", label: "Texte du bouton Discord", type: "input" },
    ],
  },
  {
    titre: "À propos",
    cle: "apropos",
    champs: [
      { cle: "titreAccueil", label: "Titre (bloc sur l'accueil)", type: "input" },
      { cle: "texteCourt", label: "Texte court (bloc sur l'accueil)", type: "textarea" },
      { cle: "boutonPlus", label: "Texte du bouton \"en savoir plus\"", type: "input" },
      { cle: "pageTitre", label: "Titre (page \"À propos\" complète)", type: "input" },
      { cle: "quiSuisJeTitre", label: "Titre section \"Qui est Cycy ?\"", type: "input" },
      { cle: "quiSuisJeTexte", label: "Texte section \"Qui est Cycy ?\"", type: "textarea" },
      { cle: "universTitre", label: "Titre section \"Mon univers\"", type: "input" },
      { cle: "universTexte", label: "Texte section \"Mon univers\"", type: "textarea" },
      { cle: "setupTitre", label: "Titre section \"Mon setup\"", type: "input" },
      { cle: "setupTexte", label: "Texte section \"Mon setup\"", type: "textarea" },
      { cle: "parcoursTitre", label: "Titre section \"Mon parcours\"", type: "input" },
      { cle: "parcoursTexte", label: "Texte section \"Mon parcours\"", type: "textarea" },
      { cle: "passionsTitre", label: "Titre section \"Passions & favoris\"", type: "input" },
      { cle: "passionsTexte", label: "Texte section \"Passions & favoris\"", type: "textarea" },
      { cle: "collabTitre", label: "Titre section \"Collaborations\"", type: "input" },
      { cle: "collabTexte", label: "Texte section \"Collaborations\"", type: "textarea" },
    ],
  },
  {
    titre: "Communauté",
    cle: "communaute",
    champs: [
      { cle: "titre", label: "Titre", type: "input" },
      { cle: "texte", label: "Texte (bloc sur l'accueil)", type: "textarea" },
      { cle: "pageTexte", label: "Texte (page complète)", type: "textarea" },
    ],
  },
  {
    titre: "Partenariats",
    cle: "partenariats",
    champs: [
      { cle: "titre", label: "Titre", type: "input" },
      { cle: "intro", label: "Texte d'introduction", type: "textarea" },
      { cle: "typesTitre", label: "Titre \"types de collaborations\"", type: "input" },
      { cle: "cta", label: "Texte du bouton contact", type: "input" },
      { cle: "mediaKit", label: "Texte du bouton media kit", type: "input" },
    ],
  },
  {
    titre: "Contact",
    cle: "contact",
    champs: [
      { cle: "titre", label: "Titre", type: "input" },
      { cle: "texte", label: "Texte d'introduction", type: "textarea" },
    ],
  },
];

export default function AdminPage() {
  const [onglet, setOnglet] = useState<Onglet>("planning");
  const [motDePasse, setMotDePasse] = useState("");

  const [planning, setPlanning] = useState<JourPlanning[]>([]);
  const [contenus, setContenus] = useState<Contenu[]>([]);
  const [textes, setTextes] = useState<Textes>(textesParDefaut);
  const [timeline, setTimeline] = useState<EtapeTimeline[]>([]);
  const [chargement, setChargement] = useState(true);

  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "erreur"; texte: string } | null>(null);

  const [twitchConnecte, setTwitchConnecte] = useState<boolean | null>(null);
  const [twitchFollowers, setTwitchFollowers] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/planning").then((r) => r.json()),
      fetch("/api/contenus").then((r) => r.json()),
      fetch("/api/textes").then((r) => r.json()),
      fetch("/api/timeline").then((r) => r.json()),
    ])
      .then(([dataPlanning, dataContenus, dataTextes, dataTimeline]) => {
        setPlanning(dataPlanning.planning);
        setContenus(dataContenus.contenus);
        setTextes(dataTextes.textes);
        setTimeline(dataTimeline.timeline);
      })
      .finally(() => setChargement(false));

    fetch("/api/followers")
      .then((r) => r.json())
      .then((data) => {
        setTwitchConnecte(data.connecte);
        setTwitchFollowers(data.followers);
      })
      .catch(() => setTwitchConnecte(false));

    const params = new URLSearchParams(window.location.search);
    if (params.get("twitch") === "connecte") {
      setMessage({ type: "ok", texte: "Compte Twitch connecté avec succès !" });
    } else if (params.get("twitch") === "erreur") {
      setMessage({ type: "erreur", texte: "La connexion à Twitch a échoué, réessaie." });
    }
  }, []);

  function modifierJour(index: number, champs: Partial<JourPlanning>) {
    setPlanning((prev) =>
      prev.map((jour, i) => (i === index ? { ...jour, ...champs } : jour))
    );
  }

  function modifierContenu(index: number, champs: Partial<Contenu>) {
    setContenus((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...champs } : c))
    );
  }

  function ajouterContenu() {
    setContenus((prev) => [
      ...prev,
      { id: genererId(), plateforme: "TikTok", titre: "", url: "", format: "vertical" },
    ]);
  }

  function supprimerContenu(index: number) {
    setContenus((prev) => prev.filter((_, i) => i !== index));
  }

  function deplacerContenu(index: number, direction: -1 | 1) {
    setContenus((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.length) return prev;
      const copie = [...prev];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return copie;
    });
  }

  function modifierEtape(index: number, champs: Partial<EtapeTimeline>) {
    setTimeline((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...champs } : e))
    );
  }

  function ajouterEtape() {
    setTimeline((prev) => [
      ...prev,
      { id: genererId(), date: "", titre: "", description: "" },
    ]);
  }

  function supprimerEtape(index: number) {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  }

  function deplacerEtape(index: number, direction: -1 | 1) {
    setTimeline((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.length) return prev;
      const copie = [...prev];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return copie;
    });
  }

  function modifierTexte(section: keyof Textes, champ: string, valeur: string) {
    setTextes((prev) => ({
      ...prev,
      [section]: { ...prev[section], [champ]: valeur },
    }));
  }

  async function enregistrer(
    url: string,
    corps: Record<string, unknown>,
    libelleSucces: string
  ) {
    setEnregistrement(true);
    setMessage(null);
    try {
      const reponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasse, ...corps }),
      });
      const data = await reponse.json();
      setMessage(
        data.ok
          ? { type: "ok", texte: libelleSucces }
          : { type: "erreur", texte: data.erreur ?? "Erreur inconnue." }
      );
    } catch {
      setMessage({ type: "erreur", texte: "Impossible de contacter le serveur." });
    } finally {
      setEnregistrement(false);
    }
  }

  if (chargement) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center text-ink-soft">
        Chargement...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 md:px-8 py-16">
      <h1 className="text-3xl font-semibold text-ink glow-text mb-6">
        Administration
      </h1>

      <div className="carte-holo rounded-2xl p-4 mb-8 flex items-center justify-between gap-4 border border-violet/12 text-sm">
        <div>
          <p className="text-ink font-medium mb-0.5">Compteur de followers Twitch</p>
          <p className="text-ink-soft/70">
            {twitchConnecte === null
              ? "Vérification..."
              : twitchConnecte
              ? `Connecté — ${twitchFollowers ?? "?"} followers`
              : "Pas encore connecté"}
          </p>
        </div>
        <a
          href="/api/twitch-connect"
          className="shrink-0 rounded-full px-4 py-2 border border-violet/30 text-ink-soft hover:bg-violet/10 transition-all"
        >
          {twitchConnecte ? "Reconnecter" : "Connecter Twitch"}
        </a>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(
          [
            { valeur: "planning", label: "Planning" },
            { valeur: "contenus", label: "Derniers contenus" },
            { valeur: "textes", label: "Textes" },
            { valeur: "timeline", label: "Timeline" },
          ] as const
        ).map((o) => (
          <button
            key={o.valeur}
            onClick={() => setOnglet(o.valeur)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              onglet === o.valeur
                ? "bg-violet text-ink"
                : "border border-violet/20 text-ink-soft"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "planning" && (
        <>
          <p className="text-ink-soft mb-6 text-sm">
            Coche "OFF" pour un jour sans live, ou remplis l'heure (et le jeu
            si tu veux). Le jeu est optionnel : sans jeu, le site affiche
            "Stream".
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
      )}

      {onglet === "contenus" && (
        <>
          <p className="text-ink-soft mb-6 text-sm">
            Colle le lien de ta vidéo (TikTok, Reel Instagram, YouTube ou
            clip Twitch), donne-lui un titre, et choisis le format
            d'affichage.
          </p>

          <div className="space-y-3 mb-4">
            {contenus.map((c, index) => (
              <div
                key={c.id}
                className="carte-holo rounded-2xl p-4 space-y-2.5 border border-violet/12"
              >
                <div className="flex gap-2">
                  <select
                    value={c.plateforme}
                    onChange={(e) =>
                      modifierContenu(index, {
                        plateforme: e.target.value as Contenu["plateforme"],
                      })
                    }
                    className="rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  >
                    {PLATEFORMES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <select
                    value={c.format}
                    onChange={(e) =>
                      modifierContenu(index, {
                        format: e.target.value as Contenu["format"],
                      })
                    }
                    className="rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  >
                    <option value="vertical">Vertical (TikTok/Reel)</option>
                    <option value="horizontal">Horizontal (YouTube)</option>
                  </select>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => deplacerContenu(index, -1)}
                      disabled={index === 0}
                      aria-label="Monter"
                      title="Monter"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => deplacerContenu(index, 1)}
                      disabled={index === contenus.length - 1}
                      aria-label="Descendre"
                      title="Descendre"
                      className="text-ink-soft/60 hover:text-ink disabled:opacity-25 disabled:hover:text-ink-soft/60 text-sm px-1.5"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => supprimerContenu(index)}
                      aria-label="Supprimer"
                      className="text-ink-soft/60 hover:text-red-300 text-sm px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Titre de la vidéo"
                  value={c.titre}
                  onChange={(e) => modifierContenu(index, { titre: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <input
                  type="text"
                  placeholder="Lien de la vidéo (https://...)"
                  value={c.url}
                  onChange={(e) => modifierContenu(index, { url: e.target.value })}
                  className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
              </div>
            ))}
          </div>

          <button
            onClick={ajouterContenu}
            className="w-full rounded-full px-6 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all mb-6"
          >
            + Ajouter une vidéo
          </button>

          <button
            onClick={() =>
              enregistrer("/api/contenus", { contenus }, "Contenus enregistrés et visibles sur le site !")
            }
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les contenus"}
          </button>
        </>
      )}

      {onglet === "textes" && (
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
                      <textarea
                        rows={3}
                        value={(textes[section.cle] as Record<string, string>)[champ.cle] ?? ""}
                        onChange={(e) =>
                          modifierTexte(section.cle, champ.cle, e.target.value)
                        }
                        className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60 resize-none"
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
      )}

      {onglet === "timeline" && (
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
      )}

      <div className="mt-6">
        <label htmlFor="motdepasse" className="block text-sm text-ink-soft mb-1.5">
          Mot de passe
        </label>
        <input
          id="motdepasse"
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full rounded-xl bg-card border border-violet/20 px-4 py-2.5 text-ink outline-none focus:border-violet/60"
        />
      </div>

      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            message.type === "ok" ? "text-lilac" : "text-red-300"
          }`}
        >
          {message.texte}
        </p>
      )}
    </div>
  );
}
