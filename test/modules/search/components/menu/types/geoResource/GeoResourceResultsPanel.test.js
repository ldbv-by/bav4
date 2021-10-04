import { $injector } from '../../../../../../../src/injection';
import { GeoResouceResultsPanel } from '../../../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultsPanel';
import { SearchResult, SearchResultTypes } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { setQuery } from '../../../../../../../src/store/search/search.action';
import { searchReducer } from '../../../../../../../src/store/search/search.reducer';
import { EventLike } from '../../../../../../../src/utils/storeUtils';
import { TestUtils } from '../../../../../../test-utils.js';

window.customElements.define(GeoResouceResultsPanel.tag, GeoResouceResultsPanel);

describe('GeoResouceResultsPanel', () => {


	const searchResultServiceMock = {
		geoResourcesByTerm() { }
	};

	const setup = (state) => {

		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultService', searchResultServiceMock);
		return TestUtils.render(GeoResouceResultsPanel.tag);
	};

	describe('static properties', () => {

		it('defines a debounce time', async () => {
			expect(GeoResouceResultsPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(GeoResouceResultsPanel.Min_Query_Length).toBe(2);
		});

	});

	describe('collaps button of item list', () => {

		it('renders the view', async (done) => {

			const element = await setup();

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
				expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(0);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.isshowall')).toBeFalsy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');
				done();
			}, GeoResouceResultsPanel.Debounce_Delay + 100);
		});

		it('renders the view based on a current query with less than "maxShow" results', async (done) => {
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm')
				.and.resolveTo([new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup(initialState);

			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
				expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.isshowall')).toBeTruthy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');

				expect(searchResultService).toHaveBeenCalled();
				done();

			}, GeoResouceResultsPanel.Debounce_Delay + 100);
		});

		it('renders the view based on a current query with more than "maxShow" results', async (done) => {
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm')
				.and.resolveTo([
					new SearchResult('geoResource0', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource1', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource2', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource3', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource4', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource5', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource6', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource7', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)
				]);

			const element = await setup(initialState);


			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
				expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(8);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.isshowall')).toBeFalsy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

				expect(searchResultService).toHaveBeenCalled();
				done();

			}, GeoResouceResultsPanel.Debounce_Delay + 100);
		});
	});

	describe('when state changes', () => {

		it('updates the view based on a current query', async (done) => {
			const query = 'foo';
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm')
				.and.resolveTo([new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup();
			setQuery(query);


			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
				expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

				expect(searchResultService).toHaveBeenCalled();
				done();

			}, GeoResouceResultsPanel.Debounce_Delay + 100);
		});
	});

	describe('collaps button', () => {

		describe('when items are available', () => {

			it('toggles the list of item', async (done) => {
				const query = 'foo';
				const initialState = {
					search: {
						query: new EventLike(query)
					}
				};
				const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm')
					.and.resolveTo([new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

				const element = await setup(initialState);

				//wait for elements
				setTimeout(() => {
					expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();

					const collapseButton = element.shadowRoot.querySelector('.georesource-label__collapse');

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeFalsy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					expect(searchResultService).toHaveBeenCalled();
					done();

				}, GeoResouceResultsPanel.Debounce_Delay + 100);
			});
		});

		describe('items are NOT available', () => {

			it('disables the collapse button', async (done) => {
				const element = await setup();

				//wait for elements
				setTimeout(() => {

					expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(0);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();

					const collapseButton = element.shadowRoot.querySelector('.georesource-label__collapse');

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
					done();

				}, GeoResouceResultsPanel.Debounce_Delay + 100);
			});
		});
	});

	describe('show-all button', () => {

		it('displays all results on click', async (done) => {
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			spyOn(searchResultServiceMock, 'geoResourcesByTerm')
				.and.resolveTo([
					new SearchResult('geoResource0', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource1', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource2', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource3', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource4', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource5', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource6', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE),
					new SearchResult('geoResource7', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)
				]);

			const element = await setup(initialState);

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(8);
				expect(element.shadowRoot.querySelector('.isshowall')).toBeFalsy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

				element.shadowRoot.querySelector('.show-all').click();

				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(8);
				expect(element.shadowRoot.querySelector('.isshowall')).toBeTruthy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
				done();

			}, GeoResouceResultsPanel.Debounce_Delay + 100);
		});
	});
});
