# ============================================================
# L'ACADÉMIE DES ASTRES — préparation des assets de l'avatar
# ============================================================
# Copie les PNG du dossier source SANS LES MODIFIER vers
# public/academie-des-astres/avatar/, mesure les limites réelles
# de chaque calque (zone non transparente) et génère de petites
# vignettes WebP pour les grilles du créateur.
#
# Résultat : data/academie/avatar/manifeste.genere.ts, lu par le
# créateur pour cadrer le portrait et placer les calques.
#
# Utilisation (depuis la racine du projet) :
#   py -m pip install pillow
#   py scripts/academie/preparer_avatar.py "C:/chemin/vers/Personnalisation_avatar"
#
# Pour une nouvelle bibliothèque : adapte DOSSIERS ci-dessous,
# relance le script, puis déclare les nouvelles options dans
# data/academie/avatar/catalogue.ts.

import json
import shutil
import sys
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parents[2]
SORTIE_PUBLIC = RACINE / "public" / "academie-des-astres" / "avatar"
SORTIE_MANIFESTE = RACINE / "data" / "academie" / "avatar" / "manifeste.genere.ts"

# dossier source (relatif) -> dossier de destination (relatif à SORTIE_PUBLIC)
DOSSIERS = {
    "visages_avatar": "visages",
    "yeux_avatar": "yeux",
    "sourcils_avatar": "sourcils",
    "nez_avatar": "nez",
    "bouches_avatar/academie_des_astres_bouches_v2/01_bouches_existantes_nettoyees": "bouches/existantes",
    "bouches_avatar/academie_des_astres_bouches_v2/02_bouches_masculines": "bouches/masculines",
    "coiffures_avatar": "cheveux",
    "tenues_avatar": "tenues",
}

# Les planches de présentation ne sont pas des calques.
EXCLUS = ("planche", "apercu", "avatar.png", "-avatar.png", "visages avatar")

SEUIL_ALPHA = 40  # ignore le halo quasi transparent laissé par le détourage
TAILLE_VIGNETTE = 192


def limites(image: Image.Image):
    alpha = image.getchannel("A").point(lambda v: 255 if v > SEUIL_ALPHA else 0)
    return alpha.getbbox()


def main(source: Path) -> None:
    manifeste = {}
    for dossier_source, dossier_dest in DOSSIERS.items():
        origine = source / dossier_source
        dest = SORTIE_PUBLIC / dossier_dest
        if not origine.is_dir():
            # Dossier source déplacé ou renommé : on conserve les calques déjà
            # intégrés (copies dans public/) au lieu de les perdre.
            if dest.is_dir() and any(dest.glob("*.png")):
                print(f"! dossier absent, copies existantes conservées : {dossier_source}")
                origine = dest
            else:
                print(f"! dossier absent : {origine}")
                continue
        (dest / "vignettes").mkdir(parents=True, exist_ok=True)
        for fichier in sorted(origine.glob("*.png")):
            if any(e in fichier.name for e in EXCLUS):
                continue
            image = Image.open(fichier)
            cle = f"{dossier_dest}/{fichier.name}"
            if "A" not in image.mode:
                print(f"! sans transparence, ignoré : {cle}")
                continue
            image = image.convert("RGBA")
            boite = limites(image)
            if not boite:
                print(f"! calque vide, ignoré : {cle}")
                continue
            if origine != dest:
                shutil.copy2(fichier, dest / fichier.name)

            # Vignette : zone utile + marge (proportions de l'asset conservées,
            # l'affichage la centre ensuite dans sa case).
            x0, y0, x1, y1 = boite
            marge = round(max(x1 - x0, y1 - y0) * 0.06)
            zone = image.crop((max(0, x0 - marge), max(0, y0 - marge), min(image.width, x1 + marge), min(image.height, y1 + marge)))
            zone.thumbnail((TAILLE_VIGNETTE, TAILLE_VIGNETTE), Image.LANCZOS)
            nom_vignette = fichier.stem + ".webp"
            zone.save(dest / "vignettes" / nom_vignette, "WEBP", quality=82, method=6)

            manifeste[cle] = {
                "l": image.width,
                "h": image.height,
                "limites": [x0, y0, x1, y1],
                "vignette": f"{dossier_dest}/vignettes/{nom_vignette}",
            }
            print(f"  {cle}  {image.width}x{image.height}  limites={boite}")

    contenu = (
        "// FICHIER GÉNÉRÉ par scripts/academie/preparer_avatar.py — ne pas modifier à la main.\n"
        "// Dimensions du canevas et limites réelles (zone non transparente) de chaque calque.\n\n"
        'import type { ManifesteAvatar } from "./types";\n\n'
        f"export const manifeste: ManifesteAvatar = {json.dumps(manifeste, indent=2, ensure_ascii=False)};\n"
    )
    SORTIE_MANIFESTE.write_text(contenu, encoding="utf-8")
    print(f"\n{len(manifeste)} calques -> {SORTIE_MANIFESTE.relative_to(RACINE)}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage : py scripts/academie/preparer_avatar.py <dossier Personnalisation_avatar>")
    main(Path(sys.argv[1]))
