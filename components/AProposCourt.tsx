import Link from "next/link";
import { textes } from "@/data/textes";

export default function AProposCourt() {
  return (
    <section className="mx-auto max-w-3xl px-5 md:px-8 py-14 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
        {textes.apropos.titreAccueil}
      </h2>
      <p className="text-ink-soft mb-6 leading-relaxed">
        {textes.apropos.texteCourt}
      </p>
      <Link
        href="/a-propos"
        className="inline-flex text-violet-light hover:text-lilac transition-colors font-medium"
      >
        {textes.apropos.boutonPlus}
      </Link>
    </section>
  );
}
