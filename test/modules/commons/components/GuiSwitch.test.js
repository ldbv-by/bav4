import { GuiSwitch } from '../../../../src/modules/commons/components/guiSwitch/GuiSwitch';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
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
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(GuiSwitch.tag);

			//view
			expect(element).toBeTruthy();

			const inputElement = element.shadowRoot.querySelector('input');
			expect(inputElement.disabled).toBeFalse();
			expect(inputElement.checked).toBeFalse();
			expect(inputElement.indeterminate).toBeFalse();

			const slotElements = element.shadowRoot.querySelectorAll('slot');
			expect(slotElements).toBeTruthy();
			expect(slotElements.length).toBe(3);
			expect(slotElements[0].assignedNodes().length).toBe(0);
			expect(slotElements[0].assignedNodes().length).toBe(0);
			expect(slotElements[0].assignedNodes().length).toBe(0);
		});

		it('automatically appends the "data-test-id" attribute', async () => {
			expect((await TestUtils.render(GuiSwitch.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		});
	});

	describe('properties', () => {
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
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				element.shadowRoot.querySelector('#guiswitch').click();

				expect(onToggleSpy).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				element.disabled = true;
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				element.shadowRoot.querySelector('#guiswitch').click();

				expect(onToggleSpy).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});

		describe('"drag" events', () => {
			describe('when dragging starts', () => {
				it('sets the "state.activethumb" property to the checkbox element', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);

					const guiswitch = element.shadowRoot.querySelector('#guiswitch');
					const pointerdown = new Event('pointerdown');
					guiswitch.dispatchEvent(pointerdown);

					expect(element._state.activethumb.type).toBe('checkbox');
				});

				it('sets the "--thumb-transition-duration" CSS variable to "0s"', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);

					const guiswitch = element.shadowRoot.querySelector('#guiswitch');
					const pointerdown = new Event('pointerdown');
					guiswitch.dispatchEvent(pointerdown);

					const computedStyle = window.getComputedStyle(element._state.activethumb);
					const thumbTransitionDuration = computedStyle.getPropertyValue('--thumb-transition-duration');
					expect(thumbTransitionDuration).toBe('0s');
				});

				it('calls _dragInit ', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);
					const dragInitSpy = spyOn(element, '_dragInit').and.callThrough();

					const guiswitch = element.shadowRoot.querySelector('#guiswitch');
					const pointerdown = new Event('pointerdown');
					guiswitch.dispatchEvent(pointerdown);

					expect(dragInitSpy).toHaveBeenCalledTimes(1);
				});

				it('does nothing when disabled', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);
					element.disabled = true;
					const dragInitSpy = spyOn(element, '_dragInit').and.callThrough();

					const guiswitch = element.shadowRoot.querySelector('#guiswitch');
					const pointerdown = new Event('pointerdown');
					guiswitch.dispatchEvent(pointerdown);

					expect(dragInitSpy).toHaveBeenCalled();
					expect(element._state.activethumb).toBe(null);
				});
			});
		});

		describe('all pointer events at once', () => {
			it('handles all pointer - events and calls the onToggle callback', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();
				const spyPointerdown = spyOn(element, '_dragInit').and.callThrough();

				const guiswitch = element.shadowRoot.querySelector('#guiswitch');
				const pointerdown = new Event('pointerdown');
				guiswitch.dispatchEvent(pointerdown);

				const computedStyle = window.getComputedStyle(element._state.activethumb);
				const thumbTransitionDuration = computedStyle.getPropertyValue('--thumb-transition-duration');
				expect(thumbTransitionDuration).toBe('0s');

				const pointerX = 100; // just more than needed
				const pointerY = 0;

				const spyPointermove = spyOn(element, '_dragging').and.callThrough();
				const pointermove = new PointerEvent('pointermove', {
					bubbles: true,
					clientX: pointerX,
					clientY: pointerY
				});
				guiswitch.dispatchEvent(pointermove);

				const spyPointerup = spyOn(element, '_dragEnd').and.callThrough();
				const pointerup = new Event('pointerup');
				guiswitch.dispatchEvent(pointerup);

				expect(spyPointerdown).toHaveBeenCalledOnceWith(jasmine.any(Event));
				expect(spyPointermove).toHaveBeenCalledOnceWith(jasmine.any(Event));
				expect(spyPointerup).toHaveBeenCalled();

				expect(onToggleSpy).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});
		});

		describe('pointerup event is triggered', () => {
			it('calls _dragEnd', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);

				const dragEndSpy = spyOn(element, '_dragEnd').and.callThrough();

				const guiswitch = element.shadowRoot.querySelector('#guiswitch');

				const pointerup = new Event('pointerup');
				guiswitch.dispatchEvent(pointerup);

				expect(dragEndSpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('on keyboard SPACE', () => {
			fit('fires a "toggle" event', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const spy = jasmine.createSpy();

				const keydownEvent = new KeyboardEvent('keydown', {
					key: ' '
				});

				const inputElement = element.shadowRoot.querySelector('input');
				element.addEventListener('toggle', spy);
				inputElement.dispatchEvent(keydownEvent);

				expect(spy).toHaveBeenCalled();
				// expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBeTrue();
			});
		});
	});

	describe('when slots are used', () => {
		it('renders content in the  before slot', async () => {
			const beforeSlotContent = '<div>Before Slot Content</div>';

			const element = await TestUtils.render(GuiSwitch.tag, {}, {}, `<span slot="before">${beforeSlotContent}</span>`);

			const beforeSlot = element.querySelector('[slot="before"]');

			expect(beforeSlot.innerHTML).toBe(beforeSlotContent);

			const slotElements = element.shadowRoot.querySelectorAll('slot');
			expect(slotElements).toBeTruthy();
			expect(slotElements.length).toBe(3);
			expect(slotElements[0].assignedNodes().length).toBe(1);
			expect(slotElements[1].assignedNodes().length).toBe(0);
			expect(slotElements[2].assignedNodes().length).toBe(0);
		});

		it('renders content in the after slot', async () => {
			const afterSlotContent = '<div>After Slot Content</div>';

			const element = await TestUtils.render(GuiSwitch.tag, {}, {}, `<span slot="after">${afterSlotContent}</span>`);

			const afterSlot = element.querySelector('[slot="after"]');

			expect(afterSlot.innerHTML).toBe(afterSlotContent);

			const slotElements = element.shadowRoot.querySelectorAll('slot');
			expect(slotElements).toBeTruthy();
			expect(slotElements.length).toBe(3);
			expect(slotElements[0].assignedNodes().length).toBe(0);
			expect(slotElements[1].assignedNodes().length).toBe(1);
			expect(slotElements[2].assignedNodes().length).toBe(0);
		});

		it('renders content in the default slot', async () => {
			const defaultSlotContent = '<div>Default Slot Content</div>';

			const element = await TestUtils.render(GuiSwitch.tag, {}, {}, `<span>${defaultSlotContent}</span>`);

			const defaultSlot = element.querySelector(':not([slot])');

			expect(defaultSlot.innerHTML).toBe(defaultSlotContent);

			const slotElements = element.shadowRoot.querySelectorAll('slot');
			expect(slotElements).toBeTruthy();
			expect(slotElements.length).toBe(3);
			expect(slotElements[0].assignedNodes().length).toBe(0);
			expect(slotElements[1].assignedNodes().length).toBe(0);
			expect(slotElements[2].assignedNodes().length).toBe(1);
		});
	});
});
