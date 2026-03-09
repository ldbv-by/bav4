# Vitest Migration

## Ausführen von Tests

Alle Tests ausführen:

`npx vitest`

Tests gefiltert ausführen:

`npx vitest [FILTER]` (z.B. `npx vitest utils/number`)

## NPM Dependencies:

Falls noch nicht geschehen, ,müssen folgende Pakete in das Projekt mit eingebunden werden (package.json:

`npm install -D vitest`

`npm install -D @vitest/browser-playwright`

## Erste Schritte - Migration

Nachdem ein entsprechender Branch für ein zu migrierendes Modul existiert, sollten die folgenden Schritte ausgeführt werden.

### Git Move Werkzeug

Immer bei einem neuen Migrations-Branch ausführen:
Mit `npm run gitmove [Test-Ordnerpfad]` verschiebt sich das zu testende Modul vom Test-Ordner zum Vitest-Ordner und staged die Änderung als "Rename" bei git.
Nachdem gitmove ausgeführt wurde, sollte der Stand committed werden bevor die Dateien weiter bearbeitet werden!

Beispiel mit dem Modul utils:
`npm run gitmove test/modules/utils`

### Aliase

Im Zuge der Migration sollten Ordnerpfade in den Testdateien mit den entsprechenden Aliase `@src` und `@test` ersetzt werden:

```javascript
/* My test file */

// import { TestUtils } from '../../../../test-utils';
// import { $injector } from '../../../../../src/injection';

// Above paths should look like this:
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
```

### css Inline

Manche Testdateien nutzen MvuElemente. Da diese oftmals css Dateien beinhalten müssen dessen Pfade mit einem `.css?inline` ausgestattet werden um korrekt von vitest interpretiert zu werden.

```javascript
/* Example ElevationProfile.js */

// import css from './elevationProfile.css';
import css from './elevationProfile.css?inline';
```

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
// Create Spy

/** Jasmine **/
const mySpy = jasmine.createSpy();
const myNamedSpy = jasmine.createSpy('myName');

/** Vitest **/
const mySpy = vi.fn();
const myNamedSpy = vi.fn().mockName('myName');

// Property Spy

/** Jasmine **/
spyOnProperty(event, 'target', 'get').and.returnValue('fake value');

/** Vitest **/
vi.spyOn(spiedObject, 'property', 'get').mockReturnValue('fake value');

// Function Spy

/** Jasmine **/
spyOn(spiedObject, 'myFunction').and.callFake(() => {});

/** Vitest **/
vi.spyOn(spiedObject, 'myFunction').mockImplementation(() => {});
```

#### Beispiele zum Migrieren von Jasmine Spies zu Vitest

Das Standardverhalten eines Vitest Spies ruft die ausspionierte Methode auf, während Jasmine standardmäßig keinen Aufruf erzeugt:

```javascript
// method execution spy:
/** Jasmine **/
spyOn(spiedObject, 'myFunction').and.callThrough();

/** Vitest **/
vi.spyOn(spiedObject, 'myFunction');

// "do nothing" spy:
/** Jasmine **/
spyOn(spiedObject, 'myFunction');

/** Vitest **/
vi.spyOn(spiedObject, 'myFunction').mockImplementation(() => {});
```

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

Manchmal möchte man wissen, ob ein bestimmter Abruf von Parametern erfolgt ist:

```javascript
/** Jasmine **/
const args = 'myArgs';
const spy = vi.spyOn(instanceUnderTest, 'myMethod').withArgs(argument).and.callThrough();
expect(spy).toHaveBeenCalledTimes(2);

/** Vitest **/
const spy = vi.spyOn(instanceUnderTest, 'myMethod');

expect(spy).toHaveBeenCalledTimes(2);
expect(spy.mock.calls[0]).toEqual([argument]);
expect(spy.mock.calls[1]).toEqual([argument]);
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
