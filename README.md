<p align="center">
   <img src="https://raw.githubusercontent.com/ldbv-by/bav4/master/logo.svg" height="128">
</p>
<h1 align="center">
   BayernAtlas v4 <br><br>

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ldbv-by/bav4/node.js.yml?branch=master&style=for-the-badge)](https://github.com/ldbv-by/bav4/actions/workflows/node.js.yml?query=branch%3Amaster)
[![Coveralls branch](https://img.shields.io/coveralls/github/ldbv-by/bav4/master?style=for-the-badge)](https://coveralls.io/github/ldbv-by/bav4?branch=master)
[![GitHub](https://img.shields.io/github/license/ldbv-by/bav4?color=blue&style=for-the-badge)](http://www.apache.org/licenses/LICENSE-2.0)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier)

</h1>

Next-generation web-map viewer based on web standards ([`live example`](https://ldbv-by.github.io/bav4/)).

#### Table of Contents

1. [Concept](#concept)
2. [Setup](#setup)
3. [Structure](#structure)
4. [Details](#details)
5. [Best Practices](#best-practices)
6. [Links](#links)

## Concept

- Use of web standards as far as possible
  - Modern JavaScript (ES2022), no transpiler
  - Web Components
  - Vanilla CSS
- Built-in dependency injection
- Map state decoupled from map implementation
- Tools
  - [OpenLayers](https://openlayers.org/): Mapping API
  - [MapLibre OpenLayers layer](https://github.com/geoblocks/ol-maplibre-layer/): Vector Tiles rendering
  - [lit-html](https://lit-html.polymer-project.org/): Template rendering
  - [redux](https://redux.js.org/): Application state container
  - [Chart.js](https://www.chartjs.org/): JavaScript charting
  - [vanilla-swipe](https://github.com/maxmarinich/vanilla-swipe/): Swipe direction detection
  - [DOMPurify](https://github.com/cure53/DOMPurify/): XSS sanitizer for HTML
  - [webpack](https://webpack.js.org): Bundler
  - [jasmin](https://jasmine.github.io/)/[karma](https://karma-runner.github.io/latest/index.html): Tests
  - [playwright](https://playwright.dev/) E2E Tests

## Setup

### Prerequisites

- Node.js 18
- npm 9.5.x or higher

Having [nvm](https://github.com/nvm-sh/nvm) installed, just run `nvm install && nvm use`

### Install

`npm i`

### Configuration

The app can be run without any configuration and uses default values and fallback mechanisms for that case.
That is also the case when the `BACKEND_URL` property is missing.  
To enable the showcase component, the `SOFTWARE_INFO` property must be set.

Configuration properties are read at build time from a `.env` file located in the project's root directory.
Currently used properties are:

| key                      | default value                            | description                                          |
| ------------------------ | ---------------------------------------- | ---------------------------------------------------- |
| `DEFAULT_LANG`           | `en`                                     | current locale (available locales are `en` and `de`) |
| `FRONTEND_URL`           | `${location.protocol}//${location.host}` | (external) URL of the app                            |
| `BACKEND_URL`            |                                          |                                                      |
| `PROXY_URL`              |                                          |                                                      |
| `SHORTENING_SERVICE_URL` |                                          |                                                      |
| `SOFTWARE_INFO`          |                                          | e.g. build information                               |

### List of npm scripts

<!-- prettier-ignore -->
| Run/Build | |
|----|----|
| `npm run start` | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output) |
| `npm run start:nohostcheck` | Compiles and hot-reloads for development. Will serve the project under `http://0.0.0.0:8080` (or the next available port if `8080` is already used, see console output) with disabled host checking so that the application is reachable from another device|
| `npm run build:dev` | Compiles all files without bundling and minification |
| `npm run build:prod` | Compiles and minifies for production |

<!-- prettier-ignore -->
| Test | Tests can be run against multiple browsers. Available browsers are `ChromeHeadless`, `FirefoxHeadless`, `WebkitHeadless`. |
|----|----|
| `npm run test` | Runs unit and component tests against all available browsers. A (combined) code coverage report can be found under  `./coverage/lcov-report`. Target browsers can be individually specified by the `--browsers` option (comma-seperated).  |
| `npm run test:single` | Runs a single test. Usage `npm run test:single --spec=MyTest.test.js `. The target browser can be individually specified by the `--browser` option. The default is `FirefoxHeadless` |
| `npm run test:debug` | Runs unit and component tests against headless Chrome (Chromium) with remote debugging enabled |

<!-- prettier-ignore -->
| E2E Test | E2E tests are based on Playwright and can be run against multiple browsers. Available browsers are `chromium`, `firefox`, `webkit`. |
|----|----|
| `npm run e2e` | Runs E2E tests against all available browsers. A single browser can be individually specified by the `--browser` option |
| `npx playwright test --help` | Shows information about all options |

| Other                    |                                                                            |
| ------------------------ | -------------------------------------------------------------------------- |
| `npm run lint`           | Lints and fixes js and css files                                           |
| `npm run prettier`       | Formats all code files                                                     |
| `npm run es-check`       | Checks if js files use only allowed es-version language features           |
| `npm run doc`            | Generates jsdoc files (see: `./docs`)                                      |
| `npm run doc:check`      | Checks if all required JSDoc module names exists                           |
| `npm run doc:apply`      | Adds or updates the JSDoc module names                                     |
| `npm run bundlesize`     | Checks the bundle size of the webpack compiled chunks                      |
| `npm run analyze-bundle` | Visualize the size of webpack chunks with an interactive zoomable tree map |

### Available Pages

| Path              |                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/` `/index.html` | Serves the default page                                                                                                   |
| `/embed.html`     | Serves a page that can be embedded via an iframe                                                                          |
| `/embed/wrapper`  | Serves a wrapper page for the embed.html. Useful for dev and testing purposes (passes its query parameters to embed.html) |

## Structure

The project's source code is under `src`, unit, component and e2e tests under `test`.

The source code is distributed among the following directories:

### `src/domain`

Contains global domain-specific classes and type definitions.

### `src/i18n`

Contains and registers the global i18n provider

### `src/injection`

Contains the built-in dependency injection. The central configuration is done in `config.js`.

The common types of injection are service classes.
Service classes may retrieve data from an external source by using a provider function. Such provider functions are also interchangeable.
Services and provider functions whose names start with 'BVV' are focusing on the LDBV context and infrastructure.

### `src/modules`

Modules are each as much as possible independent units of code. They have a concrete context and/or focus on one or more similar use cases of the application (single responsibility, high cohesion).

Modules meet the following conventions:

1. Each module must have an `index.js` as an entry point, which states all of its dependencies.

2. Each module must be registered within the `main.js`.

3. Each module may contain further directories:

   - `/components` : Components and all of their dependencies like CSS, assets (see [Components](#components))
   - `/services` : service, provider, and domain classes of the module
   - `/i18n` : i18n provider and loader for this module

4. Outside their package, modules are only allowed to use global services, actions, and components from other modules for composition.

### `src/plugins`

Contains all plugins (see [Plugins](#plugins)).

### `src/services`

All global services like the `HttpService` and their providers are located here.

### `src/store`

All redux-related files like reducers and actions.

### `src/utils`

Contains global utilities.

### `src/chunks`

Contains chunk definitions for dynamically loading js resources (code splitting).

### Overview

Here's an overview of what the project folder structure looks like:

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

Global state and its management are realized by Redux (reducers and actions).

### Components

Components are based on `MvuElement`. This class inherits from HTMLElement and provides the Model-View-Update pattern and a well-defined component lifecycle as the programming model. For more information have a look at the `MvuElement` docs.
Components hold the local state within their model.

### Plugins

`BaPlugins` implementations are a second important place for structuring code and logic.  
In contrast to components, they often act as a Controller on a higher abstraction level
managing the global state being consumed by components afterward.  
For example, they could be responsible for setting an initial state or reacting to global state changes during the runtime of the app.

### Best practices

- Mutation of the same parts of the global state should be done in just one place at the same moment (single source of truth) <br>
  ("At the same moment" means the phase when parts of the application react to an event, e.g. user interaction, initial setup)

- Common places for updating the global state are:

  - `MvuElement` based components
  - `BaPlugin` implementations

- If an update of the global state has an event-like character, it's recommended to wrap the payload within another object. This makes it possible to track changes and avoids second dispatching in order to "reset" the state. For this purpose, you can use use `EventLike` in storeUtils.js

## Links

### Various topics relating to Web Components

- Introduction to custom elements and web components: https://javascript.info/web-components
- https://www.thinktecture.com/de/articles/web-components/
- https://itnext.io/handling-data-with-web-components-9e7e4a452e6e

### CSS

- A Complete Guide to Flexbox: https://css-tricks.com/snippets/css/a-guide-to-flexbox/

### lit-html

- lit-html guide: https://lit-html.polymer-project.org/guide

### Redux

- Redux tutorial: https://redux.js.org/tutorials/essentials/part-1-overview-concepts
- Few Ways to Update a State Array in Redux Reducer https://medium.com/swlh/few-ways-to-update-a-state-array-in-redux-reducer-f2621ae8061
- Redux query-param sync: https://github.com/Treora/redux-query-sync

### Webpack

- Webpack Intro: https://ui.dev/webpack/

### Other

- Why I don't miss React: a story about using the platform: https://www.jackfranklin.co.uk/blog/working-with-react-and-the-web-platform/

_USE THE PLATFORM_
