import { positionReducer } from '../../../../src/modules/map/store/position.reducer';
import { changeCenter, changeZoom, changeZoomAndCenter, decreaseZoom, increaseZoom, setFit } from '../../../../src/modules/map/store/position.action';
import { TestUtils } from '../../../test-utils.js';


describe('positionReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			position: positionReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().position.zoom).toBe(12);
		expect(store.getState().position.center).toEqual([1288239.2412306187, 6130212.561641981]);
		expect(store.getState().position.fitRequest).toBeNull();
	});

	it('changes the \'zoom\' property', () => {
		const store = setup();

		changeZoom(10);

		expect(store.getState().position.zoom).toBe(10);
	});

	it('changes the \'center\' property', () => {
		const store = setup();

		changeCenter([21, 42]);

		expect(store.getState().position.center).toEqual([21, 42]);
	});

	it('changes \'zoom\' and  \'center\' property', () => {
		const store = setup();

		changeZoomAndCenter({ zoom: 10, center: [21, 42] });

		expect(store.getState().position.zoom).toBe(10);
		expect(store.getState().position.center).toEqual([21, 42]);
	});

	it('increases the \'zoom\' property by plus one', () => {
		const store = setup({
			position: {
				zoom: 5
			}
		});

		increaseZoom();

		expect(store.getState().position.zoom).toBe(6);
	});

	it('decreases the \'zoom\' property by minus one', () => {
		const store = setup({
			position: {
				zoom: 5
			}
		});

		decreaseZoom();

		expect(store.getState().position.zoom).toBe(4);
	});

	it('places a \'fitRequest\' property', () => {
		const store = setup();

		setFit( [21, 21, 42, 42], { maxZoom:42 });

		expect(store.getState().position.fitRequest.payload.extent).toEqual([21, 21, 42, 42]);
		expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(42);
	});
});
