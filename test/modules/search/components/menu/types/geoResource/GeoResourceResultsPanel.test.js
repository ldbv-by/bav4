import { $injector } from '../../../../../../../src/injection';
import { GeoResourceResultsPanel } from '../../../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultsPanel';
import { GeoResourceSearchResult } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { setQuery } from '../../../../../../../src/store/search/search.action';
import { searchReducer } from '../../../../../../../src/store/search/search.reducer';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../../../../src/utils/markup';
import { EventLike } from '../../../../../../../src/utils/storeUtils';
import { TestUtils } from '../../../../../../test-utils.js';

window.customElements.define(GeoResourceResultsPanel.tag, GeoResourceResultsPanel);

describe('GeoResourceResultsPanel', () => {
	const searchResultServiceMock = {
		geoResourcesByTerm() {}
	};

	const setup = (state) => {
		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('SearchResultService', searchResultServiceMock);
		return TestUtils.render(GeoResourceResultsPanel.tag);
	};

	describe('static properties', () => {
		it('defines a debounce time', async () => {
			expect(GeoResourceResultsPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(GeoResourceResultsPanel.Min_Query_Length).toBe(2);
		});

		it('defines a default result item size', async () => {
			expect(GeoResourceResultsPanel.Default_Result_Item_Length).toBe(7);
		});
	});

	describe('GeoResourceResultPanel', () => {
		it('renders the view', async () => {
			const element = await setup();

			//wait for elements
			await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
			expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(0);
			expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
		});

		it('renders the view based on a current query with "Default_Result_Item_Length" results', async () => {
			const results = Array.from(
				{ length: GeoResourceResultsPanel.Default_Result_Item_Length },
				(_, i) => new GeoResourceSearchResult(`labelGeoResource${i}`, `labelGeoResourceFormated${i}`)
			);
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm').and.resolveTo(results);

			const element = await setup(initialState);

			await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
			expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(GeoResourceResultsPanel.Default_Result_Item_Length);
			expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');

			expect(searchResultService).toHaveBeenCalled();
		});

		it('renders the view based on a current query with more than "Default_Result_Item_Length" results', async () => {
			const results = Array.from(
				{ length: GeoResourceResultsPanel.Default_Result_Item_Length + 1 },
				(_, i) => new GeoResourceSearchResult(`labelGeoResource${i}`, `labelGeoResourceFormated${i}`)
			);

			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm').and.resolveTo(results);

			const element = await setup(initialState);

			//wait for elements
			await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
			expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(GeoResourceResultsPanel.Default_Result_Item_Length);
			expect(element.shadowRoot.querySelectorAll('ba-search-content-panel-georesource-item')[0].hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
			expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

			expect(searchResultService).toHaveBeenCalled();
		});
	});

	describe('when query changes', () => {
		it('updates the view based on a current query', async () => {
			const query = 'foo';
			const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm').and.resolveTo([
				new GeoResourceSearchResult('labelGeoResource', 'labelGeoResourceFormated')
			]);
			const element = await setup();

			setQuery(query);

			//wait for elements
			await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
			expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(1);
			expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

			expect(searchResultService).toHaveBeenCalled();

			setQuery(null);

			await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.georesource-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-label__text').textContent).toBe('search_menu_geoResourceResultsPanel_label');
			expect(element.shadowRoot.querySelector('.georesource-label__collapse')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(0);
			expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
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
				const searchResultService = spyOn(searchResultServiceMock, 'geoResourcesByTerm').and.resolveTo([
					new GeoResourceSearchResult('labelGeoResource', 'labelGeoResourceFormated')
				]);

				const element = await setup(initialState);

				//wait for elements
				await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);
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

		describe('items are NOT available', () => {
			it('disables the collapse button', async () => {
				const element = await setup();

				//wait for elements
				await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);

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

	describe('show-all button', () => {
		it('displays all results on click', async () => {
			const results = Array.from(
				{ length: GeoResourceResultsPanel.Default_Result_Item_Length + 1 },
				(_, i) => new GeoResourceSearchResult(`labelGeoResource${i}`, `labelGeoResourceFormated${i}`)
			);
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			spyOn(searchResultServiceMock, 'geoResourcesByTerm').and.resolveTo(results);

			const element = await setup(initialState);

			//wait for elements
			await TestUtils.timeout(GeoResourceResultsPanel.Debounce_Delay + 100);
			expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(GeoResourceResultsPanel.Default_Result_Item_Length);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

			element.shadowRoot.querySelector('.show-all').click();

			expect(element.shadowRoot.querySelector('.georesource-items').childElementCount).toBe(GeoResourceResultsPanel.Default_Result_Item_Length + 1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
		});
	});
});
