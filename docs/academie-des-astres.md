# L'Académie des Astres — prototype (mission 1)

Page : `/academie-des-astres` (non indexée, absente du menu et du sitemap).
Le prototype s'affiche en plein écran par-dessus le site. Aucun fichier existant n'a été modifié.

## Organisation

| Quoi | Où |
|---|---|
| Route | `app/academie-des-astres/page.tsx` |
| Types partagés | `data/academie/types.ts` |
| Maisons, questions de la cérémonie, barème | `data/academie/maisons.ts` |
| Options du créateur, traits | `data/academie/personnalisation.ts` |
| Personnages (Milo, Iris, Bellamy) | `data/academie/personnages.ts` |
| Illustrations : chemins et prompts | `data/academie/illustrations.ts` |
| Textes d'interface | `data/academie/textes.ts` |
| Scène de démonstration (non canonique) | `data/academie/chapitres/demo.ts` |
| Interpolation (prénom, pronoms, accords) | `lib/academie/texte.ts` |
| Calcul de la maison et départage | `lib/academie/ceremonie.ts` |
| Moteur de scène (fonctions pures) | `lib/academie/moteur.ts` |
| Sauvegarde locale (localStorage) | `lib/academie/sauvegarde.ts` |
| Écrans | `components/academie/*.tsx` |
| Illustrations vectorielles provisoires | `components/academie/art/` |

## Écrire une scène

Une scène est une liste de lignes (`narration`, `dialogue`, `choix`, `etiquette`, `aller`, `effet`, `decor`, `fin`).
Chaque ligne ou option peut porter une condition `si` (maison, trait, drapeau, relation, choix précédent).

Balises dans les textes : `{prenom}` `{nom}` `{prenomNom}` `{il}` `{Il}` `{e}` `{g:masculin|féminin|neutre}` `{maison}` `{Maison}`.

Les champs `Chapitre.disponibleLe` (chapitres quotidiens) et `Chapitre.objectifs` (pourcentage de réussite) sont prévus dans les types mais pas encore exploités.

## Barème de la cérémonie

Q1 à Q3 : trois réponses à 2 points pour une seule maison, plus une réponse mixte à 1 + 1 (Lion+Cygne, puis Cygne+Dragon, puis Dragon+Lion).
Q4 « Le Cœur » : trois réponses à 2 points. Maximum 8 points par maison.
Départage : total → points de Q4 → réponses franches → question la plus récente → ordre fixe.
Vérifié sur les 192 combinaisons possibles : 64 mènent au Lion, 64 au Cygne, 64 au Dragon.

## Remplacer les illustrations

Les décors et portraits actuels sont des dessins vectoriels provisoires.
Pour un décor peint, dépose le fichier dans `public/academie-des-astres/decors/` et renseigne `src` dans `data/academie/illustrations.ts`.
Les prompts de génération (style commun, décors, portraits par expression) sont dans ce même fichier.
L'affichage des portraits peints (`portraitsIllustresDisponibles`, `cheminPortrait`) reste à brancher dans `LecteurScene.tsx` le jour où ils existeront.

## Créateur de personnage (refonte du 22/10/2026)

Avatar en calques PNG, deux vues synchronisées (Portrait / Plein pied) calculées à partir de la même sélection.

| Quoi | Où |
|---|---|
| Catégories, variantes, ancres, palettes | `data/academie/avatar/catalogue.ts` |
| Types (options, ancres, manifeste) | `data/academie/avatar/types.ts` |
| Limites réelles mesurées (généré) | `data/academie/avatar/manifeste.genere.ts` |
| Placement des calques, cadrage, zoom (fonctions pures) | `lib/academie/avatar/composition.ts` |
| Choix, aléatoire, réinitialisation | `lib/academie/avatar/selection.ts` |
| Annuler / rétablir | `lib/academie/avatar/historique.ts` |
| Écran du créateur | `components/academie/CreateurPersonnage.tsx` |
| Aperçu (zoom, molette, pincement, plein écran) | `components/academie/avatar/ApercuAvatar.tsx` |
| Rendu des calques sans flash | `components/academie/avatar/AvatarCalques.tsx` |
| Vignettes et pastilles | `components/academie/avatar/Selecteurs.tsx` |
| Styles | `components/academie/avatar/createur.css` |
| Copie + mesure des assets + vignettes | `scripts/academie/preparer_avatar.py` |
| Tests de la logique | `node scripts/academie/tester_avatar.mjs` |

**Ajouter des assets** : `py scripts/academie/preparer_avatar.py "<dossier Personnalisation_avatar>"` (les PNG sont copiés sans modification dans `public/academie-des-astres/avatar/`), puis une ligne par variante dans `catalogue.ts` (identifiant stable, il est sauvegardé).

**Cadrage** : la zone affichée englobe les limites réelles (alpha > 40) de tous les calques visibles, plus une marge de sécurité, centrée sur le visage (ou la tenue). Elle est ensuite ajustée à l'espace disponible sans déformation. Le zoom (×1 à ×4) part toujours de ce cadrage et le déplacement est borné pour ne jamais perdre le personnage.

**Éléments du visage** : yeux, sourcils, nez et bouches sont posés sur des ancres (par morphologie, surchargeables par visage). Toutes les variantes d'un même dossier partagent une échelle commune (taille médiane du jeu) pour conserver leurs différences de forme ; `reglage` permet un ajustement fin par variante.

**Couleurs** : appliquées à l'aperçu (`lib/academie/avatar/teinte.ts`, canevas, résultats en cache). Chaque calque a une couleur de référence et, si besoin, un masque (peau des paupières, iris, peau visible des tenues, dents exclues des bouches « trait ») dans `data/academie/avatar/teintes.genere.ts`. Ombres et contours sont conservés. Palettes : 8 carnations, 6 iris, 12 couleurs de cheveux (`data/academie/personnalisation.ts`).

**Assets traités (22/10)** : `scripts/academie/traitement/` (voir son README) produit les calques nettoyés à partir du ZIP, puis `preparer_avatar.py` les copie et les mesure. Visages sans nez dessiné, coiffures recalées sur le crâne (`poses`), yeux et sourcils découpés des planches nettes, bouches féminines corrigées.

**Portrait habillé** : sous le visage, la tenue en pied (fond, hors cadrage) et le buste haute définition (`public/academie-des-astres/avatar/bustes/`), placés avec la même pose que le plein pied. Les couleurs de maison (`accents/`) s'ajoutent quand `rendu.maison` est fourni (carte d'élève après la cérémonie).

**Pose de la tête** : échelle 0,187 (crâne et menton du visage sur ceux de la tenue).

**Sauvegarde** : même clé et même version qu'avant ; `apparence.avatar` et `apparence.sourcils` sont optionnels, les anciennes sauvegardes restent valides. L'écriture est différée de 400 ms et forcée à la fermeture de l'onglet.
