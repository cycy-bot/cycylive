// ============================================================
// L'ACADÉMIE DES ASTRES — illustrations et chemins
// ============================================================
// Le prototype affiche des illustrations vectorielles provisoires
// (components/academie/art/). Pour les remplacer par de vraies
// illustrations, dépose le fichier dans public/academie-des-astres/
// puis renseigne son chemin dans `src` : il sera utilisé à la place
// du dessin vectoriel, sans toucher aux composants.
//
// Chaque entrée contient le prompt de génération à utiliser pour
// garder une identité graphique commune.

import type { DecorId, Expression, PersoId } from "./types";

/** Style commun, à placer en tête de chaque prompt. */
export const styleCommun =
  "semi-realistic stylized digital painting, modern visual novel art, dark academia, celestial and astronomical mood, palette of midnight blue, deep violet, silver and touches of warm gold, warm candle and lantern lighting, painterly brushwork, soft rim light, elegant and mysterious but not horror, consistent character design";

export type Illustration = { src?: string; alt: string; prompt: string };

export const decors: Record<DecorId, Illustration> = {
  "academie-crepuscule": {
    src: undefined, // ex. "/academie-des-astres/decors/academie-crepuscule.webp"
    alt: "L'Académie des Astres au crépuscule, avec son internat, ses jardins et son observatoire.",
    prompt:
      "wide panoramic establishing shot, 21:9, a grand gothic boarding academy at dusk on a hill, long stone dormitory wing with hundreds of warm lit windows, central clock tower with spire, a large domed observatory with an open slit and brass telescope, terraced formal gardens with hedges, lanterns along gravel paths, sky gradient from deep violet to amber at the horizon, first stars and thin crescent moon, light mist, no people, no text",
  },
  "cour-apres-midi": {
    src: undefined,
    alt: "La cour principale de l'Académie en fin d'après-midi.",
    prompt:
      "visual novel background, 16:9, main stone courtyard of a dark academia school in late afternoon golden hour, gothic arcades with ivy, hanging banners in gold, pale blue-silver and violet, central fountain with a bronze statue holding an astrolabe, cobblestones with long warm shadows, observatory dome visible above the rooftops, wrought iron lanterns, empty of people, eye-level camera, space in the lower third for dialogue UI, no text",
  },
  "salle-astrolabe": {
    src: undefined,
    alt: "La Grande Salle, où flotte l'Astrolabe de la cérémonie.",
    prompt:
      "visual novel background, 16:9, vast gothic great hall at night, tall pointed stained-glass windows with moonlight, hundreds of floating candles, a gigantic brass armillary astrolabe floating in the center with glowing constellation lines, polished dark wood benches, midnight blue and gold, magical but solemn, no people, no text",
  },
};

/** Prompts des portraits (fond transparent, buste, cadrage identique pour toutes les expressions). */
export const promptsPortraits: Record<PersoId, { base: string; expressions: Partial<Record<Expression, string>> }> = {
  milo: {
    base:
      "character bust portrait, transparent background, 21-year-old young man, round soft face, light warm skin with freckles, messy auburn curls, green eyes, cosy plum cable-knit sweater over white collared shirt, pale blue and silver scarf accents (Swan house), friendly clumsy energy",
    expressions: {
      neutre: "relaxed friendly expression",
      sourire: "warm wide smile",
      rire: "laughing with eyes closed",
      surpris: "startled, eyebrows raised, mouth open",
      gene: "embarrassed grimace, blushing, hand behind head",
      pensif: "thinking, looking aside",
    },
  },
  iris: {
    base:
      "character bust portrait, transparent background, 22-year-old young woman, heart-shaped face, brown skin, sharp black bob with bangs and a small silver star hair clip, amber eyes, navy academy blazer, white shirt, pale blue tie (Swan house), clever curious look",
    expressions: {
      neutre: "calm attentive expression",
      sourire: "soft confident smile",
      rire: "amused laugh",
      surpris: "eyebrows raised, surprised",
      pensif: "analytical look, one eyebrow raised",
      malicieux: "teasing smirk",
    },
  },
  bellamy: {
    base:
      "character bust portrait, transparent background, 68-year-old eccentric astronomy professor, angular face with wrinkles, wild white hair, big white moustache, round brass spectacles, blue eyes, brown tweed jacket, waistcoat, burgundy bow tie, warm and passionate grandfatherly energy",
    expressions: {
      neutre: "kind attentive expression",
      sourire: "warm smile",
      rire: "hearty laugh",
      surpris: "eyebrows shooting up, exclaiming",
      pensif: "thoughtful, peering over glasses",
    },
  },
};

/** Futurs fichiers de portraits : /academie-des-astres/portraits/{perso}-{expression}.webp */
export function cheminPortrait(perso: PersoId, expression: Expression): string {
  return `/academie-des-astres/portraits/${perso}-${expression}.webp`;
}

/** Mettre à true une fois les portraits illustrés déposés dans public/. */
export const portraitsIllustresDisponibles = false;
