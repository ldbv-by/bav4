/* eslint-disable no-undef */

import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { fromLonLat } from 'ol/proj';
import { ZoomToExtentButton } from '../../../../../src/modules/map/components/zoomButtons/ZoomToExtentButton';

window.customElements.define(ZoomToExtentButton.tag, ZoomToExtentButton);


describe('ExtentButton', () => {
	let element, state/*, store*/;

	beforeEach(async () => {

		state = {
			position: {
				zoom: 14,
				center: fromLonLat([9.604, 50.015]), 
				fitRequest: null
			}
		};

		/*store = */TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

		element = await TestUtils.render(ZoomToExtentButton.tag);
	});

	describe('when initialized', () => {
		it('shows zoom to extent button', async () => {
			expect(element.shadowRoot.querySelector('.zoom-to-extent')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.zoom-to-extent-button').title).toBe('map_zoom_extent_button');
			expect(element.shadowRoot.querySelector('.icon')).toBeTruthy();	
		});
	});

	// describe('when clicked', () => {

	// 	it('zooms to extent', async (done) => {
	// 		element.shadowRoot.querySelector('button').click();
	// 		setTimeout(function(){
	// 			expect(store.getState().position.zoom).toBe(8); 				
	// 			done();
	// 		}, 500);
	// 	});
	// });
});
