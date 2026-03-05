import { positionReducer } from '../../../src/store/position/position.reducer';
import {
	changeCenter,
	changeCenterAndRotation,
	changeLiveRotation,
	changeRotation,
	changeZoom,
	changeZoomAndCenter,
	changeZoomAndRotation,
	changeZoomCenterAndRotation,
	decreaseZoom,
	increaseZoom,
	fit,
	fitLayer,
	changeLiveCenter,
	changeLiveZoom
} from '../../../src/store/position/position.action';
import { TestUtils } from '../../test-utils.js';
import { $injector } from '../../../src/injection';

describe('positionReducer', () => {
	const initialZoomLevel = 12;
	const minZoom = 3;
	const maxZoom = 20;
	const zoomRaw = 10.2222;
	const zoomRounded = 10.222; // rounded to 3 decimal digits
	const centerRaw = [21.11111111, 21.11111111, 42.22222222, 42.22222222];
	const centerRounded = [21.1111111, 21.1111111, 42.2222222, 42.2222222]; // rounded to 7 decimal digits
	const rotationRaw = 0.444444;
	const rotationRounded = 0.44444; // rounded to 5 decimal digits
	const mapServiceMock = {
		getMinZoomLevel: () => minZoom,
		getMaxZoomLevel: () => maxZoom
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer
		});
		$injector.registerSingleton('MapService', mapServiceMock);
		return store;
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().position.zoom).toBe(initialZoomLevel);
		expect(store.getState().position.center).toEqual([1288239.2412306187, 6130212.561641981]);
		expect(store.getState().position.liveCenter).toEqual([1288239.2412306187, 6130212.561641981]);
		expect(store.getState().position.rotation).toBe(0);
		expect(store.getState().position.liveRotation).toBe(0);
		expect(store.getState().position.fitRequest.payload).toBeNull();
		expect(store.getState().position.fitLayerRequest.payload).toBeNull();
	});

	it("changes the 'zoom' property", () => {
		const store = setup();

		changeZoom(zoomRaw);

		expect(store.getState().position.zoom).toBe(zoomRounded);

		changeZoom(minZoom);

		expect(store.getState().position.zoom).toBe(minZoom);

		changeZoom(maxZoom);

		expect(store.getState().position.zoom).toBe(maxZoom);

		changeZoom(minZoom - 1);

		expect(store.getState().position.zoom).toBe(minZoom);

		changeZoom(maxZoom + 1);

		expect(store.getState().position.zoom).toBe(maxZoom);
	});

	it("changes the 'liveZoom' property", () => {
		const store = setup();

		changeLiveZoom(zoomRaw);

		expect(store.getState().position.liveZoom).toBe(zoomRounded);

		changeLiveZoom(minZoom);

		expect(store.getState().position.liveZoom).toBe(minZoom);

		changeLiveZoom(maxZoom);

		expect(store.getState().position.liveZoom).toBe(maxZoom);

		changeLiveZoom(minZoom - 1);

		expect(store.getState().position.liveZoom).toBe(minZoom);

		changeLiveZoom(maxZoom + 1);

		expect(store.getState().position.liveZoom).toBe(maxZoom);
	});

	it("changes 'zoom' and  'rotation' property", () => {
		const store = setup();

		changeZoomAndRotation({ zoom: zoomRaw, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(zoomRounded);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomAndRotation({ zoom: minZoom, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(minZoom);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomAndRotation({ zoom: maxZoom, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(maxZoom);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomAndRotation({ zoom: minZoom - 1, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(minZoom);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomAndRotation({ zoom: maxZoom + 1, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(maxZoom);
		expect(store.getState().position.rotation).toBe(rotationRounded);
	});

	it("changes the 'center' property", () => {
		const store = setup();

		changeCenter(centerRaw);

		expect(store.getState().position.center).toEqual(centerRounded);
	});

	it("changes the 'liveCenter' property", () => {
		const store = setup();

		changeLiveCenter(centerRaw);

		expect(store.getState().position.liveCenter).toEqual(centerRounded);
	});

	it("changes the 'center'  'rotation' property", () => {
		const store = setup();

		changeCenterAndRotation({ center: centerRaw, rotation: rotationRaw });

		expect(store.getState().position.center).toEqual(centerRounded);
		expect(store.getState().position.rotation).toBe(rotationRounded);
	});

	it("changes the 'rotation' property", () => {
		const store = setup();

		changeRotation(rotationRaw);

		expect(store.getState().position.rotation).toBe(rotationRounded);
	});

	it("changes the 'liveRotation' property", () => {
		const store = setup();

		changeLiveRotation(0.8);

		expect(store.getState().position.liveRotation).toBe(0.8);
	});

	it("changes 'zoom' and  'center' property", () => {
		const store = setup();

		changeZoomAndCenter({ zoom: zoomRaw, center: centerRaw });

		expect(store.getState().position.zoom).toBe(zoomRounded);
		expect(store.getState().position.center).toEqual(centerRounded);

		changeZoomAndCenter({ zoom: minZoom, center: centerRaw });

		expect(store.getState().position.zoom).toBe(minZoom);
		expect(store.getState().position.center).toEqual(centerRounded);

		changeZoomAndCenter({ zoom: maxZoom, center: centerRaw });

		expect(store.getState().position.zoom).toBe(maxZoom);
		expect(store.getState().position.center).toEqual(centerRounded);

		changeZoomAndCenter({ zoom: minZoom - 1, center: centerRaw });

		expect(store.getState().position.zoom).toBe(minZoom);
		expect(store.getState().position.center).toEqual(centerRounded);

		changeZoomAndCenter({ zoom: maxZoom + 1, center: centerRaw });

		expect(store.getState().position.zoom).toBe(maxZoom);
		expect(store.getState().position.center).toEqual(centerRounded);
	});

	it("changes 'zoom',  'center' and  'rotation' property", () => {
		const store = setup();

		changeZoomCenterAndRotation({ zoom: zoomRaw, center: centerRaw, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(zoomRounded);
		expect(store.getState().position.center).toEqual(centerRounded);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomCenterAndRotation({ zoom: minZoom, center: centerRaw, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(minZoom);
		expect(store.getState().position.center).toEqual(centerRounded);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomCenterAndRotation({ zoom: maxZoom, center: centerRaw, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(maxZoom);
		expect(store.getState().position.center).toEqual(centerRounded);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomCenterAndRotation({ zoom: minZoom - 1, center: centerRaw, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(minZoom);
		expect(store.getState().position.center).toEqual(centerRounded);
		expect(store.getState().position.rotation).toBe(rotationRounded);

		changeZoomCenterAndRotation({ zoom: maxZoom + 1, center: centerRaw, rotation: rotationRaw });

		expect(store.getState().position.zoom).toBe(maxZoom);
		expect(store.getState().position.center).toEqual(centerRounded);
		expect(store.getState().position.rotation).toBe(rotationRounded);
	});

	it("increases the 'zoom' property by plus one", () => {
		const store = setup({
			position: {
				zoom: 18
			}
		});

		increaseZoom();

		expect(store.getState().position.zoom).toBe(19);

		increaseZoom();
		increaseZoom();
		increaseZoom();

		expect(store.getState().position.zoom).toBe(maxZoom);
	});

	it("decreases the 'zoom' property by minus one", () => {
		const store = setup({
			position: {
				zoom: 5
			}
		});

		decreaseZoom();

		expect(store.getState().position.zoom).toBe(4);

		decreaseZoom();
		decreaseZoom();
		decreaseZoom();

		expect(store.getState().position.zoom).toBe(minZoom);
	});

	it("places a 'fitRequest' property", () => {
		const store = setup();

		fit([21, 21, 42, 42], { maxZoom: 42 });

		expect(store.getState().position.fitRequest.payload.extent).toEqual([21, 21, 42, 42]);
		expect(store.getState().position.fitRequest.payload.options).toEqual({ maxZoom: 42, useVisibleViewport: true });

		fit([21, 21, 42, 42], { useVisibleViewport: false });

		expect(store.getState().position.fitRequest.payload.extent).toEqual([21, 21, 42, 42]);
		expect(store.getState().position.fitRequest.payload.options).toEqual({ useVisibleViewport: false });

		fit([22, 22, 43, 43]);

		expect(store.getState().position.fitRequest.payload.extent).toEqual([22, 22, 43, 43]);
		expect(store.getState().position.fitRequest.payload.options).toEqual({ useVisibleViewport: true });
	});

	it("places a 'fitLayerRequest' property", () => {
		const store = setup();

		fitLayer('foo', { maxZoom: 42 });

		expect(store.getState().position.fitLayerRequest.payload.id).toBe('foo');
		expect(store.getState().position.fitLayerRequest.payload.options).toEqual({ maxZoom: 42, useVisibleViewport: true });

		fitLayer('foo', { useVisibleViewport: false });

		expect(store.getState().position.fitLayerRequest.payload.id).toBe('foo');
		expect(store.getState().position.fitLayerRequest.payload.options).toEqual({ useVisibleViewport: false });

		fitLayer('bar');

		expect(store.getState().position.fitLayerRequest.payload.id).toBe('bar');
		expect(store.getState().position.fitLayerRequest.payload.options).toEqual({ useVisibleViewport: true });
	});
});
