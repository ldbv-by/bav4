import { $injector } from '../../../../../../../src/injection';
import { LocationResultsPanel } from '../../../../../../../src/modules/search/components/menu/types/location/LocationResultsPanel';
import { SearchResult, SearchResultTypes } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { setQuery } from '../../../../../../../src/store/search/search.action';
import { searchReducer } from '../../../../../../../src/store/search/search.reducer';
import { EventLike } from '../../../../../../../src/utils/storeUtils';
import { TestUtils } from '../../../../../../test-utils.js';

window.customElements.define(LocationResultsPanel.tag, LocationResultsPanel);

describe('LocationResultsPanel', () => {


	const searchResultServiceMock = {
		locationsByTerm() { }
	};

	const setup = (state) => {

		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultService', searchResultServiceMock);
		return TestUtils.render(LocationResultsPanel.tag);
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
			expect(LocationResultsPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(LocationResultsPanel.Min_Query_Length).toBe(2);
		});

	});

	describe('when initialized', () => {

		it('renders the view', async () => {

			const element = await setup();

			//internally uses debounce
			jasmine.clock().tick(LocationResultsPanel.Debounce_Delay + 100);
			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(0);
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
			const getLocationSearchResultProvider = spyOn(searchResultServiceMock, 'locationsByTerm')
				.and.resolveTo([new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);

			const element = await setup(initialState);

			//internally uses debounce
			jasmine.clock().tick(LocationResultsPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

				expect(getLocationSearchResultProvider).toHaveBeenCalled();
			});
		});
	});

	describe('when state changes', () => {

		it('updates the view based on a current query', async () => {
			const query = 'foo';
			const getLocationSearchResultProvider = spyOn(searchResultServiceMock, 'locationsByTerm')
				.and.resolveTo([new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);

			const element = await setup();
			setQuery(query);

			//internally uses debounce
			jasmine.clock().tick(LocationResultsPanel.Debounce_Delay + 100);

			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

				expect(getLocationSearchResultProvider).toHaveBeenCalled();
			});
		});
	});

	describe('collaps button of item list', () => {

		describe('when items are available', () => {

			it('toggles the list of item', async () => {
				const query = 'foo';
				const initialState = {
					search: {
						query: new EventLike(query)
					}
				};
				const getLocationSearchResultProvider = spyOn(searchResultServiceMock, 'locationsByTerm')
					.and.resolveTo([new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);

				const element = await setup(initialState);

				//internally uses debounce
				jasmine.clock().tick(LocationResultsPanel.Debounce_Delay + 100);

				//wait for elements
				window.requestAnimationFrame(() => {
					expect(element.shadowRoot.querySelector('.location-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();

					const collapseButton = element.shadowRoot.querySelector('.location-label__collapse');

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeFalsy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					expect(getLocationSearchResultProvider).toHaveBeenCalled();
				});
			});
		});

		describe('items are NOT available', () => {

			it('disables the collapse button', async () => {
				const element = await setup();

				//internally uses debounce
				jasmine.clock().tick(LocationResultsPanel.Debounce_Delay + 100);

				//wait for elements
				window.requestAnimationFrame(() => {

					expect(element.shadowRoot.querySelector('.location-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(0);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();

					const collapseButton = element.shadowRoot.querySelector('.location-label__collapse');

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
