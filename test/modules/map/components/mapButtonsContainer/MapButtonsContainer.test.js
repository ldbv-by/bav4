import { MapButtonsContainer } from '../../../../../src/modules/map/components/mapButtonsContainer/MapButtonsContainer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';

window.customElements.define(MapButtonsContainer.tag, MapButtonsContainer);

describe('MapButtonsContainer', () => {
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;
		const initialState = {
			media: {
				portrait: false,
				minWidth: true,
				embed: false
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

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);

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

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);

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

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);

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

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
		});
	});

	describe('embedded layout ', () => {
		it('layouts for default mode', async () => {
			const element = await setup({}, { embed: false });

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveSize(0);
		});

		it('layouts for embedded mode', async () => {
			const element = await setup({}, { embed: true });

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveSize(1);

			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-zoom-buttons')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-extent-button')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('ba-geolocation-button')).display).toBe('none');
		});
	});
});
