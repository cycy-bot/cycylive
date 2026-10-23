"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icone, { Pastille } from "@/components/icones/Icone";
import { idAppareil } from "@/components/arcade/appareil";
import Sticker, { stickerDuGain, type NomSticker } from "@/components/arcade/Stickers";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";

// ============================================================
// TICKET À GRATTER — un ticket gratuit par jour (illustration : public/ticket/ticket.webp)
// ============================================================
// Le gain est tiré par CycyBot (bot.cycylive.fr/api/scratch), qui
// donne aussi un code. On gratte ici, puis on tape /gratter sur Discord et on colle le code
// sur Discord pour recevoir le gain (XP, Éclats, booster, fragment).

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const DISCORD = "https://discord.gg/sER6tztDSz";
const CLE_GRATTE = "cycylive-ticket-gratte"; // code du dernier ticket déjà gratté

type Gain = { key: string; emoji: string; label: string; rarity: string; rarityLabel: string };
type Ticket = { code: string; prize: Gain; again: boolean; redeemed: boolean; credited?: boolean; given?: string[]; note?: string; bonus?: number; encore?: boolean };

const COULEURS: Record<string, { fond: string; texte: string; halo: string }> = {
  commune: { fond: "#2a2440", texte: "#d6d0ea", halo: "rgba(214,208,234,0.25)" },
  peu: { fond: "#173a2f", texte: "#7ee2a8", halo: "rgba(126,226,168,0.35)" },
  rare: { fond: "#132a4a", texte: "#7ec8ff", halo: "rgba(126,200,255,0.4)" },
  epique: { fond: "#2e1550", texte: "#cdb4ff", halo: "rgba(168,85,247,0.5)" },
  legendaire: { fond: "#3d2e0c", texte: "#facc15", halo: "rgba(250,204,21,0.55)" },
  mythique: { fond: "#3b1033", texte: "#f9a8d4", halo: "rgba(244,114,182,0.6)" },
};

const GAINS_POSSIBLES: [NomSticker, string, string][] = [
  ["points", "Points stellaires", "Commun à peu commun"],
  ["eclats", "Éclats", "Commun à peu commun"],
  ["booster", "Booster de Cartes Astrales", "Rare"],
  ["fragment", "Fragment d'étoile", "Rare"],
  ["combo", "Points + Éclats", "Épique"],
  ["pack", "2 boosters + 1 fragment", "Légendaire"],
  ["tresor", "Jackpot : 3 boosters + 3 fragments + 250 Éclats", "Mythique"],
];

function lire(cle: string): string {
  try {
    return localStorage.getItem(cle) || "";
  } catch {
    return "";
  }
}
function ecrire(cle: string, v: string) {
  try {
    localStorage.setItem(cle, v);
  } catch {
    /* navigateur sans stockage */
  }
}

