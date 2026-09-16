import { lireContenus } from "@/lib/contenusStore";
import { ajouterMiniatures } from "@/lib/miniatures";
import GalerieContenus from "@/components/GalerieContenus";

export default async function DerniersContenus() {
  const contenus = await ajouterMiniatures(await lireContenus());

  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-5 md:px-8 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink">
          Derniers contenus
        </h2>
      </div>

      <GalerieContenus contenus={contenus} />
    </section>
  );
}
