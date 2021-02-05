/* eslint-disable no-undef */
import { OlMap } from '../../../../../src/modules/map/components/olMap/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '../../../../test-utils.js';
import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { MapBrowserEvent, MapEvent } from 'ol';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';
import Event from 'ol/events/Event';
import { contextMenueReducer } from '../../../../../src/modules/contextMenue/store/contextMenue.reducer';
import { $injector } from '../../../../../src/injection';
import { layersReducer } from '../../../../../src/modules/map/store/layers.reducer';
import { WmsGeoResource } from '../../../../../src/services/domain/geoResources';
import { addLayer, modifyLayer, removeLayer } from '../../../../../src/modules/map/store/layers.action';
import { activate, deactivate } from '../../../../../src/modules/map/store/measurement.action';
import { measurementReducer } from '../../../../../src/modules/map/store/measurement.reducer';

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

	const measurementHandlerMock = {
		activate() { },
		deactivate() { }
	};

	let store;

	const setup = (state) => {
		const defaultState = {
			position: {
				zoom: 10,
				center: initialCenter
			},
			layers: {
				active: [],
				background: null
			},
			measurement: { active: false }
		};
		const combinedState = {
			...defaultState,
			...state
		};

		store = TestUtils.setupStoreAndDi(combinedState, {
			position: positionReducer,
			layers: layersReducer,
			measurement: measurementReducer
		});

		$injector
			.registerSingleton('ShareService', {
				copyToClipboard: () => { }
			})
			.registerSingleton('GeoResourceService', geoResourceServiceStub)
			.registerSingleton('OlMeasurementHandler', measurementHandlerMock);

		return TestUtils.render(OlMap.tag);
	};


	const simulateMouseEvent = (element, type, x, y, dragging) => {
		const map = element._map;
		const eventType = type;

		const event = new Event(eventType);
		event.target = map.getViewport().firstChild;
		event.clientX = x;
		event.clientY = y;
		event.pageX = x;
		event.pageY = y;
		event.shiftKey = false;
		event.preventDefault = function () { };


		let mapEvent = new MapBrowserEvent(eventType, map, event);
		mapEvent.dragging = dragging ? dragging : false;
		map.dispatchEvent(mapEvent);
	};

	const simulateMapEvent = (element, type) => {
		const map = element._map;
		const mapEvent = new MapEvent(type, map, map.frameState);

		map.dispatchEvent(mapEvent);
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


	describe('when clicked', () => {
		it('emits event', async () => {
			const element = await setup();
			spyOn(element, 'emitEvent');

			simulateMouseEvent(element, MapBrowserEventType.SINGLECLICK, 0, 0);

			expect(element.emitEvent).toHaveBeenCalledWith('map_clicked', null);
		});
	});

	describe('when map move', () => {
		it('change state from view properties', async () => {
			const element = await setup();
			const view = element._view;
			spyOn(view, 'getZoom');
			spyOn(view, 'getCenter');

			simulateMapEvent(element, MapEventType.MOVEEND);

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

			simulateMouseEvent(element, MapBrowserEventType.POINTERMOVE, 10, 0);

			expect(store.getState().position.pointerPosition).toBe(pointerPosition);
		});
	});

	describe('when mouse is dragging', () => {
		it('do NOT store pointerPosition', async () => {
			const element = await setup();
			const map = element._map;
			const pointerPosition = [99, 99];
			spyOn(map, 'getEventCoordinate').and.returnValue(pointerPosition);

			simulateMouseEvent(element, MapBrowserEventType.POINTERMOVE, 10, 0, true);

			expect(store.getState().position.pointerPosition).toBeUndefined();
		});
	});

	describe('when contextmenu (i.e. with right-click) is performed', () => {

		it('do store valid contextMenuData', async () => {
			const element = await setup();
			const customEventType = 'contextmenu';
			const state = {
				position: {
					zoom: 10,
					center: initialCenter
				},
				contextMenue: { data: { pointer: false, commands: false } }
			};

			store = TestUtils.setupStoreAndDi(state, {
				position: positionReducer,
				contextMenue: contextMenueReducer
			});

			simulateMouseEvent(element, customEventType, 10, 0);
			const actualCommands = store.getState().contextMenue.data.commands;
			const actualPointer = store.getState().contextMenue.data.pointer;

			expect(actualPointer).toEqual({ x: 10, y: 0 });
			expect(actualCommands.length).toBe(2);
			expect(actualCommands[0].label).toBe('Copy Coordinates');
			expect(actualCommands[0].action).not.toBeUndefined();
			expect(actualCommands[0].shortCut).toBe('[CTRL] + C');
			expect(actualCommands[1].label).toBe('Hello');
			expect(actualCommands[1].action).not.toBeUndefined();
			expect(actualCommands[1].shortCut).toBeUndefined();
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

	describe('measurement handler', () => {

		it('activates the handler', async () => {
			const spy = spyOn(measurementHandlerMock, 'activate');
			const element = await setup();
			const map = element._map;


			activate();

			expect(spy).toHaveBeenCalledWith(map);
		});

		it('deactivates the handler', async () => {
			const spy = spyOn(measurementHandlerMock, 'deactivate');
			const element = await setup({ measurement: { active: true } });
			const map = element._map;


			deactivate();

			expect(spy).toHaveBeenCalledWith(map);
		});
	});
});