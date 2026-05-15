import { $injector } from '@src/injection';
import { BvvPredefinedConfigurationService, PredefinedConfiguration } from '@src/services/PredefinedConfigurationService';
import { initialState as timeTravelInitialState, timeTravelReducer } from '@src/store/timeTravel/timeTravel.reducer';
import { TestUtils } from '@test/test-utils';
import { initialState as layersInitialState, layersReducer } from '@src/store/layers/layers.reducer';
import { addLayer, modifyLayer } from '@src/store/layers/layers.action';
import { openSlider } from '@src/store/timeTravel/timeTravel.action';

describe('PredefinedConfiguration', () => {
	it('provides an enum of all predefined configurations', () => {
		expect(Object.keys(PredefinedConfiguration).length).toBe(2);
		expect(Object.isFrozen(PredefinedConfiguration)).toBe(true);
		expect(PredefinedConfiguration.DISPLAY_TIME_TRAVEL).toBe('display_time_travel');
		expect(PredefinedConfiguration.HIGHLIGHT_LAYER).toBe('highlight_layer');
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

	describe('HIGHLIGHT_LAYER', () => {
		it('highlights a specified layer by reducing opacity of all other layers ', () => {
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

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(0.2);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(0.2);
		});

		it('restores the opacity after highlight of a layer is deactivated', () => {
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

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(0.2);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(0.2);

			// deactivate
			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(1);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(1);
		});

		it('uses opacity of currently added layer and restores the opacity of others after highlight is deactivated', () => {
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

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(0.2);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(0.2);

			addLayer('is_added_intermediate');
			modifyLayer('is_added_intermediate', { opacity: 0.72 });

			// deactivate
			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(1);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(1);
			expect(store.getState().layers.active[4].opacity).toEqual(0.72);
		});

		it('restores custom opacity after highlight of a layer is deactivated', () => {
			const instanceUnderTest = setup();

			addLayer('foo_baseLayer');
			addLayer('bar');
			addLayer('highlight_me');
			addLayer('baz');

			modifyLayer('bar', { opacity: 0.42 });
			expect(store.getState().layers.active).toHaveLength(4);
			expect(store.getState().layers.active[0].id).toEqual('foo_baseLayer');
			expect(store.getState().layers.active[1].id).toEqual('bar');
			expect(store.getState().layers.active[1].opacity).toEqual(0.42);

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(0.2);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(0.2);

			// deactivate
			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(0.42);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(1);
		});

		it('uses the custom layer opacity instead of the defined reduced opacity', () => {
			const instanceUnderTest = setup();

			addLayer('foo_baseLayer');
			addLayer('bar_custom_small_opacity');
			addLayer('highlight_me');
			addLayer('baz');

			modifyLayer('bar_custom_small_opacity', { opacity: 0.1 });
			expect(store.getState().layers.active).toHaveLength(4);
			expect(store.getState().layers.active[0].id).toEqual('foo_baseLayer');
			expect(store.getState().layers.active[1].id).toEqual('bar_custom_small_opacity');
			expect(store.getState().layers.active[2].id).toEqual('highlight_me');
			expect(store.getState().layers.active[3].id).toEqual('baz');

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(0.1);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
			expect(store.getState().layers.active[3].opacity).toEqual(0.2);
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

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'some' });

			expect(store.getState().layers.active[0].opacity).toEqual(1);
			expect(store.getState().layers.active[1].opacity).toEqual(1);
			expect(store.getState().layers.active[2].opacity).toEqual(1);
		});

		it('registers an "beforeunload" event listener', () => {
			const addEventListenerSpy = vi.spyOn(windowMock, 'addEventListener').mockImplementation(() => {});
			const removeEventListenerSpy = vi.spyOn(windowMock, 'removeEventListener').mockImplementation(() => {});
			const mockEvent = {
				returnValue: null,
				preventDefault: () => {}
			};
			const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault').mockImplementation(() => {});

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

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

			const beforeunloadFn = addEventListenerSpy.mock.calls[0][1];
			beforeunloadFn(mockEvent);

			expect(mockEvent.returnValue).toBe('string');
			expect(preventDefaultSpy).toHaveBeenCalled();

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
		});

		it('removes last event listener before register a new "beforeunload" event listener', () => {
			const addEventListenerSpy = vi.spyOn(windowMock, 'addEventListener').mockImplementation(() => {});
			const removeEventListenerSpy = vi.spyOn(windowMock, 'removeEventListener').mockImplementation(() => {});
			const mockEvent = {
				returnValue: null,
				preventDefault: () => {}
			};
			const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault').mockImplementation(() => {});

			const instanceUnderTest = setup();

			addLayer('foo_baseLayer');
			addLayer('bar');
			addLayer('highlight_me');
			addLayer('highlight_me_too');

			expect(store.getState().layers.active).toHaveLength(4);
			expect(store.getState().layers.active[0].id).toEqual('foo_baseLayer');
			expect(store.getState().layers.active[1].id).toEqual('bar');
			expect(store.getState().layers.active[2].id).toEqual('highlight_me');
			expect(store.getState().layers.active[3].id).toEqual('highlight_me_too');

			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me' });

			expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

			const beforeunloadFn = addEventListenerSpy.mock.calls[0][1];
			beforeunloadFn(mockEvent);

			expect(mockEvent.returnValue).toBe('string');
			expect(preventDefaultSpy).toHaveBeenCalled();

			addEventListenerSpy.mockReset();
			instanceUnderTest.apply(PredefinedConfiguration.HIGHLIGHT_LAYER, { id: 'highlight_me_too' });

			expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
			expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
		});
	});
});
