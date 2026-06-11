import { BvvPredefinedConfigurationService, PredefinedConfiguration } from '@src/services/PredefinedConfigurationService';
import { initialState as timeTravelInitialState, timeTravelReducer } from '@src/store/timeTravel/timeTravel.reducer';
import { TestUtils } from '@test/test-utils';
import { initialState as layersInitialState, layersReducer } from '@src/store/layers/layers.reducer';
import { addLayer, removeLayer, SwipeAlignment } from '@src/store/layers/layers.action';
import { openSlider } from '@src/store/timeTravel/timeTravel.action';
import { $injector } from '@src/injection';
import { topicsReducer } from '@src/store/topics/topics.reducer';
import { modalReducer } from '@src/store/modal/modal.reducer';
import { toolsReducer } from '@src/store/tools/tools.reducer';
import { closeModal } from '@src/store/modal/modal.action';
import { Tools } from '@src/domain/tools.js';

describe('PredefinedConfiguration', () => {
	it('provides an enum of all predefined configurations', () => {
		expect(Object.keys(PredefinedConfiguration).length).toBe(2);
		expect(Object.isFrozen(PredefinedConfiguration)).toBe(true);
		expect(PredefinedConfiguration.DISPLAY_TIME_TRAVEL).toBe('display_time_travel');
	});
});

