import { highlightReducer } from '@src/store/highlight/highlight.reducer';
import {
	clearHighlightFeatures,
	addHighlightFeatures,
	removeHighlightFeaturesById,
	removeHighlightFeaturesByCategory
} from '@src/store/highlight/highlight.action';
import { TestUtils } from '@test/test-utils.js';
import { HighlightFeatureType } from '@src/domain/highlightFeature.js';

describe('highlightReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			highlight: highlightReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().highlight.features).toHaveLength(0);
	});

	it("changes the 'features' and 'active' property by adding features (ignoring features containing already existing ids)", () => {
		const store = setup();
		const highlightFeature0 = { type: HighlightFeatureType.DEFAULT, data: [21, 42], id: 'id0' };
		const highlightFeature1 = { type: HighlightFeatureType.DEFAULT, data: [21, 42], id: 'id1' };

		addHighlightFeatures([]);

		expect(store.getState().highlight.features).toHaveLength(0);

		addHighlightFeatures(highlightFeature0);

		expect(store.getState().highlight.features).toEqual([highlightFeature0]);

		clearHighlightFeatures();

		expect(store.getState().highlight.features).toHaveLength(0);

		addHighlightFeatures(highlightFeature0);
		addHighlightFeatures(highlightFeature0);
		addHighlightFeatures(highlightFeature1);

		expect(store.getState().highlight.features).toHaveLength(2);
		expect(store.getState().highlight.active).toBe(true);

		clearHighlightFeatures();
		addHighlightFeatures([highlightFeature0]);

		expect(store.getState().highlight.features).toEqual([highlightFeature0]);
		expect(store.getState().highlight.active).toBe(true);

		clearHighlightFeatures();
		addHighlightFeatures([highlightFeature0, highlightFeature0]);

		expect(store.getState().highlight.features).toHaveLength(2);
		expect(store.getState().highlight.active).toBe(true);
	});

	it("changes the 'features' and 'active' property by clearing all features", () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureType.DEFAULT, data: [21, 42] };

		addHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.active).toBe(true);

		clearHighlightFeatures();

		expect(store.getState().highlight.features).toHaveLength(0);
		expect(store.getState().highlight.active).toBe(false);
	});

	it('sets an feature id if missing', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureType.DEFAULT, data: [21, 42] };

		addHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.features[0].id).toBeTypeOf('string');

		clearHighlightFeatures();

		addHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.features[0].id).toBeTypeOf('string');
	});

	it("changes the 'features' and 'active' property by removing a features by `id`", () => {
		const id = 'foo';
		const store = setup();
		const highlightFeature0 = { type: HighlightFeatureType.DEFAULT, data: [21, 42], id: id };
		//a second feature with the same id
		const highlightFeature1 = { type: HighlightFeatureType.DEFAULT, data: [44, 55], id: id };

		addHighlightFeatures(highlightFeature0);

		removeHighlightFeaturesById(id);

		expect(store.getState().highlight.features).toHaveLength(0);
		expect(store.getState().highlight.active).toBe(false);

		addHighlightFeatures([highlightFeature0, highlightFeature1]);
		addHighlightFeatures({ type: HighlightFeatureType.DEFAULT, data: [21, 42] });

		removeHighlightFeaturesById(id);

		expect(store.getState().highlight.features).toHaveLength(1);
		expect(store.getState().highlight.features[0].id).not.toBe(id);
		expect(store.getState().highlight.active).toBe(true);

		clearHighlightFeatures();
		addHighlightFeatures([highlightFeature0, highlightFeature1]);
		addHighlightFeatures({ id: 'bar', type: HighlightFeatureType.DEFAULT, data: [21, 42] });

		removeHighlightFeaturesById([id, 'bar']);

		expect(store.getState().highlight.features).toHaveLength(0);
	});

	it("changes the 'features' and 'active' property by removing a features by `category`", () => {
		const category = 'foo';
		const store = setup();
		const highlightFeature0 = { type: HighlightFeatureType.DEFAULT, data: [21, 42], category };
		//a second feature with the same id
		const highlightFeature1 = { type: HighlightFeatureType.DEFAULT, data: [44, 55], category };

		addHighlightFeatures(highlightFeature0);

		removeHighlightFeaturesByCategory(category);

		expect(store.getState().highlight.features).toHaveLength(0);
		expect(store.getState().highlight.active).toBe(false);

		addHighlightFeatures([highlightFeature0, highlightFeature1]);
		addHighlightFeatures({ type: HighlightFeatureType.DEFAULT, data: [21, 42] });

		removeHighlightFeaturesByCategory(category);

		expect(store.getState().highlight.features).toHaveLength(1);
		expect(store.getState().highlight.features[0].id).not.toBe(category);
		expect(store.getState().highlight.active).toBe(true);

		clearHighlightFeatures();
		addHighlightFeatures([highlightFeature0, highlightFeature1]);
		addHighlightFeatures({ category: 'bar', type: HighlightFeatureType.DEFAULT, data: [21, 42] });

		removeHighlightFeaturesByCategory([category, 'bar']);

		expect(store.getState().highlight.features).toHaveLength(0);
	});
});
