import { highlightReducer } from '../../../src/store/highlight/highlight.reducer';
import { setHighlightFeature, removeHighlightFeature, setTemporaryHighlightFeature, removeTemporaryHighlightFeature, clearHighlightFeatures } from '../../../src/store/highlight/highlight.action';
import { TestUtils } from '../../test-utils.js';


describe('highlightReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			highlight: highlightReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().highlight.feature).toBeNull();
		expect(store.getState().highlight.temporaryFeature).toBeNull();
		expect(store.getState().highlight.active).toBeFalse();
	});

	it('changes the \'feature\' property', () => {
		const store = setup();
		const highlightFeature = { data: [21, 42] };

		setHighlightFeature(highlightFeature);

		expect(store.getState().highlight.feature).toEqual(highlightFeature);
		expect(store.getState().highlight.temporaryFeature).toBeNull();
		expect(store.getState().highlight.active).toBeTrue();

		removeHighlightFeature();

		expect(store.getState().highlight.feature).toBeNull();
		expect(store.getState().highlight.temporaryFeature).toBeNull();
		expect(store.getState().highlight.active).toBeFalse();
	});

	it('changes the \'secondary feature\' property', () => {
		const store = setup();
		const highlightFeature = { data: [21, 42] };

		setTemporaryHighlightFeature(highlightFeature);

		expect(store.getState().highlight.temporaryFeature).toEqual(highlightFeature);
		expect(store.getState().highlight.feature).toBeNull();
		expect(store.getState().highlight.active).toBeTrue();

		removeTemporaryHighlightFeature();

		expect(store.getState().highlight.temporaryFeature).toBeNull();
		expect(store.getState().highlight.feature).toBeNull();
		expect(store.getState().highlight.active).toBeFalse();
	});

	it('resets the both feature properties', () => {
		const store = setup();
		const highlightFeature = { data: [21, 42] };
		const secondaryHighlightFeature = { data: [1, 2] };

		setHighlightFeature(highlightFeature);
		setTemporaryHighlightFeature(secondaryHighlightFeature);

		expect(store.getState().highlight.feature).toEqual(highlightFeature);
		expect(store.getState().highlight.temporaryFeature).toEqual(secondaryHighlightFeature);
		expect(store.getState().highlight.active).toBeTrue();

		clearHighlightFeatures();

		expect(store.getState().highlight.feature).toBeNull();
		expect(store.getState().highlight.temporaryFeature).toBeNull();
		expect(store.getState().highlight.active).toBeFalse();
	});
});
