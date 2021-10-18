import { TestUtils } from '../../../../test-utils.js';
import { MvuTopicItem } from '../../../../../src/modules/commons/components/examples/MvuTopicItem.js';

window.customElements.define(MvuTopicItem.tag, MvuTopicItem);

describe('Button', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('MvuTopicItem', () => {

		it('should render the view', async () => {

			const element = await TestUtils.render(MvuTopicItem.tag);

			//view
			const button = element.shadowRoot.querySelector('button');
			expect(button.innerText).toBe('remove');
		});

		it('should contain default values in the model', async () => {

			const element = await TestUtils.render(MvuTopicItem.tag);

			//model
			expect(element.label).toBe('initial_label');
		});

		it('should update the label property with signal', async () => {

			const element = await TestUtils.render(MvuTopicItem.tag);

			element.signal('Update_Label', 'ba');

			expect(element.label).toBe('ba');
		});

		it('should update the label property with set', async () => {

			const element = await TestUtils.render(MvuTopicItem.tag);

			element.label = 'ba';
			const span = element.shadowRoot.querySelector('.ba-topic-label');

			expect(span.innerText).toBe('ba');
		});

		it('should call the click event of the button element', async () => {

			const element = await TestUtils.render(MvuTopicItem.tag);

			const button = element.shadowRoot.querySelector('button');
			button.dispatchEvent(new MouseEvent('click'));

			expect(element.label).toBe('initial_label');
		});
	});
});
