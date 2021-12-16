import { $injector } from '../../../../../../../src/injection';
import { CpResultsPanel } from '../../../../../../../src/modules/search/components/menu/types/cp/CpResultsPanel';
import { SearchResult, SearchResultTypes } from '../../../../../../../src/modules/search/services/domain/searchResult';
import { setQuery } from '../../../../../../../src/store/search/search.action';
import { searchReducer } from '../../../../../../../src/store/search/search.reducer';
import { EventLike } from '../../../../../../../src/utils/storeUtils';
import { TestUtils } from '../../../../../../test-utils.js';

window.customElements.define(CpResultsPanel.tag, CpResultsPanel);

describe('CpResultsPanel', () => {

	const searchResultServiceMock = {
		cadastralParcelsByTerm() { }
	};

	const setup = (state) => {

		TestUtils.setupStoreAndDi(state, { search: searchReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('SearchResultService', searchResultServiceMock);
		return TestUtils.render(CpResultsPanel.tag);
	};

	describe('static properties', () => {

		it('defines a debounce time', async () => {
			expect(CpResultsPanel.Debounce_Delay).toBe(200);
		});

		it('defines a minimal query length', async () => {
			expect(CpResultsPanel.Min_Query_Length).toBe(2);
		});

		it('defines a default result item size', async () => {
			expect(CpResultsPanel.Default_Result_Item_Length).toBe(7);
		});
	});

	describe('when initialized', () => {

		it('renders the view', async (done) => {

			const element = await setup();

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.cp-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.cp-label__text').textContent).toBe('search_menu_cpResultsPanel_label');
				expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(0);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
				done();
			}, CpResultsPanel.Debounce_Delay + 100);
		});

		it('renders the view based on a current query with "Default_Result_Item_Length" results', async (done) => {
			const results = Array.from({ length: CpResultsPanel.Default_Result_Item_Length }, (_, i) => new SearchResult(`cp${i}`, 'labelCp', 'labelCpFormated', SearchResultTypes.CADASTRAL_PARCEL));
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const getCpSearchResultProvider = spyOn(searchResultServiceMock, 'cadastralParcelsByTerm')
				.and.resolveTo(results);

			const element = await setup(initialState);

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.cp-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.cp-label__text').textContent).toBe('search_menu_cpResultsPanel_label');
				expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(CpResultsPanel.Default_Result_Item_Length);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');

				expect(getCpSearchResultProvider).toHaveBeenCalled();
				done();
			}, CpResultsPanel.Debounce_Delay + 100);
		});

		it('renders the view based on a current query with more than "maxShow" results', async (done) => {
			const results = Array.from({ length: CpResultsPanel.Default_Result_Item_Length + 1 }, (_, i) => new SearchResult(`cp${i}`, 'labelCp', 'labelCpFormated', SearchResultTypes.CADASTRAL_PARCEL));
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			const getCpSearchResultProvider = spyOn(searchResultServiceMock, 'cadastralParcelsByTerm')
				.and.resolveTo(results);

			const element = await setup(initialState);

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.cp-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.cp-label__text').textContent).toBe('search_menu_cpResultsPanel_label');
				expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(CpResultsPanel.Default_Result_Item_Length);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

				expect(getCpSearchResultProvider).toHaveBeenCalled();
				done();
			}, CpResultsPanel.Debounce_Delay + 100);
		});
	});

	describe('when query changes', () => {

		it('updates the view based on a current query', async (done) => {
			const query = 'foo';
			const getCpSearchResultProvider = spyOn(searchResultServiceMock, 'cadastralParcelsByTerm')
				.and.resolveTo([new SearchResult('cp', 'labelCp', 'labelCpFormated', SearchResultTypes.CADASTRAL_PARCEL)]);

			const element = await setup();
			setQuery(query);

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.cp-results-panel')).toBeTruthy();
				expect(element.shadowRoot.querySelector('.cp-label__text').textContent).toBe('search_menu_cpResultsPanel_label');
				expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(1);
				expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
				expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

				expect(getCpSearchResultProvider).toHaveBeenCalled();

				setQuery(null);

				setTimeout(() => {
					expect(element.shadowRoot.querySelector('.cp-results-panel')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.cp-label__text').textContent).toBe('search_menu_cpResultsPanel_label');
					expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(0);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
					expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
					done();

				}, CpResultsPanel.Debounce_Delay + 100);
			}, CpResultsPanel.Debounce_Delay + 100);
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
				const getCpSearchResultProvider = spyOn(searchResultServiceMock, 'cadastralParcelsByTerm')
					.and.resolveTo([new SearchResult('cp', 'labelCp', 'labelCpFormated', SearchResultTypes.CADASTRAL_PARCEL)]);

				const element = await setup(initialState);

				//wait for elements
				setTimeout(() => {
					expect(element.shadowRoot.querySelector('.cp-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(1);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeFalsy();

					const collapseButton = element.shadowRoot.querySelector('.cp-label__collapse');

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeFalsy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					expect(getCpSearchResultProvider).toHaveBeenCalled();
					done();

				}, CpResultsPanel.Debounce_Delay + 100);
			});
		});

		describe('items are NOT available', () => {

			it('disables the collapse button', async (done) => {
				const element = await setup();

				//wait for elements
				setTimeout(() => {

					expect(element.shadowRoot.querySelector('.cp-label__collapse')).toBeTruthy();
					expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(0);
					expect(element.shadowRoot.querySelector('.isdisabled')).toBeTruthy();

					const collapseButton = element.shadowRoot.querySelector('.cp-label__collapse');

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();

					collapseButton.click();

					expect(element.shadowRoot.querySelector('.iscollaps')).toBeFalsy();
					expect(element.shadowRoot.querySelector('.iconexpand')).toBeTruthy();
					done();

				}, CpResultsPanel.Debounce_Delay + 100);
			});
		});
	});

	describe('show-all button', () => {

		it('displays all results on click', async (done) => {
			const results = Array.from({ length: CpResultsPanel.Default_Result_Item_Length + 1 }, (_, i) => new SearchResult(`cp${i}`, 'labelCp', 'labelCpFormated', SearchResultTypes.CADASTRAL_PARCEL));
			const query = 'foo';
			const initialState = {
				search: {
					query: new EventLike(query)
				}
			};
			spyOn(searchResultServiceMock, 'cadastralParcelsByTerm')
				.and.resolveTo(results);

			const element = await setup(initialState);

			//wait for elements
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(CpResultsPanel.Default_Result_Item_Length);
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('block');

				element.shadowRoot.querySelector('.show-all').click();

				expect(element.shadowRoot.querySelector('.cp-items').childElementCount).toBe(CpResultsPanel.Default_Result_Item_Length + 1);
				expect(window.getComputedStyle(element.shadowRoot.querySelector('.show-all')).display).toBe('none');
				done();

			}, CpResultsPanel.Debounce_Delay + 100);
		});
	});
});
