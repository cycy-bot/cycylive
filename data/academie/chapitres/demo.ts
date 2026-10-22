// ============================================================
// L'ACADÉMIE DES ASTRES — SCÈNE DE DÉMONSTRATION
// ============================================================
// ⚠️ TEXTE TEMPORAIRE, NON CANONIQUE.
// Cette scène sert uniquement à tester le moteur de lecture :
// dialogues, portraits, choix, conséquences et variations. Elle ne
// fait pas partie de l'histoire officielle et sera supprimée.
//
// Balises disponibles dans les textes (voir lib/academie/texte.ts) :
//   {prenom} {nom} {il} {Il} {e} {g:masculin|féminin|neutre}
//   {maison} {Maison}

import type { Chapitre, Scene } from "../types";

const sceneCour: Scene = {
  id: "demo-cour",
  titre: "Une arrivée mouvementée",
  decor: "cour-apres-midi",
  drapeaux: {
    lentille_sauvee: "Tu as rattrapé la lentille du professeur Bellamy au vol.",
    lentille_mouillee: "La lentille du professeur a fini dans la fontaine…",
    lentille_retrouvee: "… et tu l'as repêchée en tombant dans la fontaine.",
    trempe: "Tu as fini ta première journée trempé{e} jusqu'aux os.",
    rivalite_iris: "Iris te considère désormais comme une rivale amicale.",
    copernic_ami: "Copernic, le hibou mécanique, s'est posé sur toi.",
  },
  lignes: [
    { type: "narration", texte: "La lumière dorée de fin d'après-midi glisse sur les pierres de la cour principale. Quelque part, une cloche sonne cinq heures." },
    { type: "narration", si: { trait: "reserve" }, texte: "Ta valise à la main, tu restes un instant en retrait pour observer les allées et venues des élèves." },
    { type: "narration", si: { sansTrait: "reserve" }, texte: "Ta valise à la main, tu avances au milieu des élèves, le nez levé vers le dôme de l'observatoire." },
    { type: "narration", texte: "Des pas précipités. Un garçon aux boucles en bataille fonce droit sur toi, les bras chargés de rouleaux de cartes célestes." },
    { type: "dialogue", perso: "milo", expression: "surpris", texte: "Attention, attention, pardon, je — oh !" },
    { type: "narration", texte: "Trop tard. Les rouleaux s'envolent. L'un d'eux roule vers le bord de la fontaine… et quelque chose de brillant s'en échappe." },
    { type: "dialogue", perso: "milo", expression: "gene", texte: "Dis-moi que ce n'était pas la lentille du professeur Bellamy. Dis-moi que ce n'était PAS la lentille du professeur Bellamy." },

    // ---------- DÉCISION 1 ----------
    {
      type: "choix",
      id: "premier_contact",
      question: "La lentille roule vers l'eau. Que fais-tu ?",
      options: [
        {
          id: "aider",
          texte: "Poser ta valise et l'aider à tout ramasser.",
          effets: [{ type: "relation", perso: "milo", valeur: 2 }],
          note: "Milo n'oubliera pas ton aide.",
          vers: "c1_aider",
        },
        {
          id: "plonger",
          texte: "Plonger pour rattraper la lentille avant qu'elle ne tombe.",
          effets: [
            { type: "relation", perso: "milo", valeur: 1 },
            { type: "drapeau", id: "lentille_sauvee" },
          ],
          note: "La lentille est sauvée !",
          vers: "c1_plonger",
        },
        {
          id: "blague",
          si: { trait: "espiegle" },
          texte: "« Bonne nouvelle : les étoiles, elles, sont toujours à leur place. »",
          effets: [{ type: "relation", perso: "milo", valeur: 2 }],
          note: "Ton humour a conquis Milo. (Option liée à ton trait Espiègle)",
          vers: "c1_blague",
        },
        {
          id: "question",
          si: { sansTrait: "espiegle" },
          texte: "Lui demander très calmement ce qu'est une « lentille du professeur Bellamy ».",
          effets: [{ type: "relation", perso: "milo", valeur: 1 }],
          note: "Milo apprécie ton calme.",
          vers: "c1_question",
        },
      ],
    },

    { type: "etiquette", id: "c1_aider" },
    { type: "narration", texte: "Tu t'accroupis à côté de lui. À deux, les rouleaux sont vite rassemblés." },
    { type: "dialogue", perso: "milo", expression: "sourire", texte: "Toi, tu viens de gagner un ami pour la vie. Ou au moins pour la semaine. Moi c'est Milo !" },
    { type: "narration", texte: "La lentille, elle, termine sa course dans la fontaine avec un petit « plouf »." },
    { type: "effet", effets: [{ type: "drapeau", id: "lentille_mouillee" }] },
    { type: "dialogue", perso: "milo", expression: "gene", texte: "… On dira que c'est le vent." },
    { type: "aller", vers: "iris" },

    { type: "etiquette", id: "c1_plonger" },
    { type: "narration", texte: "Tu lâches ta valise et plonges. Tes doigts se referment sur le verre froid, à un centimètre de l'eau." },
    { type: "narration", si: { maison: ["lion"] }, texte: "Un réflexe digne de la Maison du Lion." },
    { type: "dialogue", perso: "milo", expression: "rire", texte: "WAOUH. Tu as vu ça ? Personne ne va me croire. Moi c'est Milo, au fait. Et tu viens de me sauver la vie." },
    { type: "aller", vers: "iris" },

    { type: "etiquette", id: "c1_blague" },
    { type: "dialogue", perso: "milo", expression: "rire", texte: "Ha ! Tu as raison. Les étoiles s'en fichent. Le professeur Bellamy, beaucoup moins. Moi c'est Milo !" },
    { type: "narration", texte: "Il rit si fort qu'il en oublie la lentille, qui glisse doucement dans la fontaine." },
    { type: "effet", effets: [{ type: "drapeau", id: "lentille_mouillee" }] },
    { type: "aller", vers: "iris" },

    { type: "etiquette", id: "c1_question" },
    { type: "dialogue", perso: "milo", expression: "pensif", texte: "Une lentille de télescope. Ancienne. Unique. Irremplaçable. Fragile. Enfin, tu vois le genre." },
    { type: "narration", texte: "Pendant qu'il énumère, la lentille termine tranquillement sa course dans la fontaine." },
    { type: "effet", effets: [{ type: "drapeau", id: "lentille_mouillee" }] },
    { type: "dialogue", perso: "milo", expression: "gene", texte: "… Et mouillée, maintenant. Moi c'est Milo. Enchanté. Désolé. Les deux." },

    // ---------- IRIS ----------
    { type: "etiquette", id: "iris" },
    { type: "narration", texte: "Une voix amusée s'élève derrière vous." },
    { type: "dialogue", perso: "iris", expression: "malicieux", texte: "Milo. Trois minutes après la cloche, et tu as déjà semé le chaos. C'est un record, même pour toi." },
    { type: "dialogue", perso: "milo", expression: "gene", texte: "Iris ! Je te présente… euh…" },
    { type: "dialogue", perso: "joueur", texte: "{prenomNom}. Enchanté{e}." },
    { type: "dialogue", perso: "iris", expression: "neutre", texte: "Iris. Maison du Cygne, comme ce désastre ambulant." },
    { type: "dialogue", perso: "iris", expression: "sourire", si: { maison: ["cygne"] }, texte: "Et à en juger par tes couleurs, comme toi aussi. Bienvenue chez nous, {prenom}." },
    { type: "dialogue", perso: "iris", expression: "pensif", si: { maison: ["lion"] }, texte: "La Maison du Lion, hein ? On dit que vous foncez d'abord et que vous réfléchissez ensuite. J'ai hâte de vérifier." },
    { type: "dialogue", perso: "iris", expression: "pensif", si: { maison: ["dragon"] }, texte: "Le Dragon… Les gens de ta maison ne lâchent jamais rien. C'est rassurant, en général. Un peu effrayant aussi." },
    { type: "narration", si: { trait: "curieux" }, texte: "Elle te détaille avec une curiosité qui ressemble beaucoup à la tienne." },
    { type: "dialogue", perso: "iris", expression: "neutre", texte: "Alors dis-moi, {prenom} : qu'est-ce qui t'amène à l'Académie des Astres ?" },

    // ---------- DÉCISION 2 ----------
    {
      type: "choix",
      id: "motivation",
      question: "Que réponds-tu à Iris ?",
      options: [
        {
          id: "etoiles",
          texte: "« Les étoiles. J'ai toujours voulu comprendre ce qu'elles racontent. »",
          effets: [{ type: "relation", perso: "iris", valeur: 2 }],
          note: "Iris semble touchée par ta réponse.",
          vers: "c2_etoiles",
        },
        {
          id: "honnete",
          texte: "« Honnêtement ? Je ne sais pas encore. J'espère le découvrir ici. »",
          effets: [
            { type: "relation", perso: "iris", valeur: 1 },
            { type: "relation", perso: "milo", valeur: 1 },
          ],
          note: "Ta sincérité plaît à Iris et Milo.",
          vers: "c2_honnete",
        },
        {
          id: "ambition",
          texte: "« Je compte bien devenir {g:le meilleur|la meilleure|lae meilleur·e} de ma promotion. »",
          effets: [
            { type: "relation", perso: "iris", valeur: -1 },
            { type: "relation", perso: "milo", valeur: 1 },
            { type: "drapeau", id: "rivalite_iris" },
          ],
          note: "Iris relève le défi… Milo, lui, est ravi.",
          vers: "c2_ambition",
        },
      ],
    },

    { type: "etiquette", id: "c2_etoiles" },
    { type: "dialogue", perso: "iris", expression: "sourire", texte: "Bonne réponse. La seule, en fait. Milo, lui, est venu pour la cantine." },
    { type: "dialogue", perso: "milo", expression: "surpris", texte: "Et pour les étoiles ! Un peu. Après la cantine." },
    { type: "aller", vers: "bellamy" },

    { type: "etiquette", id: "c2_honnete" },
    { type: "dialogue", perso: "iris", expression: "pensif", texte: "C'est plus honnête que la plupart des réponses que j'entends. Ça me plaît." },
    { type: "dialogue", perso: "milo", expression: "sourire", texte: "Moi non plus, je ne savais pas ! Et regarde-moi aujourd'hui : je fais tomber des lentilles." },
    { type: "aller", vers: "bellamy" },

    { type: "etiquette", id: "c2_ambition" },
    { type: "dialogue", perso: "iris", expression: "malicieux", texte: "Ah. Alors nous voilà en compétition. Je te préviens : je suis première de ma promotion depuis deux ans." },
    { type: "dialogue", perso: "milo", expression: "rire", texte: "Oh non. Oh non, c'est génial. Je vais vendre des tickets." },

    // ---------- BELLAMY ----------
    { type: "etiquette", id: "bellamy" },
    { type: "narration", texte: "Un cliquetis métallique résonne au-dessus de vos têtes. Un petit hibou de cuivre, ailes déployées, se pose au sommet de la statue de la fontaine." },
    { type: "narration", texte: "Surgit alors un vieil homme en veste de tweed, les cheveux blancs en pleine tempête, une loupe battant contre sa poitrine." },
    { type: "dialogue", perso: "bellamy", expression: "surpris", texte: "Copernic ! Descends de là immédiatement, espèce de pigeon à ressorts ! Ah — des élèves. Parfait. Splendide. J'ai besoin d'aide." },
    { type: "dialogue", perso: "milo", expression: "gene", si: { drapeau: "lentille_mouillee" }, texte: "Professeur ! Alors, au sujet de votre lentille…" },
    { type: "dialogue", perso: "bellamy", expression: "pensif", si: { drapeau: "lentille_mouillee" }, texte: "Plus tard, Milo. Une catastrophe à la fois." },
    { type: "dialogue", perso: "milo", expression: "sourire", si: { drapeau: "lentille_sauvee" }, texte: "Professeur ! Votre lentille ! Sauvée par {prenom}, ici présent{e}." },
    { type: "dialogue", perso: "bellamy", expression: "rire", si: { drapeau: "lentille_sauvee" }, texte: "Magnifique ! Des réflexes pareils, ça ne s'enseigne pas. Enfin si, mais c'est très long." },
    { type: "dialogue", perso: "bellamy", expression: "sourire", texte: "Professeur Auguste Bellamy, astronomie. Quarante ans de maison, et propriétaire d'un hibou qui a décidé ce matin qu'il préférait la liberté." },
    { type: "dialogue", perso: "bellamy", expression: "sourire", si: { maison: ["lion"] }, texte: "Un Lion ! Excellent. Il me faut justement quelqu'un qui n'a pas peur du vide." },
    { type: "dialogue", perso: "bellamy", expression: "sourire", si: { maison: ["cygne"] }, texte: "Encore un Cygne ! Vous autres comprenez les créatures mieux que quiconque." },
    { type: "dialogue", perso: "bellamy", expression: "sourire", si: { maison: ["dragon"] }, texte: "Un Dragon ! Patience et méthode, voilà exactement ce qu'il faut avec Copernic." },
    { type: "dialogue", perso: "milo", expression: "sourire", texte: "Il adore quand on lui siffle sa petite chanson !" },
    { type: "dialogue", perso: "iris", expression: "pensif", texte: "Ou alors, on utilise la lumière. Les automates du professeur suivent les reflets, tout le monde le sait." },
    { type: "dialogue", perso: "bellamy", expression: "neutre", texte: "Alors, {prenom}. Comment fait-on descendre un hibou têtu ?" },

    // ---------- DÉCISION 3 ----------
    {
      type: "choix",
      id: "copernic",
      question: "Comment fais-tu descendre Copernic ?",
      options: [
        {
          id: "siffler",
          texte: "Suivre l'idée de Milo : siffler sa chanson préférée.",
          effets: [{ type: "relation", perso: "milo", valeur: 2 }],
          note: "Milo est ravi que tu aies suivi son idée.",
          vers: "c3_siffler",
        },
        {
          id: "lumiere",
          texte: "Suivre l'idée d'Iris : l'attirer avec un reflet de soleil.",
          effets: [
            { type: "relation", perso: "iris", valeur: 2 },
            { type: "drapeau", id: "copernic_ami" },
          ],
          note: "Iris remarque que tu lui as fait confiance.",
          vers: "c3_lumiere",
        },
        {
          id: "grimper",
          texte: "Grimper sur la statue et aller le chercher toi-même.",
          effets: [
            { type: "relation", perso: "milo", valeur: 1 },
            { type: "relation", perso: "iris", valeur: 1 },
            { type: "drapeau", id: "trempe" },
          ],
          note: "Audacieux. Et humide.",
          vers: "c3_grimper",
        },
      ],
    },

    { type: "etiquette", id: "c3_siffler" },
    { type: "narration", texte: "Milo et toi sifflez à l'unisson. Enfin, presque. Après quelques notes atrocement fausses, Copernic descend… visiblement pour vous faire taire." },
    { type: "dialogue", perso: "bellamy", expression: "rire", texte: "Ha ! Il n'a jamais supporté les fausses notes. Brillant, absolument brillant." },
    { type: "dialogue", perso: "milo", expression: "rire", texte: "Équipe de choc. On recommence demain ?" },
    { type: "aller", vers: "fin" },

    { type: "etiquette", id: "c3_lumiere" },
    { type: "dialogue", perso: "iris", expression: "sourire", si: { sansDrapeau: "lentille_sauvee" }, texte: "Tiens, prends mon miroir de poche. Vise le rebord, juste devant lui." },
    { type: "narration", si: { drapeau: "lentille_sauvee" }, texte: "Tu brandis la lentille sauvée tout à l'heure : le rayon doré qu'elle projette est parfait." },
    { type: "narration", texte: "Copernic suit le point lumineux, saute de pierre en pierre et finit par se poser, très digne, sur ton poignet." },
    { type: "dialogue", perso: "iris", expression: "sourire", texte: "Pas mal du tout. Tu as l'œil, {prenom}." },
    { type: "aller", vers: "fin" },

    { type: "etiquette", id: "c3_grimper" },
    { type: "narration", texte: "Tu enjambes le rebord et poses le pied sur la statue… qui est bien plus glissante qu'elle n'en a l'air." },
    { type: "narration", texte: "Copernic s'envole au dernier moment pour se poser tranquillement sur l'épaule de Bellamy. Toi, tu finis dans la fontaine." },
    { type: "narration", si: { drapeau: "lentille_mouillee" }, texte: "Au fond de l'eau, ta main se referme sur quelque chose de lisse et froid : la lentille !" },
    { type: "effet", si: { drapeau: "lentille_mouillee" }, effets: [{ type: "drapeau", id: "lentille_retrouvee" }, { type: "relation", perso: "milo", valeur: 1 }] },
    { type: "dialogue", perso: "milo", expression: "rire", si: { drapeau: "lentille_retrouvee" }, texte: "Tu as retrouvé la lentille ! Tu es trempé{e}, mais tu viens de sauver ma réputation !" },
    { type: "dialogue", perso: "iris", expression: "rire", texte: "C'est la meilleure entrée en matière que j'aie vue depuis des années." },

    // ---------- FIN ----------
    { type: "etiquette", id: "fin" },
    { type: "dialogue", perso: "bellamy", expression: "sourire", texte: "Bravo, bravo ! Pour vous remercier : observatoire, ce soir, vingt-deux heures. Il y aura du thé, des étoiles, et Copernic, s'il se tient correctement." },
    { type: "dialogue", perso: "bellamy", expression: "pensif", si: { drapeau: "trempe" }, texte: "Et changez-vous d'abord, {prenom}. Vous ressemblez à un cygne qui aurait raté son amerrissage." },
    { type: "dialogue", perso: "milo", expression: "sourire", texte: "On passe te chercher ! Enfin, si tu veux. Tu veux ? Dis oui." },
    { type: "dialogue", perso: "milo", expression: "sourire", si: { relationMin: { perso: "milo", valeur: 3 } }, texte: "Je crois que c'est le début d'une grande amitié. J'ai un très bon instinct pour ça. Enfin… parfois." },
    { type: "dialogue", perso: "iris", expression: "sourire", si: { relationMin: { perso: "iris", valeur: 3 } }, texte: "À ce soir, {prenom}. Garde-moi une place près du grand télescope." },
    { type: "dialogue", perso: "iris", expression: "malicieux", si: { drapeau: "rivalite_iris" }, texte: "Et ne crois pas que j'aie oublié notre petite compétition." },
    { type: "narration", texte: "Le soleil disparaît derrière l'observatoire. Les premières étoiles s'allument au-dessus de la cour." },
    { type: "narration", texte: "— Fin de la scène de démonstration —" },
    { type: "fin" },
  ],
};

export const chapitreDemo: Chapitre = {
  id: "demo",
  titre: "Démonstration · Scène test",
  canonique: false,
  scenes: [sceneCour],
};
