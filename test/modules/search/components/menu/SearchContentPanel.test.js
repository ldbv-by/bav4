import { $injector } from '../../../../../src/injection';
import { SearchContentPanel } from '../../../../../src/modules/search/components/menu/SearchContentPanel';
import { SearchResult, SearchResultTypes } from '../../../../../src/modules/search/services/searchResult';
import { setQuery } from '../../../../../src/store/search/search.action';
import { searchReducer } from '../../../../../src/store/search/search.reducer';
import { EventLike } from '../../../../../src/utils/storeUtils';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(SearchContentPanel.tag, SearchContentPanel);

describe('SearchContentPanel', () => {


	const searchResultProviderServiceMock = {
		getLocationSearchResultProvider() { },
		getGeoresourceSearchResultProvider() { },
	};

	const setup = (state) => {

		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultProviderService', searchResultProviderServiceMock);
		return TestUtils.render(SearchContentPanel.tag);
	};

	beforeEach(async () => {
		jasmine.clock().install();
		TestUtils.setupStoreAndDi({});
	});

	afterEach(function () {
		jasmine.clock().uninstall();
	});

	describe('static properties', () => {

		it('defines a debounce time', async () => {
			expect(SearchContentPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(SearchContentPanel.Min_Query_Length).toBe(2);
		});

	});

	describe('when initialized', () => {

		it('renders the view', async () => {

			const element = await setup();

			//internally uses debounce
			jasmine.clock().tick(SearchContentPanel.Debounce_Delay + 100);
			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.search-content-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label').textContent).toBe('search_menu_contentPanel_location_label:');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(0);
				expect(element.shadowRoot.querySelector('.georesource-label').textContent).toBe('search_menu_contentPanel_georesources_label:');
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(0);
			});
		});

		it('renders the view based on a current query', async () => {
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const getLocationSearchResultProvider = spyOn(searchResultProviderServiceMock, 'getLocationSearchResultProvider')
				.and.returnValue(async () => [new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);
			const getGeoResourceSearchResultProvider = spyOn(searchResultProviderServiceMock, 'getGeoresourceSearchResultProvider')
				.and.returnValue(async () => [new SearchResult('location', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup(initialState);

			//internally uses debounce
			jasmine.clock().tick(SearchContentPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.search-content-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label').textContent).toBe('search_menu_contentPanel_location_label:');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.georesource-label').textContent).toBe('search_menu_contentPanel_georesources_label:');
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);

				expect(getLocationSearchResultProvider).toHaveBeenCalled();
				expect(getGeoResourceSearchResultProvider).toHaveBeenCalled();
			});
		});
	});

	describe('when state changes', () => {

		it('updates the view based on a current query', async () => {
			const query = 'foo';
			const getLocationSearchResultProvider = spyOn(searchResultProviderServiceMock, 'getLocationSearchResultProvider')
				.and.returnValue(async () => [new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);
			const getGeoResourceSearchResultProvider = spyOn(searchResultProviderServiceMock, 'getGeoresourceSearchResultProvider')
				.and.returnValue(async () => [new SearchResult('location', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup();
			setQuery(query);

			//internally uses debounce
			jasmine.clock().tick(SearchContentPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.search-content-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label').textContent).toBe('search_menu_contentPanel_location_label:');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.georesource-label').textContent).toBe('search_menu_contentPanel_georesources_label:');
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);

				expect(getLocationSearchResultProvider).toHaveBeenCalled();
				expect(getGeoResourceSearchResultProvider).toHaveBeenCalled();
			});
		});
	});

	describe('_requestData', () => {
		
		describe('query term length <= minimum lenght', () => {
			it('returns empty array', async () => {
				const element = await setup();

				const result = await element._requestData('');

				expect(result.length).toBe(0);
			});
		});

		describe('provider throws an error', () => {
			it('returns empty array and logs a warn statement', async () => {
				const provider = async () => {
					throw new Error('foo');
				};
				const warnSpy = spyOn(console, 'warn');
				const element = await setup();

				const result = await element._requestData('foobar', provider);

				expect(result.length).toBe(0);
				expect(warnSpy).toHaveBeenCalledWith('foo');
			});
		});
	});
});
