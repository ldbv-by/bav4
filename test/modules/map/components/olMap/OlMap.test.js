/* eslint-disable no-undef */
import { OlMap } from '../../../../../src/modules/map/components/olMap/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '../../../../test-utils.js';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';
import { $injector } from '../../../../../src/injection';
import { layersReducer } from '../../../../../src/store/layers/layers.reducer';
import { WmsGeoResource } from '../../../../../src/services/domain/geoResources';
import { addLayer, modifyLayer, removeLayer } from '../../../../../src/store/layers/layers.action';
import { changeRotation, changeZoomAndCenter, setFit } from '../../../../../src/store/position/position.action';
import { simulateMapEvent, simulateMouseEvent } from './mapTestUtils';
import VectorLayer from 'ol/layer/Vector';
import { measurementReducer } from '../../../../../src/modules/map/store/measurement.reducer';
import { pointerReducer } from '../../../../../src/modules/map/store/pointer.reducer';
import { mapReducer } from '../../../../../src/modules/map/store/map.reducer';
import VectorSource from 'ol/source/Vector';
import Event from 'ol/events/Event';

window.customElements.define(OlMap.tag, OlMap);


describe('OlMap', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);
	const initialZoomLevel = 10;
	const initialRotationValue = .5;

	const mapServiceStub = {
		getMinimalRotation() {
			return .05; 
		}
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
		}
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
		}
	};
	const geolocationLayerHandlerMock = {
		activate() { },
		deactivate() { },
		get id() {
			return 'geolocationLayerHandlerMockId';
		}
	};
	const vectorImportServiceMock = {
		vectorSourceFromInternalData: () => { },
		vectorSourceFromExternalData: () => { }
	};

	let store;

	const setup = (state) => {
		const defaultState = {
			position: {
				zoom: initialZoomLevel,
				center: initialCenter,
				rotation: initialRotationValue,
				fitRequest: null
			},
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
			.registerSingleton('OlGeolocationHandler', geolocationLayerHandlerMock)
			.registerSingleton('VectorImportService', vectorImportServiceMock)
			.registerSingleton('LayerService', layerServiceMock);

		return TestUtils.render(OlMap.tag);
	};

	describe('when initialized', () => {
		it('configures the map and adds a div which contains the ol-map', async () => {
			const element = await setup();
			expect(element._view.getZoom()).toBe(initialZoomLevel);
			expect(element._view.getCenter()).toEqual(initialCenter);
			expect(element._view.getRotation()).toBe(initialRotationValue);
			expect(element.shadowRoot.querySelector('#ol-map')).toBeTruthy();
			//all default controls are removed, ScaleLine control added 
			expect(element._map.getControls().getLength()).toBe(1);
			//all interactions are present
			expect(element._map.getInteractions().getLength()).toBe(9);
		});
	});

	describe('view events', () => {

		describe('rotation:change', () => {

			it('updates the liveRotation property of the position state', async () => {
				const rotationValue = .56786786;
				const element = await setup();
				const view = element._view;
				const changeRotationEvent = new Event('change:rotation');
				changeRotationEvent.target =  { getRotation: () => rotationValue };

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

				simulateMouseEvent(element._map, MapBrowserEventType.POINTERMOVE, ...screenCoordinate);

				expect(store.getState().pointer.move.payload.coordinate).toEqual(coordinate);
				expect(store.getState().pointer.move.payload.screenCoordinate).toEqual(screenCoordinate);
			});
                        
			it('adds a scaleline', async () => {
				const element = await setup();
				expect(element.shadowRoot.querySelectorAll('.ol-scale-line')).toHaveSize(1);
			});
		});


		describe('when pointer drag', () => {
			it('does NOT update the \'pointer\' property in pointer store', async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);

				simulateMouseEvent(element._map, MapBrowserEventType.POINTERMOVE, ...screenCoordinate, true);

				expect(store.getState().pointer.move).toBeNull();
			});

			it('updates the \'beingDragged\' property in pointer store', async () => {
				const element = await setup();
				const map = element._map;
				const coordinate = [38, 75];
				const screenCoordinate = [21, 42];
				spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);

				simulateMouseEvent(element._map, MapBrowserEventType.POINTERDRAG, ...screenCoordinate, true);

				expect(store.getState().pointer.beingDragged).toBeTrue();

				simulateMapEvent(element._map, MapEventType.MOVEEND);

				expect(store.getState().pointer.beingDragged).toBeFalse();
			});
		});
	});

	describe('contextmenu', () => {

		beforeEach(async () => {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

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

					simulateMouseEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

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

					simulateMouseEvent(map, 'contextmenu', ...screenCoordinate, false, preventDefault);

					expect(preventDefault).not.toHaveBeenCalled();
				});
			});

			describe('on touch device', () => {

				it('updates the \'contextclick\' property in pointer store', async () => {
					const defaultDelay = 300;
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					jasmine.clock().tick(defaultDelay + 100);
					simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

					expect(store.getState().pointer.contextClick.payload.coordinate).toEqual(coordinate);
					expect(store.getState().pointer.contextClick.payload.screenCoordinate).toEqual(screenCoordinate);
					expect(preventDefault).toHaveBeenCalled();
				});

				it('does nothing when layer handler is active', async () => {
					const defaultDelay = 300;
					spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
					//we set one handler active
					spyOnProperty(measurementLayerHandlerMock, 'active').and.returnValue(true);
					const element = await setup();
					const map = element._map;
					const coordinate = [38, 75];
					const screenCoordinate = [21, 42];
					spyOn(map, 'getEventCoordinate').and.returnValue(coordinate);
					const preventDefault = jasmine.createSpy();

					simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN, ...screenCoordinate, false, preventDefault);
					jasmine.clock().tick(defaultDelay + 100);
					simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

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
});
