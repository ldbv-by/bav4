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
		geoResourcesByTerm() { },
	};

	const setup = (state) => {

		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultService', searchResultServiceMock);
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

	describe('collaps button of item list', () => {

		it('renders the view', async () => {

			const element = await setup();

			//internally uses debounce
			jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);
			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
				expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(0);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
			});
		});

		it('renders the view based on a current query', async () => {
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm')
				.and.resolveTo([new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup(initialState);

			//internally uses debounce
			jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
				expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

				expect(searchResultService).toHaveBeenCalled();
			});
		});
	});

	describe('when state changes', () => {

		it('updates the view based on a current query', async () => {
			const query = 'foo';
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm')
				.and.resolveTo([new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

			const element = await setup();
			setQuery(query);

			//internally uses debounce
			jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
				expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

				expect(searchResultService).toHaveBeenCalled();
			});
		});
	});

	describe('collaps button', () => {

		describe('when items are available', () => {

			it('toggles the list of item', async () => {
				const query = 'foo';
				const initialState = {
					search: {
						query: new EventLike(query)
					}
				};
				const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm')
					.and.resolveTo([new SearchResult('geoResource', 'labelGeoResource', 'labelGeoResourceFormated', SearchResultTypes.GEORESOURCE)]);

				const element = await setup(initialState);

				//internally uses debounce
				jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);

				//wait for elements
				window.requestAnimationFrame(() => {
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
				});
			});
		});

		describe('items are NOT available', () => {

			it('disables the collapse button', async () => {
				const element = await setup();

				//internally uses debounce
				jasmine.clock().tick(GeoResouceResultsPanel.Debounce_Delay + 100);

				//wait for elements
				window.requestAnimationFrame(() => {

					expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(0);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();

					const collapseButton = element.shadowRoot.querySelector('.georesource-label__collapse');

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				});
			});
		});
	});
});
