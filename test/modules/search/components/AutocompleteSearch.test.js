/* eslint-disable no-undef */

import { AutocompleteSearch } from '../../../../src/modules/search/components/AutocompleteSearch';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { SearchResult } from '../../../../src/modules/search/services/SearchResult';

window.customElements.define(AutocompleteSearch.tag, AutocompleteSearch);


describe('Button', () => {

	beforeEach(async () => {
		jasmine.clock().install();
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('SearchService', {
				getData: async (term) => {
					if (term === 'some') {
						return [
							new SearchResult('something0', '<b>something0</>', 'type', [0, 0]),
							new SearchResult('something1', '<b>something1</>', 'type', [1, 1]),
							new SearchResult('something2', '<b>something2</>', 'type', [2, 2]),
						];
					}
					return [];

				}
			});
	});

	afterEach(function () {
		jasmine.clock().uninstall();
	});


	describe('when initialized', () => {
		it('renders the view', async () => {

			const element = await TestUtils.render(AutocompleteSearch.tag);

			expect(element.shadowRoot.querySelector('.autocomplete')).toBeTruthy();
			const input = element.shadowRoot.querySelector('input');
			expect(input).toBeTruthy();
			expect(input.getAttribute('id')).toBe('autoComplete');
			expect(element.shadowRoot.querySelector('#autoCompleteautocomplete-list')).toBeNull();
		});
	});


	describe('on user input', () => {

		it('shows three results', async () => {

			const element = await TestUtils.render(AutocompleteSearch.tag);
			const input = element.shadowRoot.querySelector('input');

			input.value = 'some';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			jasmine.clock().tick(300);


			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div').length).toBe(3);
			});
		});
	});

	describe('on user click', () => {

		it('calls the callback method', async () => {
			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.onSelect = jasmine.createSpy();
			const input = element.shadowRoot.querySelector('input');

			input.value = 'some';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			jasmine.clock().tick(300);


			//wait for elements
			window.requestAnimationFrame(() => {
				element.shadowRoot.querySelector('#autocomplete-list').querySelector('div').click();
				expect(element.onSelect).toHaveBeenCalled();
			});
		});
	});

	describe('on keydown', () => {

		it('navigates through the list  and calls the callback method', async () => {
			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.onSelect = jasmine.createSpy();
			const input = element.shadowRoot.querySelector('input');

			input.value = 'some';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			jasmine.clock().tick(300);


			//wait for elements
			window.requestAnimationFrame(() => {
				const arrowDownEvent = new KeyboardEvent('keydown', {
					keyCode: 40
				});
				const arrowUpEvent = new KeyboardEvent('keydown', {
					keyCode: 38
				});
				const enterEvent = new KeyboardEvent('keydown', {
					keyCode: 13
				});
				const firstListItemElement = element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div')[0];
				const secondListItemElement = element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div')[1];

				expect(firstListItemElement.classList.contains('autocomplete-active')).toBeFalse();
				expect(secondListItemElement.classList.contains('autocomplete-active')).toBeFalse();

				//twice
				input.dispatchEvent(arrowDownEvent);
				input.dispatchEvent(arrowDownEvent);

				expect(firstListItemElement.classList.contains('autocomplete-active')).toBeFalse();
				expect(secondListItemElement.classList.contains('autocomplete-active')).toBeTrue();

				input.dispatchEvent(arrowUpEvent);
				expect(firstListItemElement.classList.contains('autocomplete-active')).toBeTrue();
				expect(secondListItemElement.classList.contains('autocomplete-active')).toBeFalse();

				input.dispatchEvent(enterEvent);
				expect(element.onSelect).toHaveBeenCalled();
			});
		});
	});
});