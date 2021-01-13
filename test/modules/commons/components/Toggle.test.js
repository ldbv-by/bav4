import { Toggle } from '../../../../src/modules/commons/components/toggle/Toggle';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Toggle.tag, Toggle);


describe('Toggle', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});


	describe('when initialized with no attributes', () => {
		it('renders the view', async () => {

			const element = await TestUtils.render(Toggle.tag, {}, '<span>some</span>');

			expect(element.disabled).toBeFalse();
			expect(element.checked).toBeFalse();
			expect(element.title).toBe('');
			expect(element.shadowRoot.querySelector('.switch')).toBeTruthy();
			expect(element.shadowRoot.querySelector('span')).toBeTruthy();
			//has slot tag?
			expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
			//has slot assigned content?
			expect(element.shadowRoot.querySelector('slot').assignedNodes().length).toBe(1);
		});
	});

	describe('when initialized with \'disabled\' attribute', () => {

		it('renders the toggle enabled', async () => {

			const element = await TestUtils.render(Toggle.tag, { disabled: false });

			expect(element.shadowRoot.querySelector('.switch').classList.contains('disabled')).toBeFalse();
			expect(element.disabled).toBeFalse;
			const input = element.shadowRoot.querySelector('input');
			expect(input.disabled).toBeFalse();
		});

		it('renders the toggle disabled', async () => {

			const element = await TestUtils.render(Toggle.tag, { disabled: true });

			expect(element.shadowRoot.querySelector('.switch').classList.contains('disabled')).toBeTrue();
			expect(element.disabled).toBeTrue;
			const input = element.shadowRoot.querySelector('input');
			expect(input.disabled).toBeTrue();
		});

		it('re-renders the toggle when property \'disabled\' changed', async () => {

			const element = await TestUtils.render(Toggle.tag);

			expect(element.shadowRoot.querySelector('.switch').classList.contains('disabled')).toBeFalse();

			element.disabled = true;

			expect(element.shadowRoot.querySelector('.switch').classList.contains('disabled')).toBeTrue();
		});

		it('re-renders the toggle when attribute \'disabled\' changed', async () => {

			const element = await TestUtils.render(Toggle.tag);

			expect(element.shadowRoot.querySelector('.switch').classList.contains('disabled')).toBeFalse();

			element.setAttribute('disabled', 'true');

			expect(element.shadowRoot.querySelector('.switch').classList.contains('disabled')).toBeTrue();
		});
	});

	describe('when initialized with \'checked\' attribute', () => {

		it('renders the toggle unchecked', async () => {

			const element = await TestUtils.render(Toggle.tag, { checked: false });

			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeFalse();
		});

		it('renders the toggle checked', async () => {

			const element = await TestUtils.render(Toggle.tag, { checked: true });

			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeTrue();
		});


		it('re-renders the toggle when property \'checked\' changed', async () => {

			const element = await TestUtils.render(Toggle.tag);

			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeFalse();

			element.checked = true;

			expect(input.checked).toBeTrue();
		});

		it('re-renders the toggle when attribute \'checked\' changed', async () => {

			const element = await TestUtils.render(Toggle.tag);

			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeFalse();

			element.setAttribute('checked', 'true');

			expect(input.checked).toBeTrue();
		});
	});

	describe('when initialized with \'title\' attribute', () => {

		it('renders the title', async () => {

			const element = await TestUtils.render(Toggle.tag, { title: 'someTitle' });

			const label = element.shadowRoot.querySelector('label');
			expect(label.title).toBe('someTitle');
		});

		it('re-renders the toggle when property \'title\' changed', async () => {

			const element = await TestUtils.render(Toggle.tag);

			const label = element.shadowRoot.querySelector('label');
			expect(label.title).toBe('');

			element.title = 'someTitle';

			expect(label.title).toBe('someTitle');
		});

		it('re-renders the toggle when attribute \'title\' changed', async () => {

			const element = await TestUtils.render(Toggle.tag);

			const label = element.shadowRoot.querySelector('label');
			expect(label.title).toBe('');

			element.setAttribute('title', 'someTitle');

			expect(label.title).toBe('someTitle');
		});
	});
	describe('when clicked', () => {

		it('calls the onChange callback', async () => {

			const element = await TestUtils.render(Toggle.tag);
			element.onChange = jasmine.createSpy();


			const label = element.shadowRoot.querySelector('label');
			label.click();

			expect(element.onChange).toHaveBeenCalled();
		});

		it('does nothing when disabled', async () => {
			const element = await TestUtils.render(Toggle.tag, { disabled: true });

			element.onClick = jasmine.createSpy();

			const label = element.shadowRoot.querySelector('label');
			label.click();

			expect(element.onClick).not.toHaveBeenCalled();
		});
	});
});
