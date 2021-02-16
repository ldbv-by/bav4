/* eslint-disable no-undef */

import { MapInfo } from '../../../../../src/modules/footer/components/mapInfo/MapInfo';
import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { $injector } from '../../../../../src/injection';
import { OlCoordinateService } from '../../../../../src/services/OlCoordinateService';
import { changeZoom, updatePointerPosition } from '../../../../../src/modules/map/store/position.action';






import { TestUtils } from '../../../../test-utils.js';
window.customElements.define(MapInfo.tag, MapInfo);



const setupStoreAndDi = (state) => {
	TestUtils.setupStoreAndDi(state, { position: positionReducer });

	$injector
		.register('CoordinateService', OlCoordinateService);
	$injector
		.registerSingleton('MapService', { getSridsForView: () => {
			return [4326, 25832]; 
		}, getSrid: () => {
			return [3857]; 
		} } );
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
		it('adds a div which shows coordinate select and coordinate display', async () => {

			setupStoreAndDi({
				position: {
					zoom: 5,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);

			expect(element.shadowRoot.querySelector('select')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.select-coord-option')[0].value).toEqual('4326');
			expect(element.shadowRoot.querySelectorAll('.select-coord-option')[1].value).toEqual('25832');
			expect(element.shadowRoot.querySelectorAll('.select-coord-option')[2].value).toEqual('3857');

			// coordinates are shown after the pointer is moved, so initial there are no coordinates visible
			updatePointerPosition([1211817.6233080907, 6168328.021915435]); 
			expect(element.shadowRoot.innerHTML.includes('1211817.623, 6168328.022')).toBeTruthy();
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

		it('updates the div which shows the current pointer position', async () => {
			setupStoreAndDi({
				position: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);
			expect(element.shadowRoot.querySelector('.labels')).toBeTruthy();
			expect(element.shadowRoot.querySelector('select').value).toEqual('3857');

			updatePointerPosition([1211817.6233080907, 6168328.021915435]); 

			expect(element.shadowRoot.innerHTML.includes('1211817')).toBeTruthy();
		});

		it('updates the coordinates on selection change', async () => {
			setupStoreAndDi({
				position: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);

			updatePointerPosition([1211817.6233080907, 6168328.021915435]); 
			expect(element.shadowRoot.querySelector('.labels')).toBeTruthy();
			expect(element.shadowRoot.innerHTML.includes('1211817.623, 6168328.022')).toBeTruthy();

			// change to '4326'
			const select = element.shadowRoot.querySelector('select');
			select.value = '4326';
			select.dispatchEvent(new Event('change'));
			element.render();
			expect(element.shadowRoot.innerHTML.includes('10.886, 48.368')).toBeTruthy();

			// change to '25832'
			select.value = '25832';
			select.dispatchEvent(new Event('change'));
			element.render();
			expect(element.shadowRoot.innerHTML.includes('639675.996, 5358942.428')).toBeTruthy();
		});
	});

	describe('on map click', () => {

		it('shows an alert', async () => {
			setupStoreAndDi({
				position: {
					zoom: 10,
					pointerPosition: [1288239.2412306187, 6130212.561641981]
				}
			});

			element = await TestUtils.render(MapInfo.tag);

			spyOn(window, 'alert');
			// trigger map_clicked event
			window.dispatchEvent(new CustomEvent('map_clicked', { detail: [1288239.2412306187, 6130212.561641981], bubbles: true }));

			expect(window.alert).toHaveBeenCalledWith('click @ 11.572, 48.140');
		});
	});
});