describe('BvvPredefinedConfigurationService', () => {
	let store;

	const topicsServiceMock = {
		default() {}
	};

	const setup = (state = {}) => {
		const initialState = {
			layers: layersInitialState,
			timeTravel: timeTravelInitialState,
			tools: {
				current: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			layers: layersReducer,
			timeTravel: timeTravelReducer,
			topics: topicsReducer,
			modal: modalReducer,
			tools: toolsReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('TopicsService', topicsServiceMock);
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

	describe('ADD_SECOND_LAYER_DIALOG', () => {
		const checkModal = () => {
			expect(store.getState().modal.active).toBe(true);
			expect(store.getState().modal.data.title).toBe('map_layerSwipeSlider_modal_title');
			const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElement.querySelectorAll('ba-layer-swipe-modal')).toHaveLength(1);
		};

		describe('existing layer is a base layer', () => {
			describe('the user selects a layer', () => {
				it('adds the selected layer as a second layer', async () => {
					const instanceUnderTest = setup();
					const geoResourceId0 = 'fooGrD';
					const geoResourceId1 = 'barGrID';
					vi.spyOn(topicsServiceMock, 'default').mockReturnValue({
						baseGeoRs: {
							fooBaseLayer: [geoResourceId0]
						}
					});

					addLayer('foo', { geoResourceId: geoResourceId0 });
					expect(store.getState().layers.active).toHaveLength(1);
					expect(store.getState().modal.active).toBe(false);

					instanceUnderTest.apply(PredefinedConfiguration.ADD_SECOND_LAYER_DIALOG);

					checkModal();

					// we simulate the layer selection of a the user via the BaseLayerSwitcher
					removeLayer('foo');
					addLayer('bar', { geoResourceId: geoResourceId1, zIndex: 0 });
					closeModal();

					expect(store.getState().layers.active).toHaveLength(2);
					expect(store.getState().layers.active[0].geoResourceId).toEqual(geoResourceId0);
					expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
					expect(store.getState().layers.active[1].geoResourceId).toEqual(geoResourceId1);
					expect(store.getState().layers.active[1].constraints.swipeAlignment).toEqual(SwipeAlignment.LEFT);
				});
			});

			describe('the user does NOT select a layer', () => {
				it('adds the same layer as a second layer', async () => {
					const instanceUnderTest = setup();
					const geoResourceId = 'fooGrD';
					vi.spyOn(topicsServiceMock, 'default').mockReturnValue({
						baseGeoRs: {
							fooBaseLayer: [geoResourceId]
						}
					});

					addLayer('foo', { geoResourceId: geoResourceId });
					expect(store.getState().layers.active).toHaveLength(1);
					expect(store.getState().modal.active).toBe(false);

					instanceUnderTest.apply(PredefinedConfiguration.ADD_SECOND_LAYER_DIALOG);

					checkModal();

					// the user closes the modal without a selecting a layer
					closeModal();

					expect(store.getState().layers.active).toHaveLength(2);
					expect(store.getState().layers.active[0].geoResourceId).toEqual(geoResourceId);
					expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
					expect(store.getState().layers.active[1].geoResourceId).toEqual(geoResourceId);
					expect(store.getState().layers.active[1].constraints.swipeAlignment).toEqual(SwipeAlignment.LEFT);
				});
			});
		});

		describe('existing layer is NOT a base layer', () => {
			describe('the user selects a layer', () => {
				it('adds the selected layers as a second layer', async () => {
					const instanceUnderTest = setup();
					const geoResourceId0 = 'fooGrD';
					const geoResourceId1 = 'barGrID';
					vi.spyOn(topicsServiceMock, 'default').mockReturnValue({
						baseGeoRs: {
							fooBaseLayer: ['anyOtherGr']
						}
					});

					addLayer('foo', { geoResourceId: geoResourceId0 });
					expect(store.getState().layers.active).toHaveLength(1);
					expect(store.getState().modal.active).toBe(false);

					instanceUnderTest.apply(PredefinedConfiguration.ADD_SECOND_LAYER_DIALOG);

					checkModal();

					// we simulate the layer selection of a the user via the BaseLayerSwitcher
					addLayer('bar', { geoResourceId: geoResourceId1, zIndex: 0 });
					closeModal();

					expect(store.getState().layers.active).toHaveLength(2);
					expect(store.getState().layers.active[0].geoResourceId).toEqual(geoResourceId0);
					expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
					expect(store.getState().layers.active[1].geoResourceId).toEqual(geoResourceId1);
					expect(store.getState().layers.active[1].constraints.swipeAlignment).toEqual(SwipeAlignment.LEFT);
				});
			});

			describe('the user does NOT select a layer', () => {
				it('does nothing', async () => {
					const instanceUnderTest = setup();
					const geoResourceId0 = 'fooGrD';
					vi.spyOn(topicsServiceMock, 'default').mockReturnValue({
						baseGeoRs: {
							fooBaseLayer: ['anyOtherGr']
						}
					});

					addLayer('foo', { geoResourceId: geoResourceId0 });
					expect(store.getState().layers.active).toHaveLength(1);
					expect(store.getState().modal.active).toBe(false);

					instanceUnderTest.apply(PredefinedConfiguration.ADD_SECOND_LAYER_DIALOG);

					checkModal();

					// the user closes the modal without a selecting a layer
					closeModal();

					expect(store.getState().layers.active).toHaveLength(1);
					expect(store.getState().layers.active[0].geoResourceId).toEqual(geoResourceId0);
					expect(store.getState().layers.active[0].constraints.swipeAlignment).toEqual(SwipeAlignment.NOT_SET);
				});
			});
		});

		it('does nothing when more than one layer is present', async () => {
			const instanceUnderTest = setup();
			addLayer('foo0');
			addLayer('foo1');
			expect(store.getState().layers.active).toHaveLength(2);
			expect(store.getState().modal.active).toBe(false);

			instanceUnderTest.apply(PredefinedConfiguration.ADD_SECOND_LAYER_DIALOG);

			expect(store.getState().layers.active).toHaveLength(2);
			expect(store.getState().modal.active).toBe(false);
		});

		it('does nothing when tool "COMPARE" is already active', async () => {
			const instanceUnderTest = setup({ tools: { current: Tools.COMPARE } });

			addLayer('foo');
			expect(store.getState().layers.active).toHaveLength(1);
			expect(store.getState().modal.active).toBe(false);

			instanceUnderTest.apply(PredefinedConfiguration.ADD_SECOND_LAYER_DIALOG);

			expect(store.getState().layers.active).toHaveLength(1);
			expect(store.getState().modal.active).toBe(false);
		});
	});
});
