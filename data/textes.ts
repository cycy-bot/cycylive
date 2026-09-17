// ============================================================
// TEXTES DU SITE — valeur par défaut
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Pour changer un texte au quotidien, utilise l'interface web sur
// /admin, onglet "Textes" (voir le README, section "Interface
// d'administration").
//
// Ce fichier ne sert que de valeur PAR DÉFAUT, utilisée si /admin
// n'a encore jamais rien enregistré (ou si le stockage n'est pas
// configuré).

export const textesParDefaut = {
  hero: {
    ligneCourte: "Streaming · Gaming · Valorant (surtout)",
    accroche: "Bienvenue dans mon univers.",
    description:
      "Du gaming, des échanges, parfois un peu de chaos — et une communauté qui grandit live après live.",
    boutonPrincipal: "Voir le live sur Twitch",
    boutonSecondaire: "Rejoindre le Discord",
  },
  apropos: {
    titreAccueil: "Moi, c'est Cycy",
    texteCourt:
      "Streameuse et créatrice de contenu, je passe mes lives entre gaming, discussions et bonne humeur. Ce que j'aime le plus : construire une communauté où on se sent bien, jouer sérieusement sans se prendre trop au sérieux, et partager ça avec vous chaque semaine.",
    boutonPlus: "En savoir plus",
    pageTitre: "Qui est Cycy ?",
  },
  communaute: {
    titre: "La communauté avant tout",
    texte:
      "Le Discord, c'est le vrai cœur de Cycylive. Soirées jeux, événements ponctuels, discussions, et une ambiance qu'on essaie de garder chaleureuse et sans prise de tête.",
    pageTexte:
      "Rejoindre le Discord Cycylive, c'est accéder à un espace où on organise des soirées communautaires, des sessions de jeu improvisées, des annonces de live en avant-première, et des discussions au quotidien. Pas de règles interminables, juste l'envie de passer du bon temps ensemble.",
  },
  partenariats: {
    titre: "Collaborations & Partenariats",
    intro:
      "Je développe Cycylive à la croisée du gaming, du streaming et de la création de contenu, avec une communauté engagée et une identité forte.<br><br>" +
      "Grâce à mon parcours en communication et webmarketing, j'aborde aussi les collaborations avec une vraie compréhension des enjeux de marque.<br><br>" +
      "Je privilégie des partenariats naturels, créatifs et cohérents avec mon univers.",
    typesTitre: "Collaborations possibles",
    cta: "Me contacter",
    mediaKit: "Télécharger le media kit",
  },
  contact: {
    titre: "Me contacter",
    texte:
      "Pour une collaboration, un partenariat ou toute autre demande professionnelle, remplis le formulaire ci-dessous ou écris directement par mail.",
  },
};

export type Textes = typeof textesParDefaut;
