import { propertyChanged } from '../../../src/store/geoResources/geoResources.action.js';
import { geoResourcesReducer } from '../../../src/store/geoResources/geoResources.reducer.js';
import { TestUtils } from '../../test-utils.js';


describe('geoResourcesReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			geoResources: geoResourcesReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();

		expect(store.getState().geoResources.changed.payload).toBeNull();
	});

	it('updates the stores properties', () => {
		const store = setup();

		propertyChanged('foo');

		expect(store.getState().geoResources.changed.payload).toBe('foo');
	});
});
