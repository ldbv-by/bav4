import { setData, setUrl } from '../../../src/store/import/import.action';
import { importReducer } from '../../../src/store/import/import.reducer';
import { TestUtils } from '../../test-utils';

describe('importReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			import: importReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().import.url).toBeNull();
		expect(store.getState().import.data).toBeNull();
		expect(store.getState().import.mimeType).toBeNull();
	});

	it('updates the url property', () => {
		const store = setup();

		setUrl('some');

		expect(store.getState().import.url).toBe('some');
	});

	it('updates the data property', () => {
		const store = setup();

		setData('someData', 'text/some');

		expect(store.getState().import.data).toBe('someData');
		expect(store.getState().import.mimeType).toBe('text/some');
	});

});
