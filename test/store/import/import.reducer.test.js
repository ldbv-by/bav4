import { SourceType, SourceTypeName } from '../../../src/services/domain/sourceType';
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
		const sourceType = new SourceType(SourceTypeName.GEOJSON);
		setUrl('some', sourceType);

		expect(store.getState().import.latest.payload.url).toBe('some');
		expect(store.getState().import.latest.payload.sourceType).toBe(sourceType);
		expect(store.getState().import.latest.payload.data).toBeNull();

	});

	it('updates the data property', () => {
		const store = setup();
		const sourceType = new SourceType(SourceTypeName.GEOJSON);
		setData('someData', sourceType);

		expect(store.getState().import.latest.payload.data).toBe('someData');
		expect(store.getState().import.latest.payload.sourceType).toBe(sourceType);
		expect(store.getState().import.latest.payload.url).toBeNull();
	});

});
