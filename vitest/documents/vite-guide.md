# Vite Migration Guide

## Minimal Setup - BayernAtlas

### Javascript Imports

#### Default Imports

Die relevanten Javascript-Dateien für den Atlas müssen (main.js & assets/config.js) in der index.html hinzugefügt werden.

```html
<head>
	<script type="module" src="main.js"></script>
	<script type="module" src="assets/config.js"></script>
</head>
```

#### Dynamic Imports (Lazy Loading)

Funktioniert ähnlich wie bei Webpack und ist Standardverhalten. Der Unterschied ist, dass bei Vite die Dateiendung zusätzlich hinzugefügt werden muss.  
[https://vite.dev/guide/features#glob-import](https://vite.dev/guide/features#glob-import)  
[https://vite.dev/guide/features#dynamic-import](https://vite.dev/guide/features#dynamic-import)

Beispiel Lazy Load Wrapper:

```javascript
// import css from './mainMenu.css?inline';
import css from './mainMenu.css?inline';
import(`@chunk/${this.#chunkName}.js`).then(() => {
	this.signal(Update_Loaded, true);
});
```

### Aliase

Da bei Dynamic Imports Aliase verwendet werden (@chunk), bietet es sich an hier zu erwähnen, dass diese gleich wie in der webpack.config erstellt werden können.  
[https://vite.dev/config/shared-options#resolve-alias](https://vite.dev/config/shared-options#resolve-alias)

```javascript
resolve: { alias: { '@chunk': path.resolve(__dirname, './src/chunks') } }
```

### CSS Imports

Alle CSS Imports benötigen den Postfix `?inline`, damit die Styles für die MVUElements korrekt geladen und dargestellt werden.

Beispiel MainMenu.js:

```javascript
// import css from './mainMenu.css?inline';
import css from './mainMenu.css?inline';
```

#### Details/Trivia/Gut zu wissen:

- Was macht `?inline`?
  - `?inline` gibt das CSS als „default export“ zurück. Anders als bei `?raw` werden auch SVGs / Bilder geladen.  
    [https://vite.dev/guide/features#disabling-css-injection-into-the-page](https://vite.dev/guide/features#disabling-css-injection-into-the-page)
  - Das CSS wird dabei auch direkt mit in das HTML geladen anstatt als separate Datei angefordert zu werden (=Inlining).
  - `?raw` gibt das CSS als String zurück, allerdings werden SVGs/Bilder nicht geladen (Beobachtung im BayernAtlas).

- Wie beeinträchtigt der `?inline` Postfix den BayernAtlas mit Webpack?  
  Webpack ignoriert das Postfix und lädt die Styles als wäre dieser wie üblich.

### Environment Variablen

Environment Variablen benötigen ein Präfix (empfohlen von Vite). Env-Variablen können in der Applikation nicht mit `process.env.ENV_VARIABLE` angesteuert werden. Jegliches Vorkommen sollte wie folgt abgeändert werden: `import.meta.env.PRÄFIX_ENV_VARIABLE`.

Beispiel ProcessConfigService.js:

```javascript
// removes the need to replace process.env everywhere...
let process = { env: import.meta.env };
this._properties = new Map();
this._properties.set('RUNTIME_MODE', window?.ba_externalConfigProperties?.BA_NODE_ENV ?? process.env.BA_NODE_ENV);
```

#### Details/Trivia/Gut zu wissen:

- Präfix ist einstellbar:  
  Ein Präfix kann in der `vite.config.js` mit `envPrefix: 'BA_'` konfiguriert werden. Alternativ kann das Präfix ignoriert werden. Das hat aber mehr Arbeit zur Folge und muss in der Config-Datei zusätzlich zur `.env` Datei gepflegt werden:  
  [https://vite.dev/config/shared-options#envprefix](https://vite.dev/config/shared-options#envprefix)

```javascript
  define: {
	'import.meta.env.TEST_ENV_VAR': JSON.stringify(env.TEST_ENV_VAR)',
  }
```

### Hashing

Vite nutzt standardmäßig einen Content-Hash beim Bundling (siehe Bundling und Building).  
Der Hash ändert sich, sobald sich der Content einer Datei ändert, z.B. ein Bugfix in einem MvuElement. Demnach dürfte das „Leeren des Caches“ bei zukünftigen Versionen des BayernAtlas weiterhin funktionieren.

Für eine detailiertere Beschreibung bieten sich folgende Quellen an:  
[https://vite.dev/guide/assets](https://vite.dev/guide/assets)  
[https://rollupjs.org/configuration-options/#output-entryfilenames](https://rollupjs.org/configuration-options/#output-entryfilenames)

### Bundling und Building

Allgemein löst Vite Abhängigkeiten in den Entrypoints wie z.B. `index.html` automatisch auf. Das heißt alle Script- und CSS-Dateien, die in der `index.html` stehen, werden entsprechend nach „vite“ Art behandelt.  
[https://vite.dev/guide/#index-html-and-project-root](https://vite.dev/guide/#index-html-and-project-root)

#### Rollup Input – Output

Vite verwendet Rollup.js für das Bundling. Eine mögliche Konfiguration könnte z.B. so aussehen:

```javascript
return {
	/* ... */
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: {
				index: 'src/index.html',
				admin: 'src/admin.html',
				'js/main': 'src/main.js'
			},
			output: {
				entryFileNames: '[name]-[hash].js'
			}
		},
		minify: 'esbuild',
		terserOptions: {}
	}
	/* ... */
};
```

##### Wichtige Anmerkung:

Das Erstellen einer Konfiguration mit mehreren Einstiegspunkten funktioniert im BayernAtlas nicht reibungslos, da Vite den Injector nicht korrekt verarbeitet. Ein möglicher Workaround besteht darin, jeden Einstiegspunkt separat zu bauen. Das bedeutet, dass im obigen Beispiel admin: "src/admin.html" und index: "src/index.html" jeweils in einer eigenen Konfigurationsdatei gebaut werden.

Die `rollupOptions` sind erforderlich, sobald mehrere Einstiegspunkte existieren, ansonsten enthält der `dist` Ordner die entsprechenden HTML Dateien nicht. Da der BayernAtlas mehrere Einstiegspunkte besitzt (`admin.html` und `index.html`), ist es notwendig die `rollupOptions` wie im obigen Beispiel zu definieren.  
[https://rollupjs.org/configuration-options](https://rollupjs.org/configuration-options)  
[https://vite.dev/guide/build#multi-page-app](https://vite.dev/guide/build#multi-page-app)

Die `src/main.js` ist optional und kann auch weggelassen werden. Es demonstriert lediglich, dass der Output der Javascript Dateien ähnlich wie bei Webpack bearbeitbar ist. Hier wird die `main.js` gehashed in einem Sub-Ordner `js` abgelegt.

`rollupOptions.output` ist so zu lesen, dass lediglich `js` Dateien manipuliert werden. Das heißt die `index.html` und `admin.html` werden ohne Hash im `dist` Ordner erscheinen. Die Javascript Dateien werden jeweils mit einem Content-Hash (default wenn nicht angegeben) versehen.
