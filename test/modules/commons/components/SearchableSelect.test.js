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
			expect(element.hasPointer).toBeFalse();
		});

		it('has class hidden on dropdown', async () => {
			const element = await TestUtils.renderAndLogLifecycle(SearchableSelect.tag);
			expect(element.shadowRoot.querySelector('.dropdown.hidden')).not.toBeNull();
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
			let htmlOptions = Array.from(element.shadowRoot.querySelectorAll('.dropdown > .option'));

			expect(htmlOptions).toHaveSize(0);

			element.options = ['foo', 'bar', 'baz'];
			htmlOptions = Array.from(element.shadowRoot.querySelectorAll('.dropdown > .option'));

			expect(htmlOptions).toHaveSize(3);
			expect(htmlOptions[0].innerText).toBe('foo');
			expect(htmlOptions[1].innerText).toBe('bar');
			expect(htmlOptions[2].innerText).toBe('baz');
		});
	});

	describe('when search input changed', () => {
		it('calls onChange callback', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const selectInput = element.shadowRoot.getElementById('search-input');
			element.onChange = jasmine.createSpy();

			selectInput.value = 'any';
			selectInput.dispatchEvent(new Event('input'));

			expect(element.onChange).toHaveBeenCalled();
		});

		it('fires change event', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const selectInput = element.shadowRoot.getElementById('search-input');
			const spy = jasmine.createSpy();
			element.addEventListener('change', spy);

			selectInput.value = 'any';
			selectInput.dispatchEvent(new Event('input'));

			expect(spy).toHaveBeenCalled();
		});
	});

	describe('when clicked', () => {
		it('it renders dropdown', async () => {
			const element = await TestUtils.renderAndLogLifecycle(SearchableSelect.tag);
			expect(element.shadowRoot.querySelector('.dropdown.hidden')).not.toBeNull();

			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			expect(element.shadowRoot.querySelector('.dropdown.hidden')).toBeNull();
		});

		it('on a rendered option in sets property "selected"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOption = element.shadowRoot.querySelector('.dropdown > .option:nth-child(2)');

			htmlOption.click();

			expect(element.selected).toBe('bar');
		});

		it('outside of input field it resets property "search"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			element.search = 'bar';

			document.querySelector('body').click();
			expect(element.search).toBe('');
		});

		it('outside of input field it keeps value of property "selected"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			element.selected = 'bar';

			document.querySelector('body').click();
			expect(element.selected).toBe('bar');
		});
	});

	describe('when pointerenter fired', () => {
		it('sets property hasPointer to true', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchable = element.shadowRoot.querySelector('.searchable-select');

			searchable.dispatchEvent(new Event('pointerenter'));
			expect(element.hasPointer).toBeTrue();
		});
	});

	describe('when pointerleave fired', () => {
		it('sets property hasPointer to false', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchable = element.shadowRoot.querySelector('.searchable-select');

			searchable.dispatchEvent(new Event('pointerenter'));
			searchable.dispatchEvent(new Event('pointerleave'));
			expect(element.hasPointer).toBeFalse();
		});
	});
});
