/* eslint-disable no-undef */

import { SearchableSelect } from '../../../../src/modules/commons/components/searchableSelect/SearchableSelect.js';
import { TestUtils } from '../../../test-utils.js';

window.customElements.define(SearchableSelect.tag, SearchableSelect);

describe('SearchableSelect', () => {
	const keyCodes = { ArrowDown: 'ArrowDown', ArrowUp: 'ArrowUp', Enter: 'Enter', Escape: 'Escape' };
	const getKeyEvent = (key) => {
		return new KeyboardEvent('keyup', { key: key });
	};

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			expect(element.getModel()).toEqual({
				placeholder: 'Search...',
				maxEntries: 10,
				selected: null,
				search: '',
				options: [],
				filteredOptions: [],
				showCaret: true
			});
		});

		it('has properties with default values from the model', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);

			//properties from model
			expect(element.placeholder).toBe('Search...');
			expect(element.selected).toBeNull();
			expect(element.maxEntries).toBe(10);
			expect(element.search).toBe('');
			expect(element.options).toHaveSize(0);
			expect(element.hasPointer).toBeFalse();
		});

		it('ensures property options is an empty array when set to undefined or null', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = null;
			expect(element.options).toHaveSize(0);
		});
	});

	describe('when member methods called', () => {
		it('resolves choosing on empty property "options"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			expect(() => element._hoverNextOption()).not.toThrow();
		});

		it('returns an empty string when search is null', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			expect(element._updateOptionsFiltering({ ...element.getModel(), search: null })).toEqual(jasmine.objectContaining({ search: '' }));
		});

		it('foldout the dropdown upwards when not enough space in viewport', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const dropdown = element.shadowRoot.querySelector('.dropdown');

			dropdown.style.height = '300px';
			element._showDropdown(300);

			expect(element.shadowRoot.querySelector('.searchable-select').classList).toContain('fold-up');
		});

		it('foldout the dropdown downwards when enough space in viewport', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const dropdown = element.shadowRoot.querySelector('.dropdown');

			dropdown.style.height = '300px';
			element._showDropdown(350);

			expect(element.shadowRoot.querySelector('.searchable-select').classList).not.toContain('fold-up');
		});

		it('removes ".hovered" class when dropdown opens', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const dropdown = element.shadowRoot.querySelector('.dropdown');

			const htmlOptions = element.shadowRoot.querySelectorAll('.option');
			htmlOptions[0].classList.add('hovered');

			element._showDropdown();
			expect(htmlOptions[0].classList.contains('hovered')).toBeFalse();
		});
	});

	describe('when disconnected', () => {
		it('removes all event listeners', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const removeEventListenerSpy = spyOn(document, 'removeEventListener').and.callThrough();

			element.onDisconnect();

			expect(removeEventListenerSpy).toHaveBeenCalledWith('click', jasmine.anything());
			expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', jasmine.anything());
			expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', jasmine.anything());
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

	describe('when property "showCaret" changes', () => {
		it('removes caret from view', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			expect(element.shadowRoot.getElementById('search-input-toggler')).not.toBeNull();

			element.showCaret = false;
			expect(element.shadowRoot.getElementById('search-input-toggler')).toBeNull();
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

		it('calls onSelect callback', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const spy = jasmine.createSpy();
			element.onSelect = spy;

			element.selected = 'foo';

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ selected: 'foo' }));
		});

		it('fires select event', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const spy = jasmine.createSpy();
			element.addEventListener('select', spy);

			element.selected = 'foo';
			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { selected: 'foo' } }));
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

		it('calls onChange callback', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'boo', 'bar'];
			const spy = jasmine.createSpy();
			element.onChange = spy;

			element.search = 'oo';

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ filteredOptions: ['foo', 'boo'] }));
		});

		it('fires change event', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'boo', 'bar'];
			const spy = jasmine.createSpy();
			element.addEventListener('change', spy);

			element.search = 'b';

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { filteredOptions: ['boo', 'bar'] } }));
		});
	});

	describe('when view renders', () => {
		it('has class hidden on dropdown', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);

			expect(element.shadowRoot.querySelector('.dropdown.hidden')).toBeDefined();
			expect(element.shadowRoot.querySelector('.dropdown.visible')).toBeNull();
		});

		it('No option contains the class ".hovered"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];

			expect(element.shadowRoot.querySelectorAll('.dropdown > .option')).toHaveSize(3);
			expect(element.shadowRoot.querySelectorAll('.dropdown > .option.hovered')).toHaveSize(0);
		});
	});

	describe('when property "maxEntries" changes', () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz', 'fo', 'ba'];

			let htmlOptions = element.shadowRoot.querySelectorAll('.dropdown > .option > span');

			expect(htmlOptions).toHaveSize(5);

			element.maxEntries = 4;
			htmlOptions = element.shadowRoot.querySelectorAll('.dropdown > .option > span');
			expect(htmlOptions).toHaveSize(4);
		});
	});

	describe('when property "options" changes', () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			let htmlOptions = element.shadowRoot.querySelectorAll('.dropdown > .option > span');

			expect(htmlOptions).toHaveSize(0);

			element.options = ['foo', 'bar', 'baz'];
			htmlOptions = element.shadowRoot.querySelectorAll('.dropdown > .option > span');

			expect(htmlOptions).toHaveSize(3);

			expect(htmlOptions[0].innerText).toBe('foo');
			expect(htmlOptions[1].innerText).toBe('bar');
			expect(htmlOptions[2].innerText).toBe('baz');
		});
	});

	describe('when search input changed', () => {
		it('calls onChange callback', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchInput = element.shadowRoot.getElementById('search-input');
			const spy = jasmine.createSpy();
			element.onChange = spy;

			searchInput.value = 'any';
			searchInput.dispatchEvent(new Event('input'));

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ filteredOptions: [] }));
		});

		it('fires change event', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchInput = element.shadowRoot.getElementById('search-input');
			const spy = jasmine.createSpy();
			element.addEventListener('change', spy);

			searchInput.value = 'any';
			searchInput.dispatchEvent(new Event('input'));

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { filteredOptions: [] } }));
		});
	});

	describe('when clicked', () => {
		it('renders the dropdown', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchable = element.shadowRoot.querySelector('.searchable-select');

			searchable.dispatchEvent(new MouseEvent('click'));

			expect(element.shadowRoot.querySelector('.dropdown.hidden')).toBeNull();
			expect(element.shadowRoot.querySelector('.dropdown.visible')).toBeDefined();
		});

		it('closes the visible dropdown if click target was "#search-input-toggler"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const toggler = element.shadowRoot.querySelector('#search-input-toggler');
			const dropdown = element.shadowRoot.querySelector('.dropdown');

			dropdown.classList.add('visible');
			dropdown.classList.remove('hidden');

			toggler.dispatchEvent(new MouseEvent('click'));

			expect(element.shadowRoot.querySelector('.dropdown.hidden')).toBeDefined();
			expect(element.shadowRoot.querySelector('.dropdown.visible')).toBeNull();
		});

		it('opens the hidden dropdown if click target was "#search-input-toggler"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const toggler = element.shadowRoot.querySelector('#search-input-toggler');

			toggler.dispatchEvent(new MouseEvent('click'));

			expect(element.shadowRoot.querySelector('.dropdown.hidden')).toBeNull();
			expect(element.shadowRoot.querySelector('.dropdown.visible')).toBeDefined();
		});

		it('does not hide dropdown when property "hasPointer" is true', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			const searchable = element.shadowRoot.querySelector('.searchable-select');

			// marks hasPointer to true
			searchable.dispatchEvent(new Event('pointerenter'));
			// open dropdown
			searchable.dispatchEvent(new MouseEvent('click'));
			// try to cancel action
			document.querySelector('body').click();

			expect(element.shadowRoot.querySelector('.dropdown.hidden')).toBeNull();
		});

		it('sets on a rendered option the property "selected"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOption = element.shadowRoot.querySelector('.dropdown > .option:nth-child(2)');

			htmlOption.click();

			expect(element.selected).toBe('bar');
		});

		it('resets the property "search" outside of an input field', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			element.search = 'bar';

			document.querySelector('body').click();
			expect(element.search).toBe('');
		});

		it('keeps the value of property "selected" outside of an input field', async () => {
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

		it('adds the class ".hovered" to the pointed option', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo'];
			const htmlOption = element.shadowRoot.querySelector('.option');

			htmlOption.dispatchEvent(new Event('pointerenter'));
			expect(htmlOption.classList).toContain('hovered');
		});

		it('adds the class ".hovered" to the pointed option and removes it from other options', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOptions = element.shadowRoot.querySelectorAll('.option');

			htmlOptions[0].classList.add('hovered');
			htmlOptions[1].classList.add('hovered');
			htmlOptions[2].dispatchEvent(new Event('pointerenter'));

			expect(htmlOptions[0].classList).not.toContain('hovered');
			expect(htmlOptions[1].classList).not.toContain('hovered');
			expect(htmlOptions[2].classList).toContain('hovered');
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

		it('removes the class ".hovered" from the option being left', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo'];
			const htmlOption = element.shadowRoot.querySelector('.option');

			htmlOption.classList.add('hovered');
			htmlOption.dispatchEvent(new Event('pointerleave'));

			expect(htmlOption.classList).not.toContain('hovered');
		});
	});

	describe('when Esc keypress fired', () => {
		it('closes the dropdown', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			document.dispatchEvent(getKeyEvent(keyCodes.Escape));

			expect(element.shadowRoot.querySelector('.dropdown.hidden')).not.toBeNull();
		});
	});

	describe('when Enter keypress fired', () => {
		it('selects option with class ".hovered"', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo'];
			const htmlOption = element.shadowRoot.querySelector('.option:nth-child(1)');

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			htmlOption.classList.add('hovered');
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			expect(element.shadowRoot.querySelector('.dropdown.hidden')).not.toBeNull();
			expect(htmlOption.querySelector('span').innerText).toBe('foo');
		});

		it('does not update property selected when class ".hovered" is missing', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar'];
			element.selected = 'bar';

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			expect(element.selected).toBe('bar');
		});

		it('keeps value of property selected when search is incomplete', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar'];
			element.selected = 'bar';
			element.search = 'ba';

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			expect(element.selected).toBe('bar');
		});

		it('updates value of property selected when free-text is allowed', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar'];
			element.allowFreeText = true;
			element.selected = 'bar';
			element.search = 'ba';

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			document.dispatchEvent(getKeyEvent(keyCodes.Enter));

			expect(element.selected).toBe('ba');
		});
	});

	describe('when ArrowUp keypress fired', () => {
		it('hovers previous option', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar'];
			const htmlOptions = element.shadowRoot.querySelectorAll('.option');

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			htmlOptions[1].classList.add('hovered');
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

			expect(htmlOptions[0].classList).toContain('hovered');
			expect(htmlOptions[1].classList).not.toContain('hovered');
		});

		it('hovers last option in list when first option is hovered', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOptions = element.shadowRoot.querySelectorAll('.option');

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			htmlOptions[0].classList.add('hovered');
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

			expect(htmlOptions[0].classList).not.toContain('hovered');
			expect(htmlOptions[1].classList).not.toContain('hovered');
			expect(htmlOptions[2].classList).toContain('hovered');
		});

		it('hovers first option in list when nothing is hovered', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOptions = element.shadowRoot.querySelectorAll('.option');

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowUp));

			expect(htmlOptions[0].classList).toContain('hovered');
		});
	});

	describe('when ArrowDown keypress fired', () => {
		it('hovers next option', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar'];
			const htmlOptions = element.shadowRoot.querySelectorAll('.option');

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			htmlOptions[0].classList.add('hovered');
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

			expect(htmlOptions[0].classList).not.toContain('hovered');
			expect(htmlOptions[1].classList).toContain('hovered');
		});

		it('hovers first option in list when last option is hovered', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOptions = element.shadowRoot.querySelectorAll('.option');

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			htmlOptions[2].classList.add('hovered');
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

			expect(htmlOptions[0].classList).toContain('hovered');
			expect(htmlOptions[1].classList).not.toContain('hovered');
			expect(htmlOptions[2].classList).not.toContain('hovered');
		});

		it('hovers first option in list when nothing is hovered', async () => {
			const element = await TestUtils.render(SearchableSelect.tag);
			element.options = ['foo', 'bar', 'baz'];
			const htmlOptions = element.shadowRoot.querySelectorAll('.option');

			// open dropdown to enable key events
			const searchable = element.shadowRoot.querySelector('.searchable-select');
			searchable.dispatchEvent(new MouseEvent('click'));
			document.dispatchEvent(getKeyEvent(keyCodes.ArrowDown));

			expect(htmlOptions[0].classList).toContain('hovered');
		});
	});
});
