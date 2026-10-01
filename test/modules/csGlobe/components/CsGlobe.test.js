import { OlMap } from '@src/modules/olMap/components/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '@test/test-utils';
import { positionReducer } from '@src/store/position/position.reducer';
import { $injector } from '@src/injection';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { WmsGeoResource } from '@src/domain/geoResources';

window.customElements.define(CsGlobe.tag, CsGlobe);

describe('CsGlobe', () => {
	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialZoomLevel = 10;
	const initialRotationValue = 0.5;
	const longPressDelay = 300;
	const minZoomLevel = 5;
	const maxZoomLevel = 21;
	const id0 = 'id0';
	const id1 = 'id1';
	const geoResourceId0 = 'geoResourceId0';
	const geoResourceId1 = 'geoResourceId1';

	const mapServiceStub = {
		getMinimalRotation() {
			return 0.05;
		},
		getMinZoomLevel() {
			return minZoomLevel;
		},
		getMaxZoomLevel() {
			return maxZoomLevel;
		},
		getScaleLineContainer() {},
		getVisibleViewport() {}
	};

	const geoResourceServiceStub = {
		byId(id) {
			switch (id) {
				case 'geoResourceId0':
					return new WmsGeoResource(id, 'Label0', 'https://something0.url', 'layer0', 'image/png');
				case 'geoResourceId1':
					return new WmsGeoResource(id, 'Label1', 'https://something1.url', 'layer1', 'image/png');
			}
			return null;
		},
		addOrReplace() {}
	};

	let store;

	const setup = (state) => {
		const defaultState = {
			position: {
				zoom: initialZoomLevel,
				center: initialCenter,
				rotation: initialRotationValue,
				fitRequest: null,
				fitLayerRequest: null
			}
		};
		const combinedState = {
			...defaultState,
			...state
		};

		store = TestUtils.setupStoreAndDi(combinedState, {
			position: positionReducer,
			layers: layersReducer
		});

		$injector
			.registerSingleton('MapService', mapServiceStub)
			.registerSingleton('GeoResourceService', geoResourceServiceStub)
			.registerSingleton('CsLayerService', layerServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(CsGlobe.tag);
	};

	describe('when instantiated', () => {
		it('contains a model with default values', async () => {
			await setup();
			const model = new OlMap().getModel();

			expect(model).toEqual({
				zoom: null,
				center: null,
				rotation: null,
				fitRequest: null,
				fitLayerRequest: null,
				layers: []
			});
		});
	});

	describe('when initialized', () => {
		it('configures the map and adds a div which contains the ol-map', async () => {});
	});

	describe('when disconnected', () => {
		it('removes all observers and resets the map', async () => {});
	});

	describe('when orientation changes', () => {
		it('updates the map size', async () => {});
	});

	describe('view events', () => {
		describe('rotation:change', () => {
			it('updates the liveRotation property of the position state', async () => {});
		});

		describe('change:center', () => {
			it('updates the liveCenter property of the position state', async () => {});
		});

		describe('change:resolution', () => {
			it('updates the liveZoom property of the position state', async () => {});
		});
	});

	describe('map move events', () => {
		describe('movestart', () => {
			it("updates the 'movestart' property in map store", async () => {});

			it("updates the 'beingMoved' property in pointer store", async () => {});
		});

		describe('moveend', () => {
			it("updates the 'moveend' property in map store", async () => {});

			it('updates the position state properties', async () => {});
		});
	});

	describe('olView management', () => {
		describe('position', () => {
			it('updates zoom and center', async () => {});

			it('updates rotation', async () => {});
		});

		it('does nothing when view already in place', async () => {});

		it('fits to an extent', async () => {});

		it('fits to an extent with custom maxZoom option', async () => {});

		it('fits to an extent with custom useVisibleViewport option', async () => {});

		it('fits to a vector layers extent', async () => {});

		it('fits to a vector layers extent with custom maxZoom option', async () => {});

		it('fits to vector layers extent with custom useVisibleViewport option', async () => {});

		it('does nothing when layer has no source', async () => {});

		it('does nothing when layer return NULL as source', async () => {});

		it('does nothing when layers source is not a vector source', async () => {});

		it("does nothing when source can't provide an extent", async () => {});

		it('does nothing when source provides an empty extent', async () => {});

		it('adds an olLayer resolving a GeoResourceFuture', async () => {});
	});
});
