"use client";

import { useState } from "react";
import { useTextes } from "@/components/useTextes";
import TexteRiche from "@/components/TexteRiche";

const categories = [
  "Partenariat",
  "Collaboration",
  "Événement",
  "Proposition professionnelle",
  "Autre",
];

type Statut = "repos" | "envoi" | "succes" | "erreur";

export default function ContactPage() {
  const [categorie, setCategorie] = useState(categories[0]);
  const [statut, setStatut] = useState<Statut>("repos");
  const [messageErreur, setMessageErreur] = useState("");
  const textes = useTextes();

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatut("envoi");
    setMessageErreur("");

    const form = e.currentTarget;
    const donnees = {
      nom: (form.elements.namedItem("nom") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      sujet: (form.elements.namedItem("sujet") as HTMLInputElement).value.trim(),
      categorie,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      site: (form.elements.namedItem("site") as HTMLInputElement).value,
    };

    try {
      const reponse = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });
      const data = await reponse.json();

      if (data.ok) {
        setStatut("succes");
        form.reset();
        setCategorie(categories[0]);
      } else {
        setStatut("erreur");
        setMessageErreur(data.erreur ?? "Une erreur est survenue, réessaie dans un instant.");
      }
    } catch {
      setStatut("erreur");
      setMessageErreur("Impossible de contacter le serveur, réessaie dans un instant.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 md:px-8 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        {textes.contact.titre}
      </h1>
      <TexteRiche html={textes.contact.texte} className="text-ink-soft mb-10" />

      {statut === "succes" ? (
        <div className="carte-holo rounded-2xl p-8 border border-violet/20 text-center">
          <p className="text-lilac font-medium mb-2">Message envoyé !</p>
          <p className="text-ink-soft text-sm">
            Merci, ton message est bien arrivé. Je te réponds dès que possible.
          </p>
          <button
            onClick={() => setStatut("repos")}
            className="mt-5 text-sm text-violet-light hover:text-lilac transition-colors"
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={envoyer}>
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="site">Ne pas remplir ce champ</label>
            <input type="text" id="site" name="site" tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <label htmlFor="nom" className="block text-sm text-ink-soft mb-1.5">Nom</label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              className="w-full rounded-xl bg-card border border-violet/20 px-4 py-2.5 text-ink outline-none focus:border-violet/60 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-ink-soft mb-1.5">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl bg-card border border-violet/20 px-4 py-2.5 text-ink outline-none focus:border-violet/60 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="categorie" className="block text-sm text-ink-soft mb-1.5">Type de demande</label>
            <select
              id="categorie"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="w-full rounded-xl bg-card border border-violet/20 px-4 py-2.5 text-ink outline-none focus:border-violet/60 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sujet" className="block text-sm text-ink-soft mb-1.5">Objet</label>
            <input
              id="sujet"
              name="sujet"
              type="text"
              required
              className="w-full rounded-xl bg-card border border-violet/20 px-4 py-2.5 text-ink outline-none focus:border-violet/60 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm text-ink-soft mb-1.5">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-xl bg-card border border-violet/20 px-4 py-2.5 text-ink outline-none focus:border-violet/60 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={statut === "envoi"}
            className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
          >
            {statut === "envoi" ? "Envoi..." : "Envoyer le message"}
          </button>

          {statut === "erreur" && (
            <p className="text-sm text-red-300 text-center">{messageErreur}</p>
          )}
        </form>
      )}
    </div>
  );
}
