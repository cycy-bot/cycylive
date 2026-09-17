// ============================================================
// SECTIONS "À PROPOS" — réorganisables depuis /admin
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Ajoute, retire, réordonne et modifie ces sections depuis
// l'interface web sur /admin, onglet "À propos".
//
// Chaque bloc a un "type" :
// - "texte"    → un titre + un texte que tu écris toi-même
// - "setup"    → affiche automatiquement le bloc Setup (PC/Matériel)
// - "timeline" → affiche automatiquement ta timeline
// Ça te permet de positionner le Setup et la Timeline exactement
// où tu veux dans la page, en les réordonnant comme les autres.
//
// Le tableau ci-dessous ne sert que de valeur PAR DÉFAUT.

export type TypeSection = "texte" | "setup" | "timeline";

export type SectionAPropos = {
  id: string;
  type: TypeSection;
  titre: string; // ignoré pour "timeline" (titre fixe "Les moments qui ont marqué l'aventure")
  texte: string; // HTML simple (gras/italique/souligné/retours à la ligne) — ignoré pour "setup"/"timeline"
};

export const sectionsAProposParDefaut: SectionAPropos[] = [
  {
    id: "1",
    type: "texte",
    titre: "Qui est Cycy ?",
    texte:
      "Moi, c'est Cycy. Je stream sur Twitch plusieurs fois par semaine, principalement autour du gaming, avec une grosse place prise aujourd'hui par Valorant.<br><br>" +
      "À la base, je voulais simplement partager mes games, mes réactions et passer de bons moments en live. Et petit à petit, une vraie communauté s'est créée autour de tout ça.<br><br>" +
      "Ce que j'aime le plus dans le streaming, ce n'est pas uniquement le jeu : ce sont les échanges, les rencontres, les private jokes, les moments complètement imprévus et tout ce qu'on construit ensemble au fil des lives.",
  },
  {
    id: "2",
    type: "texte",
    titre: "Bienvenue dans mon univers",
    texte:
      "Si tu passes sur mes lives, tu tomberas souvent sur Valorant. Très souvent, même.<br><br>" +
      "Mais il peut aussi y avoir des soirées jeux d'horreur, des découvertes, des jeux communautaires, des événements ou simplement des moments où on discute tranquillement.<br><br>" +
      "Je n'ai pas envie que mes lives soient trop formatés. J'aime qu'il y ait une idée de départ… puis que tout puisse partir dans une direction complètement différente à cause du chat, d'une game improbable ou d'une idée sortie de nulle part.<br><br>" +
      "En résumé : du gaming, beaucoup d'échanges, parfois un peu de chaos, et surtout une ambiance où tout le monde peut trouver sa place.",
  },
  {
    id: "3",
    type: "texte",
    titre: "Du live… mais pas que",
    texte:
      "Avant Twitch, j'ai suivi un parcours dans la communication et le digital, jusqu'à obtenir un Executive MBA en webmarketing et communication digitale.<br><br>" +
      "Communication, marketing, relation client digitale, partenariats, événementiel… ce sont des domaines dans lesquels je me suis formée pendant plusieurs années et qui m'ont toujours passionnée. Aujourd'hui, je retrouve naturellement une grande partie de ces compétences dans mes lives, la création de contenu et le développement de l'univers Cycylive.<br><br>" +
      "En parallèle des lives, je crée aussi du contenu sur TikTok, Instagram et YouTube : clips, moments marquants, réactions, formats courts et contenus pensés pour chaque plateforme.<br><br>" +
      "Le live reste le cœur de Cycylive, mais tout ce qui l'entoure fait aussi partie de l'aventure.",
  },
  {
    id: "4",
    type: "setup",
    titre: "Le setup derrière les lives",
    texte: "",
  },
  {
    id: "5",
    type: "timeline",
    titre: "Les moments qui ont marqué l'aventure",
    texte: "",
  },
  {
    id: "6",
    type: "texte",
    titre: "En dehors du stream",
    texte:
      "Cette section évoluera avec mes véritables coups de cœur : jeux, contenus, créateurs, univers qui m'inspirent, passions, éventuelles obsessions du moment. Pour l'instant, elle reste sobre — pas de fausses préférences inventées ici.",
  },
  {
    id: "7",
    type: "texte",
    titre: "Travaillons ensemble",
    texte:
      "Je suis ouverte aux collaborations avec des marques, événements ou autres créateurs, tant que le projet correspond à mon univers et que je peux en parler de manière naturelle à ma communauté.<br><br>" +
      "Gaming, streaming, création de contenu, événements ou projets un peu différents : je préfère surtout construire des collaborations qui ont du sens.",
  },
];
