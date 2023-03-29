/* eslint-disable no-undef */

import { MapInfo } from '../../../../../src/modules/footer/components/mapInfo/MapInfo';
import { TestUtils } from '../../../../test-utils.js';
window.customElements.define(MapInfo.tag, MapInfo);

describe('MapInfo', () => {
	const setup = async () => {
		TestUtils.setupStoreAndDi({});
		return TestUtils.render(MapInfo.tag);
	};

	describe('when initialized', () => {
		it('contains two child components', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('ba-coordinate-select')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-base-layer-info')).toHaveSize(1);
		});
	});
});
