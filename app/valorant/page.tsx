import { lireNewsValorant, lireProfilValorant } from "@/lib/valorantStore";
import AccentCosmique from "@/components/AccentCosmique";
import ValorantTabs from "@/components/ValorantTabs";
import { IconValorant } from "@/components/Icons";

export default async function ValorantPage() {
  const news = await lireNewsValorant();
  const profil = await lireProfilValorant();

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
      <AccentCosmique variante="fusee" />
      <div className="flex items-center gap-3 mb-4">
        <span className="h-10 w-10 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
          <IconValorant className="w-5 h-5" />
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text">
          Valorant
        </h1>
      </div>
      <p className="text-ink-soft leading-relaxed mb-8 max-w-2xl">
        Les dernières news, mes favoris, et mon rank actuel — tout mon
        univers Valorant au même endroit.
      </p>

      <ValorantTabs news={news} profil={profil} />
    </div>
  );
}
