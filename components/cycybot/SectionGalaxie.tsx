// Page Cycy_Bot · section « Éclats, expéditions & Marché noir ».
// En haut : la monnaie (comment on gagne / dépense des Éclats). Puis deux grands panneaux
// en direct (le Marché Noir Astral et les destinations du jour), puis les autres rendez-vous.
import type { DiscordCycyBot, ObjetMarche } from "@/lib/cycybot";
import { CarteBloc, EnDirect, Pastilles, duree, nf, type Bloc } from "@/components/cycybot/Blocs";
import Icone from "@/components/icones/Icone";
import { iconeObjet, iconeDestination } from "@/components/icones/correspondances";
import type { NomIcone } from "@/components/icones/banque";

const GAGNER = [
  { e: "manette" as NomIcone, t: "Jeux du Discord" },
  { e: "cartes" as NomIcone, t: "Cartes attrapées en live" },
  { e: "ecran" as NomIcone, t: "Lives regardés" },
  { e: "fusee" as NomIcone, t: "Expéditions réussies" },
  { e: "boule" as NomIcone, t: "Prédictions gagnées" },
];
const DEPENSER = [
  { e: "lunettes" as NomIcone, t: "Marché noir" },
  { e: "boule" as NomIcone, t: "Mises des prédictions" },
  { e: "slot" as NomIcone, t: "Relances d'expédition" },
];

const autres: Bloc[] = [
  { id: "question", icone: "comete", titre: "La question du jour", texte: "Chaque jour, une question à la commu. On vote avec un bouton, les résultats tombent le lendemain et restent dans les archives.", commandes: ["question"] },
  { id: "chronique", icone: "livre", titre: "La Chronique CycyLive", texte: "Les grands moments de la commu deviennent des chapitres. Les présents reçoivent un tampon unique sur leur passeport, impossible à obtenir après coup.", commandes: ["chronique"] },
  { id: "predictions", icone: "boule", titre: "Les prédictions", texte: "Pendant les lives, mise tes Éclats : « Cycy gagne la game ? », « Ace ce soir ? »… Le pot est partagé entre ceux qui ont vu juste.", commandes: [] },
  { id: "anomalies", icone: "galaxie", titre: "Les anomalies", texte: "Une à trois fois par semaine, sans prévenir : pluie de météores, distorsion temporelle, XP ×2, faille à cartes ou éclipse. Il faut être là.", commandes: [] },
];

function Prix({ o }: { o: ObjetMarche }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-400/15 px-2.5 py-1 text-xs font-semibold text-fuchsia-200 tabular-nums">
      {nf(o.price)} <Icone nom={o.currency === "fragments" ? "puzzle" : "eclats"} className="w-3.5 h-3.5" titre={o.currency === "fragments" ? "fragments" : "Éclats"} />
    </span>
  );
}

