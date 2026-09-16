import Image from "next/image";
import { lireTextes } from "@/lib/textesStore";
import AccentCosmique from "@/components/AccentCosmique";

export default async function AProposPage() {
  const textes = await lireTextes();
  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
      <AccentCosmique variante="lune" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-10">
        {textes.apropos.pageTitre}
      </h1>

      <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-start">
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden liseret-glow border border-violet/25">
          <Image
            src="/images/cycy-photo.jpg"
            alt="Cycy"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-5 text-ink-soft leading-relaxed">
          <p>{textes.apropos.pageTexte1}</p>
          <p>{textes.apropos.pageTexte2}</p>
          <p>{textes.apropos.pageTexte3}</p>
        </div>
      </div>
    </div>
  );
}
