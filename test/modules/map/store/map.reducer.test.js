import { mapReducer } from '../../../../src/modules/map/store/map.reducer';
import { setClick, setContextClick, setBeingDragged } from '../../../../src/modules/map/store/map.action';
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
		const click = { coordinate: [38, 57], screenCoordinate: [21, 42] };

		setClick(click);

		expect(store.getState().map.click.payload).toEqual(click);
	});

	it('changes the \'contextClick\' property', () => {
		const store = setup();
		const click = { coordinate: [57, 38], screenCoordinate: [42, 21] };

		setContextClick(click);

		expect(store.getState().map.contextClick.payload).toEqual(click);
	});

	it('changes the \'beingDragged\' property', () => {
		const store = setup();

		setBeingDragged(true);

		expect(store.getState().map.beingDragged).toBeTrue();

		setBeingDragged(false);

		expect(store.getState().map.beingDragged).toBeFalse();
	});
});
