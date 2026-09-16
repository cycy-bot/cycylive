import { liens } from "@/data/liens";
import { lireTextes } from "@/lib/textesStore";
import AccentCosmique from "@/components/AccentCosmique";
import { IconDiscord, IconCrystal, IconStar4, IconOrbit } from "@/components/Icons";

const piliers = [
  { titre: "Soirées jeux", texte: "Sessions communautaires régulières sur différents jeux.", icon: IconCrystal },
  { titre: "Événements", texte: "Annonces en avant-première et moments spéciaux.", icon: IconStar4 },
  { titre: "Discussions", texte: "Un espace pour échanger au quotidien, entre deux lives.", icon: IconOrbit },
];

export default async function CommunautePage() {
  const textes = await lireTextes();
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-8 py-16 text-center">
      <AccentCosmique variante="constellation" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-6">
        {textes.communaute.titre}
      </h1>
      <p className="text-ink-soft leading-relaxed mb-10">
        {textes.communaute.pageTexte}
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-10 text-left">
        {piliers.map(({ titre, texte, icon: Icon }) => (
          <div key={titre} className="carte-holo rounded-2xl p-5 border border-violet/12">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light mb-3">
              <Icon className="w-4 h-4" />
            </span>
            <h3 className="text-ink font-medium mb-2">{titre}</h3>
            <p className="text-ink-soft text-sm">{texte}</p>
          </div>
        ))}
      </div>

      <a
        href={liens.discord}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
      >
        <IconDiscord className="w-4 h-4" />
        Rejoindre le Discord
      </a>
    </div>
  );
}
