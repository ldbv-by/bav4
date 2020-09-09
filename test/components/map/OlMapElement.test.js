/* eslint-disable no-undef */
import { OlMapElement } from '../../../src/components/map/OlMapElement';
import { createMockStore } from 'redux-test-utils';
import { $injector } from '../../../src/injection';
import { fromLonLat } from 'ol/proj';





import { TestUtils } from '../../test-utils.js';
window.customElements.define(OlMapElement.tag, OlMapElement);


describe('OlMapElement', () => {

	const initialPosition = fromLonLat([11.57245, 48.14021]);

	beforeAll(() => {
		window.classUnderTest = OlMapElement.name;

	});

	afterAll(() => {
		window.classUnderTest = undefined;

	});


	const setupDi = () => {


		const state = {
			map: {
				zoom: 10,
				position: initialPosition
			}
		};
		const mockedStore = createMockStore(state);

		const storeService = {
			getStore: function () {
				return mockedStore;
			}
		};


		$injector
			.reset()
			.registerSingleton('StoreService', storeService);
	};

	let element;
	beforeEach(async () => {
		setupDi();

		element = await TestUtils.render(OlMapElement.tag);
	});

	describe('when initialized', () => {
		it('configures the map and add a div which contains the ol-map', async () => {
			expect(element.view.getZoom()).toBe(10);
			expect(element.view.getCenter()).toEqual(initialPosition);

			expect(element.querySelector('#ol-map')).toBeTruthy();
		});


	});
});
