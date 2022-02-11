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
		expect(store.getState().import.latest).toBeNull();
	});

	it('updates the url property', () => {
		const store = setup();

		setUrl('some');

		expect(store.getState().import.latest.payload.url).toBe('some');
		expect(store.getState().import.latest.payload.data).toBeUndefined();
		expect(store.getState().import.latest.payload.mimeType).toBeUndefined();
	});

	it('updates the data property', () => {
		const store = setup();

		setData('someData', 'text/some');

		expect(store.getState().import.latest.payload.data).toBe('someData');
		expect(store.getState().import.latest.payload.mimeType).toBe('text/some');
		expect(store.getState().import.latest.payload.url).toBeUndefined();
	});

});
