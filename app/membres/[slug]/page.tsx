import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProfilCycylien from "@/components/membres/ProfilCycylien";
import { lireProfil } from "@/lib/membres";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await lireProfil(params.slug);
  if (!p) return { title: "Profil introuvable | Cycylive", robots: { index: false } };
  const desc = p.bio || `${p.name}, membre de la communauté Cycylive${p.orbite ? ` · orbite ${p.orbite.orbit}` : ""}.`;
  return {
    title: `${p.name} | Cycylien·ne`,
    description: desc,
    alternates: { canonical: `/membres/${p.slug}` },
    openGraph: { title: `${p.name} · Cycylive`, description: desc, images: [{ url: p.avatar }] },
  };
}

export default async function ProfilPage({ params }: { params: { slug: string } }) {
  const p = await lireProfil(params.slug);
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-8 md:py-12">
      <Link href="/membres" className="text-sm text-ink-soft hover:text-ink transition-colors">‹ Tous les Cycylien·nes</Link>
      <div className="mt-4">
        <ProfilCycylien p={p} />
      </div>
    </div>
  );
}
