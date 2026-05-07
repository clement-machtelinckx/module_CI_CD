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



## URL de l'application deployee

- [git hub](https://clement-machtelinckx.github.io/module_CI_CD/)

## URL de la documentation generee

- [docs](https://clement-machtelinckx.github.io/module_CI_CD/docs/index.html)