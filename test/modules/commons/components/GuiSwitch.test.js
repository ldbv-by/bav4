import { GuiSwitch } from '../../../../src/modules/commons/components/guiSwitch/GuiSwitch';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(GuiSwitch.tag, GuiSwitch);

describe('GuiSwitch', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);

			//model
			expect(element.disabled).toBeFalse();
			expect(element.checked).toBeFalse();
			expect(element.indeterminate).toBeFalse();
			expect(element.title).toBe('');
			expect(element.label).toBe('');
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);

			//view
			expect(element).toBeTruthy();

			const inputElement = element.shadowRoot.querySelector('input');
			expect(inputElement.disabled).toBeFalse();
			expect(inputElement.checked).toBeFalse();
			expect(inputElement.indeterminate).toBeFalse();
		});

		// it('automatically appends the "data-test-id" attribute', async () => {
		// 	expect((await TestUtils.render(GuiSwitch.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		// });
	});

	describe("when property 'disabled' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.disabled).toBeFalse();
			element.disabled = true;
			expect(input.disabled).toBeTrue();
			element.disabled = false;
			expect(input.disabled).toBeFalse();
		});
	});

	describe("when property 'indeterminate' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.indeterminate).toBeFalse();
			element.indeterminate = true;
			expect(input.indeterminate).toBeTrue();
			element.indeterminate = false;
			expect(input.indeterminate).toBeFalse();
		});
	});

	describe("when property 'checked' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.checked).toBeFalse();
			element.checked = true;
			expect(input.checked).toBeTrue();
			element.checked = false;
			expect(input.checked).toBeFalse();
		});
	});

	describe("when property 'title' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);

			expect(element.title).toBe('');
			element.title = 'foo';
			expect(element.title).toBe('foo');
		});
	});

	describe("when property 'label' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);

			expect(element.label).toBe('');
			element.label = 'foo';
			expect(element.label).toBe('foo');
		});
	});

	describe('event handling', () => {
		describe('on click', () => {
			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const spy = jasmine.createSpy();
				element.addEventListener('toggle', spy);

				element.shadowRoot.querySelector('#guiswitch').click();

				expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via property callback', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				element.onToggle = jasmine.createSpy();

				element.shadowRoot.querySelector('#guiswitch').click();

				expect(element.onToggle).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				spyOn(window, 'alert');
				const element = await TestUtils.render(GuiSwitch.tag);
				element.disabled = true;
				element.onToggle = jasmine.createSpy();

				element.shadowRoot.querySelector('#guiswitch').click();

				expect(element.onToggle).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});

		describe('"drag" events', () => {
			describe('pointerdown', () => {
				it('handles a "pointerdown" event', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);
					const guiswitch = element.shadowRoot.querySelector('#guiswitch');
					const spyPointerdown = spyOn(element, 'dragInit').and.callThrough();
					guiswitch.addEventListener('pointerdown', element.dragInit);

					const pointerdown = new Event('pointerdown');
					guiswitch.dispatchEvent(pointerdown);

					expect(spyPointerdown).toHaveBeenCalledOnceWith(jasmine.any(Event));

					const computedStyle = window.getComputedStyle(element.state.activethumb);
					const thumbTransitionDuration = computedStyle.getPropertyValue('--thumb-transition-duration');

					expect(thumbTransitionDuration).toBe('0s');
				});
			});
		});
	});
});
