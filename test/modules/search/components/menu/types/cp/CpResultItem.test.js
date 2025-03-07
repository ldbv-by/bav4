import { createNoInitialStateMainMenuReducer } from '../../../../../../../src/store/mainMenu/mainMenu.reducer';
import { CpResultItem } from '../../../../../../../src/modules/search/components/menu/types/cp/CpResultItem';
import { CadastralParcelSearchResult } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';
import { positionReducer } from '../../../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../../../test-utils.js';
import { SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID } from '../../../../../../../src/plugins/HighlightPlugin';
import { Geometry } from '../../../../../../../src/domain/geometry.js';
import { SourceType, SourceTypeName } from '../../../../../../../src/domain/sourceType.js';
import { HighlightFeatureType } from '../../../../../../../src/domain/highlightFeature.js';
window.customElements.define(CpResultItem.tag, CpResultItem);

describe('CpResultItem', () => {
	let store;

	const setup = (state = {}) => {
		const initialState = {
			media: {
				portrait: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			position: positionReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer()
		});

		return TestUtils.render(CpResultItem.tag);
	};

	describe('static properties', () => {
		it('_maxZoomValue', async () => {
			expect(CpResultItem._maxZoomLevel).toBe(19);
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no data available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the view', async () => {
			const data = new CadastralParcelSearchResult('label', 'labelFormatted');
			const element = await setup();

			element.data = data;

			expect(element.shadowRoot.querySelector('li').innerText).toBe('labelFormatted');
		});
	});

	describe('events', () => {
		const previousCoordinate = [1, 2];
		const coordinate = [21, 42];
		const extent = [0, 1, 2, 3];
		const wktGeometry = new Geometry('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))', new SourceType(SourceTypeName.EWKT));
		const geoJsonGeometry = new Geometry("{ type: 'Point', coordinates: [21, 42, 0] }", new SourceType(SourceTypeName.GEOJSON));

		const setupOnMouseEnterTests = async (portraitOrientation, extent = null, geometry = null) => {
			const cpSearchResult = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate, extent, geometry);
			const element = await setup({
				highlight: {
					features: []
				},
				mainMenu: {
					open: true
				},
				media: {
					portrait: portraitOrientation
				}
			});
			element.data = cpSearchResult;
			return element;
		};

		const setupOnClickTests = async (portraitOrientation, extent = null, geometry = null) => {
			const cpSearchResult = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate, extent, geometry);
			const element = await setup({
				highlight: {
					features: [
						{ id: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID, data: previousCoordinate },
						{ id: SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, data: previousCoordinate }
					]
				},
				mainMenu: {
					open: true
				},
				media: {
					portrait: portraitOrientation
				}
			});
			element.data = cpSearchResult;
			return element;
		};

		describe('on mouse enter', () => {
			describe('result has data', () => {
				describe('type WKT', () => {
					it('sets a temporary highlight feature', async () => {
						const element = await setupOnMouseEnterTests(false, null, wktGeometry);

						const target = element.shadowRoot.querySelector('li');
						target.dispatchEvent(new Event('mouseenter'));

						expect(store.getState().highlight.features).toHaveSize(1);
						expect(store.getState().highlight.features[0].id).toEqual(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
						expect(store.getState().highlight.features[0].data).toEqual(wktGeometry);
						expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT_TMP);
					});
				});

				describe('type GEOJSON', () => {
					it('sets a temporary highlight feature', async () => {
						const element = await setupOnMouseEnterTests(false, null, geoJsonGeometry);

						const target = element.shadowRoot.querySelector('li');
						target.dispatchEvent(new Event('mouseenter'));

						expect(store.getState().highlight.features).toHaveSize(1);
						expect(store.getState().highlight.features[0].id).toEqual(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
						expect(store.getState().highlight.features[0].data).toEqual(geoJsonGeometry);
						expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT_TMP);
					});
				});
			});

			describe('result has a coordinate', () => {
				it('sets a temporary highlight feature', async () => {
					const coordinate = [21, 42];
					const data = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate);
					const element = await setup();
					element.data = data;

					const target = element.shadowRoot.querySelector('li');
					target.dispatchEvent(new Event('mouseenter'));

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().highlight.features[0].data).toEqual(coordinate);
					expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER_TMP);
					expect(store.getState().highlight.features[0].id).toBe(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
				});
			});
		});

		describe('on mouse leave', () => {
			it('removes a temporary highlight feature', async () => {
				const coordinate = [21, 42];
				const data = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate);
				const element = await setup({
					highlight: {
						features: [{ id: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID, data: coordinate }]
					}
				});
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseleave'));

				expect(store.getState().highlight.features).toHaveSize(0);
			});
		});

		describe('_throwError', () => {
			it('throws', async () => {
				const message = 'message';
				const element = await setup();

				expect(() => element._throwError(message)).toThrow(message);
			});
		});

		describe('on click', () => {
			describe('result has data', () => {
				describe('type WKT', () => {
					it('removes both an existing and temporary highlight feature and set the permanent highlight feature', async () => {
						const element = await setupOnClickTests(false, null, wktGeometry);

						const target = element.shadowRoot.querySelector('li');
						target.click();

						expect(store.getState().highlight.features).toHaveSize(1);
						expect(store.getState().highlight.features[0].id).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_ID);
						expect(store.getState().highlight.features[0].data).toEqual(wktGeometry);
						expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT);
						expect(store.getState().highlight.features[0].label).toBe('label');
					});
				});

				describe('type GEOJSON', () => {
					it('removes both an existing and temporary highlight feature and set the permanent highlight feature', async () => {
						const element = await setupOnClickTests(false, null, geoJsonGeometry);

						const target = element.shadowRoot.querySelector('li');
						target.click();

						expect(store.getState().highlight.features).toHaveSize(1);
						expect(store.getState().highlight.features[0].id).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_ID);
						expect(store.getState().highlight.features[0].data).toEqual(geoJsonGeometry);
						expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT);
						expect(store.getState().highlight.features[0].label).toBe('label');
					});
				});

				it('fits the map by a coordinate', async () => {
					const element = await setupOnClickTests(false, null, wktGeometry);

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().position.fitRequest.payload.extent).toEqual([...coordinate, ...coordinate]);
					expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(CpResultItem._maxZoomLevel);
				});
			});

			describe('result has NO extent', () => {
				it('removes both an existing and temporary highlight feature and set the permanent highlight feature', async () => {
					const element = await setupOnClickTests();

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().highlight.features[0].id).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_ID);
					expect(store.getState().highlight.features[0].data).toEqual(coordinate);
					expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER);
					expect(store.getState().highlight.features[0].label).toBe('label');
				});

				it('fits the map by a coordinate', async () => {
					const element = await setupOnClickTests();

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().position.fitRequest.payload.extent).toEqual([...coordinate, ...coordinate]);
					expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(CpResultItem._maxZoomLevel);
				});
			});

			describe('result has an extent', () => {
				it('removes both an existing and temporary highlight feature and sets NO highlight feature when we have an extent', async () => {
					const element = await setupOnClickTests(false, extent);

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().highlight.features).toHaveSize(0);
				});

				it('fits the map by an extent', async () => {
					const element = await setupOnClickTests(false, extent);

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().position.fitRequest.payload.extent).toEqual(extent);
					expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(CpResultItem._maxZoomLevel);
				});
			});

			it('closes the main menu in portrait orientation', async () => {
				const element = await setupOnClickTests(true);

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});
	});
});
