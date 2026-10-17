"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icone, { Pastille } from "@/components/icones/Icone";
import { idAppareil } from "@/components/arcade/appareil";
import Sticker, { stickerDuGain, type NomSticker } from "@/components/arcade/Stickers";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";
import CoffreSvg, { TEINTES_COFFRES } from "@/components/arcade/CoffreSvg";

// ============================================================
// LES 3 COFFRES SCELLÉS — une partie par jour
// ============================================================
// CycyBot (bot.cycylive.fr/api/coffres) remplit les 3 coffres dès le début :
// un petit lot, un lot moyen et un gros lot. Le site ne connaît jamais le
// contenu d'un coffre fermé. Le joueur choisit, CycyBot ouvre un autre coffre
// (jamais le gros lot), le joueur garde ou change, puis reçoit un code à
// coller dans /tresor sur Discord.

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const DISCORD = "https://discord.gg/sER6tztDSz";

type Gain = { key: string; emoji: string; label: string; tier: "petit" | "moyen" | "gros"; tierLabel: string; rarity: string; rarityLabel: string };
type Partie = {
  etape: "choix" | "decision" | "fin";
  choix: number | null;
  ouvert: number | null;
  final: number | null;
  change: boolean;
  contenuOuvert?: Gain;
  coffres?: Gain[];
  gain?: Gain;
  code?: string;
  recupere?: boolean;
  credited?: boolean;
  given?: string[];
  note?: string;
};

const COULEUR_TIER: Record<string, string> = { petit: "#d6d0ea", moyen: "#7ee2a8", gros: "#facc15" };

const LOTS: [NomSticker, string, string][] = [
  ["eclats", "Éclats ou quelques points stellaires", "Petit lot"],
  ["fragment", "Éclats + points, ou 1 fragment d'étoile", "Lot moyen"],
  ["booster", "Booster de Cartes Astrales, 70 Éclats, fragments…", "Gros lot"],
  ["tresor", "Trésor de Cycy : 3 boosters + 2 fragments + 150 Éclats", "Très rare"],
];

class ConnexionRequise extends Error {}

async function appel(corps: Record<string, unknown>): Promise<Partie> {
  const r = await fetch(`${BOT}/api/coffres`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appareil: idAppareil(), session: sessionDiscord(), ...corps }) });
  const d = await r.json().catch(() => ({}));
  if (d.connexion) throw new ConnexionRequise(d.error);
  if (!r.ok || !d.ok) throw new Error(d.error || "Les coffres sont indisponibles pour le moment.");
  return d as Partie;
}

