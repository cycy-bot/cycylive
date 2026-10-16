"use client";

// Administration — « Je lance le live » : stories prêtes à partager sur Instagram et TikTok
import StudioStories from "@/components/admin/StudioStories";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletLive() {
  const { planning } = useAdmin();
  return (
    <>
      <p className="text-ink-soft mb-6 text-sm">
        Choisis un modèle : la story se remplit toute seule avec le planning du jour. Sur téléphone, « Partager » l&apos;envoie
        directement dans Instagram ou TikTok. L&apos;annonce Discord, elle, part toujours automatiquement dès que le live démarre.
      </p>
      <StudioStories planning={planning} />
    </>
  );
}
