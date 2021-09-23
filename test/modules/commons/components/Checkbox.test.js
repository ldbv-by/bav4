import { Checkbox } from '../../../../src/modules/commons/components/checkbox/Checkbox';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(Checkbox.tag, Checkbox);


describe('Checkbox', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});


	describe('when initialized', () => {

		it('contains default values in the model', async () => {

			const element = await TestUtils.render(Checkbox.tag);

			//model
			expect(element.disabled).toBeFalse();
			expect(element.checked).toBeFalse();
			expect(element.title).toBe('');
		});

		it('renders the view', async () => {

			const element = await TestUtils.render(Checkbox.tag, {}, '<span>some</span>');

			//view
			expect(element.shadowRoot.querySelector('.ba-checkbox')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.input').disabled).toBeFalse();
			expect(element.shadowRoot.querySelector('.input').checked).toBeFalse();
			expect(element.shadowRoot.querySelector('label').title).toBe('');
			//has slot tag?
			expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
			//has slot assigned content?
			expect(element.shadowRoot.querySelector('slot').assignedNodes().length).toBe(1);
		});
	});

	describe('when property\'disabled\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.disabled).toBeFalse();

			element.disabled = true;

			expect(input.disabled).toBeTrue();

			element.disabled = false;

			expect(input.disabled).toBeFalse();
		});
	});

	describe('when property\'checked\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			const input = element.shadowRoot.querySelector('input');

			expect(input.checked).toBeFalse();

			element.checked = true;

			expect(input.checked).toBeTrue();

			element.checked = false;

			expect(input.checked).toBeFalse();
		});
	});

	describe('when property\'title\' changes', () => {

		it('updates the view', async () => {

			const element = await TestUtils.render(Checkbox.tag);
			const label = element.shadowRoot.querySelector('label');

			expect(label.title).toBe('');

			element.title = 'foo';

			expect(label.title).toBe('foo');
		});
	});


	describe('event handling', () => {

		describe('on click', () => {

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
				const element = await TestUtils.render(Checkbox.tag);
				element.disabled = true;
				element.onClick = jasmine.createSpy();

				element.click();

				expect(element.onClick).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});

		describe('on keyboad ENTER', () => {

			const event = new KeyboardEvent('keydown', {
				key: 'Enter'
			});

			it('calls the onToggle callback via property callback', async () => {

				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = jasmine.createSpy();

				element.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'F12'
				}));

				expect(element.onToggle).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});

			it('calls the onToggle callback via property callback', async () => {

				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = jasmine.createSpy();

				element.dispatchEvent(event);

				expect(element.onToggle).toHaveBeenCalled();
				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via attribute callback', async () => {

				spyOn(window, 'alert');
				const element = await TestUtils.render(Checkbox.tag, { onToggle: 'alert(\'called\')' });
				element.onToggle = jasmine.createSpy();

				element.dispatchEvent(event);

				expect(window.alert).toHaveBeenCalledWith('called');
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(Checkbox.tag);
				element.disabled = true;
				element.onClick = jasmine.createSpy();

				element.dispatchEvent(event);

				expect(element.onClick).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});

		describe('on keyboad SPACE', () => {

			const event = new KeyboardEvent('keydown', {
				key: ' '
			});

			it('calls the onToggle callback via property callback', async () => {

				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = jasmine.createSpy();

				element.dispatchEvent(new KeyboardEvent('keydown', {
					key: 'F12'
				}));

				expect(element.onToggle).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});

			it('calls the onToggle callback via property callback', async () => {

				const element = await TestUtils.render(Checkbox.tag);
				element.onToggle = jasmine.createSpy();

				element.dispatchEvent(event);

				expect(element.onToggle).toHaveBeenCalled();
				expect(element.checked).toBeTrue();
			});

			it('calls the onToggle callback via attribute callback', async () => {

				spyOn(window, 'alert');
				const element = await TestUtils.render(Checkbox.tag, { onToggle: 'alert(\'called\')' });
				element.onToggle = jasmine.createSpy();

				element.dispatchEvent(event);

				expect(window.alert).toHaveBeenCalledWith('called');
				expect(element.checked).toBeTrue();
			});

			it('does nothing when disabled', async () => {
				const element = await TestUtils.render(Checkbox.tag, { disabled: true });
				element.disabled = true;
				element.onClick = jasmine.createSpy();

				element.dispatchEvent(event);

				expect(element.onClick).not.toHaveBeenCalled();
				expect(element.checked).toBeFalse();
			});
		});

	});
});
