import { getSemaineActuelle, LABEL_GENERIQUE } from "@/data/planning";
import { lirePlanning } from "@/lib/planningStore";
import { IconMoonCrescent, IconCrystal } from "@/components/Icons";

export default async function Planning() {
  const planning = await lirePlanning();
  const { du, au } = getSemaineActuelle();

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-14">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink">
          Planning des lives
        </h2>
        <p className="text-ink-soft text-sm">
          Semaine du {du} au {au}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {planning.map((jour) => (
          <div
            key={jour.jour}
            className={`carte-holo rounded-2xl p-4 flex flex-col items-center text-center gap-2 border ${
              jour.off ? "border-violet/10" : "border-violet/35 shadow-glow-sm"
            }`}
          >
            <span className="text-xs tracking-wide text-ink-soft uppercase">
              {jour.jour}
            </span>
            {jour.off ? (
              <>
                <IconMoonCrescent className="w-6 h-6 text-violet-light" />
                <span className="text-ink-soft text-sm font-medium">OFF</span>
              </>
            ) : (
              <>
                <IconCrystal className="w-6 h-6 text-lilac" />
                <span className="text-lilac text-sm font-medium leading-tight">
                  {jour.jeu ?? LABEL_GENERIQUE}
                </span>
                <span className="text-ink text-sm font-semibold">
                  {jour.heure}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
