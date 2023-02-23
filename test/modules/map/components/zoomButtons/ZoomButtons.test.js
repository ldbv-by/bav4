/* eslint-disable no-undef */

import { ZoomButtons } from '../../../../../src/modules/map/components/zoomButtons/ZoomButtons';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
window.customElements.define(ZoomButtons.tag, ZoomButtons);

let store;

describe('ZoomButtons', () => {
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};
	let element;

	beforeEach(async () => {
		const state = {
			position: {
				zoom: 10
			}
		};

		store = TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('MapService', mapServiceMock);

		element = await TestUtils.render(ZoomButtons.tag);
	});

	describe('when initialized', () => {
		it('adds a div which shows two zoom buttons', async () => {
			expect(element.shadowRoot.querySelector('.zoom-in')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.zoom-in').parentElement.title).toBe('map_zoomButtons_in');
			expect(element.shadowRoot.querySelector('.zoom-out')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.zoom-out').parentElement.title).toBe('map_zoomButtons_out');
		});
	});

	describe('when clicked', () => {
		it('decreases the current zoom level by one', () => {
			element.shadowRoot.querySelector('.zoom-out').click();
			expect(store.getState().position.zoom).toBe(9);
		});

		it('increases the current zoom level by one', () => {
			element.shadowRoot.querySelector('.zoom-in').click();
			expect(store.getState().position.zoom).toBe(11);
		});
	});
});
