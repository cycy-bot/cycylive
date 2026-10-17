"use client";

// Administration — Générateur de contenus à partir d'un clip
import GenerateurContenus from "@/components/admin/GenerateurContenus";

export default function OngletGenerateur() {
  return (
    <>
      <p className="text-ink-soft mb-6 text-sm">
        Importe un clip et prépare en quelques minutes la version verticale (TikTok, Reels, Shorts) avec ton titre et tes sous-titres, la
        miniature YouTube, une story et les textes à copier. Tout se fait sur ton appareil : rien n’est publié sans toi.
      </p>
      <GenerateurContenus />
    </>
  );
}
