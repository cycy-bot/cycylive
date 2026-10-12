"use client";

import { useState } from "react";

// Champ « image » de /admin : coller une adresse d'image OU envoyer un fichier
// depuis l'ordinateur / le téléphone. Le fichier est redimensionné et compressé
// dans le navigateur avant l'envoi (WebP), pour rester léger.

function chargerImage(fichier: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image illisible."));
    img.src = url;
  });
}

async function compresser(fichier: File, largeurMax: number): Promise<string> {
  // Les GIF animés sont gardés tels quels (sinon l'animation serait perdue)
  if (fichier.type === "image/gif") {
    return await new Promise((resolve, reject) => {
      const lecteur = new FileReader();
      lecteur.onload = () => resolve(String(lecteur.result));
      lecteur.onerror = () => reject(new Error("Image illisible."));
      lecteur.readAsDataURL(fichier);
    });
  }
  const img = await chargerImage(fichier);
  const echelle = Math.min(1, largeurMax / img.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * echelle);
  canvas.height = Math.round(img.naturalHeight * echelle);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Ton navigateur ne peut pas préparer l'image.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  // On baisse la qualité tant que l'image dépasse ~600 Ko
  for (const qualite of [0.86, 0.75, 0.6, 0.45]) {
    const data = canvas.toDataURL("image/webp", qualite);
    if (data.length < 600 * 1024) return data;
  }
  return canvas.toDataURL("image/webp", 0.35);
}

export default function ChampImage({
  label,
  valeur,
  onChange,
  motDePasse,
  largeurMax = 1200,
  forme = "large",
}: {
  label: string;
  valeur: string;
  onChange: (url: string) => void;
  motDePasse: string;
  largeurMax?: number;
  forme?: "carre" | "large";
}) {
  const [etat, setEtat] = useState<{ type: "envoi" | "erreur"; texte: string } | null>(null);

  async function envoyer(fichier: File | undefined) {
    if (!fichier) return;
    if (!motDePasse) {
      setEtat({ type: "erreur", texte: "Entre d'abord ton mot de passe admin (champ « Mot de passe » en bas de la page)." });
      return;
    }
    setEtat({ type: "envoi", texte: "Envoi de l'image…" });
    try {
      const image = await compresser(fichier, largeurMax);
      const reponse = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasse, image }),
      });
      const data = await reponse.json().catch(() => ({}));
      if (!reponse.ok || !data.ok) throw new Error(data.erreur || "L'envoi a échoué.");
      onChange(data.url);
      setEtat(null);
    } catch (e) {
      setEtat({ type: "erreur", texte: e instanceof Error ? e.message : "L'envoi a échoué." });
    }
  }

  return (
    <div className="rounded-lg border border-violet/15 bg-card/60 p-2.5">
      <p className="text-xs text-ink-soft mb-2">{label}</p>
      <div className="flex gap-3 items-start">
        {valeur ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={valeur}
            alt=""
            className={`${forme === "carre" ? "h-14 w-14" : "h-14 w-28"} rounded-md object-cover bg-void shrink-0 border border-violet/20`}
          />
        ) : (
          <div className={`${forme === "carre" ? "h-14 w-14" : "h-14 w-28"} rounded-md bg-void/60 border border-dashed border-violet/25 shrink-0 flex items-center justify-center text-ink-soft/40 text-xs`}>
            aucune
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            type="text"
            placeholder="Adresse d'une image (https://…) ou envoie un fichier"
            value={valeur}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg bg-card border border-violet/20 px-3 py-1.5 text-sm text-ink outline-none focus:border-violet/60"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-full border border-violet/30 px-3 py-1 text-xs text-ink-soft hover:bg-violet/10">
              📤 Envoyer une image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  envoyer(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {valeur && (
              <button type="button" onClick={() => onChange("")} className="text-xs text-ink-soft/60 hover:text-red-300">
                Retirer
              </button>
            )}
            {etat && <span className={`text-xs ${etat.type === "erreur" ? "text-red-300" : "text-ink-soft"}`}>{etat.texte}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
