"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { idAppareil } from "@/components/arcade/appareil";

// ============================================================
// TICKET À GRATTER — un ticket gratuit par jour
// ============================================================
// Le gain est tiré par CycyBot (bot.cycylive.fr/api/scratch), qui
// donne aussi un code. On gratte ici, puis on tape /gratter sur Discord et on colle le code
// sur Discord pour recevoir le gain (XP, Éclats, booster, fragment).

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const DISCORD = "https://discord.gg/sER6tztDSz";
const CLE_GRATTE = "cycylive-ticket-gratte"; // code du dernier ticket déjà gratté

type Gain = { key: string; emoji: string; label: string; rarity: string; rarityLabel: string };
type Ticket = { code: string; prize: Gain; again: boolean; redeemed: boolean };

const COULEURS: Record<string, { fond: string; texte: string; halo: string }> = {
  commune: { fond: "#2a2440", texte: "#d6d0ea", halo: "rgba(214,208,234,0.25)" },
  peu: { fond: "#173a2f", texte: "#7ee2a8", halo: "rgba(126,226,168,0.35)" },
  rare: { fond: "#132a4a", texte: "#7ec8ff", halo: "rgba(126,200,255,0.4)" },
  epique: { fond: "#2e1550", texte: "#cdb4ff", halo: "rgba(168,85,247,0.5)" },
  legendaire: { fond: "#3d2e0c", texte: "#facc15", halo: "rgba(250,204,21,0.55)" },
  mythique: { fond: "#3b1033", texte: "#f9a8d4", halo: "rgba(244,114,182,0.6)" },
};

