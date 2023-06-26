import {
	QUERY_RUNNING_HIGHLIGHT_FEATURE_ID,
	QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID,
	HighlightPlugin,
	HIGHLIGHT_LAYER_ID,
	SEARCH_RESULT_HIGHLIGHT_FEATURE_ID,
	SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID
} from '../../src/plugins/HighlightPlugin';
import { TestUtils } from '../test-utils.js';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer';
import { addHighlightFeatures, clearHighlightFeatures, HighlightFeatureType } from '../../src/store/highlight/highlight.action';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer';
import { createNoInitialStateMainMenuReducer } from '../../src/store/mainMenu/mainMenu.reducer';
import { setTab } from '../../src/store/mainMenu/mainMenu.action';
import { TabIds } from '../../src/domain/mainMenu';
import { setClick } from '../../src/store/pointer/pointer.action';
import { featureInfoReducer } from '../../src/store/featureInfo/featureInfo.reducer';
import { addFeatureInfoItems, registerQuery, resolveQuery, startRequest } from '../../src/store/featureInfo/featureInfo.action';
import { searchReducer } from '../../src/store/search/search.reducer';
import { EventLike } from '../../src/utils/storeUtils';
import { setQuery } from '../../src/store/search/search.action';
import { $injector } from '../../src/injection';
import { QueryParameters } from '../../src/domain/queryParameters';
import { positionReducer } from '../../src/store/position/position.reducer';

