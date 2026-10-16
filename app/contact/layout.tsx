import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Cycylive",
  description: "Partenariat, collaboration, événement : écris à Cycylive via le formulaire de contact.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact | Cycylive", description: "Partenariat, collaboration, événement : écris à Cycylive.", url: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
