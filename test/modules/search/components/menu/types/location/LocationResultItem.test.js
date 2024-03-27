import { createNoInitialStateMainMenuReducer } from '../../../../../../../src/store/mainMenu/mainMenu.reducer';
import { LocationResultItem } from '../../../../../../../src/modules/search/components/menu/types/location/LocationResultItem';
import { LocationSearchResult } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { HighlightFeatureType } from '../../../../../../../src/store/highlight/highlight.action';
import { highlightReducer } from '../../../../../../../src/store/highlight/highlight.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../../../src/store/media/media.reducer';
import { positionReducer } from '../../../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../../../test-utils.js';
import { SEARCH_RESULT_HIGHLIGHT_FEATURE_ID, SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID } from '../../../../../../../src/plugins/HighlightPlugin';
window.customElements.define(LocationResultItem.tag, LocationResultItem);
import { $injector } from '../../../../../../../src/injection';
import { routingReducer } from '../../../../../../../src/store/routing/routing.reducer';
import { CoordinateProposalType, RoutingStatusCodes } from '../../../../../../../src/domain/routing';

describe('LocationResultItem', () => {
	let store;

	const setup = (state = {}) => {
		const initialState = {
			media: {
				portrait: false
			},
			routing: {
				status: RoutingStatusCodes.Start_Destination_Missing,
				categoryId: 'bike'
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			highlight: highlightReducer,
			position: positionReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			routing: routingReducer
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(LocationResultItem.tag);
	};

	describe('static properties', () => {
		it('_maxZoomValue', async () => {
			expect(LocationResultItem._maxZoomLevel).toBe(19);
		});
	});

	describe('when initialized', () => {
		it('renders nothing when no data available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the view', async () => {
			const data = new LocationSearchResult('label', 'labelFormatted');
			const element = await setup();

			element.data = data;

			expect(element.shadowRoot.querySelectorAll('.ba-list-item__text')[0].innerText).toBe('labelFormatted');
			expect(element.shadowRoot.querySelectorAll('ba-icon-button')).toHaveSize(0);
		});

		it('renders a routing button', async () => {
			const coordinate = [21, 42];
			const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
			const element = await setup();
			element.data = data;

			expect(element.shadowRoot.querySelectorAll('.ba-list-item__text')[0].innerText).toBe('labelFormatted');
			expect(element.shadowRoot.querySelectorAll('.ba-icon-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__after')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.separator')).toHaveSize(1);

			const button = element.shadowRoot.querySelector('ba-icon');
			expect(button.title).toBe('search_result_item_start_routing_here');
			expect(button.size).toBe(2);
			expect(button.color).toBe('var(--primary-color)');
			expect(button.color_hover).toBe('var(--text3)');
		});

		it('renders no routing button', async () => {
			const coordinate = [21, 42];
			const extent = [0, 1, 2, 3];
			const data = new LocationSearchResult('label', 'labelFormatted', coordinate, extent);
			const element = await setup();
			element.data = data;

			expect(element.shadowRoot.querySelectorAll('.ba-list-item__text')[0].innerText).toBe('labelFormatted');
			expect(element.shadowRoot.querySelectorAll('.ba-icon-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.ba-list-item__after')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.separator')).toHaveSize(0);

			expect(element.shadowRoot.querySelectorAll('ba-icon')).toHaveSize(0);
		});
	});

	describe('events', () => {
		describe('on mouse enter', () => {
			it('sets a temporary highlight feature', async () => {
				const coordinate = [21, 42];
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
				const element = await setup();
				element.data = data;

				const target = element.shadowRoot.querySelector('li');
				target.dispatchEvent(new Event('mouseenter'));

				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].data.coordinate).toEqual(coordinate);
				expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER_TMP);
				expect(store.getState().highlight.features[0].id).toBe(SEARCH_RESULT_TEMPORARY_HIGHLIGHT_FEATURE_ID);
			});
		});

		describe('on mouse leave', () => {
			it('removes a temporary highlight feature', async () => {
				const coordinate = [21, 42];
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
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

		describe('on click', () => {
			const previousCoordinate = [1, 2];
			const coordinate = [21, 42];
			const extent = [0, 1, 2, 3];

			const setupOnClickTests = async (portraitOrientation, extent = null) => {
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate, extent);
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
				element.data = data;
				return element;
			};

			describe('result has NO extent', () => {
				it('removes both an existing and temporary highlight feature and set the permanent highlight feature', async () => {
					const element = await setupOnClickTests();

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().highlight.features[0].id).toEqual(SEARCH_RESULT_HIGHLIGHT_FEATURE_ID);
					expect(store.getState().highlight.features[0].data.coordinate).toEqual(coordinate);
					expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER);
				});

				it('fits the map by a coordinate', async () => {
					const element = await setupOnClickTests();

					const target = element.shadowRoot.querySelector('li');
					target.click();

					expect(store.getState().position.fitRequest.payload.extent).toEqual([...coordinate, ...coordinate]);
					expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(LocationResultItem._maxZoomLevel);
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
					expect(store.getState().position.fitRequest.payload.options.maxZoom).toBe(LocationResultItem._maxZoomLevel);
				});
			});

			it('closes the main menu in portrait orientation', async () => {
				const element = await setupOnClickTests(true);

				const target = element.shadowRoot.querySelector('li');
				target.click();

				expect(store.getState().mainMenu.open).toBeFalse();
			});
		});

		describe('when routing button is clicked', () => {
			it('resets s-o-s routing', async () => {
				const state = {
					routing: {
						status: RoutingStatusCodes.Start_Missing,
						categoryId: 'bike',
						route: {},
						waypoints: [[]]
					}
				};

				const coordinate = [21, 42];
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
				const element = await setup(state);
				element.data = data;

				const button = element.shadowRoot.querySelector('ba-icon');

				button.click();

				expect(store.getState().routing).toEqual(
					jasmine.objectContaining({ waypoints: [], route: null, status: RoutingStatusCodes.Start_Destination_Missing })
				);
			});

			it('changes to START_OR_DESTINATION proposal coordinate on click', async () => {
				const coordinate = [21, 42];
				const data = new LocationSearchResult('label', 'labelFormatted', coordinate);
				const element = await setup();
				element.data = data;

				const button = element.shadowRoot.querySelector('ba-icon');

				button.click();

				expect(store.getState().routing.proposal.payload).toEqual({
					coord: [21, 42],
					type: CoordinateProposalType.START_OR_DESTINATION
				});
			});
		});
	});
});
