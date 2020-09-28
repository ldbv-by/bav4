/* eslint-disable no-undef */

import { ZoomButtons } from '../../../../src/components/toolbox/zoomButtons/ZoomButtons';
import mapReducer from '../../../../src/store/map/reducer';
import { TestUtils } from '../../../test-utils.js';
window.customElements.define(ZoomButtons.tag, ZoomButtons);

let store;

describe('ZoomButtons', () => {
	let element;

	beforeAll(() => {
		window.classUnderTest = ZoomButtons.name;

	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});


	beforeEach(async () => {

		const state = {
			map: {
				zoom: 10
			}
		};

		store = TestUtils.setupStoreAndDi(state, { map:mapReducer });
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
