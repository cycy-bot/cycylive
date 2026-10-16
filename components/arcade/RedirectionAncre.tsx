"use client";

// Les anciens liens « /jeux/arcade#memory » ouvrent directement le jeu (/jeux/arcade/memory).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { JEUX_SALLE } from "@/lib/arcadeRegles";

export default function RedirectionAncre() {
  const router = useRouter();
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h in JEUX_SALLE) router.replace(`/jeux/arcade/${h}`);
    else if (h === "runner") router.replace("/jeux/runner");
  }, [router]);
  return null;
}
