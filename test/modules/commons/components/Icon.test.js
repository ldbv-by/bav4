/* eslint-disable no-undef */

import { Icon } from '../../../../src/modules/commons/components/icon/Icon';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Icon.tag, Icon);


describe('Icon', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {

		it('contains default values in the model', async () => {

			const element = await TestUtils.render(Icon.tag);

			expect(element.disabled).toBeFalse();
			expect(element.icon).toBe('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktYXJyb3ctdXAtY2lyY2xlLWZpbGwiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PCEtLU1JVCBMaWNlbnNlLS0+CiAgPHBhdGggZD0iTTE2IDhBOCA4IDAgMSAwIDAgOGE4IDggMCAwIDAgMTYgMHptLTcuNSAzLjVhLjUuNSAwIDAgMS0xIDBWNS43MDdMNS4zNTQgNy44NTRhLjUuNSAwIDEgMS0uNzA4LS43MDhsMy0zYS41LjUgMCAwIDEgLjcwOCAwbDMgM2EuNS41IDAgMCAxLS43MDguNzA4TDguNSA1LjcwN1YxMS41eiIvPgo8L3N2Zz4=');
			expect(element.title).toBe('');
			expect(element.size).toBe(2);
			expect(element.color).toBe('var(--primary-color)');
			expect(element.color_hover).toBe('var(--primary-color)');
		});

		it('renders the view', async () => {

			const element = await TestUtils.render(Icon.tag);

			const anchor = element.shadowRoot.querySelector('.anchor');
			expect(anchor.title).toBe('');
			const span = element.shadowRoot.querySelector('.icon.icon-custom');
			expect(span.classList.contains('disabled')).toBeFalse();
			//stylesheets
			//iconClass
			expect(element.shadowRoot.styleSheets[1].cssRules.item(0).cssText).toContain('--size: 2em; background: var(--primary-color);');
			//anchorClassHover
			expect(element.shadowRoot.styleSheets[1].cssRules.item(1).cssText).toContain('background: var(--primary-color);');
			expect(element.shadowRoot.styleSheets[1].cssRules.item(1).cssText).toContain('transform: scale(1.1)');
			//customIconClass
			expect(element.shadowRoot.styleSheets[1].cssRules.item(2).cssText).toContain('data:image/svg+xml;base64,PHN2ZyB4');

		});
	});

	describe('when property\'icon\' changes', () => {

		it('updates the view', async () => {
			const fakeBase64Svg = 'data:image/svg+xml;base64,foo';
			const element = await TestUtils.render(Icon.tag);

			element.icon = fakeBase64Svg;

			expect(element.shadowRoot.styleSheets[1].cssRules.item(2).cssText).toContain(fakeBase64Svg);
		});
	});

	describe('when property\'size\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Icon.tag);
			const anchor = element.shadowRoot.querySelector('.anchor');

			element.title = 'foo';

			expect(anchor.title).toBe('foo');
		});
	});

	describe('when property\'color\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Icon.tag);

			element.color = 'var(--foo)';

			expect(element.shadowRoot.styleSheets[1].cssRules.item(0).cssText).toContain('background: var(--foo);');
		});
	});

	describe('when property\'color_hover\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Icon.tag);

			element.color_hover = 'var(--foo)';

			expect(element.shadowRoot.styleSheets[1].cssRules.item(1).cssText).toContain('background: var(--foo);');

			element.color_hover = null;

			expect(element.shadowRoot.styleSheets[1].cssRules.item(1).cssText).not.toContain('background: var(--primary-color);');
			expect(element.shadowRoot.styleSheets[1].cssRules.item(1).cssText).not.toContain('transform: scale(1.1)');
		});
	});

	describe('when property\'title\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Icon.tag);
			const span = element.shadowRoot.querySelector('.icon.icon-custom');

			element.disabled = true;

			expect(span.classList.contains('disabled')).toBeTrue();

			element.disabled = false;

			expect(span.classList.contains('disabled')).toBeFalse();
		});
	});

	describe('when property\'disabled\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Icon.tag);

			element.size = 5;

			expect(element.shadowRoot.styleSheets[1].cssRules.item(0).cssText).toContain('--size: 5em;');
		});
	});

	describe('when clicked', () => {

		it('calls the onClick callback via property binding', async () => {

			const element = await TestUtils.render(Icon.tag);
			element.onClick = jasmine.createSpy();
			const icon = element.shadowRoot.querySelector('button');

			icon.click();

			expect(element.onClick).toHaveBeenCalled();
		});

		it('calls the onClick callback via attribute binding', async () => {

			spyOn(window, 'alert');
			const element = await TestUtils.render(Icon.tag, { onClick: 'alert(\'called\')' });

			element.click();

			expect(window.alert).toHaveBeenCalledWith('called');
		});

		it('does nothing when disabled', async () => {
			spyOn(window, 'alert');
			const element = await TestUtils.render(Icon.tag, { onClick: 'alert(\'called\')' });
			element.disabled = true;
			element.onClick = jasmine.createSpy();
			const anchor = element.shadowRoot.querySelector('.anchor');

			anchor.click();

			expect(element.onClick).not.toHaveBeenCalled();
			expect(window.alert).not.toHaveBeenCalledWith('called');
		});

	});
});
