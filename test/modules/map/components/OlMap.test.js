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
			}
		};

		store = TestUtils.setupStoreAndDi(state, {
			map: mapReducer
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
			// arrange
			spyOn(element, 'emitEvent');

			// act
			simulateMouseEvent(MapBrowserEventType.SINGLECLICK, 0, 0);

			// assert
			expect(element.emitEvent).toHaveBeenCalledWith('map_clicked', null);
		});
	});

	describe('when map move', () => {
		it('change state from view properties', async () => {
			// arange
			const view = element._view;
			spyOn(view, 'getZoom');
			spyOn(view, 'getCenter');

			// act
			simulateMapEvent(MapEventType.MOVEEND);

			// assert
			expect(view.getZoom).toHaveBeenCalledTimes(1);
			expect(view.getCenter).toHaveBeenCalledTimes(1);
		});
	});

	describe('when pointer move', () => {
		it('pointer position store is updated', async () => {
			// arrange
			const map = element._map;
			const pointerPosition = ['foo', 'bar'];
			spyOn(map, 'getEventCoordinate').and.returnValue(pointerPosition);

			// act
			simulateMouseEvent(MapBrowserEventType.POINTERMOVE, 10, 0);

			// assert
			expect(store.getState().map.pointerPosition).toBe(pointerPosition);
		});
	});

	describe('when mouse is dragging', () => {
		it('do NOT store pointerPosition', async () => {
			// arrange
			const map = element._map;
			const pointerPosition = [99, 99];
			spyOn(map, 'getEventCoordinate').and.returnValue(pointerPosition);

			// act
			simulateMouseEvent(MapBrowserEventType.POINTERMOVE, 10, 0, true);

			// assert
			expect(store.getState().map.pointerPosition).toBeUndefined();
		});
	});

	describe('when contextmenu (i.e. with right-click) is performed', () => {


		it('do store valid contextMenuData', async () => {
			// arrange
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

			// act
			simulateMouseEvent(customEventType, 10, 0);
			const actualCommands = store.getState().contextMenue.data.commands;
			const actualPointer = store.getState().contextMenue.data.pointer;

			// assert
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
});