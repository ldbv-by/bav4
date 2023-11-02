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

		describe("when callback property 'onToggle' changes", () => {
			it('sets the callback', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const callbackFunction = () => {};

				element.onToggle = callbackFunction;
				expect(element.onToggle).toBe(callbackFunction);
			});

			it('does NOT sets the callback with a invalid value', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const initialCallback = element.onToggle;

				element.onToggle = 42;
				expect(element.onToggle).not.toBe(42);
				expect(element.onToggle).toBe(initialCallback);

				element.onToggle = 'something';
				expect(element.onToggle).not.toBe('something');
				expect(element.onToggle).toBe(initialCallback);

				element.onToggle = { foo: 'something' };
				expect(element.onToggle).not.toEqual({ foo: 'something' });
				expect(element.onToggle).toBe(initialCallback);

				element.onToggle = null;
				expect(element.onToggle).not.toBeNull();
				expect(element.onToggle).toBe(initialCallback);

				element.onToggle = undefined;
				expect(element.onToggle).not.toBeUndefined();
				expect(element.onToggle).toBe(initialCallback);
			});
		});
	});

	describe('event handling', () => {
		describe('on click', () => {
			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const spy = jasmine.createSpy();
				element.addEventListener('toggle', spy);

				element.shadowRoot.querySelector('#guiSwitch').click();

				expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBeTrue();

				element.shadowRoot.querySelector('#guiSwitch').click();

				expect(element.checked).toBeFalse();

				element.shadowRoot.querySelector('label').click();

				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via property callback', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				element.shadowRoot.querySelector('#guiSwitch').click();

				expect(onToggleSpy).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				element.disabled = true;
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				element.shadowRoot.querySelector('#guiSwitch').click();

				expect(onToggleSpy).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();

				element.shadowRoot.querySelector('label').click();

				expect(onToggleSpy).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});

		describe('"drag" events', () => {
			describe('when dragging starts', () => {
				it('sets the "--thumb-position" CSS variable on the checkbox element', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);

					const guiSwitch = element.shadowRoot.querySelector('#guiSwitch');
					const pointerdown = new Event('pointerdown');
					pointerdown.offsetX = 0;
					guiSwitch.dispatchEvent(pointerdown);

					const computedStyle = window.getComputedStyle(guiSwitch);
					const thumbPosition = computedStyle.getPropertyValue('--thumb-position');
					expect(thumbPosition).toBe('0px');
				});

				it('sets the "--thumb-transition-duration" CSS variable to "0s"', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);

					const guiSwitch = element.shadowRoot.querySelector('#guiSwitch');
					const pointerdown = new Event('pointerdown');
					guiSwitch.dispatchEvent(pointerdown);

					const computedStyle = window.getComputedStyle(guiSwitch);
					const thumbTransitionDuration = computedStyle.getPropertyValue('--thumb-transition-duration');
					expect(thumbTransitionDuration).toBe('0s');
				});

				it('calls _dragInit ', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);
					const dragInitSpy = spyOn(element, '_dragInit').and.callThrough();

					const guiSwitch = element.shadowRoot.querySelector('#guiSwitch');
					const pointerdown = new Event('pointerdown');
					guiSwitch.dispatchEvent(pointerdown);

					expect(dragInitSpy).toHaveBeenCalledTimes(1);
				});

				it('does nothing when disabled', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);
					element.disabled = true;
					const dragInitSpy = spyOn(element, '_dragInit').and.callThrough();

					const guiSwitch = element.shadowRoot.querySelector('#guiSwitch');
					const pointerdown = new Event('pointerdown');
					guiSwitch.dispatchEvent(pointerdown);

					expect(dragInitSpy).toHaveBeenCalled();
					const computedStyle = window.getComputedStyle(guiSwitch);
					// property values should be the same as defined in guiSwitch.css
					expect(computedStyle.getPropertyValue('--thumb-position')).toBe('0%');
					expect(computedStyle.getPropertyValue('--thumb-transition-duration')).toBe('0.25s');
				});
			});
		});

		describe('all pointer events at once', () => {
			it('handles all pointer - events and calls the onToggle callback', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();
				const spyPointerdown = spyOn(element, '_dragInit').and.callThrough();

				const guiSwitch = element.shadowRoot.querySelector('#guiSwitch');
				const pointerdown = new Event('pointerdown');
				guiSwitch.dispatchEvent(pointerdown);

				const computedStyle = window.getComputedStyle(guiSwitch);
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
				guiSwitch.dispatchEvent(pointermove);

				const spyPointerup = spyOn(element, '_dragEnd').and.callThrough();
				const pointerup = new Event('pointerup');
				guiSwitch.dispatchEvent(pointerup);

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

				const guiSwitch = element.shadowRoot.querySelector('#guiSwitch');

				const pointerup = new Event('pointerup');
				guiSwitch.dispatchEvent(pointerup);

				expect(dragEndSpy).toHaveBeenCalledTimes(1);
			});
		});

		describe('on keyboard SPACE', () => {
			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				const spy = jasmine.createSpy();

				const keydownEvent = new KeyboardEvent('keydown', {
					key: ' '
				});

				const inputElement = element.shadowRoot.querySelector('input');
				element.addEventListener('toggle', spy);
				inputElement.dispatchEvent(keydownEvent);

				expect(spy).toHaveBeenCalled();
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);
				element.disabled = true;

				const keydownEvent = new KeyboardEvent('keydown', {
					key: ' '
				});

				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				const inputElement = element.shadowRoot.querySelector('input');
				inputElement.dispatchEvent(keydownEvent);

				expect(onToggleSpy).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});

			it('does nothing when hitting other keys', async () => {
				const element = await TestUtils.render(GuiSwitch.tag);

				const keydownEvent = new KeyboardEvent('keydown', {
					key: 'f'
				});

				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				const inputElement = element.shadowRoot.querySelector('input');
				inputElement.dispatchEvent(keydownEvent);

				expect(onToggleSpy).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});
	});

	describe('when in indeterminate state', () => {
		const renderIndeterminateElement = async () => TestUtils.render(GuiSwitch.tag, { indeterminate: true });
		it('toggles on click', async () => {
			const element = await renderIndeterminateElement();
			const spy = jasmine.createSpy();
			element.addEventListener('toggle', spy);

			expect(element.indeterminate).toBeTrue();

			element.shadowRoot.querySelector('#guiSwitch').click();

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
			expect(element.checked).toBeTrue();
			expect(element.indeterminate).toBeFalse();
		});

		it('toggles on key SPACE', async () => {
			const element = await renderIndeterminateElement();
			const spy = jasmine.createSpy();
			element.addEventListener('toggle', spy);

			expect(element.indeterminate).toBeTrue();

			const inputElement = element.shadowRoot.querySelector('input');
			const keydownEvent = new KeyboardEvent('keydown', { key: ' ' });
			inputElement.dispatchEvent(keydownEvent);

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
			expect(element.checked).toBeTrue();
			expect(element.indeterminate).toBeFalse();
		});

		it('toggles on drag', async () => {
			const element = await renderIndeterminateElement();
			const guiSwitch = element.shadowRoot.querySelector('#guiSwitch');
			const pointerdown = new Event('pointerdown');
			const pointermove = new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 });

			expect(element.indeterminate).toBeTrue();

			const pointerup = new Event('pointerup');
			guiSwitch.dispatchEvent(pointerdown);
			guiSwitch.dispatchEvent(pointermove);
			guiSwitch.dispatchEvent(pointerup);

			expect(element.checked).toBeTrue();
			expect(element.indeterminate).toBeFalse();
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
