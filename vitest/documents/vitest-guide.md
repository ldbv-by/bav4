# Vitest Migration

## NPM Dependencies:

Falls noch nicht geschehen, ,müssen folgende Pakete in das Projekt mit eingebunden werden (package.json:

`npm install -D vitest`

`npm install -D @vitest/browser-playwright`

## Angular CLI Tool (Jasmine -> Vitest)

### Warum?

Angular bietet ein Tool an, mit dessen Hilfe Tests von Jasmine nach Vitest transformiert werden. Das Tool funktioniert leider nicht in jedem Fall und daher muss händisch nachgebessert bzw. nachgeprüft werden. Trotzdem ist das Tool eine super Erleichterung um stumpfes Copy-Pasting zu reduzieren.

### Setup

Um das Angular-Tool zu nutzen wird ein Angular Projekt benötigt, im Folgenden wird beschrieben wie das Projekt aufgesetzt werden muss:

Anmerkung: Angular installiert sich als Default Global im System (`npm install -g`)

1. Terminal oder VS Code öffnen
2. Angular installieren `npm install -g @angular/cli` - (bzw Lokal: `npm install @angular/cli`)
3. `ng new <project-name>` bzw. `npx ng new <project-name` wenn Lokal.
4. Style: CSS
5. SSR - Nein
6. AI - None
7. In das Projektverzeichnis wechseln und die package.json öffnen
8. Im `scripts` Block folgenden Eintrag hinzufügen: <br>`"migrate": "ng g @schematics/angular:refactor-jasmine-vitest --include='src/test-migration' --file-suffix='.test.js'"`
9. Im `src` Verzeichnis des Angular Projektes einen Ordner Namens `test-migration` erstellen.

Das Tool kann im Angular Projekt jetzt mit `npm run migrate` aufgerufen werden.

### Funktionsweise bzw. Mögliches Vorgehen

Idealerweise nicht alle BayernAtlas Tests auf einmal in das Tool ziehen (würde aber funktionieren :D), sondern besser Modulweise vorgehen.

1. Wenn man Test-Dateien vom BayernAtlas in das `test-migration` Verzeichnis des Angular Projektes legt und anschließend `npm run migrate` aufruft werden die Test-Dateien von Jasmine nach Vitest konvertiert. Diese Konvertierung funktioniert leider nicht fehlerlos und muss vorallem bei Spies nachgebessert werden.

2. Nach der Konvertierung die Test-Dateien vom `test-migration` zurück in den BayernAtlas schieben (ggf. Dateien backupen) und mögliche Fehler in den konvertierten Test-Dateien anpassen.

### Troubleshooting

#### Das Angular Tool funktioniert nicht - Cannot read properties of undefined (reading 'kind')

Dieser Fehler tritt auf weil manche Testdateien im BayernAtlas weil diese folgenden Code beinhalten:

```javascript
// BayernAtlas contains sth like this:
spyOn(something, 'getValue').and.throwError();

// Fix to work with Tool:
spyOn(something, 'getValue').and.throwError('');
```

Allgemein bedeutet diese Fehlermeldung, dass irgendeine Test-Datei einen Fehler beinhaltet. Falls das nichts hilft muss leider nach Auschlussverfahren jede Datei überprüft werden oder man passt den Test manuell an :).

## Testen mit Vitest

Das Testen mit Vitest ist im Assertion Style sehr ähnlich zu Jasmine. Die größten Unterschiede sind bei den Clocks, Spies und Mocks zu finden.

### Hilfreiche Ressourcen

