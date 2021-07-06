import { MapButtonsContainer } from '../../../../../src/modules/map/components/mapButtonsContainer/MapButtonsContainer';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(MapButtonsContainer.tag, MapButtonsContainer);



describe('MapButtonsContainer', () => {
	

	const setup = () => {
		TestUtils.setupStoreAndDi();
		return TestUtils.render(MapButtonsContainer.tag);
	};

	describe('when initialized', () => {
		it('adds a div which contains map buttons', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('div').children).toHaveSize(5);
			expect(element.shadowRoot.querySelectorAll('ba-rotation-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-geolocation-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-zoom-buttons')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-extent-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-info-button')).toHaveSize(1);
		});
	});
});
