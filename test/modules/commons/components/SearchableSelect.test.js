/* eslint-disable no-undef */

import { SearchableSelect } from '../../../../src/modules/commons/components/searchableSelect/SearchableSelect.js';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(SearchableSelect.tag, SearchableSelect);

describe('SearchableSelect', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			expect(element.getModel()).toEqual({ placeholder: 'Search...', selected: null, search: '', options: [] });
		});

		it('has properties with default values from the model', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);

			//properties from model
			expect(element.placeholder).toBe('Search...');
			expect(element.selected).toBeNull();
			expect(element.search).toBe('');
			expect(element.options).toHaveSize(0);
		});
	});

	describe('when property "placeholder" changes', () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchInput = element.shadowRoot.getElementById('search-input');
			expect(searchInput.placeholder).toBe('Search...');
			element.placeholder = 'foo';
			expect(searchInput.placeholder).toBe('foo');
		});
	});

	describe('when property "selected" changes', () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchInput = element.shadowRoot.getElementById('search-input');

			expect(searchInput.value).toBe('');
			element.selected = 'foo';
			expect(element.selected).toBe('foo');
			expect(searchInput.value).toBe('foo');
		});
	});

	describe('when property "search" changes', () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchInput = element.shadowRoot.getElementById('search-input');

			expect(searchInput.value).toBe('');

			element.search = 'foo';
			expect(element.selected).toBeNull();
			expect(element.search).toBe('foo');
			expect(searchInput.value).toBe('foo');
		});
	});

	describe('when property "options" changes', () => {
		it('updates the view', async () => {
			const element = await TestUtils.renderAndLogLifecycle(SearchableSelect.tag);
			let htmlOptions = Array.from(element.shadowRoot.querySelectorAll('.select-items-container > .option'));

			expect(htmlOptions).toHaveSize(0);

			element.options = ['foo', 'bar', 'baz'];
			htmlOptions = Array.from(element.shadowRoot.querySelectorAll('.select-items-container > .option'));

			expect(htmlOptions).toHaveSize(3);
			expect(htmlOptions[0].innerText).toBe('foo');
			expect(htmlOptions[1].innerText).toBe('bar');
			expect(htmlOptions[2].innerText).toBe('baz');
		});
	});

	describe('events and callbacks', () => {
		it('calls the onChange callback via property binding', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const spy = jasmine.createSpy();
			element.addEventListener('change', spy);
			const selectInput = element.shadowRoot.getElementById('search-input');
			selectInput.value = 'any input';
			selectInput.dispatchEvent(new Event('input'));
			expect(spy).toHaveBeenCalled();
		});

		it('sets property "selected" when a rendered option was clicked', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOption = element.shadowRoot.querySelector('.select-items-container > .option:nth-child(2)');

			htmlOption.click();

			expect(element.selected).toBe('bar');
		});

		/*
        it('resets property "selected" when select was cancelled', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			
			htmlOption.click();

			expect(element.selected).toBe('bar');
		}); */
	});
});
