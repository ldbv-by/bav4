import { CsGlobe } from '@src/modules/csGlobe/components/CsGlobe';
import { TestUtils } from '@test/test-utils';
import { positionReducer } from '@src/store/position/position.reducer';
import { $injector } from '@src/injection';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Cartesian3 } from 'cesium';
import { calculateSpatialHeight } from '@src/modules/csGlobe/utils/csGlobeUtils';
import { expect } from 'vitest';

window.customElements.define(CsGlobe.tag, CsGlobe);

describe('CsGlobe', () => {
	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialZoomLevel = 10;
	const initialResolution = 100;
	const initialRotationValue = 0.5;
	const minZoomLevel = 5;
	const maxZoomLevel = 21;

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
		calcZoomLevel: () => {
			return initialZoomLevel;
		},
		calcResolution: () => {
			return initialResolution;
		},
		getScaleLineContainer() {},
		getVisibleViewport() {}
	};

	const csLayerServiceStub = {
		toCsLayer: () => {}
	};

	const coordinateServiceStub = {
		toLonLat: (coordinate) => toLonLat(coordinate),
		fromLonLat: (coordinate) => fromLonLat(coordinate)
	};

	const geoResourceServiceStub = {};

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
			.registerSingleton('CoordinateService', coordinateServiceStub)
			.registerSingleton('CsLayerService', csLayerServiceStub)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(CsGlobe.tag);
	};

	describe('when instantiated', () => {
		it('contains a model with default values', async () => {
			await setup();
			const model = new CsGlobe().getModel();

			expect(model).toEqual({
				zoom: null,
				center: null,
				layers: []
			});
		});
	});

	describe('when initialized', () => {
		it('configures the map and adds a div which contains the cs-globe', async () => {
			const element = await setup();
			const canvasWidth = element._viewer.canvas.clientWidth;
			const projectedInitialCenter = toLonLat(initialCenter);
			const initialPosition = Cartesian3.fromDegrees(
				projectedInitialCenter[0],
				projectedInitialCenter[1],
				calculateSpatialHeight(initialResolution, canvasWidth)
			);
			const position = element._viewer.camera.position;

			expect(element.shadowRoot.querySelector('#cs-globe')).not.toBeNull();
			expect(position).toEqual(initialPosition);
		});

		it('does not reinitialize the viewer', async () => {
			await setup();
			const csGlobe = new CsGlobe();
			csGlobe.onAfterRender(false);

			expect(csGlobe._viewer).toBe(undefined);
		});
	});

	describe('globe move events', () => {
		describe('moveend', () => {
			it('updates the position state properties', async () => {
				const element = await setup();
				const canvasWidth = element._viewer.canvas.clientWidth;
				const spatialHeight = calculateSpatialHeight(300, canvasWidth);
				const projectedCenter = toLonLat([50, 50]);
				const newPosition = Cartesian3.fromDegrees(projectedCenter[0], projectedCenter[1], spatialHeight);

				vi.spyOn(mapServiceStub, 'calcZoomLevel').mockReturnValue(20);
				element._viewer.camera.position = newPosition;
				element._viewer.camera.moveEnd.raiseEvent();

				expect(store.getState().position.center).toEqual([50, 50]);
				expect(store.getState().position.zoom).toBe(20);
			});
		});
	});
});
