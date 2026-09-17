"use client";

import { useEffect, useRef } from "react";

// Petit éditeur "comme Word, en plus simple" : gras, italique, souligné,
// et les retours à la ligne sont conservés visuellement sur le site.
// Le contenu est stocké en HTML (juste <b>, <i>, <u>, <br>).
export default function EditeurRiche({
  value,
  onChange,
  minHeight = 90,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Contenu initial posé une seule fois (le composant est "non contrôlé"
  // ensuite, pour ne pas perdre la position du curseur pendant la frappe).
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function appliquer(commande: string) {
    if (ref.current) ref.current.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(commande, false);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div className="rounded-lg border border-violet/20 overflow-hidden">
      <div className="flex gap-1 bg-void/40 border-b border-violet/15 px-2 py-1">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => appliquer("bold")}
          title="Gras"
          className="h-7 w-7 rounded text-ink-soft hover:text-ink hover:bg-violet/15 font-bold text-sm transition-colors"
        >
          G
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => appliquer("italic")}
          title="Italique"
          className="h-7 w-7 rounded text-ink-soft hover:text-ink hover:bg-violet/15 italic text-sm transition-colors"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => appliquer("underline")}
          title="Souligné"
          className="h-7 w-7 rounded text-ink-soft hover:text-ink hover:bg-violet/15 underline text-sm transition-colors"
        >
          S
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (ref.current) onChange(ref.current.innerHTML);
        }}
        style={{ minHeight }}
        className="w-full bg-card px-3 py-2 text-sm text-ink outline-none leading-relaxed [&_b]:font-semibold [&_i]:italic [&_u]:underline"
      />
    </div>
  );
}
