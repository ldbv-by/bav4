import { Button } from '@src/modules/commons/components/button/Button';
import { TEST_ID_ATTRIBUTE_NAME } from '@src/utils/markup';
import { TestUtils } from '@test/test-utils.js';

window.customElements.define(Button.tag, Button);

describe('Button', () => {
	beforeEach(async () => {
		let a = 'test0';
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {
		it('contains default values in the model', async () => {
			const element = await TestUtils.render(Button.tag);

			//model
			expect(element.getModel()).toEqual({ disabled: false, label: 'label', icon: null, type: 'secondary', title: null });
		});

		it('has properties with default values from the model', async () => {
			const element = await TestUtils.render(Button.tag);

			//properties from model
			expect(element.disabled).toBe(false);
			expect(element.label).toBe('label');
			expect(element.type).toBe('secondary');
			expect(element.icon).toBe(null);
			expect(element.title).toBe(null);
		});

		it('renders the view', async () => {
			const element = await TestUtils.render(Button.tag);

			//view
			const button = element.shadowRoot.querySelector('button');
			expect(button.classList.contains('secondary')).toBe(true);
			expect(button.classList.contains('disabled')).toBe(false);
			expect(button.classList.contains('iconbutton')).toBe(false);
			expect(button.children.length).toBe(0);
			expect(element.shadowRoot.styleSheets.length).toBe(2);
			expect(button.innerText).toBe('label');
			expect(button.getAttribute('title')).toBe('');
			expect(button.getAttribute('aria-label')).toBe('');
			expect(button.getAttribute('part')).toBe('button');
			expect(button.part.contains('button')).toBe(true);
		});

		it('renders the view with given title', async () => {
			const element = await TestUtils.render(Button.tag, { title: 'foobar' });

			//view
			const button = element.shadowRoot.querySelector('button');
			expect(button.classList.contains('secondary')).toBe(true);
			expect(button.classList.contains('disabled')).toBe(false);
			expect(button.classList.contains('iconbutton')).toBe(false);
			expect(button.children.length).toBe(0);
			expect(element.shadowRoot.styleSheets.length).toBe(2);
			expect(button.innerText).toBe('label');
			expect(button.getAttribute('title')).toBe('foobar');
			expect(button.getAttribute('aria-label')).toBe('foobar');
			expect(button.getAttribute('part')).toBe('button');
			expect(button.part.contains('button')).toBe(true);
		});

		it('renders the view with empty given title', async () => {
			const element = await TestUtils.render(Button.tag, { title: null });

			//view
			const button = element.shadowRoot.querySelector('button');
			expect(button.classList.contains('secondary')).toBe(true);
			expect(button.classList.contains('disabled')).toBe(false);
			expect(button.classList.contains('iconbutton')).toBe(false);
			expect(button.children.length).toBe(0);
			expect(element.shadowRoot.styleSheets.length).toBe(2);
			expect(button.innerText).toBe('label');
			expect(button.getAttribute('title')).toBe('');
			expect(button.getAttribute('aria-label')).toBe('');
			expect(button.getAttribute('part')).toBe('button');
			expect(button.part.contains('button')).toBe(true);
		});

		it('automatically appends the "data-test-id" attribute', async () => {
			expect((await TestUtils.render(Button.tag)).getAttribute(TEST_ID_ATTRIBUTE_NAME)).toBe('');
		});
	});

	describe("when property'disabled' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.classList.contains('disabled')).toBe(false);

			element.disabled = true;

			expect(button.classList.contains('disabled')).toBe(true);

			element.disabled = false;

			expect(button.classList.contains('disabled')).toBe(false);
		});
	});

	describe("when property'label' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.innerText).toBe('label');

			element.label = 'foo';

			expect(button.innerText).toBe('foo');
		});
	});

	describe("when property'type' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.classList.contains('secondary')).toBe(true);
			expect(button.classList.contains('primary')).toBe(false);
			expect(button.classList.contains('loading')).toBe(false);

			element.type = 'primary';

			expect(button.classList.contains('secondary')).toBe(false);
			expect(button.classList.contains('primary')).toBe(true);
			expect(button.classList.contains('loading')).toBe(false);

			element.type = 'loading';

			expect(button.classList.contains('secondary')).toBe(false);
			expect(button.classList.contains('primary')).toBe(false);
			expect(button.classList.contains('loading')).toBe(true);
		});
	});

	describe("when property'icon' changes", () => {
		it('updates the view', async () => {
			const element = await TestUtils.render(Button.tag);
			const button = element.shadowRoot.querySelector('button');

			expect(button.classList.contains('iconbutton')).toBe(false);
			expect(button.children.length).toBe(0);
			expect(element.shadowRoot.styleSheets.length).toBe(2);

			element.icon = 'http://foo';

			expect(button.classList.contains('iconbutton')).toBe(true);
			expect(button.children.length).toBe(1);
			expect(element.shadowRoot.styleSheets.length).toBe(3);
			expect(button.children[0].classList.contains('icon')).toBe(true);
			expect(button.children[0].part.contains('icon')).toBe(true);
			expect(element.shadowRoot.styleSheets[2].cssRules.item(0).cssText).toContain('.icon { mask: url("http://foo');

			element.icon = 'http://bar';

			expect(button.classList.contains('iconbutton')).toBe(true);
			expect(button.children.length).toBe(1);
			expect(element.shadowRoot.styleSheets.length).toBe(3);
			expect(button.children[0].classList.contains('icon')).toBe(true);
			expect(button.children[0].part.contains('icon')).toBe(true);
			expect(element.shadowRoot.styleSheets[2].cssRules.item(0).cssText).toContain('.icon { mask: url("http://bar');
		});
	});

	describe('when clicked', () => {
		it('calls the onClick callback via property binding', async () => {
			const element = await TestUtils.render(Button.tag);
			element.onClick = vi.fn();

			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(element.onClick).toHaveBeenCalled();
		});

		it('calls the onClick callback via attribute binding', async () => {
			// call mockImplementation to prevent window.alert to block threads.
			vi.spyOn(window, 'alert').mockImplementation((str) => str);
			const element = await TestUtils.render(Button.tag, {}, { onClick: "alert('called')" });

			element.click();

			expect(window.alert).toHaveBeenCalledWith('called');
		});

		it('does nothing when disabled', async () => {
			// call mockImplementation to prevent window.alert to block threads.
			vi.spyOn(window, 'alert').mockImplementation((str) => str);
			const element = await TestUtils.render(Button.tag, {}, { onClick: "alert('called')" });
			element.disabled = true;

			element.onClick = vi.fn();

			const button = element.shadowRoot.querySelector('button');
			button.click();

			expect(element.onClick).not.toHaveBeenCalled();
			expect(window.alert).not.toHaveBeenCalledWith('called');
		});
	});
});
