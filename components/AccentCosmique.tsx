import {
  IconPlanetRing,
  IconRocket,
  IconMoonCrescent,
  IconStar4,
} from "@/components/Icons";

type Variante = "planete" | "fusee" | "lune" | "constellation";

export default function AccentCosmique({ variante }: { variante: Variante }) {
  if (variante === "planete") {
    return (
      <div
        className="fixed bottom-[-4rem] right-[-3rem] -z-10 pointer-events-none opacity-70"
        style={{ animation: "derive-lente 14s ease-in-out infinite" }}
        aria-hidden
      >
        <IconPlanetRing className="w-40 h-40 text-violet-light/50" />
      </div>
    );
  }

  if (variante === "fusee") {
    return (
      <div
        className="fixed top-[18%] right-[6%] -z-10 pointer-events-none opacity-60 rotate-[35deg]"
        style={{ animation: "derive-lente 10s ease-in-out infinite" }}
        aria-hidden
      >
        <IconRocket className="w-14 h-14 text-lilac/60" />
      </div>
    );
  }

  if (variante === "lune") {
    return (
      <div
        className="fixed top-[-3rem] left-[-2rem] -z-10 pointer-events-none opacity-60"
        style={{ animation: "derive-lente 16s ease-in-out infinite" }}
        aria-hidden
      >
        <IconMoonCrescent className="w-36 h-36 text-violet-light/40" />
      </div>
    );
  }

  // constellation : quelques étoiles à 4 branches supplémentaires,
  // pour une page un peu plus "habitée" (communauté).
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-70" aria-hidden>
      <IconStar4
        className="absolute top-[14%] left-[20%] w-4 h-4 text-lilac/50"
        style={{ animation: "scintille 3.4s ease-in-out infinite" }}
      />
      <IconStar4
        className="absolute top-[65%] left-[85%] w-3 h-3 text-violet-light/50"
        style={{ animation: "scintille 4s ease-in-out 1.2s infinite" }}
      />
      <IconStar4
        className="absolute top-[80%] left-[10%] w-3.5 h-3.5 text-lilac/40"
        style={{ animation: "scintille 3.7s ease-in-out 0.6s infinite" }}
      />
    </div>
  );
}
