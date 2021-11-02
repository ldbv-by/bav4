import BaseLayer from 'ol/layer/Base';
import { Map } from 'ol';
import { isEmptyLayer, registerLongPressListener, requestMapFocus, toOlLayerFromHandler, updateOlLayer } from '../../../../../src/modules/map/components/olMap/olMapUtils';
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

		it('it passes return values from a handler', () => {
			const mockHandler = {
				activate() { }
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

		it('does nothing on pointer move WITHOUT dragging)', () => {
			const defaultDelay = 300;
			const spy = jasmine.createSpy();
			const map = new Map();
			registerLongPressListener(map, spy);

			simulateMouseEvent(map, MapBrowserEventType.POINTERDOWN);
			simulateMouseEvent(map, MapBrowserEventType.POINTERMOVE, 0, 0, false);
			jasmine.clock().tick(defaultDelay + 100);
			simulateMouseEvent(map, MapBrowserEventType.POINTERUP);

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('isEmptyLayer', () => {
		it('evaluates the layer-object', () => {
			const emptyLayerMock = {
				getSource() {
					return {
						getFeatures() {
							return [];
						}
					};
				}
			};

			const filledLayerMock = {
				getSource() {
					return {
						getFeatures() {
							return [{}, {}];
						}
					};
				}
			};
			expect(isEmptyLayer(emptyLayerMock)).toBeTrue();
			expect(isEmptyLayer(filledLayerMock)).toBeFalse();
			expect(isEmptyLayer(null)).toBeTrue();
			expect(isEmptyLayer(undefined)).toBeTrue();
		});
	});

	describe('requestMapFocus', () => {
		it('simulates a ClickEvent to the map', () => {
			const viewMock = { getCenter: () => [0, 0] };
			const mapMock = { getView: () => viewMock,
				getViewport: () => {
					const viewPort = { firstChild: true };
					return viewPort;
				},
				dispatchEvent: () => {} };

			const mapMouseEventSpy = spyOn(mapMock, 'dispatchEvent');
			requestMapFocus(mapMock);

			expect(mapMouseEventSpy).toHaveBeenCalledWith(jasmine.objectContaining({ coordinate: [0, 0] }));
		});
	});
});
