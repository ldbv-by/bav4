/* eslint-disable no-undef */

import { Button } from '../../../../src/modules/commons/components/button/Button';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Button.tag, Button);


describe('Button', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {

		it('contains default values in the model', async () => {

			const element = await TestUtils.render(Button.tag);

			//model
			expect(element.disabled).toBeFalse();
			expect(element.label).toBe('label');
			expect(element.type).toBe('secondary');
		});

		it('renders the view', async () => {

			const element = await TestUtils.render(Button.tag);

			//view
			const button = element.shadowRoot.querySelector('button');
			expect(button.classList.contains('secondary')).toBeTrue();
			expect(button.classList.contains('disabled')).toBeFalse();
			expect(button.innerText).toBe('label');
		});
	});

	describe('when property\'disabled\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.classList.contains('disabled')).toBeFalse();

			element.disabled = true;

			expect(button.classList.contains('disabled')).toBeTrue();

			element.disabled = false;

			expect(button.classList.contains('disabled')).toBeFalse();
		});
	});

	describe('when property\'label\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.innerText).toBe('label');

			element.label = 'foo';

			expect(button.innerText).toBe('foo');
		});
	});

	describe('when property\'type\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.classList.contains('secondary')).toBeTrue();
			expect(button.classList.contains('primary')).toBeFalse();

			element.type = 'primary';

			expect(button.classList.contains('secondary')).toBeFalse();
			expect(button.classList.contains('primary')).toBeTrue();
		});
	});


	describe('when clicked', () => {

		it('calls the onClick callback via property binding', async () => {

			const element = await TestUtils.render(Button.tag);
			element.onClick = jasmine.createSpy();

			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(element.onClick).toHaveBeenCalled();
		});

		it('calls the onClick callback via attribute binding', async () => {

			spyOn(window, 'alert');
			const element = await TestUtils.render(Button.tag, { onClick: 'alert(\'called\')' });

			element.click();

			expect(window.alert).toHaveBeenCalledWith('called');
		});

		it('does nothing when disabled', async () => {
			spyOn(window, 'alert');
			const element = await TestUtils.render(Button.tag, { onClick: 'alert(\'called\')' });
			element.disabled = true;

			element.onClick = jasmine.createSpy();

			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(element.onClick).not.toHaveBeenCalled();
			expect(window.alert).not.toHaveBeenCalledWith('called');
		});

	});
});
