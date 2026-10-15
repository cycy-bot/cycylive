import type { Metadata } from "next";
import MonProfil from "@/components/membres/MonProfil";

export const metadata: Metadata = {
  title: "Mon profil | Cycylive",
  description: "Crée et règle ton profil public de Cycylien·ne avec ton compte Discord.",
  robots: { index: false },
};

export default function MonProfilPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8 py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl leading-[1.2] pb-1 font-semibold text-ink glow-text mb-6">Mon profil</h1>
      <MonProfil />
    </div>
  );
}
