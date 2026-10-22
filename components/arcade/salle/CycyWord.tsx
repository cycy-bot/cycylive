"use client";

// CycyWord : le mot mystère du jour (5 lettres) en six essais.
// Violet = bien placée, jaune = dans le mot mais ailleurs, gris = absente.
// Un mot par jour (heure de Paris), le même pour tout le monde. Statistiques et partie
// du jour gardées dans le navigateur. Score : 100 × (7 − essais) + bonus de rapidité (≤ 150).
// Une fois le mot du jour trouvé (ou raté), un mode entraînement permet de rejouer sans score.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

const MOTS = (
  "AMOUR ARBRE AVION BALLE BANDE BARBE BATON BELLE BIJOU BLANC BOIRE BOITE BOMBE BONUS BRAVE BRISE BRUIT CABLE CALME CANON " +
  "CARTE CHAIR CHAMP CHANT CHAOS CHAUD CHIEN CHOIX CIBLE CIDRE CLAIR CLONE COMBO CONTE CORDE CORPS COUPE COURS CRABE CRANE " +
  "CRIME CYCLE DANSE DEMON DROIT DRAME ECRAN EPICE ETAGE FABLE FARCE FERME FIBRE FLEUR FORCE FORET FOULE FRAIS FRUIT GALET " +
  "GARDE GENIE GIVRE GLACE GLOBE GOMME GRAIN GRAND GRAVE GUIDE HALTE HERBE HEROS HIVER HOMME IDEAL IMAGE JAUNE JOUER JOUET " +
  "JUSTE LAMPE LANCE LARME LASER LEGER LIBRE LIGNE LIVRE LOUPE LUEUR MAGIE MAGMA MATCH MERCI METAL METRO MONDE MOTIF MUSEE " +
  "NEIGE NINJA NOBLE NUAGE OCEAN OMBRE ONCLE ORAGE PAUSE PERLE PHARE PIANO PIEGE PIXEL PLAGE PLUIE PLUME POCHE POIDS POMME " +
  "PORTE POSTE POUCE PRISE QUETE RADAR RADIO RAYON REINE ROBOT ROCHE ROUGE ROUTE RUBIS SABLE SALON SAUCE SCENE SIGNE SINGE " +
  "SOMME SONDE SOUPE SPORT STADE STYLE SUCRE SUPER TABLE TANGO TEMPS TERRE TIGRE TITRE TOTEM TRAIN TREVE TRIBU TROIS TUILE " +
  "VAGUE VALSE VERRE VILLE VIRUS VITRE VOILE VOLER ZEBRE ALIEN ASTRE VENUS CLIPS EMOTE AGENT SPIKE VIPER ASTRA GEKKO CLOVE " +
  "COMTE FUSEE"
)
  .split(" ")
  .filter((m) => /^[A-Z]{5}$/.test(m));

const ESSAIS = 6;
const CLAVIER = ["AZERTYUIOP", "QSDFGHJKLM", "↵WXCVBN⌫"];
const CLE_STATS = "cycylive-cycyword-stats";
const CLE_JOUR = "cycylive-cycyword-jour";

type Couleur = "bien" | "mal" | "absent";
type Stats = { jouees: number; gagnees: number; serie: number; meilleure: number; dernier: string; repartition: number[] };
const statsVides = (): Stats => ({ jouees: 0, gagnees: 0, serie: 0, meilleure: 0, dernier: "", repartition: [0, 0, 0, 0, 0, 0] });

/** Date du jour à Paris (AAAA-MM-JJ). */
function aujourdHui(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
const pgcd = (a: number, b: number): number => (b ? pgcd(b, a % b) : a);
/** Le mot du jour : même mot pour tout le monde, et pas de répétition avant d'avoir fait le tour de la liste. */
function motDuJour(jour: string): string {
  const n = Math.round((Date.parse(jour + "T12:00:00Z") - Date.parse("2026-01-01T12:00:00Z")) / 86400000);
  let pas = 37;
  while (pgcd(pas, MOTS.length) !== 1) pas += 1;
  return MOTS[(((n * pas + 11) % MOTS.length) + MOTS.length) % MOTS.length];
}
/** Couleurs d'un essai (gère les lettres en double comme le vrai jeu). */
function colorer(essai: string, mot: string): Couleur[] {
  const res: Couleur[] = Array(5).fill("absent");
  const reste: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (essai[i] === mot[i]) res[i] = "bien";
    else reste[mot[i]] = (reste[mot[i]] || 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "bien") continue;
    if (reste[essai[i]]) { res[i] = "mal"; reste[essai[i]] -= 1; }
  }
  return res;
}
const STYLE: Record<Couleur | "vide" | "saisie", string> = {
  bien: "bg-violet border-violet text-ink shadow-[0_0_18px_#9146ff88]",
  mal: "bg-[#e8b83a] border-[#e8b83a] text-[#1a1206]",
  absent: "bg-white/10 border-white/10 text-ink-soft",
  vide: "border-violet/20 text-ink",
  saisie: "border-violet-light text-ink scale-[1.04]",
};
const lire = <T,>(cle: string, defaut: T): T => {
  try { const v = localStorage.getItem(cle); return v ? (JSON.parse(v) as T) : defaut; } catch { return defaut; }
};
const ecrire = (cle: string, v: unknown) => { try { localStorage.setItem(cle, JSON.stringify(v)); } catch { /* stockage indisponible */ } };