function Objet({ o, rare = false }: { o: ObjetMarche; rare?: boolean }) {
  return (
    <li className={`relative flex flex-col rounded-2xl border p-3 ${rare ? "border-amber-300/40 bg-gradient-to-b from-amber-300/10 to-transparent" : "border-fuchsia-300/15 bg-white/[0.03]"}`}>
      {rare && <span className="absolute right-2 top-2 rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">Rare</span>}
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-black/30 ${rare ? "text-amber-200" : "text-fuchsia-200"}`} aria-hidden><Icone nom={iconeObjet(o.name)} className="w-6 h-6" /></span>
      <span className="mt-2 text-sm font-medium leading-snug text-ink line-clamp-2" title={o.name}>{o.name}</span>
      <span className="mt-auto pt-2"><Prix o={o} /></span>
    </li>
  );
}

function MarcheNoir({ d }: { d: DiscordCycyBot | null }) {
  const m = d?.market;
  const vide = !m || (!m.daily.length && !m.weekly.length);
  return (
    <div
      id="marche"
      className="relative overflow-hidden rounded-3xl border border-fuchsia-400/30 p-5 md:p-6 scroll-mt-24"
      style={{ background: "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(217,70,239,.18), transparent 60%), linear-gradient(160deg, #1a0b22, #0b0817 70%)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-fuchsia-300/90">Boutique clandestine</p>
          <h3 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold text-ink"><Icone nom="lunettes" className="w-7 h-7 text-fuchsia-300" />Le Marché Noir Astral</h3>
        </div>
        {!vide && (
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/30 bg-black/30 px-3 py-1 text-xs text-fuchsia-100">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" aria-hidden /> Arrivage du jour
          </span>
        )}
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
        Nouvel arrivage chaque jour, raretés chaque semaine et un mystérieux objet clandestin. Thèmes, cadres, titres, boosters… jamais
        de cartes exclusives : elles se méritent.
      </p>
      {vide ? (
        <p className="mt-5 rounded-2xl border border-dashed border-fuchsia-300/25 p-5 text-center text-sm text-ink-soft">Le marchand revient très vite avec un nouvel arrivage.</p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {m!.daily.map((o) => <Objet key={`d-${o.name}`} o={o} />)}
          {m!.weekly.map((o) => <Objet key={`w-${o.name}`} o={o} rare />)}
          {m!.hasSecret && (
            <li className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-fuchsia-300/40 bg-black/40 p-3 text-center">
              <Icone nom="colis" className="w-9 h-9 text-fuchsia-200" />
              <span className="mt-2 text-sm font-semibold text-fuchsia-100">Objet clandestin</span>
              <span className="text-xs text-ink-soft">Prix et contenu : ???</span>
            </li>
          )}
        </ul>
      )}
      <div className="mt-4 flex items-center justify-between gap-3">
        <Pastilles noms={["marche"]} />
        <span className="text-xs text-ink-soft/70">Mis à jour en direct par Cycy_Bot</span>
      </div>
    </div>
  );
}

function Difficulte({ n }: { n: number }) {
  const v = Math.max(1, Math.min(5, n));
  return (
    <span className="flex gap-0.5" aria-label={`Difficulté ${v} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1.5 w-3.5 rounded-full ${i <= v ? (v >= 4 ? "bg-rose-400" : v >= 3 ? "bg-amber-300" : "bg-emerald-300") : "bg-white/10"}`} />
      ))}
    </span>
  );
}

function Expeditions({ d }: { d: DiscordCycyBot | null }) {
  const dest = d?.destinations || [];
  return (
    <div
      id="expeditions"
      className="relative flex flex-col overflow-hidden rounded-3xl border border-sky-400/25 p-5 md:p-6 scroll-mt-24"
      style={{ background: "radial-gradient(ellipse 80% 60% at 0% 0%, rgba(56,189,248,.14), transparent 60%), linear-gradient(160deg, #0b1424, #0b0817 70%)" }}
    >
      <p className="eyebrow text-sky-300/90">Missions en équipage</p>
      <h3 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold text-ink"><Icone nom="satellite" className="w-7 h-7 text-sky-300" />Les expéditions</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Jusqu&apos;à quatre par équipage. Quand le radar détecte quelque chose, à vous de choisir : investiguer, continuer… ou tirer
        dessus.
      </p>
      {dest.length ? (
        <>
          <p className="mt-5 mb-2 text-xs uppercase tracking-wide text-ink-soft/60">Destinations du jour</p>
          <ul className="space-y-2">
            {dest.map((x) => (
              <li key={x.name} className="flex items-center gap-3 rounded-2xl border border-sky-300/15 bg-white/[0.03] px-3 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/30 text-sky-200" aria-hidden><Icone nom={iconeDestination(x.name)} className="w-5 h-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{x.name}</span>
                  <span className="text-xs text-ink-soft"><Icone nom="chrono" className="w-3.5 h-3.5 mr-1" />{duree(x.hours)}</span>
                </span>
                <Difficulte n={x.difficulty} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-sky-300/25 p-5 text-center text-sm text-ink-soft">Les destinations du jour arrivent bientôt.</p>
      )}
      <ol className="mt-5 grid gap-2 text-xs text-ink-soft sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {[
          ["1", "Choisis une destination"],
          ["2", "Forme ton équipage (4 max)"],
          ["3", "Décide face aux imprévus"],
        ].map(([n, t]) => (
          <li key={n} className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-[11px] font-bold text-sky-200">{n}</span>
            {t}
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-4">
        <Pastilles noms={["expedition"]} />
      </div>
    </div>
  );
}

export default function SectionGalaxie({ discord }: { discord: DiscordCycyBot | null }) {
  return (
    <section id="galaxie" className="mb-16 scroll-mt-24" aria-labelledby="galaxie-titre">
      <p className="eyebrow text-lilac mb-2 inline-flex items-center gap-2"><Icone nom="eclats" className="w-4 h-4" />L&apos;économie de la galaxie</p>
      <h2 id="galaxie-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-2">
        Éclats, expéditions &amp; Marché noir
      </h2>
      <p className="text-ink-soft mb-8 max-w-2xl">Une économie à part entière, avec des surprises toute la semaine. Les encarts sont mis à jour en direct par Cycy_Bot.</p>

      {/* La monnaie : gagner → dépenser */}
      <div id="eclats" className="carte-holo relative mb-5 overflow-hidden rounded-3xl p-5 md:p-7 scroll-mt-24">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-violet/25 blur-3xl" aria-hidden />
        <div className="relative grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center">
          <div className="flex gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-light to-violet text-white shadow-glow" aria-hidden><Icone nom="eclats" className="w-8 h-8" /></span>
            <div>
              <h3 className="text-xl font-semibold text-ink">Les Éclats Stellaires</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                La monnaie de la galaxie. Tes Points Stellaires restent ton XP (ton orbite) ; les Éclats, eux, se dépensent.
                {discord && discord.stats.eclatsCirculation > 0 ? (
                  <>
                    {" "}
                    <strong className="text-ink">{nf(discord.stats.eclatsCirculation)} <Icone nom="eclats" className="w-4 h-4" /></strong> en circulation en ce moment.
                  </>
                ) : null}
              </p>
              <Pastilles noms={["eclats"]} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-3.5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">Gagner</p>
              <ul className="space-y-1.5 text-sm text-ink">
                {GAGNER.map((g) => (
                  <li key={g.t} className="flex items-center gap-2"><Icone nom={g.e} className="w-4 h-4 text-ink-soft" />{g.t}</li>
                ))}
              </ul>
            </div>
            <Icone nom="fleche" className="hidden w-7 h-7 text-lilac sm:block" />
            <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-3.5 self-stretch">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fuchsia-200">Dépenser</p>
              <ul className="space-y-1.5 text-sm text-ink">
                {DEPENSER.map((g) => (
                  <li key={g.t} className="flex items-center gap-2"><Icone nom={g.e} className="w-4 h-4 text-ink-soft" />{g.t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <MarcheNoir d={discord} />
        <Expeditions d={discord} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {autres.map((b) => (
          <CarteBloc key={b.id} bloc={b}>
            {discord && <EnDirect d={discord} id={b.id} />}
          </CarteBloc>
        ))}
      </div>
    </section>
  );
}
