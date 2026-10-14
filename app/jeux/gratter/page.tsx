import type { Metadata } from "next";
import TicketAGratter from "@/components/arcade/TicketAGratter";

export const metadata: Metadata = {
  title: "Jeux · Ticket à gratter | Cycylive",
  description: "Un ticket galactique gratuit chaque jour : gratte-le et récupère ton gain (points, Éclats, boosters…) sur le Discord Cycylive.",
  alternates: { canonical: "/jeux/gratter" },
  openGraph: { title: "Ticket à gratter | Cycylive", description: "Un ticket gratuit par jour, des gains sur le Discord.", url: "/jeux/gratter" },
};

export default function GratterPage() {
  return <TicketAGratter />;
}
