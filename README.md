# Cycylive — site officiel

Site officiel de Cycylive : streameuse et créatrice de contenu. Hub central regroupant les lives Twitch, le planning, les réseaux, la communauté et les partenariats.

## Stack technique

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** pour le style
- Aucune base de données, aucun CMS externe : tout le contenu modifiable vit dans le dossier `data/`
- Déploiement pensé pour **Vercel**

## Arborescence du projet

```
cycylive/
├── app/                     → les pages du site (routing automatique Next.js)
│   ├── page.tsx             → Accueil
│   ├── a-propos/page.tsx    → À propos
│   ├── gaming/page.tsx      → Gaming (Valorant, autres jeux, clips)
│   ├── reseaux/page.tsx     → Réseaux
│   ├── partenariats/page.tsx→ Partenariats
│   ├── contact/page.tsx     → Contact
│   ├── statistiques/page.tsx→ Statistiques (accessible via lien, hors menu principal)
│   ├── mentions-legales/    → Mentions légales (placeholder à compléter)
│   ├── confidentialite/     → Politique de confidentialité (placeholder à compléter)
│   ├── layout.tsx           → structure globale (header/footer partout)
│   ├── globals.css          → styles globaux + décor spatial
│   └── icon.png             → favicon
│
├── components/              → les blocs réutilisables du site
│   ├── Header.tsx            → navigation + CTA Twitch
│   ├── Footer.tsx
│   ├── BarreMobile.tsx        → barre d'accès rapide sur mobile
│   ├── Hero.tsx
│   ├── StatutTwitch.tsx       → bloc "en live / hors ligne"
│   ├── Planning.tsx
│   ├── AProposCourt.tsx
│   ├── DerniersContenus.tsx
│   ├── CommunauteApercu.tsx
│   └── PartenariatsApercu.tsx
│
├── data/                     → ★ TOUT CE QUE TU DOIS MODIFIER EST ICI ★
│   ├── planning.ts            → le planning hebdomadaire des lives
│   ├── liens.ts                → tous les réseaux sociaux + mail pro
│   ├── textes.ts               → les textes du site
│   ├── contenus.ts             → les vidéos mises en avant
│   └── twitch.ts                → statut Twitch (live / offline)
│
├── public/
│   ├── logo/                  → logo Cycylive (icône + version complète)
│   └── images/                → photo de Cycy
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Où modifier quoi (le plus important)

| Je veux changer... | Fichier à ouvrir |
|---|---|
| Le planning de la semaine | Interface web `/admin` (voir plus bas) — plus besoin de fichier |
| Un lien Twitch / TikTok / Instagram / YouTube / Discord / mail | `data/liens.ts` |
| Les textes du site (accroche, à propos, communauté, partenariats, contact) | Interface web `/admin`, onglet "Textes" |
| Les vidéos mises en avant sur l'accueil | `data/contenus.ts` |
| Le statut "en live" / "hors ligne" et le prochain live | `data/twitch.ts` |
| La photo de Cycy | remplace `public/images/cycy-photo.jpg` (même nom de fichier) |
| Le logo | remplace les fichiers dans `public/logo/` (mêmes noms) |
| Les mentions légales | `app/mentions-legales/page.tsx` |
| La politique de confidentialité | `app/confidentialite/page.tsx` |

Aucun de ces fichiers ne nécessite de connaissances en programmation avancées : ce sont des listes et des textes simples, en français, commentés.

## Lancer le site en local

### 1. Prérequis
Installe [Node.js](https://nodejs.org/) (version 18 ou plus récente) si tu ne l'as pas déjà.

### 2. Installer les dépendances
Ouvre un terminal dans le dossier du projet, puis :

```bash
npm install
```

### 3. Lancer le site en mode développement

```bash
npm run dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000) dans ton navigateur. Le site se recharge automatiquement à chaque modification d'un fichier.

### 4. Générer la version production (optionnel, pour tester avant mise en ligne)

```bash
npm run build
npm run start
```

## Mettre le site en ligne sur Vercel

### Étape 1 — Mettre le projet sur GitHub

