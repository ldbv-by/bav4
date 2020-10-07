# BAv4 (#nomigration)

Next generation web-mapviewer based on web standards.

## Concept

- Use of web standards as far as possible
- Modern Js (ES9), currently no transpiler
- Model–view–viewmodel (MVVM) structuring:
  - Data objects from service classes => *model*
  - DOM => *view*
  - Custom HTMLElements (web components)  =>  *viewmodel*
- Built-in dependency injection
- Map state is decoupled from map implementation
- Vanilla Css. Scoping via nested rules (https://drafts.csswg.org/css-nesting-1/), which are unwrapped within postprocessing 
- Tools
  - [openlayers](https://openlayers.org/): mapping api
  - [lit-html](https://lit-html.polymer-project.org/): template rendering 
  - [redux](https://redux.js.org/): application state container 
  - [webpack](https://webpack.js.org): bundler
  - [jasmin](https://jasmine.github.io/)/[karma](https://karma-runner.github.io/latest/index.html): tests
- Basic concept inspired by Adam Bien (https://airhacks.io/)


## Install
`npm i`


## List of npm scripts


| command | what it does |
|----|----|
| `npm run start` | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output) |
| `npm run start:nohostcheck` | Compiles and hot-reloads for development. Will serve the project under `http://0.0.0.0:8080` (or the next available port if `8080` is already used, see console output) with disabled host checking, so that the application is reachable from another device|
| `npm run build:dev` | Compiles all files without bundling and minification |
| `npm run build:prod` | Compiles and minifies for production |
| `npm run test` | Runs unit and component tests against Chrome (headless) and Firefox (headless). Both browsers must be installed locally. A code coverage report can be found under  `./coverage`  |
| `npm run lint` | Lints and fixes files |
| `npm run doc` | Generates jsdoc files (see:  `./docs`) |
| `npm run es-check` | Checks if source files use only allowed es-version language features. Currently up to es9 is allowed |
| `npm run analyze-bundle` | Visualize size of webpack output files with an interactive zoomable treemap |



## Pending

- Externalize html-templates: https://stackoverflow.com/questions/63355270/in-lit-html-is-there-a-way-to-use-strings-instead-of-template-literal
- Run each set of tests in separate iframe: https://github.com/karma-runner/karma/issues/412

## Links

- lit-html guide: https://lit-html.polymer-project.org/guide
- Redux tutorial: https://redux.js.org/tutorials/essentials/part-1-overview-concepts  
- Webpack intro: https://ui.dev/webpack/ 
- Redux query-param sync: https://github.com/Treora/redux-query-sync
