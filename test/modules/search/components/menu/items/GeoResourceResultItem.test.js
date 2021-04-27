import { GeoResourceResultItem } from '../../../../../../src/modules/search/components/menu/items/geoResource/GeoResourceResultItem';
import { SearchResult, SearchResultTypes } from '../../../../../../src/modules/search/services/searchResult';
import { TestUtils } from '../../../../../test-utils.js';
window.customElements.define(GeoResourceResultItem.tag, GeoResourceResultItem);


describe('GeoResourceResultItem', () => {


	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});
	});

	describe('when initialized', () => {

		it('renders nothing when no data available', async () => {

			const element = await TestUtils.render(GeoResourceResultItem.tag);
			expect(element.shadowRoot.children.length).toBe(0);
		});

		it('renders the view', async () => {
			const data = new SearchResult('id', 'label', 'labelFormated', SearchResultTypes.GEORESOURCE);
			const element = await TestUtils.render(GeoResourceResultItem.tag);

			element.data = data;

			expect(element.shadowRoot.querySelector('li').innerText).toBe('labelFormated');
		});
	});
});