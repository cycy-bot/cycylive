// ============================================================
// SETUP — configuration matérielle affichée sur À propos
// ============================================================
// Fichier de configuration simple : modifie directement les
// listes ci-dessous pour mettre à jour le setup affiché sur le
// site. Pas besoin de toucher au reste du code.

export type CategorieSetup = {
  titre: string;
  items: string[];
};

export const setupParDefaut: CategorieSetup[] = [
  {
    titre: "PC — Aether",
    items: [
      "RTX 4060 Ti",
      "Corsair iCUE 3500X TG ARGB blanc",
      "Intel Core i7-12700KF",
      "ASUS Prime B760M-K DDR5",
      "ADATA XPG Lancer RGB DDR5 32 Go 6000 MHz",
      "NVIDIA GeForce RTX 4060 Ti 8 Go",
      "SSD NVMe 1 To",
      "FSP Hyper Pro 700W 80 Plus Bronze PCIe 5.0",
      "Ventirad 4 caloducs ARGB blanc",
      "TP-Link Archer (Wi-Fi)",
    ],
  },
  {
    titre: "Matériel",
    items: [
      "Caméra Insta360 Link 2",
      "Micro Elgato Wave:3",
      "Clavier Logitech G713",
      "Souris Razer DeathAdder Essential",
      "Casque Corsair HS80 RGB Wireless",
      "Écrans iiyama & LG",
    ],
  },
];

export const noteSetupParDefaut =
  "Le setup continue d'évoluer petit à petit… parce qu'apparemment, on trouve toujours une bonne raison de changer quelque chose.";
