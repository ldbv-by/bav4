import { LocationResultItem } from '../../../../../../../src/modules/search/components/menu/items/location/LocationResultItem';
import { SearchResult, SearchResultTypes } from '../../../../../../../src/services/domain/searchResult';
import { TestUtils } from '../../../../../../test-utils.js';
window.customElements.define(LocationResultItem.tag, LocationResultItem);


describe('LocationResultItem', () => {


	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {

		it('renders nothing when no data available', async () => {

			const element = await TestUtils.render(LocationResultItem.tag);
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the view', async () => {
			const data = new SearchResult('id', 'label', 'labelFormated', SearchResultTypes.LOCATION);
			const element = await TestUtils.render(LocationResultItem.tag);

			element.data = data;

			expect(element.shadowRoot.querySelector('li').innerText).toBe('labelFormated');
		});
	});
});