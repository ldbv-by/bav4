import { TestUtils } from '../../test-utils.js';
import { searchReducer } from '../../../src/store/search/search.reducer';
import { setQuery } from '../../../src/store/search/search.action';

describe('searchReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			search: searchReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().search.query.payload).toBeNull();
	});

	it("changes the 'query' property", () => {
		const store = setup();
		const query = ' foo ';

		setQuery(query);

		expect(store.getState().search.query.payload).toBe(query.trim());

		setQuery(null);

		expect(store.getState().search.query.payload).toBeNull();
	});
});
