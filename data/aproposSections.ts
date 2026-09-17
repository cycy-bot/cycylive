// ============================================================
// SECTIONS "À PROPOS" — réorganisables depuis /admin
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Ajoute, retire, réordonne et modifie ces sections depuis
// l'interface web sur /admin, onglet "À propos".
//
// Le tableau ci-dessous ne sert que de valeur PAR DÉFAUT — celle
// que tu as demandée pour démarrer.

export type SectionAPropos = {
  id: string;
  titre: string;
  texte: string; // HTML simple (gras/italique/souligné/retours à la ligne)
};

export const sectionsAProposParDefaut: SectionAPropos[] = [
  {
    id: "1",
    titre: "Bienvenue dans mon univers",
    texte:
      "Je suis Cycy — streameuse et créatrice de contenu. Je fais du live sur Twitch plusieurs fois par semaine, principalement autour du gaming, avec quelques incursions dans le lifestyle et les discussions communautaires.",
  },
  {
    id: "2",
    titre: "Du live… mais pas que",
    texte:
      "Du FPS compétitif, des soirées jeux d'horreur entre ami·es, des sessions plus tranquilles, et beaucoup d'échanges avec la communauté. En dehors du live, je crée aussi du contenu court pour TikTok, Instagram et YouTube.",
  },
  {
    id: "3",
    titre: "Le setup derrière les lives",
    texte:
      "Mon setup évolue régulièrement — je le détaillerai bientôt ici (PC, périphériques, éclairage, déco). Reviens jeter un œil !",
  },
  {
    id: "4",
    titre: "En dehors du stream",
    texte:
      "Jeux du moment, créateurs que je suis, contenus qui m'inspirent : cette section arrive bientôt avec mes vrais coups de cœur.",
  },
  {
    id: "5",
    titre: "Travaillons ensemble",
    texte:
      "Marques, événements, créateurs : je suis ouverte à différents types de collaborations.",
  },
];