export default function CycyWord({ onDebut, onFin }: PropsJeu) {
  const jour = useMemo(() => aujourdHui(), []);
  const [mode, setMode] = useState<"depart" | "jour" | "entrainement" | "bilan">("depart");
  const [mot, setMot] = useState(() => motDuJour(jour));
  const [essais, setEssais] = useState<string[]>([]);
  const [saisie, setSaisie] = useState("");
  const [message, setMessage] = useState("");
  const [secoue, setSecoue] = useState(false);
  const [stats, setStats] = useState<Stats>(statsVides);
  const [dejaFait, setDejaFait] = useState(false);
  const debut = useRef(0);
  const termine = useRef(false);

  // Partie du jour déjà jouée sur ce navigateur ?
  useEffect(() => {
    setStats(lire(CLE_STATS, statsVides()));
    const p = lire<{ jour: string; essais: string[] } | null>(CLE_JOUR, null);
    if (p && p.jour === jour) {
      setEssais(p.essais);
      const fini = p.essais.includes(motDuJour(jour)) || p.essais.length >= ESSAIS;
      if (fini) { setDejaFait(true); setMode("bilan"); }
    }
  }, [jour]);

  const fini = essais.includes(mot) || essais.length >= ESSAIS;

  const commencerJour = () => {
    setMot(motDuJour(jour));
    setMode("jour");
    termine.current = false;
    debut.current = performance.now();
    onDebut();
  };
  const commencerEntrainement = () => {
    let m = mot;
    while (m === mot || m === motDuJour(jour)) m = MOTS[Math.floor(Math.random() * MOTS.length)];
    setMot(m); setEssais([]); setSaisie(""); setMessage(""); setMode("entrainement");
  };

  const terminer = useCallback((liste: string[], gagne: boolean) => {
    if (termine.current) return;
    termine.current = true;
    if (mode !== "jour") { setMessage(gagne ? `Bravo, c'était ${mot} !` : `Raté, c'était ${mot}.`); return; }
    const s = lire(CLE_STATS, statsVides());
    if (s.dernier !== jour) {
      const hier = new Date(Date.parse(jour + "T12:00:00Z") - 86400000).toISOString().slice(0, 10);
      s.jouees += 1;
      if (gagne) {
        s.gagnees += 1;
        s.serie = s.dernier === hier || s.serie === 0 ? s.serie + 1 : 1;
        s.meilleure = Math.max(s.meilleure, s.serie);
        s.repartition[liste.length - 1] += 1;
      } else s.serie = 0;
      s.dernier = jour;
      ecrire(CLE_STATS, s);
      setStats(s);
    }
    setDejaFait(true);
    const secondes = (performance.now() - debut.current) / 1000;
    const score = gagne ? 100 * (7 - liste.length) + Math.max(0, Math.round(150 - secondes)) : 0;
    setTimeout(() => {
      setMode("bilan");
      onFin(score, gagne ? `Mot trouvé en ${liste.length} essai${liste.length > 1 ? "s" : ""} (${Math.round(secondes)} s) : ${mot}` : `Le mot du jour était ${mot}. Retente ta chance demain !`);
    }, 1400);
  }, [mode, mot, jour, onFin]);

  const valider = useCallback(() => {
    if (fini || (mode !== "jour" && mode !== "entrainement")) return;
    if (saisie.length < 5) { setMessage("Il faut 5 lettres."); setSecoue(true); setTimeout(() => setSecoue(false), 400); return; }
    if (essais.includes(saisie)) { setMessage("Tu as déjà essayé ce mot."); setSecoue(true); setTimeout(() => setSecoue(false), 400); return; }
    const liste = [...essais, saisie];
    setEssais(liste);
    setSaisie("");
    setMessage("");
    if (mode === "jour") ecrire(CLE_JOUR, { jour, essais: liste });
    if (saisie === mot) terminer(liste, true);
    else if (liste.length >= ESSAIS) terminer(liste, false);
  }, [fini, mode, saisie, essais, mot, jour, terminer]);

  const taper = useCallback((k: string) => {
    if (fini || (mode !== "jour" && mode !== "entrainement")) return;
    if (k === "↵") return valider();
    if (k === "⌫") return setSaisie((s) => s.slice(0, -1));
    if (/^[A-Z]$/.test(k)) setSaisie((s) => (s.length < 5 ? s + k : s));
  }, [fini, mode, valider]);

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter") { e.preventDefault(); taper("↵"); }
      else if (e.key === "Backspace") { e.preventDefault(); taper("⌫"); }
      else {
        const l = e.key.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
        if (/^[A-Z]$/.test(l)) taper(l);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [taper]);

  // État de chaque lettre du clavier (la meilleure info connue)
  const etatTouches = useMemo(() => {
    const r: Record<string, Couleur> = {};
    const rang = { absent: 0, mal: 1, bien: 2 };
    for (const e of essais) colorer(e, mot).forEach((c, i) => { const l = e[i]; if (!r[l] || rang[c] > rang[r[l]]) r[l] = c; });
    return r;
  }, [essais, mot]);

  // Compte à rebours jusqu'au prochain mot
  const [reste, setReste] = useState("");
  useEffect(() => {
    if (mode !== "bilan") return;
    const maj = () => {
      const p = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(new Date());
      const v = (t: string) => Number(p.find((x) => x.type === t)?.value || 0);
      const s = 86400 - (v("hour") * 3600 + v("minute") * 60 + v("second"));
      setReste(`${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")} min ${String(s % 60).padStart(2, "0")} s`);
    };
    maj();
    const t = setInterval(maj, 1000);
    return () => clearInterval(t);
  }, [mode]);

  const grille = (
    <div className={`grid gap-1.5 ${secoue ? "animate-[cwSecoue_.35s]" : ""}`} style={{ gridTemplateRows: `repeat(${ESSAIS}, minmax(0, 1fr))` }}>
      {Array.from({ length: ESSAIS }, (_, l) => {
        const e = essais[l];
        const couleurs = e ? colorer(e, mot) : null;
        const lettres = e || (l === essais.length ? saisie : "");
        return (
          <div key={l} className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }, (_, i) => {
              const c = couleurs ? couleurs[i] : lettres[i] ? "saisie" : "vide";
              return (
                <div
                  key={i}
                  className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border-2 text-2xl font-bold uppercase transition-all duration-300 ${STYLE[c]}`}
                  style={couleurs ? { transitionDelay: `${i * 90}ms` } : undefined}
                >
                  {lettres[i] || ""}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const clavier = (
    <div className="mt-4 flex w-full max-w-lg flex-col gap-1.5">
      {CLAVIER.map((ligne) => (
        <div key={ligne} className="flex justify-center gap-1">
          {ligne.split("").map((k) => {
            const c = etatTouches[k];
            const large = k === "↵" || k === "⌫";
            return (
              <button
                key={k}
                type="button"
                onClick={() => taper(k)}
                aria-label={k === "↵" ? "Valider" : k === "⌫" ? "Effacer" : k}
                className={`h-11 rounded-lg text-sm font-semibold transition-colors ${large ? "px-3 sm:px-4 text-base" : "w-8 sm:w-10"} ${c === "bien" ? "bg-violet text-ink" : c === "mal" ? "bg-[#e8b83a] text-[#1a1206]" : c === "absent" ? "bg-white/5 text-ink-soft/40" : "bg-white/15 text-ink hover:bg-white/25"}`}
              >
                {k === "↵" ? "Entrée" : k}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  const pct = stats.jouees ? Math.round((stats.gagnees / stats.jouees) * 100) : 0;
  const maxRep = Math.max(1, ...stats.repartition);
  const motTrouve = essais.includes(motDuJour(jour));

  return (
    <div className="relative min-h-[560px] select-none overflow-hidden rounded-2xl border border-violet/20 p-4 sm:p-6" style={{ background: "radial-gradient(ellipse at 50% -10%, #173a52 0%, #0d1424 55%, #0a0812 100%)" }}>
      <style>{"@keyframes cwSecoue{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}"}</style>
      {mode === "depart" ? (
        <EcranDepart
          icone="lettres"
          titre="CycyWord"
          regles={<>Devine le <strong className="text-ink">mot mystère de 5 lettres</strong> en six essais (accents ignorés). Après chaque essai : <span className="rounded bg-violet px-1.5 text-ink">violet</span> bien placée, <span className="rounded bg-[#e8b83a] px-1.5 text-[#1a1206]">jaune</span> dans le mot mais ailleurs, <span className="rounded bg-white/15 px-1.5">gris</span> absente. Un nouveau mot chaque jour à minuit !</>}
          onJouer={commencerJour}
          bouton={essais.length ? "Reprendre le mot du jour" : "Jouer au mot du jour"}
        />
      ) : null}

      {mode === "jour" || mode === "entrainement" ? (
        <div className="flex flex-col items-center">
          <div className="mb-3 flex w-full max-w-lg items-center justify-between text-sm">
            <span className="font-semibold text-ink">{mode === "jour" ? <><Icone nom="lettres" className="w-4 h-4 mr-1.5 text-[#7ad7ff]" />Mot du {new Date(jour + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</> : <><Icone nom="rejouer" className="w-4 h-4 mr-1.5 text-[#7ad7ff]" />Entraînement (sans score)</>}</span>
            <span className="text-ink-soft tabular-nums">Essai {Math.min(essais.length + 1, ESSAIS)} / {ESSAIS}</span>
          </div>
          {grille}
          <p className="mt-3 h-5 text-sm text-ink-soft" role="status">{message}</p>
          {mode === "entrainement" && fini ? (
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={commencerEntrainement} className="rounded-full bg-violet px-5 py-2 text-sm font-semibold text-ink hover:bg-violet-light"><Icone nom="rejouer" className="w-4 h-4 mr-1.5" />Un autre mot</button>
              <button type="button" onClick={() => setMode("bilan")} className="rounded-full border border-violet/40 px-5 py-2 text-sm font-semibold text-ink hover:bg-violet/15">Mes statistiques</button>
            </div>
          ) : clavier}
        </div>
      ) : null}

      {mode === "bilan" ? (
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <p className="text-sm uppercase tracking-widest text-ink-soft">Mot du jour</p>
          <p className="my-2 text-3xl font-bold tracking-[0.3em] text-ink glow-text">{dejaFait ? motDuJour(jour) : "?????"}</p>
          <p className="mb-5 text-sm text-ink-soft">
            {dejaFait ? (motTrouve ? `Trouvé en ${essais.length} essai${essais.length > 1 ? "s" : ""} 🎉` : "Pas trouvé cette fois-ci 💜") : ""} Prochain mot dans <strong className="text-ink tabular-nums">{reste}</strong>
          </p>
          <div className="mb-5 grid w-full grid-cols-4 gap-2">
            {[["Parties", stats.jouees], ["Réussite", pct + " %"], ["Série", stats.serie], ["Record", stats.meilleure]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl border border-violet/20 bg-card/60 px-2 py-3">
                <p className="text-2xl font-bold text-ink tabular-nums">{v}</p>
                <p className="text-[11px] uppercase tracking-wide text-ink-soft">{l}</p>
              </div>
            ))}
          </div>
          <p className="mb-2 self-start text-xs uppercase tracking-wide text-ink-soft">Répartition des essais</p>
          <div className="mb-6 flex w-full flex-col gap-1.5">
            {stats.repartition.map((n, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-ink-soft tabular-nums">{i + 1}</span>
                <div className="h-6 flex-1 rounded-md bg-white/5">
                  <div className={`flex h-6 items-center justify-end rounded-md px-2 text-xs font-semibold text-ink ${dejaFait && motTrouve && essais.length === i + 1 ? "bg-violet" : "bg-violet/40"}`} style={{ width: `${Math.max(8, (n / maxRep) * 100)}%` }}>{n}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={commencerEntrainement} className="rounded-full bg-violet px-5 py-2.5 text-sm font-semibold text-ink hover:bg-violet-light"><Icone nom="rejouer" className="w-4 h-4 mr-1.5" />S&apos;entraîner sur un autre mot</button>
          </div>
          <p className="mt-4 text-xs text-ink-soft/70">L&apos;entraînement ne compte ni dans le classement ni dans tes statistiques.</p>
        </div>
      ) : null}
    </div>
  );
}
