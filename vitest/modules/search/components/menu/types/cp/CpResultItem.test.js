import { createNoInitialStateMainMenuReducer } from '../../../../../../../src/store/mainMenu/mainMenu.reducer';
import { CpResultItem } from '../../../../../../../src/modules/search/components/menu/types/cp/CpResultItem';
import { CadastralParcelSearchResult } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';
import { positionReducer } from '../../../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../../../test-utils.js';
import { BaGeometry } from '../../../../../../../src/domain/geometry.js';
import { SourceType, SourceTypeName } from '../../../../../../../src/domain/sourceType.js';
import {
	HighlightFeatureType,
	SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY,
	SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY
} from '../../../../../../../src/domain/highlightFeature.js';
import { $injector } from '../../../../../../../src/injection/index.js';
import { featureCollectionReducer } from '../../../../../../../src/store/featureCollection/featureCollection.reducer.js';
import { BaFeature } from '../../../../../../../src/domain/feature.js';
import { notificationReducer } from '../../../../../../../src/store/notifications/notifications.reducer.js';
import { LevelTypes } from '../../../../../../../src/store/notifications/notifications.action.js';
import { AbstractResultItem, Highlight_Item_Class } from '../../../../../../../src/modules/search/components/menu/AbstractResultItem.js';
window.customElements.define(CpResultItem.tag, CpResultItem);

