/* eslint-disable no-undef */

import { MapInfoElement } from '../../../src/components/map-info/MapInfoElement';
// import { createMockStore } from 'redux-test-utils';
import { combineReducers, createStore } from 'redux';
// import { createStore } from 'redux';
import mapReducer from '../../../src/store/map/reducer';

import { $injector } from '../../../src/injection';
import { OlCoordinateService } from '../../../src/utils/OlCoordinateService';
import { changeZoom } from '../../../src/store/map/actions';






import { TestUtils } from '../../test-utils.js';
window.customElements.define(MapInfoElement.tag, MapInfoElement);

let store;

const setupStoreAndDi = (initialState) => {
	const state = {
		map: initialState
	};
	store = createStore(
		combineReducers({
			map: mapReducer
		}),
		state);

	const storeService = {
		getStore: function () {
			return store;
		}
	};


	$injector
		.reset()
		.register('CoordinateService', OlCoordinateService)
		.registerSingleton('StoreService', storeService);
};


describe('MapInfoElement', () => {
	beforeAll(() => {
		window.classUnderTest = MapInfoElement.name;

	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});



	let element;
	beforeEach(async () => {

		/*
		 * element = await TestUtils.render(MapInfoElement.tag);
		 * shadowRoot = element.shadowRoot;
		 * document.body.append(element);
		 */
	});


	describe('when initialized', () => {
		it('adds a div which shows the initial zoom level 5', async () => {

			setupStoreAndDi({
				zoom: 5,
				pointerPosition: [1288239.2412306187, 6130212.561641981]
			});

			element = await TestUtils.render(MapInfoElement.tag);

			expect(element.querySelector('.zoomLabel')).toBeTruthy();
			expect(element.innerHTML.includes('ZoomLevel: 5')).toBeTruthy();

		});

		it('adds a div which shows the initial zoom level 10', async () => {

			setupStoreAndDi({
				zoom: 10,
				pointerPosition: [1288239.2412306187, 6130212.561641981]
			});

			element = await TestUtils.render(MapInfoElement.tag);

			expect(element.querySelector('.zoomLabel')).toBeTruthy();
			expect(element.innerHTML.includes('ZoomLevel: 10')).toBeTruthy();

		});
	});
	describe('when updated', () => {

		it('updates the div which shows the current zoom level', async () => {
			setupStoreAndDi({
				zoom: 10,
				pointerPosition: [1288239.2412306187, 6130212.561641981]
			});

			element = await TestUtils.render(MapInfoElement.tag);
			expect(element.querySelector('.zoomLabel')).toBeTruthy();
			expect(element.innerHTML.includes('ZoomLevel: 10')).toBeTruthy();

			// trigger zoom event
			changeZoom(11);

			expect(element.innerHTML.includes('ZoomLevel: 11')).toBeTruthy();

		});

	});

	describe('when map click event fired', () => {

		it('shows an alert', async () => {
			setupStoreAndDi({
				zoom: 10,
				pointerPosition: [1288239.2412306187, 6130212.561641981]
			});
      
			element = await TestUtils.render(MapInfoElement.tag);
      
			spyOn(window, 'alert');
			// trigger map_clicked event
			window.dispatchEvent(new CustomEvent('map_clicked', { detail: [1288239.2412306187, 6130212.561641981], bubbles: true }));

			expect(window.alert).toHaveBeenCalledWith('click @ 11.572, 48.140');
		});

	});

});
