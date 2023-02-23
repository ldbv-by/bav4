/* eslint-disable no-undef */

import { MapInfo } from '../../../../../src/modules/footer/components/mapInfo/MapInfo';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../test-utils.js';
window.customElements.define(MapInfo.tag, MapInfo);

const setupStoreAndDi = (state) => {
	TestUtils.setupStoreAndDi(state, { position: positionReducer });
};

describe('MapInfo', () => {
	let element;

	describe('when initialized', () => {
		it('adds a div which shows theme toggle and coordinate select', async () => {
			setupStoreAndDi({
				position: {
					zoom: 5,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);

			expect(element.shadowRoot.querySelector('ba-coordinate-select')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-base-layer-info')).toBeTruthy();
		});
	});
});
