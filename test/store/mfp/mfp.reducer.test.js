import { activate, deactivate, setMapSize, setScale } from '../../../src/store/mfp/mfp.action';
import { mfpReducer } from '../../../src/store/mfp/mfp.reducer';
import { TestUtils } from '../../test-utils';

describe('mfpReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			mfp: mfpReducer
		});
	};

	it('updates the active property', () => {
		const store = setup();

		activate();

		expect(store.getState().mfp.active).toBeTrue();

		deactivate();

		expect(store.getState().mfp.active).toBeFalse();
	});

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().mfp.active).toBeFalse();
		expect(store.getState().mfp.scale).toBeNull();
		expect(store.getState().mfp.mapSize).toBeNull();
	});

	it('updates the mapSize property', () => {
		const store = setup();

		setMapSize({ width: 21, height: 42 });

		expect(store.getState().mfp.mapSize).toEqual({ width: 21, height: 42 });
	});

	it('updates the scale property', () => {
		const store = setup();

		setScale(42);

		expect(store.getState().mfp.scale).toBe(42);
	});
});
