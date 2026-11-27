import { WmsGeoResource } from '@src/domain/geoResources';
import { $injector } from '@src/injection';
import { CsGlobe } from '@src/modules/csGlobe/components/CsGlobe';
import { calculateSpatialHeight } from '@src/modules/csGlobe/utils/csGlobeUtils';
import { addLayer, modifyLayer, removeLayer } from '@src/store/layers/layers.action';
import { layersReducer } from '@src/store/layers/layers.reducer';
import { mapReducer } from '@src/store/map/map.reducer';
import { fit as fitMap } from '@src/store/position/position.action';
import { positionReducer } from '@src/store/position/position.reducer';
import { TestUtils } from '@test/test-utils';
import { createFakeImageryLayer, createMockedViewerConfiguration } from '@test/webgl-stub-utils.js';
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
		toCsLayers: (layerId, geoResource) => {
			return [createFakeImageryLayer(layerId, geoResource.id)];
		}
	};

	const coordinateServiceStub = {
		toLonLat: (coordinate) => toLonLat(coordinate),
		fromLonLat: (coordinate) => fromLonLat(coordinate),
		toLonLatExtent: (extent) => extent
	};

	const geoResourceServiceStub = {
		byId: (id) => {
			return new WmsGeoResource(id, id + '-label', 'https://' + id + '.url', id + '-layer', 'image/png');
		}
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

	describe('class', () => {
		it('exposes static constants', async () => {
			expect(CsGlobe.DEFAULT_PADDING_DEGREE).toEqual([0.005, 0.005, 0.005, 0.005]);
		});
	});

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
				fitRequest: null,
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

		it('synchronizes the layers', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			vi.spyOn(geoResourceServiceStub, 'byId').mockReturnValue(null);
			addLayer('foo');

			await setup();

			// by expecting this message we check that #_syncLayers is called immediately during initialization
			expect(warnSpy).toHaveBeenCalledWith("Could not add an olLayer for id 'foo'");
		});

		it('does not reinitialize the viewer', async () => {
			await setup();
			const csGlobe = new CsGlobe();
			csGlobe.onAfterRender(false);

			expect(csGlobe._viewer).toBe(undefined);
		});
	});

	describe('when disconnected', () => {
		it('destroys the cs-viewer', async () => {
			const element = await setup();
			const destroySpy = vi.spyOn(element._viewer, 'destroy');

			element.onDisconnect(); // we call onDisconnect manually

			expect(element._viewer).toBeNull();
			expect(destroySpy).toHaveBeenCalledOnce();
		});
	});

	describe('view events', () => {
		describe('camera change', () => {
			it('updates the live properties of the position state', async () => {
				const element = await setup();
				const viewer = element._viewer;
				const rotationValue = normalizeRotation(0.5);
				const pitchValue = normalizeRotation(0.25);
				const rollValue = normalizeRotation(0.1);
				const position = new Cartesian3(1, 2, 3);
				const center = element._cartesianToCenter(position);
				const zoom = element._cartesianToZoomLevel(position);

				viewer.camera.setView({
					destination: position,
					orientation: {
						heading: rotationValue,
						pitch: pitchValue,
						roll: rollValue
					}
				});

				viewer.camera.changed.raiseEvent();

				expect(store.getState().position.liveCenter[0]).toBeCloseTo(center[0]);
				expect(store.getState().position.liveCenter[1]).toBeCloseTo(center[1]);
				expect(store.getState().position.liveZoom).toBeCloseTo(zoom);
				expect(store.getState().position.liveRotation).toBe(normalizeRotation(-rotationValue));
				expect(store.getState().position.livePitch).toBe(pitchValue);
				expect(store.getState().position.liveRoll).toBe(rollValue);
			});
		});

		describe('globe move events', () => {
			describe('movestart', () => {
				it("updates the 'movestart' property in map store", async () => {
					const element = await setup();
					const viewer = element._viewer;

					viewer.camera.moveStart.raiseEvent();
					expect(store.getState().map.moveStart.payload).toBe('movestart');
					expect(store.getState().map.beingMoved).toBe(true);
				});
			});

			describe('moveend', () => {
				it("updates the 'moveend' property in map store", async () => {
					const element = await setup();
					const viewer = element._viewer;

					viewer.camera.moveEnd.raiseEvent();
					expect(store.getState().map.moveEnd.payload).toBe('moveend');
					expect(store.getState().map.beingMoved).toBe(false);
				});

				it('updates the position state properties', async () => {
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
			});
		});
	});

	describe('cesium viewer management', () => {
		it('fits to extent', async () => {
			const element = await setup();
			const extent = [38, 57, 39, 58];
			const fitSpy = vi.spyOn(element, '_fitToExtent');
			const syncSpy = vi.spyOn(element, '_syncStore');
			const viewerCamSpy = vi.spyOn(element._viewer.camera, 'flyTo');

			fitMap(extent, { useVisibleViewport: false });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(fitSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ extent: extent }));
			await TestUtils.timeout();

			expect(syncSpy).toHaveBeenCalled();
			expect(viewerCamSpy).toHaveBeenCalled();
		});

		it('fits to an extent with custom maxZoom option', async () => {
			const element = await setup();
			const extent = [10, 80, 10, 80];
			const fitSpy = vi.spyOn(element, '_fitToExtent');
			const syncSpy = vi.spyOn(element, '_syncStore');
			const viewerCamSpy = vi.spyOn(element._viewer.camera, 'flyTo');
			const calcPosSpy = vi.spyOn(element, '_calculate3DDestination');
			vi.spyOn(element, '_cartesianToZoomLevel').mockReturnValue(10);

			fitMap(extent, { maxZoom: 8, useVisibleViewport: false });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(fitSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ extent: extent, options: { maxZoom: 8, useVisibleViewport: false } }));
			expect(calcPosSpy).toHaveBeenCalledWith(expect.anything(), 8);

			await TestUtils.timeout();

			expect(syncSpy).toHaveBeenCalled();
			expect(viewerCamSpy).toHaveBeenCalled();
		});

		it('does nothing when source provides an empty extent ([2] < [0])', async () => {
			const element = await setup();
			const extent = [50, 50, 40, 70]; // Empty extent since [2] < [0]
			const fitSpy = vi.spyOn(element, '_fitToExtent');
			const syncSpy = vi.spyOn(element, '_syncStore');
			const viewerCamSpy = vi.spyOn(element._viewer.camera, 'flyTo');
			fitMap(extent, { useVisibleViewport: false });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(fitSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ extent: extent }));
			await TestUtils.timeout();
			expect(syncSpy).not.toHaveBeenCalled();
			expect(viewerCamSpy).not.toHaveBeenCalled();
		});

		it('does nothing when source provides an empty extent ([3] < [1])', async () => {
			const element = await setup();
			const extent = [50, 50, 70, 40]; // Empty extent since [3] < [1]
			const fitSpy = vi.spyOn(element, '_fitToExtent');
			const syncSpy = vi.spyOn(element, '_syncStore');
			const viewerCamSpy = vi.spyOn(element._viewer.camera, 'flyTo');
			fitMap(extent, { useVisibleViewport: false });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(fitSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ extent: extent }));
			await TestUtils.timeout();
			expect(syncSpy).not.toHaveBeenCalled();
			expect(viewerCamSpy).not.toHaveBeenCalled();
		});

		it("does nothing when source can't provide an extent", async () => {
			const element = await setup();
			const extent = null;
			const fitSpy = vi.spyOn(element, '_fitToExtent');
			const syncSpy = vi.spyOn(element, '_syncStore');
			const viewerCamSpy = vi.spyOn(element._viewer.camera, 'flyTo');
			fitMap(extent, { useVisibleViewport: false });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(fitSpy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ extent: extent }));
			await TestUtils.timeout();
			expect(syncSpy).not.toHaveBeenCalled();
			expect(viewerCamSpy).not.toHaveBeenCalled();
		});
	});

	describe('cesium imageryLayer management', () => {
		it('initially has no imageryLayer', async () => {
			const element = await setup();
			const viewer = element._viewer;

			expect(viewer.imageryLayers).toHaveLength(0);
		});

		it('adds an imageryLayer with custom settings', async () => {
			const element = await setup();
			const viewer = element._viewer;
			const layerId = 'foo';
			const geoResourceId = 'geo-foo';
			const layerServiceSpy = vi.spyOn(csLayerServiceStub, 'toCsLayers');
			addLayer(layerId, { visible: false, opacity: 0.5, geoResourceId: geoResourceId });

			expect(element.getModel().layers).toHaveLength(1);
			expect(element.getModel().layers[0].id).toBe(layerId);
			expect(element.getModel().layers[0].geoResourceId).toBe(geoResourceId);

			expect(viewer.imageryLayers).toHaveLength(1);
			expect(viewer.imageryLayers.get(0).id).toBe(layerId);
			expect(viewer.imageryLayers.get(0).geoResourceId).toBe(geoResourceId);
			expect(viewer.imageryLayers.get(0).alpha).toBe(0.5); // = opacity
			expect(viewer.imageryLayers.get(0).show).toBe(false);
			expect(layerServiceSpy).toHaveBeenCalledWith(layerId, expect.anything(), viewer);
		});

		it('adds an imageryLayer with custom index', async () => {
			const element = await setup();
			const viewer = element._viewer;
			const layerId0 = 'foo';
			const layerId1 = 'bar';
			const geoResourceId0 = 'geo-foo';
			const geoResourceId1 = 'geo-bar';

			const layerServiceSpy = vi.spyOn(csLayerServiceStub, 'toCsLayers');

			addLayer(layerId0, { geoResourceId: geoResourceId0 });
			addLayer(layerId1, { zIndex: 0, geoResourceId: geoResourceId1 });

			expect(element.getModel().layers[0].id).toBe(layerId1);
			expect(element.getModel().layers[0].zIndex).toBe(0);
			expect(element.getModel().layers[1].id).toBe(layerId0);
			expect(element.getModel().layers[1].zIndex).toBe(1);
			expect(viewer.imageryLayers).toHaveLength(2);
			expect(viewer.imageryLayers.get(0).id).toBe(layerId1);
			expect(viewer.imageryLayers.get(0).geoResourceId).toBe(geoResourceId1);
			expect(viewer.imageryLayers.get(1).id).toBe(layerId0);
			expect(viewer.imageryLayers.get(1).geoResourceId).toBe(geoResourceId0);
			expect(layerServiceSpy).toHaveBeenCalledWith(layerId0, expect.anything(), viewer);
		});

		it('adds a group of imageryLayers to the viewer with custom settings', async () => {
			const element = await setup();
			const viewer = element._viewer;
			const layerId0 = 'foo';
			const layerId1 = 'bar';

			vi.spyOn(csLayerServiceStub, 'toCsLayers').mockImplementation((layerId) => {
				return [createFakeImageryLayer(layerId, layerId + '-geo-0'), createFakeImageryLayer(layerId, layerId + '-geo-1')];
			});

			addLayer(layerId0, { geoResourceId: 'aggregate' });
			addLayer(layerId1, { zIndex: 0, geoResourceId: 'aggregate' });

			expect(element.getModel().layers).toHaveLength(2);
			expect(element.getModel().layers[0].id).toBe(layerId1);
			expect(element.getModel().layers[0].geoResourceId).toBe('aggregate');
			expect(element.getModel().layers[1].id).toBe(layerId0);
			expect(element.getModel().layers[1].geoResourceId).toBe('aggregate');
			expect(viewer.imageryLayers).toHaveLength(4);
			expect(viewer.imageryLayers.get(0).id).toBe(layerId1);
			expect(viewer.imageryLayers.get(0).geoResourceId).toBe(layerId1 + '-geo-0');
			expect(viewer.imageryLayers.get(1).id).toBe(layerId1);
			expect(viewer.imageryLayers.get(1).geoResourceId).toBe(layerId1 + '-geo-1');
			expect(viewer.imageryLayers.get(2).id).toBe(layerId0);
			expect(viewer.imageryLayers.get(2).geoResourceId).toBe(layerId0 + '-geo-0');
			expect(viewer.imageryLayers.get(3).id).toBe(layerId0);
			expect(viewer.imageryLayers.get(3).geoResourceId).toBe(layerId0 + '-geo-1');
		});

		it('adds a group of imageryLayers to the viewer with custom index', async () => {
			const element = await setup();
			const viewer = element._viewer;
			const layerId = 'bar';
			const geoResourceIds = ['geo-foo', 'geo-bar'];

			vi.spyOn(csLayerServiceStub, 'toCsLayers').mockReturnValue([
				createFakeImageryLayer(layerId, geoResourceIds[0]),
				createFakeImageryLayer(layerId, geoResourceIds[1])
			]);

			addLayer(layerId, { visible: false, opacity: 0.5, geoResourceId: 'geo-aggregate' });

			expect(element.getModel().layers).toHaveLength(1);
			expect(element.getModel().layers[0].id).toBe(layerId);
			expect(element.getModel().layers[0].geoResourceId).toBe('geo-aggregate');
			expect(viewer.imageryLayers).toHaveLength(2);
			expect(viewer.imageryLayers.get(0).id).toBe(layerId);
			expect(viewer.imageryLayers.get(0).geoResourceId).toBe(geoResourceIds[0]);
			expect(viewer.imageryLayers.get(0).show).toBe(false);
			expect(viewer.imageryLayers.get(0).alpha).toBe(0.5);
			expect(viewer.imageryLayers.get(1).id).toBe(layerId);
			expect(viewer.imageryLayers.get(1).geoResourceId).toBe(geoResourceIds[1]);
			expect(viewer.imageryLayers.get(1).show).toBe(false);
			expect(viewer.imageryLayers.get(1).alpha).toBe(0.5);
		});

		it('removes imageryLayers from the viewer', async () => {
			const element = await setup();
			const viewer = element._viewer;
			const layerId = 'foo';
			const geoResourceId = 'geo-foo';
			const layerId2 = 'bar';
			const layerId2GeoResourceIds = ['geo-foo', 'geo-bar'];

			addLayer(layerId, { geoResourceId: geoResourceId });
			vi.spyOn(csLayerServiceStub, 'toCsLayers').mockReturnValue([
				createFakeImageryLayer(layerId2, layerId2GeoResourceIds[0]),
				createFakeImageryLayer(layerId2, layerId2GeoResourceIds[1])
			]);
			addLayer(layerId2, { geoResourceId: 'geo-aggregate' });
			removeLayer(layerId);

			expect(element.getModel().layers).toHaveLength(1);
			expect(viewer.imageryLayers).toHaveLength(2);
			expect(viewer.imageryLayers.get(0).id).toBe(layerId2);
			expect(viewer.imageryLayers.get(1).id).toBe(layerId2);
			expect(element.getModel().layers[0].id).toBe(layerId2);

			removeLayer(layerId2);

			expect(element.getModel().layers).toHaveLength(0);
			expect(viewer.imageryLayers).toHaveLength(0);
		});

		it('modifies the z-index of imageryLayers', async () => {
			const element = await setup();
			const viewer = element._viewer;
			const layerIds = ['foo', 'bar', 'boo'];
			const layerFooGeoResourceId = 'geo-foo';
			const layerBarGeoResourceIds = ['geo-bar', 'geo-bar-2'];
			const layerBooGeoResourceIds = ['geo-boo', 'geo-boo-2'];

			addLayer(layerIds[0], { geoResourceId: layerFooGeoResourceId });

			vi.spyOn(csLayerServiceStub, 'toCsLayers').mockReturnValue([
				createFakeImageryLayer(layerIds[1], layerBarGeoResourceIds[0]),
				createFakeImageryLayer(layerIds[1], layerBarGeoResourceIds[1])
			]);
			addLayer(layerIds[1], { geoResourceId: 'geo-bar-aggregate' });

			vi.spyOn(csLayerServiceStub, 'toCsLayers').mockReturnValue([
				createFakeImageryLayer(layerIds[2], layerBooGeoResourceIds[0]),
				createFakeImageryLayer(layerIds[2], layerBooGeoResourceIds[1])
			]);
			addLayer(layerIds[2], { geoResourceId: 'geo-boo-aggregate' });

			modifyLayer(layerIds[0], { zIndex: 1 });

			expect(element.getModel().layers[0].id).toBe(layerIds[1]);
			expect(element.getModel().layers[1].id).toBe(layerIds[0]);
			expect(element.getModel().layers[2].id).toBe(layerIds[2]);
			expect(viewer.imageryLayers.get(0).id).toBe(layerIds[1]);
			expect(viewer.imageryLayers.get(1).id).toBe(layerIds[1]);
			expect(viewer.imageryLayers.get(2).id).toBe(layerIds[0]);
			expect(viewer.imageryLayers.get(3).id).toBe(layerIds[2]);
			expect(viewer.imageryLayers.get(4).id).toBe(layerIds[2]);

			modifyLayer(layerIds[2], { zIndex: 0 });

			expect(element.getModel().layers[0].id).toBe(layerIds[2]);
			expect(element.getModel().layers[1].id).toBe(layerIds[1]);
			expect(element.getModel().layers[2].id).toBe(layerIds[0]);
			expect(viewer.imageryLayers.get(0).id).toBe(layerIds[2]);
			expect(viewer.imageryLayers.get(1).id).toBe(layerIds[2]);
			expect(viewer.imageryLayers.get(2).id).toBe(layerIds[1]);
			expect(viewer.imageryLayers.get(3).id).toBe(layerIds[1]);
			expect(viewer.imageryLayers.get(4).id).toBe(layerIds[0]);
		});

		it('modifies layer with layer properties', async () => {
			const element = await setup();
			const viewer = element._viewer;
			const layerId = 'foo';
			const geoResourceId = 'geo-foo';

			// Tests if layers are correctly assigned to one corresponding imageryLayer
			addLayer(layerId, { geoResourceId: geoResourceId, opacity: 0.2, visible: false });
			modifyLayer(layerId, { opacity: 0.8, visible: true });

			expect(viewer.imageryLayers.get(0).alpha).toBe(0.8);
			expect(viewer.imageryLayers.get(0).show).toBe(true);
		});
	});
});
