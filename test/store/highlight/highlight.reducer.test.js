import { highlightReducer } from '../../../src/store/highlight/highlight.reducer';
import { setHighlightFeatures, removeHighlightFeatures, setTemporaryHighlightFeatures, removeTemporaryHighlightFeatures, clearHighlightFeatures, HighlightFeatureTypes, addHighlightFeatures, addTemporaryHighlightFeatures, removeHighlightFeatureById } from '../../../src/store/highlight/highlight.action';
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

	it('changes the \'features\' and \'active\' property by setting and adding features', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: 'id' };

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

		removeHighlightFeatures();
		setHighlightFeatures([highlightFeature]);

		expect(store.getState().highlight.features).toEqual([highlightFeature]);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeHighlightFeatures();
		addHighlightFeatures([highlightFeature, highlightFeature]);

		expect(store.getState().highlight.features).toHaveSize(2);
		expect(store.getState().highlight.temporaryFeatures).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('changes the \'temporaryFeatures\' and \'active\' property by setting and adding features', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: 'id' };

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

		removeTemporaryHighlightFeatures();
		setTemporaryHighlightFeatures([highlightFeature]);

		expect(store.getState().highlight.temporaryFeatures).toEqual([highlightFeature]);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();

		removeTemporaryHighlightFeatures();
		addTemporaryHighlightFeatures([highlightFeature, highlightFeature]);

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(2);
		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeTrue();
	});

	it('changes the \'features\', \'temporaryFeatures\' and \'active\' property by clearing all features', () => {
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

	it('sets an feature id if missing', () => {
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } };

		setHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.features[0].id).toBeInstanceOf(Number);

		clearHighlightFeatures();

		addHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.features[0].id).toBeInstanceOf(Number);

		clearHighlightFeatures();

		setTemporaryHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.temporaryFeatures[0].id).toBeInstanceOf(Number);

		clearHighlightFeatures();

		addTemporaryHighlightFeatures(highlightFeature);

		expect(store.getState().highlight.temporaryFeatures[0].id).toBeInstanceOf(Number);
	});

	it('changes the \'features\', \'temporaryFeatures\' and \'active\' property by removing a features by id', () => {
		const id = 'foo';
		const store = setup();
		const highlightFeature = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: id };

		setHighlightFeatures(highlightFeature);

		removeHighlightFeatureById(id);

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		setTemporaryHighlightFeatures(highlightFeature);

		removeHighlightFeatureById(id);

		expect(store.getState().highlight.features).toHaveSize(0);
		expect(store.getState().highlight.active).toBeFalse();

		addHighlightFeatures(highlightFeature);
		addHighlightFeatures({ type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } });

		removeHighlightFeatureById(id);

		expect(store.getState().highlight.features).toHaveSize(1);
		expect(store.getState().highlight.active).toBeTrue();

		addTemporaryHighlightFeatures(highlightFeature);
		addTemporaryHighlightFeatures({ type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] } });

		removeHighlightFeatureById(id);

		expect(store.getState().highlight.temporaryFeatures).toHaveSize(1);
		expect(store.getState().highlight.active).toBeTrue();
	});
});
