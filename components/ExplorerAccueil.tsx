// Accueil · « À explorer » : quatre portes d'entrée vers le reste du site, avec un visuel chacune.
import Link from "next/link";
import Image from "next/image";
import MiniatureJeu from "@/components/arcade/MiniatureJeu";
import { IconArrowRight } from "@/components/Icons";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import EmblemeRang from "@/components/gaming/EmblemeRang";
import { PALIERS, rangActuel, type Rang } from "@/lib/rangValorant";
import { lireProfilValorant } from "@/lib/valorantStore";
import { lireClassement, type LigneClassement } from "@/lib/cycybot";
import { lireRecords } from "@/lib/recordsJeux";
import { jeuParId, jeuxArcade, jeuxQuotidiens } from "@/lib/jeux";

// Une source lente ne doit jamais retarder l'accueil : 3 s au plus, sinon on dessine sans elle
const auPlus = <T,>(p: Promise<T>, ms = 3000): Promise<T | null> =>
  Promise.race([p.catch(() => null), new Promise<null>((r) => setTimeout(() => r(null), ms))]);

type RecordVedette = { jeu: string; nom: string; score: number } | null;

async function donneesVivantes(): Promise<{ rang: Rang | null; podium: LigneClassement[]; record: RecordVedette }> {
  const [rang, classement, records] = await Promise.all([
    auPlus(lireProfilValorant().then((p) => rangActuel(p.riotName, p.riotTag, p.riotRegion, p.rankActuel))),
    auPlus(lireClassement("messages", "week")),
    auPlus(lireRecords()),
  ]);
  // Un record à mettre en avant : Cycy Runner en priorité, sinon le premier jeu qui en a un
  const ids = ["runner", ...Object.keys(records ?? {}).filter((k) => k !== "runner")];
  const id = ids.find((k) => records?.[k]);
  const r = id ? records![id] : null;
  return { rang, podium: (classement?.entries ?? []).slice(0, 3), record: r && id ? { jeu: jeuParId(id)?.nom ?? id, nom: r.nom, score: r.score } : null };
}

