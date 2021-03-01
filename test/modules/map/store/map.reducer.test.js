import { mapReducer } from '../../../../src/modules/map/store/map.reducer';
import { setClick, setContextClick, setBeingDragged, setPointer } from '../../../../src/modules/map/store/map.action';
import { TestUtils } from '../../../test-utils.js';


describe('mapReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			map: mapReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().map.click).toBeNull();
		expect(store.getState().map.contextClick).toBeNull();
		expect(store.getState().map.beingDragged).toBeFalse();
	});

	it('changes the \'click\' property', () => {
		const store = setup();
		const pointerEvent = { coordinate: [38, 57], screenCoordinate: [21, 42] };

		setClick(pointerEvent);

		expect(store.getState().map.click.payload).toEqual(pointerEvent);
	});

	it('changes the \'contextClick\' property', () => {
		const store = setup();
		const pointerEvent = { coordinate: [57, 38], screenCoordinate: [42, 21] };

		setContextClick(pointerEvent);

		expect(store.getState().map.contextClick.payload).toEqual(pointerEvent);
	});

	it('changes the \'pointer\' property', () => {
		const store = setup();
		const pointerEvent = { coordinate: [7, 8], screenCoordinate: [2, 1] };

		setPointer(pointerEvent);

		expect(store.getState().map.pointer.payload).toEqual(pointerEvent);
	});

	it('changes the \'beingDragged\' property', () => {
		const store = setup();

		setBeingDragged(true);

		expect(store.getState().map.beingDragged).toBeTrue();

		setBeingDragged(false);

		expect(store.getState().map.beingDragged).toBeFalse();
	});
});
