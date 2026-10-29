import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import CalendrierAvent from "@/components/arcade/CalendrierAvent";

// Calendrier de l'avent : page cachée (ni dans le menu, ni dans le plan du site) tant que Cycy ne l'a pas publiée.
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-avent", display: "swap" });

export const metadata: Metadata = {
  title: "Calendrier de l'Avent | Cycylive",
  description: "Une case à ouvrir chaque jour jusqu'à Noël : les cadeaux arrivent sur le Discord Cycylive.",
  robots: { index: false, follow: false },
};

export default function AventPage() {
  return (
    <div className={serif.variable}>
      <CalendrierAvent />
    </div>
  );
}
