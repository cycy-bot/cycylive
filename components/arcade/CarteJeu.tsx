// Carte d'un jeu dans la vitrine /jeux : miniature, nom, accroche, infos et record actuel.
import Link from "next/link";
import Icone from "@/components/icones/Icone";
import MiniatureJeu from "@/components/arcade/MiniatureJeu";
import type { FicheJeu } from "@/lib/jeux";

export type RecordJeu = { nom: string; score: number } | null;

export default function CarteJeu({ jeu, record = null, format = "standard" }: { jeu: FicheJeu; record?: RecordJeu; format?: "standard" | "large" | "compact" }) {
  const large = format === "large";
  const compact = format === "compact";
  return (
    <Link
      href={jeu.href}
      className={`group relative flex overflow-hidden rounded-3xl border border-violet/20 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light ${
        large ? "flex-col sm:flex-row" : "flex-col"
      }`}
      style={{ ["--accent" as string]: jeu.teinte.accent, boxShadow: "0 10px 40px -20px rgba(0,0,0,.8)" }}
    >
      <div className={`relative overflow-hidden ${large ? "sm:w-[46%] aspect-[16/10] sm:aspect-auto" : "aspect-[16/10]"}`}>
        <MiniatureJeu id={jeu.id} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.06]" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-80" aria-hidden />
        {jeu.badge && !compact && (
          <span className="absolute left-3 top-3 rounded-full bg-void/70 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-ink border border-white/10">
            {jeu.badge}
          </span>
        )}
        {/* Bouton « Jouer » qui apparaît au survol */}
        <span
          className="absolute right-3 bottom-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-void font-bold shadow-lg translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          style={{ background: jeu.teinte.accent }}
          aria-hidden
        >
          <Icone nom="lecture" className="w-6 h-6" />
        </span>
      </div>
      <div className={`flex flex-1 flex-col ${compact ? "p-3.5" : "p-5"}`}>
        <h3 className={`font-semibold text-ink ${compact ? "text-sm" : "text-lg"}`}>
          <Icone nom={jeu.icone} className="text-[color:var(--accent)] mr-2 w-5 h-5" />
          {jeu.nom}
        </h3>
        {!compact && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{large ? jeu.description : jeu.accroche}</p>}
        {!compact && (
          <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] text-ink-soft">
            <span className="inline-flex items-center gap-1 rounded-full border border-violet/20 px-2.5 py-1"><Icone nom="chrono" className="w-3.5 h-3.5" />{jeu.duree}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-violet/20 px-2.5 py-1"><Icone nom="manette" className="w-3.5 h-3.5" />{jeu.controles}</span>
          </div>
        )}
        {!compact && (
          <div className="mt-auto pt-4 flex items-center justify-between gap-3 text-sm">
            {jeu.famille === "arcade" ? (
              record ? (
                <span className="min-w-0 truncate text-ink-soft">
                  <Icone nom="trophee" className="w-4 h-4 mr-1 text-amber-300" /><span className="font-mono font-semibold text-lilac">{record.score.toLocaleString("fr-FR")}</span>
                  <span className="text-ink-soft/70"> · {record.nom}</span>
                </span>
              ) : (
                <span className="text-ink-soft/70"><Icone nom="drapeau" className="w-4 h-4 mr-1" />Aucun record : à toi !</span>
              )
            ) : (
              <span className="text-ink-soft/70"><Icone nom="cadeau" className="w-4 h-4 mr-1" />Gain à récupérer sur Discord</span>
            )}
            <span className="shrink-0 font-semibold transition-colors" style={{ color: jeu.teinte.accent }}>
              Jouer <Icone nom="fleche" className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
