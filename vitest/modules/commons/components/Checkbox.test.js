import { Checkbox } from '@src/modules/commons/components/checkbox/Checkbox';
import { TEST_ID_ATTRIBUTE_NAME } from '@src/utils/markup';
import { TestUtils } from '@test/test-utils.js';
window.customElements.define(Checkbox.tag, Checkbox);

describe('Checkbox', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(Checkbox.tag);

			//model
			expect(element.disabled).toBe(false);
			expect(element.checked).toBe(false);
			expect(element.title).toBe('');
			expect(element.type).toBe('check');
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(Checkbox.tag, {}, {}, '<span>some</span>');

			//view
			expect(element.shadowRoot.querySelector('.ba-checkbox')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.input').disabled).toBe(false);
			expect(element.shadowRoot.querySelector('.input').checked).toBe(false);
			expect(element.shadowRoot.querySelector('label').title).toBe('');
			expect(element.shadowRoot.querySelector('.ba-checkbox span:first-child').getAttribute('part')).toBe('checkbox-background');
			expect(element.shadowRoot.querySelectorAll('.ba-checkbox.check')).toHaveLength(1);
			//has right svg
			expect(element.shadowRoot.querySelectorAll('svg')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('svg')[0].getAttribute('viewBox')).toBe('0 0 12 9');
			expect(element.shadowRoot.querySelectorAll('svg')[0].getAttribute('height')).toBe('100%');
			expect(element.shadowRoot.querySelectorAll('svg')[0].getAttribute('width')).toBe('100%');
			expect(element.shadowRoot.querySelectorAll('polyline')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('polyline')[0].getAttribute('points')).toBe('1 5 4 8 11 1');
			//has slot tag?
			expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
			//has slot assigned content?
			expect(element.shadowRoot.querySelector('slot').assignedNodes().length).toBe(1);
		});

		it('automatically appends the "data-test-id" attribute', async () => {
			expect((await TestUtils.render(Checkbox.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		});
	});

	describe("when property 'disabled' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Checkbox.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.disabled).toBe(false);

			element.disabled = true;

			expect(input.disabled).toBe(true);

			element.disabled = false;

			expect(input.disabled).toBe(false);
		});
	});

	describe("when property 'checked' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Checkbox.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.checked).toBe(false);

			element.checked = true;

			expect(input.checked).toBe(true);

			element.checked = false;

			expect(input.checked).toBe(false);
		});
	});

	describe("when property 'title' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Checkbox.tag);
			const label = element.shadowRoot.querySelector('label');

			expect(label.title).toBe('');

			element.title = 'foo';

			expect(label.title).toBe('foo');
		});
	});

	describe("when property 'type' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Checkbox.tag);
			expect(element.shadowRoot.querySelectorAll('.ba-checkbox.check')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.ba-checkbox.eye')).toHaveLength(0);
			//has right svg
			expect(element.shadowRoot.querySelectorAll('svg')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('svg')[0].getAttribute('viewBox')).toBe('0 0 12 9');
			expect(element.shadowRoot.querySelectorAll('polyline')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('polyline')[0].getAttribute('points')).toBe('1 5 4 8 11 1');

			element.type = 'eye';

			expect(element.shadowRoot.querySelectorAll('.ba-checkbox.check')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.ba-checkbox.eye')).toHaveLength(1);
			//has right svg
			expect(element.shadowRoot.querySelectorAll('svg')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('svg')[0].getAttribute('viewBox')).toBe('0 0 16 16');
			expect(element.shadowRoot.querySelectorAll('path')).toHaveLength(2);
			expect(element.shadowRoot.querySelectorAll('path')[0].getAttribute('d')).toBe('M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0');
			expect(element.shadowRoot.querySelectorAll('path')[1].getAttribute('d')).toBe(
				'M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7'
			);
		});
	});

	describe('event handling', () => {
		describe('on click', () => {
			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				const spy = vi.fn();
				element.addEventListener('toggle', spy);

				element.click();

				expect(spy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBe(true);
			});

			it('calls the onToggle callback via property callback', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = vi.fn();

				element.click();

				expect(element.onToggle).toHaveBeenCalled();
				expect(element.checked).toBe(true);
			});

			it('calls the onToggle callback via attribute callback', async () => {
				vi.spyOn(window, 'alert');
				const element = await TestUtils.render(Checkbox.tag, {}, { onToggle: "alert('called')" });

				element.click();

				expect(window.alert).toHaveBeenCalledWith('called');
				expect(element.checked).toBe(true);
			});

			it('does nothing when disabled', async () => {
				vi.spyOn(window, 'alert');
				const element = await TestUtils.render(Checkbox.tag, {}, { onToggle: "alert('called')" });
				element.disabled = true;
				element.onClick = vi.fn();

				element.click();

				expect(element.onClick).not.toHaveBeenCalled();
				expect(window.alert).not.toHaveBeenCalledWith('called');
				expect(element.checked).toBe(false);
			});
		});

		describe('on keyboard ENTER', () => {
			const event = new KeyboardEvent('keydown', {
				key: 'Enter'
			});

			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				const spy = vi.fn();
				element.addEventListener('toggle', spy);

				element.dispatchEvent(event);

				expect(spy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBe(true);
			});

			it('does nothing when it is NOT the correct key', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = vi.fn();

				element.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'F12'
					})
				);

				expect(element.onToggle).not.toHaveBeenCalled();
				expect(element.checked).toBe(false);
			});

			it('calls the onToggle callback via property binding', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = vi.fn();

				element.dispatchEvent(event);

				expect(element.onToggle).toHaveBeenCalled();
				expect(element.checked).toBe(true);
			});

			it('calls the onToggle callback via attribute binding', async () => {
				vi.spyOn(window, 'alert');
				const element = await TestUtils.render(Checkbox.tag, {}, { onToggle: "alert('called')" });
				element.onToggle = vi.fn();

				element.dispatchEvent(event);

				expect(window.alert).toHaveBeenCalledWith('called');
				expect(element.checked).toBe(true);
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				element.disabled = true;
				element.onClick = vi.fn();

				element.dispatchEvent(event);

				expect(element.onClick).not.toHaveBeenCalled();
				expect(element.checked).toBe(false);
			});
		});

		describe('on keyboard SPACE', () => {
			const event = new KeyboardEvent('keydown', {
				key: ' '
			});

			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				const spy = vi.fn();
				element.addEventListener('toggle', spy);

				element.dispatchEvent(event);

				expect(spy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBe(true);
			});

			it('does nothing when it is NOT the correct key', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = vi.fn();

				element.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'F12'
					})
				);

				expect(element.onToggle).not.toHaveBeenCalled();
				expect(element.checked).toBe(false);
			});

			it('calls the onToggle callback via property callback', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = vi.fn();

				element.dispatchEvent(event);

				expect(element.onToggle).toHaveBeenCalled();
				expect(element.checked).toBe(true);
			});

			it('calls the onToggle callback via attribute callback', async () => {
				vi.spyOn(window, 'alert');
				const element = await TestUtils.render(Checkbox.tag, {}, { onToggle: "alert('called')" });
				element.onToggle = vi.fn();

				element.dispatchEvent(event);

				expect(window.alert).toHaveBeenCalledWith('called');
				expect(element.checked).toBe(true);
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(Checkbox.tag, { disabled: true });
				element.disabled = true;
				element.onClick = vi.fn();

				element.dispatchEvent(event);

				expect(element.onClick).not.toHaveBeenCalled();
				expect(element.checked).toBe(false);
			});
		});
	});
});
