import { measurementReducer } from '../../../../src/modules/map/store/measurement.reducer';
import { activate, deactivate } from '../../../../src/modules/map/store/measurement.action';
import { TestUtils } from '../../../test-utils.js';



describe('measurementReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			measurement: measurementReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().measurement.active).toBeFalse();
	});


	it('updates the active property', () => {
		const store = setup();

		activate();

		expect(store.getState().measurement.active).toBeTrue();

		deactivate();

		expect(store.getState().measurement.active).toBeFalse();
	});
});