describe('CpResultItem', () => {
	const coordinate = [21, 42];
	const extent = [0, 1, 2, 3];
	const ewktGeometry = new BaGeometry('SRID=12345;POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))', new SourceType(SourceTypeName.EWKT));
	const geoJsonGeometry = new BaGeometry("{ type: 'Point', coordinates: [21, 42, 0] }", new SourceType(SourceTypeName.GEOJSON));
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
			media: createNoInitialStateMediaReducer(),
			featureCollection: featureCollectionReducer,
			notifications: notificationReducer
		});

		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(CpResultItem.tag);
	};

	describe('class', () => {
		it('inherits from AbstractResultItem', async () => {
			const element = await setup();

			expect(element instanceof AbstractResultItem).toBeTrue();
			expect(element.selectResult).toEqual(jasmine.any(Function));
			expect(element.highlightResult).toEqual(jasmine.any(Function));
		});
	});

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
			expect(element.shadowRoot.querySelectorAll('.chips__button')).toHaveSize(0);
		});

		describe('when CadastralParcelSearchResult is NOT part of the feature collection', () => {
			it('renders an `add-to-FeatureCollection` button', async () => {
				const element = await setup();
				const cpSearchResult = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate, extent, ewktGeometry);

				element.data = cpSearchResult;

				expect(element.shadowRoot.querySelectorAll('button.chips__button.remove')).toHaveSize(0);
				expect(element.shadowRoot.querySelectorAll('button.chips__button.add')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('button.chips__button.add').title).toBe('global_featureCollection_add_feature_title');
			});
		});

		describe('when CadastralParcelSearchResult is part of the feature collection', () => {
			it('renders a `remove-from-FeatureCollection` button', async () => {
				const id = 'id';
				const element = await setup({
					featureCollection: {
						entries: [new BaFeature(ewktGeometry, id)]
					}
				});
				const cpSearchResult = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate, extent, ewktGeometry).setId(id);

				element.data = cpSearchResult;

				expect(element.shadowRoot.querySelectorAll('button.chips__button.add')).toHaveSize(0);
				expect(element.shadowRoot.querySelectorAll('button.chips__button.remove')).toHaveSize(1);
				expect(element.shadowRoot.querySelector('button.chips__button.remove').title).toBe('global_featureCollection_remove_feature_title');
			});
		});
	});

	describe('events', () => {
		const previousCoordinate = [1, 2];

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
						{ category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, data: previousCoordinate },
						{ category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY, data: previousCoordinate }
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

		describe('`add-to-FeatureCollection` button is clicked', () => {
			it('adds the HighlightFeature to the feature collection, removes an existing HighlighFeature (permanent and temp.) and emits a notification', async () => {
				const id = 'id';
				const element = await setup({
					highlight: {
						features: [
							{ category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, data: coordinate },
							{ category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY, data: coordinate },
							{ category: 'fooCat', data: coordinate }
						]
					}
				});

				const cpSearchResult = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate, extent, ewktGeometry).setId(id);
				element.data = cpSearchResult;

				element.shadowRoot.querySelector('button.chips__button.add').click();

				expect(store.getState().featureCollection.entries).toHaveSize(1);
				expect(store.getState().featureCollection.entries[0].geometry).toEqual(ewktGeometry);
				expect(store.getState().featureCollection.entries[0].id).toBe(id);
				expect(store.getState().featureCollection.entries[0].get('name')).toBe(cpSearchResult.label);
				expect(store.getState().highlight.features).toEqual([{ category: 'fooCat', data: coordinate }]);
				expect(store.getState().notifications.latest.payload.content).toBe('global_featureCollection_add_feature_notification');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			});
		});

		describe('`remove-from-FeatureCollection` button is clicked', () => {
			it('removes the feature from feature collection, removes an existing HighlighFeature permanent and temp.) and emits a notification', async () => {
				const id = 'id';
				const element = await setup({
					featureCollection: {
						entries: [new BaFeature(ewktGeometry, id)]
					},
					highlight: {
						features: [
							{ category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, data: coordinate },
							{ category: SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY, data: coordinate },
							{ category: 'fooCat', data: coordinate }
						]
					}
				});
				const cpSearchResult = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate, extent, ewktGeometry).setId(id);
				element.data = cpSearchResult;

				element.shadowRoot.querySelector('button.chips__button.remove').click();

				expect(store.getState().featureCollection.entries).toHaveSize(0);
				expect(store.getState().highlight.features).toEqual([{ category: 'fooCat', data: coordinate }]);
				expect(store.getState().notifications.latest.payload.content).toBe('global_featureCollection_remove_feature_notification');
				expect(store.getState().notifications.latest.payload.level).toEqual(LevelTypes.INFO);
			});
		});

		describe('on mouse enter', () => {
			describe('result has data', () => {
				describe('type WKT', () => {
					it('sets a temporary highlight feature', async () => {
						const element = await setupOnMouseEnterTests(false, null, ewktGeometry);

						const target = element.shadowRoot.querySelector('li');
						target.dispatchEvent(new Event('mouseenter'));

						expect(store.getState().highlight.features).toHaveSize(1);
						expect(store.getState().highlight.features[0].category).toEqual(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY);
						expect(store.getState().highlight.features[0].data).toEqual(ewktGeometry);
						expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT_TMP);
						expect(store.getState().highlight.features[0].id).toBeInstanceOf(String);
						expect(element.classList.contains(Highlight_Item_Class)).toBeTrue();
					});
				});

				describe('type GEOJSON', () => {
					it('sets a temporary highlight feature', async () => {
						const element = await setupOnMouseEnterTests(false, null, geoJsonGeometry);

						const target = element.shadowRoot.querySelector('li');
						target.dispatchEvent(new Event('mouseenter'));

						expect(store.getState().highlight.features).toHaveSize(1);
						expect(store.getState().highlight.features[0].category).toEqual(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY);
						expect(store.getState().highlight.features[0].data).toEqual(geoJsonGeometry);
						expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT_TMP);
						expect(store.getState().highlight.features[0].id).toBeInstanceOf(String);
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
					expect(store.getState().highlight.features[0].category).toBe(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY);
					expect(store.getState().highlight.features[0].id).toBeInstanceOf(String);
				});
			});
		});

		describe('on mouse leave', () => {
			it('removes a temporary highlight feature', async () => {
				const coordinate = [21, 42];
				const data = new CadastralParcelSearchResult('label', 'labelFormatted', coordinate);
				const element = await setup({
					highlight: {
						features: [{ category: SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_CATEGORY, data: coordinate }]
					}
				});
				element.data = data;
				element.classList.add(Highlight_Item_Class);

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseleave'));

				expect(store.getState().highlight.features).toHaveSize(0);
				expect(element.classList.contains(Highlight_Item_Class)).toBeFalse();
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
						const element = await setupOnClickTests(false, null, ewktGeometry);

						const target = element.shadowRoot.querySelector('li');
						target.click();

						expect(store.getState().highlight.features).toHaveSize(1);
						expect(store.getState().highlight.features[0].category).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY);
						expect(store.getState().highlight.features[0].data).toEqual(ewktGeometry);
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
						expect(store.getState().highlight.features[0].category).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY);
						expect(store.getState().highlight.features[0].data).toEqual(geoJsonGeometry);
						expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT);
						expect(store.getState().highlight.features[0].label).toBe('label');
					});
				});

				it('fits the map by a coordinate', async () => {
					const element = await setupOnClickTests(false, null, ewktGeometry);

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
					expect(store.getState().highlight.features[0].category).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_CATEGORY);
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
