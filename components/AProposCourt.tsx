import Link from "next/link";
import { lireTextes } from "@/lib/textesStore";
import TexteRiche from "@/components/TexteRiche";

export default async function AProposCourt() {
  const textes = await lireTextes();
  return (
    <section className="mx-auto max-w-3xl px-5 md:px-8 py-10 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
        {textes.apropos.titreAccueil}
      </h2>
      <TexteRiche
        html={textes.apropos.texteCourt}
        className="text-ink-soft mb-6 leading-relaxed"
      />
      <Link
        href="/a-propos"
        className="inline-flex text-violet-light hover:text-lilac transition-colors font-medium"
      >
        {textes.apropos.boutonPlus}
      </Link>
    </section>
  );
}
