"use client";

// Administration — Générateur de contenus à partir d'un clip
import GenerateurContenus from "@/components/admin/GenerateurContenus";

export default function OngletGenerateur() {
  return (
    <>
      <p className="text-ink-soft mb-6 text-sm">
        Importe un clip (ou ta vidéo déjà au format TikTok) et habille-la en quelques clics dans ton thème : encart CYCYLIVE · TWITCH, carte titre, sous-titres, cinématique de fin. Tu as aussi la
        miniature YouTube, une story et les textes à copier. Tout se fait sur ton appareil : rien n’est publié sans toi.
      </p>
      <GenerateurContenus />
    </>
  );
}
