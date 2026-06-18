# TP CI/CD - React, FastAPI et MySQL

Application de TP CI/CD avec un frontend React, une API FastAPI et une base MySQL.

Fonctionnalites principales :

- formulaire utilisateur sauvegarde en base de donnees ;
- liste publique avec donnees reduites : nom, prenom, ville ;
- connexion administrateur ;
- affichage admin des donnees privees ;
- suppression d'un utilisateur par un admin.

## Stack

- React / Create React App
- FastAPI
- MySQL
- Adminer
- Docker / Docker Compose
- GitHub Actions
- GitHub Pages
- Vercel
- Aiven MySQL
- Jest / React Testing Library
- Cypress
- JSDoc

## Installation locale

Prerequis :

- Node.js et npm
- Docker et Docker Compose

Installer les dependances :

```bash
npm install
```

Creer le fichier d'environnement local :

```bash
cp .env.example .env
```

Remplir les variables dans `.env` avec les valeurs locales necessaires. Ne pas commiter ce fichier.

Lancer toute la stack locale :

```bash
docker compose up -d --build
```

## URLs locales

- Front React : http://localhost:3000
- Backend FastAPI : http://localhost:8000
- Swagger local : http://localhost:8000/docs
- Adminer : http://localhost:8080

Pour arreter la stack :

```bash
docker compose down -v --remove-orphans
```

## Lancement front seul

Pour lancer uniquement le frontend en developpement :

```bash
npm start
```

Le front est alors accessible sur `http://localhost:3000`.

## Tests

Tests unitaires et integration React :

```bash
npm test
```

Couverture de tests :

```bash
npm run test:coverage
```

Les tests Cypress E2E sont lances dans la pipeline GitHub Actions avec Docker Compose.

## Documentation JSDoc

Generer la documentation :

```bash
npm run jsdoc
```

La documentation est generee dans `public/docs`.

## Build React

```bash
npm run build
```

## Deploiement GitHub Pages manuel

```bash
npm run deploy
```

## CI/CD

Le workflow GitHub Actions se lance sur `push` et `pull_request` vers `master`.

Il effectue notamment :

- installation des dependances ;
- tests unitaires et coverage ;
- generation JSDoc ;
- build React ;
- lancement Docker Compose ;
- healthchecks de l'infrastructure ;
- tests Cypress E2E ;
- build et push des images Docker Hub ;
- deploiement du frontend sur GitHub Pages ;
- deploiement du backend sur Vercel.

Les secrets ne sont pas stockes dans le repository. Ils sont geres avec GitHub Secrets et les variables d'environnement Vercel.

## Base de donnees

Les migrations locales sont dans `database/`.

Tables principales :

- `users` : utilisateurs crees depuis le formulaire ;
- `admins` : comptes administrateurs.

En local Docker, l'admin initial est cree via les variables d'environnement. En production, la base MySQL est hebergee sur Aiven et les migrations sont appliquees separement.

## Liens de production

- Repository GitHub : https://github.com/clement-machtelinckx/module_CI_CD
- Frontend GitHub Pages : https://clement-machtelinckx.github.io/module_CI_CD/
- Documentation JSDoc : https://clement-machtelinckx.github.io/module_CI_CD/docs/index.html
- Backend Vercel : https://module-ci-cd.vercel.app
- Swagger backend : https://module-ci-cd.vercel.app/docs
- Endpoint public users : https://module-ci-cd.vercel.app/users
- Docker Hub frontend : https://hub.docker.com/r/yazii/frontend
- Docker Hub backend : https://hub.docker.com/r/yazii/backend
