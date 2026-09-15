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
│   ├── reseaux/page.tsx     → Réseaux
│   ├── communaute/page.tsx  → Communauté
│   ├── partenariats/page.tsx→ Partenariats
│   ├── contact/page.tsx     → Contact
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
| Le planning de la semaine | `data/planning.ts` |
| Un lien Twitch / TikTok / Instagram / YouTube / Discord / mail | `data/liens.ts` |
| Les textes du site (accroche, à propos, communauté, partenariats, contact) | `data/textes.ts` |
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

## Variables d'environnement

Le site fonctionne sans aucune configuration (le bloc Twitch affichera simplement "hors ligne" avec le prochain live calculé depuis le planning). Pour activer la **détection réelle du live**, voir la section précédente "Détection automatique du live Twitch" — 3 variables sont nécessaires : `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_CHANNEL_LOGIN`.

## Évolutions futures (déjà prévues dans l'architecture)

Le dossier `data/` a été pensé pour accueillir facilement :

- **Compteur de followers / statistiques** : nouveau composant qui interroge l'API Twitch (déjà connectée), TikTok ou Instagram.
- **Media kit PDF** : ajoute le fichier dans `public/`, puis remplace le bouton désactivé dans `app/partenariats/page.tsx` par un lien de téléchargement.
- **Newsletter, boutique, calendrier d'événements, galerie** : nouvelles pages dans `app/`, suivant le même modèle que les pages existantes.
- **Formulaire de contact avec envoi réel** (au lieu du mailto actuel) : brancher un service comme Formspree, Resend ou EmailJS — aucune base de données nécessaire.

## Notes de design

- Palette et univers graphique directement inspirés des visuels et du logo fournis (violet/lilas, cosmique, holographique, premium).
- Aucune bibliothèque lourde : uniquement Next.js, React et Tailwind.
- Images optimisées et compressées pour rester rapide.
- Site entièrement responsive, avec une barre d'accès rapide (Twitch / Discord / Réseaux) fixée en bas de l'écran sur mobile.
