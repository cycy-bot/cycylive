import { NextRequest, NextResponse } from "next/server";
import { lireImage } from "@/lib/imagesStore";

// Sert une image envoyée depuis /admin. Une image ne change jamais
// (un nouvel envoi crée une nouvelle adresse) : on peut la garder en cache longtemps.
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const img = await lireImage(params.id);
  if (!img) return new NextResponse("Image introuvable", { status: 404 });
  return new NextResponse(img.octets, {
    headers: { "Content-Type": img.type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
