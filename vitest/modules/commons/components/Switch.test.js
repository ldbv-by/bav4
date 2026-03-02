import { Switch, PAD_RELEASE_TIMEOUT } from '../../../../src/modules/commons/components/switch/Switch';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup.js';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Switch.tag, Switch);

describe('Switch', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	const getThumbStyleProperties = (thumbElement) => {
		const computedStyle = window.getComputedStyle(thumbElement);
		return {
			thumbPosition: computedStyle.getPropertyValue('--thumb-position'),
			thumbTransitionDuration: computedStyle.getPropertyValue('--thumb-transition-duration')
		};
	};

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(Switch.tag);

			//model
			expect(element.disabled).toBeFalse();
			expect(element.checked).toBeFalse();
			expect(element.indeterminate).toBeFalse();
			expect(element.title).toBe('');
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(Switch.tag);

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
			expect((await TestUtils.render(Switch.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		});
	});

	describe('properties', () => {
		describe("when property 'disabled' changes", () => {
			it('updates the view', async () => {
				const element = await TestUtils.render(Switch.tag);
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
				const element = await TestUtils.render(Switch.tag);
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
				const element = await TestUtils.render(Switch.tag);
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
				const element = await TestUtils.render(Switch.tag);

				expect(element.title).toBe('');
				element.title = 'foo';
				expect(element.title).toBe('foo');
			});
		});

		describe("when callback property 'onToggle' changes", () => {
			it('sets the callback', async () => {
				const element = await TestUtils.render(Switch.tag);
				const callbackFunction = () => {};

				element.onToggle = callbackFunction;
				expect(element.onToggle).toBe(callbackFunction);
			});

			it('does NOT sets the callback with a invalid value', async () => {
				const element = await TestUtils.render(Switch.tag);
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
				const element = await TestUtils.render(Switch.tag);
				const spy = jasmine.createSpy();
				element.addEventListener('toggle', spy);

				element.shadowRoot.querySelector('#baSwitch').click();

				expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBeTrue();

				element.shadowRoot.querySelector('#baSwitch').click();

				expect(element.checked).toBeFalse();

				element.shadowRoot.querySelector('label').click();

				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via property callback', async () => {
				const element = await TestUtils.render(Switch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				element.shadowRoot.querySelector('#baSwitch').click();

				expect(onToggleSpy).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(Switch.tag);
				element.disabled = true;
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				element.shadowRoot.querySelector('#baSwitch').click();

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
					const element = await TestUtils.render(Switch.tag);

					const baSwitch = element.shadowRoot.querySelector('#baSwitch');
					const pointerdown = new Event('pointerdown');
					pointerdown.offsetX = 0;
					baSwitch.dispatchEvent(pointerdown);

					const afterPointerDown = getThumbStyleProperties(baSwitch);
					expect(afterPointerDown.thumbPosition).toBe('0px');
				});

				it('inits the thumb style ', async () => {
					const element = await TestUtils.render(Switch.tag);

					const baSwitch = element.shadowRoot.querySelector('#baSwitch');
					const pointerdown = new Event('pointerdown');
					baSwitch.dispatchEvent(pointerdown);

					const afterPointerDown = getThumbStyleProperties(baSwitch);
					// property values should NOT be the same as the predefined in switch.css
					expect(afterPointerDown.thumbPosition).not.toBe('0%');
					expect(afterPointerDown.thumbTransitionDuration).toBe('0s');
				});

				it('does nothing when disabled', async () => {
					const element = await TestUtils.render(Switch.tag);
					element.disabled = true;

					const baSwitch = element.shadowRoot.querySelector('#baSwitch');
					const pointerdown = new Event('pointerdown');
					baSwitch.dispatchEvent(pointerdown);

					const afterPointerDown = getThumbStyleProperties(baSwitch);
					// property values should be the same as defined in switch.css
					expect(afterPointerDown.thumbPosition).toBe('0%');
				});
			});
		});

		describe('all pointer events at once', () => {
			it('handles all pointer-events and calls the onToggle callback', async () => {
				const element = await TestUtils.render(Switch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				const baSwitch = element.shadowRoot.querySelector('#baSwitch');
				const pointerdown = new Event('pointerdown');
				baSwitch.dispatchEvent(pointerdown);

				const afterPointerDown = getThumbStyleProperties(baSwitch);
				expect(afterPointerDown.thumbTransitionDuration).toBe('0s');

				const pointermove = new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 });
				baSwitch.dispatchEvent(pointermove);
				const afterPointerMove = getThumbStyleProperties(baSwitch);

				expect(afterPointerMove.thumbPosition).toBe('29px');
				expect(afterPointerMove.thumbTransitionDuration).toBe('0s');

				const pointerup = new Event('pointerup');
				baSwitch.dispatchEvent(pointerup);

				const afterPointerUp = getThumbStyleProperties(baSwitch);

				expect(afterPointerUp.thumbPosition).toBe('calc((calc(1.4rem * 2) - 100%) * 1)');

				expect(onToggleSpy).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('handles all pointer-events and does NOT call the onToggle callback, due to no changes in checked state', async () => {
				const element = await TestUtils.render(Switch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				expect(element.checked).toBeFalse();

				const baSwitch = element.shadowRoot.querySelector('#baSwitch');
				const pointerdown = new Event('pointerdown');
				pointerdown.offsetX = 25;
				baSwitch.dispatchEvent(pointerdown);

				const pointermove = new PointerEvent('pointermove');
				baSwitch.dispatchEvent(pointermove);

				const pointerup = new Event('pointerup');
				baSwitch.dispatchEvent(pointerup);

				expect(onToggleSpy).toHaveBeenCalledTimes(0);
				expect(element.checked).toBeFalse();
			});

			it('handles pointer down/up - events and calls the onToggle callback', async () => {
				const element = await TestUtils.render(Switch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				expect(element.checked).toBeFalse();

				const baSwitch = element.shadowRoot.querySelector('#baSwitch');
				const pointerdown = new Event('pointerdown');
				pointerdown.offsetX = 25;
				baSwitch.dispatchEvent(pointerdown);

				const afterPointerDown = getThumbStyleProperties(baSwitch);
				expect(afterPointerDown.thumbTransitionDuration).toBe('0s');

				const pointerup = new Event('pointerup');
				baSwitch.dispatchEvent(pointerup);

				const afterPointerUp = getThumbStyleProperties(baSwitch);

				expect(afterPointerUp.thumbPosition).toBe('calc((calc(1.4rem * 2) - 100%) * 1)');

				expect(onToggleSpy).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('handles pointercancel-events instead of pointerup and calls the onToggle callback', async () => {
				const element = await TestUtils.render(Switch.tag);
				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();

				expect(element.checked).toBeFalse();

				const baSwitch = element.shadowRoot.querySelector('#baSwitch');
				const pointerdown = new Event('pointerdown');
				pointerdown.offsetX = 25;
				baSwitch.dispatchEvent(pointerdown);

				const afterPointerDown = getThumbStyleProperties(baSwitch);
				expect(afterPointerDown.thumbTransitionDuration).toBe('0s');

				const pointermove = new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 });
				baSwitch.dispatchEvent(pointermove);

				const pointercancel = new Event('pointercancel');
				baSwitch.dispatchEvent(pointercancel);

				const afterPointerCancel = getThumbStyleProperties(baSwitch);

				expect(afterPointerCancel.thumbPosition).toBe('calc((calc(1.4rem * 2) - 100%) * 1)');

				expect(onToggleSpy).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('handles window.pointerup ONCE', async () => {
				const element = await TestUtils.render(Switch.tag);
				const spyUpdateChecked = spyOn(element, 'signal').withArgs('update_checked_propagate', jasmine.any(Boolean)).and.callThrough();

				const baSwitch = element.shadowRoot.querySelector('#baSwitch');
				const pointerdown = new Event('pointerdown');
				const pointermove = new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 });
				const pointerup = new Event('pointerup');

				baSwitch.dispatchEvent(pointerdown);
				baSwitch.dispatchEvent(pointermove);

				window.dispatchEvent(pointerup);
				window.dispatchEvent(pointerup);
				window.dispatchEvent(pointerup);

				expect(spyUpdateChecked).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('respects the direction-attribute', async () => {
				const element = await TestUtils.render(Switch.tag, {}, { dir: 'rtl' });

				const baSwitch = element.shadowRoot.querySelector('#baSwitch');
				const pointerdown = new Event('pointerdown');
				const pointermove = new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 });
				const pointerup = new Event('pointerup');

				baSwitch.dispatchEvent(pointerdown);
				baSwitch.dispatchEvent(pointermove);
				baSwitch.dispatchEvent(pointerup);

				expect(element.checked).toBeFalse();
			});

			it('prevents bubbles after drag', async () => {
				const element = await TestUtils.render(Switch.tag, {}, { dir: 'rtl' });

				const baSwitch = element.shadowRoot.querySelector('#baSwitch');
				const pointerdown = new Event('pointerdown');
				const pointermove = new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 });
				const pointerup = new Event('pointerup');

				baSwitch.dispatchEvent(pointerdown);
				baSwitch.dispatchEvent(pointermove);
				baSwitch.dispatchEvent(pointerup);

				const onToggleSpy = spyOn(element, 'onToggle').and.callThrough();
				baSwitch.click();

				expect(onToggleSpy).not.toHaveBeenCalled();

				await TestUtils.timeout(PAD_RELEASE_TIMEOUT + 50);
				baSwitch.click();

				expect(onToggleSpy).toHaveBeenCalled();
			});
		});

		describe('on keyboard SPACE', () => {
			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(Switch.tag);
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
				const element = await TestUtils.render(Switch.tag);
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
				const element = await TestUtils.render(Switch.tag);

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

		describe('on click', () => {
			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(Switch.tag);
				const spy = jasmine.createSpy();
				element.addEventListener('toggle', spy);

				element.click();

				expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via property callback', async () => {
				const element = await TestUtils.render(Switch.tag);
				element.onToggle = jasmine.createSpy();

				element.click();

				expect(element.onToggle).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via attribute callback', async () => {
				spyOn(window, 'alert');
				const element = await TestUtils.render(Switch.tag, {}, { onToggle: "alert('called')" });

				element.click();

				expect(window.alert).toHaveBeenCalledOnceWith('called');
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				spyOn(window, 'alert');
				const element = await TestUtils.render(Switch.tag, {}, { onToggle: "alert('called')" });
				element.disabled = true;
				element.onClick = jasmine.createSpy();

				element.click();

				expect(element.onClick).not.toHaveBeenCalled();
				expect(window.alert).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});
	});

	describe('when in indeterminate state', () => {
		const renderIndeterminateElement = async () => TestUtils.render(Switch.tag, { indeterminate: true });
		it('toggles on click', async () => {
			const element = await renderIndeterminateElement();
			const spy = jasmine.createSpy();
			element.addEventListener('toggle', spy);

			expect(element.indeterminate).toBeTrue();

			element.shadowRoot.querySelector('#baSwitch').click();

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
			const baSwitch = element.shadowRoot.querySelector('#baSwitch');
			const pointerdown = new Event('pointerdown');
			const pointermove = new PointerEvent('pointermove', { bubbles: true, clientX: 100, clientY: 0 });

			expect(element.indeterminate).toBeTrue();

			const pointerup = new Event('pointerup');
			baSwitch.dispatchEvent(pointerdown);
			baSwitch.dispatchEvent(pointermove);
			baSwitch.dispatchEvent(pointerup);

			expect(element.checked).toBeTrue();
			expect(element.indeterminate).toBeFalse();
		});
	});

	describe('when slots are used', () => {
		it('renders content in the  before slot', async () => {
			const beforeSlotContent = '<div>Before Slot Content</div>';

			const element = await TestUtils.render(Switch.tag, {}, {}, `<span slot="before">${beforeSlotContent}</span>`);

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

			const element = await TestUtils.render(Switch.tag, {}, {}, `<span slot="after">${afterSlotContent}</span>`);

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

			const element = await TestUtils.render(Switch.tag, {}, {}, `<span>${defaultSlotContent}</span>`);

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
