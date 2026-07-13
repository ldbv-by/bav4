import { $injector } from '@src/injection';
import { LocationResultsPanel } from '@src/modules/search/components/menu/types/location/LocationResultsPanel';
import { LocationSearchResult } from '@src/modules/search/services/domain/searchResult';
import { setQuery } from '@src/store/search/search.action';
import { searchReducer } from '@src/store/search/search.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '@src/utils/markup';
import { EventLike } from '@src/utils/storeUtils';
import { TestUtils } from '@test/test-utils.js';

window.customElements.define(LocationResultsPanel.tag, LocationResultsPanel);

describe('LocationResultsPanel', () => {
	const searchResultServiceMock = {
		locationsByTerm() {}
	};

	const setup = (state) => {
		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('SearchResultService', searchResultServiceMock);
		return TestUtils.render(LocationResultsPanel.tag);
	};

	describe('static properties', () => {
		it('defines a debounce time', async () => {
			expect(LocationResultsPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(LocationResultsPanel.Min_Query_Length).toBe(2);
		});

		it('defines a default result item size', async () => {
			expect(LocationResultsPanel.Default_Result_Item_Length).toBe(4);
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await setup();

			//wait for elements
			await TestUtils.timeout(LocationResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(0);
			expect(element.shadowRoot.querySelectorAll('ba-badge.results-count')).toHaveLength(1);
			expect(element.shadowRoot.querySelector('ba-badge.results-count').label).toBe(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('none');
		});

		it('renders the view based on a current query with "Default_Result_Item_Length" results', async () => {
			const results = Array.from(
				{ length: LocationResultsPanel.Default_Result_Item_Length },
				(_, i) => new LocationSearchResult(`labelLocation${i}`, `labelLocationFormated${i}`)
			);
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const getLocationSearchResultProvider = vi.spyOn(searchResultServiceMock, 'locationsByTerm').mockResolvedValue(results);

			const element = await setup(initialState);

			//wait for elements
			await TestUtils.timeout(LocationResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(LocationResultsPanel.Default_Result_Item_Length);
			expect(element.shadowRoot.querySelectorAll('ba-search-content-panel-location-item')[0].hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe(true);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('inline');

			expect(getLocationSearchResultProvider).toHaveBeenCalled();
		});

		it('renders the view based on a current query with more than "maxShow" results', async () => {
			const results = Array.from(
				{ length: LocationResultsPanel.Default_Result_Item_Length + 1 },
				(_, i) => new LocationSearchResult(`labelLocation${i}`, `labelLocationFormated${i}`)
			);
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const getLocationSearchResultProvider = vi.spyOn(searchResultServiceMock, 'locationsByTerm').mockResolvedValue(results);

			const element = await setup(initialState);

			//wait for elements
			await TestUtils.timeout(LocationResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(LocationResultsPanel.Default_Result_Item_Length);
			expect(element.shadowRoot.querySelector('ba-badge.results-count').label).toBe(5);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('inline');

			expect(getLocationSearchResultProvider).toHaveBeenCalled();
		});
	});

	describe('when query changes', () => {
		it('updates the view based on a current query', async () => {
			const query = 'foo';
			const getLocationSearchResultProvider = vi
				.spyOn(searchResultServiceMock, 'locationsByTerm')
				.mockResolvedValue([new LocationSearchResult('labelLocation', 'labelLocationFormated')]);

			const element = await setup();
			setQuery(query);

			//wait for elements
			await TestUtils.timeout(LocationResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
			expect(element.shadowRoot.querySelector('ba-badge.results-count').label).toBe(1);

			expect(getLocationSearchResultProvider).toHaveBeenCalled();

			setQuery(null);

			await TestUtils.timeout(LocationResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(0);
			expect(element.shadowRoot.querySelector('ba-badge.results-count').label).toBe(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('none');
		});
	});

	describe('show-all button', () => {
		it('displays all results on click', async () => {
			const results = Array.from(
				{ length: LocationResultsPanel.Default_Result_Item_Length + 1 },
				(_, i) => new LocationSearchResult(`labelLocation${i}`, `labelLocationFormated${i}`)
			);
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			vi.spyOn(searchResultServiceMock, 'locationsByTerm').mockResolvedValue(results);
			const element = await setup(initialState);
			//wait for elements
			await TestUtils.timeout(LocationResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(LocationResultsPanel.Default_Result_Item_Length);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('inline');

			element.onShowAll = () => {
				element.allShown = true;
			};

			element.shadowRoot.querySelector('#show-all').click();

			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(LocationResultsPanel.Default_Result_Item_Length + 1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('none');
		});
	});

	describe("when property 'allShown' changes", () => {
		it('updates the view', async () => {
			const results = Array.from(
				{ length: LocationResultsPanel.Default_Result_Item_Length + 1 },
				(_, i) => new LocationSearchResult(`labelLocation${i}`, `labelLocationFormated${i}`)
			);
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			vi.spyOn(searchResultServiceMock, 'locationsByTerm').mockResolvedValue(results);
			const element = await setup(initialState);
			//wait for elements
			await TestUtils.timeout(LocationResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(LocationResultsPanel.Default_Result_Item_Length);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('inline');

			element.allShown = true;
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('none');

			element.allShown = false;
			expect(window.getComputedStyle(element.shadowRoot.querySelector('#show-all')).display).toBe('inline');
		});
	});
});
