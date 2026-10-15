import type { Metadata } from "next";
import Link from "next/link";
import AccentCosmique from "@/components/AccentCosmique";
import MuseeCycylive from "@/components/MuseeCycylive";
import { lireTimeline } from "@/lib/timelineStore";

export const metadata: Metadata = {
  title: "Le Musée Cycylive | Cycylive",
  description: "L’histoire de la chaîne Cycylive : premiers lives, moments cultes, records et souvenirs de la communauté.",
  alternates: { canonical: "/musee" },
};

export const revalidate = 300;

export default async function MuseePage() {
  const etapes = await lireTimeline();
  const total = etapes.filter((e) => !e.masquerMusee).length;
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="constellation" />
      <p className="text-xs uppercase tracking-[0.25em] text-lilac mb-3">🏛️ {total} moment{total > 1 ? "s" : ""} d’histoire</p>
      <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mb-3">Le Musée Cycylive</h1>
      <p className="text-ink-soft text-lg mb-8 max-w-2xl">
        Les grandes étapes de la chaîne, ses moments cultes et les souvenirs de la commu. Clique sur un moment pour revoir le clip et lire ce que vous en gardez.
      </p>
      <MuseeCycylive etapes={etapes} />
      <p className="text-sm text-ink-soft/70 mt-12">
        Un souvenir à ajouter ? Raconte-le sur le <Link href="/reseaux" className="text-lilac hover:text-ink">Discord</Link> 💜
      </p>
    </div>
  );
}