/** Couche argentée à gratter (canvas). onFini() quand assez de surface est grattée. */
function CoucheAGratter({ onFini }: { onFini: () => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const fini = useRef(false);
  const dernier = useRef<{ x: number; y: number } | null>(null);
  const traits = useRef(0);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const l = c.clientWidth, h = c.clientHeight;
    c.width = Math.round(l * ratio);
    c.height = Math.round(h * ratio);
    ctx.scale(ratio, ratio);
    // argent holographique, aux couleurs du ticket (lilas, rose, doré)
    const g = ctx.createLinearGradient(0, 0, l, h);
    g.addColorStop(0, "#c9c1e6");
    g.addColorStop(0.3, "#f1ecfb");
    g.addColorStop(0.5, "#d9cdf0");
    g.addColorStop(0.68, "#f6e7f3");
    g.addColorStop(1, "#b7acd9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, l, h);
    const reflet = ctx.createLinearGradient(0, 0, l, 0);
    reflet.addColorStop(0.2, "rgba(255,255,255,0)");
    reflet.addColorStop(0.42, "rgba(255,255,255,.55)");
    reflet.addColorStop(0.5, "rgba(255,215,160,.35)");
    reflet.addColorStop(0.62, "rgba(255,255,255,0)");
    ctx.fillStyle = reflet;
    ctx.fillRect(0, 0, l, h);
    // paillettes et petites étoiles dorées
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.6})`;
      ctx.fillRect(Math.random() * l, Math.random() * h, 1.6, 1.6);
    }
    const etoile = (x: number, y: number, r: number, c: string) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.fill();
    };
    for (let i = 0; i < 16; i++) etoile(Math.random() * l, Math.random() * h, 3 + Math.random() * 6, i % 3 ? "rgba(214,170,90,.55)" : "rgba(150,110,210,.45)");
    const t = Math.max(15, Math.min(30, l / 15));
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(70,40,120,0.82)";
    ctx.font = `800 ${t}px system-ui, sans-serif`;
    ctx.fillText("✦ GRATTE ICI ✦", l / 2, h / 2 + t * 0.2);
    ctx.font = `500 ${Math.round(t * 0.55)}px system-ui, sans-serif`;
    ctx.fillStyle = "rgba(70,40,120,0.6)";
    ctx.fillText("avec ta souris ou ton doigt", l / 2, h / 2 + t * 1.15);
  }, []);

  const gratter = (x: number, y: number) => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || fini.current) return;
    const r = c.getBoundingClientRect();
    const px = x - r.left, py = y - r.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = Math.max(30, r.width / 12);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const d = dernier.current || { x: px, y: py };
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(px, py);
    ctx.stroke();
    dernier.current = { x: px, y: py };
    traits.current += 1;
    if (traits.current % 8 === 0) {
      // Part grattée (échantillon d'un pixel sur 16)
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let vides = 0, total = 0;
      for (let i = 3; i < data.length; i += 64) {
        total++;
        if (data[i] < 40) vides++;
      }
      if (vides / total > 0.5) {
        fini.current = true;
        onFini();
      }
    }
  };

  return (
    <canvas
      ref={ref}
      aria-label="Zone à gratter"
      className="absolute inset-0 w-full h-full touch-none cursor-grab active:cursor-grabbing"
      style={{ width: "100%", height: "100%" }}
      onPointerDown={(e) => {
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        dernier.current = null;
        gratter(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.buttons || e.pointerType === "touch") gratter(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        dernier.current = null;
      }}
    />
  );
}

/** « **+15** points stellaires » → texte simple. */
const sansMarkdown = (t: string) => t.replace(/\*\*/g, "");

export default function TicketAGratter() {
  const compte = useCompteDiscord();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [etat, setEtat] = useState<"attente" | "chargement" | "erreur">("attente");
  const [erreur, setErreur] = useState("");
  const [revele, setRevele] = useState(false);
  const [couche, setCouche] = useState(true); // la couche à gratter reste un instant pour s'effacer en fondu
  const [copie, setCopie] = useState(false);

  const obtenir = useCallback(async () => {
    setEtat("chargement");
    setErreur("");
    try {
      const r = await fetch(`${BOT}/api/scratch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appareil: idAppareil(), session: sessionDiscord() }) });
      const d = await r.json().catch(() => ({}));
      if (d.connexion) compte.oublier();
      if (!r.ok || !d.ok) throw new Error(d.error || "Ticket indisponible pour le moment.");
      setTicket(d);
      const deja = Boolean(d.again && lire(CLE_GRATTE) === d.code);
      setRevele(deja);
      setCouche(!deja);
      setEtat("attente");
    } catch (e) {
      setErreur(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Impossible de joindre CycyBot pour le moment. Réessaie dans un instant.");
      setEtat("erreur");
    }
  }, [compte.oublier]); // eslint-disable-line react-hooks/exhaustive-deps

  const finir = useCallback(() => {
    setRevele(true);
    setTimeout(() => setCouche(false), 750);
    if (ticket) ecrire(CLE_GRATTE, ticket.code);
  }, [ticket]);

  const couleur = COULEURS[ticket?.prize.rarity || "commune"] || COULEURS.commune;
  const code = ticket ? ticket.code : "";

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
      <div className="carte-holo rounded-3xl border border-violet/20 p-5 md:p-8 shadow-glow-sm">
        {!ticket ? (
          <div className="text-center py-10 md:py-16">
            <Pastille nom="ticket" teinte="or" taille="lg" className="mb-4" />
            <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-2">Ton ticket galactique du jour</h2>
            <p className="text-ink-soft max-w-lg mx-auto mb-6">
              Un ticket gratuit chaque jour. Gratte-le pour découvrir ton gain : points stellaires, Éclats, booster de Cartes Astrales,
              fragment d&apos;étoile… et peut-être le jackpot !
            </p>
            {compte.joueur ? (
              <>
                <button
                  type="button"
                  onClick={obtenir}
                  disabled={etat === "chargement"}
                  className="rounded-full px-7 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {etat === "chargement" ? "Impression du ticket…" : "Obtenir mon ticket"}
                </button>
                <div className="mt-4">
                  <BandeauDiscord compte={compte} />
                </div>
              </>
            ) : compte.pret ? (
              <BoutonDiscord erreur={compte.erreur} texte="Un ticket par jour et par compte Discord : ton gain arrive directement sur ton profil, sans code à copier." />
            ) : (
              <div className="h-12" aria-hidden />
            )}
            {etat === "erreur" && <p className="text-sm text-red-300 mt-4">{erreur}</p>}
          </div>
        ) : (
          <div>
            {/* Le ticket (illustration de Cycylive) : la zone à gratter est calée sur le cadre crème,
                le numéro dans la pastille « N° ». Les positions sont en % de l'image (1349 × 864). */}
            <div className="tk-ticket relative mx-auto w-full max-w-2xl" style={{ aspectRatio: "1349 / 864", containerType: "inline-size" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ticket/ticket.webp" alt="Ticket galactique" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none drop-shadow-[0_18px_30px_rgba(10,4,30,.55)]" />
              {/* numéro du ticket, dans la pastille */}
              <p
                className="absolute flex items-center overflow-hidden whitespace-nowrap font-mono font-bold text-[#4a2a6e]"
                style={{ left: "79.2%", top: "6.4%", width: "14.6%", height: "5.3%", fontSize: "2.35cqw", letterSpacing: "0.06em" }}
                aria-label={`Ticket numéro ${revele ? code : "caché"}`}
              >
                {revele ? code.replace(/^CYCY-/, "") : "••••-••••"}
              </p>
              {/* zone à gratter */}
              <div className="absolute overflow-hidden" style={{ left: "10.9%", top: "19.4%", width: "78.3%", height: "59.4%", borderRadius: "2.2cqw" }}>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                  style={{ background: `radial-gradient(ellipse 60% 70% at 50% 45%, ${couleur.halo}, transparent 72%)` }}
                >
                  <div className={`drop-shadow-[0_6px_14px_rgba(60,20,90,0.35)] ${revele ? "tk-pop" : ""}`} aria-hidden style={{ width: "17cqw" }}>
                    <Sticker nom={stickerDuGain(ticket.prize.key, ticket.prize.label)} taille={120} className="h-auto w-full" />
                  </div>
                  <p className="mt-[1cqw] font-semibold leading-tight text-[#2b1640]" style={{ fontSize: "3.4cqw" }}>{ticket.prize.label}</p>
                  <p className="mt-[0.8cqw] rounded-full px-[1.8cqw] py-[0.4cqw] font-bold uppercase tracking-widest text-white" style={{ fontSize: "1.6cqw", background: couleur.fond, boxShadow: `0 0 14px ${couleur.halo}` }}>
                    {ticket.prize.rarityLabel}
                  </p>
                </div>
                {revele ? (
                  <div className="pointer-events-none absolute inset-0" aria-hidden>
                    {Array.from({ length: 16 }, (_, i) => (
                      <span key={i} className="tk-paillette" style={{ ["--a" as string]: `${(i / 16) * 360}deg`, ["--d" as string]: `${14 + (i % 3) * 6}cqw`, background: ["#f5c46b", "#c9a8ff", "#ff9ad5", "#ffffff"][i % 4], animationDelay: `${(i % 4) * 50}ms` }} />
                    ))}
                  </div>
                ) : null}
                {couche && (
                  <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: revele ? 0 : 1 }}>
                    <CoucheAGratter onFini={finir} />
                  </div>
                )}
              </div>
            </div>
            <style>{`
              .tk-pop{animation:tk-pop .6s cubic-bezier(.3,1.7,.5,1) both}
              @keyframes tk-pop{from{transform:scale(.4) rotate(-10deg);opacity:0}}
              .tk-paillette{position:absolute;left:50%;top:42%;width:1.1cqw;height:1.1cqw;border-radius:2px;opacity:0;animation:tk-paillette 1s ease-out forwards}
              @keyframes tk-paillette{0%{transform:rotate(var(--a)) translateY(0) scale(1);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(.2);opacity:0}}
              @media (prefers-reduced-motion: reduce){.tk-pop,.tk-paillette{animation:none}}
            `}</style>

            {revele ? (
              <div className="mt-6 text-center" aria-live="polite">
                {ticket.credited ? (
                  <div>
                    <p className="text-ink font-semibold text-lg mb-1">
                      <Icone nom="valide" className="w-5 h-5 mr-1.5 text-emerald-300" />
                      {ticket.given ? "Ajouté à ton compte Discord !" : "Ton gain du jour est déjà sur ton compte Discord."}
                    </p>
                    {ticket.given && <p className="text-ink-soft">{ticket.given.map(sansMarkdown).join(" · ")}</p>}
                    {ticket.encore ? (
                      <button type="button" onClick={obtenir} disabled={etat === "chargement"} className="mt-4 rounded-full bg-gradient-to-b from-[#ffe08a] to-[#f5b84a] px-6 py-2.5 font-semibold text-[#3a2048] shadow-[0_0_20px_rgba(245,184,74,.45)] hover:brightness-110 disabled:opacity-60">
                        🎁 {etat === "chargement" ? "Impression du ticket bonus…" : "Gratter mon ticket bonus du jour"}
                      </button>
                    ) : (
                      <p className="text-xs text-ink-soft/60 mt-3">Un nouveau ticket t&apos;attend demain, dès minuit.</p>
                    )}
                  </div>
                ) : ticket.redeemed ? (
                  <p className="text-ink-soft">Ce ticket a déjà été récupéré sur Discord. Reviens demain pour un nouveau ticket !</p>
                ) : (
                  <>
                    {ticket.note && <p className="text-sm text-amber-200 mb-3 max-w-md mx-auto">{ticket.note}</p>}
                  <>
                    <p className="text-ink font-semibold text-lg mb-1">
                      {["legendaire", "mythique"].includes(ticket.prize.rarity) ? "Incroyable !" : "Bravo !"} Récupère ton gain sur Discord :
                    </p>
                    {/* Sur ordinateur, une commande collée en entier n'est pas reconnue par Discord : on ne copie que le code */}
                    <ol className="text-ink-soft text-sm mb-4 mx-auto max-w-md text-left space-y-1 list-decimal list-inside">
                      <li>Copie ton code avec le bouton <strong className="text-ink">Copier le code</strong>.</li>
                      <li>
                        Dans le salon <strong className="text-ink">CycyBot</strong> du Discord, tape <code className="text-lilac">/gratter</code> et choisis la commande.
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
                          navigator.clipboard?.writeText(code).then(() => {
                            setCopie(true);
                            setTimeout(() => setCopie(false), 2000);
                          }).catch(() => {});
                        }}
                        className="rounded-full px-5 py-2.5 bg-violet/20 border border-violet/40 text-ink text-sm font-medium hover:bg-violet/30"
                      >
                        {copie ? "Code copié ✓" : "Copier le code"}
                      </button>
                      <a
                        href={DISCORD}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full px-4 py-2.5 bg-violet text-ink text-sm font-medium hover:bg-violet-light"
                      >
                        Ouvrir Discord
                      </a>
                    </div>
                    <p className="text-xs text-ink-soft/60 mt-3">Code valable 48 h · un gain récupéré par jour</p>
                  </>
                  </>
                )}
              </div>
            ) : (
              <p className="mt-5 text-center text-sm text-ink-soft">Gratte la zone argentée pour découvrir ton gain.</p>
            )}
          </div>
        )}
      </div>

      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="text-lg font-semibold text-ink mb-3">Comment ça marche ?</h2>
        <ol className="space-y-2 text-sm text-ink-soft mb-5 list-decimal list-inside">
          <li>
            Connecte-toi avec ton compte du{" "}
            <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="text-lilac underline">
              Discord Cycylive
            </a>
            .
          </li>
          <li>Prends ton ticket gratuit (1 par jour et par compte).</li>
          <li>Gratte la zone argentée pour voir ton gain.</li>
          <li>C&apos;est tout : le gain arrive directement sur ton profil Discord.</li>
        </ol>
        <h3 className="text-sm font-semibold text-ink mb-2">Gains possibles</h3>
        <ul className="space-y-1.5 text-sm">
          {GAINS_POSSIBLES.map(([e, nom, rarete]) => (
            <li key={nom} className="flex items-center gap-2">
              <Sticker nom={e} taille={24} />
              <span className="flex-1 text-ink-soft">{nom}</span>
              <span className="text-xs text-ink-soft/60 whitespace-nowrap">{rarete}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-soft/60 mt-4">Plus le gain est gros, plus il est rare. Il faut être membre du Discord Cycylive pour récupérer son gain.</p>
      </aside>
    </div>
  );
}
