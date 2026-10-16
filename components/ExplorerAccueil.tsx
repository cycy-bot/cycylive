// Accueil · « À explorer » : quatre portes d'entrée vers le reste du site, avec un visuel chacune.
import Link from "next/link";
import Image from "next/image";
import MiniatureJeu from "@/components/arcade/MiniatureJeu";
import { IconValorant, IconTrophy, IconArrowRight } from "@/components/Icons";

const carte = "group relative flex flex-col overflow-hidden rounded-3xl border border-violet/15 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:border-violet/45 hover:shadow-glow-sm";

function Pied({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="flex flex-1 flex-col p-5">
      <h3 className="text-lg font-semibold text-ink">{titre}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{texte}</p>
      <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-light group-hover:text-lilac">
        Découvrir <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );
}

export default function ExplorerAccueil() {
  return (
    <section aria-labelledby="explorer-titre" className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-10">
      <h2 id="explorer-titre" className="text-2xl md:text-3xl font-semibold text-ink mb-6">À explorer</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/jeux" className={carte}>
          <div className="relative aspect-[16/10] overflow-hidden">
            <MiniatureJeu id="runner" className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105" />
          </div>
          <Pied titre="🕹️ Les jeux" texte="Six jeux à records et des récompenses du jour pour le Discord." />
        </Link>

        <Link href="/cycybot" className={carte}>
          <div className="relative aspect-[16/10] overflow-hidden bg-nebula">
            <Image src="/images/cycybot/passeport.jpg" alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <Pied titre="🤖 Cycy_Bot" texte="Passeport galactique, Cartes Astrales, Éclats et Marché noir sur le Discord." />
        </Link>

        <Link href="/gaming" className={carte}>
          <div
            className="relative flex aspect-[16/10] items-center justify-center overflow-hidden"
            style={{ background: "radial-gradient(ellipse 80% 80% at 70% 20%, rgba(255,70,85,.35), transparent 60%), linear-gradient(160deg, #2a0f1c, #0d0a17)" }}
          >
            <IconValorant className="w-16 h-16 text-rose-300 drop-shadow-[0_0_18px_rgba(255,70,85,0.6)] transition-transform duration-500 group-hover:scale-110" />
          </div>
          <Pied titre="🎯 Valorant & clips" texte="Mon rank en direct, mes agents et les derniers clips des lives." />
        </Link>

        <Link href="/cycybot/leaderboard" className={carte}>
          <div
            className="relative flex aspect-[16/10] items-end justify-center gap-2 overflow-hidden px-8 pb-0"
            style={{ background: "radial-gradient(ellipse 70% 70% at 50% 0%, rgba(252,211,77,.25), transparent 65%), linear-gradient(160deg, #1f1730, #0d0a17)" }}
            aria-hidden
          >
            <IconTrophy className="absolute top-5 w-10 h-10 text-amber-300 drop-shadow-[0_0_14px_rgba(252,211,77,0.6)]" />
            <span className="h-[34%] w-1/4 rounded-t-xl bg-gradient-to-b from-slate-300/40 to-slate-300/5 flex justify-center pt-1 font-display font-bold text-slate-200">2</span>
            <span className="h-[48%] w-1/4 rounded-t-xl bg-gradient-to-b from-amber-300/45 to-amber-300/5 flex justify-center pt-1 font-display font-bold text-amber-200">1</span>
            <span className="h-[24%] w-1/4 rounded-t-xl bg-gradient-to-b from-orange-400/40 to-orange-400/5 flex justify-center pt-1 font-display font-bold text-orange-200">3</span>
          </div>
          <Pied titre="🏆 Leaderboard" texte="Les Cycyliens les plus présents, les plus bavards et les plus généreux." />
        </Link>
      </div>
    </section>
  );
}
