/* eslint-disable no-undef */
import { OlMap } from '../../../src/components/map/OlMap';
import { fromLonLat } from 'ol/proj';
import { TestUtils } from '../../test-utils.js';
import mapReducer from '../../../src/components/map/store/olMap.reducer';
window.customElements.define(OlMap.tag, OlMap);


describe('OlMap', () => {

	const initialPosition = fromLonLat([11.57245, 48.14021]);

	beforeAll(() => {
		window.classUnderTest = OlMap.name;

	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});


	let element;
	beforeEach(async () => {

		const state = {
			map: {
				zoom: 10,
				position: initialPosition
			}
		};

		TestUtils.setupStoreAndDi(state, { map: mapReducer });

		element = await TestUtils.render(OlMap.tag);
	});

	describe('when initialized', () => {
		it('configures the map and adds a div which contains the ol-map', async () => {
			expect(element.view.getZoom()).toBe(10);
			expect(element.view.getCenter()).toEqual(initialPosition);
			expect(element.querySelector('#ol-map')).toBeTruthy();
		});
	});
});
