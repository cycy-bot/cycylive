import { setupParDefaut, noteSetupParDefaut } from "@/data/setup";
import { IconCrystal, IconOrbit } from "@/components/Icons";

const iconParIndex = [IconCrystal, IconOrbit];

export default function SetupCards() {
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        {setupParDefaut.map((categorie, index) => {
          const Icon = iconParIndex[index % iconParIndex.length];
          return (
            <div
              key={categorie.titre}
              className="carte-holo rounded-2xl p-5 border border-violet/12"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light mb-3">
                <Icon className="w-4 h-4" />
              </span>
              <h3 className="text-ink font-medium mb-3">{categorie.titre}</h3>
              <ul className="space-y-1.5">
                {categorie.items.map((item) => (
                  <li key={item} className="text-ink-soft text-sm flex gap-2">
                    <span className="text-violet-light/60 shrink-0">–</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {noteSetupParDefaut && (
        <p className="text-ink-soft/60 text-sm italic mt-4">{noteSetupParDefaut}</p>
      )}
    </div>
  );
}
