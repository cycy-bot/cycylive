// Partie explicative de cycylive.fr/live : toujours visible (surtout hors live, quand rien n'est en cours).
import Link from "next/link";
import { Pastille, type Teinte } from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import TitreSection from "@/components/icones/TitreSection";

const POSSIBILITES: { icone: NomIcone; teinte: Teinte; titre: string; texte: string; exemple: string }[] = [
  {
    icone: "boule", teinte: "violet", titre: "Pronostics",
    texte: "Devine l’issue d’une game ou d’un défi. Tu peux changer ta réponse jusqu’à la fermeture.",
    exemple: "« Victoire ou défaite ? » · « Combien de kills pour Cycy ? »",
  },
  {
    icone: "tactique", teinte: "ciel", titre: "Vote de strat",
    texte: "Un vote éclair avec compte à rebours, et les résultats en direct.",
    exemple: "« Quelle strat au prochain round ? » · « Quel agent pour la prochaine game ? »",
  },
  {
    icone: "drapeau", teinte: "fuchsia", titre: "Choisis ton camp",
    texte: "Rejoins une équipe et regarde la commu se répartir en temps réel.",
    exemple: "« Team Cycy ou Team adverse ? » · « Équipe 1 ou Équipe 2 » en soirée PP",
  },
  {
    icone: "fete", teinte: "or", titre: "Réactions à l’écran",
    texte: "Envoie un « GG », un « Clutch ! » ou un « Love » : il s’envole sur le live avec ton pseudo.",
    exemple: "Une réaction toutes les 15 secondes, pour que ça reste lisible pour tout le monde.",
  },
];

const ETAPES = [
  { n: 1, titre: "Connecte-toi avec Twitch", texte: "Un clic, on ne récupère que ton pseudo. Sans compte, tu peux quand même tout regarder." },
  { n: 2, titre: "Garde la page ouverte pendant le live", texte: "Pas besoin de recharger : les pronostics et les votes apparaissent tout seuls quand Cycy ou un modo les lance." },
  { n: 3, titre: "Marque des points", texte: "10 points par bonne réponse, 25 si tu trouves le nombre pile. Monte au classement des meilleurs pronostiqueurs !" },
];

export default function ExplicationLive() {
  return (
    <section aria-labelledby="explication-titre" className="mt-12 space-y-8">
      <div>
        <TitreSection id="explication-titre" icone="manette" className="mb-2">Comment ça marche ?</TitreSection>
        <p className="text-ink-soft max-w-3xl">
          Pendant les lives, au lieu d’enchaîner les commandes dans le chat, tu participes ici : depuis ton téléphone en regardant le live, ou
          directement sur cette page (le lecteur Twitch est intégré). Le chat reste lisible pour discuter, et toi, tu joues.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {POSSIBILITES.map((p) => (
          <article key={p.titre} className="carte-holo rounded-2xl p-5">
            <Pastille nom={p.icone} teinte={p.teinte} />
            <h3 className="mt-3 font-semibold text-ink">{p.titre}</h3>
            <p className="mt-1 text-sm text-ink-soft">{p.texte}</p>
            <p className="mt-2 text-xs text-ink-soft/70">{p.exemple}</p>
          </article>
        ))}
      </div>

      <div className="carte-holo rounded-3xl p-6 md:p-7">
        <h3 className="font-semibold text-ink mb-4">En 3 étapes</h3>
        <ol className="grid gap-4 md:grid-cols-3">
          {ETAPES.map((e) => (
            <li key={e.n} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/20 font-display font-semibold text-lilac ring-1 ring-violet/30">{e.n}</span>
              <div>
                <p className="font-medium text-ink">{e.titre}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{e.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-violet/20 bg-violet/5 p-5">
          <p className="flex items-center gap-2 font-semibold text-ink"><Pastille nom="eclats" teinte="or" taille="xs" /> Bonus Éclats Stellaires</p>
          <p className="mt-1.5 text-sm text-ink-soft">
            Si ton compte Twitch est lié au Discord (commande <code className="text-lilac">/lier-twitch</code>), chaque pronostic gagné te rapporte aussi des
            Éclats Stellaires, à dépenser au Marché noir. <Link href="/cycybot#galaxie" className="text-lilac underline underline-offset-2">En savoir plus</Link>
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="flex items-center gap-2 font-semibold text-ink"><Pastille nom="calendrier" teinte="ciel" taille="xs" /> Quand jouer ?</p>
          <p className="mt-1.5 text-sm text-ink-soft">
            Tout se passe pendant les lives. Hors live, la page attend sagement la prochaine session : consulte le{" "}
            <Link href="/calendrier" className="text-lilac underline underline-offset-2">calendrier des lives</Link> pour ne rien rater.
          </p>
        </div>
      </div>
    </section>
  );
}
