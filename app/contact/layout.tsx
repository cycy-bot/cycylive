import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Cycylive",
  description: "Contacte Cycy pour un partenariat, une collaboration ou toute autre demande professionnelle.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Cycylive",
    description: "Contacte Cycy pour un partenariat, une collaboration ou toute autre demande professionnelle.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
