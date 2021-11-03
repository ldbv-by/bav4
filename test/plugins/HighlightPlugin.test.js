import { FEATURE_INFO_HIGHLIGHT_FEATURE_ID, HighlightPlugin, HIGHLIGHT_LAYER_ID } from '../../src/plugins/HighlightPlugin';
import { TestUtils } from '../test-utils.js';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer';
import { clearHighlightFeatures, HighlightFeatureTypes, setHighlightFeatures } from '../../src/store/highlight/highlight.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer';
import { setTabIndex, TabIndex } from '../../src/store/mainMenu/mainMenu.action';
import { setClick } from '../../src/store/pointer/pointer.action';


describe('HighlightPlugin', () => {

	const setup = (state) => {
		const initialState = {
			mainMenu: {
				open: true,
				tabIndex: TabIndex.MAPS
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			layers: layersReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			pointer: pointerReducer
		});
		return store;
	};

	describe('when highlight.active changes', () => {

		it('adds or removes the highlight layer', async () => {
			const highlightFeature = { data: [21, 42] };
			const store = setup();
			const instanceUnderTest = new HighlightPlugin();

			await instanceUnderTest.register(store);

			setHighlightFeatures(highlightFeature);

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(HIGHLIGHT_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
			expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();

			clearHighlightFeatures();

			expect(store.getState().layers.active.length).toBe(0);
		});
	});

	describe('when pointer.click property changes', () => {

		it('clears all featureInfo related highlight items (also initially)', async () => {
			const coordinate = [11, 22];
			const highlightFeature0 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID };
			const highlightFeature1 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: 'foo' };
			const store = setup({
				highlight: {
					features: [highlightFeature0, highlightFeature1],
					temporaryFeatures: []
				}
			});
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');
		});
	});

	describe('when mainMenu.tabIndex changes', () => {

		it('clears all featureInfo related highlight items (also initially)', async () => {
			const highlightFeature0 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID };
			const highlightFeature1 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: 'foo' };
			const store = setup({
				mainMenu: {
					tabIndex: TabIndex.TOPICS,
					open: false
				},
				highlight: {
					features: [highlightFeature0, highlightFeature1],
					temporaryFeatures: []
				}
			});
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);


			//should be cleared also initially
			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			setHighlightFeatures([highlightFeature0, highlightFeature1]);

			//we change the tab index
			setTabIndex(TabIndex.MAPS);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			setHighlightFeatures([highlightFeature0, highlightFeature1]);

			//we change the tab index to the FeatureInfo tab
			setTabIndex(TabIndex.FEATUREINFO);

			expect(store.getState().highlight.features).toHaveSize(2);
		});
	});
});
