"use client";

import { useEffect, useRef, useState } from "react";
import type { JourPlanning } from "@/data/planning";
import type { Contenu } from "@/data/contenus";
import { CATEGORIES_MUSEE, type EtapeTimeline } from "@/data/timeline";
import type { SectionAPropos } from "@/data/aproposSections";
import type { NewsValorant, ClipValorant, ProfilValorant } from "@/data/valorant";
import type { AutreJeu, JeuDuMoment } from "@/data/gaming";
import type { DonneesGaming } from "@/lib/gamingStore";
import { AFFICHAGES_PARTENAIRE, type Partenaire } from "@/data/partners";
import AdminArcade from "@/components/admin/AdminArcade";
import ChampImage from "@/components/admin/ChampImage";
import type { BonPlan } from "@/data/deals";
import { textesParDefaut, type Textes } from "@/data/textes";
import EditeurRiche from "@/components/admin/EditeurRiche";

type Onglet = "planning" | "contenus" | "textes" | "timeline" | "apropos" | "valorant" | "partenaires" | "arcade";

const ONGLETS: { valeur: Onglet; label: string; cles: string[] }[] = [
  { valeur: "planning", label: "📅 Planning", cles: ["planning"] },
  { valeur: "contenus", label: "🎬 Derniers contenus", cles: ["contenus"] },
  { valeur: "textes", label: "✏️ Textes", cles: ["textes"] },
  { valeur: "timeline", label: "🕰️ Timeline & Musée", cles: ["timeline"] },
  { valeur: "apropos", label: "💜 À propos", cles: ["apropos"] },
  { valeur: "valorant", label: "🎮 Gaming", cles: ["gaming", "news", "clips", "profil"] },
  { valeur: "partenaires", label: "🤝 Partenaires", cles: ["partenaires", "bonsPlans", "textes"] },
  { valeur: "arcade", label: "🕹️ Jeux", cles: [] },
];

// Données enregistrées par chaque route (pour savoir ce qui n'est plus « modifié »)
const CLES_PAR_URL: Record<string, string[]> = {
  "/api/planning": ["planning"],
  "/api/contenus": ["contenus"],
  "/api/textes": ["textes"],
  "/api/timeline": ["timeline"],
  "/api/apropos-sections": ["apropos"],
  "/api/gaming": ["gaming"],
  "/api/valorant-news": ["news"],
  "/api/valorant-clips": ["clips"],
  "/api/valorant-profil": ["profil"],
  "/api/partenaires": ["partenaires"],
  "/api/bons-plans": ["bonsPlans"],
};

