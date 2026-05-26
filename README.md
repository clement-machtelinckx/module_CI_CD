# tp CI/CD



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

## CI/CD

### Tests, build et documentation

Le workflow GitHub Actions se lance sur les evenements `push` et `pull_request` vers la branche `master`.

Le job `build_test` execute les commandes suivantes :

- `npm ci`
- `npm run jsdoc`
- `npm run build --if-present`
- `npm test`

Ce job gere egalement l'envoi de la couverture de tests vers Codecov.

### Deploiement GitHub Pages

Une fois le job `build_test` termine avec succes, le dossier `build` est upload comme artifact GitHub Pages.

Le job `deploy` depend du succes de `build_test` et publie ensuite cet artifact sur GitHub Pages.

### Publication npm

Le job `publish_npm` se lance uniquement lors d'un `push`.

Avant toute publication, le workflow lit le `name` et la `version` presents dans `package.json`, puis verifie avec `npm view` si cette combinaison existe deja sur npm.

Si cette version existe deja sur npm, la publication est ignoree.

Si la version est nouvelle, le workflow execute :

- `npm ci`
- `npm run build-npm`
- `npm publish --access public`

### Publier une nouvelle version

Pour publier une nouvelle version, il faut d'abord modifier la version dans `package.json`, soit manuellement, soit en local avec une commande comme :

- `npm version patch`
- `npm version minor`
- `npm version major`

Apres le changement de version, il faut commit puis push.

Au moment du `push`, GitHub Actions verifiera si cette version existe deja sur npm et ne publiera le package que si elle n'existe pas encore.




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


[git hub](https://github.com/clement-machtelinckx/module_CI_CD)


## URL de l'application deployee

- [app deployer](https://clement-machtelinckx.github.io/module_CI_CD/)

## URL de la documentation generee

- [docs](https://clement-machtelinckx.github.io/module_CI_CD/docs/index.html)
update
