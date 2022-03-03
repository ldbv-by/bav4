/* eslint-disable no-undef */
import { OlMap } from '../../../../../src/modules/map/components/olMap/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '../../../../test-utils.js';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';
import { $injector } from '../../../../../src/injection';
import { layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { GeoResourceFuture, VectorGeoResource, VectorSourceType, WmsGeoResource } from '../../../../../src/services/domain/geoResources';
import { addLayer, modifyLayer, removeLayer } from '../../../../../src/store/layers/layers.action';
import { changeRotation, changeZoomAndCenter, setFit } from '../../../../../src/store/position/position.action';
import { simulateMapEvent, simulateMapBrowserEvent } from './mapTestUtils';
import VectorLayer from 'ol/layer/Vector';
import { pointerReducer } from '../../../../../src/store/pointer/pointer.reducer';
import { mapReducer } from '../../../../../src/store/map/map.reducer';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event';
import { Group as LayerGroup, Layer } from 'ol/layer';
import { measurementReducer } from '../../../../../src/store/measurement/measurement.reducer';
import { getDefaultLayerOptions } from '../../../../../src/modules/map/components/olMap/handler/OlLayerHandler';

window.customElements.define(OlMap.tag, OlMap);


describe('OlMap', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialZoomLevel = 10;
	const initialRotationValue = .5;
	const longPressDelay = 300;
	const maxZoomLevel = 21;

	const mapServiceStub = {
		getMinimalRotation() {
			return .05;
		},
		getMaxZoomLevel() {
			return maxZoomLevel;
		},
		getScaleLineContainer() { }
	};

	const geoResourceServiceStub = {
		byId(id) {
			switch (id) {
				case 'id0':
					return new WmsGeoResource(id, 'Label0', 'https://something0.url', 'layer0', 'image/png');
				case 'id1':
					return new WmsGeoResource(id, 'Label1', 'https://something1.url', 'layer1', 'image/png');
			}
			return null;
		},
		addOrReplace() { }
	};

	const layerServiceMock = {
		toOlLayer() { }
	};

	const environmentServiceMock = {
		isTouch() { }
	};

	const measurementLayerHandlerMock = {
		activate() { },
		deactivate() { },
		get id() {
			return 'measurementLayerHandlerMockId';
		},
		get active() {
			return false;
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const drawLayerHandlerMock = {
		activate() { },
		deactivate() { },
		get id() {
			return 'drawLayerHandlerMockId';
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const geolocationLayerHandlerMock = {
		activate() { },
		deactivate() { },
		get id() {
			return 'geolocationLayerHandlerMockId';
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const highlightLayerHandlerMock = {

		deactivate() { },
		get id() {
			return 'highlightLayerHandlerMockId';
		},
		get active() {
			return false;
		},
		get options() {
			return getDefaultLayerOptions();
		}
	};
	const featureInfoHandlerMock = {
		register() { },
		get id() {
			return 'featureInfoHandlerMockId';
		}
	};

	const vectorLayerServiceMock = {};

	let store;

	const setup = (state) => {
		const defaultState = {
			position: {
				zoom: initialZoomLevel,
				center: initialCenter,
				rotation: initialRotationValue,
				fitRequest: null
			}
		};
		const combinedState = {
			...defaultState,
			...state
		};

		store = TestUtils.setupStoreAndDi(combinedState, {
			map: mapReducer,
			pointer: pointerReducer,
			position: positionReducer,
			layers: layersReducer,
			measurement: measurementReducer
		});


		$injector
			.registerSingleton('MapService', mapServiceStub)
			.registerSingleton('GeoResourceService', geoResourceServiceStub)
			.registerSingleton('EnvironmentService', environmentServiceMock)
			.registerSingleton('OlMeasurementHandler', measurementLayerHandlerMock)
			.registerSingleton('OlDrawHandler', drawLayerHandlerMock)
			.registerSingleton('OlGeolocationHandler', geolocationLayerHandlerMock)
			.registerSingleton('OlHighlightLayerHandler', highlightLayerHandlerMock)
			.registerSingleton('OlFeatureInfoHandler', featureInfoHandlerMock)
			.registerSingleton('VectorLayerService', vectorLayerServiceMock)
			.registerSingleton('LayerService', layerServiceMock);

		return TestUtils.render(OlMap.tag);
	};

	describe('when initialized', () => {

		it('configures the map and adds a div which contains the ol-map', async () => {
			const mapServiceSpy = spyOn(mapServiceStub, 'getScaleLineContainer');

			const element = await setup();

			expect(element._view.getZoom()).toBe(initialZoomLevel);
			expect(element._view.getCenter()).toEqual(initialCenter);
			expect(element._view.getRotation()).toBe(initialRotationValue);
			expect(element._view.getMaxZoom()).toBe(maxZoomLevel);
			expect(element.shadowRoot.querySelector('#ol-map')).toBeTruthy();
			//all default controls are removed, ScaleLine control added
			expect(element._map.getControls().getLength()).toBe(1);
			//all interactions are present
			expect(element._map.getInteractions().getLength()).toBe(9);
			expect(element._map.moveTolerance_).toBe(1);
			expect(mapServiceSpy).toHaveBeenCalled();
		});

		describe('on touch device', () => {

			it('configures the map and adds a div which contains the ol-map', async () => {
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
				const element = await setup();

				expect(element._map.moveTolerance_).toBe(3);
			});
		});
	});

	describe('view events', () => {

		describe('rotation:change', () => {

			it('updates the liveRotation property of the position state', async () => {
				const rotationValue = .56786786;
				const element = await setup();
				const view = element._view;
				const changeRotationEvent = new Event('change:rotation');
				changeRotationEvent.target = { getRotation: () => rotationValue };

				view.dispatchEvent(changeRotationEvent);

				expect(store.getState().position.liveRotation).toBe(rotationValue);
			});
		});
	});


	describe('map move events', () => {
		describe('movestart', () => {

			it('updates the \'movestart\' property in map store', async () => {
				const element = await setup();

				simulateMapEvent(element._map, MapEventType.MOVESTART);

				expect(store.getState().map.moveStart.payload).toBe('movestart');
			});
			it('updates the \'beingMoved\' property in pointer store', async () => {
				const element = await setup();

				simulateMapEvent(element._map, MapEventType.MOVESTART);

				expect(store.getState().map.beingMoved).toBeTrue();

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().map.beingMoved).toBeFalse();
			});
		});

		describe('moveend', () => {

			it('updates the \'moveend\' property in map store', async () => {
				const element = await setup();

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().map.moveEnd.payload).toBe('moveend');
			});

			it('updates the position state properties', async () => {
				const element = await setup();
				const view = element._view;
				spyOn(view, 'getZoom');
				spyOn(view, 'getCenter');
				spyOn(view, 'getRotation');

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(view.getZoom).toHaveBeenCalledTimes(1);
				expect(view.getCenter).toHaveBeenCalledTimes(1);
				expect(view.getRotation).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('pointer events', () => {

		describe('when pointer move', () => {
			it('updates the \'pointer\' property in pointer store', async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);

				simulateMapBrowserEvent(element._map, MapBrowserEventType.POINTERMOVE, ...screenCoordinate);

				expect(store.getState().pointer.move.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.move.payload.screenCoordinate).toEqual(screenCoordinate);
			});
		});


		describe('when pointer drag', () => {
			it('does NOT update the \'pointer\' property in pointer store', async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);

				simulateMapBrowserEvent(element._map, MapBrowserEventType.POINTERMOVE, ...screenCoordinate, true);

				expect(store.getState().pointer.move).toBeNull();
			});

			it('updates the \'beingDragged\' property in pointer store', async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);

				simulateMapBrowserEvent(element._map, MapBrowserEventType.POINTERDRAG, ...screenCoordinate, true);

				expect(store.getState().pointer.beingDragged).toBeTrue();

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().pointer.beingDragged).toBeFalse();
			});
		});
	});

	describe('single-click / short-press event', () => {

		describe('on non touch device', () => {

			it('updates the \'click\' property in pointer store', async () => {
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
				const preventDefault = jasmine.createSpy();

				simulateMapBrowserEvent(map, MapBrowserEventType.SINGLECLICK, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it('updates the \'click\' property when layer handler is active but allows default click handling', async () => {
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
				//we set the highlightLayerHandlerMock active which allows click handling
				spyOnProperty(highlightLayerHandlerMock, 'active').and.returnValue(true);
				spyOnProperty(highlightLayerHandlerMock, 'options').and.returnValue({ preventDefaultClickHandling: false, preventDefaultContextClickHandling: true });
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
				const preventDefault = jasmine.createSpy();

				simulateMapBrowserEvent(map, MapBrowserEventType.SINGLECLICK, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it('does nothing when layer handler is active', async () => {
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
				//we set one handler active
				spyOnProperty(measurementLayerHandlerMock, 'active').and.returnValue(true);
				const preventDefault = jasmine.createSpy();

				simulateMapBrowserEvent(map, MapBrowserEventType.SINGLECLICK, ...screenCoordinate, false, preventDefault);

				expect(preventDefault).not.toHaveBeenCalled();
			});
		});

		describe('on touch device', () => {

			beforeEach(async () => {
				jasmine.clock().install();
			});

			afterEach(function () {
				jasmine.clock().uninstall();
			});

			it('updates the \'click\' property in pointer store', async () => {
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
				const preventDefault = jasmine.createSpy();

				//we simulate a "short-press" event
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
				jasmine.clock().tick(longPressDelay - 100);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it('updates the \'click\' property when layer handler is active but allows default click handling', async () => {
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
				//we set the highlightLayerHandlerMock active which allows click handling
				spyOnProperty(highlightLayerHandlerMock, 'active').and.returnValue(true);
				spyOnProperty(highlightLayerHandlerMock, 'options').and.returnValue({ preventDefaultClickHandling: false, preventDefaultContextClickHandling: true });
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
				const preventDefault = jasmine.createSpy();

				//we simulate a "short-press" event
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
				jasmine.clock().tick(longPressDelay - 100);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, ...screenCoordinate, false, preventDefault);

				expect(store.getState().pointer.click.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.click.payload.screenCoordinate).toEqual(screenCoordinate);
				expect(preventDefault).toHaveBeenCalled();
			});

			it('does nothing when layer handler is active', async () => {
				spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
				//we set one handler active
				spyOnProperty(measurementLayerHandlerMock, 'active').and.returnValue(true);
				const preventDefault = jasmine.createSpy();

				//we simulate a "short-press" event
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
				jasmine.clock().tick(longPressDelay - 100);
				simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP, ...screenCoordinate, false, preventDefault);

				expect(preventDefault).not.toHaveBeenCalled();
			});
		});
	});

	describe('context-click / long-press event', () => {

		describe('contextmenu event handling', () => {

			describe('on non touch device', () => {

				it('updates the \'contextclick\' property in pointer store', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					simulateMapBrowserEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it('updates the \'contextclick\' when layer handler is active but allows default context click handling', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
					//we set the highlightLayerHandlerMock active which allows context click handling
					spyOnProperty(highlightLayerHandlerMock, 'active').and.returnValue(true);
					spyOnProperty(highlightLayerHandlerMock, 'options').and.returnValue({ preventDefaultClickHandling: true, preventDefaultContextClickHandling: false });
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					simulateMapBrowserEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it('does nothing when layer handler is active', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
					//we set one handler active
					spyOnProperty(measurementLayerHandlerMock, 'active').and.returnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					simulateMapBrowserEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

					expect(preventDefault).not.toHaveBeenCalled();
				});
			});

			describe('on touch device', () => {

				beforeEach(async () => {
					jasmine.clock().install();
				});

				afterEach(function () {
					jasmine.clock().uninstall();
				});

				it('updates the \'contextclick\' property in pointer store', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					//we simulate a "long-press" event
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					jasmine.clock().tick(longPressDelay + 100);
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it('updates the \'contextclick\' when layer handler is active but allows default context click handling', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					//we set one handler active
					spyOnProperty(highlightLayerHandlerMock, 'active').and.returnValue(true);
					spyOnProperty(highlightLayerHandlerMock, 'options').and.returnValue({ preventDefaultClickHandling: true, preventDefaultContextClickHandling: false });
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					//we simulate a "long-press" event
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					jasmine.clock().tick(longPressDelay + 100);
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it('does nothing when layer handler is active', async () => {
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					//we set one handler active
					spyOnProperty(measurementLayerHandlerMock, 'active').and.returnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					//we simulate a "long-press" event
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					jasmine.clock().tick(longPressDelay + 100);
					simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

					expect(preventDefault).not.toHaveBeenCalled();
				});
			});
		});
	});

	describe('olView management', () => {

		it('updates zoom and center', async () => {
			const element = await setup();
			const view = element._map.getView();
			const viewSpy = spyOn(view, 'animate');

			changeZoomAndCenter({ zoom: 5, center: fromLonLat([11, 48]) });

			expect(viewSpy).toHaveBeenCalledWith({
				zoom: 5,
				center: fromLonLat([11, 48]),
				rotation: initialRotationValue,
				duration: 500
			});
		});

		it('updates rotation', async () => {
			const element = await setup();
			const view = element._map.getView();
			const viewSpy = spyOn(view, 'animate');

			changeRotation(1);

			expect(viewSpy).toHaveBeenCalledWith({
				zoom: initialZoomLevel,
				center: initialCenter,
				rotation: 1,
				duration: 500
			});
		});

		it('fits to an extent', async (done) => {
			const element = await setup();
			const view = element._map.getView();
			const viewSpy = spyOn(view, 'fit').and.callThrough();
			const spy = spyOn(element, '_syncStore').and.callThrough();
			const extent = [38, 57, 39, 58];

			expect(element._viewSyncBlocked).toBeUndefined();

			setFit(extent);

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledOnceWith(extent, { maxZoom: view.getMaxZoom(), callback: jasmine.anything() });
			expect(element._viewSyncBlocked).toBeTrue();

			setTimeout(function () {
				//check if flag is reset
				expect(element._viewSyncBlocked).toBeFalse();
				//and store is in sync with view
				expect(spy).toHaveBeenCalled();
				done();

			});
		});

		it('fits to an extent with custom maxZoom option', async (done) => {
			const element = await setup();
			const view = element._map.getView();
			const viewSpy = spyOn(view, 'fit').and.callThrough();
			const spy = spyOn(element, '_syncStore').and.callThrough();
			const extent = [38, 57, 39, 58];
			const maxZoom = 10;

			expect(element._viewSyncBlocked).toBeUndefined();

			setFit(extent, { maxZoom: maxZoom });

			expect(store.getState().position.fitRequest).not.toBeNull();
			expect(viewSpy).toHaveBeenCalledOnceWith(extent, { maxZoom: maxZoom, callback: jasmine.anything() });
			expect(element._viewSyncBlocked).toBeTrue();
			setTimeout(function () {
				//check if flag is reset
				expect(element._viewSyncBlocked).toBeFalse();
				//and store is in sync with view
				expect(spy).toHaveBeenCalled();
				done();

			});
		});
	});

	describe('olLayer management', () => {

		it('initially has no olLayer', async () => {
			const element = await setup();
			const map = element._map;

			expect(map.getLayers().getLength()).toBe(0);
		});

		it('adds an olLayer with custom settings', async () => {
			const element = await setup();
			const map = element._map;
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new VectorLayer({ id: geoResource.id }));

			addLayer('id0', { visible: false, opacity: .5 });

			expect(map.getLayers().getLength()).toBe(1);

			const layer = map.getLayers().item(0);
			expect(layer.get('id')).toBe('id0');
			expect(layer.getOpacity()).toBe(.5);
			expect(layer.getVisible()).toBeFalse();
		});

		it('adds an olLayer with custom index', async () => {
			const element = await setup();
			const map = element._map;
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new VectorLayer({ id: geoResource.id }));

			addLayer('id0');
			addLayer('id1', { zIndex: 0 });
			expect(map.getLayers().getLength()).toBe(2);
			const layer1 = map.getLayers().item(0);
			expect(layer1.get('id')).toBe('id1');
			const layer0 = map.getLayers().item(1);
			expect(layer0.get('id')).toBe('id0');
		});

		it('adds an olLayer resolving a GeoResourceFuture', async (done) => {
			const element = await setup();
			const map = element._map;
			const id = 'id';
			const geoResource = new WmsGeoResource(id, 'Label2', 'https://something0.url', 'layer2', 'image/png');
			const olPlaceHolderLayer = new Layer({ id: id, render: () => { } });
			const olRealLayer = new VectorLayer({ id: id });
			const future = new GeoResourceFuture(id, async () => geoResource);
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => {
				if (geoResource instanceof GeoResourceFuture) {
					return olPlaceHolderLayer;
				}
				return olRealLayer;
			});
			spyOn(geoResourceServiceStub, 'byId').withArgs(id).and.returnValue(future);

			addLayer(id);

			expect(map.getLayers().getLength()).toBe(1);
			const layer = map.getLayers().item(0);
			expect(layer).toEqual(olPlaceHolderLayer);

			setTimeout(() => {
				const layer = map.getLayers().item(0);
				expect(map.getLayers().getLength()).toBe(1);
				expect(layer).toEqual(olRealLayer);
				done();
			});
		});

		it('adds an olLayer resolving a GeoResourceFuture with custom settings', async (done) => {
			const element = await setup();
			const map = element._map;
			const id = 'id';
			const geoResource = new VectorGeoResource(id, 'label', VectorSourceType.GEOJSON);
			const olPlaceHolderLayer = new Layer({ id: id, render: () => { } });
			const olRealLayer = new VectorLayer({ id: id });
			const future = new GeoResourceFuture(id, async () => geoResource);
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => {
				if (geoResource instanceof GeoResourceFuture) {
					return olPlaceHolderLayer;
				}
				return olRealLayer;
			});
			spyOn(geoResourceServiceStub, 'byId').withArgs(id).and.returnValue(future);

			addLayer(id, { visible: false, opacity: .5 });

			setTimeout(() => {
				const layer = map.getLayers().item(0);
				expect(map.getLayers().getLength()).toBe(1);
				expect(layer).toEqual(olRealLayer);
				expect(layer.getOpacity()).toBe(.5);
				expect(layer.getVisible()).toBeFalse();
				done();
			});
		});

		it('adds an olLayer resolving a GeoResourceFuture with custom index', async (done) => {
			const element = await setup();
			const map = element._map;
			const underTestLayerId = 'id';
			const nonAsyncLayerId = 'non-async-id';
			const geoResource = new VectorGeoResource(underTestLayerId, 'label', VectorSourceType.GEOJSON);
			const olPlaceHolderLayer = new Layer({ id: underTestLayerId, render: () => { } });
			const olRealLayer = new VectorLayer({ id: underTestLayerId });
			const future = new GeoResourceFuture(underTestLayerId, async () => geoResource);
			const nonAsyncOlLayer = new VectorLayer({ id: nonAsyncLayerId });
			const nonAsyncGeoResouce = new VectorGeoResource(nonAsyncLayerId, 'label', VectorSourceType.GEOJSON);
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => {
				if (geoResource.id === underTestLayerId) {
					if (geoResource instanceof GeoResourceFuture) {
						return olPlaceHolderLayer;
					}
					return olRealLayer;
				}
				return nonAsyncOlLayer;
			});
			spyOn(geoResourceServiceStub, 'byId').withArgs(jasmine.anything()).and.callFake(id => {
				if (id === underTestLayerId) {
					return future;
				}
				return nonAsyncGeoResouce;
			});

			addLayer(nonAsyncLayerId);
			addLayer(underTestLayerId, { zIndex: 0 });

			setTimeout(() => {
				expect(map.getLayers().getLength()).toBe(2);
				expect(map.getLayers().item(0)).toEqual(olRealLayer);
				expect(map.getLayers().item(1)).toEqual(nonAsyncOlLayer);
				done();
			});
		});

		it('adds NO layer for an unresolveable GeoResourceFuture', async (done) => {
			const element = await setup();
			const map = element._map;
			const id = 'id';
			const message = 'error';
			const future = new GeoResourceFuture(id, async () => Promise.reject(message));
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new Layer({ id: geoResource.id, render: () => { }, properties: { placeholder: true } }));
			const geoResourceServiceSpy = spyOn(geoResourceServiceStub, 'addOrReplace');
			spyOn(geoResourceServiceStub, 'byId').withArgs(id).and.returnValue(future);
			const warnSpy = spyOn(console, 'warn');

			addLayer(id);
			expect(map.getLayers().getLength()).toBe(1);
			const layer = map.getLayers().item(0);
			expect(layer.get('id')).toBe(id);

			setTimeout(() => {
				expect(map.getLayers().getLength()).toBe(0);
				expect(geoResourceServiceSpy).not.toHaveBeenCalled();
				expect(warnSpy).toHaveBeenCalledWith(message);
				done();
			});
		});


		it('removes layer from state store when olLayer not available', async () => {
			const element = await setup();
			const map = element._map;
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new VectorLayer({ id: geoResource.id }));
			const warnSpy = spyOn(console, 'warn');
			expect(store.getState().layers.active.length).toBe(0);

			addLayer('id0');
			expect(map.getLayers().getLength()).toBe(1);
			expect(store.getState().layers.active.length).toBe(1);

			addLayer('unknown');
			expect(map.getLayers().getLength()).toBe(1);
			expect(store.getState().layers.active.length).toBe(1);
			expect(warnSpy).toHaveBeenCalledWith('Could not add an olLayer for id \'unknown\'');
		});

		it('removes an olLayer', async () => {
			const element = await setup();
			const map = element._map;
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new VectorLayer({ id: geoResource.id }));

			addLayer('id0');
			expect(map.getLayers().getLength()).toBe(1);

			removeLayer('id0');

			expect(map.getLayers().getLength()).toBe(0);
		});

		it('calls #clear on a vector source when layer is removed', async () => {
			const element = await setup();
			const map = element._map;
			const olVectorSource = new VectorSource();
			const vectorSourceSpy = spyOn(olVectorSource, 'clear');
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new VectorLayer({ id: geoResource.id, source: olVectorSource }));

			addLayer('id0');

			removeLayer('id0');

			expect(vectorSourceSpy).toHaveBeenCalled();
		});

		it('calls #clear on a vector source when layer group is removed', async () => {
			const element = await setup();
			const map = element._map;
			const olVectorSource = new VectorSource();
			const vectorSourceSpy = spyOn(olVectorSource, 'clear');
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new LayerGroup({
				id: geoResource.id,
				layers: [new VectorLayer({ id: 'sub_' + geoResource.id, source: olVectorSource })]
			}));

			addLayer('id0');

			removeLayer('id0');

			expect(vectorSourceSpy).toHaveBeenCalled();
		});

		it('modifys the visibility of an olLayer', async () => {
			const element = await setup();
			const map = element._map;
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new VectorLayer({ id: geoResource.id }));

			addLayer('id0');
			addLayer('id1');
			expect(map.getLayers().getLength()).toBe(2);

			modifyLayer('id0', { visible: false, opacity: .5 });

			const layer0 = map.getLayers().item(0);
			expect(layer0.get('id')).toBe('id0');
			expect(layer0.getVisible()).toBeFalse();
			expect(layer0.getOpacity()).toBe(.5);

			const layer1 = map.getLayers().item(1);
			expect(layer1.get('id')).toBe('id1');
			expect(layer1.getVisible()).toBeTrue();
			expect(layer1.getOpacity()).toBe(1);
		});

		it('modifys the z-index of an olLayer', async () => {
			const element = await setup();
			const map = element._map;
			spyOn(layerServiceMock, 'toOlLayer').withArgs(jasmine.anything(), map).and.callFake(geoResource => new VectorLayer({ id: geoResource.id }));

			addLayer('id0');
			addLayer('id1');
			expect(map.getLayers().getLength()).toBe(2);

			modifyLayer('id0', { zIndex: 2 });

			const layer0 = map.getLayers().item(0);
			expect(layer0.get('id')).toBe('id1');

			const layer1 = map.getLayers().item(1);
			expect(layer1.get('id')).toBe('id0');
		});
	});

	describe('measurement handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('measurementLayerHandlerMockId')).toEqual(measurementLayerHandlerMock);
		});

		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = spyOn(measurementLayerHandlerMock, 'activate').and.returnValue(olLayer);
			const deactivateSpy = spyOn(measurementLayerHandlerMock, 'deactivate').and.returnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(measurementLayerHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.calls.reset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(measurementLayerHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('draw handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('drawLayerHandlerMockId')).toEqual(drawLayerHandlerMock);
		});

		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = spyOn(drawLayerHandlerMock, 'activate').and.returnValue(olLayer);
			const deactivateSpy = spyOn(drawLayerHandlerMock, 'deactivate').and.returnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(drawLayerHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.calls.reset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(drawLayerHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('geolocation handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._layerHandler.get('geolocationLayerHandlerMockId')).toEqual(geolocationLayerHandlerMock);
		});


		it('activates and deactivates the handler', async () => {
			const olLayer = new VectorLayer({});
			const activateSpy = spyOn(geolocationLayerHandlerMock, 'activate').and.returnValue(olLayer);
			const deactivateSpy = spyOn(geolocationLayerHandlerMock, 'deactivate').and.returnValue(olLayer);
			const element = await setup();
			const map = element._map;

			addLayer(geolocationLayerHandlerMock.id);

			expect(activateSpy).toHaveBeenCalledWith(map);
			activateSpy.calls.reset();
			expect(deactivateSpy).not.toHaveBeenCalledWith(map);

			removeLayer(geolocationLayerHandlerMock.id);
			expect(activateSpy).not.toHaveBeenCalledWith(map);
			expect(deactivateSpy).toHaveBeenCalledWith(map);
		});
	});

	describe('featureInfo handler', () => {
		it('registers the handler', async () => {
			const element = await setup();

			expect(element._mapHandler.get('featureInfoHandlerMockId')).toEqual(featureInfoHandlerMock);
		});
	});
});
