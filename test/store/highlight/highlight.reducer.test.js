import { highlightReducer } from '../../../src/store/highlight/highlight.reducer';
import { setHighlightFeature, removeHighlightFeature, setTemporaryHighlightFeature, removeTemporaryHighlightFeature, clearHighlightFeatures, HighlightFeatureTypes } from '../../../src/store/highlight/highlight.action';
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

	it('changes the \'features\' property', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setHighlightFeature(highlightFeature);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeHighlightFeature();

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();
	});

	it('changes the \'features\' property by an array', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setHighlightFeature([highlightFeature]);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('changes the \'secondary features\' property', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setTemporaryHighlightFeature(highlightFeature);

		expect(store.getState().highlight.temporaryFeatures).toEqual([highlightFeature]);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeTemporaryHighlightFeature();

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();
	});

	it('changes the \'secondary features\' property by an array', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setTemporaryHighlightFeature([highlightFeature]);

		expect(store.getState().highlight.temporaryFeatures).toEqual([highlightFeature]);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('resets both features properties', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };
		const secondaryHighlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [1, 2] } };

		setHighlightFeature(highlightFeature);
		setTemporaryHighlightFeature(secondaryHighlightFeature);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.temporaryFeatures).toEqual([secondaryHighlightFeature]);
		expect(store.getState().highlight.active).toBeTrue();

		clearHighlightFeatures();

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();
	});
});
