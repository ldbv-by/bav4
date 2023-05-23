import { TestUtils } from '../../../test-utils.js';
import { MvuListItem } from '../../../../src/modules/examples/components/MvuListItem.js';

window.customElements.define(MvuListItem.tag, MvuListItem);

describe('Button', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('MvuListItem', () => {
		it('should render the view', async () => {
			const element = await TestUtils.render(MvuListItem.tag);

			//view
			const button = element.shadowRoot.querySelector('button');
			expect(button.innerText).toBe('remove');
		});

		it('should contain default values in the model', async () => {
			const element = await TestUtils.render(MvuListItem.tag);

			//model
			expect(element.label).toBe('initial_label');
		});

		it('should update the label property with signal', async () => {
			const element = await TestUtils.render(MvuListItem.tag);

			element.signal('Update_Label', 'ba');

			expect(element.label).toBe('ba');
		});

		it('should update the label property with set', async () => {
			const element = await TestUtils.render(MvuListItem.tag);

			element.label = 'ba';
			const span = element.shadowRoot.querySelector('.ba-topic-label');

			expect(span.innerText).toBe('ba');
		});

		it('should call the click event of the button element', async () => {
			const element = await TestUtils.render(MvuListItem.tag);

			const button = element.shadowRoot.querySelector('button');
			button.dispatchEvent(new MouseEvent('click'));

			expect(element.label).toBe('initial_label');
		});

		it('fires a "remove" event', async () => {
			const element = await TestUtils.render(MvuListItem.tag);
			const spy = jasmine.createSpy();
			element.addEventListener('remove', spy);
			const button = element.shadowRoot.querySelector('button');

			button.click();

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: 'initial_label' }));
		});
	});
});
