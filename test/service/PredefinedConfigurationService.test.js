/* eslint-disable no-undef */
import { BvvPredefinedConfigurationService, PredefinedConfiguration } from '../../src/services/PredefinedConfigurationService';
import { initialState as timeTravelInitialState, timeTravelReducer } from '../../src/store/timeTravel/timeTravel.reducer';
import { TestUtils } from '../test-utils';
import { initialState as layersInitialState, layersReducer } from '../../src/store/layers/layers.reducer';
import { addLayer } from '../../src/store/layers/layers.action';
import { openSlider } from '../../src/store/timeTravel/timeTravel.action';

describe('PredefinedConfiguration', () => {
	it('provides an enum of all predefined configurations', () => {
		expect(Object.keys(PredefinedConfiguration).length).toBe(1);
		expect(Object.isFrozen(PredefinedConfiguration)).toBeTrue();
		expect(PredefinedConfiguration.DISPLAY_TIME_TRAVEL).toBe('display_time_travel');
	});
});

describe('BvvPredefinedConfigurationService', () => {
	let store;

	const setup = (state = {}) => {
		const initialState = {
			layers: layersInitialState,
			timeTravel: timeTravelInitialState,
			...state
		};
		store = TestUtils.setupStoreAndDi(initialState, {
			layers: layersReducer,
			timeTravel: timeTravelReducer
		});
		return new BvvPredefinedConfigurationService();
	};

	describe('DISPLAY_TIME_TRAVEL', () => {
		const timeTravelGeoResourceId = 'zeitreihe_tk';

		it('adds the time travel GeoResource and opens the slider', async () => {
			const instanceUnderTest = setup();

			addLayer('foo');

			instanceUnderTest.apply(PredefinedConfiguration.DISPLAY_TIME_TRAVEL);

			expect(store.getState().layers.active).toHaveSize(2);
			expect(store.getState().layers.active[1].id).toEqual(timeTravelGeoResourceId);
			expect(store.getState().timeTravel.active).toBeTrue();
		});

		it('does NOT display the time travel GeoResource when already present', async () => {
			const instanceUnderTest = setup();

			addLayer(timeTravelGeoResourceId);
			openSlider();

			instanceUnderTest.apply(PredefinedConfiguration.DISPLAY_TIME_TRAVEL);

			expect(store.getState().layers.active).toHaveSize(1);
			expect(store.getState().layers.active[0].id).toEqual(timeTravelGeoResourceId);
			expect(store.getState().timeTravel.active).toBeTrue();
		});
	});
});
