"use client";

// Administration du site : la navigation et le cadre sont ici, chaque rubrique est dans
// components/admin/onglets/ (chargée à la demande), l'état partagé dans components/admin/useEtatAdmin.ts.
import dynamic from "next/dynamic";
import AdminArcade from "@/components/admin/AdminArcade";
import Icone from "@/components/icones/Icone";
import NavigationAdmin from "@/components/admin/NavigationAdmin";
import VueEnsembleAdmin from "@/components/admin/VueEnsembleAdmin";
import { type Onglet, ONGLETS } from "@/components/admin/communs";
import { useEtatAdmin } from "@/components/admin/useEtatAdmin";
import { ContexteAdmin } from "@/components/admin/contexteAdmin";

const OngletLive = dynamic(() => import("@/components/admin/onglets/OngletLive"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletGenerateur = dynamic(() => import("@/components/admin/onglets/OngletGenerateur"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletPlanning = dynamic(() => import("@/components/admin/onglets/OngletPlanning"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletCalendrier = dynamic(() => import("@/components/admin/onglets/OngletCalendrier"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletContenus = dynamic(() => import("@/components/admin/onglets/OngletContenus"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletTextes = dynamic(() => import("@/components/admin/onglets/OngletTextes"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletTimeline = dynamic(() => import("@/components/admin/onglets/OngletTimeline"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletApropos = dynamic(() => import("@/components/admin/onglets/OngletApropos"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletGaming = dynamic(() => import("@/components/admin/onglets/OngletGaming"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletValorant = dynamic(() => import("@/components/admin/onglets/OngletValorant"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });
const OngletPartenaires = dynamic(() => import("@/components/admin/onglets/OngletPartenaires"), { loading: () => <p className="text-ink-soft text-sm">Chargement…</p> });

export default function AdminPage() {
  const etat = useEtatAdmin();
  const { onglet, motDePasse, planning, calendrier, contenus, textes, timeline, sectionsApropos, newsValorant, clipsValorant, gaming, partenaires, bonsPlans, profilValorant, chargement, message, setMessage, connecte, verificationSession, saisieMdp, setSaisieMdp, connexionEnCours, erreurConnexion, twitchConnecte, twitchFollowers, modifiees, ongletsModifies, changerOnglet, seConnecter, seDeconnecter, annulerModifs } = etat;

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
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/15 ring-1 ring-violet/25 text-lilac mb-4" aria-hidden><Icone nom="cadenas" className="w-7 h-7" /></span>
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

  const courante = ONGLETS.find((o) => o.valeur === onglet) ?? ONGLETS[0];
  const resumes: Partial<Record<Onglet, string>> = {
    live: "Stories Instagram et TikTok en un clic",
    generateur: "Clip → vidéo verticale, miniature et textes",
    planning: `${planning.filter((j) => !j.off).length} jour(s) de live par semaine`,
    calendrier: `${Object.keys(calendrier.exceptions).length} exception(s) · ${calendrier.evenements.length} événement(s)`,
    contenus: `${contenus.length} contenu(s)`,
    apropos: `${sectionsApropos.length} section(s)`,
    timeline: `${timeline.length} étape(s)`,
    gaming: `${gaming.autresJeux.length} autre(s) jeu(x) · ${gaming.jeuxDuMoment.length} du moment`,
    valorant: `${profilValorant.rankActuel || "Rank non renseigné"} · ${clipsValorant.length} clip(s) · ${newsValorant.length} news`,
    partenaires: `${partenaires.filter((p) => p.active).length} partenaire(s) actif(s) · ${bonsPlans.length} bon(s) plan(s)`,
  };

  return (
    <ContexteAdmin.Provider value={etat}>
    <div className="mx-auto max-w-6xl px-5 md:px-8 pt-10 pb-28">
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

      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
      <NavigationAdmin rubriques={ONGLETS} active={onglet} modifiees={ongletsModifies.map((o) => o.valeur)} onChoisir={changerOnglet} />

      <div className="min-w-0 max-w-3xl">
      {ongletsModifies.length > 0 && (
        <div className="sticky top-[9.5rem] lg:top-24 z-30 mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/30 bg-[#2a2010]/95 backdrop-blur px-3 py-2 text-xs text-amber-100">
          <span>✎ Pas encore enregistré : {ongletsModifies.map((o) => o.label).join(", ")}. Pense au bouton « Enregistrer » de la section.</span>
          <button onClick={annulerModifs} className="ml-auto underline underline-offset-2 hover:text-ink">
            Tout annuler
          </button>
        </div>
      )}

      {onglet !== "accueil" && (
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet/15 ring-1 ring-violet/25 text-lilac">
            <Icone nom={courante.icone} className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-soft/60">{courante.groupe}</p>
            <h2 className="text-xl font-semibold text-ink leading-tight">{courante.label}</h2>
          </div>
        </div>
      )}

      {onglet === "accueil" && (
        <VueEnsembleAdmin
          rubriques={ONGLETS.filter((o) => o.valeur !== "accueil")}
          resumes={resumes}
          modifiees={ongletsModifies.map((o) => o.valeur)}
          onChoisir={changerOnglet}
          twitchConnecte={twitchConnecte}
          twitchFollowers={twitchFollowers}
        />
      )}

      {onglet === "live" && <OngletLive />}
      {onglet === "generateur" && <OngletGenerateur />}
      {onglet === "planning" && <OngletPlanning />}

      {onglet === "calendrier" && <OngletCalendrier />}

      {onglet === "contenus" && <OngletContenus />}

      {onglet === "textes" && <OngletTextes />}

      {onglet === "timeline" && <OngletTimeline />}

      {onglet === "apropos" && <OngletApropos />}

      {onglet === "gaming" && <OngletGaming />}

      {onglet === "valorant" && <OngletValorant />}

      {onglet === "arcade" && <AdminArcade motDePasse={motDePasse} />}

      {onglet === "partenaires" && <OngletPartenaires />}

      </div>
      </div>

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
    </ContexteAdmin.Provider>
  );
}
