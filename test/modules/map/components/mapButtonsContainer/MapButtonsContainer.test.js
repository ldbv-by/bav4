import { MapButtonsContainer } from '../../../../../src/modules/map/components/mapButtonsContainer/MapButtonsContainer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';

window.customElements.define(MapButtonsContainer.tag, MapButtonsContainer);



describe('MapButtonsContainer', () => {


	const setup = (state = {}) => {
		const initialState = {
			media: {
				portrait: false,
				minWidth: true
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState);
		$injector
			.registerSingleton('EnvironmentService', {});
		return TestUtils.render(MapButtonsContainer.tag);
	};

	describe('when initialized', () => {
		it('adds a div which contains map buttons', async () => {

			const element = await setup();

			expect(element.shadowRoot.querySelector('div').children).toHaveSize(4);
			expect(element.shadowRoot.querySelectorAll('ba-rotation-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-geolocation-button')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-zoom-buttons')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-extent-button')).toHaveSize(1);
		});
	});

	describe('responsive layout ', () => {

		it('layouts for landscape and width >= 80em', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeFalsy();

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('block');
		});

		it('layouts for portrait and width >= 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeFalsy();

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
		});

		it('layouts for landscape and width < 80em', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
		});

		it('layouts for portrait and layouts for width < 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelector('.is-portrait')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.is-landscape')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-desktop')).toBeFalsy();
			expect(element.shadowRoot.querySelector('.is-tablet')).toBeTruthy();

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
		});
	});
});
