"use client";

import { useState } from "react";
import { liens } from "@/data/liens";
import { useTextes } from "@/components/useTextes";
import TexteRiche from "@/components/TexteRiche";
import { IconMail } from "@/components/Icons";

const categories = [
  "Partenariat",
  "Collaboration",
  "Événement",
  "Proposition professionnelle",
  "Autre",
];

export default function ContactPage() {
  const [categorie, setCategorie] = useState(categories[0]);
  const [envoye, setEnvoye] = useState(false);
  const textes = useTextes();

  return (
    <div className="mx-auto max-w-2xl px-5 md:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-4">
        {textes.contact.titre}
      </h1>
      <TexteRiche html={textes.contact.texte} className="text-ink-soft mb-4" />

      <a
        href={`mailto:${liens.mailPro}`}
        className="inline-flex items-center gap-2 text-violet-light hover:text-lilac transition-colors font-medium mb-10"
      >
        <IconMail className="w-4 h-4" />
        {liens.mailPro}
      </a>

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
          setEnvoye(true);
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

        {envoye && (
          <p className="text-sm text-lilac text-center pt-1">
            Ton logiciel mail devrait s'ouvrir avec le message pré-rempli. Si rien ne se passe, écris directement à{" "}
            <a href={`mailto:${liens.mailPro}`} className="underline hover:text-violet-light">
              {liens.mailPro}
            </a>.
          </p>
        )}
      </form>
    </div>
  );
}
