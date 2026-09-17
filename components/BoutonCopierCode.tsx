"use client";

import { useState } from "react";

export default function BoutonCopierCode({ code }: { code: string }) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(code);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Silencieux : au pire, l'utilisateur sélectionne le code à la main.
    }
  }

  return (
    <button
      type="button"
      onClick={copier}
      className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-violet/20 transition-all"
    >
      <span className="font-mono tracking-wide">{code}</span>
      <span className="text-violet-light">{copie ? "Code copié !" : "Copier"}</span>
    </button>
  );
}
