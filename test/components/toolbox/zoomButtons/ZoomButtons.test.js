/* eslint-disable no-undef */

import { ZoomButtons } from '../../../../src/components/toolbox/zoomButtons/ZoomButtons';
// import { createMockStore } from 'redux-test-utils';
import { combineReducers, createStore } from 'redux';
import mapReducer from '../../../../src/store/map/reducer';

import { $injector } from '../../../../src/injection';


import { TestUtils } from '../../../test-utils.js';
window.customElements.define(ZoomButtons.tag, ZoomButtons);

let store;

const setupStoreAndDi = (initialMapState) => {
	const state = {
		map: initialMapState
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
		.registerSingleton('StoreService', storeService);
};


describe('ZoomButtons', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = ZoomButtons.name;

	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});


	beforeEach(async () => {

		setupStoreAndDi({
			zoom: 10
		});

		element = await TestUtils.render(ZoomButtons.tag);
	});


	describe('when initialized', () => {
		it('adds a div which shows two zoom buttons', async () => {

			expect(element.querySelector('.zoom-in')).toBeTruthy();
			expect(element.querySelector('.zoom-out')).toBeTruthy();

		});

	});
	describe('when clicked', () => {

		it('decreases the current zoom level by one', () => {

			element.querySelector('.zoom-out').click();
			expect(store.getState().map.zoom).toBe(9);

		});

		it('increases the current zoom level by one', () => {

			element.querySelector('.zoom-in').click();
			expect(store.getState().map.zoom).toBe(11);

		});

	});
});