describe('HighlightPlugin', () => {
	const environmentServiceMock = {
		getQueryParams: () => new URLSearchParams()
	};

	const translationService = {
		translate: (key) => key
	};

	const setup = (state) => {
		const initialState = {
			mainMenu: {
				open: true,
				tab: TabIds.MAPS
			},
			search: {
				query: new EventLike(null)
			},
			...state
		};

		const store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			layers: layersReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			position: positionReducer,
			pointer: pointerReducer,
			featureInfo: featureInfoReducer,
			search: searchReducer
		});
		$injector.registerSingleton('EnvironmentService', environmentServiceMock).registerSingleton('TranslationService', translationService);
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
		it('clears all featureInfo related highlight items', async () => {
			const coordinate = [11, 22];
			const highlightFeature0 = { type: HighlightFeatureType.DEFAULT, data: { coordinate: [21, 42] }, id: QUERY_RUNNING_HIGHLIGHT_FEATURE_ID };
			const highlightFeature1 = { type: HighlightFeatureType.DEFAULT, data: { coordinate: [21, 42] }, id: 'foo' };
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
			const highlightFeature0 = { type: HighlightFeatureType.DEFAULT, data: { coordinate: [21, 42] }, id: QUERY_RUNNING_HIGHLIGHT_FEATURE_ID };
			const highlightFeature1 = { type: HighlightFeatureType.DEFAULT, data: { coordinate: [21, 42] }, id: 'foo' };
			const highlightFeature2 = { type: HighlightFeatureType.DEFAULT, data: { coordinate: [21, 42] }, id: QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID };
			const store = setup({
				mainMenu: {
					tab: TabIds.TOPICS,
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
			setTab(TabIds.MAPS);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			clearHighlightFeatures();
			addHighlightFeatures([highlightFeature0, highlightFeature1, highlightFeature2]);

			//we change the tab index to the FeatureInfo tab
			setTab(TabIds.FEATUREINFO);

			expect(store.getState().highlight.features).toHaveSize(3);
		});
	});

	describe('when search.query is empty', () => {
		it('clears all searchResult related highlight items', async () => {
			const highlightFeature0 = { type: HighlightFeatureType.DEFAULT, data: { coordinate: [21, 42] }, id: SEARCH_RESULT_HIGHLIGHT_FEATURE_ID };
			const highlightFeature1 = {
				type: HighlightFeatureType.DEFAULT,
				data: { coordinate: [21, 42] },
				id: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID
			};
			const highlightFeature2 = { type: HighlightFeatureType.DEFAULT, data: { coordinate: [21, 42] }, id: 'foo' };
			const store = setup({
				mainMenu: {
					tab: TabIds.TOPICS,
					open: false
				},
				highlight: {
					features: [highlightFeature0, highlightFeature1, highlightFeature2]
				}
			});
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().highlight.features).toHaveSize(3);

			// we change the current query
			setQuery(null);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');

			clearHighlightFeatures();
			addHighlightFeatures([highlightFeature0, highlightFeature1, highlightFeature2]);

			// we change the current query
			setQuery('foo');

			expect(store.getState().highlight.features).toHaveSize(3);

			// we change the current query
			setQuery('');

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe('foo');
		});
	});

	describe('when featureInfo.querying property changes', () => {
		it('adds and removes a featureinfo highlight feature', async () => {
			const coordinate = [21, 42];
			const queryId = 'foo';
			const store = setup();
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);
			startRequest(coordinate);

			registerQuery(queryId);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].data.coordinate).toEqual(coordinate);
			expect(store.getState().highlight.features[0].type).toEqual(HighlightFeatureType.QUERY_RUNNING);

			resolveQuery(queryId);

			expect(store.getState().highlight.features).toHaveSize(0);
		});

		it('removes an existing success highlight feature', async () => {
			const coordinate = [21, 42];
			const highlightFeature = { type: HighlightFeatureType.QUERY_SUCCESS, data: { coordinate: coordinate }, id: QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID };
			const store = setup({
				mainMenu: {
					open: true,
					tab: TabIds.FEATUREINFO
				},
				highlight: {
					features: [highlightFeature]
				}
			});
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			expect(store.getState().highlight.features[0].id).toBe(QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID);
			expect(store.getState().highlight.features).toHaveSize(1);

			startRequest(coordinate);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).not.toBe(QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID);
		});

		it('adds a success highlight feature when containing a FeatureInfo owning no geometry', async () => {
			const coordinate = [21, 42];
			const store = setup();
			const queryId = 'foo';
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			startRequest(coordinate);
			registerQuery(queryId);
			// add results
			addFeatureInfoItems({ title: 'title0', content: 'content0' }, { title: 'title1', content: 'content1', geometry: {} });
			resolveQuery(queryId);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].id).toBe(QUERY_SUCCESS_HIGHLIGHT_FEATURE_ID);
		});

		it('does NOT add a success highlight feature when containing solely FeatureInfo objects owning a geometry', async () => {
			const coordinate = [21, 42];
			const store = setup();
			const queryId = 'foo';
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			startRequest(coordinate);
			registerQuery(queryId);
			// add results
			addFeatureInfoItems({ title: 'title0', content: 'content0', geometry: {} }, { title: 'title1', content: 'content1', geometry: {} });
			resolveQuery(queryId);

			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});

	describe("when search query parameter 'CROSSHAIR' has a value", () => {
		it('adds a highlight feature', async () => {
			const coordinate = [42, 21];
			const state = {
				position: { center: coordinate }
			};
			const store = setup(state);
			const queryParam = new URLSearchParams(QueryParameters.CROSSHAIR + '=some');
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(queryParam);
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			await TestUtils.timeout();

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].data.coordinate).toEqual(coordinate);
			expect(store.getState().highlight.features[0].label).toBe('global_marker_symbol_label');
			expect(store.getState().highlight.features[0].type).toEqual(HighlightFeatureType.DEFAULT);
		});
	});

	describe("when search query parameter 'CROSSHAIR' is empty", () => {
		it('does NOT add a highlight feature', async () => {
			const coordinate = [42, 21];
			const state = {
				position: { center: coordinate }
			};
			const store = setup(state);
			const emptyQueryParam = new URLSearchParams(QueryParameters.CROSSHAIR + '=');
			spyOn(environmentServiceMock, 'getQueryParams').and.returnValue(emptyQueryParam);
			const instanceUnderTest = new HighlightPlugin();
			await instanceUnderTest.register(store);

			await TestUtils.timeout();

			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});
});
