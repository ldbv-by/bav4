# BAv4 (#nomigration)

## Concept

- Use of Web Standards as far as possible
- Model-View-ViewModel (MVVM) structuring:
  - Data objects from service classes => *Model*
  - DOM => *View*
  - CustomElements (Web Components)  =>  *ViewModel*
- Built-in dependency injection
- Tools
  - [lit-html](https://lit-html.polymer-project.org/): template rendering 
  - [redux](https://redux.js.org/): application state container 
  - [webpack](https://webpack.js.org): bundler
  - [jasmin](https://jasmine.github.io/)/[karma](https://karma-runner.github.io/latest/index.html): tests
- inspired by Adam Bien (https://airhacks.io/)


## Install
`npm i`


## List of npm scripts


| command | what it does |
|----|----|
| `npm run start` | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output). |
| `npm run build:dev` | Compiles all files without bundling and minification |
| `npm run build:prod` | Compiles and minifies for production |
| `npm run test` | Runs unit and component tests headless against Chrome and Firefox. Both browsers must be installed locally |
| `npm run lint` | Lints and fixes files |
| `npm run doc` | Generates jsdoc files (see:  `./docs`) |
| `npm run es-check` | Checks if source files use only allowed es-version language features. Currently es9 is allowed |



## Pending

- Externalize html-templates: https://stackoverflow.com/questions/63355270/in-lit-html-is-there-a-way-to-use-strings-instead-of-template-literal
- Run each set of tests in separate iframe: https://github.com/karma-runner/karma/issues/412

## Links

- lit-html Guide: https://lit-html.polymer-project.org/guide
- Redux tutorial: https://redux.js.org/tutorials/essentials/part-1-overview-concepts  
- Webpack intro: https://ui.dev/webpack/ 
- Redux Query-Param Sync: https://github.com/Treora/redux-query-sync
