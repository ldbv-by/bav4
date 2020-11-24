/* eslint-disable no-undef */

import { MapInfo } from '../../../../src/components/footer/components/mapInfo/MapInfo';
import mapReducer from '../../../../src/components/map/store/olMap.reducer';
import { $injector } from '../../../../src/injection';
import { OlCoordinateService } from '../../../../src/utils/OlCoordinateService';
import { changeZoom } from '../../../../src/components/map/store/olMap.action';






import { TestUtils } from '../../../test-utils.js';
window.customElements.define(MapInfo.tag, MapInfo);

let store;

const setupStoreAndDi = (state) => {
	store = TestUtils.setupStoreAndDi(state, { map: mapReducer });

	$injector
		.register('CoordinateService', OlCoordinateService);
};


describe('MapInfo', () => {

	let element;
	beforeEach(async () => {

	});


	describe('when initialized', () => {
		it('adds a div which shows the initial zoom level 5', async () => {

			setupStoreAndDi({
				map: {
					zoom: 5,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);

			expect(element.shadowRoot.querySelector('.labels')).toBeTruthy();
			expect(element.shadowRoot.innerHTML.includes('ZoomLevel: 5')).toBeTruthy();
		});

		it('adds a div which shows some buttons', async () => {

			setupStoreAndDi({
				map: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);

			// try different approaches
			expect(element.shadowRoot.querySelectorAll('ba-button').length).toBe(4);
			expect(element.shadowRoot.querySelector('.buttons').childElementCount).toBe(4);
			expect(element.shadowRoot.querySelector('#button0')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#button1')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#button2')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#button3')).toBeTruthy();
		});
	});
	
	describe('when updated', () => {

		it('updates the div which shows the current zoom level', async () => {
			setupStoreAndDi({
				map: {
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

	describe('on map click', () => {

		it('shows an alert', async () => {
			setupStoreAndDi({
				map: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);


			element.shadowRoot.querySelector('#button0').click();

			spyOn(window, 'alert');
			// trigger map_clicked event
			window.dispatchEvent(new CustomEvent('map_clicked', { detail: [1288239.2412306187, 6130212.561641981], bubbles: true }));

			expect(window.alert).toHaveBeenCalledWith('click @ 11.572, 48.140');
		});
	});

	describe('on button0 click', () => {

		it('it changes the map center and zoom', async () => {
			setupStoreAndDi({
				map: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);
			// we call the onClick -Callback
			element.shadowRoot.querySelector('#button0').onClick.call();

			expect(store.getState().map.zoom).toBe(13);
		});
	});

	describe('on button1 click', () => {

		it('it changes the map center and zoom', async () => {
			setupStoreAndDi({
				map: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);
			// we call the onClick -Callback
			element.shadowRoot.querySelector('#button1').onClick.call();

			expect(store.getState().map.zoom).toBe(11);
		});
	});
});
