"use client";

// Interface de jeu du chat : la page suit le live en direct (bot.cycylive.fr/api/interactif).
// Connexion avec Twitch (identité seulement), puis pronostics, votes, camps et réactions.
import { useCallback, useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { IconTwitch } from "@/components/Icons";
import { liens } from "@/data/liens";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const CLE = "cycylive-live-session";
const chaine = (liens.twitch.match(/twitch\.tv\/([^/?#]+)/) || [])[1] || "cycylive";

type Option = { id: string; label: string };
type Etat = {
  version: number;
  live: { enLigne: boolean; jeu: string; mode: { cle: string; label: string } | null };
  moi: { id: string; nom: string; avatar: string } | null;
  camps: { id: string; titre: string; options: Option[]; compte: Record<string, number>; total: number; monChoix: string | null } | null;
  vote: { id: string; question: string; options: Option[]; compte: Record<string, number>; total: number; restant: number; fini: boolean; monChoix: string | null } | null;
  prono: {
    id: string; question: string; type: "choix" | "nombre"; options: Option[]; statut: "ouvert" | "ferme" | "resolu" | "annule";
    restant: number; participants: number; compte: Record<string, number> | null; maReponse: string | number | null;
    resultat: string | number | null; jaiGagne: boolean | null; gagnants: number | null; points: number | null;
  } | null;
  reactions: { actives: boolean; liste: { id: string; emoji: string; label: string }[]; cooldownMs: number };
  classement: { rang: number; nom: string; points: number; gagnes: number; moi: boolean }[];
  monScore: { points: number; gagnes: number } | null;
  historique: { id: string; question: string; reponse: string | number | null; statut: string; participants: number; gagnants: number }[];
};

function lireSession() {
  try { return localStorage.getItem(CLE) || ""; } catch { return ""; }
}
function ecrireSession(v: string) {
  try { if (v) localStorage.setItem(CLE, v); else localStorage.removeItem(CLE); } catch { /* navigation privée */ }
}

const pct = (n: number, t: number) => (t ? Math.round((100 * n) / t) : 0);
const secondes = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")}` : `${s} s`;
};

export default function InterfaceLive() {
  const [session, setSession] = useState("");
  const [etat, setEtat] = useState<Etat | null>(null);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [recuA, setRecuA] = useState(0);
  const [, setTic] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [nombre, setNombre] = useState("");
  const [lecteur, setLecteur] = useState(false);
  const versionRef = useRef(0);
  const sessionRef = useRef("");

  // Retour de Twitch : #session=… ou #erreur=…
  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    const s = h.get("session");
    const e = h.get("erreur");
    if (s) { ecrireSession(s); }
    if (e) setErreur(e === "annule" ? "Connexion annulée." : "La connexion Twitch n’a pas abouti, réessaie.");
    if (s || e) history.replaceState(null, "", window.location.pathname);
    const v = s || lireSession();
    sessionRef.current = v;
    setSession(v);
    setLecteur(window.matchMedia("(min-width: 1024px)").matches);
  }, []);

  const appliquer = useCallback((d: Etat) => {
    versionRef.current = d.version;
    setEtat(d);
    setRecuA(Date.now());
    if (d.prono?.type === "nombre" && d.prono.maReponse != null) setNombre((n) => (n === "" ? String(d.prono!.maReponse) : n));
  }, []);

  // Suivi en direct (la requête attend un changement côté bot, 20 s max)
  useEffect(() => {
    let actif = true;
    let pause = 800;
    (async () => {
      while (actif) {
        try {
          const r = await fetch(`${BOT}/api/interactif/etat?v=${versionRef.current}`, {
            headers: sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {},
            cache: "no-store",
          });
          if (!r.ok) throw new Error(String(r.status));
          const d = (await r.json()) as Etat;
          if (!actif) return;
          if (sessionRef.current && !d.moi) { ecrireSession(""); sessionRef.current = ""; setSession(""); }
          appliquer(d);
          pause = 800;
        } catch {
          await new Promise((res) => setTimeout(res, pause));
          pause = Math.min(pause * 2, 10000);
        }
      }
    })();
    return () => { actif = false; };
  }, [appliquer]);

  // Comptes à rebours
  useEffect(() => {
    const t = setInterval(() => setTic((x) => x + 1), 500);
    return () => clearInterval(t);
  }, []);

  async function agir(corps: Record<string, unknown>, ok?: string) {
    if (!sessionRef.current) { setMessage("Connecte-toi avec Twitch pour participer."); return; }
    try {
      const r = await fetch(`${BOT}/api/interactif/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionRef.current}` },
        body: JSON.stringify(corps),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { ecrireSession(""); sessionRef.current = ""; setSession(""); }
      if (!r.ok) { setMessage(d.erreur || "Action impossible."); return; }
      appliquer(d as Etat);
      if (ok) setMessage(ok);
    } catch {
      setMessage("Connexion au bot impossible, réessaie dans un instant.");
    }
  }

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(t);
  }, [message]);

  const connexion = () => {
    window.location.href = `${BOT}/interactif/connexion?retour=${encodeURIComponent(window.location.origin + "/live")}`;
  };
  const deconnexion = async () => {
    const j = sessionRef.current;
    ecrireSession(""); sessionRef.current = ""; setSession("");
    if (j) fetch(`${BOT}/api/interactif/deconnexion`, { method: "POST", headers: { Authorization: `Bearer ${j}` } }).catch(() => {});
  };

  const restant = (ms: number) => Math.max(0, ms - (Date.now() - recuA));
  const connecte = Boolean(session && etat?.moi);

  if (!etat) {
    return (
      <div className="carte-holo rounded-3xl p-10 text-center text-ink-soft" role="status">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet/30 border-t-violet-light" aria-hidden />
        <p className="mt-3">Connexion au live…</p>
      </div>
    );
  }

  const rien = !etat.camps && !etat.vote && !etat.prono;
  const p = etat.prono;
  const v = etat.vote;
  const c = etat.camps;

  return (
    <div className="space-y-5">
      {/* Bandeau : live + compte */}
      <section className="carte-holo rounded-3xl p-4 md:p-5 flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${etat.live.enLigne ? "bg-red-500/15 text-red-200 ring-1 ring-red-400/40" : "bg-white/5 text-ink-soft ring-1 ring-white/10"}`}>
          <span className={`h-2 w-2 rounded-full ${etat.live.enLigne ? "bg-red-400 animate-pulse" : "bg-ink-soft/60"}`} />
          {etat.live.enLigne ? "En live" : "Hors ligne"}
        </span>
        {etat.live.enLigne && etat.live.jeu && <span className="text-sm text-ink">{etat.live.jeu}</span>}
        {etat.live.mode && <span className="text-sm text-ink-soft">· {etat.live.mode.label}</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {etat.live.enLigne && (
            <button type="button" onClick={() => setLecteur((x) => !x)} className="rounded-full border border-violet/30 px-3.5 py-1.5 text-sm text-ink-soft hover:bg-violet/10 transition-all">
              {lecteur ? "Masquer le live" : "Voir le live ici"}
            </button>
          )}
          {connecte ? (
            <span className="flex items-center gap-2 text-sm text-ink">
              {etat.moi!.avatar ? <img src={etat.moi!.avatar} alt="" className="h-7 w-7 rounded-full" /> : null}
              {etat.moi!.nom}
              {etat.monScore && <span className="text-ink-soft">· {etat.monScore.points} pts</span>}
              <button type="button" onClick={deconnexion} className="ml-1 text-xs text-ink-soft underline underline-offset-2 hover:text-ink">Se déconnecter</button>
            </span>
          ) : (
            <button type="button" onClick={connexion} className="inline-flex items-center gap-2 rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white shadow-glow-sm hover:bg-violet-light transition-all">
              <IconTwitch className="w-4 h-4" /> Se connecter avec Twitch
            </button>
          )}
        </div>
      </section>

      {erreur && <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200" role="alert">{erreur}</p>}
      {!connecte && (
        <p className="text-sm text-ink-soft">
          Tu peux tout regarder sans compte. Pour voter et pronostiquer, connecte-toi avec Twitch : on ne récupère que ton pseudo, rien d’autre.
        </p>
      )}

      {lecteur && etat.live.enLigne && (
        <div className="overflow-hidden rounded-3xl border border-violet/25 aspect-video bg-black">
          <iframe
            title="Live Twitch de Cycylive"
            src={`https://player.twitch.tv/?channel=${chaine}&parent=${typeof window !== "undefined" ? window.location.hostname : "cycylive.fr"}&muted=false`}
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}

      {rien && (
        <section className="carte-holo rounded-3xl p-8 text-center">
          <Icone nom={etat.live.enLigne ? "sablier" : "dodo"} className="w-10 h-10 text-lilac" />
          <h2 className="mt-3 text-lg font-semibold text-ink">{etat.live.enLigne ? "Rien en cours pour l’instant" : "Cycy n’est pas en live"}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {etat.live.enLigne
              ? "Les pronostics, votes et camps apparaissent ici dès que Cycy ou un modo en lance un. Garde la page ouverte : elle se met à jour toute seule."
              : "Reviens pendant le prochain live : tout se passera ici. En attendant, découvre ci-dessous tout ce que tu pourras faire."}
          </p>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Pronostic */}
        {p && (
          <section className="carte-holo rounded-3xl p-5 md:p-6 lg:col-span-2" aria-labelledby="prono-titre">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet/15 text-lilac ring-1 ring-violet/25"><Icone nom="boule" className="w-5 h-5" /></span>
              <h2 id="prono-titre" className="text-lg font-semibold text-ink">{p.question}</h2>
              <span className="ml-auto shrink-0 whitespace-nowrap text-sm text-ink-soft tabular-nums">
                {p.statut === "ouvert" ? `Ferme dans ${secondes(restant(p.restant))}` : p.statut === "ferme" ? "Fermé · résultat bientôt" : p.statut === "resolu" ? "Résultat" : "Annulé"}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {p.statut === "ouvert" ? "Tu peux changer ta réponse jusqu’à la fermeture." : null}
              {" "}{p.participants} participant{p.participants > 1 ? "s" : ""}
              {p.type === "nombre" ? " · le plus proche gagne (pile juste : 25 pts, sinon 10)" : " · bonne réponse : 10 pts"}
            </p>

            {p.type === "choix" ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {p.options.map((o) => {
                  const n = p.compte?.[o.id] || 0;
                  const choisi = String(p.maReponse) === o.id;
                  const bon = p.statut === "resolu" && String(p.resultat) === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={p.statut !== "ouvert"}
                      aria-pressed={choisi}
                      onClick={() => agir({ type: "prono", valeur: o.id }, "Pronostic enregistré ✓")}
                      className={`relative overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all ${choisi ? "border-violet-light bg-violet/20" : "border-white/10 bg-white/[0.03] hover:border-violet/40"} ${bon ? "ring-2 ring-emerald-300/60" : ""} disabled:cursor-default`}
                    >
                      <span className="absolute inset-y-0 left-0 bg-violet/15" style={{ width: `${pct(n, p.participants)}%` }} aria-hidden />
                      <span className="relative flex items-center gap-2">
                        <span className="font-semibold text-ink">{bon ? "✓ " : ""}{o.label}</span>
                        <span className="ml-auto text-sm text-ink-soft tabular-nums">{pct(n, p.participants)} %</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form
                className="mt-4 flex flex-wrap items-center gap-2"
                onSubmit={(e) => { e.preventDefault(); agir({ type: "prono", valeur: nombre }, "Pronostic enregistré ✓"); }}
              >
                <label htmlFor="prono-nombre" className="sr-only">Ton pronostic</label>
                <input
                  id="prono-nombre"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={9999}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={p.statut !== "ouvert"}
                  className="w-40 rounded-xl border border-violet/25 bg-card px-4 py-2.5 text-lg text-ink outline-none focus:border-violet-light"
                  placeholder="Ton nombre"
                />
                <button type="submit" disabled={p.statut !== "ouvert" || nombre === ""} className="rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-light transition-all disabled:opacity-50">
                  {p.maReponse != null ? "Modifier" : "Valider"}
                </button>
                {p.maReponse != null && <span className="text-sm text-ink-soft">Ta réponse : <b className="text-ink">{p.maReponse}</b></span>}
                {p.statut === "resolu" && <span className="text-sm text-ink">Résultat : <b>{p.resultat}</b></span>}
              </form>
            )}

            {p.statut === "resolu" && (
              <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${p.jaiGagne ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/30" : "bg-white/[0.04] text-ink-soft"}`}>
                {p.jaiGagne
                  ? `Bien joué ! +${p.points} points de pronostiqueur (et des Éclats si ton compte Twitch est lié au Discord).`
                  : `${p.gagnants} gagnant${(p.gagnants || 0) > 1 ? "s" : ""} sur ${p.participants}.${p.maReponse == null ? "" : " Pas cette fois, retente au prochain !"}`}
              </p>
            )}
          </section>
        )}

        {/* Vote rapide */}
        {v && (
          <section className="carte-holo rounded-3xl p-5 md:p-6" aria-labelledby="vote-titre">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/12 text-sky-300 ring-1 ring-sky-300/20"><Icone nom="tactique" className="w-5 h-5" /></span>
              <h2 id="vote-titre" className="min-w-0 font-semibold text-ink">{v.question}</h2>
              <span className="ml-auto shrink-0 whitespace-nowrap text-sm text-ink-soft tabular-nums">{v.fini || restant(v.restant) <= 0 ? "Terminé" : secondes(restant(v.restant))}</span>
            </div>
            <div className="mt-4 grid gap-2">
              {v.options.map((o) => {
                const n = v.compte[o.id] || 0;
                const choisi = v.monChoix === o.id;
                const fini = v.fini || restant(v.restant) <= 0;
                return (
                  <button key={o.id} type="button" disabled={fini} aria-pressed={choisi} onClick={() => agir({ type: "vote", choix: o.id })}
                    className={`relative overflow-hidden rounded-xl border px-4 py-2.5 text-left transition-all ${choisi ? "border-sky-300/70 bg-sky-400/10" : "border-white/10 bg-white/[0.03] hover:border-sky-300/40"} disabled:cursor-default`}>
                    <span className="absolute inset-y-0 left-0 bg-sky-400/12" style={{ width: `${pct(n, v.total)}%` }} aria-hidden />
                    <span className="relative flex items-center gap-2"><span className="text-ink">{o.label}</span><span className="ml-auto text-sm text-ink-soft tabular-nums">{n} · {pct(n, v.total)} %</span></span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink-soft/70">{v.total} vote{v.total > 1 ? "s" : ""} · modifiable jusqu’à la fin</p>
          </section>
        )}

        {/* Camps */}
        {c && (
          <section className="carte-holo rounded-3xl p-5 md:p-6" aria-labelledby="camps-titre">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-400/12 text-fuchsia-300 ring-1 ring-fuchsia-300/20"><Icone nom="drapeau" className="w-5 h-5" /></span>
              <h2 id="camps-titre" className="font-semibold text-ink">{c.titre}</h2>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {c.options.map((o) => {
                const n = c.compte[o.id] || 0;
                const choisi = c.monChoix === o.id;
                return (
                  <button key={o.id} type="button" aria-pressed={choisi} onClick={() => agir({ type: "camp", choix: o.id }, `Tu rejoins ${o.label} !`)}
                    className={`rounded-2xl border px-4 py-4 text-center transition-all ${choisi ? "border-fuchsia-300/70 bg-fuchsia-400/12" : "border-white/10 bg-white/[0.03] hover:border-fuchsia-300/40"}`}>
                    <span className="block font-semibold text-ink">{o.label}</span>
                    <span className="mt-1 block font-display text-2xl text-ink tabular-nums">{pct(n, c.total)} %</span>
                    <span className="text-xs text-ink-soft">{n} viewer{n > 1 ? "s" : ""}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Réactions */}
        {etat.reactions.actives && etat.live.enLigne && (
          <section className="carte-holo rounded-3xl p-5 md:p-6" aria-labelledby="reac-titre">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/12 text-amber-300 ring-1 ring-amber-300/25"><Icone nom="fete" className="w-5 h-5" /></span>
              <h2 id="reac-titre" className="font-semibold text-ink">Réagis à l’écran</h2>
            </div>
            <p className="mt-1 text-sm text-ink-soft">Ta réaction s’envole sur le live avec ton pseudo (une toutes les {Math.round(etat.reactions.cooldownMs / 1000)} s).</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
              {etat.reactions.liste.map((r) => (
                <button key={r.id} type="button" disabled={Date.now() < cooldown}
                  onClick={() => { setCooldown(Date.now() + etat.reactions.cooldownMs); agir({ type: "reaction", id: r.id }, "Réaction envoyée !"); }}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] py-3 transition-all hover:border-amber-300/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0">
                  <span className="text-2xl" aria-hidden>{r.emoji}</span>
                  <span className="text-xs text-ink-soft">{r.label}</span>
                </button>
              ))}
            </div>
            {Date.now() < cooldown && <p className="mt-2 text-xs text-ink-soft/70 tabular-nums">Prochaine réaction dans {secondes(cooldown - Date.now())}</p>}
          </section>
        )}

        {/* Classement */}
        <section className={`carte-holo rounded-3xl p-5 md:p-6 ${!v && !c && !(etat.reactions.actives && etat.live.enLigne) ? "lg:col-span-2" : ""}`} aria-labelledby="classement-titre">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/12 text-amber-300 ring-1 ring-amber-300/25"><Icone nom="trophee" className="w-5 h-5" /></span>
            <h2 id="classement-titre" className="font-semibold text-ink">Meilleurs pronostiqueurs</h2>
          </div>
          {etat.classement.length ? (
            <ol className="mt-3 space-y-1.5">
              {etat.classement.map((l) => (
                <li key={l.rang} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${l.moi ? "bg-violet/15 ring-1 ring-violet/30" : "bg-white/[0.03]"}`}>
                  <span className="w-6 text-center text-sm">{["🥇", "🥈", "🥉"][l.rang - 1] || l.rang}</span>
                  <span className="text-ink">{l.nom}</span>
                  <span className="ml-auto text-sm text-ink-soft tabular-nums">{l.points} pts · {l.gagnes} gagné{l.gagnes > 1 ? "s" : ""}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Personne au classement pour l’instant : le premier pronostic gagné t’y inscrit.</p>
          )}
          {etat.historique.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-3">
              <p className="text-xs uppercase tracking-wide text-ink-soft/60 mb-2">Derniers pronostics</p>
              <ul className="space-y-1 text-sm text-ink-soft">
                {etat.historique.map((h) => (
                  <li key={h.id}>
                    {h.question} → <span className="text-ink">{h.statut === "annule" ? "annulé" : h.reponse}</span> <span className="text-ink-soft/60">· {h.gagnants}/{h.participants}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 md:bottom-6 z-50 flex justify-center px-4">
        {message && <p className="pointer-events-auto rounded-2xl border border-violet/30 bg-void/95 px-5 py-3 text-sm text-ink shadow-glow backdrop-blur">{message}</p>}
      </div>
    </div>
  );
}
