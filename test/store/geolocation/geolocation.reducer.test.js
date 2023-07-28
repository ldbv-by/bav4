import { activate, deactivate, setAccuracy, setDenied, setPosition, setTracking } from '../../../src/store/geolocation/geolocation.action';
import { geolocationReducer } from '../../../src/store/geolocation/geolocation.reducer';
import { TestUtils } from '../../test-utils.js';

describe('geolocationReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			geolocation: geolocationReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().geolocation.active).toBeFalse();
		expect(store.getState().geolocation.denied).toBeFalse();
		expect(store.getState().geolocation.tracking).toBeFalse();
		expect(store.getState().geolocation.accuracy).toBeNull();
		expect(store.getState().geolocation.position).toBeNull();
	});

	it("changes the 'active' property", () => {
		const store = setup();

		activate();

		expect(store.getState().geolocation.active).toBeTrue();

		deactivate();

		expect(store.getState().geolocation.active).toBeFalse();
	});

	it("changes the 'denied' property", () => {
		const store = setup();

		setDenied(true);

		expect(store.getState().geolocation.denied).toBeTrue();

		setDenied(false);

		expect(store.getState().geolocation.denied).toBeFalse();
	});

	it("changes the 'tracking' property", () => {
		const store = setup();

		setTracking(true);

		expect(store.getState().geolocation.tracking).toBeTrue();

		setTracking(false);

		expect(store.getState().geolocation.tracking).toBeFalse();
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
