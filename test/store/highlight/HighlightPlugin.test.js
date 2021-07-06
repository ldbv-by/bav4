import { HighlightPlugin, HIGHLIGHT_LAYER_ID } from '../../../src/store/highlight/HighlightPlugin';
import { TestUtils } from '../../test-utils.js';
import { highlightReducer } from '../../../src/store/highlight/highlight.reducer';
import { clearHighlightFeatures, setHighlightFeature } from '../../../src/store/highlight/highlight.action';
import { layersReducer } from '../../../src/store/layers/layers.reducer';


describe('HighlightPlugin', () => {

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			highlight: highlightReducer,
			layers: layersReducer
		});
		return store;
	};

	it('adds or removes the highlight layer', async () => {
		const highlightFeature = { data: [21, 42] };
		const store = setup();
		const instanceUnderTest = new HighlightPlugin();

		await instanceUnderTest.register(store);

		setHighlightFeature(highlightFeature);

		expect(store.getState().layers.active.length).toBe(1);
		expect(store.getState().layers.active[0].id).toBe(HIGHLIGHT_LAYER_ID);
		expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
		expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();

		clearHighlightFeatures();

		expect(store.getState().layers.active.length).toBe(0);
	});
});