[Vitest Expect API](https://vitest.dev/api/expect.html)

[Vitest Spies und Mocks](https://vitest.dev/api/mock.html)

[Vitest Test Filtering](https://vitest.dev/guide/filtering.html)

### Vitest Suite

Die Suite ist ähnlich aufgebaut wie bei jasmine. Wir können weiterhin wie gewohnt `describe` und `it` Blöcke verwenden. Die Art und Weise, wie man Blöcke aus Debugging Gründen isolieren kann, unterscheidet sich wie folgt:

```javascript
	it.skip(() => {}); // equal to jasmine.xit(() => {})
	it.only(() => {}); // equal to jasmine.fit(() => {})

	// It is also possible to use this feature on a describe block:
	describe.skip(() {});
	describe.only(() {});
```

### Expects / Assertions

Expects in Vitest funktionieren sehr ähnlich zu Jasmine. Zu beachten ist, dass Jasmine ein paar mehr Hilfsfunktionen als Vitest anbietet:

```javascript
it('tests the world', () => {
	/* ... */
	expect(myBool).toBeTrue(); // Jasmine Style
	expect(myBool).toBe(true); // Vitest Style

	expect(myBool).toBeFalse(); // Jasmine Style
	expect(myBool).toBe(false); // Vitest Style

	expect(mayArray).toHaveSize(10); // Jasmine Style
	expect(mayArray).toHaveLength(10); // Vitest Style
});
```

### Spies & Mocks

#### Erstellen von Spies

```javascript
// Create Spy (like jasmine.createSpy())
const mySpy = vi.fn();

// Property Spy:
vi.spyOn(spiedObject, 'property', 'get').mockReturnValue('fake value');

// Function Spy:
vi.spyOn(spiedObject, 'myFunction').mockImplementation(() => {});
```

#### Beispiele zum Migrieren von Jasmine Spies zu Vitest

Will man einen Wert zurückgeben, dann lässt sich das wie folgt realisieren:

```javascript
/** Jasmine **/
spyOn(topicObject, 'getTopics').and.returnValue(10);
// for async methods
spyOn(topicObject, 'getTopicsAsync').and.resolveValue(10);
spyOn(topicObject, 'getTopicsAsync').and.rejectValue(new Error('Async Error'));

/** Vitest **/
vi.spyOn(topicObject, 'getTopics').mockReturnValue(10);
// for async methods
vi.spyOn(topicObject, 'getTopicsAsync').mockResolvedValue(10);
vi.spyOn(topicObject, 'getTopicsAsync').mockRejectedValue(new Error('Async Error'));
```

Bei Spies ist Vitest simpler aufgebaut als Jasmine und bietet daher Methoden wie `jasmine.spy.withArgs` nicht an. Allerdings lässt sich diese Funktionsweise mit Vitest wie folgt abbilden:

```javascript
/** Jasmine **/
spyOn(geoResourceServiceMock, 'byId').withArgs('geoResourceId@otherLayerId').and.returnValue({ label: 'Another Resource' });

/** Vitest **/
vi.spyOn(geoResourceServiceMock, 'byId').mockImplementation((arg) => {
	if (arg === 'geoResourceId@otherLayerId') {
		return { label: 'Another Resource' };
	}
	return null;
});
```

Wird erwartet, dass eine Funktion eine Exception werfen soll, dann kann dies wie folgt umgesetzt werden:

```javascript
/** Jasmine **/
spyOn(configService, 'getValue').and.throwError('My Error');

/** Vitest **/
vi.spyOn(configService, 'getValue').mockImplementation(() => {
	throw new Error('My Error');
});
```

#### Hilfreiche Links

Detailiertere Informationen zum Erstellen von Spies kann hier nachgelesen werden:

[Vitest Spy Beispiele](https://vitest.dev/guide/mocking)

[Vitest API - Mocks]('https://vitest.dev/api/mock.html')

### Asynchronität

#### Expect Async

```javascript
// Jasmine
await expectAsync(credentials.authenticate()).toBeResolvedTo(true);
await expectAsync(credentials.authenticate()).toBeRejected();
await expectAsync(credentials.authenticate()).toBeRejectedWithError('Error');

// Vitest
await expect(credentials.authenticate()).resolves.toEqual(true);
await expect(credentials.authenticate()).rejects.toThrow();
await expect(credentials.authenticate()).rejects.toThrow('Error');
```

#### Clocks

Vitest bietet auch die Möglichkeit an Clocks zu erstellen und ersetzt damit alle "timout" basierten Tests.

```javascript
beforeEach(function () {
	// Jasmine
	jasmine.clock().install();

	// Vitest
	vi.useFakeTimers();
});

afterEach(function () {
	// Jasmine
	jasmine.clock().uninstall();

	// Vitest
	vi.useRealTimers(); // Discards other timers automatically...
});

it('Shows how to use Clocks', async () => {
	jasmine.clock().tick(200); // Jasmine
	vi.advanceTimersByTime(200); // Vitest

	jasmine.clock().mockDate(); // Jasmine
	vi.setSystemTime(new Date()); // Vitest
});
```

## Vitest Konfiguration

### Vite & Vitest

Die Config-Dateien von Vitest können individuell erstellt werden. Man könnte alle Konfigurationseinstellungen in einer Datei beschreiben, aber auch mehrere Dateien nutzen. Vitest nutzt per Default eine Datei Namens `vitest.config.js` und als Fallback `vite.config.js`. Die gewählte Config Datei kann auch via Terminal spezifiziert werden.

Die Konfigurationsdatei von Vite kann auch für Vitest verwendet werden:
Vitest spezifische Konfiguration wird in einem `test: {}` Block geschrieben.

```javascript
export default defineConfig({
	/** ...Some Vite Config above ... */

	// The test block describes how vitest is configured You can either add it in the Vite
	// or Vitest file.
	test: {
		include: ['./test/**/*.test.js'],
		globals: true,
		watch: false,
		css: {
			include: /.+/
		},
		browser: {
			provider: playwright(),
			enabled: true,
			headless: true,
			// at least one instance is required
			instances: [
				{ browser: 'chromium' }
				{ browser: "firefox" },
				{ browser: "webkit" },
			],
			screenshotFailures: false
		}
	},

	resolve: {
		alias: {
			'@src': resolve(__dirname, './src'),
			'@test': resolve(__dirname, './test')
		}
	}
});
```
