import { indicateChange } from '../../../src/store/stateForEncoding/stateForEncoding.action';
import { stateForEncodingReducer } from '../../../src/store/stateForEncoding/stateForEncoding.reducer';
import { EventLike } from '../../../src/utils/storeUtils';
import { TestUtils } from '../../test-utils';

describe('stateForEncodingReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			stateForEncoding: stateForEncodingReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().stateForEncoding.changed.payload).toBeNull;
		expect(store.getState().stateForEncoding.changed).toBeInstanceOf(EventLike);
	});

	it('updates the `changed` property', () => {
		const store = setup();
		const initialPayload = store.getState().stateForEncoding.changed;

		indicateChange();

		expect(store.getState().stateForEncoding.changed).not.toEqual(initialPayload);
		expect(store.getState().stateForEncoding.changed).toBeInstanceOf(EventLike);
	});
});
