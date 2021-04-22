import { SearchContentPanel } from '../../../../../src/modules/search/components/menu/SearchContentPanel';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(SearchContentPanel.tag, SearchContentPanel);

describe('SearchContentPanel', () => {

	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});
	
	describe('when initialized', () => {

		it('renders the view', async () => {

			const element = await TestUtils.render(SearchContentPanel.tag);

			expect(element.shadowRoot.querySelector('.search-content-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.search-content-panel').textContent).toBe('SearchContentPanel');
		});
	});
});
