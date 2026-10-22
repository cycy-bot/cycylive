# Traitement des assets de l'avatar

Scripts qui transforment le ZIP `Personnalisation_avatar` en calques prêts pour le créateur.
Ils ne sont pas exécutés par le site : ils servent à régénérer les assets.

Dépendances : `pip install numpy scipy opencv-python pillow`

```bash
export ADA_SOURCE="/chemin/Personnalisation_avatar"        # ZIP actuel (nez, bouches, coiffures v2, bustes...)
export ADA_SOURCE_V1="/chemin/Personnalisation_avatar_v1"  # ZIP précédent (planches yeux / sourcils / cheveux v1)
export ADA_TRAVAIL="/tmp/ada"                              # dossier de travail (caches .pkl, sortie traite/)
python -c "import pickle,sys; sys.path.insert(0,'scripts/academie/traitement'); from pieces import *; pickle.dump(dict(faces={n: face_info(n) for n in FACES}, eyes=build_eyes(), brows=build_simple('sourcils_avatar/sourcils-avatar.png', True, K['brow']), mouths=build_simple('bouches_avatar/bouches_avatar.png', False, K['mouth']), hairs=build_hairs()), open('pieces.pkl','wb'))"   # cache v1
python scripts/academie/traitement/hair2.py                # recalage des 16 coiffures sur le crâne
python scripts/academie/traitement/pieces2.py              # visages sans nez, bouches, accents de maison
python scripts/academie/traitement/traiter_pour_repo.py    # écrit $ADA_TRAVAIL/traite + masques + teintes.genere.ts
python scripts/academie/preparer_avatar.py "$ADA_TRAVAIL/traite"   # copie, mesures, vignettes
```

| Étape | Ce qui est fait |
|---|---|
| Visages | nez dessiné effacé (la catégorie Nez le remplace) |
| Yeux, sourcils | découpés dans les planches d'origine (plus nets que les 1024 px agrandis) ; masques peau / iris |
| Coiffures | recalées sur le crâne (même échelle par planche), fragments de cellules voisines supprimés, pointes coupées fondues ; la 13 garde l'ancienne version de face |
| Bouches | féminines corrigées ; masculines « trait » recolorées en ombre de la carnation, dents conservées |
| Tenues | liseré clair du détourage retiré ; masque de peau (mains, cou, jambes) |
| Bustes | recadrages portrait HD + masque de peau ; couleurs Lion / Cygne / Dragon extraites des variantes |
