import type { Metadata } from "next";
import Link from "next/link";
import AccentCosmique from "@/components/AccentCosmique";
import Annuaire from "@/components/membres/Annuaire";
import { lireAnnuaire } from "@/lib/membres";

export const metadata: Metadata = {
  title: "Les Cycylien·nes | Cycylive",
  description: "Les membres de la communauté Cycylive : leur orbite, leurs succès, leurs cartes et leur compagnon.",
  alternates: { canonical: "/membres" },
};

export const revalidate = 60;

export default async function MembresPage() {
  const membres = await lireAnnuaire();
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />
      <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mb-3">Les Cycylien·nes</h1>
      <p className="text-ink-soft text-lg mb-6 max-w-2xl">
        L’équipage de la galaxie Cycylive. Chaque membre choisit ce qu’il partage : orbite, succès, cartes, compagnon…
      </p>
      <Link href="/profil" className="inline-flex rounded-full px-5 py-2.5 bg-violet text-ink text-sm font-medium hover:bg-violet-light hover:shadow-glow transition-all mb-8">
        🪪 Créer ou modifier mon profil
      </Link>
      {membres ? <Annuaire membres={membres} /> : <p className="text-ink-soft">L’annuaire est momentanément indisponible, reviens dans un instant.</p>}
    </div>
  );
}
