"use client";

import { useEffect, useState } from "react";
import type { JourPlanning } from "@/data/planning";
import type { Contenu } from "@/data/contenus";

type Onglet = "planning" | "contenus";

const PLATEFORMES: Contenu["plateforme"][] = ["TikTok", "Instagram", "YouTube", "Twitch"];

function genererId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function AdminPage() {
  const [onglet, setOnglet] = useState<Onglet>("planning");
  const [motDePasse, setMotDePasse] = useState("");

  const [planning, setPlanning] = useState<JourPlanning[]>([]);
  const [contenus, setContenus] = useState<Contenu[]>([]);
  const [chargement, setChargement] = useState(true);

  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "erreur"; texte: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/planning").then((r) => r.json()),
      fetch("/api/contenus").then((r) => r.json()),
    ])
      .then(([dataPlanning, dataContenus]) => {
        setPlanning(dataPlanning.planning);
        setContenus(dataContenus.contenus);
      })
      .finally(() => setChargement(false));
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

  async function enregistrerPlanning() {
    setEnregistrement(true);
    setMessage(null);
    try {
      const reponse = await fetch("/api/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasse, planning }),
      });
      const data = await reponse.json();
      setMessage(
        data.ok
          ? { type: "ok", texte: "Planning enregistré et visible sur le site !" }
          : { type: "erreur", texte: data.erreur ?? "Erreur inconnue." }
      );
    } catch {
      setMessage({ type: "erreur", texte: "Impossible de contacter le serveur." });
    } finally {
      setEnregistrement(false);
    }
  }

  async function enregistrerContenus() {
    setEnregistrement(true);
    setMessage(null);
    try {
      const reponse = await fetch("/api/contenus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasse, contenus }),
      });
      const data = await reponse.json();
      setMessage(
        data.ok
          ? { type: "ok", texte: "Contenus enregistrés et visibles sur le site !" }
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

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setOnglet("planning")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            onglet === "planning"
              ? "bg-violet text-ink"
              : "border border-violet/20 text-ink-soft"
          }`}
        >
          Planning
        </button>
        <button
          onClick={() => setOnglet("contenus")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            onglet === "contenus"
              ? "bg-violet text-ink"
              : "border border-violet/20 text-ink-soft"
          }`}
        >
          Derniers contenus
        </button>
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
            onClick={enregistrerPlanning}
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
            onClick={enregistrerContenus}
            disabled={enregistrement}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50 mb-2"
          >
            {enregistrement ? "Enregistrement..." : "Enregistrer les contenus"}
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
