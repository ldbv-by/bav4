import { $injector } from '@src/injection';
import { BvvPredefinedConfigurationService, PredefinedConfiguration } from '@src/services/PredefinedConfigurationService';
import { initialState as timeTravelInitialState, timeTravelReducer } from '@src/store/timeTravel/timeTravel.reducer';
import { TestUtils } from '@test/test-utils';
import { initialState as layersInitialState, layersReducer } from '@src/store/layers/layers.reducer';
import { addLayer } from '@src/store/layers/layers.action';
import { openSlider } from '@src/store/timeTravel/timeTravel.action';

describe('PredefinedConfiguration', () => {
	it('provides an enum of all predefined configurations', () => {
		expect(Object.keys(PredefinedConfiguration).length).toBe(2);
		expect(Object.isFrozen(PredefinedConfiguration)).toBe(true);
		expect(PredefinedConfiguration.DISPLAY_TIME_TRAVEL).toBe('display_time_travel');
		expect(PredefinedConfiguration.LAYER_EXCLUSIVE_VISIBLE).toBe('layer_exclusive_visible');
	});
});

describe('BvvPredefinedConfigurationService', () => {
	let store;
	const windowMock = { addEventListener() {}, removeEventListener() {} };
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

		$injector.registerSingleton('EnvironmentService', {
			getWindow: () => windowMock
		});
		return new BvvPredefinedConfigurationService();
	};

	describe('DISPLAY_TIME_TRAVEL', () => {
		const timeTravelGeoResourceId = 'zeitreihe_tk';

		it('adds the time travel GeoResource and opens the slider', async () => {
			const instanceUnderTest = setup();

			addLayer('foo');

			instanceUnderTest.apply(PredefinedConfiguration.DISPLAY_TIME_TRAVEL);

			expect(store.getState().layers.active).toHaveLength(2);
			expect(store.getState().layers.active[1].id).toEqual(timeTravelGeoResourceId);
			expect(store.getState().timeTravel.active).toBe(true);
		});

		it('ensures the visibility of all layers referencing the time travel GeoResource', async () => {
			const instanceUnderTest = setup();

			addLayer(timeTravelGeoResourceId, { visible: false });
			addLayer('foo', { geoResourceId: timeTravelGeoResourceId, visible: false });

			instanceUnderTest.apply(PredefinedConfiguration.DISPLAY_TIME_TRAVEL);

			expect(store.getState().layers.active).toHaveLength(2);
			expect(store.getState().layers.active[0].geoResourceId).toEqual(timeTravelGeoResourceId);
			expect(store.getState().layers.active[0].visible).toBe(true);
			expect(store.getState().layers.active[1].geoResourceId).toEqual(timeTravelGeoResourceId);
			expect(store.getState().layers.active[1].visible).toBe(true);
			expect(store.getState().timeTravel.active).toBe(true);
		});

		it('does NOT display the time travel GeoResource when already present', async () => {
			const instanceUnderTest = setup();

			addLayer(timeTravelGeoResourceId);
			openSlider();

			instanceUnderTest.apply(PredefinedConfiguration.DISPLAY_TIME_TRAVEL);

			expect(store.getState().layers.active).toHaveLength(1);
			expect(store.getState().layers.active[0].id).toEqual(timeTravelGeoResourceId);
			expect(store.getState().timeTravel.active).toBe(true);
		});
	});

	describe('LAYER_EXCLUSIVE_VISIBLE', () => {
		it('sets the visibility of a specified layer exclusively', () => {
			const instanceUnderTest = setup();

			addLayer('foo_baseLayer');
			addLayer('bar');
			addLayer('highlight_me');
			addLayer('baz');

			expect(store.getState().layers.active).toHaveLength(4);
			expect(store.getState().layers.active[0].id).toEqual('foo_baseLayer');
			expect(store.getState().layers.active[1].id).toEqual('bar');
			expect(store.getState().layers.active[2].id).toEqual('highlight_me');
			expect(store.getState().layers.active[3].id).toEqual('baz');

			instanceUnderTest.apply(PredefinedConfiguration.LAYER_EXCLUSIVE_VISIBLE, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].visible).toBe(true);
			expect(store.getState().layers.active[1].visible).toBe(false);
			expect(store.getState().layers.active[2].visible).toBe(true);
			expect(store.getState().layers.active[3].visible).toBe(false);
		});

		it('resets the visibility of all layer', () => {
			const instanceUnderTest = setup();

			addLayer('foo_baseLayer');
			addLayer('bar');
			addLayer('highlight_me');
			addLayer('baz');

			expect(store.getState().layers.active).toHaveLength(4);
			expect(store.getState().layers.active[0].id).toEqual('foo_baseLayer');
			expect(store.getState().layers.active[1].id).toEqual('bar');
			expect(store.getState().layers.active[2].id).toEqual('highlight_me');
			expect(store.getState().layers.active[3].id).toEqual('baz');

			instanceUnderTest.apply(PredefinedConfiguration.LAYER_EXCLUSIVE_VISIBLE, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].visible).toBe(true);
			expect(store.getState().layers.active[1].visible).toBe(false);
			expect(store.getState().layers.active[2].visible).toBe(true);
			expect(store.getState().layers.active[3].visible).toBe(false);

			instanceUnderTest.apply(PredefinedConfiguration.LAYER_EXCLUSIVE_VISIBLE, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].visible).toBe(true);
			expect(store.getState().layers.active[1].visible).toBe(true);
			expect(store.getState().layers.active[2].visible).toBe(true);
			expect(store.getState().layers.active[3].visible).toBe(true);
		});

		it('does NOTHING for an invalid layerId', () => {
			const instanceUnderTest = setup();

			addLayer('foo_baseLayer');
			addLayer('bar');
			addLayer('baz');

			expect(store.getState().layers.active).toHaveLength(3);
			expect(store.getState().layers.active[0].id).toEqual('foo_baseLayer');
			expect(store.getState().layers.active[1].id).toEqual('bar');
			expect(store.getState().layers.active[2].id).toEqual('baz');

			instanceUnderTest.apply(PredefinedConfiguration.LAYER_EXCLUSIVE_VISIBLE, { id: 'some' });

			expect(store.getState().layers.active[0].visible).toBe(true);
			expect(store.getState().layers.active[1].visible).toBe(true);
			expect(store.getState().layers.active[2].visible).toBe(true);
		});
	});
});