const CLE_SESSION = "cycylive-admin-session";

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
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [bonsPlans, setBonsPlans] = useState<BonPlan[]>([]);
  const [profilValorant, setProfilValorant] = useState<ProfilValorant>({
    intro: "",
    rankActuel: "",
    objectifRank: "",
    agents: "",
    maps: "",
    skinsArmes: "",
    statsPerso: "",
    trackerUrl: "",
    riotName: "",
    riotTag: "",
    riotRegion: "eu",
  });
  const [chargement, setChargement] = useState(true);

  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "erreur"; texte: string } | null>(null);

  const [connecte, setConnecte] = useState(false);
  const [verificationSession, setVerificationSession] = useState(true);
  const [saisieMdp, setSaisieMdp] = useState("");
  const [connexionEnCours, setConnexionEnCours] = useState(false);
  const [erreurConnexion, setErreurConnexion] = useState("");
  const [references, setReferences] = useState<Record<string, string>>({});
  const minuterieMessage = useRef<ReturnType<typeof setTimeout> | null>(null);

  const donnees: Record<string, unknown> = {
    planning,
    contenus,
    textes,
    timeline,
    apropos: sectionsApropos,
    gaming,
    news: newsValorant,
    clips: clipsValorant,
    profil: profilValorant,
    partenaires,
    bonsPlans,
  };
  const empreintes: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(donnees)) empreintes[cle] = JSON.stringify(valeur);
  const modifiees = Object.keys(empreintes).filter((cle) => references[cle] !== undefined && references[cle] !== empreintes[cle]);
  const ongletsModifies = ONGLETS.filter((o) => o.cles.some((c) => modifiees.includes(c)));

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
      fetch("/api/partenaires").then((r) => r.json()),
      fetch("/api/bons-plans").then((r) => r.json()),
    ])
      .then(([dataPlanning, dataContenus, dataTextes, dataTimeline, dataSections, dataNews, dataClips, dataProfil, dataGaming, dataPartenaires, dataBonsPlans]) => {
        setPlanning(dataPlanning.planning);
        setContenus(dataContenus.contenus);
        setTextes(dataTextes.textes);
        setTimeline(dataTimeline.timeline);
        setSectionsApropos(dataSections.sections);
        setNewsValorant(dataNews.news);
        setClipsValorant(dataClips.clips);
        setProfilValorant(dataProfil.profil);
        setGaming(dataGaming.gaming);
        setPartenaires(dataPartenaires.partenaires);
        setBonsPlans(dataBonsPlans.bonsPlans);
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
      const detail = params.get("detail");
      setMessage({
        type: "erreur",
        texte: detail
          ? `La connexion à Twitch a échoué : ${detail}`
          : "La connexion à Twitch a échoué, réessaie.",
      });
    }
  }, []);

  // Point de départ pour repérer les modifications non enregistrées
  useEffect(() => {
    if (!chargement) setReferences({ ...empreintes });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargement]);

  // Session : le mot de passe reste en mémoire le temps de l'onglet du navigateur
  useEffect(() => {
    let memo = "";
    try {
      memo = sessionStorage.getItem(CLE_SESSION) || "";
    } catch {}
    const depuisUrl = window.location.hash.replace("#", "");
    if (ONGLETS.some((o) => o.valeur === depuisUrl)) setOnglet(depuisUrl as Onglet);
    if (!memo) {
      setVerificationSession(false);
      return;
    }
    fetch("/api/admin/verifier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motDePasse: memo }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setMotDePasse(memo);
          setConnecte(true);
        } else {
          try {
            sessionStorage.removeItem(CLE_SESSION);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setVerificationSession(false));
  }, []);

  // Prévient avant de quitter la page avec des modifications non enregistrées
  const aDesModifs = modifiees.length > 0;
  useEffect(() => {
    if (!aDesModifs) return;
    const avertir = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [aDesModifs]);

  // Les messages de réussite disparaissent tout seuls
  useEffect(() => {
    if (minuterieMessage.current) clearTimeout(minuterieMessage.current);
    if (message?.type === "ok") minuterieMessage.current = setTimeout(() => setMessage(null), 4500);
  }, [message]);

  function changerOnglet(valeur: Onglet) {
    setOnglet(valeur);
    try {
      history.replaceState(null, "", `#${valeur}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    if (!saisieMdp) return;
    setConnexionEnCours(true);
    setErreurConnexion("");
    try {
      const r = await fetch("/api/admin/verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasse: saisieMdp }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.ok) {
        setMotDePasse(saisieMdp);
        setConnecte(true);
        setSaisieMdp("");
        try {
          sessionStorage.setItem(CLE_SESSION, saisieMdp);
        } catch {}
      } else {
        setErreurConnexion(d.erreur ?? "Mot de passe incorrect.");
      }
    } catch {
      setErreurConnexion("Impossible de contacter le serveur.");
    } finally {
      setConnexionEnCours(false);
    }
  }

  function seDeconnecter() {
    if (aDesModifs && !confirm("Des modifications ne sont pas enregistrées. Te déconnecter quand même ?")) return;
    try {
      sessionStorage.removeItem(CLE_SESSION);
    } catch {}
    setMotDePasse("");
    setConnecte(false);
  }

  function annulerModifs() {
    if (!confirm("Annuler toutes les modifications non enregistrées et recharger la page ?")) return;
    setReferences({});
    setTimeout(() => window.location.reload(), 0);
  }

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

  function modifierPartenaire(index: number, champs: Partial<Partenaire>) {
    setPartenaires((prev) => prev.map((p, i) => (i === index ? { ...p, ...champs } : p)));
  }

  function ajouterPartenaire() {
    setPartenaires((prev) => [
      ...prev,
      {
        id: genererId(),
        nom: "",
        description: "",
        typePartenariat: "",
        url: "",
        ctaLabel: "Découvrir",
        active: true,
      },
    ]);
  }

  function supprimerPartenaire(index: number) {
    setPartenaires((prev) => prev.filter((_, i) => i !== index));
  }

  function deplacerPartenaire(index: number, direction: -1 | 1) {
    setPartenaires((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.length) return prev;
      const copie = [...prev];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return copie;
    });
  }

  function modifierBonPlan(index: number, champs: Partial<BonPlan>) {
    setBonsPlans((prev) => prev.map((b, i) => (i === index ? { ...b, ...champs } : b)));
  }

  function ajouterBonPlan() {
    setBonsPlans((prev) => [
      ...prev,
      { id: genererId(), marque: "", offre: "", url: "", active: true },
    ]);
  }

  function supprimerBonPlan(index: number) {
    setBonsPlans((prev) => prev.filter((_, i) => i !== index));
  }

  function deplacerBonPlan(index: number, direction: -1 | 1) {
    setBonsPlans((prev) => {
      const nouvelIndex = index + direction;
      if (nouvelIndex < 0 || nouvelIndex >= prev.length) return prev;
      const copie = [...prev];
      [copie[index], copie[nouvelIndex]] = [copie[nouvelIndex], copie[index]];
      return copie;
    });
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
      if (data.ok) {
        const cles = CLES_PAR_URL[url] ?? [];
        setReferences((prev) => {
          const suivant = { ...prev };
          for (const c of cles) suivant[c] = empreintes[c];
          return suivant;
        });
      } else if (reponse.status === 401) {
        try {
          sessionStorage.removeItem(CLE_SESSION);
        } catch {}
      }
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

  if (chargement || verificationSession) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center text-ink-soft">
        Chargement...
      </div>
    );
  }

  if (!connecte) {
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <form onSubmit={seConnecter} className="carte-holo rounded-3xl border border-violet/15 p-7 md:p-8">
          <p className="text-4xl mb-3" aria-hidden>🔐</p>
          <h1 className="text-2xl font-semibold text-ink glow-text mb-1">Administration</h1>
          <p className="text-sm text-ink-soft mb-6">Entre ton mot de passe pour modifier le site. Tu restes connectée tant que l’onglet est ouvert.</p>
          <label htmlFor="motdepasse" className="block text-sm text-ink-soft mb-1.5">
            Mot de passe
          </label>
          <input
            id="motdepasse"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={saisieMdp}
            onChange={(e) => setSaisieMdp(e.target.value)}
            className="w-full rounded-xl bg-card border border-violet/20 px-4 py-2.5 text-ink outline-none focus:border-violet/60 mb-4"
          />
          {erreurConnexion && <p className="text-sm text-red-300 mb-4" role="alert">{erreurConnexion}</p>}
          <button
            type="submit"
            disabled={connexionEnCours || !saisieMdp}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
          >
            {connexionEnCours ? "Vérification…" : "Se connecter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 md:px-8 pt-10 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-semibold text-ink glow-text">Administration</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="/" target="_blank" rel="noopener" className="rounded-full px-3.5 py-1.5 border border-violet/25 text-ink-soft hover:bg-violet/10 transition-all">
            Voir le site ↗
          </a>
          <a href="https://bot.cycylive.fr/admin" target="_blank" rel="noopener" className="rounded-full px-3.5 py-1.5 border border-violet/25 text-ink-soft hover:bg-violet/10 transition-all">
            Admin CycyBot ↗
          </a>
          <button onClick={seDeconnecter} className="rounded-full px-3.5 py-1.5 border border-violet/25 text-ink-soft hover:bg-red-500/10 hover:border-red-400/40 transition-all">
            Se déconnecter
          </button>
        </div>
      </div>

      <div className="carte-holo rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 border border-violet/12 text-sm">
        <div>
          <p className="text-ink font-medium mb-0.5">
            <span aria-hidden className={`inline-block h-2 w-2 rounded-full mr-2 align-middle ${twitchConnecte ? "bg-emerald-400" : twitchConnecte === null ? "bg-ink-soft/40" : "bg-amber-400"}`} />
            Compteur de followers Twitch
          </p>
          <p className="text-ink-soft/70">
            {twitchConnecte === null
              ? "Vérification..."
              : twitchConnecte
              ? `Connecté — ${twitchFollowers ?? "?"} followers`
              : "Pas encore connecté : le compteur de l’accueil est masqué"}
          </p>
        </div>
        <a
          href="/api/twitch-connect"
          className="shrink-0 rounded-full px-4 py-2 border border-violet/30 text-ink-soft hover:bg-violet/10 transition-all"
        >
          {twitchConnecte ? "Reconnecter" : "Connecter Twitch"}
        </a>
      </div>

      <nav aria-label="Sections de l’administration" className="sticky top-20 z-40 -mx-5 md:-mx-8 px-5 md:px-8 py-3 mb-8 bg-void/85 backdrop-blur-md border-b border-violet/10">
        <div className="flex flex-wrap gap-2">
          {ONGLETS.map((o) => {
            const modifie = ongletsModifies.some((m) => m.valeur === o.valeur);
            return (
              <button
                key={o.valeur}
                onClick={() => changerOnglet(o.valeur)}
                aria-current={onglet === o.valeur ? "page" : undefined}
                title={modifie ? "Modifications non enregistrées" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  onglet === o.valeur
                    ? "bg-violet text-ink"
                    : "border border-violet/20 text-ink-soft hover:bg-violet/10"
                }`}
              >
                {o.label}
                {modifie && <span aria-hidden className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-void" />}
              </button>
            );
          })}
        </div>
        {ongletsModifies.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            <span>✎ Pas encore enregistré : {ongletsModifies.map((o) => o.label.replace(/^\S+\s/, "")).join(", ")}. Pense au bouton « Enregistrer » de la section.</span>
            <button onClick={annulerModifs} className="ml-auto underline underline-offset-2 hover:text-ink">
              Tout annuler
            </button>
          </div>
        )}
      </nav>

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
                <details className="rounded-lg border border-violet/15 px-3 py-2">
                  <summary className="text-xs text-lilac cursor-pointer">🏛️ Musée : catégorie, image, clip, souvenirs</summary>
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <select
                        value={etape.categorie ?? ""}
                        onChange={(e) => modifierEtape(index, { categorie: (e.target.value || undefined) as EtapeTimeline["categorie"] })}
                        className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none"
                        aria-label="Catégorie"
                      >
                        <option value="">Catégorie…</option>
                        {CATEGORIES_MUSEE.map((c) => (
                          <option key={c.valeur} value={c.valeur}>{c.emoji} {c.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Emoji"
                        maxLength={4}
                        value={etape.emoji ?? ""}
                        onChange={(e) => modifierEtape(index, { emoji: e.target.value })}
                        className="w-20 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none"
                      />
                    </div>
                    <ChampImage label="Capture (optionnel)" valeur={etape.image ?? ""} onChange={(url) => modifierEtape(index, { image: url })} motDePasse={motDePasse} largeurMax={1400} />
                    <input
                      type="url"
                      placeholder="Lien d'un clip Twitch ou d'une vidéo YouTube (optionnel)"
                      value={etape.clip ?? ""}
                      onChange={(e) => modifierEtape(index, { clip: e.target.value })}
                      className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                    />
                    <textarea
                      rows={2}
                      placeholder={"Souvenirs de la commu, un par ligne\nEx. : J'ai hurlé devant mon écran — Luna"}
                      value={etape.souvenirs ?? ""}
                      onChange={(e) => modifierEtape(index, { souvenirs: e.target.value })}
                      className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                    />
                    <label className="flex items-center gap-2 text-xs text-ink-soft">
                      <input type="checkbox" checked={Boolean(etape.masquerMusee)} onChange={(e) => modifierEtape(index, { masquerMusee: e.target.checked })} />
                      Ne pas montrer cette étape dans le Musée
                    </label>
                  </div>
                </details>
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
                  className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                />
                <input
                  type="text"
                  placeholder="Tag (après le #)"
                  value={profilValorant.riotTag}
                  onChange={(e) => setProfilValorant((p) => ({ ...p, riotTag: e.target.value }))}
                  className="w-28 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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
      )}

      {onglet === "arcade" && <AdminArcade motDePasse={motDePasse} />}

      {onglet === "partenaires" && (
        <>
          <h2 className="text-ink font-medium mb-3">Mes partenaires</h2>
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
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <input
                    type="text"
                    placeholder="Réduction (ex: -10%)"
                    value={p.reduction ?? ""}
                    onChange={(e) => modifierPartenaire(index, { reduction: e.target.value })}
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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

          <h2 className="text-ink font-medium mb-3">Bandeau de l'accueil</h2>
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

          <h2 className="text-ink font-medium mb-3">Bons plans</h2>
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
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
                  />
                  <input
                    type="text"
                    placeholder="Date de fin (optionnel)"
                    value={b.dateFin ?? ""}
                    onChange={(e) => modifierBonPlan(index, { dateFin: e.target.value })}
                    className="flex-1 rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
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
      )}

      {message && (
        <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <p
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm shadow-glow backdrop-blur-md ${
              message.type === "ok" ? "border-emerald-400/30 bg-void/90 text-emerald-200" : "border-red-400/40 bg-void/95 text-red-200"
            }`}
          >
            <span>{message.type === "ok" ? "✓" : "⚠"} {message.texte}</span>
            <button onClick={() => setMessage(null)} aria-label="Fermer" className="text-ink-soft hover:text-ink">✕</button>
          </p>
        </div>
      )}
    </div>
  );
}
