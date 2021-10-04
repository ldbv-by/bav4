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

	describe('static properties', () => {

		it('defines a debounce time', async () => {
			expect(LocationResultsPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(LocationResultsPanel.Min_Query_Length).toBe(2);
		});

	});

	describe('when initialized', () => {

		it('renders the view', async (done) => {

			const element = await setup();

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(0);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.isshowall')).toBeFalsy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');
				done();
			}, LocationResultsPanel.Debounce_Delay + 100);
		});

		it('renders the view based on a current query with less then "maxShow" results', async (done) => {
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const getLocationSearchResultProvider = spyOn(searchResultServiceMock, 'locationsByTerm')
				.and.resolveTo([new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);

			const element = await setup(initialState);


			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.isshowall')).toBeTruthy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');

				expect(getLocationSearchResultProvider).toHaveBeenCalled();
				done();
			}, LocationResultsPanel.Debounce_Delay + 100);
		});


		it('renders the view based on a current query with more than "maxShow" results', async (done) => {
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const getLocationSearchResultProvider = spyOn(searchResultServiceMock, 'locationsByTerm')
				.and.resolveTo([
					new SearchResult('location0', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location1', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location2', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location3', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location4', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location5', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location6', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location7', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)
				]);

			const element = await setup(initialState);


			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(8);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.isshowall')).toBeFalsy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

				expect(getLocationSearchResultProvider).toHaveBeenCalled();
				done();
			}, LocationResultsPanel.Debounce_Delay + 100);
		});
	});

	describe('when state changes', () => {

		it('updates the view based on a current query', async (done) => {
			const query = 'foo';
			const getLocationSearchResultProvider = spyOn(searchResultServiceMock, 'locationsByTerm')
				.and.resolveTo([new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);

			const element = await setup();
			setQuery(query);

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.location-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.location-label__text').textContent).toBe('search_menu_locationResultsPanel_label');
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

				expect(getLocationSearchResultProvider).toHaveBeenCalled();
				done();
			}, LocationResultsPanel.Debounce_Delay + 100);
		});
	});

	describe('collaps button of item list', () => {

		describe('when items are available', () => {

			it('toggles the list of item', async (done) => {
				const query = 'foo';
				const initialState = {
					search: {
						query: new EventLike(query)
					}
				};
				const getLocationSearchResultProvider = spyOn(searchResultServiceMock, 'locationsByTerm')
					.and.resolveTo([new SearchResult('location', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)]);

				const element = await setup(initialState);

				//wait for elements
				setTimeout(() => {
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
					done();

				}, LocationResultsPanel.Debounce_Delay + 100);
			});
		});

		describe('items are NOT available', () => {

			it('disables the collapse button', async (done) => {
				const element = await setup();

				//wait for elements
				setTimeout(() => {

					expect(element.shadowRoot.querySelector('.location-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(0);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();

					const collapseButton = element.shadowRoot.querySelector('.location-label__collapse');

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
					done();

				}, LocationResultsPanel.Debounce_Delay + 100);
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
			spyOn(searchResultServiceMock, 'locationsByTerm')
				.and.resolveTo([
					new SearchResult('location0', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location1', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location2', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location3', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location4', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location5', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location6', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION),
					new SearchResult('location7', 'labelLocation', 'labelLocationFormated', SearchResultTypes.LOCATION)
				]);

			const element = await setup(initialState);


			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(8);
				expect(element.shadowRoot.querySelector('.isshowall')).toBeFalsy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

				element.shadowRoot.querySelector('.show-all').click();

				expect(element.shadowRoot.querySelector('.location-items').childElementCount).toBe(8);
				expect(element.shadowRoot.querySelector('.isshowall')).toBeTruthy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
				done();

			}, LocationResultsPanel.Debounce_Delay + 100);
		});
	});
});
