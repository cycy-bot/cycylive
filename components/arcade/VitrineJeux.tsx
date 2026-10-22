// Vitrine des jeux (/jeux) : d'abord les récompenses du jour (à faire chaque jour, liées au Discord),
// en cartes compactes, puis la salle d'arcade (jeux à records).
import CarteJeu, { type RecordJeu } from "@/components/arcade/CarteJeu";
import Icone from "@/components/icones/Icone";
import { jeuxArcade, jeuxQuotidiens } from "@/lib/jeux";

export default function VitrineJeux({ records = {} }: { records?: Record<string, RecordJeu> }) {
  const arcade = jeuxArcade();
  const quotidiens = jeuxQuotidiens();
  return (
    <div>
      <header className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="eyebrow text-lilac mb-3 inline-flex items-center gap-2"><Icone nom="joystick" className="w-4 h-4" />Salle de jeux</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-ink glow-text leading-[1.15]">Les jeux de Cycylive</h1>
          <p className="mt-3 text-lg text-ink-soft leading-relaxed">
            Gratuits, sur ordi comme sur mobile. Récupère tes récompenses du jour pour le Discord, puis viens battre les records de la commu.
          </p>
        </div>
        <nav aria-label="Aller à" className="flex flex-wrap gap-2 text-sm">
          <a href="#quotidien" className="rounded-full bg-violet px-5 py-2.5 font-semibold text-ink shadow-glow-sm hover:bg-violet-light transition-colors">
            <Icone nom="cadeau" className="w-4 h-4 mr-1.5" />{quotidiens.length} récompenses du jour
          </a>
          <a href="#arcade" className="rounded-full border border-violet/30 px-5 py-2.5 font-semibold text-ink-soft hover:text-ink hover:bg-violet/10 transition-colors">
            <Icone nom="trophee" className="w-4 h-4 mr-1.5" />{arcade.length} jeux à records
          </a>
        </nav>
      </header>

      <section id="quotidien" aria-labelledby="titre-quotidien" className="scroll-mt-24 mb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 id="titre-quotidien" className="text-2xl md:text-3xl font-semibold text-ink">
            <Icone nom="cadeau" className="w-6 h-6 mr-2 text-lilac" />Les récompenses du jour
          </h2>
          <p className="text-sm text-ink-soft max-w-2xl">
            Connecte-toi avec Discord : chaque jour, une partie par jeu, et le gain (Éclats, boosters, points, figurines…) arrive directement sur ton profil.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quotidiens.map((j) => (
            <CarteJeu key={j.id} jeu={j} />
          ))}
        </div>
      </section>

      <section id="arcade" aria-labelledby="titre-arcade" className="scroll-mt-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 id="titre-arcade" className="text-2xl md:text-3xl font-semibold text-ink">
            <Icone nom="trophee" className="w-6 h-6 mr-2 text-amber-300" />La salle d&apos;arcade
          </h2>
          <p className="text-sm text-ink-soft">{arcade.length} jeux, un tableau des records pour chacun : inscris ton pseudo à la fin de la partie.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {arcade.map((j) => (
            <CarteJeu key={j.id} jeu={j} record={records[j.id] ?? null} />
          ))}
        </div>
      </section>
    </div>
  );
}
