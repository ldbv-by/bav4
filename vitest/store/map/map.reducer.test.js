import { setMoveStart, setMoveEnd, setBeingMoved } from '../../../src/store/map/map.action';
import { mapReducer } from '../../../src/store/map/map.reducer';
import { TestUtils } from '../../test-utils.js';

describe('mapReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			map: mapReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().map.moveStart).toBeNull();
		expect(store.getState().map.moveEnd).toBeNull();
		expect(store.getState().map.beingMoved).toBeFalse();
	});

	it("changes the 'movestart' property", () => {
		const store = setup();

		setMoveStart();

		expect(store.getState().map.moveStart.payload).toEqual('movestart');
	});

	it("changes the 'moveend' property", () => {
		const store = setup();

		setMoveEnd();

		expect(store.getState().map.moveEnd.payload).toEqual('moveend');
	});

	it("changes the 'beingMoved' property", () => {
		const store = setup();

		setBeingMoved(true);

		expect(store.getState().map.beingMoved).toBeTrue();

		setBeingMoved(false);

		expect(store.getState().map.beingMoved).toBeFalse();
	});
});
