"use client";

import { useState } from "react";
import { liens } from "@/data/liens";
import { textes } from "@/data/textes";

const categories = [
  "Partenariat",
  "Collaboration",
  "Événement",
  "Proposition professionnelle",
  "Autre",
];

export default function ContactPage() {
  const [categorie, setCategorie] = useState(categories[0]);

  return (
    <div className="mx-auto max-w-2xl px-5 md:px-8 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        {textes.contact.titre}
      </h1>
      <p className="text-ink-soft mb-10">{textes.contact.texte}</p>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const nom = (form.elements.namedItem("nom") as HTMLInputElement).value;
          const email = (form.elements.namedItem("email") as HTMLInputElement).value;
          const sujet = (form.elements.namedItem("sujet") as HTMLInputElement).value;
          const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

          const corps = `Catégorie : ${categorie}%0D%0ANom : ${nom}%0D%0AEmail : ${email}%0D%0A%0D%0A${message}`;
          window.location.href = `mailto:${liens.mailPro}?subject=${encodeURIComponent(
            `[Cycylive] ${sujet}`
          )}&body=${corps}`;
        }}
      >
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
          <label htmlFor="categorie" className="block text-sm text-ink-soft mb-1.5">Catégorie</label>
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
          <label htmlFor="sujet" className="block text-sm text-ink-soft mb-1.5">Sujet</label>
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
          className="w-full rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
        >
          Envoyer le message
        </button>
      </form>
    </div>
  );
}
