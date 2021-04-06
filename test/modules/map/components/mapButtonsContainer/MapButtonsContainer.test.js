import { MapButtonsContainer } from '../../../../../src/modules/map/components/mapButtonsContainer/MapButtonsContainer';
import { TestUtils } from '../../../../test-utils.js';
// import { $injector } from '../../../../../src/injection';

window.customElements.define(MapButtonsContainer.tag, MapButtonsContainer);



describe('MapButtonsContainer', () => {
	

	const setup = () => {
		TestUtils.setupStoreAndDi();
		return TestUtils.render(MapButtonsContainer.tag);
	};

	describe('when initialized', () => {
		it('adds a div which contains map buttons', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('ba-geolocation-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-zoom-buttons')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-extent-button')).toBeTruthy();
		});
	});
});
