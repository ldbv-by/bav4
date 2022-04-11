import { positionReducer } from '../../../src/store/position/position.reducer';
import { changeCenter, changeCenterAndRotation, changeLiveRotation, changeRotation, changeZoom, changeZoomAndCenter, changeZoomAndRotation, changeZoomCenterAndRotation, decreaseZoom, increaseZoom, setFit } from '../../../src/store/position/position.action';
import { TestUtils } from '../../test-utils.js';
import { $injector } from '../../../src/injection';


describe('positionReducer', () => {
	const initialZoomLevel = 12;
	const minZoomLevel = 3;
	const maxZoomLevel = 20;
	const mapServiceMock = {
		getMinZoomLevel: () => minZoomLevel,
		getMaxZoomLevel: () => maxZoomLevel
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			position: positionReducer
		});
		$injector.registerSingleton('MapService', mapServiceMock);
		return store;
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().position.zoom).toBe(initialZoomLevel);
		expect(store.getState().position.center).toEqual([1288239.2412306187, 6130212.561641981]);
		expect(store.getState().position.rotation).toBe(0);
		expect(store.getState().position.liveRotation).toBe(0);
		expect(store.getState().position.fitRequest).toBeNull();
	});

	it('changes the \'zoom\' property', () => {
		const store = setup();

		changeZoom(10);

		expect(store.getState().position.zoom).toBe(10);

		changeZoom(minZoomLevel);

		expect(store.getState().position.zoom).toBe(minZoomLevel);

		changeZoom(maxZoomLevel);

		expect(store.getState().position.zoom).toBe(maxZoomLevel);

		changeZoom(minZoomLevel - 1);

		expect(store.getState().position.zoom).toBe(minZoomLevel);

		changeZoom(maxZoomLevel + 1);

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
	});

	it('changes \'zoom\' and  \'rotation\' property', () => {
		const store = setup();

		changeZoomAndRotation({ zoom: 10, rotation: .5 });

		expect(store.getState().position.zoom).toBe(10);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomAndCenter({ zoom: minZoomLevel, rotation: .5 });

		expect(store.getState().position.zoom).toBe(minZoomLevel);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomAndCenter({ zoom: maxZoomLevel, rotation: .5 });

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomAndCenter({ zoom: minZoomLevel - 1, rotation: .5 });

		expect(store.getState().position.zoom).toBe(minZoomLevel);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomAndCenter({ zoom: maxZoomLevel + 1, rotation: .5 });

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
		expect(store.getState().position.rotation).toBe(.5);
	});

	it('changes the \'center\' property', () => {
		const store = setup();

		changeCenter([21, 42]);

		expect(store.getState().position.center).toEqual([21, 42]);
	});

	it('changes the \'center\'  \'rotation\' property', () => {
		const store = setup();

		changeCenterAndRotation({ center: [21, 42], rotation: .5 });

		expect(store.getState().position.center).toEqual([21, 42]);
		expect(store.getState().position.rotation).toBe(.5);
	});

	it('changes the \'rotation\' property', () => {
		const store = setup();

		changeRotation(.5);

		expect(store.getState().position.rotation).toBe(.5);
	});

	it('changes the \'liveRotation\' property', () => {
		const store = setup();

		changeLiveRotation(.8);

		expect(store.getState().position.liveRotation).toBe(.8);
	});

	it('changes \'zoom\' and  \'center\' property', () => {
		const store = setup();

		changeZoomAndCenter({ zoom: 10, center: [21, 42] });

		expect(store.getState().position.zoom).toBe(10);
		expect(store.getState().position.center).toEqual([21, 42]);

		changeZoomAndCenter({ zoom: minZoomLevel, center: [21, 42] });

		expect(store.getState().position.zoom).toBe(minZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);

		changeZoomAndCenter({ zoom: maxZoomLevel, center: [21, 42] });

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);

		changeZoomAndCenter({ zoom: minZoomLevel - 1, center: [21, 42] });

		expect(store.getState().position.zoom).toBe(minZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);

		changeZoomAndCenter({ zoom: maxZoomLevel + 1, center: [21, 42] });

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);
	});

	it('changes \'zoom\',  \'center\' and  \'rotation\' property', () => {
		const store = setup();

		changeZoomCenterAndRotation({ zoom: 10, center: [21, 42], rotation: .5 });

		expect(store.getState().position.zoom).toBe(10);
		expect(store.getState().position.center).toEqual([21, 42]);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomCenterAndRotation({ zoom: minZoomLevel, center: [21, 42], rotation: .5 });

		expect(store.getState().position.zoom).toBe(minZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomCenterAndRotation({ zoom: maxZoomLevel, center: [21, 42], rotation: .5 });

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomCenterAndRotation({ zoom: minZoomLevel - 1, center: [21, 42], rotation: .5 });

		expect(store.getState().position.zoom).toBe(minZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);
		expect(store.getState().position.rotation).toBe(.5);

		changeZoomCenterAndRotation({ zoom: maxZoomLevel + 1, center: [21, 42], rotation: .5 });

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
		expect(store.getState().position.center).toEqual([21, 42]);
		expect(store.getState().position.rotation).toBe(.5);
	});

	it('increases the \'zoom\' property by plus one', () => {
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

		expect(store.getState().position.zoom).toBe(maxZoomLevel);
	});

	it('decreases the \'zoom\' property by minus one', () => {
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

		expect(store.getState().position.zoom).toBe(minZoomLevel);
	});

	it('places a \'fitRequest\' property', () => {
		const store = setup();

		setFit([21, 21, 42, 42], { maxZoom: 42 });

		expect(store.getState().position.fitRequest.payload.extent).toEqual([21, 21, 42, 42]);
		expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(42);
	});
});
