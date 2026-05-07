# Formulaire d'inscription React

Application React Create React App permettant de saisir un formulaire d'inscription, de valider les donnees cote client et d'afficher la liste des inscrits en local.

## Fonctionnalites principales

- Saisie des champs `nom`, `prenom`, `date de naissance`, `email`, `ville` et `code postal`
- Validation metier centralisee dans `src/utils/module.js`
- Affichage des erreurs de validation sous les champs
- Blocage de la soumission tant que le formulaire est incomplet
- Enregistrement des inscrits dans le `localStorage`
- Affichage de la liste des inscrits
- Tests unitaires et d'integration
- Documentation JSDoc generee dans `public/docs`

## Stack technique

- React 19
- Create React App
- JavaScript / JSX
- Jest
- React Testing Library
- JSDoc
- GitHub Actions
- GitHub Pages

## Pre-requis

- Node.js 18+ recommande
- npm

## Installation

```bash
npm install
```

## Lancement en local

```bash
npm start
```

L'application est alors accessible sur `http://localhost:3000`.

## Lancement des tests

```bash
npm test
```

## Lancement de la couverture de tests

```bash
npm run test:coverage
```

La configuration de couverture exclut :

- `src/index.js`
- `src/reportWebVitals.js`
- `src/setupTests.js`
- les fichiers `*.test.js` et `*.test.jsx`

## Generation de la documentation JSDoc

```bash
npm run jsdoc
```

La documentation est generee dans `public/docs`.

## Build de production

```bash
npm run build
```

## Deploiement GitHub Pages

```bash
npm run deploy
```

Le script `predeploy` lance automatiquement le build avant publication.

## CI/CD GitHub Actions

Le workflow principal est :

- [build_test_deploy_react.yml](./.github/workflows/build_test_deploy_react.yml)

Il execute :

- l'installation des dependances
- la generation JSDoc
- le build de production
- les tests
- l'upload de la couverture vers Codecov
- le deploiement GitHub Pages

## Structure rapide du projet

```text
src/
  App.js
  Composants/
    Count.jsx
    Form.jsx
  utils/
    module.js
public/
  docs/
.github/
  workflows/
    build_test_deploy_react.yml
jsdoc.config.json
package.json
```

## Fichiers importants

- `src/Composants/Form.jsx` : composant principal du formulaire et de la liste des inscrits
- `src/Composants/Count.jsx` : composant compteur simple
- `src/utils/module.js` : fonctions utilitaires de validation
- `src/Composants/Form.test.jsx` : tests d'integration du formulaire
- `src/utils/module.test.js` : tests unitaires des fonctions de validation
- `jsdoc.config.json` : configuration JSDoc

## Tests en place

Les tests couvrent notamment :

- le calcul de l'age
- la verification de majorite
- le format du code postal
- le format du nom, du prenom et de la ville
- le format de l'email
- l'etat du bouton de soumission
- l'affichage des messages d'erreur
- le message de succes
- le vidage du formulaire
- l'ajout et le chargement des inscrits

## URL de l'application deployee

- https://clement-machtelinckx.github.io/module_CI_CD/

## URL de la documentation generee

- https://clement-machtelinckx.github.io/module_CI_CD/docs/index.html
