import { setClick, setContextClick, setBeingDragged, setPointerMove } from '../../../src/store/pointer/pointer.action';
import { pointerReducer } from '../../../src/store/pointer/pointer.reducer';
import { TestUtils } from '../../test-utils.js';

describe('pointerReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			pointer: pointerReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().pointer.click).toBeNull();
		expect(store.getState().pointer.contextClick).toBeNull();
		expect(store.getState().pointer.beingDragged).toBeFalse();
	});

	it("changes the 'click' property", () => {
		const store = setup();
		const pointerEvent = { coordinate: [38, 57], screenCoordinate: [21, 42] };

		setClick(pointerEvent);

		expect(store.getState().pointer.click.payload).toEqual(pointerEvent);
	});

	it("changes the 'contextClick' property", () => {
		const store = setup();
		const pointerEvent = { coordinate: [57, 38], screenCoordinate: [42, 21] };

		setContextClick(pointerEvent);

		expect(store.getState().pointer.contextClick.payload).toEqual(pointerEvent);
	});

	it("changes the 'move' property", () => {
		const store = setup();
		const pointerEvent = { coordinate: [7, 8], screenCoordinate: [2, 1] };

		setPointerMove(pointerEvent);

		expect(store.getState().pointer.move.payload).toEqual(pointerEvent);
	});

	it("changes the 'beingDragged' property", () => {
		const store = setup();

		setBeingDragged(true);

		expect(store.getState().pointer.beingDragged).toBeTrue();

		setBeingDragged(false);

		expect(store.getState().pointer.beingDragged).toBeFalse();
	});
});
