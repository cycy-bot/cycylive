// ============================================================
// API — formulaire de contact
// ============================================================
// Envoie un vrai email via Resend (resend.com), sans jamais
// exposer l'adresse mail dans le code envoyé au navigateur.
//
// Variables d'environnement nécessaires (voir README) :
//   RESEND_API_KEY
// Optionnelle :
//   RESEND_FROM_EMAIL  (par défaut : "Cycylive <onboarding@resend.dev>")
//
// Protection antispam : un champ "site" caché (honeypot) — si un
// robot le remplit, on répond "ok" sans jamais envoyer l'email,
// pour ne pas lui donner d'indice.

import { NextRequest, NextResponse } from "next/server";
import { liens } from "@/data/liens";

const CATEGORIES = [
  "Partenariat",
  "Collaboration",
  "Événement",
  "Proposition professionnelle",
  "Autre",
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  }

  const { nom, email, sujet, categorie, message, site } = body;

  // Honeypot : un vrai visiteur ne remplit jamais ce champ (invisible pour lui).
  if (site) {
    return NextResponse.json({ ok: true });
  }

  if (!nom || !email || !sujet || !message) {
    return NextResponse.json(
      { ok: false, erreur: "Merci de remplir tous les champs obligatoires." },
      { status: 400 }
    );
  }

  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValide) {
    return NextResponse.json(
      { ok: false, erreur: "L'adresse email n'a pas l'air valide." },
      { status: 400 }
    );
  }

  if (!CATEGORIES.includes(categorie)) {
    return NextResponse.json(
      { ok: false, erreur: "Catégorie de demande invalide." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        erreur:
          "L'envoi de mail n'est pas encore configuré (RESEND_API_KEY manquante). Voir le README.",
      },
      { status: 500 }
    );
  }

  const from = process.env.RESEND_FROM_EMAIL || "Cycylive <onboarding@resend.dev>";

  try {
    const reponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: liens.mailPro,
        reply_to: email,
        subject: `[Cycylive — ${categorie}] ${sujet}`,
        html: `
          <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
          <p><strong>Email :</strong> ${escapeHtml(email)}</p>
          <p><strong>Catégorie :</strong> ${escapeHtml(categorie)}</p>
          <p><strong>Sujet :</strong> ${escapeHtml(sujet)}</p>
          <p><strong>Message :</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!reponse.ok) {
      return NextResponse.json(
        { ok: false, erreur: "L'envoi a échoué, réessaie dans un instant." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, erreur: "Erreur inattendue lors de l'envoi." },
      { status: 500 }
    );
  }
}

function escapeHtml(texte: string): string {
  return String(texte)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
