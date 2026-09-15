import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BarreMobile from "@/components/BarreMobile";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Police "display" réservée aux titres : plus géométrique et distinctive,
// pour que les titres se démarquent nettement du texte courant (Inter).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cycylive — Streameuse & créatrice de contenu",
  description:
    "Le hub central de Cycylive : lives Twitch, planning, réseaux, communauté et partenariats.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="fond-spatial min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <BarreMobile />
      </body>
    </html>
  );
}
