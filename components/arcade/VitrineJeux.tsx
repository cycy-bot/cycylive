// Vitrine des jeux (/jeux) : la salle d'arcade (jeux à records) puis les récompenses du jour (liées au Discord).
import CarteJeu, { type RecordJeu } from "@/components/arcade/CarteJeu";
import Icone from "@/components/icones/Icone";
import { jeuxArcade, jeuxQuotidiens } from "@/lib/jeux";

export default function VitrineJeux({ records = {} }: { records?: Record<string, RecordJeu> }) {
  const arcade = jeuxArcade();
  const quotidiens = jeuxQuotidiens();
  return (
    <div>
      <header className="mb-10 md:mb-12 max-w-3xl">
        <p className="eyebrow text-lilac mb-3 inline-flex items-center gap-2"><Icone nom="joystick" className="w-4 h-4" />Salle de jeux</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-ink glow-text leading-[1.15]">Les jeux de Cycylive</h1>
        <p className="mt-4 text-lg text-ink-soft leading-relaxed">
          Gratuits, sans compte, sur ordi comme sur mobile. Choisis un jeu, bats les records de la commu… et n&apos;oublie pas tes
          récompenses du jour pour le Discord.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <a href="#arcade" className="rounded-full bg-violet px-5 py-2.5 font-semibold text-ink shadow-glow-sm hover:bg-violet-light transition-colors">
            <Icone nom="trophee" className="w-4 h-4 mr-1.5" />Battre un record
          </a>
          <a href="#quotidien" className="rounded-full border border-violet/30 px-5 py-2.5 font-semibold text-ink-soft hover:text-ink hover:bg-violet/10 transition-colors">
            <Icone nom="cadeau" className="w-4 h-4 mr-1.5" />Mes récompenses du jour
          </a>
        </div>
      </header>

      <section id="arcade" aria-labelledby="titre-arcade" className="scroll-mt-24 mb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="titre-arcade" className="text-2xl md:text-3xl font-semibold text-ink">La salle d&apos;arcade</h2>
            <p className="mt-1 text-ink-soft">{arcade.length} jeux, un tableau des records pour chacun. Inscris ton pseudo à la fin de la partie.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {arcade.map((j) => (
            <CarteJeu key={j.id} jeu={j} record={records[j.id] ?? null} />
          ))}
        </div>
      </section>

      <section id="quotidien" aria-labelledby="titre-quotidien" className="scroll-mt-24">
        <div className="mb-5">
          <h2 id="titre-quotidien" className="text-2xl md:text-3xl font-semibold text-ink">Les récompenses du jour</h2>
          <p className="mt-1 text-ink-soft max-w-3xl">
            Pas de classement ici : chaque jour, un ticket, des quêtes, trois coffres et trois tirages de grappin qui te rapportent des Éclats, des boosters ou des
            points sur le Discord Cycylive. Connecte-toi avec ton compte Discord : une partie par jour et par compte, et le gain arrive
            directement sur ton profil.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {quotidiens.map((j) => (
            <CarteJeu key={j.id} jeu={j} format="large" />
          ))}
        </div>
      </section>
    </div>
  );
}
