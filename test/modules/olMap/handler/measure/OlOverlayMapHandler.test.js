import { TestUtils } from '@test/test-utils.js';
import { OlOverlayMapHandler } from '@src/modules/olMap/handler/measure/OlOverlayMapHandler';
import { View, Map, Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';
import { ObjectEvent } from 'ol/Object';
import { BaOverlay } from '@src/modules/olMap/components/BaOverlay';
import { $injector } from '@src/injection';

window.customElements.define(BaOverlay.tag, BaOverlay);

describe('OlOverlayMapHandler', () => {
	const initCoordinate = fromLonLat([11, 48]);
	const defaultState = {};

	const setup = (state = defaultState) => {
		const store = TestUtils.setupStoreAndDi(state);

		$injector
			.registerSingleton('UnitsService', {
				// eslint-disable-next-line no-unused-vars
				formatDistance: (distance, decimals) => {
					return { value: distance, localizedValue: distance, unit: 'm' };
				},
				// eslint-disable-next-line no-unused-vars
				formatArea: (area, decimals) => {
					return { value: area, localizedValue: area, unit: 'm²' };
				}
			})
			.registerSingleton('MapService', { getSrid: () => 3857, getLocalProjectedSrid: () => 25832, getLocalProjectedSridExtent: () => null });

		return store;
	};

	const setupMap = () => {
		const container = document.createElement('div');
		container.style.height = '100px';
		container.style.width = '100px';
		document.body.appendChild(container);

		return new Map({
			target: container,
			view: new View({
				center: initCoordinate,
				zoom: 1
			})
		});
	};

	const createOverlay = (position = fromLonLat([0, 0], 'EPSG:3857')) => {
		return new Overlay({ element: new BaOverlay(), position: position });
	};

	describe('constructor', () => {
		it('initializes members', async () => {
			setup();

			const instanceUnderTest = new OlOverlayMapHandler();
			expect(instanceUnderTest._map).toBeNull();
			expect(instanceUnderTest._map).not.toBeUndefined();
		});
	});

	it('instantiates the handler', () => {
		setup();
		const handler = new OlOverlayMapHandler();

		expect(handler).toBeTruthy();
		expect(handler.id).toBe('Overlay_Handler');
		expect(handler.register).toBeDefined();
	});

	describe('when view changes', () => {
		it('listens to view center events', async () => {
			setup();
			const map = setupMap();
			const view = map.getView();
			const overlaysMock = { getArray: () => [createOverlay(), createOverlay(), createOverlay()] };
			vi.spyOn(map, 'getOverlays').mockImplementation(() => overlaysMock);

			const instanceUnderTest = new OlOverlayMapHandler();
			const updateSpy = vi.spyOn(instanceUnderTest, '_updatePosition').mockImplementation(() => {});

			instanceUnderTest.register(map);
			view.dispatchEvent(new ObjectEvent('change:center'));

			expect(updateSpy).toHaveBeenCalledTimes(3);
		});

		it('calculates min/max offset right', async () => {
			setup();
			const map = setupMap();
			const view = map.getView();
			map.getView().setCenter(fromLonLat([11 + 360, 48]));
			const overlaysMock = { getArray: () => [createOverlay(), createOverlay(), createOverlay()] };
			vi.spyOn(map, 'getOverlays').mockImplementation(() => overlaysMock);

			const instanceUnderTest = new OlOverlayMapHandler();
			const updateSpy = vi.spyOn(instanceUnderTest, '_updatePosition').mockImplementation(() => {});

			instanceUnderTest.register(map);
			view.dispatchEvent(new ObjectEvent('change:center'));

			expect(updateSpy).toHaveBeenCalledWith(expect.any(Object), expect.any(Array), [0, 1]);
		});

		it('calculates min/max offset left', async () => {
			setup();
			const map = setupMap();
			const view = map.getView();
			map.getView().setCenter(fromLonLat([11 - 360, 48]));
			const overlaysMock = { getArray: () => [createOverlay(), createOverlay(), createOverlay()] };
			vi.spyOn(map, 'getOverlays').mockImplementation(() => overlaysMock);

			const instanceUnderTest = new OlOverlayMapHandler();
			const updateSpy = vi.spyOn(instanceUnderTest, '_updatePosition').mockImplementation(() => {});

			instanceUnderTest.register(map);
			view.dispatchEvent(new ObjectEvent('change:center'));

			expect(updateSpy).toHaveBeenCalledWith(expect.any(Object), expect.any(Array), [-1, 0]);
		});

		it('skips calculation without any overlay', async () => {
			setup();
			const map = setupMap();
			const view = map.getView();
			map.getView().setCenter(fromLonLat([11 + 360, 48]));
			const overlaysMock = { getArray: () => [] };
			vi.spyOn(map, 'getOverlays').mockImplementation(() => overlaysMock);

			const instanceUnderTest = new OlOverlayMapHandler();
			const updateSpy = vi.spyOn(instanceUnderTest, '_updatePosition').mockImplementation(() => {});

			instanceUnderTest.register(map);
			view.dispatchEvent(new ObjectEvent('change:center'));

			expect(updateSpy).not.toHaveBeenCalled();
		});
	});

	describe('_updatePosition', () => {
		it('updates the overlay position', () => {
			setup();
			const map = setupMap();
			map.getView().setCenter(initCoordinate);
			const viewExtent = map.getView().calculateExtent(map.getSize());
			const offsetMinMax = [0, 0];

			const overlayRight = createOverlay(fromLonLat([11 + 360, 48], 'EPSG:3857'));
			const overlayCenter = createOverlay(fromLonLat([11, 48], 'EPSG:3857'));
			const overlayLeft = createOverlay(fromLonLat([11 - 360, 48], 'EPSG:3857'));
			const overlayOut = createOverlay(fromLonLat([-60, 60], 'EPSG:3857'));
			const positionRightSpy = vi.spyOn(overlayRight, 'setPosition');
			const positionCenterSpy = vi.spyOn(overlayCenter, 'setPosition');
			const positionLeftSpy = vi.spyOn(overlayLeft, 'setPosition');
			const positionOutSpy = vi.spyOn(overlayOut, 'setPosition');

			const instanceUnderTest = new OlOverlayMapHandler();
			instanceUnderTest.register(map);
			instanceUnderTest._updatePosition(overlayRight, viewExtent, offsetMinMax);
			instanceUnderTest._updatePosition(overlayCenter, viewExtent, offsetMinMax);
			instanceUnderTest._updatePosition(overlayLeft, viewExtent, offsetMinMax);
			instanceUnderTest._updatePosition(overlayOut, viewExtent, offsetMinMax);

			expect(positionRightSpy).toHaveBeenCalled();
			expect(positionCenterSpy).not.toHaveBeenCalled();
			expect(positionLeftSpy).toHaveBeenCalled();
			expect(positionOutSpy).not.toHaveBeenCalled();
		});
	});
});
