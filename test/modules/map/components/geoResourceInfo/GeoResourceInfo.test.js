import { GeoResourceInfo } from '../../../../../src/modules/map/components/geoResourceInfo/GeoResourceInfo';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';


window.customElements.define(GeoResourceInfo.tag, GeoResourceInfo);

describe('GeoResourceInfo', () => {

	const setup = () => {	
		TestUtils.setupStoreAndDi();	
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(GeoResourceInfo.tag);
	};

	describe('when initialized', () => {
		it('renders GeoResourceInfo component', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.geo-rsrc-info')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.geo-rsrc-info').innerHTML).toContain('map_geoResourceInfo_label');
		});
	});
});