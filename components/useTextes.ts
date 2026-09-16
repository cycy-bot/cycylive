"use client";

import { useEffect, useState } from "react";
import { textesParDefaut, type Textes } from "@/data/textes";

// Récupère les textes réels (enregistrés via /admin) une fois au
// chargement. Pas besoin de rafraîchir en boucle comme le statut
// Twitch : les textes ne changent pas toutes les minutes.
export function useTextes(): Textes {
  const [textes, setTextes] = useState<Textes>(textesParDefaut);

  useEffect(() => {
    let annule = false;
    fetch("/api/textes", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!annule && data.textes) setTextes(data.textes);
      })
      .catch(() => {});
    return () => {
      annule = true;
    };
  }, []);

  return textes;
}
