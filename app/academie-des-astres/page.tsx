import type { Metadata } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import AcademieApp from "@/components/academie/AcademieApp";

// Polices propres au jeu : titres gravés (Cormorant) et texte de
// lecture (EB Garamond). Elles ne sont chargées que sur cette page.
const titre = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-ada-titre",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const texte = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-ada-texte",
  style: ["normal", "italic"],
  display: "swap",
});

// Prototype : page non indexée et absente du menu et du sitemap.
export const metadata: Metadata = {
  title: "L'Académie des Astres — prototype | Cycylive",
  description: "Prototype du jeu narratif L'Académie des Astres.",
  robots: { index: false, follow: false },
};

export default function AcademieDesAstresPage() {
  return (
    <div className={`${titre.variable} ${texte.variable}`}>
      <AcademieApp />
    </div>
  );
}
