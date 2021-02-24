import { measurementReducer } from '../../../../src/modules/map/store/measurement.reducer';
import { MEASUREMENT_LAYER_ID, registerMeasurementObserver } from '../../../../src/modules/map/store/measurement.observer';

import { activate, deactivate } from '../../../../src/modules/map/store/measurement.action';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';



describe('measurementObserver', () => {

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			measurement: measurementReducer,
			layers: layersReducer,
		});
		registerMeasurementObserver(store);
		return store;
	};


	it('adds ore remove the measuremt layer', () => {
		const store = setup();
		
		activate();

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].id).toBe(MEASUREMENT_LAYER_ID);
		
		deactivate();
		
		expect(store.getState().layers.active.length).toBe(0);
	});
});