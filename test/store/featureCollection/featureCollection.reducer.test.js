import { Feature } from '../../../src/domain/feature.js';
import { featureCollectionReducer } from '../../../src/store/featureCollection/featureCollection.reducer.js';
import { addFeatures, clearFeatures, removeFeaturesById } from '../../../src/store/featureCollection/featureCollection.action.js';
import { TestUtils } from '../../test-utils.js';
import { Geometry } from '../../../src/domain/geometry.js';
import { SourceType, SourceTypeName } from '../../../src/domain/sourceType.js';

describe('featureCollectionReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			featureCollection: featureCollectionReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().featureCollection.entries).toHaveSize(0);
	});

	it("changes the 'entries' property by adding and removing features", () => {
		const store = setup();
		const feature = new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'id');

		addFeatures([]);

		expect(store.getState().featureCollection.entries).toHaveSize(0);

		addFeatures(feature);

		expect(store.getState().featureCollection.entries).toEqual([feature]);

		clearFeatures();

		expect(store.getState().featureCollection.entries).toHaveSize(0);

		addFeatures(feature);
		addFeatures(feature);

		expect(store.getState().featureCollection.entries).toHaveSize(2);

		clearFeatures();
		addFeatures([feature]);

		expect(store.getState().featureCollection.entries).toEqual([feature]);

		clearFeatures();
		addFeatures([feature, feature]);

		expect(store.getState().featureCollection.entries).toHaveSize(2);
	});

	it("changes the 'entries` property by clearing all features", () => {
		const store = setup();
		const feature = new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'id');

		addFeatures(feature);

		expect(store.getState().featureCollection.entries).toEqual([feature]);

		clearFeatures();

		expect(store.getState().featureCollection.entries).toHaveSize(0);
	});

	it('does NOT modify the feature id if already present', () => {
		const store = setup();
		const feature = new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'id');

		addFeatures(feature);

		expect(store.getState().featureCollection.entries[0].id).toBe('id');
	});

	it("changes the 'entries' property by removing a features by its id", () => {
		const id = 'foo';
		const store = setup();
		const feature0 = new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), id);
		//a second feature with the same id
		const feature1 = new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), id);

		addFeatures(feature0);

		removeFeaturesById(id);

		expect(store.getState().featureCollection.entries).toHaveSize(0);

		addFeatures([feature0, feature1]);
		addFeatures(new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'id'));

		removeFeaturesById(id);

		expect(store.getState().featureCollection.entries).toHaveSize(1);
		expect(store.getState().featureCollection.entries[0].id).not.toBe(id);

		clearFeatures();
		addFeatures([feature0, feature1]);
		addFeatures(new Feature(new Geometry('data', new SourceType(SourceTypeName.EWKT)), 'bar'));

		removeFeaturesById([id, 'bar']);

		expect(store.getState().featureCollection.entries).toHaveSize(0);
	});
});
