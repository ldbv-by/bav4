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

		it('automatically appends the "data-test-id" attribute', async () => {
			expect((await TestUtils.render(GuiSwitch.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		});
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

					element._dragInit = jasmine.createSpy();

					const guiswitch = element.shadowRoot.querySelector('#guiswitch');

					const pointerdown = new Event('pointerdown');
					guiswitch.dispatchEvent(pointerdown);

					expect(element._dragInit).toHaveBeenCalledTimes(1);
				});

				it('does nothing when disabled', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);
					element.disabled = true;
					element.onDragStart = jasmine.createSpy();

					const guiswitch = element.shadowRoot.querySelector('#guiswitch');

					const pointerdown = new Event('pointerdown');
					guiswitch.dispatchEvent(pointerdown);

					expect(element.onDragStart).not.toHaveBeenCalled();
				});
			});

			describe('all pointer events at once', () => {
				it('handles all pointer - events and calls the onToggle callback', async () => {
					const element = await TestUtils.render(GuiSwitch.tag);

					element.onToggle = jasmine.createSpy();

					const guiswitch = element.shadowRoot.querySelector('#guiswitch');

					const spyPointerdown = spyOn(element, '_dragInit').and.callThrough();
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

					expect(element.onToggle).toHaveBeenCalledTimes(1);
					expect(element.checked).toBeTrue();
				});

				// it('checks that css properties are set correctly after moving the marker', async () => {
				// 	const element = await TestUtils.render(GuiSwitch.tag);
				// 	const guiswitch = element.shadowRoot.querySelector('#guiswitch');

				// 	// test dragInit
				// 	const spyPointerdown = spyOn(element, 'dragInit').and.callThrough();
				// 	guiswitch.addEventListener('pointerdown', element.dragInit);
				// 	const pointerdown = new Event('pointerdown');
				// 	guiswitch.dispatchEvent(pointerdown);

				// 	expect(spyPointerdown).toHaveBeenCalledOnceWith(jasmine.any(Event));

				// 	const computedStyle = window.getComputedStyle(element._state.activethumb);
				// 	const thumbTransitionDuration = computedStyle.getPropertyValue('--thumb-transition-duration');
				// 	expect(thumbTransitionDuration).toBe('0s');

				// 	// dragging
				// 	const pointerX = 100; // Adjust based on the pointer position
				// 	const pointerY = 0; // Adjust based on the pointer position

				// 	const spyPointermove = spyOn(element, 'dragging').and.callThrough();
				// 	guiswitch.addEventListener('pointermove', element.dragging);
				// 	const pointermove = new PointerEvent('pointermove', {
				// 		bubbles: true,
				// 		clientX: pointerX,
				// 		clientY: pointerY
				// 	});
				// 	guiswitch.dispatchEvent(pointermove);

				// 	expect(spyPointermove).toHaveBeenCalledOnceWith(jasmine.any(PointerEvent));

				// 	// Calculate the expected thumbPosition value
				// 	const remThumbsize = parseFloat(computedStyle.getPropertyValue('--thumb-size'));
				// 	console.log('🚀 ~ fit ~ remThumbsize:', remThumbsize);
				// 	const thumbsize = remToPx(remThumbsize);
				// 	console.log('🚀 ~ fit ~ thumbsize:', thumbsize);
				// 	const padding = parseFloat(computedStyle.getPropertyValue('--track-padding'));
				// 	console.log('🚀 ~ fit ~ padding:', padding);
				// 	const directionality = parseFloat(computedStyle.getPropertyValue('--isLTR'));
				// 	console.log('🚀 ~ fit ~ directionality:', directionality);

				// 	const track = directionality === -1 ? thumbsize * -1 + padding : 0;
				// 	console.log('🚀 ~ fit ~ track:', track);

				// 	let expectedPos = Math.round(pointermove.clientX - thumbsize / 2 + padding);
				// 	console.log('🚀 ~ fit ~ expectedPos:', expectedPos);

				// 	const lowerBound = 0;
				// 	const upperBound = 100;

				// 	if (expectedPos < lowerBound) expectedPos = 0;
				// 	if (expectedPos > upperBound) expectedPos = upperBound;

				// 	const expectedThumbPosition = `${track + expectedPos}px`;
				// 	const thumbPosition = computedStyle.getPropertyValue('--thumb-position');
				// 	console.log('🚀 ~ fit ~ thumbPosition:', thumbPosition);
				// 	console.log('🚀 ~ fit ~ expectedThumbPosition:', expectedThumbPosition);
				// 	expect(thumbPosition).toBe(expectedThumbPosition);
				// });
			});
		});
	});
});
