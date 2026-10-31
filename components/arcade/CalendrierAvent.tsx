"use client";

// ============================================================
// CALENDRIER DE L'AVENT — 24 cases dans le désordre (1er → 24 décembre)
// ============================================================
// CycyBot (bot.cycylive.fr/api/avent) garde les cadeaux secrets : le site ne reçoit
// que l'état des cases (fermée, du jour, ouverte, manquée) et le cadeau des cases ouvertes.
// Chaque jour, on cherche la case du jour, on l'ouvre : la porte pivote, ça scintille,
// le cadeau apparaît… puis la case reste ouverte. Une case dont le jour est passé reste
// fermée pour toujours.
// Aperçu privé de Cycy : ?apercu=<jeton de l'admin>&jour=<1-24> (jour simulé, cadeaux de test).

import Icone from "@/components/icones/Icone";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sticker, { stickerDuGain } from "@/components/arcade/Stickers";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";

type Gain = { label: string; type: string; figurine: { nom: string; image: string } | null; message: string };
type Case = { jour: number; icone: string; etat: "fermee" | "aujourdhui" | "ouverte" | "manquee"; gain: Gain | null };
type Etat = { publie: boolean; apercu: boolean; titre: string; sousTitre: string; annee: number; aujourdhui: number; cases: Case[]; ouvertes: number };
type Resultat = Gain & { jour: number; given: string[] | null; test: boolean };

class Ferme extends Error {}
class ConnexionRequise extends Error {}

// Teintes d'émail des portes (sobres, profondes) : une par case, sans motif répétitif évident
const EMAUX = [
  ["#2b1a52", "#170c33"], ["#3b1748", "#1e0a2a"], ["#1d2550", "#0e1330"], ["#40204f", "#211029"],
  ["#251640", "#120a24"], ["#33204f", "#1a0f30"], ["#2a1d4a", "#140e2c"], ["#3a1a4a", "#1b0b26"],
];

function lireApercu(): { jeton: string; jour: number } | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const jeton = p.get("apercu");
  return jeton ? { jeton, jour: Number(p.get("jour")) || 0 } : null;
}

async function appel(corps: Record<string, unknown>): Promise<Etat & { resultat?: Resultat }> {
  const r = await fetch(`${BOT}/api/avent`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session: sessionDiscord(), ...corps }) });
  const d = await r.json().catch(() => ({}));
  if (d.ferme || r.status === 404 || /existe pas/.test(d.error || "")) throw new Ferme(d.error);
  if (d.connexion) throw new ConnexionRequise(d.error);
  if (!r.ok || !d.ok) throw new Error(d.error || "Le calendrier est indisponible pour le moment.");
  return d;
}

// ── Décor ────────────────────────────────────────────────────

