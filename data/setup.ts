// ============================================================
// SETUP — configuration matérielle affichée sur À propos
// ============================================================
// Se modifie dans l'admin (onglet « Setup »). Les valeurs ci-dessous
// ne servent que de setup PAR DÉFAUT (avant le premier enregistrement).

export type TypeMateriel =
  | "gpu" | "cpu" | "ram" | "carteMere" | "ssd" | "alim" | "boitier" | "ventirad" | "wifi"
  | "camera" | "micro" | "clavier" | "souris" | "casque" | "ecran" | "lumiere" | "deck" | "capture" | "chaise" | "manette" | "autre";

export type ItemSetup = {
  id: string;
  type: TypeMateriel; // icône + petit libellé (« Carte graphique »…)
  nom: string; // ex. « NVIDIA GeForce RTX 4060 Ti »
  detail?: string; // ex. « 8 Go », « blanc »
  lien?: string; // page de l'article (boutique, site de la marque…)
  vedette?: boolean; // PC : mis en avant en haut de la fiche
};

export type GroupeSetup = {
  id: string;
  titre: string; // ex. « Aether »
  sousTitre?: string; // ex. « Mon PC de stream »
  style: "fiche" | "grille"; // fiche technique (PC) ou tuiles (matériel)
  items: ItemSetup[];
};

export type DonneesSetup = {
  groupes: GroupeSetup[];
  note: string; // petite phrase sous le setup
  mentionLiens: string; // affichée s'il y a au moins un lien (ex. liens affiliés)
};

export const setupParDefaut: DonneesSetup = {
  groupes: [
    {
      id: "pc",
      titre: "Aether",
      sousTitre: "Le PC qui fait tourner les lives",
      style: "fiche",
      items: [
        { id: "gpu", type: "gpu", nom: "NVIDIA GeForce RTX 4060 Ti", detail: "8 Go", vedette: true },
        { id: "cpu", type: "cpu", nom: "Intel Core i7-12700KF", vedette: true },
        { id: "ram", type: "ram", nom: "ADATA XPG Lancer RGB DDR5", detail: "32 Go, 6000 MHz", vedette: true },
        { id: "cm", type: "carteMere", nom: "ASUS Prime B760M-K DDR5" },
        { id: "ssd", type: "ssd", nom: "SSD NVMe", detail: "1 To" },
        { id: "alim", type: "alim", nom: "FSP Hyper Pro 700W", detail: "80 Plus Bronze, PCIe 5.0" },
        { id: "boitier", type: "boitier", nom: "Corsair iCUE 3500X TG ARGB", detail: "blanc" },
        { id: "ventirad", type: "ventirad", nom: "Ventirad 4 caloducs ARGB", detail: "blanc" },
        { id: "wifi", type: "wifi", nom: "TP-Link Archer", detail: "Wi-Fi" },
      ],
    },
    {
      id: "materiel",
      titre: "Matériel",
      sousTitre: "Ce qu'on voit et entend en live",
      style: "grille",
      items: [
        { id: "cam", type: "camera", nom: "Insta360 Link 2" },
        { id: "micro", type: "micro", nom: "Elgato Wave:3" },
        { id: "clavier", type: "clavier", nom: "Logitech G713" },
        { id: "souris", type: "souris", nom: "Razer DeathAdder Essential" },
        { id: "casque", type: "casque", nom: "Corsair HS80 RGB Wireless" },
        { id: "ecrans", type: "ecran", nom: "iiyama & LG", detail: "2 écrans" },
      ],
    },
  ],
  note: "Le setup continue d'évoluer petit à petit… parce qu'apparemment, on trouve toujours une bonne raison de changer quelque chose.",
  mentionLiens: "",
};
