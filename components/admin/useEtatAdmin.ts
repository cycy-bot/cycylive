"use client";

// Administration — tout l'état de l'admin (chargement, modifications, enregistrement),
// partagé avec chaque rubrique via components/admin/contexteAdmin.tsx
import { useEffect, useRef, useState } from "react";
import type { JourPlanning } from "@/data/planning";
import type { Contenu } from "@/data/contenus";
import { reglagesTimelineParDefaut, type EtapeTimeline, type ReglagesTimeline } from "@/data/timeline";
import type { SectionAPropos } from "@/data/aproposSections";
import type { NewsValorant, ClipValorant, ProfilValorant } from "@/data/valorant";
import type { AutreJeu, JeuDuMoment } from "@/data/gaming";
import type { DonneesGaming } from "@/lib/gamingStore";
import { type Partenaire } from "@/data/partners";
import { calendrierVide, type DonneesCalendrier } from "@/data/calendrier";
import type { BonPlan } from "@/data/deals";
import { textesParDefaut, type Textes } from "@/data/textes";
import { type Onglet, ONGLETS, CLES_PAR_URL, CLE_SESSION, genererId } from "@/components/admin/communs";

export function useEtatAdmin() {
  const [onglet, setOnglet] = useState<Onglet>("accueil");
  const [motDePasse, setMotDePasse] = useState("");

  const [planning, setPlanning] = useState<JourPlanning[]>([]);
  const [calendrier, setCalendrier] = useState<DonneesCalendrier>(calendrierVide);
  const [contenus, setContenus] = useState<Contenu[]>([]);
  const [textes, setTextes] = useState<Textes>(textesParDefaut);
  const [timeline, setTimeline] = useState<EtapeTimeline[]>([]);
  const [reglagesTimeline, setReglagesTimeline] = useState<ReglagesTimeline>(reglagesTimelineParDefaut);
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
    calendrier,
    contenus,
    textes,
    timeline,
    reglagesTimeline,
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
      fetch("/api/calendrier").then((r) => r.json()).catch(() => calendrierVide),
    ])
      .then(([dataPlanning, dataContenus, dataTextes, dataTimeline, dataSections, dataNews, dataClips, dataProfil, dataGaming, dataPartenaires, dataBonsPlans, dataCalendrier]) => {
        setPlanning(dataPlanning.planning);
        setCalendrier({ exceptions: dataCalendrier?.exceptions ?? {}, evenements: Array.isArray(dataCalendrier?.evenements) ? dataCalendrier.evenements : [] });
        setContenus(dataContenus.contenus);
        setTextes(dataTextes.textes);
        setTimeline(dataTimeline.timeline);
        setReglagesTimeline({ ...reglagesTimelineParDefaut, ...(dataTimeline.reglages ?? {}) });
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
    else if (depuisUrl === "jeux") setOnglet("arcade");
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

  function ajouterEtape(apres?: number) {
    setTimeline((prev) => {
      const nouvelle: EtapeTimeline = { id: genererId(), date: "", titre: "", description: "" };
      if (apres === undefined) return [...prev, nouvelle];
      const copie = [...prev];
      copie.splice(apres + 1, 0, nouvelle);
      return copie;
    });
  }

  function dupliquerEtape(index: number) {
    setTimeline((prev) => {
      const copie = [...prev];
      copie.splice(index + 1, 0, { ...prev[index], id: genererId(), titre: prev[index].titre + " (copie)" });
      return copie;
    });
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

  return { onglet, setOnglet, motDePasse, setMotDePasse, planning, setPlanning, calendrier, setCalendrier, contenus, setContenus, textes, setTextes, timeline, setTimeline, reglagesTimeline, setReglagesTimeline, sectionsApropos, setSectionsApropos, newsValorant, setNewsValorant, clipsValorant, setClipsValorant, gaming, setGaming, partenaires, setPartenaires, bonsPlans, setBonsPlans, profilValorant, setProfilValorant, chargement, setChargement, enregistrement, setEnregistrement, message, setMessage, connecte, setConnecte, verificationSession, setVerificationSession, saisieMdp, setSaisieMdp, connexionEnCours, setConnexionEnCours, erreurConnexion, setErreurConnexion, references, setReferences, twitchConnecte, setTwitchConnecte, twitchFollowers, setTwitchFollowers, minuterieMessage, donnees, empreintes, modifiees, ongletsModifies, aDesModifs, changerOnglet, seConnecter, seDeconnecter, annulerModifs, modifierJour, modifierContenu, ajouterContenu, supprimerContenu, deplacerContenu, modifierEtape, ajouterEtape, dupliquerEtape, supprimerEtape, deplacerEtape, modifierTexte, modifierSection, ajouterSection, supprimerSection, deplacerSection, modifierNews, ajouterNews, supprimerNews, deplacerNews, modifierClip, ajouterClip, supprimerClip, deplacerClip, modifierAutreJeu, ajouterAutreJeu, supprimerAutreJeu, deplacerAutreJeu, modifierJeuDuMoment, ajouterJeuDuMoment, supprimerJeuDuMoment, modifierPartenaire, ajouterPartenaire, supprimerPartenaire, deplacerPartenaire, modifierBonPlan, ajouterBonPlan, supprimerBonPlan, deplacerBonPlan, enregistrer };
}

export type EtatAdmin = ReturnType<typeof useEtatAdmin>;