function Ornement({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="av-or" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff4cf" /><stop offset=".5" stopColor="#e7b85c" /><stop offset="1" stopColor="#9c6424" /></linearGradient>
      </defs>
      <g fill="none" stroke="url(#av-or)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 110V40C6 20 20 6 40 6h70" />
        <path d="M14 110V44c0-17 13-30 30-30h66" strokeOpacity=".5" strokeWidth="1" />
        <path d="M24 70c0-26 20-46 46-46" strokeOpacity=".8" />
        <path d="M34 64c4-16 14-26 30-30" strokeOpacity=".55" />
      </g>
      <path d="M24 24l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="url(#av-or)" />
      <circle cx="70" cy="24" r="2.5" fill="url(#av-or)" />
      <circle cx="24" cy="70" r="2.5" fill="url(#av-or)" />
    </svg>
  );
}

function Neige() {
  const flocons = useMemo(() => Array.from({ length: 38 }, (_, i) => ({ x: (i * 37) % 100, d: 8 + ((i * 13) % 10), t: (i * 7) % 12, s: 2 + (i % 3) })), []);
  return (
    <div className="av-neige" aria-hidden>
      {flocons.map((f, i) => <span key={i} style={{ left: `${f.x}%`, width: f.s, height: f.s, animationDuration: `${f.d}s`, animationDelay: `-${f.t}s` }} />)}
    </div>
  );
}

function Paillettes({ actif }: { actif: boolean }) {
  if (!actif) return null;
  return (
    <span className="av-paillettes" aria-hidden>
      {Array.from({ length: 22 }, (_, i) => (
        <i key={i} style={{ ["--a" as string]: `${(i / 22) * 360}deg`, ["--d" as string]: `${46 + (i % 4) * 18}px`, animationDelay: `${(i % 5) * 35}ms`, background: ["#fff4cf", "#f1c56a", "#f9a8d4", "#c4b5fd", "#ffffff"][i % 5] }} />
      ))}
    </span>
  );
}

function Cadeau({ gain, taille = 96 }: { gain: Gain; taille?: number }) {
  if (gain.figurine) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={gain.figurine.image} alt={gain.figurine.nom} style={{ height: taille * 1.15, width: "auto" }} className="mx-auto drop-shadow-[0_10px_24px_rgba(0,0,0,.45)]" />;
  }
  return <Sticker nom={stickerDuGain(gain.type, gain.label)} taille={taille} className="mx-auto" />;
}

// ── Une case ─────────────────────────────────────────────────

