import { $injector } from '../../../../src/injection';
import { IconSelect } from '../../../../src/modules/iconSelect/components/IconSelect';
import { IconResult } from '../../../../src/services/IconService';
import { TestUtils } from '../../../test-utils';

window.customElements.define(IconSelect.tag, IconSelect);

describe('IconSelect', () => {

	const iconServiceMock = { default: () => new IconResult('marker', 'foo'), all: () => [] };
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('IconService', iconServiceMock);
	});
	describe('when initialized', () => {

		it('contains default values in the model', async () => {

			const element = await TestUtils.render(IconSelect.tag);

			//model
			expect(element.title).toBe('');
			expect(element.icons).toEqual([]);
			expect(element.value).toBeNull();
			expect(element.color).toBeNull();
		});

		it('renders the view', async () => {

			const element = await TestUtils.render(IconSelect.tag);
			element.title = 'foo';

			//view
			expect(element.shadowRoot.querySelector('.catalog_header')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.ba_catalog_container.iscollapsed')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-icon').title).toBe('foo');
			expect(element.shadowRoot.querySelector('ba-icon').disabled).toBeTrue();
			expect(element.shadowRoot.querySelector('.ba_catalog_container').childElementCount).toBe(0);

		});
	});

	describe('when property\'title\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(IconSelect.tag);
			const iconButton = element.shadowRoot.querySelector('ba-icon');

			expect(iconButton.title).toBe('');

			element.title = 'foo';

			expect(iconButton.title).toBe('foo');

			element.title = 'bar';

			expect(iconButton.title).toBe('bar');
		});
	});

	describe('when property\'color\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(IconSelect.tag);
			const iconButton = element.shadowRoot.querySelector('ba-icon');

			expect(iconButton.color).toBe(null);

			element.color = '#00ff00';

			expect(iconButton.color).toBe('#00ff00');

			element.color = '#ff0000';

			expect(iconButton.color).toBe('#ff0000');
		});
	});

	describe('when property\'value\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(IconSelect.tag);
			const iconButton = element.shadowRoot.querySelector('ba-icon');

			expect(iconButton.icon).not.toBe('data:image/svg+xml;base64,foo');

			element.value = 'data:image/svg+xml;base64,foo';

			expect(iconButton.icon).toBe('data:image/svg+xml;base64,foo');
		});
	});

	describe('when property\'icons\' changes', () => {

		it('updates the view', async (done) => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));
			const element = await TestUtils.render(IconSelect.tag);

			setTimeout(() => {
				expect(element.icons.length).toBe(2);
				done();
			});
		});
	});

	describe('when icon-button is clicked', () => {
		it('expands and collapse the container', async () => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));
			const element = await TestUtils.render(IconSelect.tag);

			const iconButton = element.shadowRoot.querySelector('ba-icon');
			const iconContainer = element.shadowRoot.querySelector('.ba_catalog_container');

			expect(iconContainer.classList.contains('iscollapsed')).toBeTrue();
			iconButton.click();
			expect(iconContainer.classList.contains('iscollapsed')).toBeFalse();
			iconButton.click();
			expect(iconContainer.classList.contains('iscollapsed')).toBeTrue();
		});
	});


	describe('when icon is selected (event handling) ', () => {
		it('calls the onSelect callback via property callback', async () => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));

			const element = await TestUtils.render(IconSelect.tag);
			const selectSpy = spyOn(element, 'onSelect');
			const iconButton = element.shadowRoot.querySelector('ba-icon');
			iconButton.click();

			const selectableIcon = element.shadowRoot.querySelector('#svg_foo');

			selectableIcon.click();

			expect(selectSpy).toHaveBeenCalledWith(jasmine.any(IconResult));
		});

		it('calls the onSelect callback via attribute callback', async () => {
			spyOn(iconServiceMock, 'all').and.returnValue(Promise.resolve([new IconResult('foo', '42'),
				new IconResult('bar', '42')]));

			spyOn(window, 'alert');
			const element = await TestUtils.render(IconSelect.tag, { onSelect: 'alert(\'called\')' });
			const iconButton = element.shadowRoot.querySelector('ba-icon');
			iconButton.click();

			const selectableIcon = element.shadowRoot.querySelector('#svg_foo');

			selectableIcon.click();

			expect(window.alert).toHaveBeenCalledWith('called');
		});
	});
});
