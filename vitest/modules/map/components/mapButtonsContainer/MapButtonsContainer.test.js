import { MapButtonsContainer } from '@src/modules/map/components/mapButtonsContainer/MapButtonsContainer';
import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection';

window.customElements.define(MapButtonsContainer.tag, MapButtonsContainer);

describe('MapButtonsContainer', () => {
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;
		const initialState = {
			media: {
				portrait: false,
				minWidth: true
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState);
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed
		});
		return TestUtils.render(MapButtonsContainer.tag);
	};

	describe('when initialized', () => {
		it('adds a div which contains map buttons', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('div').children).toHaveLength(5);
			expect(element.shadowRoot.querySelectorAll('ba-rotation-button')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-geolocation-button')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-zoom-buttons')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-extent-button')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-three-dimension-button')).toHaveLength(1);
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

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(0);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-rotation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-geolocation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-three-dimension-button')).display).toBe('block');
		});

		it('layouts for portrait and width >= 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(0);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-rotation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-geolocation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-three-dimension-button')).display).toBe('none');
		});

		it('layouts for landscape and width < 80em', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(1);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-rotation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-geolocation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-three-dimension-button')).display).toBe('block');
		});

		it('layouts for portrait and layouts for width < 80em', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(1);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-rotation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-geolocation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-three-dimension-button')).display).toBe('none');
		});
	});

	describe('embedded layout ', () => {
		it('layouts for default mode', async () => {
			const element = await setup({}, { embed: false });

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveLength(0);
		});

		it('layouts for embedded mode', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveLength(1);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-rotation-button')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-geolocation-button')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-three-dimension-button')).display).toBe('none');
		});
	});
});
