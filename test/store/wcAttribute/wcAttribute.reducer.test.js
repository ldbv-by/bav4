import { indicateAttributeChange } from '../../../src/store/wcAttribute/wcAttribute.action';
import { wcAttributeReducer } from '../../../src/store/wcAttribute/wcAttribute.reducer';
import { EventLike } from '../../../src/utils/storeUtils';
import { TestUtils } from '../../test-utils';

describe('wcAttributeReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			wcAttribute: wcAttributeReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().wcAttribute.changed.payload).toBeNull;
		expect(store.getState().wcAttribute.changed).toBeInstanceOf(EventLike);
	});

	it('updates the `changed` property', () => {
		const store = setup();
		const initialPayload = store.getState().wcAttribute.changed;

		indicateAttributeChange();

		expect(store.getState().wcAttribute.changed).not.toEqual(initialPayload);
		expect(store.getState().wcAttribute.changed).toBeInstanceOf(EventLike);
	});
});
