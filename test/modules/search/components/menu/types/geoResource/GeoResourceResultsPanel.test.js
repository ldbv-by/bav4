import { $injector } from '../../../../../../../src/injection';
import { GeoResouceResultsPanel } from '../../../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultsPanel';
import { SearchResult, SearchResultTypes } from '../../../../../../../src/services/domain/searchResult';
import { setQuery } from '../../../../../../../src/store/search/search.action';
import { searchReducer } from '../../../../../../../src/store/search/search.reducer';
import { EventLike } from '../../../../../../../src/utils/storeUtils';
import { TestUtils } from '../../../../../../test-utils.js';

window.customElements.define(GeoResouceResultsPanel.tag, GeoResouceResultsPanel);

describe('GeoResouceResultsPanel', () => {


	const searchResultProviderServiceMock = {
		getGeoresourceSearchResultProvider() { },
	};

	const setup = (state) => {

		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultProviderService', searchResultProviderServiceMock);
		return TestUtils.render(GeoResouceResultsPanel.tag);
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
			expect(GeoResouceResultsPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(GeoResouceResultsPanel.Min_Query_Length).toBe(2);
		});

	});

	describe('when initialized', () => {

		it('renders the view', async () => {

			const element = await setup();

			//internally uses debounce
			jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);
			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label').textContent).toBe('search_menu_geoResourceResultsPanel_label:');
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
			const getGeoResourceSearchResultProviderSpy = spyOn(searchResultProviderServiceMock, 'getGeoresourceSearchResultProvider')
				.and.returnValue(async () => [new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup(initialState);

			//internally uses debounce
			jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label').textContent).toBe('search_menu_geoResourceResultsPanel_label:');
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);

				expect(getGeoResourceSearchResultProviderSpy).toHaveBeenCalled();
			});
		});
	});

	describe('when state changes', () => {

		it('updates the view based on a current query', async () => {
			const query = 'foo';
			const getGeoResourceSearchResultProviderSpy = spyOn(searchResultProviderServiceMock, 'getGeoresourceSearchResultProvider')
				.and.returnValue(async () => [new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup();
			setQuery(query);

			//internally uses debounce
			jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label').textContent).toBe('search_menu_geoResourceResultsPanel_label:');
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);

				expect(getGeoResourceSearchResultProviderSpy).toHaveBeenCalled();
			});
		});
	});
});
