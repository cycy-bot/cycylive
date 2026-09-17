"use client";

import { useEffect, useState } from "react";
import type { JourPlanning } from "@/data/planning";
import type { Contenu } from "@/data/contenus";
import type { EtapeTimeline } from "@/data/timeline";
import type { SectionAPropos } from "@/data/aproposSections";
import type { NewsValorant, ClipValorant, ProfilValorant } from "@/data/valorant";
import type { AutreJeu, JeuDuMoment } from "@/data/gaming";
import type { DonneesGaming } from "@/lib/gamingStore";
import { textesParDefaut, type Textes } from "@/data/textes";
import EditeurRiche from "@/components/admin/EditeurRiche";

type Onglet = "planning" | "contenus" | "textes" | "timeline" | "apropos" | "valorant";

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
  const [sectionsApropos, setSectionsApropos] = useState<SectionAPropos[]>([]);
  const [newsValorant, setNewsValorant] = useState<NewsValorant[]>([]);
  const [clipsValorant, setClipsValorant] = useState<ClipValorant[]>([]);
  const [gaming, setGaming] = useState<DonneesGaming>({
    intro: "",
    autresJeux: [],
    jeuxDuMoment: [],
  });
  const [profilValorant, setProfilValorant] = useState<ProfilValorant>({
    intro: "",
    rankActuel: "",
    objectifRank: "",
    agents: "",
    maps: "",
    skinsArmes: "",
    statsPerso: "",
    trackerUrl: "",
  });
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
      fetch("/api/apropos-sections").then((r) => r.json()),
      fetch("/api/valorant-news").then((r) => r.json()),
      fetch("/api/valorant-clips").then((r) => r.json()),
      fetch("/api/valorant-profil").then((r) => r.json()),
      fetch("/api/gaming").then((r) => r.json()),
    ])
      .then(([dataPlanning, dataContenus, dataTextes, dataTimeline, dataSections, dataNews, dataClips, dataProfil, dataGaming]) => {
        setPlanning(dataPlanning.planning);
        setContenus(dataContenus.contenus);
        setTextes(dataTextes.textes);
        setTimeline(dataTimeline.timeline);
        setSectionsApropos(dataSections.sections);
        setNewsValorant(dataNews.news);
        setClipsValorant(dataClips.clips);
        setProfilValorant(dataProfil.profil);
        setGaming(dataGaming.gaming);
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

  function modifierSection(index: number, champs: Partial<SectionAPropos>) {
    setSectionsApropos((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...champs } : s))
    );
  }

  function ajouterSection() {
    setSectionsApropos((prev) => [
      ...prev,
      { id: genererId(), type: "texte", titre: "", texte: "" },
    ]);
  }

  function supprimerSection(index: number) {
    setSectionsApropos((prev) => prev.filter((_, i) => i !== index));
  }

  function deplacerSection(index: number, direction: -1 | 1) {
    setSectionsApropos((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.length) return prev;
      const copie = [...prev];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return copie;
    });
  }

  function modifierNews(index: number, champs: Partial<NewsValorant>) {
    setNewsValorant((prev) =>
      prev.map((n, i) => (i === index ? { ...n, ...champs } : n))
    );
  }

  function ajouterNews() {
    setNewsValorant((prev) => [...prev, { id: genererId(), titre: "", url: "" }]);
  }

  function supprimerNews(index: number) {
    setNewsValorant((prev) => prev.filter((_, i) => i !== index));
  }

  function deplacerNews(index: number, direction: -1 | 1) {
    setNewsValorant((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.length) return prev;
      const copie = [...prev];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return copie;
    });
  }

  function modifierClip(index: number, champs: Partial<ClipValorant>) {
    setClipsValorant((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...champs } : c))
    );
  }

  function ajouterClip() {
    setClipsValorant((prev) => [...prev, { id: genererId(), titre: "", url: "" }]);
  }

  function supprimerClip(index: number) {
    setClipsValorant((prev) => prev.filter((_, i) => i !== index));
  }

  function deplacerClip(index: number, direction: -1 | 1) {
    setClipsValorant((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.length) return prev;
      const copie = [...prev];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return copie;
    });
  }

  function modifierAutreJeu(index: number, champs: Partial<AutreJeu>) {
    setGaming((prev) => ({
      ...prev,
      autresJeux: prev.autresJeux.map((j, i) => (i === index ? { ...j, ...champs } : j)),
    }));
  }

  function ajouterAutreJeu() {
    setGaming((prev) => ({
      ...prev,
      autresJeux: [...prev.autresJeux, { id: genererId(), nom: "", description: "", lienClip: "" }],
    }));
  }

  function supprimerAutreJeu(index: number) {
    setGaming((prev) => ({
      ...prev,
      autresJeux: prev.autresJeux.filter((_, i) => i !== index),
    }));
  }

  function deplacerAutreJeu(index: number, direction: -1 | 1) {
    setGaming((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.autresJeux.length) return prev;
      const copie = [...prev.autresJeux];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return { ...prev, autresJeux: copie };
    });
  }

  function modifierJeuDuMoment(index: number, champs: Partial<JeuDuMoment>) {
    setGaming((prev) => ({
      ...prev,
      jeuxDuMoment: prev.jeuxDuMoment.map((j, i) => (i === index ? { ...j, ...champs } : j)),
    }));
  }

  function ajouterJeuDuMoment() {
    setGaming((prev) => ({
      ...prev,
      jeuxDuMoment: [...prev.jeuxDuMoment, { id: genererId(), nom: "", statut: "En ce moment" }],
    }));
  }

  function supprimerJeuDuMoment(index: number) {
    setGaming((prev) => ({
      ...prev,
      jeuxDuMoment: prev.jeuxDuMoment.filter((_, i) => i !== index),
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
            { valeur: "apropos", label: "À propos" },
            { valeur: "valorant", label: "Gaming" },
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

      {onglet === "apropos" && (
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
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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
                    Le contenu du setup se modifie dans data/setup.ts (fichier de configuration).
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
      )}

      {onglet === "valorant" && (
        <>
          <h2 className="text-ink font-medium mb-3">Introduction Gaming</h2>
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

          <h2 className="text-ink font-medium mb-3">Autres jeux</h2>
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
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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

          <h2 className="text-ink font-medium mb-3">Jeux du moment</h2>
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
                  className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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

          <h2 className="text-ink font-medium mb-3">News Valorant</h2>
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
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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

          <h2 className="text-ink font-medium mb-3">Clips marquants</h2>
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
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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

          <h2 className="text-ink font-medium mb-3">Mon rapport à Valorant</h2>
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
              <label className="block text-xs text-ink-soft/70 mb-1">Rank actuel</label>
              <input
                type="text"
                placeholder="Ex: Immortal 2"
                value={profilValorant.rankActuel}
                onChange={(e) => setProfilValorant((p) => ({ ...p, rankActuel: e.target.value }))}
                className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
              />
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
