import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group.js';
import { Map } from 'ol';
import {
	getLayerById,
	getLayerGroup,
	registerLongPressListener,
	toOlLayerFromHandler,
	updateOlLayer
} from '../../../../src/modules/olMap/utils/olMapUtils';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { simulateMapBrowserEvent } from '../mapTestUtils';

describe('olMapUtils', () => {
	describe('updateOlLayer', () => {
		it('updates the properties of a olLayer', () => {
			const olLayer = new BaseLayer({});
			const layer = { visible: false, opacity: 0.5, timestamp: '20001231' };

			updateOlLayer(olLayer, layer);

			expect(olLayer.getVisible()).toBeFalse();
			expect(olLayer.getOpacity()).toBe(0.5);
			expect(olLayer.get('timestamp')).toBe('20001231');
		});
	});

	describe('toOlLayerFromHandler', () => {
		it('retrieves an olLayer from a handler', () => {
			const mockHandler = {
				activate() {}
			};
			const map = new Map();
			const olLayer = new BaseLayer({});
			spyOn(mockHandler, 'activate').withArgs(map).and.returnValue(olLayer);

			const myLayer = toOlLayerFromHandler('someId', mockHandler, map);

			expect(myLayer.get('id')).toBe('someId');
		});

		it('retrieves an olLayer from a handler', () => {
			const mockHandler = {
				activate() {}
			};
			const map = new Map();
			const olLayer = new BaseLayer({});
			spyOn(mockHandler, 'activate').withArgs(map).and.returnValue(olLayer);

			const myLayer = toOlLayerFromHandler('someId', mockHandler, map);

			expect(myLayer.get('id')).toBe('someId');
		});

		it('passes return values from a handler', () => {
			const mockHandler = {
				activate() {}
			};
			const map = new Map();
			spyOn(mockHandler, 'activate').withArgs(map).and.returnValue(null);

			const myLayer = toOlLayerFromHandler('someId', mockHandler, map);

			expect(myLayer).toBeNull();
		});
	});

	describe('registerLongPressListener', () => {
		beforeEach(async () => {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('register a listener on long press events with default delay (I)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay - 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).not.toHaveBeenCalled();
		});

		it('register a listener on long press events with default delay (II)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(
				jasmine.objectContaining({
					type: MapBrowserEventType.POINTERDOWN
				})
			);
		});

		it('register a listener on long press events with default delay (III)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			//a second pointer event!
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(
				jasmine.objectContaining({
					type: MapBrowserEventType.POINTERDOWN
				})
			);
		});

		it('register a listener on long AND shot press events with default delay (I)', () => {
			const defaultDelay = 300;
			const longPressSpy = jasmine.createSpy();
			const shortPressSpy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, longPressSpy, shortPressSpy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay - 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(longPressSpy).not.toHaveBeenCalled();
			expect(shortPressSpy).toHaveBeenCalled();
		});

		it('register a listener on long AND shot press events with default delay (II)', () => {
			const defaultDelay = 300;
			const longPressSpy = jasmine.createSpy();
			const shortPressSpy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, longPressSpy, shortPressSpy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(longPressSpy).toHaveBeenCalled();
			expect(shortPressSpy).not.toHaveBeenCalled();
		});

		it('register a listener on long press events with custom delay', () => {
			const customDelay = 100;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy, null, customDelay);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(customDelay + 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(
				jasmine.objectContaining({
					type: MapBrowserEventType.POINTERDOWN
				})
			);
		});

		it('cancels the timeout on pointer move with dragging)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0, true);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).not.toHaveBeenCalled();
		});

		it('does nothing on pointer move WITHOUT dragging)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERDOWN);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0, false);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMapBrowserEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('getLayerById', () => {
		it('returns the desired layer', () => {
			const map = new Map();
			const olLayer = new BaseLayer({ properties: { id: 'foo' } });
			map.addLayer(olLayer);

			expect(getLayerById(map, 'foo')).toEqual(olLayer);
			expect(getLayerById(map, 'bar')).toBeNull();
			expect(getLayerById(map, undefined)).toBeNull();
			expect(getLayerById(undefined, 'bar')).toBeNull();
		});
	});

	describe('getLayerGroup', () => {
		it('returns the corresponding group layer or null', () => {
			const map = new Map();
			const olLayer0 = new BaseLayer({ properties: { id: 'l0' } });
			const olLayer1 = new BaseLayer({ properties: { id: 'l1' } });
			const olLayer2 = new BaseLayer({ properties: { id: 'l2' } });
			const olGroupLayer0 = new LayerGroup({ properties: { id: 'gr0' }, layers: [olLayer0] });
			const olGroupLayer1 = new LayerGroup({ properties: { id: 'gr1' }, layers: [olLayer1] });
			map.addLayer(olGroupLayer0);
			map.addLayer(olGroupLayer1);

			expect(getLayerGroup(map, olLayer0)).toEqual(olGroupLayer0);
			expect(getLayerGroup(map, olLayer1)).toEqual(olGroupLayer1);
			expect(getLayerGroup(map, olLayer2)).toBeNull();
			expect(getLayerGroup(new Map(), olLayer2)).toBeNull();
			expect(getLayerGroup(map, undefined)).toBeNull();
			expect(getLayerGroup(undefined, olLayer0)).toBeNull();
		});
	});
});
