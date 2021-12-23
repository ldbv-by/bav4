import { FEATURE_INFO_HIGHLIGHT_FEATURE_ID, HighlightPlugin, HIGHLIGHT_LAYER_ID, SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID } from '../../src/plugins/HighlightPlugin';
import { TestUtils } from '../test-utils.js';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer';
import { addHighlightFeatures, clearHighlightFeatures, HighlightFeatureTypes } from '../../src/store/highlight/highlight.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer';
import { setTab, TabId } from '../../src/store/mainMenu/mainMenu.action';
import { setClick } from '../../src/store/pointer/pointer.action';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { registerQuery, resolveQuery, startRequest } from '../../src/store/featureInfo/featureInfo.action';


describe('HighlightPlugin', () => {

	const setup = (state) => {
		const initialState = {
			mainMenu: {
				open: true,
				tab: TabId.MAPS
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			layers: layersReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			pointer: pointerReducer,
			featureInfo: featureInfoReducer
		});
		return store;
	};

	describe('when highlight.active changes', () => {

		it('adds or removes the highlight layer', async () => {
			const highlightFeature = { data: [21, 42] };
			const store = setup();
			const instanceUnderTest = new HighlightPlugin();

			await instanceUnderTest.register(store);

			addHighlightFeatures(highlightFeature);

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
					features: [highlightFeature0, highlightFeature1]
				}
			});
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			setClick({ coordinate: coordinate, screenCoordinate: [33, 44] });

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');
		});
	});

	describe('when mainMenu.tab changes', () => {

		it('clears all featureInfo related highlight items (also initially)', async () => {
			const highlightFeature0 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: FEATURE_INFO_HIGHLIGHT_FEATURE_ID };
			const highlightFeature1 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: 'foo' };
			const store = setup({
				mainMenu: {
					tab: TabId.TOPICS,
					open: false
				},
				highlight: {
					features: [highlightFeature0, highlightFeature1]
				}
			});
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);


			//should be cleared also initially
			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			clearHighlightFeatures();
			addHighlightFeatures([highlightFeature0, highlightFeature1]);

			//we change the tab index
			setTab(TabId.MAPS);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			clearHighlightFeatures();
			addHighlightFeatures([highlightFeature0, highlightFeature1]);

			//we change the tab index to the FeatureInfo tab
			setTab(TabId.FEATUREINFO);

			expect(store.getState().highlight.features).toHaveSize(2);
		});

		it('clears all searchResult related highlight items (also initially)', async () => {
			const highlightFeature0 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: SEARCH_RESULT_HIGHLIGHT_FEATURE_ID };
			const highlightFeature1 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID };
			const highlightFeature2 = { type: HighlightFeatureTypes.DEFAULT, data: { coordinate: [21, 42] }, id: 'foo' };
			const store = setup({
				mainMenu: {
					tab: TabId.TOPICS,
					open: false
				},
				highlight: {
					features: [highlightFeature0, highlightFeature1, highlightFeature2]
				}
			});
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);


			//should be cleared also initially
			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			clearHighlightFeatures();
			addHighlightFeatures([highlightFeature0, highlightFeature1, highlightFeature2]);

			//we change the tab index
			setTab(TabId.MAPS);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			clearHighlightFeatures();
			addHighlightFeatures([highlightFeature0, highlightFeature1, highlightFeature2]);

			// //we change the tab index to the FeatureInfo tab
			setTab(TabId.SEARCH);

			expect(store.getState().highlight.features).toHaveSize(3);
		});
	});

	describe('whenfeatureInfo.querying property changes', () => {

		it('adds and removes an animated highlight feature', async () => {
			const coordinate = [21, 42];
			const queryId = 'foo';
			const store = setup();
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);
			startRequest(coordinate);

			registerQuery(queryId);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].data.coordinate).toEqual(coordinate);
			expect(store.getState().highlight.features[0].type).toEqual(HighlightFeatureTypes.ANIMATED);

			resolveQuery(queryId);

			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});
});
