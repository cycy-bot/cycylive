import Link from "next/link";
import { IconMoonCrescent, IconStar4 } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-2xl px-5 md:px-8 py-24 text-center overflow-hidden">
      <IconStar4 className="hidden md:block absolute top-10 left-[20%] w-4 h-4 text-violet-light/50 animate-pulse" aria-hidden />
      <IconStar4 className="hidden md:block absolute bottom-16 right-[15%] w-3 h-3 text-lilac/40" aria-hidden />

      <IconMoonCrescent className="w-16 h-16 text-violet-light/60 mx-auto mb-6" aria-hidden />

      <p className="eyebrow text-violet-light mb-4">Erreur 404</p>
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        Cette page s'est perdue dans l'espace.
      </h1>
      <p className="text-ink-soft mb-9 max-w-md mx-auto">
        La page que tu cherches n'existe pas, ou a dérivé ailleurs dans la
        galaxie. Retourne vers un endroit plus familier.
      </p>

      <Link
        href="/"
        className="inline-flex rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
