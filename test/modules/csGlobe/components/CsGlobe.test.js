import { $injector } from '@src/injection';
import { CsGlobe } from '@src/modules/csGlobe/components/CsGlobe';
import { calculateSpatialHeight } from '@src/modules/csGlobe/utils/csGlobeUtils';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { mapReducer } from '@src/store/map/map.reducer';
import { positionReducer } from '@src/store/position/position.reducer';
import { TestUtils } from '@test/test-utils';
import { createMockedViewerConfiguration } from '@test/webgl-stub-utils.js';
import { Cartesian3, Math as CesiumMath } from 'cesium';
import { fromLonLat, toLonLat } from 'ol/proj';
import { expect } from 'vitest';

window.customElements.define(CsGlobe.tag, CsGlobe);

describe('CsGlobe', () => {
	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialZoomLevel = 10;
	const initialResolution = 100;
	const initialRotationValue = 0.5;
	const minZoomLevel = 5;
	const maxZoomLevel = 21;

	const normalizeRotation = (rotation) => {
		while (rotation > Math.PI) {
			rotation -= 2 * Math.PI;
		}
		while (rotation < -Math.PI || Math.abs(rotation + Math.PI) < 1e-9) {
			rotation += 2 * Math.PI;
		}

		return rotation;
	};

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
			map: mapReducer,
			layers: layersReducer
		});

		$injector
			.registerSingleton('MapService', mapServiceStub)
			.registerSingleton('GeoResourceService', geoResourceServiceStub)
			.registerSingleton('CoordinateService', coordinateServiceStub)
			.registerSingleton('CsLayerService', csLayerServiceStub)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(CsGlobe.tag, {
			_viewerConfiguration: createMockedViewerConfiguration()
		});
	};

	describe('when instantiated', () => {
		it('contains a model with default values', async () => {
			await setup();
			const model = new CsGlobe().getModel();

			expect(model).toEqual({
				zoom: null,
				center: null,
				rotation: null,
				pitch: null,
				roll: null,
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
		describe('camera moveStart, moveEnd', () => {
			it('updates the position slice of state', async () => {
				const element = await setup();
				const canvasWidth = element._viewer.canvas.clientWidth;
				const spatialHeight = calculateSpatialHeight(300, canvasWidth);
				const projectedCenter = toLonLat([50, 50]);
				const newPosition = Cartesian3.fromDegrees(projectedCenter[0], projectedCenter[1], spatialHeight);
				const rotation = CesiumMath.toRadians(30);
				const pitch = CesiumMath.toRadians(50);
				const roll = CesiumMath.toRadians(70);

				vi.spyOn(mapServiceStub, 'calcZoomLevel').mockReturnValue(20);

				element._viewer.camera.setView({
					destination: newPosition,
					orientation: {
						heading: -rotation,
						pitch: pitch,
						roll: roll
					}
				});

				element._viewer.camera.moveEnd.raiseEvent();
				expect(store.getState().position.center).toEqual([50, 50]);
				expect(store.getState().position.zoom).toEqual(20);
				expect(normalizeRotation(store.getState().position.rotation)).toBeCloseTo(rotation);
				expect(store.getState().position.pitch).toBeCloseTo(pitch);
				expect(store.getState().position.roll).toBeCloseTo(roll);
			});

			it('updates map action slice of state on moveStart', async () => {
				const element = await setup();
				const viewer = element._viewer;

				viewer.camera.moveStart.raiseEvent();
				expect(store.getState().map.moveStart.payload).toBe('movestart');
				expect(store.getState().map.beingMoved).toBe(true);
			});

			it('updates map action slice of state on moveEnd', async () => {
				const element = await setup();
				const viewer = element._viewer;

				viewer.camera.moveEnd.raiseEvent();
				expect(store.getState().map.moveEnd.payload).toBe('moveend');
				expect(store.getState().map.beingMoved).toBe(false);
			});
		});
	});
});
