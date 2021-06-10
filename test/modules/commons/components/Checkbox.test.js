import { Checkbox } from '../../../../src/modules/commons/components/checkbox/Checkbox';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Checkbox.tag, Checkbox);


describe('Checkbox', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});


	describe('when initialized with no attributes', () => {
		it('renders the view', async () => {

			const element = await TestUtils.render(Checkbox.tag, {}, '<span>some</span>');

			expect(element.disabled).toBeFalse();
			expect(element.checked).toBeFalse();
			expect(element.title).toBe('');
			expect(element.shadowRoot.querySelector('.ba-checkbox')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.input')).toBeTruthy();
			//has slot tag?
			expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
			//has slot assigned content?
			expect(element.shadowRoot.querySelector('slot').assignedNodes().length).toBe(1);
		});
	});

	describe('when initialized with \'disabled\' attribute', () => {

		it('renders the checkbox enabled', async () => {

			const element = await TestUtils.render(Checkbox.tag, { disabled: false });
			const input = element.shadowRoot.querySelector('input');
			expect(input.disabled).toBeFalse();
		});

		it('renders the checkbox disabled', async () => {

			const element = await TestUtils.render(Checkbox.tag, { disabled: true });
			const input = element.shadowRoot.querySelector('input');
			expect(input.disabled).toBeTrue();
		});

		it('re-renders the checkbox when property \'disabled\' changed', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			expect(element.shadowRoot.querySelector('.input').disabled).toBeFalse();
			element.disabled = true;
			expect(element.shadowRoot.querySelector('.input').disabled).toBeTrue();
		});

		it('re-renders the checkbox when attribute \'disabled\' changed', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			expect(element.shadowRoot.querySelector('.input').disabled).toBeFalse();
			element.setAttribute('disabled', 'true');
			expect(element.disabled).toBeTrue();
			expect(element.shadowRoot.querySelector('.input').disabled).toBeTrue();
		});
	});

	describe('when initialized with \'checked\' attribute', () => {

		it('renders the checkbox unchecked', async () => {

			const element = await TestUtils.render(Checkbox.tag, { checked: false });
			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeFalse();
		});

		it('renders the checkbox checked', async () => {
			const element = await TestUtils.render(Checkbox.tag, { checked: true });
			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeTrue();
		});


		it('re-renders the checkbox when property \'checked\' changed', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeFalse();
			element.checked = true;
			expect(input.checked).toBeTrue();
		});

		it('re-renders the checkbox when attribute \'checked\' changed', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			const input = element.shadowRoot.querySelector('input');
			expect(input.checked).toBeFalse();
			element.setAttribute('checked', 'true');
			expect(element.checked).toBeTrue();
			expect(input.checked).toBeTrue();
		});
	});

	describe('when initialized with \'title\' attribute', () => {

		it('renders the title', async () => {

			const element = await TestUtils.render(Checkbox.tag, { title: 'someTitle' });
			const label = element.shadowRoot.querySelector('label');
			expect(label.title).toBe('someTitle');
		});

		it('re-renders the checkbox when property \'title\' changed', async () => {

			const element = await TestUtils.render(Checkbox.tag);

			const label = element.shadowRoot.querySelector('label');
			expect(label.title).toBe('');

			element.title = 'someTitle';

			expect(label.title).toBe('someTitle');
		});

		it('re-renders the checkbox when attribute \'title\' changed', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			const label = element.shadowRoot.querySelector('label');
			expect(label.title).toBe('');
			element.setAttribute('title', 'someTitle');
			expect(label.title).toBe('someTitle');
		});
	});
	describe('when clicked', () => {

		it('calls the onToggle callback via property callback', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			element.onToggle = jasmine.createSpy();

			element.click();

			expect(element.onToggle).toHaveBeenCalled();
			expect(element.checked).toBeTrue();
		});

		it('calls the onToggle callback via attribute callback', async () => {

			spyOn(window, 'alert');
			const element = await TestUtils.render(Checkbox.tag, { onToggle: 'alert(\'called\')' });
			element.onToggle = jasmine.createSpy();

			element.click();

			expect(window.alert).toHaveBeenCalledWith('called');
			expect(element.checked).toBeTrue();
		});

		it('does nothing when disabled', async () => {
			const element = await TestUtils.render(Checkbox.tag, { disabled: true });
			element.onClick = jasmine.createSpy();

			element.click();

			expect(element.onClick).not.toHaveBeenCalled();
			expect(element.checked).toBeFalse();
		});
	});
});
