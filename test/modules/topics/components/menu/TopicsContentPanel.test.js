import { TopicsContentPanel } from '../../../../../src/modules/topics/components/menu/TopicsContentPanel';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(TopicsContentPanel.tag, TopicsContentPanel);

describe('TopicsContentPanel', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});
	
	describe('when initialized', () => {

		it('renders the view', async () => {

			const element = await TestUtils.render(TopicsContentPanel.tag);

			expect(element.shadowRoot.querySelector('.topics-content-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.topics-content-panel').textContent).toBe('TopicsContentPanel');
		});
	});
});
