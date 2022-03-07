# BA v4

[![Build Status](https://github.com/ldbv-by/bav4-nomigration/workflows/Node.js%20CI/badge.svg)](https://github.com/ldbv-by/bav4-nomigration/actions/workflows/node.js.yml?query=branch%3Amaster)
[![Coverage Status](https://coveralls.io/repos/github/ldbv-by/bav4-nomigration/badge.svg?branch=master)](https://coveralls.io/github/ldbv-by/bav4-nomigration?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

Next-generation web-map viewer based on web standards.

#### Table of Contents
1. [Concept](#concept)
2. [Setup](#setup)
3. [Structure](#structure)
4. [Details](#details)
5. [Best Practices](#best-practices)
6. [Links](#links)


## Concept

- Use of web standards as far as possible
  - Modern JavaScript (ES11), no transpiler
  - Web Components
  - Vanilla CSS 
- Built-in dependency injection
- Map state decoupled from map implementation
- Tools
  - [OpenLayers](https://openlayers.org/): Mapping API
  - [lit-html](https://lit-html.polymer-project.org/): Template rendering 
  - [redux](https://redux.js.org/): Application state container 
  - [webpack](https://webpack.js.org): Bundler
  - [jasmin](https://jasmine.github.io/)/[karma](https://karma-runner.github.io/latest/index.html): Tests
  - [playwright](https://playwright.dev/) E2E Tests

## Setup

### Prerequisites

- Node.js 16
- npm 8

With [nvm](https://github.com/nvm-sh/nvm) run `nvm install && nvm use`

### Install

`npm i`

### List of npm scripts


| Run/Build | |
|----|----|
| `npm run start` | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output) |
| `npm run start:nohostcheck` | Compiles and hot-reloads for development. Will serve the project under `http://0.0.0.0:8080` (or the next available port if `8080` is already used, see console output) with disabled host checking so that the application is reachable from another device|
| `npm run build:dev` | Compiles all files without bundling and minification |
| `npm run build:prod` | Compiles and minifies for production |

| Test | Tests can be run against multiple browsers. Available browsers are `ChromeHeadless`, `FirefoxHeadless`, `WebkitHeadless`. |
|----|----|
| `npm run test` | Runs unit and component tests against all available browsers. A (combined) code coverage report can be found under  `./coverage/lcov-report`. Target browsers can be individually specified by the `--browsers` option (comma-seperated).  |
| `npm run test:single` | Runs a single test. Usage `npm run test:single --spec=MyTest.test.js `. The target browser can be individually specified by the `--browser` option. Default is `FirefoxHeadless` |
| `npm run test:debug` | Runs unit and component tests against headless Chrome (Chromium) with remote debugging enabled | 

| E2E Test | E2E tests are based on Playwright and can be run against multiple browsers. Available browsers are `chromium`, `firefox`, `webkit`. |
|----|----|
| `npm run e2e` | Runs E2E tests against all available browsers. A single browser can be individually specified by the `--browser` option |
| `npx playwright test --help` | Shows information about all options |

| Other | |
|----|----|
| `npm run lint` | Lints and fixes js and css files |
| `npm run doc` | Generates jsdoc files (see:  `./docs`) |
| `npm run es-check` | Checks if source files use only allowed es-version language features|
| `npm run analyze-bundle` | Visualize the size of webpack output files with an interactive zoomable treemap |


## Structure

The project's source code is located under `src`, unit, component and e2e tests under `test`.

The source code is distributed among the following directories:

###  `src/injection`

Contains the built-in dependency injection. The central configuration is done in `config.js`.

The common types of injection are service classes.
Service classes may retrieve data from an external source by using a provider function. Such provider functions are also interchangeable. 
Services and provider functions whose names start with 'BVV' are focusing on the LDBV context and infrastructure.

### `src/modules`

Modules are each as much as possible independent units of code. They have a concrete context and/or focus on one or more similar use cases of the application (single responsibility, high cohesion).

Modules meet the following conventions: 

1. Each module must have an `index.js`  as an entry point, which states all of its dependencies.

2. Each module must be registered within the `main.js`.

3. Each module may contain further directories:
   - `/components` : Components and all of their dependencies like CSS, assets (see [Components](#components))
   - `/services` : service, provider and domain classes of the module
   - `/i18n` : i18n provider and loader for this module

4. Outside their package, modules are only allowed to use global services, actions and components from other modules for composition.

### `src/plugins`
Contains all plugins (see [Plugins](#plugins)).

### `src/services`
All global services like the `HttpService`, providers and domain classes are located here.

### `src/store`
All redux related files like reducers and actions.

### `src/utils`
Contains global utilities.

### Overview
Here's an overview of what project folder structure looks like:
```
    .
    + -- src # source code
    |    + -- index.html # here's where you should declare your top-level web components
    |    + -- main.js # here's where you should import your modules  to the app
    |    + -- injection
    |    + -- modules
    |    |    + -- moduleName
    |    |    |    + -- index.js
    |    |    |    # other moduleName related files such as a components folder or a services folder
    |    + -- plugins
    |    + -- services
    |    + -- store
    |    + -- utils
    + -- test # test code
```

## Details

### Global State

Global state and its management is realized by Redux (reducers and actions).

### Components

Components are based on `MvuElement`. This class inherits from HTMLElement and provides the Model-View-Update pattern and a well-defined component lifecycle as the programming model. For more information have a look at the `MvuElement` docs.
Components hold local state within their model.

### Plugins

`BaPlugins` implementations are a second important place for structuring code and logic.  
In contrast to components, they often act as a Controller on a higher abstraction level
managing global state being consumed by components afterward.  
For example, they could be responsible for setting an initial state or reacting to global state changes during the runtime of the app. 

### Best practices

- Mutation of the same parts of the global state should be done in just one place at the same moment (single source of truth) <br>
("At the same moment" means the phase when parts of the application react to an event, e.g. user interaction, initial setup)

- Common places for updating global state are:
  - `MvuElement` based components
  - `BaPlugin` implementations

- If an update of the global state has an event-like character, it's recommended to wrap the payload within another object. This makes it possible to track changes and avoids second dispatching in order to "reset" the state. For this purpose, you can use use `EventLike` in storeUtils.js

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
- A Complete Guide to Flexbox : https://css-tricks.com/snippets/css/a-guide-to-flexbox/

### Redux
- Few Ways to Update a State Array in Redux Reducer https://medium.com/swlh/few-ways-to-update-a-state-array-in-redux-reducer-f2621ae8061

*USE THE PLATFORM*
