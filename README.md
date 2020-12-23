# BAv4 (#nomigration) [![Build Status](https://travis-ci.com/ldbv-by/bav4-nomigration.svg?branch=master)](https://travis-ci.com/ldbv-by/bav4-nomigration) [![Coverage Status](https://coveralls.io/repos/github/ldbv-by/bav4-nomigration/badge.svg?branch=master)](https://coveralls.io/github/ldbv-by/bav4-nomigration?branch=master)

Next generation web-mapviewer based on web standards.

#### Table of Contents
1. [Concept](#concept)
2. [Structure](#structure)
3. [Setup](#setup)
4. [Pending Questions](#pending-questions)
5. [Links](#links)


## Concept

- Use of web standards as far as possible
- Modern Js (ES9), currently no transpiler
- Model–view–viewmodel (MVVM) structuring:
  - Data objects from service classes => *model*
  - DOM => *view*
  - Web components  =>  *viewmodel*
- Built-in dependency injection
- Map state is decoupled from map implementation
- Vanilla Css 
- Tools
  - [openlayers](https://openlayers.org/): mapping api
  - [lit-html](https://lit-html.polymer-project.org/): template rendering 
  - [redux](https://redux.js.org/): application state container 
  - [webpack](https://webpack.js.org): bundler
  - [jasmin](https://jasmine.github.io/)/[karma](https://karma-runner.github.io/latest/index.html): tests
- Basic concept inspired by Adam Bien (https://airhacks.io/)

## Structure

The projects source code is located under `src`, unit and component tests under `test`.

The source code is distributed among following directories:

###  `src/injection`

Contains the built-in dependency injection. The central configuration is done in `config.js`.


### `src/modules`

Modules are single and independent (as far as possible) units of code. They have a concrete context and focus on one or more use cases of the application. 

Modules meet the following conventions: 

1. Each module must have an `index.js`  as an entry point, which states all of its dependencies.

2. Each module must be registered within the `main.js`.

3. Each module may contain further directories:
   - `/components` : viewmodel classes and all of their dependencies like css, assets, ...
   - `/store` : all redux related files like reducers and actions
   - `/service` : the service and domain classes of the module

4. Modules are allowed to use actions from other modules


### `src/services`
All global services like the `HttpService` are located here.

### `src/utils`
Contains global utilities.

### Overview
Here's a overview of what project folder structure looks like:
```
    .
    + -- src # source code
    |    + -- index.html # here's where you should declare your top-level web components
    |    + -- main.js # here's where you should import your modules  to the app
    |    + -- injection
    |    + -- modules
    |    |    + -- moduleName
    |    |    |    + -- index.js
    |    |    |    # other moduleName related files such as a components folder, a store folder or a service folder
    |    + -- services
    |    + -- utils
    + -- test # test code
```

## Setup
`npm i`


### List of npm scripts


| command | what it does |
|----|----|
| `npm run start` | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output) |
| `npm run start:nohostcheck` | Compiles and hot-reloads for development. Will serve the project under `http://0.0.0.0:8080` (or the next available port if `8080` is already used, see console output) with disabled host checking, so that the application is reachable from another device|
| `npm run build:dev` | Compiles all files without bundling and minification |
| `npm run build:prod` | Compiles and minifies for production |
| `npm run test` | Runs unit and component tests against Chrome (headless) and Firefox (headless). Both browsers must be installed locally. A code coverage report can be found under  `./coverage`  |
| `npm run test:single` | Runs a single test against Firefox (headless). Usage `npm run test:single --spec=MyTest.test.js`  |
| `npm run test:debug` | Runs unit and component tests against Chrome (headless) with remote debugging enabled | 
| `npm run test:webkit` | Runs unit and component tests against the Gnome Web Browser (Epiphany), which is based on WebKit. The browser must be installed locally. A code coverage report can be found under  `./coverage`  |
| `npm run lint` | Lints and fixes files |
| `npm run doc` | Generates jsdoc files (see:  `./docs`) |
| `npm run es-check` | Checks if source files use only allowed es-version language features. Currently up to es9 is allowed |
| `npm run analyze-bundle` | Visualize size of webpack output files with an interactive zoomable treemap |



## Pending Questions

- Externalize html-templates: https://stackoverflow.com/questions/63355270/in-lit-html-is-there-a-way-to-use-strings-instead-of-template-literal
- Run each set of tests in separate iframe: https://github.com/karma-runner/karma/issues/412 (solved: by using karma-iframes)

## Links

- Introduction into custom elements and web components: https://javascript.info/web-components
- lit-html guide: https://lit-html.polymer-project.org/guide
- Redux tutorial: https://redux.js.org/tutorials/essentials/part-1-overview-concepts  
- Webpack intro: https://ui.dev/webpack/ 
- Redux query-param sync: https://github.com/Treora/redux-query-sync

### Various topics relating web components
- https://www.thinktecture.com/de/articles/web-components/


### Data handling
- https://alligator.io/web-components/attributes-properties/
- https://itnext.io/handling-data-with-web-components-9e7e4a452e6e

### CSS
-  A Complete Guide to Flexbox : https://css-tricks.com/snippets/css/a-guide-to-flexbox/

*USE THE PLATFORM*
