import { highlightReducer } from '../../../src/store/highlight/highlight.reducer';
import { setHighlightFeatures, removeHighlightFeatures, setTemporaryHighlightFeatures, removeTemporaryHighlightFeatures, clearHighlightFeatures, HighlightFeatureTypes, addHighlightFeatures, addTemporaryHighlightFeatures } from '../../../src/store/highlight/highlight.action';
import { TestUtils } from '../../test-utils.js';


describe('highlightReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			highlight: highlightReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();
	});

	it('changes the \'features\' and \'active\' property', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setHighlightFeatures([]);

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		setHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeHighlightFeatures();

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		addHighlightFeatures(highlightFeature);
		addHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.features).toHaveSize(2);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('sets features by an array', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setHighlightFeatures([highlightFeature]);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeHighlightFeatures();

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		addHighlightFeatures([highlightFeature, highlightFeature]);

		expect(store.getState().highlight.features).toHaveSize(2);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('changes the \'secondary features\' property', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setTemporaryHighlightFeatures([]);

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		setTemporaryHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.temporaryFeatures).toEqual([highlightFeature]);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeTemporaryHighlightFeatures();

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		addTemporaryHighlightFeatures(highlightFeature);
		addTemporaryHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(2);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('changes the \'secondary features\' property by an array', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setTemporaryHighlightFeatures([highlightFeature]);

		expect(store.getState().highlight.temporaryFeatures).toEqual([highlightFeature]);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeTemporaryHighlightFeatures();

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		addTemporaryHighlightFeatures([highlightFeature, highlightFeature]);

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(2);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('resets both features properties', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };
		const secondaryHighlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [1, 2] } };

		setHighlightFeatures(highlightFeature);
		setTemporaryHighlightFeatures(secondaryHighlightFeature);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.temporaryFeatures).toEqual([secondaryHighlightFeature]);
		expect(store.getState().highlight.active).toBeTrue();

		clearHighlightFeatures();

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();
	});
});
