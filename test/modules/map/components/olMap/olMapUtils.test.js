import BaseLayer from 'ol/layer/Base';
import { Map } from 'ol';
import {  registerLongPressListener, toOlLayerFromHandler, updateOlLayer } from '../../../../../src/modules/map/components/olMap/olMapUtils';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { simulateMouseEvent } from './mapTestUtils';


describe('olMapUtils', () => {

	describe('updateOlLayer', () => {
		it('updates the properties of a olLayer', () => {

			const olLayer = new BaseLayer({});
			const layer = { visible: false, opacity: .5 };

			updateOlLayer(olLayer, layer);

			expect(olLayer.getVisible()).toBeFalse();
			expect(olLayer.getOpacity()).toBe(.5);
		});
	});

	describe('toOlLayerFromHandler', () => {
		it('retrieves an olLayer from a handler', () => {
			const mockHandler = {
				activate() { }
			};
			const map = new Map();
			const olLayer = new BaseLayer({});
			spyOn(mockHandler, 'activate').withArgs(map).and.returnValue(olLayer);

			const myLayer = toOlLayerFromHandler('someId', mockHandler, map);

			expect(myLayer.get('id')).toBe('someId');
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

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay - 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).not.toHaveBeenCalled();
		});

		it('register a listener on long press events with default delay (II)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(jasmine.objectContaining(
				{
					type: MapBrowserEventType.POINTERDOWN
				}
			));
		});

		it('register a listener on long press events with default delay (III)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			//a second pointer event!
			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(jasmine.objectContaining(
				{
					type: MapBrowserEventType.POINTERDOWN
				}
			));
		});

		it('register a listener on long press events with custom delay', () => {
			const customDelay = 100;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy, customDelay);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			jasmine.clock().tick(customDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalledWith(jasmine.objectContaining(
				{
					type: MapBrowserEventType.POINTERDOWN
				}
			));
		});

		it('cancels the timeout on pointer move with dragging)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0, true);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).not.toHaveBeenCalled();
		});
	});
});
