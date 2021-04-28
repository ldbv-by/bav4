import { GeoResouceResultsPanel } from '../../../../../src/modules/search/components/menu/types/geoResource/GeoResourceResultsPanel';
import { LocationResultsPanel } from '../../../../../src/modules/search/components/menu/types/location/LocationResultsPanel';
import { SearchResultsPanel } from '../../../../../src/modules/search/components/menu/SearchResultsPanel';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(SearchResultsPanel.tag, SearchResultsPanel);

describe('SearchResultsPanel', () => {

	const setup = () => {
		TestUtils.setupStoreAndDi();
		return TestUtils.render(SearchResultsPanel.tag);
	};


	describe('when initialized', () => {

		it('renders the view', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.search-results-panel')).toBeTruthy();
			expect(element.shadowRoot.querySelector(LocationResultsPanel.tag)).toBeTruthy();
			expect(element.shadowRoot.querySelector(GeoResouceResultsPanel.tag)).toBeTruthy();
		});
	});
});
