// « Envie d'un autre jeu ? » : les autres jeux en petites cartes, sous le classement.
import CarteJeu from "@/components/arcade/CarteJeu";
import { JEUX } from "@/lib/jeux";

export default function AutresJeux({ actuel }: { actuel: string }) {
  const autres = JEUX.filter((j) => j.id !== actuel);
  return (
    <section aria-labelledby="autres-jeux" className="mt-10">
      <h2 id="autres-jeux" className="text-xl font-semibold text-ink mb-4">Envie d&apos;un autre jeu ?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {autres.map((j) => (
          <CarteJeu key={j.id} jeu={j} format="compact" />
        ))}
      </div>
    </section>
  );
}
