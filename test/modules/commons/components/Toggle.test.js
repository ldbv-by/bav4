import { Toggle } from '../../../../src/modules/commons/components/toggle/Toggle';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Toggle.tag, Toggle);

describe('Toggle', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(Toggle.tag);

			//model
			expect(element.disabled).toBeFalse();
			expect(element.checked).toBeFalse();
			expect(element.title).toBe('');
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(Toggle.tag, {}, {}, '<span>some</span>');

			//view
			expect(element.shadowRoot.querySelector('.switch')).toBeTruthy();
			expect(element.shadowRoot.querySelector('input').disabled).toBeFalse();
			expect(element.shadowRoot.querySelector('input').checked).toBeFalse();
			expect(element.shadowRoot.querySelector('label').title).toBe('');
			//has slot tag?
			expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
			//has slot assigned content?
			expect(element.shadowRoot.querySelector('slot').assignedNodes().length).toBe(1);
		});

		it('automatically appends the "data-test-id" attribute', async () => {
			expect((await TestUtils.render(Toggle.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		});
	});

	describe("when property'disabled' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Toggle.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.disabled).toBeFalse();

			element.disabled = true;

			expect(input.disabled).toBeTrue();

			element.disabled = false;

			expect(input.disabled).toBeFalse();
		});
	});

	describe("when property'checked' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Toggle.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.checked).toBeFalse();

			element.checked = true;

			expect(input.checked).toBeTrue();

			element.checked = false;

			expect(input.checked).toBeFalse();
		});
	});

	describe("when property'title' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Toggle.tag);
			const label = element.shadowRoot.querySelector('label');

			expect(label.title).toBe('');

			element.title = 'foo';

			expect(label.title).toBe('foo');
		});
	});

	describe('event handling', () => {
		describe('on click', () => {
			it('fires a "toggle" event', async () => {
				const element = await TestUtils.render(Toggle.tag);
				const spy = jasmine.createSpy();
				element.addEventListener('toggle', spy);

				element.click();

				expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: { checked: true } }));
				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via property callback', async () => {
				const element = await TestUtils.render(Toggle.tag);
				element.onToggle = jasmine.createSpy();

				element.click();

				expect(element.onToggle).toHaveBeenCalledTimes(1);
				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via attribute callback', async () => {
				spyOn(window, 'alert');
				const element = await TestUtils.render(Toggle.tag, {}, { onToggle: "alert('called')" });

				element.click();

				expect(window.alert).toHaveBeenCalledOnceWith('called');
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				spyOn(window, 'alert');
				const element = await TestUtils.render(Toggle.tag, {}, { onToggle: "alert('called')" });
				element.disabled = true;
				element.onClick = jasmine.createSpy();

				element.click();

				expect(element.onClick).not.toHaveBeenCalled();
				expect(window.alert).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});
	});
});
