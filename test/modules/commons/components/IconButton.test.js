/* eslint-disable no-undef */

import { IconButton } from '../../../../src/modules/commons/components/iconbutton/IconButton';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(IconButton.tag, IconButton);


describe('IconButton', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});


	describe('when initialized with title attribute', () => {
		it('renders the view', async () => {

			const element = await TestUtils.render(IconButton.tag, { title: 'some' });

			expect(element.disabled).toBeFalse();

			const button = element.shadowRoot.querySelector('button');
			expect(button).toBeTruthy();
			expect(button.classList.contains('button')).toBeTrue();
			expect(button.title).toBe('some');
		});

		it('add no title when attribute is missing', async () => {

			const element = await TestUtils.render(IconButton.tag);
			const button = element.shadowRoot.querySelector('button');
			expect(button.title).toBe('');
		});
	});

	describe('when initialized with \'disabled\' attribute', () => {

		it('renders the view enabled', async () => {

			const element = await TestUtils.render(IconButton.tag, { disabled: false });

			expect(element.disabled).toBeFalse;
			const button = element.shadowRoot.querySelector('button');
			expect(button).toBeTruthy();
			expect(button.classList.contains('disabled')).toBeFalse();
		});

		it('renders the view disabled', async () => {

			const element = await TestUtils.render(IconButton.tag, { disabled: true });
	
			expect(element.disabled).toBeTrue();
			const button = element.shadowRoot.querySelector('button');
			expect(button).toBeTruthy();
			expect(button.classList.contains('disabled')).toBeTrue();
		});
	
		it('re-renders the view when property \'disabled\' is changed', async () => {
	
			const element = await TestUtils.render(IconButton.tag);
			const button = element.shadowRoot.querySelector('button');
	
			expect(button.classList.contains('disabled')).toBeFalse();
	
			element.disabled = true;
	
			expect(button.classList.contains('disabled')).toBeTrue();
		});
	});

	describe('when clicked', () => {

		it('call the onClick Callback', async () => {

			const element = await TestUtils.render(IconButton.tag);
			element.onClick = jasmine.createSpy();

			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(element.onClick).toHaveBeenCalled();
		});

		it('does nothing when disabled', async () => {
			const element = await TestUtils.render(IconButton.tag, { disabled: true });

			element.onClick = jasmine.createSpy();

			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(element.onClick).not.toHaveBeenCalled();
		});

	});

	describe('when slot is filled', () => {

		it('renders the slot', async () => {
			const element = await TestUtils.render(IconButton.tag, {}, '<span>some slot content</span>');

		
			expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
			expect(element.shadowRoot.querySelector('slot').assignedNodes().length).toBe(1);
			expect(element.shadowRoot.querySelector('slot').assignedNodes()[0].innerHTML).toEqual('some slot content');
			expect(element.shadowRoot.querySelector('slot').assignedNodes()[0].outerHTML).toEqual('<span>some slot content</span>');
		});

	});


});
