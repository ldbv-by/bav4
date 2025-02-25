import { Geometry } from 'ol/geom.js';
import { Feature } from '../../../src/domain/feature.js';
import { featureCollectionReducer } from '../../../src/store/featureCollection/featureCollection.reducer.js';
import { addFeatures, clearFeatures, removeFeaturesById } from '../../../src/store/featureCollection/featureCollection.action.js';
import { TestUtils } from '../../test-utils.js';

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
		const feature = new Feature(new Geometry('data'));

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
		const feature = new Feature(new Geometry('data'));

		addFeatures(feature);

		expect(store.getState().featureCollection.entries).toEqual([feature]);

		clearFeatures();

		expect(store.getState().featureCollection.entries).toHaveSize(0);
	});

	it('sets an feature id if missing', () => {
		const store = setup();
		const feature = new Feature(new Geometry('data'));

		addFeatures(feature);

		expect(store.getState().featureCollection.entries[0].id).toBeInstanceOf(String);
		expect(store.getState().featureCollection.entries[0].id.startsWith('featureCollection_feature-')).toBeTrue();
	});

	it('does NOT modify the feature id if already present', () => {
		const store = setup();
		const feature = new Feature(new Geometry('data'), 'id');

		addFeatures(feature);

		expect(store.getState().featureCollection.entries[0].id).toBe('id');
	});

	it("changes the 'entries' property by removing a features by its id", () => {
		const id = 'foo';
		const store = setup();
		const feature0 = new Feature(new Geometry('data'), id);
		//a second feature with the same id
		const feature1 = new Feature(new Geometry('data'), id);

		addFeatures(feature0);

		removeFeaturesById(id);

		expect(store.getState().featureCollection.entries).toHaveSize(0);

		addFeatures([feature0, feature1]);
		addFeatures(new Feature(new Geometry('data')));

		removeFeaturesById(id);

		expect(store.getState().featureCollection.entries).toHaveSize(1);
		expect(store.getState().featureCollection.entries[0].id).not.toBe(id);

		clearFeatures();
		addFeatures([feature0, feature1]);
		addFeatures(new Feature(new Geometry('data'), 'bar'));

		removeFeaturesById([id, 'bar']);

		expect(store.getState().featureCollection.entries).toHaveSize(0);
	});
});
