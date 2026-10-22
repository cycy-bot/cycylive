// FICHIER GÉNÉRÉ par scripts/academie/traitement/traiter_pour_repo.py — ne pas modifier à la main.
// Recoloration de l'aperçu : couleur de référence de chaque calque, masques (R/V = zones teintables),
// pose des coiffures (origine du canevas relative au sommet du crâne), bustes HD et couleurs des maisons.

import type { DonneesTeintes } from "./types";

export const donneesTeintes: DonneesTeintes = {
 "peau": {
  "visages/01_feminin_ovale.png": {
   "ref": [
    245.0,
    204.0,
    180.0
   ]
  },
  "visages/02_feminin_rond.png": {
   "ref": [
    245.0,
    204.0,
    180.0
   ]
  },
  "visages/03_feminin_coeur.png": {
   "ref": [
    245.0,
    203.0,
    180.0
   ]
  },
  "visages/04_feminin_allonge.png": {
   "ref": [
    244.0,
    202.0,
    179.0
   ]
  },
  "visages/05_masculin_ovale.png": {
   "ref": [
    240.0,
    194.0,
    168.0
   ]
  },
  "visages/06_masculin_carre.png": {
   "ref": [
    240.0,
    193.0,
    168.0
   ]
  },
  "visages/07_masculin_rectangulaire.png": {
   "ref": [
    240.0,
    193.0,
    167.0
   ]
  },
  "visages/08_masculin_machoire_anguleuse.png": {
   "ref": [
    240.0,
    192.0,
    166.0
   ]
  },
  "yeux/01_feminin_ronds_doux.png": {
   "ref": [
    221.0,
    173.0,
    158.0
   ],
   "masque": "masques/yeux/01_feminin_ronds_doux.png",
   "canal": 0
  },
  "yeux/06_masculin_classiques.png": {
   "ref": [
    220.0,
    176.0,
    162.0
   ],
   "masque": "masques/yeux/06_masculin_classiques.png",
   "canal": 0
  },
  "yeux/02_feminin_amande.png": {
   "ref": [
    217.0,
    167.0,
    153.0
   ],
   "masque": "masques/yeux/02_feminin_amande.png",
   "canal": 0
  },
  "yeux/07_masculin_fins_allonges.png": {
   "ref": [
    222.0,
    178.0,
    163.0
   ],
   "masque": "masques/yeux/07_masculin_fins_allonges.png",
   "canal": 0
  },
  "yeux/03_feminin_etires.png": {
   "ref": [
    219.0,
    168.0,
    155.0
   ],
   "masque": "masques/yeux/03_feminin_etires.png",
   "canal": 0
  },
  "yeux/08_masculin_tombants.png": {
   "ref": [
    228.0,
    183.0,
    166.0
   ],
   "masque": "masques/yeux/08_masculin_tombants.png",
   "canal": 0
  },
  "yeux/04_feminin_tombants.png": {
   "ref": [
    227.0,
    179.0,
    164.0
   ],
   "masque": "masques/yeux/04_feminin_tombants.png",
   "canal": 0
  },
  "yeux/09_masculin_ouverts.png": {
   "ref": [
    219.0,
    175.0,
    161.0
   ],
   "masque": "masques/yeux/09_masculin_ouverts.png",
   "canal": 0
  },
  "yeux/05_feminin_fins_mysterieux.png": {
   "ref": [
    210.0,
    160.0,
    146.0
   ],
   "masque": "masques/yeux/05_feminin_fins_mysterieux.png",
   "canal": 0
  },
  "yeux/10_masculin_percants.png": {
   "ref": [
    210.0,
    163.0,
    150.0
   ],
   "masque": "masques/yeux/10_masculin_percants.png",
   "canal": 0
  },
  "nez/01_nez_fin_et_droit.png": {
   "ref": [
    234.0,
    226.0,
    223.0
   ],
   "res": 0.1
  },
  "nez/02_nez_court_et_arrondi.png": {
   "ref": [
    225.0,
    210.0,
    205.0
   ],
   "res": 0.1
  },
  "nez/03_nez_droit_classique.png": {
   "ref": [
    220.0,
    208.0,
    204.0
   ],
   "res": 0.1
  },
  "nez/04_nez_legerement_retrousse.png": {
   "ref": [
    236.0,
    220.0,
    212.0
   ],
   "res": 0.1
  },
  "nez/05_nez_large_et_arrondi.png": {
   "ref": [
    224.0,
    208.0,
    202.0
   ],
   "res": 0.1
  },
  "nez/06_nez_long_et_fin.png": {
   "ref": [
    231.0,
    219.0,
    214.0
   ],
   "res": 0.1
  },
  "nez/07_nez_pointe_marquee.png": {
   "ref": [
    228.0,
    215.0,
    210.0
   ],
   "res": 0.1
  },
  "nez/08_nez_epate_doux.png": {
   "ref": [
    231.0,
    218.0,
    212.0
   ],
   "res": 0.1
  },
  "bouches/existantes/01_neutre_fermee.png": {
   "mode": "assombrir"
  },
  "bouches/existantes/02_petit_sourire.png": {
   "mode": "assombrir"
  },
  "bouches/existantes/03_sourire_chaleureux.png": {
   "mode": "assombrir"
  },
  "bouches/existantes/04_grand_sourire_dents.png": {
   "mode": "assombrir"
  },
  "bouches/existantes/05_sourire_malicieux.png": {
   "mode": "assombrir"
  },
  "bouches/existantes/06_bouche_surprise.png": {
   "mode": "assombrir"
  },
  "bouches/existantes/07_expression_contrariee.png": {
   "mode": "assombrir"
  },
  "bouches/existantes/08_moue_boudeuse.png": {
   "mode": "assombrir"
  },
  "bouches/masculines/01_neutre_fermee.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/01_neutre_fermee.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "bouches/masculines/02_petit_sourire.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/02_petit_sourire.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "bouches/masculines/03_sourire_chaleureux.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/03_sourire_chaleureux.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "bouches/masculines/04_grand_sourire_dents.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/04_grand_sourire_dents.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "bouches/masculines/05_sourire_malicieux.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/05_sourire_malicieux.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "bouches/masculines/06_surprise_entrouverte.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/06_surprise_entrouverte.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "bouches/masculines/07_contrariee.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/07_contrariee.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "bouches/masculines/08_moue_boudeuse.png": {
   "ref": [
    238,
    200,
    182
   ],
   "masque": "masques/bouches/masculines/08_moue_boudeuse.png",
   "canal": 0,
   "res": 0.1,
   "hi": 0.9
  },
  "tenues/01_feminin_classique.png": {
   "ref": [
    236.0,
    202.0,
    183.0
   ],
   "masque": "masques/tenues/01_feminin_classique.png",
   "canal": 0
  },
  "tenues/02_feminin_elegant.png": {
   "ref": [
    235.0,
    198.0,
    177.0
   ],
   "masque": "masques/tenues/02_feminin_elegant.png",
   "canal": 0
  },
  "tenues/03_feminin_alternatif_chic.png": {
   "ref": [
    234.0,
    200.0,
    181.0
   ],
   "masque": "masques/tenues/03_feminin_alternatif_chic.png",
   "canal": 0
  },
  "tenues/04_masculin_classique.png": {
   "ref": [
    234.0,
    201.0,
    182.0
   ],
   "masque": "masques/tenues/04_masculin_classique.png",
   "canal": 0
  },
  "tenues/05_masculin_soigne.png": {
   "ref": [
    242.0,
    208.0,
    188.0
   ],
   "masque": "masques/tenues/05_masculin_soigne.png",
   "canal": 0
  },
  "tenues/06_masculin_decontracte_chic.png": {
   "ref": [
    242.0,
    204.0,
    184.0
   ],
   "masque": "masques/tenues/06_masculin_decontracte_chic.png",
   "canal": 0
  },
  "bustes/01_feminin_classique.png": {
   "ref": [
    234.0,
    202.0,
    182.0
   ],
   "masque": "masques/bustes/01_feminin_classique.png",
   "canal": 0
  },
  "bustes/02_feminin_elegant.png": {
   "ref": [
    235.0,
    198.0,
    178.0
   ],
   "masque": "masques/bustes/02_feminin_elegant.png",
   "canal": 0
  },
  "bustes/03_feminin_alternatif_chic.png": {
   "ref": [
    233.0,
    199.0,
    180.0
   ],
   "masque": "masques/bustes/03_feminin_alternatif_chic.png",
   "canal": 0
  },
  "bustes/04_masculin_classique.png": {
   "ref": [
    234.0,
    201.0,
    182.0
   ],
   "masque": "masques/bustes/04_masculin_classique.png",
   "canal": 0
  },
  "bustes/05_masculin_soigne.png": {
   "ref": [
    241.0,
    209.0,
    189.0
   ],
   "masque": "masques/bustes/05_masculin_soigne.png",
   "canal": 0
  },
  "bustes/06_masculin_decontracte_chic.png": {
   "ref": [
    241.0,
    203.0,
    184.0
   ],
   "masque": "masques/bustes/06_masculin_decontracte_chic.png",
   "canal": 0
  }
 },
 "iris": {
  "yeux/01_feminin_ronds_doux.png": {
   "ref": [
    118.0,
    110.0,
    114.0
   ],
   "masque": "masques/yeux/01_feminin_ronds_doux.png",
   "canal": 1
  },
  "yeux/06_masculin_classiques.png": {
   "ref": [
    115.0,
    107.0,
    111.0
   ],
   "masque": "masques/yeux/06_masculin_classiques.png",
   "canal": 1
  },
  "yeux/02_feminin_amande.png": {
   "ref": [
    129.0,
    119.0,
    123.0
   ],
   "masque": "masques/yeux/02_feminin_amande.png",
   "canal": 1
  },
  "yeux/07_masculin_fins_allonges.png": {
   "ref": [
    128.0,
    119.0,
    123.0
   ],
   "masque": "masques/yeux/07_masculin_fins_allonges.png",
   "canal": 1
  },
  "yeux/03_feminin_etires.png": {
   "ref": [
    130.0,
    121.0,
    124.0
   ],
   "masque": "masques/yeux/03_feminin_etires.png",
   "canal": 1
  },
  "yeux/08_masculin_tombants.png": {
   "ref": [
    129.0,
    120.0,
    125.0
   ],
   "masque": "masques/yeux/08_masculin_tombants.png",
   "canal": 1
  },
  "yeux/04_feminin_tombants.png": {
   "ref": [
    131.0,
    122.0,
    126.0
   ],
   "masque": "masques/yeux/04_feminin_tombants.png",
   "canal": 1
  },
  "yeux/09_masculin_ouverts.png": {
   "ref": [
    121.0,
    112.0,
    116.0
   ],
   "masque": "masques/yeux/09_masculin_ouverts.png",
   "canal": 1
  },
  "yeux/05_feminin_fins_mysterieux.png": {
   "ref": [
    125.0,
    118.0,
    121.0
   ],
   "masque": "masques/yeux/05_feminin_fins_mysterieux.png",
   "canal": 1
  },
  "yeux/10_masculin_percants.png": {
   "ref": [
    128.0,
    119.0,
    123.0
   ],
   "masque": "masques/yeux/10_masculin_percants.png",
   "canal": 1
  }
 },
 "cheveux": {
  "cheveux/01_court_classique_raie_cote.png": {
   "ref": [
    111.0,
    73.0,
    57.0
   ]
  },
  "cheveux/02_court_ebouriffe_texture.png": {
   "ref": [
    111.0,
    73.0,
    56.0
   ]
  },
  "cheveux/03_coupe_rideau_raie_centrale.png": {
   "ref": [
    112.0,
    73.0,
    57.0
   ]
  },
  "cheveux/04_degrade_court_volume.png": {
   "ref": [
    106.0,
    69.0,
    53.0
   ]
  },
  "cheveux/05_mi_long_legerement_ondule.png": {
   "ref": [
    110.0,
    73.0,
    56.0
   ]
  },
  "cheveux/06_court_boucle.png": {
   "ref": [
    101.0,
    65.0,
    50.0
   ]
  },
  "cheveux/07_mi_long_meches_tombantes.png": {
   "ref": [
    111.0,
    73.0,
    57.0
   ]
  },
  "cheveux/08_court_afro_tres_frise.png": {
   "ref": [
    90.0,
    57.0,
    43.0
   ]
  },
  "cheveux/09_carre_court_frange.png": {
   "ref": [
    126.0,
    86.0,
    67.0
   ]
  },
  "cheveux/10_carre_mi_long_ondule.png": {
   "ref": [
    123.0,
    82.0,
    65.0
   ]
  },
  "cheveux/11_longs_lisses_raie_centrale.png": {
   "ref": [
    122.0,
    81.0,
    64.0
   ]
  },
  "cheveux/12_longs_ondules.png": {
   "ref": [
    121.0,
    80.0,
    63.0
   ]
  },
  "cheveux/13_queue_de_cheval_haute.png": {
   "ref": [
    121.0,
    85.0,
    65.0
   ]
  },
  "cheveux/14_chignon_decontracte.png": {
   "ref": [
    122.0,
    82.0,
    65.0
   ]
  },
  "cheveux/15_tresse_sur_le_cote.png": {
   "ref": [
    123.0,
    83.0,
    66.0
   ]
  },
  "cheveux/16_longs_boucles_frises.png": {
   "ref": [
    113.0,
    75.0,
    59.0
   ]
  }
 },
 "sourcils": {
  "sourcils/01_droits_fins.png": {
   "ref": [
    134.0,
    95.0,
    82.0
   ]
  },
  "sourcils/02_droits_epais.png": {
   "ref": [
    121.0,
    85.0,
    71.0
   ]
  },
  "sourcils/03_legerement_arques.png": {
   "ref": [
    133.0,
    95.0,
    81.0
   ]
  },
  "sourcils/04_fortement_arques.png": {
   "ref": [
    131.0,
    93.0,
    79.0
   ]
  },
  "sourcils/05_doux_arrondis.png": {
   "ref": [
    140.0,
    100.0,
    87.0
   ]
  },
  "sourcils/06_anguleux.png": {
   "ref": [
    125.0,
    88.0,
    74.0
   ]
  },
  "sourcils/07_courts_epais.png": {
   "ref": [
    117.0,
    82.0,
    69.0
   ]
  },
  "sourcils/08_legerement_tombants.png": {
   "ref": [
    133.0,
    95.0,
    81.0
   ]
  }
 },
 "poses": {
  "cheveux/01_court_classique_raie_cote.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/02_court_ebouriffe_texture.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/03_coupe_rideau_raie_centrale.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/04_degrade_court_volume.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/05_mi_long_legerement_ondule.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/06_court_boucle.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/07_mi_long_meches_tombantes.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/08_court_afro_tres_frise.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/09_carre_court_frange.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/10_carre_mi_long_ondule.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/11_longs_lisses_raie_centrale.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/12_longs_ondules.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/13_queue_de_cheval_haute.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/14_chignon_decontracte.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/15_tresse_sur_le_cote.png": {
   "x": 0,
   "y": -202
  },
  "cheveux/16_longs_boucles_frises.png": {
   "x": 0,
   "y": -202
  }
 },
 "bustes": {
  "tenues/01_feminin_classique.png": {
   "fichier": "bustes/01_feminin_classique.png",
   "l": 1024,
   "h": 1024,
   "origine": [
    152,
    98
   ],
   "echelle": 0.704225,
   "maisons": {
    "lion": "accents/bustes/01_feminin_classique_lion.png",
    "cygne": "accents/bustes/01_feminin_classique_cygne.png",
    "dragon": "accents/bustes/01_feminin_classique_dragon.png"
   }
  },
  "tenues/02_feminin_elegant.png": {
   "fichier": "bustes/02_feminin_elegant.png",
   "l": 1024,
   "h": 1024,
   "origine": [
    152,
    98
   ],
   "echelle": 0.704225,
   "maisons": {
    "lion": "accents/bustes/02_feminin_elegant_lion.png",
    "cygne": "accents/bustes/02_feminin_elegant_cygne.png",
    "dragon": "accents/bustes/02_feminin_elegant_dragon.png"
   }
  },
  "tenues/03_feminin_alternatif_chic.png": {
   "fichier": "bustes/03_feminin_alternatif_chic.png",
   "l": 1024,
   "h": 1024,
   "origine": [
    152,
    98
   ],
   "echelle": 0.704225,
   "maisons": {
    "lion": "accents/bustes/03_feminin_alternatif_chic_lion.png",
    "cygne": "accents/bustes/03_feminin_alternatif_chic_cygne.png",
    "dragon": "accents/bustes/03_feminin_alternatif_chic_dragon.png"
   }
  },
  "tenues/04_masculin_classique.png": {
   "fichier": "bustes/04_masculin_classique.png",
   "l": 1024,
   "h": 1024,
   "origine": [
    152,
    98
   ],
   "echelle": 0.704225,
   "maisons": {
    "lion": "accents/bustes/04_masculin_classique_lion.png",
    "cygne": "accents/bustes/04_masculin_classique_cygne.png",
    "dragon": "accents/bustes/04_masculin_classique_dragon.png"
   }
  },
  "tenues/05_masculin_soigne.png": {
   "fichier": "bustes/05_masculin_soigne.png",
   "l": 1024,
   "h": 1024,
   "origine": [
    152,
    98
   ],
   "echelle": 0.704225,
   "maisons": {
    "lion": "accents/bustes/05_masculin_soigne_lion.png",
    "cygne": "accents/bustes/05_masculin_soigne_cygne.png",
    "dragon": "accents/bustes/05_masculin_soigne_dragon.png"
   }
  },
  "tenues/06_masculin_decontracte_chic.png": {
   "fichier": "bustes/06_masculin_decontracte_chic.png",
   "l": 1024,
   "h": 1024,
   "origine": [
    152,
    98
   ],
   "echelle": 0.704225,
   "maisons": {
    "lion": "accents/bustes/06_masculin_decontracte_chic_lion.png",
    "cygne": "accents/bustes/06_masculin_decontracte_chic_cygne.png",
    "dragon": "accents/bustes/06_masculin_decontracte_chic_dragon.png"
   }
  }
 },
 "accents": {
  "tenues/01_feminin_classique.png": {
   "lion": "accents/tenues/01_feminin_classique_lion.png",
   "cygne": "accents/tenues/01_feminin_classique_cygne.png",
   "dragon": "accents/tenues/01_feminin_classique_dragon.png"
  },
  "tenues/02_feminin_elegant.png": {
   "lion": "accents/tenues/02_feminin_elegant_lion.png",
   "cygne": "accents/tenues/02_feminin_elegant_cygne.png",
   "dragon": "accents/tenues/02_feminin_elegant_dragon.png"
  },
  "tenues/03_feminin_alternatif_chic.png": {
   "lion": "accents/tenues/03_feminin_alternatif_chic_lion.png",
   "cygne": "accents/tenues/03_feminin_alternatif_chic_cygne.png",
   "dragon": "accents/tenues/03_feminin_alternatif_chic_dragon.png"
  },
  "tenues/04_masculin_classique.png": {
   "lion": "accents/tenues/04_masculin_classique_lion.png",
   "cygne": "accents/tenues/04_masculin_classique_cygne.png",
   "dragon": "accents/tenues/04_masculin_classique_dragon.png"
  },
  "tenues/05_masculin_soigne.png": {
   "lion": "accents/tenues/05_masculin_soigne_lion.png",
   "cygne": "accents/tenues/05_masculin_soigne_cygne.png",
   "dragon": "accents/tenues/05_masculin_soigne_dragon.png"
  },
  "tenues/06_masculin_decontracte_chic.png": {
   "lion": "accents/tenues/06_masculin_decontracte_chic_lion.png",
   "cygne": "accents/tenues/06_masculin_decontracte_chic_cygne.png",
   "dragon": "accents/tenues/06_masculin_decontracte_chic_dragon.png"
  }
 }
};
