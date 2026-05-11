import { activate, deactivate, setAccuracy, setDenied, setPosition, setTracking } from '@src/store/geolocation/geolocation.action';
import { geolocationReducer } from '@src/store/geolocation/geolocation.reducer';
import { TestUtils } from '@test/test-utils.js';

describe('geolocationReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			geolocation: geolocationReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().geolocation.active).toBe(false);
		expect(store.getState().geolocation.denied).toBe(false);
		expect(store.getState().geolocation.tracking).toBe(false);
		expect(store.getState().geolocation.accuracy).toBeNull();
		expect(store.getState().geolocation.position).toBeNull();
	});

	it("changes the 'active' property", () => {
		const store = setup();

		activate();

		expect(store.getState().geolocation.active).toBe(true);

		deactivate();

		expect(store.getState().geolocation.active).toBe(false);
	});

	it("changes the 'denied' property", () => {
		const store = setup();

		setDenied(true);

		expect(store.getState().geolocation.denied).toBe(true);

		setDenied(false);

		expect(store.getState().geolocation.denied).toBe(false);
	});

	it("changes the 'tracking' property", () => {
		const store = setup();

		setTracking(true);

		expect(store.getState().geolocation.tracking).toBe(true);

		setTracking(false);

		expect(store.getState().geolocation.tracking).toBe(false);
	});

	it("changes the 'accuracy' property", () => {
		const store = setup();

		setAccuracy(42);

		expect(store.getState().geolocation.accuracy).toBe(42);
	});

	it("changes the 'position' property", () => {
		const store = setup();

		setPosition([38, 57]);

		expect(store.getState().geolocation.position).toEqual([38, 57]);
	});
});
