/* eslint-disable no-undef */

import { Icon } from '../../../../src/modules/commons/components/icon/Icon';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Icon.tag, Icon);


describe('Icon', () => {

	const svg = 'data:image/svg+xml,%3csvg width=\'1em\' height=\'1em\' viewBox=\'0 0 16 16\' class=\'bi bi-list\' fill=\'currentColor\' xmlns=\'http://www.w3.org/2000/svg\'%3e %3cpath fill-rule=\'evenodd\' d=\'M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z\'/%3e %3c/svg%3e';

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized with default values', () => {
		it('has correct properties', async () => {

			const element = await TestUtils.render(Icon.tag);

			expect(element.icon).toBeNull;
			expect(element.title).toBe('');
			expect(element.disabled).toBeFalse();
			expect(element.size).toBe(25);
			expect(element.color).toBe('var(--primary-color)');

		});

		it('renders the view', async () => {

			const element = await TestUtils.render(Icon.tag);
			const anchor = element.shadowRoot.querySelector('.anchor');
			expect(anchor).toBeTruthy();
		});
	});

	describe('when initialized with custom values', () => {
		it('has correct properties', async () => {

			const element = await TestUtils.render(Icon.tag, { icon: svg, title: 'someTitle', disabled: false, size: 40, color: 'white' });

			expect(element.icon).toBe(svg);
			expect(element.title).toBe('someTitle');
			expect(element.disabled).toBeFalse();
			expect(element.size).toBe(40);
			expect(element.color).toBe('white');

		});

		it('renders the view', async () => {

			const element = await TestUtils.render(Icon.tag);
			const h = element.shadowRoot.querySelector('.anchor');
			expect(h).toBeTruthy();
		});
	});

	describe('\'disabled\' value', () => {

		it('renders the view disabled', async () => {

			const element = await TestUtils.render(Icon.tag, { disabled: true });

			expect(element.disabled).toBeTrue();
			const icon = element.shadowRoot.querySelector('.icon');
			expect(icon).toBeTruthy();
			expect(icon.classList.contains('disabled')).toBeTrue();
		});

		it('re-renders the view when property \'disabled\' is changed', async () => {

			const element = await TestUtils.render(Icon.tag);
			const icon = element.shadowRoot.querySelector('.icon');

			expect(icon.classList.contains('disabled')).toBeFalse();

			element.disabled = true;

			expect(icon.classList.contains('disabled')).toBeTrue();
		});

		it('re-renders the view when attribute \'disabled\' is changed', async () => {

			const element = await TestUtils.render(Icon.tag);
			const icon = element.shadowRoot.querySelector('.icon');

			expect(icon.classList.contains('disabled')).toBeFalse();

			element.setAttribute('disabled', true);

			expect(icon.classList.contains('disabled')).toBeTrue();
		});
	});



	describe('when clicked', () => {

		it('calls the onClick Callback', async () => {

			const element = await TestUtils.render(Icon.tag);
			element.onClick = jasmine.createSpy();

			const anchor = element.shadowRoot.querySelector('.anchor');
			anchor.click();

			expect(element.onClick).toHaveBeenCalled();
		});

		it('does nothing when disabled', async () => {
			const element = await TestUtils.render(Icon.tag, { disabled: true });

			element.onClick = jasmine.createSpy();

			const anchor = element.shadowRoot.querySelector('.anchor');
			anchor.click();

			expect(element.onClick).not.toHaveBeenCalled();
		});

	});


});
