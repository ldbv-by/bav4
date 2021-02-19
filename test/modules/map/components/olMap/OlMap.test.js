/* eslint-disable no-undef */
import { OlMap } from '../../../../../src/modules/map/components/olMap/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '../../../../test-utils.js';
import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';
import { $injector } from '../../../../../src/injection';
import { layersReducer } from '../../../../../src/modules/map/store/layers.reducer';
import { WmsGeoResource } from '../../../../../src/services/domain/geoResources';
import { addLayer, modifyLayer, removeLayer } from '../../../../../src/modules/map/store/layers.action';
import { changeZoomAndCenter, fit } from '../../../../../src/modules/map/store/position.action';
import { simulateMapEvent, simulateMouseEvent } from './mapTestUtils';

window.customElements.define(OlMap.tag, OlMap);


describe('OlMap', () => {

	const initialCenter = fromLonLat([11.57245, 48.14021]);

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
		init() { }
	};

	const contextMenuEventHandlerMock = {
		register() { },
		get id() {
			return 'contextMenuEventHandlerMock'; 
		}
	};

	let store;

	const setup = () => {
		const state = {
			position: {
				zoom: 10,
				center: initialCenter,
				fitRequest: null
			},
			layers: {
				active: [],
				background: null
			}
		};

		store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer,
			layers: layersReducer
		});


		$injector
			.registerSingleton('GeoResourceService', geoResourceServiceStub)
			.registerSingleton('OlContextMenueMapEventHandler', contextMenuEventHandlerMock);


		return TestUtils.render(OlMap.tag);
	};

	describe('when initialized', () => {
		it('configures the map and adds a div which contains the ol-map', async () => {
			const element = await setup();
			expect(element._view.getZoom()).toBe(10);
			expect(element._view.getCenter()).toEqual(initialCenter);
			expect(element.shadowRoot.querySelector('#ol-map')).toBeTruthy();
		});

		it('initialized the geoResourceService', async () => {
			const geoResourceServiceSpy = spyOn(geoResourceServiceStub, 'init');

			await setup();

			expect(geoResourceServiceSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('when map move', () => {
		it('change state from view properties', async () => {
			const element = await setup();
			const view = element._view;
			spyOn(view, 'getZoom');
			spyOn(view, 'getCenter');

			simulateMapEvent(element._map, MapEventType.MOVEEND);

			expect(view.getZoom).toHaveBeenCalledTimes(1);
			expect(view.getCenter).toHaveBeenCalledTimes(1);
		});
	});

	describe('when pointer move', () => {
		it('pointer position store is updated', async () => {
			const element = await setup();
			const map = element._map;
			const pointerPosition = ['foo', 'bar'];
			spyOn(map, 'getEventCoordinate').and.returnValue(pointerPosition);

			simulateMouseEvent(element._map, MapBrowserEventType.POINTERMOVE, 10, 0);

			expect(store.getState().position.pointerPosition).toBe(pointerPosition);
		});
	});

	describe('when mouse is dragging', () => {
		it('do NOT store pointerPosition', async () => {
			const element = await setup();
			const map = element._map;
			const pointerPosition = [99, 99];
			spyOn(map, 'getEventCoordinate').and.returnValue(pointerPosition);

			simulateMouseEvent(element._map, MapBrowserEventType.POINTERMOVE, 10, 0, true);

			expect(store.getState().position.pointerPosition).toBeUndefined();
		});
	});

	describe('olView management', () => {


		it('it updates zoom and center', async () => {
			const element = await setup();
			const view = element._map.getView();
			const viewSpy = spyOn(view, 'animate');

			changeZoomAndCenter({ zoom: 5, center: fromLonLat([11, 48]) });

			expect(viewSpy).toHaveBeenCalledWith({
				zoom: 5,
				center: fromLonLat([11, 48]),
				duration: 500
			});
		});

		it('it fits to an extent', async (done) => {
			const element = await setup();
			const spy = spyOn(element, '_syncStore').and.callThrough();

			expect(element._viewSyncBlocked).toBeUndefined();
			fit({ extent: [fromLonLat([11, 48]), fromLonLat([11.5, 48.5])] });
			expect(store.getState().position.fitRequest).not.toBeNull();

			expect(element._viewSyncBlocked).toBeTrue();
			setTimeout(function () {
				//check if flag is reset
				expect(element._viewSyncBlocked).toBeFalse();
				//and store is in sync with view
				expect(spy).toHaveBeenCalled();
				//fit request ist reset
				expect(store.getState().position.fitRequest).toBeNull();
				done();

			}, 500);
		});
	});

	describe('olLayer management', () => {

		it('intial attaches one olLayer', async () => {
			const element = await setup();
			const map = element._map;

			expect(map.getLayers().getLength()).toBe(1);
		});

		it('adds an olLayer with default settings', async () => {
			const element = await setup();
			const map = element._map;

			addLayer('id0');

			expect(map.getLayers().getLength()).toBe(2);

			const layer = map.getLayers().item(1);
			expect(layer.get('id')).toBe('id0');
			expect(layer.getOpacity()).toBe(1);
			expect(layer.getVisible()).toBeTrue();
		});

		it('adds an olLayer with custom settings', async () => {
			const element = await setup();
			const map = element._map;

			addLayer('id0', { visible: false, opacity: .5 });

			expect(map.getLayers().getLength()).toBe(2);

			const layer = map.getLayers().item(1);
			expect(layer.get('id')).toBe('id0');
			expect(layer.getOpacity()).toBe(.5);
			expect(layer.getVisible()).toBeFalse();
		});

		it('adds an olLayer with custom index', async () => {
			const element = await setup();
			const map = element._map;

			addLayer('id0');
			addLayer('id1', { zIndex: 0 });
			expect(map.getLayers().getLength()).toBe(3);
			const layer1 = map.getLayers().item(1);
			expect(layer1.get('id')).toBe('id1');
			const layer0 = map.getLayers().item(2);
			expect(layer0.get('id')).toBe('id0');
		});

		it('does not add an olLayer to map AND removes layer from state store when georesource is NOT available ', async () => {
			const element = await setup();
			const map = element._map;
			expect(store.getState().layers.active.length).toBe(0);

			addLayer('id0');
			expect(map.getLayers().getLength()).toBe(2);
			expect(store.getState().layers.active.length).toBe(1);

			addLayer('unknown');
			expect(map.getLayers().getLength()).toBe(2);
			expect(store.getState().layers.active.length).toBe(1);
		});

		it('removes an olLayer', async () => {
			const element = await setup();
			const map = element._map;

			addLayer('id0');
			expect(map.getLayers().getLength()).toBe(2);

			removeLayer('id0');

			expect(map.getLayers().getLength()).toBe(1);
			expect(map.getLayers().item(0).get('id')).not.toBe('id0');
		});

		it('modifys the visibility of an olLayer', async () => {
			const element = await setup();
			const map = element._map;

			addLayer('id0');
			addLayer('id1');
			expect(map.getLayers().getLength()).toBe(3);

			modifyLayer('id0', { visible: false, opacity: .5 });

			const layer0 = map.getLayers().item(1);
			expect(layer0.get('id')).toBe('id0');
			expect(layer0.getVisible()).toBeFalse();
			expect(layer0.getOpacity()).toBe(.5);

			const layer1 = map.getLayers().item(2);
			expect(layer1.get('id')).toBe('id1');
			expect(layer1.getVisible()).toBeTrue();
			expect(layer1.getOpacity()).toBe(1);
		});

		it('modifys the z-index of an olLayer', async () => {
			const element = await setup();
			const map = element._map;

			addLayer('id0');
			addLayer('id1');
			expect(map.getLayers().getLength()).toBe(3);

			modifyLayer('id0', { zIndex: 2 });

			const layer0 = map.getLayers().item(1);
			expect(layer0.get('id')).toBe('id1');

			const layer1 = map.getLayers().item(2);
			expect(layer1.get('id')).toBe('id0');
		});
	});

	describe('contextmenue handler', () => {
		it('registers the handler', async () => {
			const registerSpy = spyOn(contextMenuEventHandlerMock, 'register');
			const element = await setup();

			expect(element._eventHandler.get('contextMenuEventHandlerMock')).toEqual(contextMenuEventHandlerMock);
			expect(registerSpy).toHaveBeenCalledOnceWith(element._map);
		});
	});
});