/* eslint-disable no-undef */

import { AutocompleteSearch } from '../../../../src/modules/commons/components/autocomplete/AutocompleteSearch';
import { SearchResult } from '../../../../src/modules/search/services/domain/searchResult';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(AutocompleteSearch.tag, AutocompleteSearch);


describe('Button', () => {

	const provider = async (term) => {
		if (term === 'some') {
			return [
				new SearchResult('id0', 'something0', '<b>something0</>', 'type', [0, 0]),
				new SearchResult('id1', 'something1', '<b>something1</>', 'type', [1, 1]),
				new SearchResult('id2', 'something2', '<b>something2</>', 'type', [2, 2])
			];
		}
		return [];
	};

	beforeEach(async () => {
		jasmine.clock().install();
		TestUtils.setupStoreAndDi({});
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
			element.provider = provider;
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

		it('shows no results when nothing retrieved from provider', async () => {

			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.provider = provider;
			const input = element.shadowRoot.querySelector('input');

			input.value = 'someTermWithNoResults';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			jasmine.clock().tick(300);


			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div').length).toBe(0);
			});
		});

		it('does not call the provider when search term is empty', async () => {

			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.provider = jasmine.createSpy();
			const input = element.shadowRoot.querySelector('input');

			input.value = ' ';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			jasmine.clock().tick(300);


			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.provider).not.toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div').length).toBe(0);
			});
		});

		it('does not call the provider when length of search term < 2', async () => {

			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.provider = jasmine.createSpy();
			const input = element.shadowRoot.querySelector('input');

			input.value = 'a';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			jasmine.clock().tick(300);


			//wait for elements
			window.requestAnimationFrame(() => {
				expect(element.provider).not.toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div').length).toBe(0);
			});
		});

		it('logs a warn statement no provider exists', async () => {

			const element = await TestUtils.render(AutocompleteSearch.tag);
			const input = element.shadowRoot.querySelector('input');
			const warnSpy = spyOn(console, 'warn');

			input.value = 'some';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			jasmine.clock().tick(300);


			//wait for elements
			window.requestAnimationFrame(() => {
				expect(warnSpy).toHaveBeenCalledWith('No SearchResult provider found.');
				expect(element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div').length).toBe(0);
			});
		});
	});

	describe('on user click', () => {

		it('calls the callback method', async () => {
			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.provider = provider;
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

	describe('provider cannot fullfill', () => {

		it('logs a warn statement', async () => {

			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.provider = () => Promise.reject('Something got wrong');
			const input = element.shadowRoot.querySelector('input');
			const warnSpy = spyOn(console, 'warn');

			input.value = 'some';
			input.dispatchEvent(new Event('input'));
			//AutocompleteSearch uses debounce from timer.js
			setTimeout(() => {
				expect(warnSpy).toHaveBeenCalledWith('Something got wrong');
				expect(element.shadowRoot.querySelector('#autocomplete-list').querySelectorAll('div').length).toBe(0);
			}, 300);
		});
	});

	describe('on keydown', () => {

		it('navigates through the list  and calls the callback method', async () => {
			const element = await TestUtils.render(AutocompleteSearch.tag);
			element.provider = provider;
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