const GAINS_POSSIBLES = [
  ["⭐", "Points stellaires", "Commun à peu commun"],
  ["✦", "Éclats", "Commun à peu commun"],
  ["🎴", "Booster de Cartes Astrales", "Rare"],
  ["🧩", "Fragment d'étoile", "Rare"],
  ["💫", "Points + Éclats", "Épique"],
  ["🌠", "2 boosters + 1 fragment", "Légendaire"],
  ["🌈", "Jackpot : 3 boosters + 3 fragments + 250 Éclats", "Mythique"],
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
    const g = ctx.createLinearGradient(0, 0, l, h);
    g.addColorStop(0, "#b9b4c9");
    g.addColorStop(0.45, "#e9e6f2");
    g.addColorStop(0.55, "#cfc9de");
    g.addColorStop(1, "#9d97b3");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, l, h);
    // petites étoiles et paillettes
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.5})`;
      ctx.fillRect(Math.random() * l, Math.random() * h, 2, 2);
    }
    ctx.fillStyle = "rgba(60,40,110,0.75)";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ GRATTE ICI ✨", l / 2, h / 2 + 2);
    ctx.font = "500 13px system-ui, sans-serif";
    ctx.fillText("avec ta souris ou ton doigt", l / 2, h / 2 + 24);
  }, []);

  const gratter = (x: number, y: number) => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || fini.current) return;
    const r = c.getBoundingClientRect();
    const px = x - r.left, py = y - r.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 46;
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
      className="absolute inset-0 w-full h-full rounded-2xl touch-none cursor-grab active:cursor-grabbing"
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

export default function TicketAGratter() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [etat, setEtat] = useState<"attente" | "chargement" | "erreur">("attente");
  const [erreur, setErreur] = useState("");
  const [revele, setRevele] = useState(false);
  const [copie, setCopie] = useState(false);

  const obtenir = useCallback(async () => {
    setEtat("chargement");
    setErreur("");
    try {
      const r = await fetch(`${BOT}/api/scratch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appareil: idAppareil() }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.error || "Ticket indisponible pour le moment.");
      setTicket(d);
      setRevele(Boolean(d.again && lire(CLE_GRATTE) === d.code));
      setEtat("attente");
    } catch (e) {
      setErreur(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Impossible de joindre CycyBot pour le moment. Réessaie dans un instant.");
      setEtat("erreur");
    }
  }, []);

  const finir = useCallback(() => {
    setRevele(true);
    if (ticket) ecrire(CLE_GRATTE, ticket.code);
  }, [ticket]);

  const couleur = COULEURS[ticket?.prize.rarity || "commune"] || COULEURS.commune;
  const code = ticket ? ticket.code : "";

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
      <div className="carte-holo rounded-3xl border border-violet/20 p-5 md:p-8 shadow-glow-sm">
        {!ticket ? (
          <div className="text-center py-10 md:py-16">
            <p className="text-5xl mb-4" aria-hidden>
              🎟️
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-2">Ton ticket galactique du jour</h2>
            <p className="text-ink-soft max-w-lg mx-auto mb-6">
              Un ticket gratuit chaque jour. Gratte-le pour découvrir ton gain : points stellaires, Éclats, booster de Cartes Astrales,
              fragment d&apos;étoile… et peut-être le jackpot 🌈
            </p>
            <button
              type="button"
              onClick={obtenir}
              disabled={etat === "chargement"}
              className="rounded-full px-7 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
            >
              {etat === "chargement" ? "Impression du ticket…" : "Obtenir mon ticket"}
            </button>
            {etat === "erreur" && <p className="text-sm text-red-300 mt-4">{erreur}</p>}
          </div>
        ) : (
          <div>
            {/* Le ticket */}
            <div
              className="relative mx-auto max-w-xl rounded-3xl p-5 md:p-6 border border-white/10"
              style={{ background: "linear-gradient(135deg, #1d1438 0%, #2a1857 55%, #1a0f38 100%)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-display text-sm tracking-[0.25em] text-lilac uppercase">Ticket galactique</p>
                <p className="text-xs text-ink-soft/60 font-mono">{revele ? ticket.code : "CYCY-••••-••••"}</p>
              </div>
              <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden">
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-all"
                  style={{ background: `radial-gradient(circle at 50% 40%, ${couleur.halo}, ${couleur.fond} 70%)` }}
                >
                  <p className="text-6xl md:text-7xl mb-2" aria-hidden>
                    {ticket.prize.emoji}
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-ink">{ticket.prize.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: couleur.texte }}>
                    {ticket.prize.rarityLabel}
                  </p>
                </div>
                {!revele && <CoucheAGratter onFini={finir} />}
              </div>
              <div className="mt-4 border-t border-dashed border-white/15 pt-3 text-xs text-ink-soft/60 flex justify-between">
                <span>1 ticket par jour · valable 48 h</span>
                <span>Cycylive</span>
              </div>
            </div>

            {revele ? (
              <div className="mt-6 text-center" aria-live="polite">
                {ticket.redeemed ? (
                  <p className="text-ink-soft">Ce ticket a déjà été récupéré sur Discord. Reviens demain pour un nouveau ticket !</p>
                ) : (
                  <>
                    <p className="text-ink font-semibold text-lg mb-1">
                      {["legendaire", "mythique"].includes(ticket.prize.rarity) ? "🎉 Incroyable !" : "Bravo !"} Récupère ton gain sur Discord :
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
                    <p className="text-xs text-ink-soft/50 mt-3">Code valable 48 h · un gain récupéré par jour</p>
                  </>
                )}
              </div>
            ) : (
              <p className="mt-5 text-center text-sm text-ink-soft">Gratte la zone argentée pour découvrir ton gain ✨</p>
            )}
          </div>
        )}
      </div>

      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="text-lg font-semibold text-ink mb-3">Comment ça marche ?</h2>
        <ol className="space-y-2 text-sm text-ink-soft mb-5 list-decimal list-inside">
          <li>Prends ton ticket gratuit (1 par jour).</li>
          <li>Gratte la zone argentée pour voir ton gain.</li>
          <li>Copie ton code avec le bouton « Copier le code ».</li>
          <li>
            Dans le salon CycyBot du{" "}
            <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="text-lilac underline">
              Discord
            </a>
            , tape <code className="text-lilac">/gratter</code> puis colle seulement le code dans la case « code » : le gain arrive sur ton profil.
          </li>
        </ol>
        <h3 className="text-sm font-semibold text-ink mb-2">Gains possibles</h3>
        <ul className="space-y-1.5 text-sm">
          {GAINS_POSSIBLES.map(([e, nom, rarete]) => (
            <li key={nom} className="flex items-center gap-2">
              <span aria-hidden className="w-6 text-center">
                {e}
              </span>
              <span className="flex-1 text-ink-soft">{nom}</span>
              <span className="text-xs text-ink-soft/60 whitespace-nowrap">{rarete}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-soft/50 mt-4">Plus le gain est gros, plus il est rare. Il faut être membre du Discord Cycylive pour récupérer son gain.</p>
      </aside>
    </div>
  );
}
