/* eslint-disable no-undef */
import { OlMap } from '../../../../src/modules/map/components/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '../../../test-utils.js';
import { mapReducer } from '../../../../src/modules/map/store/olMap.reducer';
import { MapBrowserEvent, MapEvent } from 'ol';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import MapEventType from 'ol/MapEventType';
import Event from 'ol/events/Event';
import { contextMenueReducer } from '../../../../src/modules/contextMenue/store/contextMenue.reducer';
import { $injector } from '../../../../src/injection';
import { layersReducer } from '../../../../src/modules/map/store/layers/layers.reducer';
import { WmsGeoResource } from '../../../../src/services/domain/geoResources';
import { addLayer, modifyLayer, removeLayer } from '../../../../src/modules/map/store/layers/layers.action';

window.customElements.define(OlMap.tag, OlMap);


describe('OlMap', () => {

	const initialPosition = fromLonLat([11.57245, 48.14021]);

	let store;
	let element;

	beforeEach(async () => {

		const state = {
			map: {
				zoom: 10,
				position: initialPosition
			},
			layers: {
				active: [],
				background: null
			}
		};

		store = TestUtils.setupStoreAndDi(state, {
			map: mapReducer,
			layers: layersReducer
		});

		$injector.registerSingleton('ShareService', {
			copyToClipboard: () => { }
		});
		$injector.registerSingleton('GeoResourceService', {
			async byId(id) {
				switch (id) {
					case 'id0':
						return new WmsGeoResource(id, 'Label0', 'https://something0.url', 'layer0', 'image/png');
					case 'id1':
						return new WmsGeoResource(id, 'Label1', 'https://something1.url', 'layer1', 'image/png');
				}
				return Promise.reject('no georesource found for ' + id);
			}
		});

		element = await TestUtils.render(OlMap.tag);
	});

	function simulateMouseEvent(type, x, y, dragging) {
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
	}

	function simulateMapEvent(type) {
		const map = element._map;
		const mapEvent = new MapEvent(type, map, map.frameState);

		map.dispatchEvent(mapEvent);
	}

	describe('when initialized', () => {
		it('configures the map and adds a div which contains the ol-map', async () => {
			// nothing for arrange and act

			// assert
			expect(element._view.getZoom()).toBe(10);
			expect(element._view.getCenter()).toEqual(initialPosition);
			expect(element.shadowRoot.querySelector('#ol-map')).toBeTruthy();
		});
	});


	describe('when clicked', () => {
		it('emits event', async () => {
			spyOn(element, 'emitEvent');

			simulateMouseEvent(MapBrowserEventType.SINGLECLICK, 0, 0);

			expect(element.emitEvent).toHaveBeenCalledWith('map_clicked', null);
		});
	});

	describe('when map move', () => {
		it('change state from view properties', async () => {
			const view = element._view;
			spyOn(view, 'getZoom');
			spyOn(view, 'getCenter');

			simulateMapEvent(MapEventType.MOVEEND);

			expect(view.getZoom).toHaveBeenCalledTimes(1);
			expect(view.getCenter).toHaveBeenCalledTimes(1);
		});
	});

	describe('when pointer move', () => {
		it('pointer position store is updated', async () => {
			const map = element._map;
			const pointerPosition = ['foo', 'bar'];
			spyOn(map, 'getEventCoordinate').and.returnValue(pointerPosition);

			simulateMouseEvent(MapBrowserEventType.POINTERMOVE, 10, 0);

			expect(store.getState().map.pointerPosition).toBe(pointerPosition);
		});
	});

	describe('when mouse is dragging', () => {
		it('do NOT store pointerPosition', async () => {
			const map = element._map;
			const pointerPosition = [99, 99];
			spyOn(map, 'getEventCoordinate').and.returnValue(pointerPosition);

			simulateMouseEvent(MapBrowserEventType.POINTERMOVE, 10, 0, true);

			expect(store.getState().map.pointerPosition).toBeUndefined();
		});
	});

	describe('when contextmenu (i.e. with right-click) is performed', () => {


		it('do store valid contextMenuData', async () => {
			const customEventType = 'contextmenu';
			const state = {
				map: {
					zoom: 10,
					position: initialPosition
				},
				contextMenue: { data: { pointer: false, commands: false } }
			};

			store = TestUtils.setupStoreAndDi(state, {
				map: mapReducer,
				contextMenue: contextMenueReducer
			});

			simulateMouseEvent(customEventType, 10, 0);
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

	describe('layer management', () => {

		it('intial attaches one layer', () => {
			const map = element._map;

			expect(map.getLayers().getLength()).toBe(1);
		});

		/**
		 * Note: Layers are added to map asynchronously. We do not get a Promise
		 * or something like that. Therefore we use simple callbacks here,  
		 * which are jasmine's low-level mechanism for that case:
		 * https://jasmine.github.io/tutorials/async
		 */
		it('adds a layer with default settings', (done) => {
			const map = element._map;

			addLayer('id0');

			setTimeout(() => {
				expect(map.getLayers().getLength()).toBe(2);

				const layer = map.getLayers().item(1);
				expect(layer.get('id')).toBe('id0');
				expect(layer.getOpacity()).toBe(1);
				expect(layer.getVisible()).toBeTrue();

				done();
			});
		});

		it('adds a layer with custom settings', (done) => {
			const map = element._map;

			addLayer('id0', { visible: false, opacity: .5 });

			setTimeout(() => {
				expect(map.getLayers().getLength()).toBe(2);

				const layer = map.getLayers().item(1);
				expect(layer.get('id')).toBe('id0');
				expect(layer.getOpacity()).toBe(.5);
				expect(layer.getVisible()).toBeFalse();

				done();
			});
		});

		it('adds a layer with custom index', (done) => {
			const map = element._map;

			addLayer('id0');

			setTimeout(() => {

				addLayer('id1', { zIndex: 0 });
				setTimeout(() => {
					expect(map.getLayers().getLength()).toBe(3);
					const layer1 = map.getLayers().item(1);
					expect(layer1.get('id')).toBe('id1');
					const layer0 = map.getLayers().item(2);
					expect(layer0.get('id')).toBe('id0');

					done();
				});
			});
		});

		it('removes a layer', (done) => {
			const map = element._map;

			addLayer('id0');

			setTimeout(() => {
				expect(map.getLayers().getLength()).toBe(2);

				removeLayer('id0');

				expect(map.getLayers().getLength()).toBe(1);
				expect(map.getLayers().item(0).get('id')).not.toBe('id0');

				done();
			});
		});

		it('modifys the visibility of a layer', (done) => {
			const map = element._map;

			addLayer('id0');

			setTimeout(() => {

				addLayer('id1');
				setTimeout(() => {
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

					done();
				});
			});
		});

		it('modifys the z-index of a layer', (done) => {
			const map = element._map;

			addLayer('id0');

			setTimeout(() => {

				addLayer('id1');
				setTimeout(() => {
					expect(map.getLayers().getLength()).toBe(3);

					modifyLayer('id0', { zIndex: 2 });

					const layer0 = map.getLayers().item(1);
					expect(layer0.get('id')).toBe('id1');

					const layer1 = map.getLayers().item(2);
					expect(layer1.get('id')).toBe('id0');

					done();
				});
			});
		});
	});
});