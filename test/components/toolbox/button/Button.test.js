/* eslint-disable no-undef */

import { Button } from '../../../../src/components/toolbox/button/Button';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Button.tag, Button);


describe('Button', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});


	describe('when initialized with label attibute', () => {
		it('renders the view', async () => {

			const element = await TestUtils.render(Button.tag, { label: 'some' });

			expect(element.disabled).toBeFalse();

			const button = element.shadowRoot.querySelector('button');
			expect(button).toBeTruthy();
			expect(button.classList.contains('button')).toBeTrue();
			expect(button.innerText).toBe('some');
		});

		it('add the a default label when attibute is missing', async () => {

			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');
			expect(button.innerText).toBe('label');
		});
	});

	describe('when initialized with \'disabled\' attribute', () => {

		it('renders the view enabled', async () => {

			const element = await TestUtils.render(Button.tag, { disabled: false });

			expect(element.disabled).toBeFalse;
			const button = element.shadowRoot.querySelector('button');
			expect(button).toBeTruthy();
			expect(button.classList.contains('disabled')).toBeFalse();
		});

		it('renders the view disabled', async () => {

			const element = await TestUtils.render(Button.tag, { disabled: true });

			expect(element.disabled).toBeTrue();
			const button = element.shadowRoot.querySelector('button');
			expect(button).toBeTruthy();
			expect(button.classList.contains('disabled')).toBeTrue();
		});

		it('re-renders the view when property \'disabled\' is changed', async () => {

			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.classList.contains('disabled')).toBeFalse();

			element.disabled = true;

			expect(button.classList.contains('disabled')).toBeTrue();
		});

		it('re-renders the view when attribute \'disabled\' changed', async () => {

			const element = await TestUtils.render(Button.tag, { disabled: 'false' });
			const button = element.shadowRoot.querySelector('button');

			expect(button.classList.contains('disabled')).toBeFalse();

			element.setAttribute('disabled', 'true');

			expect(button.classList.contains('disabled')).toBeTrue();
		});
	});
	describe('when initialized with \'type\' attribute', () => {

		it('renders the view with default css classes', async () => {

			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button).toBeTruthy();
			expect(button.className).toBe('button secondary');
		});

		it('renders the view with secondary css classes', async () => {

			const element = await TestUtils.render(Button.tag, { type: 'secondary' });
			const button = element.shadowRoot.querySelector('button');

			expect(button).toBeTruthy();
			expect(button.className).toBe('button secondary');
		});

		it('renders the view with primary css classes', async () => {

			const element = await TestUtils.render(Button.tag, { type: 'primary' });
			const button = element.shadowRoot.querySelector('button');

			expect(button).toBeTruthy();
			expect(button.className).toBe('button primary');
		});
	});

	describe('when clicked', () => {

		it('call the onClick Callback', async () => {

			const element = await TestUtils.render(Button.tag);
			element.onClick = jasmine.createSpy();

			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(element.onClick).toHaveBeenCalled();
		});

		it('does nothing when disabled', async () => {
			const element = await TestUtils.render(Button.tag, { disabled: true });

			element.onClick = jasmine.createSpy();

			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(element.onClick).not.toHaveBeenCalled();
		});

	});
});
