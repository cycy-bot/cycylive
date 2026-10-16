// En-tête d'une page de jeu : barre de changement de jeu, titre, description et infos.
import BarreJeux from "@/components/arcade/BarreJeux";
import Icone from "@/components/icones/Icone";
import type { FicheJeu } from "@/lib/jeux";

export default function EnteteJeu({ jeu }: { jeu: FicheJeu }) {
  return (
    <>
      <BarreJeux />
      <header className="mb-6 grid grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 md:gap-x-5 gap-y-3">
        <span
          className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl md:row-span-2"
          style={{ color: jeu.teinte.accent, background: `linear-gradient(135deg, ${jeu.teinte.de}, ${jeu.teinte.a})`, boxShadow: `0 0 0 1px ${jeu.teinte.accent}55, 0 10px 30px -12px ${jeu.teinte.accent}` }}
          aria-hidden
        >
          <Icone nom={jeu.icone} className="w-8 h-8 md:w-9 md:h-9" />
        </span>
        <h1 className="text-left text-3xl md:text-4xl font-semibold text-ink glow-text leading-tight">{jeu.nom}</h1>
        <p className="col-span-2 md:col-span-1 md:col-start-2 max-w-3xl text-ink-soft leading-relaxed">{jeu.description}</p>
        <div className="col-span-2 md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 flex flex-wrap gap-2 text-xs text-ink-soft md:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/25 bg-card/60 px-3 py-1.5"><Icone nom="chrono" className="w-4 h-4" />{jeu.duree}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/25 bg-card/60 px-3 py-1.5"><Icone nom="manette" className="w-4 h-4" />{jeu.controles}</span>
        </div>
      </header>
    </>
  );
}