```bash
git init
git add .
git commit -m "Premier commit du site Cycylive"
```

Crée ensuite un nouveau dépôt sur [github.com/new](https://github.com/new) (sans README, il existe déjà), puis :

```bash
git remote add origin https://github.com/TON-NOM-UTILISATEUR/cycylive.git
git branch -M main
git push -u origin main
```

### Étape 2 — Connecter le dépôt à Vercel

1. Va sur [vercel.com](https://vercel.com) et connecte-toi (tu peux te connecter directement avec ton compte GitHub).
2. Clique sur **Add New → Project**.
3. Sélectionne ton dépôt `cycylive`.
4. Vercel détecte automatiquement Next.js — ne change aucun réglage.
5. Clique sur **Deploy**.

En 1 à 2 minutes, ton site est en ligne sur une adresse du type `cycylive.vercel.app`.

### Étape 3 — Mettre à jour le site plus tard

Chaque fois que tu modifies un fichier (par exemple `data/planning.ts`) et que tu fais :

```bash
git add .
git commit -m "Mise à jour du planning"
git push
```

Vercel redéploie automatiquement le site en quelques secondes.

## Connecter un nom de domaine personnalisé

1. Dans ton projet sur Vercel, va dans l'onglet **Settings → Domains**.
2. Ajoute ton nom de domaine (ex : `cycylive.com`).
3. Vercel t'indique les enregistrements DNS à ajouter chez ton registrar (souvent un enregistrement `A` ou `CNAME`).
4. Ajoute ces enregistrements chez ton fournisseur de domaine (OVH, Namecheap, etc.).
5. La propagation prend généralement entre quelques minutes et 24h.

## Interface d'administration du planning

Tu peux maintenant modifier le planning **sans jamais ouvrir de fichier de code**, via une vraie page web : `/admin` (ex : `tonsite.vercel.app/admin` ou `localhost:3000/admin` en local).

Pour que les modifications soient réellement sauvegardées (et visibles par tous les visiteurs, pas juste sur ton ordinateur), il faut connecter une petite base de données Redis gratuite chez **Upstash** (Vercel KV a été abandonné).

### Étape 1 — Créer une base gratuite sur Upstash

1. Va sur [upstash.com](https://upstash.com) et crée un compte gratuit (tu peux te connecter avec GitHub).
2. Clique sur **Create Database**, choisis le type **Redis**, une région proche (Europe), le plan **Free**, et crée-la.
3. Sur la page de ta base, ouvre la section **REST API**. Clique sur l'icône œil pour révéler le token, puis copie les deux valeurs : `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`.
4. Sur [vercel.com](https://vercel.com), ouvre ton projet Cycylive → **Settings → Environment Variables**.
5. Ajoute les deux variables avec **exactement les mêmes noms** que sur Upstash (`UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`) et colle les valeurs copiées.

### Étape 2 — Choisir un mot de passe pour /admin

1. Toujours dans **Settings → Environment Variables** de ton projet Vercel, ajoute une nouvelle variable :
   - **Name** : `ADMIN_PASSWORD`
   - **Value** : le mot de passe de ton choix (garde-le pour toi)
2. Redéploie le projet (un nouveau `git push` suffit).

### Étape 3 — Utiliser l'interface

Va sur `tonsite.vercel.app/admin`. Trois onglets sont disponibles :

**Onglet "Planning"** : coche "OFF" pour un jour sans live, ou renseigne l'heure (et le jeu si tu veux — sinon le site affiche juste "Stream"). Entre ton mot de passe et clique **Enregistrer le planning**.

**Onglet "Derniers contenus"** : pour faire apparaître tes dernières vidéos TikTok, Reels Instagram, vidéos YouTube ou clips Twitch sur le site (page d'accueil et page Réseaux) :
1. Clique **+ Ajouter une vidéo**.
2. Choisis la plateforme et le format (vertical pour TikTok/Reels, horizontal pour YouTube).
3. Colle le lien de la vidéo et donne-lui un titre.
4. Utilise les flèches ↑ ↓ pour réordonner, ou "Supprimer" pour retirer une vidéo.
5. Entre ton mot de passe et clique **Enregistrer les contenus**.

**Onglet "Textes"** : modifie n'importe quel texte du site (hero, à propos, communauté, partenariats, contact), regroupé par section. Change ce que tu veux, entre ton mot de passe et clique **Enregistrer les textes**.

**Onglet "Timeline"** : ajoute les étapes marquantes de ton parcours (date + titre + description optionnelle). Elles s'affichent en entier sur la page À propos, et les 3 dernières en aperçu sur l'accueil avec un bouton vers le parcours complet.

**Onglet "À propos"** : gère les blocs de la page À propos. Chaque bloc a un **type** :
- **Texte** : un titre + un texte que tu rédiges (avec l'éditeur riche).
- **Bloc Setup** : insère automatiquement ton setup matériel à cet endroit précis de la page. Le contenu (liste PC/Matériel) se modifie dans `data/setup.ts` — un simple fichier de configuration, pas besoin de repasser par `/admin` pour ça.
- **Bloc Timeline** : insère ta timeline à cet endroit précis. Le contenu se gère dans l'onglet "Timeline" juste au-dessus.

Comme pour les vidéos, tu réordonnes tout avec les flèches ↑ ↓ — y compris où le Setup et la Timeline apparaissent dans la page.

## Formulaire de contact (envoi réel par email)

La page `/contact` (accessible uniquement depuis le footer, pas dans le menu principal) envoie un vrai email via [Resend](https://resend.com), sans jamais exposer ton adresse mail dans le code du site. Elle inclut aussi une protection antispam invisible (honeypot) et des messages de succès/erreur propres.

### Étape 1 — Créer un compte Resend (gratuit)

1. Va sur [resend.com](https://resend.com) et crée un compte gratuit (100 emails/jour, largement suffisant).
2. Dans le tableau de bord, va dans **API Keys** → **Create API Key**. Copie la clé (elle ne sera affichée qu'une fois).

### Étape 2 — Ajouter la clé en local et sur Vercel

1. Dans `.env.local` : `RESEND_API_KEY=ta_clé`
2. Sur Vercel : Environment Variables → ajoute `RESEND_API_KEY` avec la même valeur.

### Étape 3 (recommandé) — Vérifier ton domaine pour un envoi plus fiable

Par défaut, les emails partent depuis `onboarding@resend.dev` (fonctionne tout de suite, mais peut finir en spam). Pour un envoi plus fiable :
1. Sur Resend, va dans **Domains** → **Add Domain** → entre `cycylive.fr`.
2. Ajoute les enregistrements DNS demandés chez Ionos (même principe que pour Vercel).
3. Une fois le domaine vérifié, ajoute la variable `RESEND_FROM_EMAIL` avec par exemple `Cycylive <contact@cycylive.fr>`.

Sans cette étape 3, le formulaire fonctionne quand même (juste moins fiable niveau délivrabilité).

## Page Partenaires & Bons plans

La page `/partenariats` (renommée "Partenaires & Bons plans" dans le menu) a 3 sections :
- **Mes partenaires** : affiche tes partenaires actifs. Avec un seul partenaire, il s'affiche en grande carte mise en avant ; avec plusieurs, en grille.
- **Bons plans** : offres avec code promo copiable en un clic ("Code copié !").
- **Envie de travailler ensemble ?** : section professionnelle pour les futurs partenaires (univers, plateformes, types de collaboration, CTA vers Contact).

Tout se gère depuis `/admin`, onglet "Partenaires" (décoche "Actif" pour masquer sans supprimer).

## Rank Valorant automatique

Ton rank peut s'actualiser tout seul (plus besoin d'y retoucher à chaque changement de rank), via [HenrikDev API](https://docs.henrikdev.xyz) — une API communautaire gratuite (Tracker.gg lui-même n'a pas d'API publique).

### Étape 1 — Renseigner ton Riot ID

1. Va sur `/admin`, onglet "Gaming", section "Mon rapport à Valorant".
2. Dans le bloc "⚡ Rank automatique", renseigne :
   - **Pseudo** : la partie avant le # de ton Riot ID (ex: "Cycy")
   - **Tag** : la partie après le # (ex: "EUW")
   - **Région** : Europe, Amérique du Nord, Asie-Pacifique ou Corée
3. Enregistre. Le rank affiché sur `/gaming` vient maintenant automatiquement de ce Riot ID, avec le RR actuel.

Tant que ces champs sont vides, le rank reste celui que tu tapes toi-même dans "Rank actuel" (comportement par défaut, rien ne casse).

### Étape 2 (recommandé) — Une clé API gratuite pour plus de fiabilité

Sans clé, l'API fonctionne mais avec un quota limité. Pour un usage plus confortable :
1. Rejoins le [Discord HenrikDev](https://discord.com/invite/X3GaVkX2YN) et demande une clé API gratuite dans le salon dédié (suis leurs instructions, c'est rapide).
2. Ajoute la variable d'environnement `HENRIK_API_KEY` (en local dans `.env.local`, et sur Vercel).

## Page Gaming

La page `/gaming` (accessible depuis le menu principal) a remplacé l'ancienne page Valorant — elle regroupe tout l'univers jeux vidéo de Cycylive :
- **Introduction** générale sur la place du gaming dans la chaîne
- **Bloc Valorant** (le jeu principal) : intro, rank actuel, objectif, agents/maps/skins favoris, clips marquants, moments de la timeline liés (détectés automatiquement par mot-clé), news
- **Autres jeux** : cartes ajoutables librement (Palworld, soirées horreur, etc.)
- **Jeux du moment** : section facultative, masquée automatiquement si vide
- **Clips gaming** : galerie des clips marquants

L'ancienne URL `/valorant` redirige automatiquement vers `/gaming`.

Tout se gère depuis `/admin`, onglet "Gaming".

## Statistiques et compteur Discord

- Le nombre de **followers Twitch** utilise la même connexion que le compteur de live (voir plus haut).
- Le nombre de **membres en ligne sur Discord** utilise le widget public de ton serveur. Pour l'activer :
  1. Sur Discord, va dans les paramètres de ton serveur → **Widget**.
  2. Active "Server Widget".
  3. Copie l'ID de ton serveur (clic droit sur le nom du serveur → Copier l'ID — active le mode développeur dans Discord si l'option n'apparaît pas : Paramètres utilisateur → Avancés → Mode développeur).
  4. Ajoute la variable d'environnement `DISCORD_SERVER_ID` (en local dans `.env.local`, et sur Vercel dans Environment Variables) avec cet ID.
- Le nombre **total de membres** utilise l'API publique des invitations Discord — pas besoin de configuration en plus, ça part directement de ton lien d'invitation dans `data/liens.ts`. Fonctionne dès que `DISCORD_SERVER_ID` (ci-dessus) est renseigné.
- Ces chiffres s'affichent sur l'accueil et sur la page `/statistiques`, qui renvoie aussi vers TwitchTracker pour un historique plus complet (heures streamées, pic de viewers, etc. — des données que Twitch ne fournit pas directement via son API).

## Annonces Discord sur le site

Les dernières annonces de ton salon #annonces (texte, image, sondages avec leurs votes) s'affichent automatiquement sur l'accueil, dans le bloc Communauté. Contrairement aux stats ci-dessus, ça demande un vrai bot Discord (juste pour LIRE ce salon, aucune permission d'écriture).

### Étape 1 — Créer un bot Discord

1. Va sur [discord.com/developers/applications](https://discord.com/developers/applications), clique **New Application**, donne-lui un nom (ex: "Cycylive Site").
2. Dans le menu de gauche, va dans **Bot**. Clique **Reset Token** (ou il apparaît directement), puis copie ce token — comme pour Twitch, il ne sera affiché qu'une fois.
3. Toujours dans l'onglet Bot, désactive les intentions que tu n'utilises pas ; tu n'as besoin d'aucune "Privileged Gateway Intent" pour cette fonctionnalité.

### Étape 2 — Inviter le bot sur ton serveur

1. Dans le menu de gauche, va dans **OAuth2** → **URL Generator**.
2. Coche uniquement **bot** dans "Scopes".
3. Dans "Bot Permissions" qui apparaît, coche uniquement **View Channels** et **Read Message History**.
4. Copie l'URL générée en bas de page, ouvre-la dans ton navigateur, choisis ton serveur Cycylive, autorise.

### Étape 3 — Récupérer l'ID du salon annonces

1. Sur Discord (mode développeur activé, voir plus haut), clic droit sur ton salon #annonces → **Copier l'ID du salon**.

### Étape 4 — Variables d'environnement

Ajoute (en local dans `.env.local`, et sur Vercel) :
```
DISCORD_BOT_TOKEN=le_token_copié_à_l'étape_1
DISCORD_ANNOUNCE_CHANNEL_ID=l'id_copié_à_l'étape_3
```

Tant que ces deux variables ne sont pas renseignées, le bloc "Dernières annonces" reste simplement masqué (rien ne casse).

Chaque enregistrement est immédiatement visible sur le site, pour tout le monde.

⚠️ Note importante : TikTok et Instagram n'ont pas d'API publique simple permettant de récupérer automatiquement tes dernières vidéos — c'est pour ça que tu les ajoutes toi-même via cet onglet. YouTube, en revanche, a une API officielle et gratuite ; si un jour tu veux que tes vidéos YouTube apparaissent automatiquement sans avoir à les ajouter à la main, c'est une évolution possible (voir "Évolutions futures").

### Pour tester `/admin` en local (optionnel)

1. Installe l'outil Vercel CLI une seule fois : `npm install -g vercel`
2. Dans le dossier du projet : `vercel link` (connecte le dossier à ton projet Vercel), puis `vercel env pull .env.local` (récupère automatiquement toutes les variables, y compris KV).
3. Relance `npm run dev` et va sur `localhost:3000/admin`.

Si tu préfères ne pas faire cette étape technique, ce n'est pas grave : tu peux tout aussi bien te connecter directement sur `tonsite.vercel.app/admin` une fois le site déployé.

## Détection automatique du live Twitch

Le site vérifie maintenant **réellement et automatiquement** si tu es en live sur Twitch (toutes les 60 secondes), et adapte les CTA, les couleurs et les textes en conséquence — plus aucun interrupteur à changer à la main.

Pour l'activer, il te faut deux clés gratuites fournies par Twitch.

### Étape 1 — Créer une application Twitch

1. Va sur [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) et connecte-toi avec ton compte Twitch.
2. Clique sur **Register Your Application**.
3. Remplis :
   - **Name** : `Cycylive Site` (ou ce que tu veux)
   - **OAuth Redirect URLs** : `http://localhost:3000` (obligatoire à remplir, mais pas vraiment utilisé ici)
   - **Category** : `Website Integration`
4. Clique sur **Create**.
5. Sur la page de ton appli, copie le **Client ID**.
6. Clique sur **New Secret** pour générer un **Client Secret**, et copie-le aussi (il ne sera affiché qu'une fois).

### Étape 2 — Renseigner les clés en local

1. À la racine du projet, duplique le fichier `.env.local.example` et renomme la copie **`.env.local`**.
2. Ouvre `.env.local` et colle ton Client ID et ton Client Secret :
   ```
   TWITCH_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
   TWITCH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxx
   TWITCH_CHANNEL_LOGIN=cycylive
   ```
3. Relance `npm run dev`. Le site interroge maintenant vraiment Twitch.

⚠️ Ce fichier `.env.local` ne doit **jamais** être envoyé sur GitHub (il est déjà ignoré automatiquement).

### Étape 3 — Renseigner les mêmes clés sur Vercel (pour le site en ligne)

1. Dans ton projet sur [vercel.com](https://vercel.com), va dans **Settings → Environment Variables**.
2. Ajoute les 3 mêmes variables (`TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL_LOGIN`) avec les mêmes valeurs.
3. Redéploie le projet (Vercel te le proposera automatiquement, ou fais un nouveau `git push`).

C'est tout : le site en ligne détecte désormais tout seul quand tu passes en live, sans aucune action de ta part.

## Compteur de followers Twitch

Depuis septembre 2023, Twitch a fermé l'accès au nombre de followers via une simple clé d'API (le même type de clé que ci-dessus, valable pour "êtes-vous en live"). Pour afficher ce chiffre (sur la page Partenariats), il faut te connecter **une seule fois** avec ton propre compte Twitch, un peu comme un bouton "Se connecter avec Twitch".

### Étape 1 — Ajouter les URL de callback dans ta console Twitch

1. Retourne sur [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps), ouvre ton application (celle créée pour la détection du live).
2. Dans **OAuth Redirect URLs**, ajoute (en plus de celle déjà présente) :
   - `http://localhost:3000/api/twitch-callback` (pour tester en local)
   - `https://tonsite.vercel.app/api/twitch-callback` (remplace par ta vraie URL Vercel)
   - `https://cycylive.fr/api/twitch-callback` (une fois ton domaine connecté)
3. Sauvegarde.

### Étape 2 — Se connecter

1. Va sur `tonsite.vercel.app/admin`.
2. Tout en haut, dans le bloc "Compteur de followers Twitch", clique sur **Connecter Twitch**.
3. Tu es redirigée vers Twitch : connecte-toi avec ton compte Cycylive et autorise l'accès (permission "voir vos followers").
4. Tu reviens automatiquement sur `/admin` avec un message de confirmation, et le nombre de followers s'affiche.

C'est fait une seule fois : le site se souvient de la connexion et se reconnecte tout seul en arrière-plan par la suite (pas besoin de refaire cette étape à chaque fois).

## Variables d'environnement

Le site fonctionne sans aucune configuration (planning par défaut, statut Twitch "hors ligne"). Pour activer les fonctionnalités avancées :

| Variable | Pour quoi | Où la trouver |
|---|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Sauvegarder le planning via `/admin` | [upstash.com](https://upstash.com) (voir "Interface d'administration") |
| `ADMIN_PASSWORD` | Protéger l'accès à `/admin` | Choisi par toi |
| `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL_LOGIN` | Détecter le vrai statut Twitch | [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) (voir "Détection automatique du live Twitch") |

## Évolutions futures (déjà prévues dans l'architecture)

Le dossier `data/` a été pensé pour accueillir facilement :

- **Statistiques avancées** : graphique d'évolution des followers dans le temps, compteur TikTok/Instagram (nécessiterait une validation d'app par ces plateformes).
- **Media kit PDF** : ajoute le fichier dans `public/`, puis remplace le bouton désactivé dans `app/partenariats/page.tsx` par un lien de téléchargement.
- **Newsletter, boutique, calendrier d'événements, galerie** : nouvelles pages dans `app/`, suivant le même modèle que les pages existantes.
- **Formulaire de contact avec envoi réel** (au lieu du mailto actuel) : brancher un service comme Formspree, Resend ou EmailJS — aucune base de données nécessaire.

## SEO et partage

Chaque page a son propre titre, sa description et ses métadonnées Open Graph (aperçu de partage sur Discord, WhatsApp, Twitter/X...). `sitemap.xml` et `robots.txt` sont générés automatiquement par Next.js (fichiers `app/sitemap.ts` et `app/robots.ts`) — rien à faire de ton côté. La page `/admin` est volontairement exclue de l'indexation par les moteurs de recherche.

Si tu changes le titre ou la description d'une page, modifie le bloc `export const metadata` en haut du fichier correspondant (ex : `app/valorant/page.tsx`).

## Notes de design

- Palette et univers graphique directement inspirés des visuels et du logo fournis (violet/lilas, cosmique, holographique, premium).
- Aucune bibliothèque lourde : uniquement Next.js, React et Tailwind.
- Images optimisées et compressées pour rester rapide.
- Site entièrement responsive, avec une barre d'accès rapide (Twitch / Discord / Réseaux) fixée en bas de l'écran sur mobile.
