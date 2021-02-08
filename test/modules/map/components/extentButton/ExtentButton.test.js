/* eslint-disable no-undef */

import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
// import { changePosition, changeZoom } from '../../../../../src/modules/map/store/olMap.action';
import { ExtentButton } from '../../../../../src/modules/map/components/extentButton/ExtentButton';

window.customElements.define(ExtentButton.tag, ExtentButton);


describe('ExtentButton', () => {
	let element, state;

	beforeEach(async () => {

		state = {
			position: {
				zoom: 5,
				center: [1254142.170686317, 6273726.299247982]
			}
		};

		TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

		element = await TestUtils.render(ExtentButton.tag);
	});

	describe('when initialized', () => {
		it('adds a div which shows an extent button', async () => {
			expect(element.shadowRoot.querySelector('.extent-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('ba-icon').title).toBe('map_extent_button');						
		});
	});

	// describe('when clicked', () => {

	// 	it('zooms to extent', () => {

	// 		element.shadowRoot.querySelector('.button').click();

	// 	});
	// });

	// describe('on position change', () => {

	// 	it('closes the popup', () => {
	// 		expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('hide');
	// 		expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeFalse();

	// 		element.shadowRoot.getElementById('info-popup').openPopup();

	// 		expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('show');
	// 		expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeTrue();

	// 		expect(store.getState().map.position).toEqual([1288239.2412306187, 6130212.561641981]); 

	// 		changePosition([1290570.5705933168, 6129218.880274274]);

	// 		expect(element.shadowRoot.getElementById('info-popup').getAttribute('type')).toBe('hide');
	// 		expect(element.shadowRoot.getElementById('info-popup').isOpen()).toBeFalse();
	// 	});
	// });
});
