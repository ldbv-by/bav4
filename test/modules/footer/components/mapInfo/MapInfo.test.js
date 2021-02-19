/* eslint-disable no-undef */

import { MapInfo } from '../../../../../src/modules/footer/components/mapInfo/MapInfo';
import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { $injector } from '../../../../../src/injection';
import { changeZoom } from '../../../../../src/modules/map/store/position.action';






import { TestUtils } from '../../../../test-utils.js';
window.customElements.define(MapInfo.tag, MapInfo);

const coordinateServiceMock = {
	stringify() { },
	toLonLat() { }

};

const setupStoreAndDi = (state) => {
	TestUtils.setupStoreAndDi(state, { position: positionReducer });

	$injector
		.registerSingleton('CoordinateService', coordinateServiceMock);
};


describe('MapInfo', () => {

	let element;

	describe('when initialized', () => {
		it('adds a div which shows the initial zoom level 5', async () => {

			setupStoreAndDi({
				position: {
					zoom: 5,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);

			expect(element.shadowRoot.querySelector('ba-theme-toggle')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.labels')).toBeTruthy();
			expect(element.shadowRoot.innerHTML.includes('ZoomLevel: 5')).toBeTruthy();
		});
	});
	

	describe('when updated', () => {

		it('updates the div which shows the current zoom level', async () => {
			setupStoreAndDi({
				position: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);
			expect(element.shadowRoot.querySelector('.labels')).toBeTruthy();
			expect(element.shadowRoot.innerHTML.includes('ZoomLevel: 10')).toBeTruthy();

			// trigger zoom event
			changeZoom(11);

			expect(element.shadowRoot.innerHTML.includes('ZoomLevel: 11')).toBeTruthy();
		});
	});
});