export default function CoffresScelles() {
  const compte = useCompteDiscord();
  const [partie, setPartie] = useState<Partie | null>(null);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState(false);
  // Petit suspense avant d'ouvrir les coffres
  const [suspense, setSuspense] = useState<number | null>(null);
  const annonce = useRef<HTMLParagraphElement | null>(null);

  const agir = useCallback(async (corps: Record<string, unknown>, attente = 0) => {
    setCharge(true);
    setErreur("");
    try {
      const [p] = await Promise.all([appel(corps), new Promise((r) => setTimeout(r, attente))]);
      setPartie(p);
    } catch (e) {
      if (e instanceof ConnexionRequise) {
        compte.oublier();
        setPartie(null);
      }
      setErreur(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Impossible de joindre CycyBot pour le moment. Réessaie dans un instant.");
    } finally {
      setCharge(false);
      setSuspense(null);
    }
  }, []);

  useEffect(() => {
    if (partie) annonce.current?.focus();
  }, [partie?.etape]); // eslint-disable-line react-hooks/exhaustive-deps

  const choisir = (i: number) => {
    if (charge || partie?.etape !== "choix") return;
    setSuspense(i);
    agir({ action: "choisir", choix: i }, 700);
  };
  const decider = (changer: boolean) => {
    if (charge || partie?.etape !== "decision") return;
    setSuspense(changer ? autre(partie) : partie.choix);
    agir({ action: "decider", changer }, 900);
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
      <div className="carte-holo rounded-3xl border border-violet/20 p-5 md:p-8 shadow-glow-sm">
        {!partie ? (
          <div className="text-center py-10 md:py-14">
            <Pastille nom="coffre" teinte="or" taille="lg" className="mb-4" />
            <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-2">La salle des coffres scellés</h2>
            <p className="text-ink-soft max-w-lg mx-auto mb-6">
              Trois coffres t&apos;attendent : un petit lot, un lot moyen et un <strong className="text-ink">gros lot</strong>. Choisis le tien… puis
              CycyBot te mettra face à un choix.
            </p>
            {compte.joueur ? (
              <>
                <button
                  type="button"
                  onClick={() => agir({ action: "etat" })}
                  disabled={charge}
                  className="rounded-full px-7 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {charge ? "CycyBot remplit les coffres…" : "Entrer dans la salle"}
                </button>
                <div className="mt-4">
                  <BandeauDiscord compte={compte} />
                </div>
              </>
            ) : compte.pret ? (
              <BoutonDiscord erreur={compte.erreur} texte="Une partie par jour et par compte Discord : ton trésor arrive directement sur ton profil, sans code à copier." />
            ) : (
              <div className="h-12" aria-hidden />
            )}
            {erreur && <p className="text-sm text-red-300 mt-4">{erreur}</p>}
          </div>
        ) : (
          <div>
            <p ref={annonce} tabIndex={-1} className="text-center text-lg md:text-xl font-semibold text-ink mb-1 outline-none" aria-live="polite">
              {texteEtape(partie, suspense)}
            </p>
            <p className="text-center text-sm text-ink-soft mb-6 min-h-[1.25rem]">{sousTexte(partie, suspense)}</p>

            <div className="grid grid-cols-3 gap-2 sm:gap-5 max-w-2xl mx-auto">
              {TEINTES_COFFRES.map((t, i) => {
                const fin = partie.etape === "fin";
                const ouvertParBot = partie.ouvert === i;
                const ouvert = fin || ouvertParBot;
                const contenu = fin ? partie.coffres?.[i] : ouvertParBot ? partie.contenuOuvert : undefined;
                const choisi = fin ? partie.final === i : partie.choix === i;
                const cliquable = partie.etape === "choix" && !charge;
                const enSuspense = suspense === i;
                return (
                  <div key={t.nom} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => choisir(i)}
                      disabled={!cliquable}
                      aria-label={`${t.nom}${choisi ? " (ton choix)" : ""}${contenu ? ` : ${contenu.label}` : ""}`}
                      className={`group relative w-full rounded-2xl p-2 sm:p-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light ${
                        cliquable ? "cursor-pointer hover:-translate-y-1.5 hover:bg-white/5" : "cursor-default"
                      } ${choisi ? "bg-white/[0.06] ring-2" : ""} ${enSuspense ? "animate-pulse" : ""}`}
                      style={choisi ? { ["--tw-ring-color" as string]: t.lueur } : undefined}
                    >
                      {choisi && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-void" style={{ background: t.lueur }}>
                          {fin ? "Ton coffre" : "Ton choix"}
                        </span>
                      )}
                      <div className="relative">
                        <CoffreSvg id={`coffre-${i}`} teinte={t} ouvert={ouvert} terne={fin && !choisi} className={`w-full h-auto ${cliquable ? "group-hover:drop-shadow-[0_0_18px_rgba(255,210,122,0.35)]" : ""}`} />
                        {contenu && (
                          <span
                            className={`absolute left-1/2 top-[16%] -translate-x-1/2 w-[42%] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all duration-500 ${fin && !choisi ? "opacity-60 scale-90" : "coffre-flotte"}`}
                            aria-hidden
                          >
                            <Sticker nom={stickerDuGain(contenu.key, contenu.label)} taille={64} className="w-full h-auto" />
                          </span>
                        )}
                      </div>
                    </button>
                    <p className="mt-2 text-[11px] sm:text-xs text-ink-soft text-center leading-tight">{t.nom}</p>
                    {contenu && (
                      <p className="mt-1 text-[11px] sm:text-sm text-center leading-tight font-medium" style={{ color: COULEUR_TIER[contenu.tier] }}>
                        {contenu.tierLabel}
                        <span className="block text-ink-soft font-normal text-[11px] sm:text-xs mt-0.5">{contenu.label}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {partie.etape === "decision" && (
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => decider(false)}
                  disabled={charge}
                  className="rounded-full px-6 py-3 border border-violet/40 bg-violet/15 text-ink font-semibold hover:bg-violet/25 disabled:opacity-50"
                >
                  Je garde le {TEINTES_COFFRES[partie.choix ?? 0].nom.toLowerCase()}
                </button>
                <button
                  type="button"
                  onClick={() => decider(true)}
                  disabled={charge}
                  className="rounded-full px-6 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow disabled:opacity-50"
                >
                  Je change pour le {TEINTES_COFFRES[autre(partie) ?? 0].nom.toLowerCase()}
                </button>
              </div>
            )}

            {partie.etape === "fin" && partie.gain && <Resultat partie={partie} copie={copie} setCopie={setCopie} />}
            {erreur && <p className="text-sm text-red-300 mt-4 text-center">{erreur}</p>}
          </div>
        )}
      </div>

      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="text-lg font-semibold text-ink mb-3">Comment ça marche ?</h2>
        <ol className="space-y-2 text-sm text-ink-soft mb-5 list-decimal list-inside">
          <li>Choisis un des trois coffres (1 partie par jour).</li>
          <li>CycyBot ouvre un des deux autres : il ne cache <strong className="text-ink">jamais</strong> le gros lot.</li>
          <li>Garde ton coffre ou change pour le dernier coffre fermé.</li>
          <li>
            Ton trésor arrive directement sur ton compte du{" "}
            <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="text-lilac underline">
              Discord Cycylive
            </a>{" "}
            (connexion avec Discord, 1 partie par compte et par jour).
          </li>
        </ol>
        <h3 className="text-sm font-semibold text-ink mb-2">Dans les coffres</h3>
        <ul className="space-y-1.5 text-sm">
          {LOTS.map(([e, nom, niveau]) => (
            <li key={nom} className="flex items-start gap-2">
              <Sticker nom={e} taille={24} className="shrink-0" />
              <span className="flex-1 text-ink-soft">{nom}</span>
              <span className="text-xs text-ink-soft/60 whitespace-nowrap mt-0.5">{niveau}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-soft/60 mt-4">
          Tu repars toujours avec quelque chose. Les coffres sont remplis par CycyBot avant ton choix : personne ne peut tricher, pas même le site. Il faut être
          membre du Discord Cycylive pour récupérer son trésor.
        </p>
      </aside>
      <style>{`@keyframes coffre-flotte{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-6px)}}.coffre-flotte{animation:coffre-flotte 2.4s ease-in-out infinite}@media (prefers-reduced-motion: reduce){.coffre-flotte{animation:none}}`}</style>
    </div>
  );
}

/** Le dernier coffre encore fermé (ni choisi, ni ouvert par CycyBot). */
function autre(p: Partie): number | null {
  if (p.choix == null || p.ouvert == null) return null;
  return [0, 1, 2].find((x) => x !== p.choix && x !== p.ouvert) ?? null;
}

function texteEtape(p: Partie, suspense: number | null): string {
  if (p.etape === "choix") return suspense != null ? "CycyBot s'approche des coffres…" : "Un de ces coffres cache le gros lot. Lequel choisis-tu ?";
  if (p.etape === "decision") return suspense != null ? "Le coffre s'ouvre…" : `CycyBot ouvre le ${TEINTES_COFFRES[p.ouvert ?? 0].nom.toLowerCase()} : ${p.contenuOuvert?.label}.`;
  if (p.gain?.tier === "gros") return p.gain.rarity === "mythique" ? "LE TRÉSOR DE CYCY !!!" : "Gros lot ! Bien joué !";
  return p.gain?.tier === "moyen" ? "Un joli lot moyen !" : "Un petit lot, c'est toujours ça !";
}

function sousTexte(p: Partie, suspense: number | null): string {
  if (suspense != null) return "";
  if (p.etape === "choix") return "Prends ton temps : tu pourras encore changer d'avis.";
  if (p.etape === "decision") return "Ce coffre ne cachait pas le gros lot. Tu gardes ton coffre, ou tu tentes l'autre ?";
  const gros = p.coffres?.findIndex((c) => c.tier === "gros") ?? -1;
  if (p.gain?.tier === "gros") return p.change ? "Changer de coffre t'a porté chance." : "Ton instinct ne t'a pas trompé·e.";
  return gros >= 0 ? `Le gros lot était dans le ${TEINTES_COFFRES[gros].nom.toLowerCase()}. Retente ta chance demain !` : "";
}

function Resultat({ partie, copie, setCopie }: { partie: Partie; copie: boolean; setCopie: (v: boolean) => void }) {
  const code = partie.code || "";
  const gain = partie.gain!;
  return (
    <div className="mt-8 text-center" aria-live="polite">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-void/50 px-5 py-3 mb-5">
        <span aria-hidden>
          <Sticker nom={stickerDuGain(gain.key, gain.label)} taille={56} />
        </span>
        <span className="text-left">
          <span className="block text-xs uppercase tracking-widest" style={{ color: COULEUR_TIER[gain.tier] }}>
            {gain.tierLabel} · {gain.rarityLabel}
          </span>
          <span className="block text-lg font-semibold text-ink">{gain.label}</span>
        </span>
      </div>
      {partie.credited ? (
        <div>
          <p className="text-ink font-semibold text-lg mb-1">
            <Icone nom="valide" className="w-5 h-5 mr-1.5 text-emerald-300" />
            {partie.given ? "Trésor ajouté à ton compte Discord !" : "Ton trésor du jour est déjà sur ton compte Discord."}
          </p>
          {partie.given && <p className="text-ink-soft">{partie.given.map((g) => g.replace(/\*\*/g, "")).join(" · ")}</p>}
          <p className="text-xs text-ink-soft/60 mt-3">Trois nouveaux coffres t&apos;attendent demain, dès minuit.</p>
        </div>
      ) : partie.recupere ? (
        <p className="text-ink-soft">Ce trésor a déjà été récupéré sur Discord. Trois nouveaux coffres t&apos;attendent demain !</p>
      ) : (
        <>
          {partie.note && <p className="text-sm text-amber-200 mb-3 max-w-md mx-auto">{partie.note}</p>}
          <p className="text-ink font-semibold mb-1">Récupère ton trésor sur Discord :</p>
          <ol className="text-ink-soft text-sm mb-4 mx-auto max-w-md text-left space-y-1 list-decimal list-inside">
            <li>
              Copie ton code avec le bouton <strong className="text-ink">Copier le code</strong>.
            </li>
            <li>
              Dans le salon <strong className="text-ink">CycyBot</strong>, tape <code className="text-lilac">/tresor</code> et choisis la commande.
            </li>
            <li>
              <strong className="text-ink">Colle uniquement le code</strong> dans la case « code », puis valide.
            </li>
          </ol>
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <code className="select-all rounded-xl bg-void/70 border border-violet/30 px-4 py-2.5 font-mono text-lilac text-lg md:text-xl tracking-wider">{code}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(code)
                  .then(() => {
                    setCopie(true);
                    setTimeout(() => setCopie(false), 2000);
                  })
                  .catch(() => {});
              }}
              className="rounded-full px-5 py-2.5 bg-violet/20 border border-violet/40 text-ink text-sm font-medium hover:bg-violet/30"
            >
              {copie ? "Code copié ✓" : "Copier le code"}
            </button>
            <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2.5 bg-violet text-ink text-sm font-medium hover:bg-violet-light">
              Ouvrir Discord
            </a>
          </div>
          <p className="text-xs text-ink-soft/60 mt-3">Code valable 48 h · un trésor récupéré par jour</p>
        </>
      )}
    </div>
  );
}