function CaseAvent({ c, i, onOuvrir, ouvre, refus }: { c: Case; i: number; onOuvrir: (c: Case) => void; ouvre: boolean; refus: boolean }) {
  const [a, b] = EMAUX[(c.jour * 5 + i) % EMAUX.length];
  const ouverte = c.etat === "ouverte" || ouvre;
  return (
    <button
      type="button"
      onClick={() => onOuvrir(c)}
      className={`av-case ${ouverte ? "est-ouverte" : ""} ${c.etat === "manquee" ? "est-manquee" : ""} ${refus ? "av-refus" : ""}`}
      aria-label={`Case du ${c.jour} décembre${c.etat === "ouverte" ? " (ouverte)" : c.etat === "manquee" ? " (restée fermée)" : ""}`}
    >
      {/* l'intérieur de la niche */}
      <span className="av-niche">
        <span className="av-niche-fond" />
        {c.gain ? <span className="av-niche-cadeau"><Cadeau gain={c.gain} taille={46} /></span> : null}
        <span className="av-niche-jour">{c.jour}</span>
      </span>
      {/* la porte */}
      <span className="av-porte" style={{ ["--e1" as string]: a, ["--e2" as string]: b }}>
        <span className="av-dos"><span className="av-dos-etoile">✦</span></span>
        <span className="av-face">
        <span className="av-porte-reflet" />
        <span className="av-givre" />
        <span className="av-num">{c.jour}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/avent/icones/${c.icone}.svg`} alt="" className="av-icone" draggable={false} />
        <span className="av-charniere av-ch-haut" /><span className="av-charniere av-ch-bas" />
        <span className="av-loquet" />
        {c.etat === "manquee" ? <span className="av-sceau">❄</span> : null}
        </span>
      </span>
      {ouvre ? <span className="av-lumiere" aria-hidden /> : null}
      <Paillettes actif={ouvre} />
    </button>
  );
}

// ── Le calendrier ────────────────────────────────────────────

export default function CalendrierAvent() {
  const compte = useCompteDiscord();
  const [apercu, setApercu] = useState<{ jeton: string; jour: number } | null>(null);
  const [etat, setEtat] = useState<Etat | null>(null);
  const [ferme, setFerme] = useState(false);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [ouvre, setOuvre] = useState<number | null>(null);
  const [refus, setRefus] = useState<number | null>(null);
  const [bulle, setBulle] = useState("");
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const minuteur = useRef(0);

  useEffect(() => { setApercu(lireApercu()); }, []);

  const charger = useCallback(async (corps: Record<string, unknown> = {}) => {
    setCharge(true); setErreur("");
    try {
      const a = lireApercu();
      setEtat(await appel({ action: "etat", ...(a ? { apercu: a } : {}), ...corps }));
    } catch (e) {
      if (e instanceof Ferme) setFerme(true);
      else if (e instanceof ConnexionRequise) compte.oublier();
      else setErreur(e instanceof Error ? e.message : "Impossible de joindre CycyBot.");
    } finally { setCharge(false); }
  }, [compte]);

  useEffect(() => {
    if (etat || charge || ferme) return;
    if (apercu || compte.joueur) charger();
    else if (compte.pret && !apercu) charger(); // calendrier pas publié : la page reste introuvable
  }, [apercu, compte.joueur, compte.pret, etat, charge, ferme, charger]);

  const dire = (t: string, jour: number) => {
    setBulle(t); setRefus(jour);
    window.clearTimeout(minuteur.current);
    minuteur.current = window.setTimeout(() => { setBulle(""); setRefus(null); }, 2600);
  };

  async function ouvrir(c: Case) {
    if (!etat || ouvre) return;
    if (c.etat === "ouverte") { if (c.gain) setResultat({ ...c.gain, jour: c.jour, given: null, test: Boolean(etat.apercu) }); return; }
    if (c.etat === "fermee") return dire(etat.aujourdhui === 0 ? "Patience : le calendrier s'ouvre le 1er décembre ❄️" : `Pas encore ! Cette case s'ouvrira le ${c.jour} décembre 🌙`, c.jour);
    if (c.etat === "manquee") return dire("Cette case est restée fermée : son jour est passé ❄️", c.jour);
    setOuvre(c.jour);
    try {
      const a = lireApercu();
      const [r] = await Promise.all([appel({ action: "ouvrir", jour: c.jour, ...(a ? { apercu: a } : {}) }), new Promise((ok) => setTimeout(ok, 1200))]);
      setEtat(r);
      setTimeout(() => { setResultat(r.resultat || null); setOuvre(null); }, 650);
    } catch (e) {
      setOuvre(null);
      if (e instanceof ConnexionRequise) compte.oublier();
      dire(e instanceof Error ? e.message : "La case est coincée, réessaie !", c.jour);
    }
  }

  // Page introuvable tant que le calendrier n'est pas publié (sauf aperçu de Cycy)
  if (ferme) {
    return (
      <div className="py-24 text-center">
        <p className="mb-4"><Icone nom="lune" className="w-12 h-12 text-lilac" /></p>
        <h1 className="text-2xl font-semibold text-ink mb-2">Cette page n&apos;existe pas (encore)</h1>
        <p className="text-ink-soft">Retourne explorer la galaxie : <Link href="/jeux" className="text-lilac underline">les jeux de Cycylive</Link>.</p>
      </div>
    );
  }

  const jour = etat?.aujourdhui || 0;
  const changerJour = (n: number) => {
    const p = new URLSearchParams(window.location.search); p.set("jour", String(n));
    window.history.replaceState(null, "", "?" + p.toString());
    setApercu(lireApercu()); setEtat(null); setResultat(null);
  };

  return (
    <div className="av-racine">
      {etat?.apercu ? (
        <div className="av-apercu">
          <strong><Icone nom="oeil" className="w-4 h-4 mr-1" />Aperçu privé</strong> · personne d&apos;autre ne voit cette page
          <label className="ml-2">Jour simulé :{" "}
            <select value={jour} onChange={(e) => changerJour(Number(e.target.value))}>
              {Array.from({ length: 25 }, (_, n) => n).map((n) => <option key={n} value={n}>{n === 0 ? "avant le 1er" : `${n} décembre`}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setResultat(null); charger({ action: "reinitialiser" }); }}><Icone nom="rejouer" className="w-4 h-4 mr-1" />Refermer mes cases de test</button>
          <span className="opacity-70">Les ouvertures de test n&apos;envoient aucun cadeau.</span>
        </div>
      ) : null}

      <section className="av-cadre">
        <Neige />
        <Ornement className="av-coin av-coin-hg" /><Ornement className="av-coin av-coin-hd" /><Ornement className="av-coin av-coin-bg" /><Ornement className="av-coin av-coin-bd" />
        <header className="av-tete">
          <p className="av-surtitre">Cycylive · {etat?.annee || 2026}</p>
          <h1 className="av-titre">{etat?.titre || "Calendrier de l’Avent"}</h1>
          <p className="av-sous">{etat?.sousTitre || "Une case à ouvrir chaque jour jusqu’à Noël"}</p>
          <div className="av-filet"><span /><i>✦</i><span /></div>
          {etat ? (
            <p className="av-consigne" aria-live="polite">
              {jour === 0 ? "Les cases s'ouvriront à partir du 1er décembre." : jour > 24 ? "Joyeux Noël ✨ Le calendrier est terminé : rendez-vous l'an prochain !" : etat.cases.find((c) => c.jour === jour)?.etat === "ouverte" ? `Case du ${jour} décembre ouverte ✨ Reviens demain pour la suivante !` : <>Aujourd&apos;hui, trouve la case <b>n°{jour}</b> et ouvre-la !</>}
            </p>
          ) : null}
        </header>

        {!etat ? (
          <div className="av-attente">
            {!apercu && compte.pret && !compte.joueur ? <BoutonDiscord erreur={compte.erreur} texte="Une case par jour et par compte Discord : ton cadeau arrive directement sur ton profil." /> : <p>{charge ? "CycyBot accroche les guirlandes…" : erreur}</p>}
          </div>
        ) : (
          <div className="av-grille">
            {etat.cases.map((c, i) => <CaseAvent key={c.jour} c={c} i={i} onOuvrir={ouvrir} ouvre={ouvre === c.jour} refus={refus === c.jour} />)}
          </div>
        )}
        {bulle ? <p className="av-bulle" role="status">{bulle}</p> : null}
        {etat && !etat.apercu ? <div className="mt-5 flex justify-center"><BandeauDiscord compte={compte} /></div> : null}
        {etat ? <p className="av-compte">{etat.ouvertes} / 24 cases ouvertes</p> : null}
      </section>

      {/* le cadeau */}
      {resultat ? (
        <div className="av-voile" onClick={() => setResultat(null)} role="dialog" aria-modal="true" aria-label={`Cadeau du ${resultat.jour} décembre`}>
          <div className="av-revele" onClick={(e) => e.stopPropagation()}>
            <span className="av-rayons" aria-hidden />
            <p className="av-revele-jour">{resultat.jour} décembre</p>
            <div className="av-revele-cadeau"><Cadeau gain={resultat} taille={120} /></div>
            <p className="av-revele-label">{resultat.figurine ? `Figurine ${resultat.figurine.nom}` : resultat.label}</p>
            {resultat.message ? <p className="av-revele-msg">« {resultat.message} »</p> : null}
            <p className="av-revele-info">{resultat.test ? "Ouverture de test : rien n'a été envoyé." : resultat.given ? "Ajouté à ton compte Discord ✨" : "Ton cadeau est sur ton compte Discord ✨"}</p>
            <button type="button" onClick={() => setResultat(null)}>Fermer</button>
          </div>
        </div>
      ) : null}

      <style>{`
        .av-racine{--or1:#fff4cf;--or2:#e7b85c;--or3:#9c6424;font-family:var(--font-sans)}
        .av-apercu{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin-bottom:14px;padding:10px 14px;border-radius:14px;border:1px dashed #e7b85c88;background:#1a1030;color:#f5e8c8;font-size:.86rem}
        .av-apercu select,.av-apercu button{background:#2a1a48;color:#fff;border:1px solid #e7b85c66;border-radius:999px;padding:5px 12px;font:inherit;cursor:pointer}
        .av-cadre{position:relative;overflow:hidden;border-radius:30px;padding:clamp(22px,4vw,48px) clamp(14px,3.5vw,44px) clamp(26px,4vw,44px);
          background:radial-gradient(120% 80% at 50% 0%,#2c1a55 0%,#160c2e 45%,#0b0618 100%);
          box-shadow:inset 0 0 0 1px #e7b85c55,inset 0 0 0 7px #0b0618,inset 0 0 0 8px #e7b85c33,0 30px 80px -30px #000}
        .av-coin{position:absolute;width:clamp(60px,9vw,110px);height:auto;pointer-events:none;opacity:.9}
        .av-coin-hg{left:10px;top:10px}
        @media (max-width:600px){.av-coin{width:40px;opacity:.55}.av-cadre{padding-top:34px}}.av-coin-hd{right:10px;top:10px;transform:scaleX(-1)}.av-coin-bg{left:10px;bottom:10px;transform:scaleY(-1)}.av-coin-bd{right:10px;bottom:10px;transform:scale(-1,-1)}
        .av-neige{position:absolute;inset:0;pointer-events:none}
        .av-neige span{position:absolute;top:-10px;border-radius:50%;background:#fff;opacity:.5;animation:av-tombe linear infinite}
        @keyframes av-tombe{to{transform:translate3d(18px,110vh,0)}}
        .av-tete{position:relative;text-align:center;margin-bottom:clamp(18px,3vw,30px)}
        .av-surtitre{letter-spacing:.42em;text-transform:uppercase;font-size:.72rem;color:#e7b85c;margin:0 0 6px}
        .av-titre{margin:0;font-family:var(--font-avent),"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:clamp(2.1rem,5.4vw,3.8rem);line-height:1.02;
          background:linear-gradient(180deg,#fff7df 0%,#f1c56a 55%,#b47a33 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 14px #f1c56a33)}
        .av-sous{margin:8px 0 0;color:#cfc3ea;font-size:clamp(.9rem,1.6vw,1.02rem)}
        .av-filet{display:flex;align-items:center;justify-content:center;gap:12px;margin:14px auto 0;max-width:340px;color:#e7b85c}
        .av-filet span{flex:1;height:1px;background:linear-gradient(90deg,transparent,#e7b85c,transparent)}
        .av-filet i{font-style:normal;font-size:.8rem}
        .av-consigne{margin:14px 0 0;color:#f5e8c8;font-size:.98rem}.av-consigne b{color:#f1c56a;font-family:var(--font-avent),"Cormorant Garamond",Georgia,serif;font-size:1.25rem}
        .av-attente{min-height:280px;display:grid;place-items:center;color:#cfc3ea;position:relative}
        .av-grille{position:relative;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:clamp(8px,1.4vw,16px);max-width:980px;margin:0 auto}
        @media (max-width:720px){.av-grille{grid-template-columns:repeat(4,minmax(0,1fr))}}
        @media (max-width:380px){.av-grille{grid-template-columns:repeat(3,minmax(0,1fr))}}
        .av-case{position:relative;aspect-ratio:5/6;border:0;padding:0;background:none;cursor:pointer;perspective:900px;border-radius:14px;-webkit-tap-highlight-color:transparent}
        .av-case:focus-visible{outline:2px solid #f1c56a;outline-offset:3px}
        .av-niche{position:absolute;inset:0;border-radius:14px;overflow:hidden;background:#07030f;box-shadow:inset 0 6px 18px #000,inset 0 0 0 1px #e7b85c55}
        .av-niche-fond{position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 55%,#3b2470 0%,#120826 70%),radial-gradient(1px 1px at 20% 30%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 70% 20%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 60% 75%,#fff 50%,transparent 51%);opacity:.9}
        .av-niche-cadeau{position:absolute;inset:0;display:grid;place-items:center;opacity:.55;filter:saturate(.7)}
        .av-niche-jour{position:absolute;left:8px;top:6px;font-family:var(--font-avent),"Cormorant Garamond",Georgia,serif;font-size:.9rem;color:#e7b85c99}
        .av-porte{position:absolute;inset:0;border-radius:14px;transform-origin:0% 50%;transition:transform 1s cubic-bezier(.3,.9,.25,1);transform-style:preserve-3d}
        .av-face,.av-dos{position:absolute;inset:0;border-radius:14px;backface-visibility:hidden;-webkit-backface-visibility:hidden}
        .av-face{background:linear-gradient(160deg,var(--e1),var(--e2));
          box-shadow:inset 0 0 0 1px #e7b85cbb,inset 0 0 0 5px #e7b85c40,inset 0 14px 22px -14px #ffffff30,inset 0 -18px 26px -16px #00000080,0 8px 18px -8px #000c;
          display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;transition:box-shadow .4s}
        .av-dos{transform:rotateY(180deg);background:linear-gradient(200deg,#1c1036,#0c0619);box-shadow:inset 0 0 0 1px #e7b85c99,inset 0 0 0 6px #0c0619,inset 0 0 0 7px #e7b85c33;display:grid;place-items:center}
        .av-dos-etoile{color:#e7b85c88;font-size:1.3rem}
        .av-case:hover .av-porte{transform:rotateY(-10deg)}
        .av-case:hover .av-face{box-shadow:inset 0 0 0 1px #f1c56a,inset 0 0 0 5px #e7b85c55,0 12px 26px -10px #000,0 0 22px -6px #f1c56a66}
        .av-case.est-ouverte{cursor:zoom-in;z-index:2}
        .av-case.est-ouverte .av-porte{transform:rotateY(-76deg)}
        .av-lumiere{position:absolute;inset:-20%;border-radius:50%;pointer-events:none;background:radial-gradient(circle,#fff4cfcc 0%,#f1c56a66 25%,transparent 60%);mix-blend-mode:screen;animation:av-lum 1.4s ease-out forwards;z-index:1}
        @keyframes av-lum{0%{opacity:0;transform:scale(.4)}35%{opacity:1}100%{opacity:0;transform:scale(1.25)}}
        .av-porte-reflet{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,#ffffff12 45%,transparent 60%);transform:translateX(-60%);transition:transform 1.2s}
        .av-case:hover .av-porte-reflet{transform:translateX(60%)}
        .av-givre{position:absolute;left:6px;right:6px;top:0;height:10px;border-radius:0 0 8px 8px;background:radial-gradient(10px 7px at 15% 0,#f4f1ff 98%,transparent),radial-gradient(14px 9px at 45% 0,#f4f1ff 98%,transparent),radial-gradient(9px 6px at 72% 0,#f4f1ff 98%,transparent),radial-gradient(12px 8px at 92% 0,#f4f1ff 98%,transparent);opacity:.75}
        .av-num{font-family:var(--font-avent),"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:clamp(1.25rem,2.6vw,2rem);line-height:1;letter-spacing:.02em;
          background:linear-gradient(180deg,#fff7df,#e7b85c 60%,#b47a33);-webkit-background-clip:text;background-clip:text;color:transparent;margin-top:6%}
        .av-icone{width:56%;max-width:76px;height:auto;margin-top:6%;filter:drop-shadow(0 3px 6px #0009)}
        .av-charniere{position:absolute;left:-1px;width:4px;height:13%;border-radius:2px;background:linear-gradient(90deg,#9c6424,#f1c56a,#9c6424)}
        .av-ch-haut{top:18%}.av-ch-bas{bottom:18%}
        .av-loquet{position:absolute;right:5px;top:50%;width:5px;height:16%;transform:translateY(-50%);border-radius:3px;background:linear-gradient(180deg,#fff4cf,#c08a3e);box-shadow:0 0 6px #f1c56a66}
        .av-case.est-manquee .av-face{filter:saturate(.45) brightness(.82)}
        .av-case.est-manquee .av-face::after{content:"";position:absolute;inset:0;border-radius:14px;background:linear-gradient(180deg,#dbeafe1f,#dbeafe08 40%,#00000030);pointer-events:none}
        .av-sceau{position:absolute;right:8px;bottom:8px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;color:#e0f2fe;background:#ffffff1a;box-shadow:inset 0 0 0 1px #e0f2fe55}
        .av-refus .av-face{animation:av-non .45s}
        @keyframes av-non{20%{transform:rotateY(-6deg) translateX(-2px)}40%{transform:rotateY(4deg) translateX(2px)}60%{transform:rotateY(-3deg)}80%{transform:rotateY(2deg)}}
        .av-paillettes{position:absolute;left:50%;top:50%;pointer-events:none;z-index:3}
        .av-paillettes i{position:absolute;width:6px;height:6px;border-radius:2px;opacity:0;animation:av-pail 1s ease-out .35s forwards}
        @keyframes av-pail{0%{transform:rotate(var(--a)) translateY(0) scale(1);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(-1*var(--d))) scale(.2);opacity:0}}
        .av-case.est-ouverte .av-niche{box-shadow:inset 0 6px 18px #000,inset 0 0 0 1px #e7b85c66,0 0 26px -6px #f1c56a55}
        .av-bulle{position:relative;margin:16px auto 0;width:fit-content;max-width:90%;padding:9px 16px;border-radius:999px;background:#fff4cf;color:#4a2b12;font-weight:600;font-size:.92rem;box-shadow:0 10px 24px -10px #000}
        .av-compte{position:relative;margin:14px 0 0;text-align:center;color:#a99cc8;font-size:.82rem;letter-spacing:.08em}
        .av-voile{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:20px;background:#05020dcc;backdrop-filter:blur(4px);animation:av-app .3s ease-out}
        @keyframes av-app{from{opacity:0}}
        .av-revele{position:relative;overflow:hidden;width:min(380px,92vw);text-align:center;padding:30px 24px 22px;border-radius:26px;background:radial-gradient(90% 70% at 50% 25%,#3a2266,#170c30 70%);box-shadow:inset 0 0 0 1px #e7b85c99,inset 0 0 0 6px #170c30,inset 0 0 0 7px #e7b85c44,0 30px 80px -20px #000;animation:av-pop .55s cubic-bezier(.3,1.5,.5,1)}
        @keyframes av-pop{from{transform:scale(.7) translateY(20px);opacity:0}}
        .av-rayons{position:absolute;left:50%;top:38%;width:560px;height:560px;margin:-280px 0 0 -280px;background:repeating-conic-gradient(#f1c56a26 0 8deg,transparent 8deg 22deg);-webkit-mask:radial-gradient(circle,#000 8%,transparent 60%);mask:radial-gradient(circle,#000 8%,transparent 60%);animation:av-tourne 18s linear infinite}
        @keyframes av-tourne{to{transform:rotate(360deg)}}
        .av-revele-jour{position:relative;margin:0;letter-spacing:.3em;text-transform:uppercase;font-size:.72rem;color:#e7b85c}
        .av-revele-cadeau{position:relative;margin:16px 0 10px;animation:av-flotte 3s ease-in-out infinite}
        @keyframes av-flotte{50%{transform:translateY(-6px)}}
        .av-revele-label{position:relative;margin:0;font-family:var(--font-avent),"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:1.7rem;line-height:1.15;color:#fff4cf}
        .av-revele-msg{position:relative;margin:8px 0 0;color:#d9ccf5;font-style:italic}
        .av-revele-info{position:relative;margin:12px 0 0;color:#a99cc8;font-size:.84rem}
        .av-revele button{position:relative;margin-top:16px;border:1px solid #e7b85c88;background:#2a1a48;color:#fff4cf;border-radius:999px;padding:8px 22px;font:inherit;cursor:pointer}
        @media (prefers-reduced-motion: reduce){.av-neige span,.av-rayons,.av-revele-cadeau{animation:none}.av-porte{transition:none}}
      `}</style>
    </div>
  );
}