// ── Les jeux : une mosaïque de bornes (vraies miniatures des jeux) et le record du moment ──
function VisuelJeux({ record }: { record: RecordVedette }) {
  const tuiles: [string, string][] = [["capsules", "rotate-[-5deg] left-[3%] top-[10%]"], ["runner", "rotate-[3deg] left-[34%] top-[4%] z-10"], ["grappin", "rotate-[6deg] left-[65%] top-[12%]"], ["astrododge", "rotate-[4deg] left-[10%] top-[50%]"], ["starcatcher", "rotate-[-4deg] left-[52%] top-[52%]"]];
  return (
    <div className="relative aspect-[16/10] overflow-hidden" style={{ background: "radial-gradient(ellipse 70% 70% at 50% 40%, rgba(181,124,255,.35), transparent 65%), linear-gradient(160deg, #241245, #0d0a17)" }} aria-hidden>
      {tuiles.map(([id, pos]) => (
        <div key={id} className={`absolute w-[34%] aspect-[16/10] overflow-hidden rounded-lg border border-white/20 shadow-[0_8px_20px_-6px_rgba(0,0,0,.8)] transition-transform duration-500 group-hover:scale-105 ${pos}`}>
          <MiniatureJeu id={id} className="h-full w-full" />
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card/95 to-transparent" />
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
        <span className="rounded-full bg-violet/85 px-2 py-0.5 text-white">{jeuxArcade().length} jeux à records</span>
        <span className="hidden min-[420px]:inline rounded-full bg-black/50 px-2 py-0.5 text-lilac backdrop-blur-sm">{jeuxQuotidiens().length} récompenses du jour</span>
      </div>
      {record && (
        <span className="absolute right-2 top-2 hidden sm:inline-flex max-w-[60%] items-center gap-1 truncate rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-amber-100 backdrop-blur-sm">
          🏆 {record.score.toLocaleString("fr-FR")} · {record.nom}
        </span>
      )}
    </div>
  );
}

// ── Cycy_Bot : le robot entouré de ce qu'il fait vivre (passeport, Cartes Astrales, figurines) ──
function VisuelCycyBot() {
  return (
    <div className="relative aspect-[16/10] overflow-hidden" style={{ background: "radial-gradient(ellipse 55% 75% at 50% 55%, rgba(123,56,255,.55), transparent 65%), radial-gradient(ellipse 50% 50% at 90% 10%, rgba(255,107,214,.25), transparent 60%), linear-gradient(160deg, #1c0f3a, #0d0a17)" }} aria-hidden>
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="160" cy="104" rx="128" ry="40" fill="none" stroke="#e0b3ff" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 5" transform="rotate(-10 160 104)" />
        {[[30, 30, 1], [292, 40, 0.8], [270, 170, 0.7], [44, 166, 0.9], [196, 18, 0.6]].map(([x, y, k], i) => (
          <path key={i} transform={`translate(${x} ${y}) scale(${k})`} d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="#ffe7a8" />
        ))}
      </svg>
      {/* passeport en fond, carte astrale et figurine en orbite */}
      <Image src="/images/cycybot/passeport.webp" alt="" width={240} height={135} className="absolute left-[4%] top-[12%] h-auto w-[38%] rotate-[-8deg] rounded-md border border-white/20 opacity-80 shadow-lg" />
      <Image src="/images/cycybot/carte-0.webp" alt="" width={120} height={168} className="absolute right-[6%] top-[8%] h-auto w-[19%] rotate-[9deg] drop-shadow-[0_6px_14px_rgba(0,0,0,.7)] transition-transform duration-500 group-hover:rotate-[14deg]" />
      <Image src="/figurines/nibi03.webp" alt="" width={120} height={120} className="absolute bottom-[8%] right-[18%] h-auto w-[20%] drop-shadow-[0_6px_12px_rgba(0,0,0,.6)] transition-transform duration-500 group-hover:-translate-y-1" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute -inset-3 rounded-full bg-violet-light/30 blur-xl" />
        <Image src="/images/cycybot/avatar.webp" alt="" width={112} height={112} className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-violet-light/60 shadow-glow transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="absolute bottom-2 left-2 hidden sm:flex gap-1 text-[10px] font-display font-semibold text-lilac">
        {["/passeport", "/booster", "/figurines"].map((c) => <span key={c} className="rounded-md bg-black/50 px-1.5 py-0.5 backdrop-blur-sm">{c}</span>)}
      </div>
    </div>
  );
}

// ── Valorant : l'emblème du rank actuel dans un HUD de visée, et deux clips ──
function VisuelValorant({ rang }: { rang: Rang | null }) {
  const palier = rang?.palier ?? PALIERS[5];
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden"
      style={{ background: `radial-gradient(ellipse 70% 90% at 28% 45%, ${palier.couleur}66, transparent 62%), radial-gradient(ellipse 80% 70% at 90% 10%, rgba(255,70,85,.35), transparent 60%), linear-gradient(160deg, #2a0f1c, #0d0a17)` }}
      aria-hidden
    >
      {/* sol en perspective */}
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <g stroke="#ff4655" strokeOpacity=".22" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={"h" + i} x1="0" x2="320" y1={150 + i * i * 2.2} y2={150 + i * i * 2.2} />)}
          {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => <line key={"v" + i} x1={160 + i * 14} y1="150" x2={160 + i * 70} y2="210" />)}
        </g>
        {/* viseur */}
        {/* viseur derrière l'emblème : le rank dans le viseur */}
        <g transform="translate(72 100)" stroke="#7dffb0" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round">
          <circle r="52" fill="none" strokeOpacity=".25" strokeDasharray="4 6" />
          <line x1="-70" x2="-56" /><line x1="56" x2="70" /><line y1="-70" y2="-56" /><line y1="56" y2="70" />
        </g>
        {/* coins de HUD */}
        <g stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" fill="none">
          <path d="M14 26 V14 H26" /><path d="M306 26 V14 H294" /><path d="M14 174 V186 H26" /><path d="M306 174 V186 H294" />
        </g>
      </svg>
      <div className="absolute left-[4%] sm:left-[7%] top-1/2 -translate-y-1/2 origin-left scale-[0.6] sm:scale-100 drop-shadow-[0_0_22px_rgba(0,0,0,.6)] transition-transform duration-500 group-hover:scale-110">
        <EmblemeRang palier={palier} division={rang?.division ?? 2} taille={92} id="accueil" />
      </div>
      <div className="absolute left-[46%] sm:left-[44%] top-[22%] sm:top-[20%] right-2 sm:right-3">
        <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200/80">{rang ? "Rank actuel" : "Rank en direct"}</p>
        <p className="font-display text-sm sm:text-xl font-bold leading-tight text-white drop-shadow" style={{ textShadow: `0 0 18px ${palier.couleur}` }}>
          {rang?.libelle ?? "Valorant"}
        </p>
        {rang?.rr != null && (
          <div className="mt-1.5 w-full max-w-28">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full" style={{ width: `${Math.min(100, rang.rr)}%`, background: palier.clair }} /></div>
            <p className="mt-0.5 text-[10px] text-white/70">{rang.rr} RR</p>
          </div>
        )}
      </div>
      {/* deux clips */}
      <div className="absolute bottom-3 right-3 hidden sm:flex gap-1.5">
        {["#ff4655", "#b57cff"].map((c, i) => (
          <span key={c} className="relative grid h-9 w-14 place-items-center rounded-md border border-white/20 bg-black/45 backdrop-blur-sm" style={{ transform: `rotate(${i ? 4 : -4}deg)` }}>
            <span className="absolute left-1 top-0.5 text-[7px] font-bold tracking-wider" style={{ color: c }}>CLIP</span>
            <svg viewBox="0 0 10 10" className="h-3.5 w-3.5"><path d="M3 2 L8 5 L3 8 Z" fill="#fff" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Leaderboard : le vrai podium de la semaine ──
function Avatar({ l, taille }: { l: LigneClassement | undefined; taille: string }) {
  if (l?.avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={l.avatar} alt="" className={`${taille} rounded-full object-cover ring-2 ring-white/70`} loading="lazy" />;
  }
  return (
    <span className={`${taille} grid place-items-center rounded-full bg-gradient-to-br from-violet-light to-violet font-display font-bold text-white ring-2 ring-white/50`}>
      {l ? l.name.slice(0, 1).toUpperCase() : "?"}
    </span>
  );
}

function VisuelLeaderboard({ podium }: { podium: LigneClassement[] }) {
  const places = [
    { l: podium[1], h: "h-[26%]", fond: "from-slate-300/50 to-slate-300/5", txt: "text-slate-100", n: 2, av: "h-7 w-7 sm:h-9 sm:w-9" },
    { l: podium[0], h: "h-[38%]", fond: "from-amber-300/60 to-amber-300/5", txt: "text-amber-100", n: 1, av: "h-8 w-8 sm:h-11 sm:w-11" },
    { l: podium[2], h: "h-[18%]", fond: "from-orange-400/50 to-orange-400/5", txt: "text-orange-100", n: 3, av: "h-6 w-6 sm:h-8 sm:w-8" },
  ];
  return (
    <div
      className="relative flex aspect-[16/10] items-end justify-center gap-1 sm:gap-2 overflow-hidden px-3 sm:px-6"
      style={{ background: "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(252,211,77,.28), transparent 65%), radial-gradient(ellipse 50% 50% at 10% 90%, rgba(181,124,255,.25), transparent 60%), linear-gradient(160deg, #241a3a, #0d0a17)" }}
      aria-hidden
    >
      {/* confettis et étoiles */}
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        {[[40, 30, "#ffd23f", 12], [282, 40, "#ff6bd6", -18], [70, 80, "#7fd0ff", 30], [250, 92, "#b57cff", 8], [120, 22, "#ff9d5c", -30], [205, 26, "#7dffb0", 20]].map(([x, y, c, r], i) => (
          <rect key={i} x={x as number} y={y as number} width="7" height="3" rx="1" fill={c as string} transform={`rotate(${r} ${x} ${y})`} opacity=".85" />
        ))}
        {[[24, 60, 1], [296, 70, 0.8], [160, 14, 0.7]].map(([x, y, k], i) => (
          <path key={i} transform={`translate(${x} ${y}) scale(${k})`} d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="#ffe7a8" />
        ))}
      </svg>
      {places.map((p) => (
        <div key={p.n} className={`relative flex w-1/4 flex-col items-center justify-end ${p.n === 1 ? "h-full" : "h-full"}`}>
          <div className="relative mb-1 flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-1">
            {p.n === 1 && (
              <svg viewBox="0 0 24 16" className="mb-0.5 h-4 w-6 drop-shadow-[0_0_8px_rgba(252,211,77,.8)]"><path d="M2 14 L4 4 L9 9 L12 2 L15 9 L20 4 L22 14 Z" fill="#ffd23f" /></svg>
            )}
            <Avatar l={p.l} taille={p.av} />
            <span className="mt-0.5 max-w-full truncate text-[10px] font-semibold text-white/90">{p.l?.name ?? "Toi ?"}</span>
          </div>
          <span className={`${p.h} w-full rounded-t-xl bg-gradient-to-b ${p.fond} flex justify-center pt-1 font-display font-bold ${p.txt}`}>{p.n}</span>
        </div>
      ))}
    </div>
  );
}

const carte = "group relative flex flex-col overflow-hidden rounded-3xl border border-violet/15 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:border-violet/45 hover:shadow-glow-sm";

function Pied({ titre, texte, icone }: { titre: string; texte: string; icone: NomIcone }) {
  return (
    <div className="flex flex-1 flex-col p-3.5 sm:p-5">
      <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-ink leading-tight"><Icone nom={icone} className="w-5 h-5 shrink-0 text-violet-light" />{titre}</h3>
      {/* Sur mobile (2 colonnes), le visuel et le titre suffisent */}
      <p className="mt-1 hidden sm:block text-sm leading-relaxed text-ink-soft">{texte}</p>
      <span className="mt-auto pt-3 sm:pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-light group-hover:text-lilac">
        Découvrir <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );
}

export default async function ExplorerAccueil() {
  const { rang, podium, record } = await donneesVivantes();
  return (
    <section aria-labelledby="explorer-titre" className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-10">
      <h2 id="explorer-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-6">À explorer</h2>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/jeux" className={carte}>
          <VisuelJeux record={record} />
          <Pied icone="joystick" titre="Les jeux" texte="Neuf jeux à records et cinq récompenses du jour pour le Discord : figurines, grappin, ticket à gratter…" />
        </Link>

        <Link href="/cycybot" className={carte}>
          <VisuelCycyBot />
          <Pied icone="robot" titre="Cycy_Bot" texte="Passeport galactique, Cartes Astrales, figurines, Éclats et Marché noir sur le Discord." />
        </Link>

        <Link href="/gaming" className={carte}>
          <VisuelValorant rang={rang} />
          <Pied icone="cible" titre="Valorant & clips" texte="Mon rank en direct, mes agents et les derniers clips des lives." />
        </Link>

        <Link href="/cycybot/leaderboard" className={carte}>
          <VisuelLeaderboard podium={podium} />
          <Pied
            icone="trophee"
            titre="Leaderboard"
            texte={podium.length >= 3
              ? `Le podium de la semaine : ${podium[0].name}, ${podium[1].name} et ${podium[2].name}. Et toi, tu es où ?`
              : "Les Cycyliens les plus présents, les plus bavards et les plus généreux. Le podium t'attend !"}
          />
        </Link>
      </div>
    </section>
  );
}
