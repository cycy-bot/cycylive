import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BarreMobile from "@/components/BarreMobile";
import CielAnime from "@/components/CielAnime";

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
  metadataBase: new URL(SITE_URL),
  applicationName: "Cycylive",
  title: "Cycylive — Streameuse & créatrice de contenu",
  description:
    "Le hub central de Cycylive : lives Twitch, planning, réseaux, communauté et partenariats.",
  openGraph: {
    title: "Cycylive — Streameuse & créatrice de contenu",
    description:
      "Le hub central de Cycylive : lives Twitch, planning, réseaux, communauté et partenariats.",
    type: "website",
    siteName: "Cycylive",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycylive — Streameuse & créatrice de contenu",
    description:
      "Le hub central de Cycylive : lives Twitch, planning, réseaux, communauté et partenariats.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0a17",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="fond-spatial min-h-screen flex flex-col">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-violet focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white">
          Aller au contenu
        </a>
        <CielAnime />
        <Header />
        <main id="contenu" tabIndex={-1} className="flex-1 pb-16 md:pb-0 outline-none">{children}</main>
        <Footer />
        <BarreMobile />
      </body>
    </html>
  );
}
