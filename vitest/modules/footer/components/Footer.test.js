import { Footer } from '@src/modules/footer/components/Footer';
import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection';
import { createNoInitialStateMainMenuReducer } from '@src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '@src/store/media/media.reducer';
import { createNoInitialStateNavigationRailReducer } from '@src/store/navigationRail/navigationRail.reducer';
import { BaseLayerContainer } from '@src/modules/baseLayer/components/container/BaseLayerContainer';
import { toggle as toggleMainMenu } from '@src/store/mainMenu/mainMenu.action';

window.customElements.define(Footer.tag, Footer);

describe('Footer', () => {
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;

		const initialState = {
			mainMenu: {
				open: true
			},
			navigationRail: {
				open: false
			},
			media: {
				portrait: false,
				minWidth: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, {
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			navigationRail: createNoInitialStateNavigationRailReducer()
		});
		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed
		});

		return TestUtils.render(Footer.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new Footer().getModel();

			expect(model).toEqual({
				isOpen: false,
				isPortrait: false,
				hasMinWidth: false,
				isOpenNavigationRail: false
			});
		});
	});

	describe('when initialized', () => {
		it('removes a preload css class', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.preload')).toHaveLength(0);
		});

		it('adds footer elements and css classes for landscape mode', async () => {
			const element = await setup({}, { portrait: false });

			expect(element.shadowRoot.querySelectorAll('.footer')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.scale')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.scale')).toHaveLength(1);
			expect(element.shadowRoot.querySelector(`.scale`).getAttribute('part')).toBe('scale');
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-attribution-info')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveLength(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).height).toBe('1px');
		});

		it('toggle the main menu shows and hides the BaseLayerContainer', async () => {
			const state = {
				mainMenu: {
					open: false
				},
				media: {
					portrait: false,
					minWidth: true
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveLength(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).height).not.toBe('1px');

			toggleMainMenu();
			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).height).toBe('1px');

			toggleMainMenu();

			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).height).not.toBe('1px');
		});
	});

	describe('responsive layout ', () => {
		it('layouts with open main menu for landscape mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);

			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveLength(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('flex');
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveLength(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector(BaseLayerContainer.tag)).height).toBe('1px');
		});

		it('layouts with open main menu for portrait mode', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(0);

			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveLength(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveLength(0);
		});

		it('layouts with open main menu for tablet mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveLength(1);

			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveLength(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveLength(1);
		});

		it('layouts with open navigation rail for portrait mode', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				},
				navigationRail: {
					open: true
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveLength(0);
		});

		it('layouts open navigation rail for landscape mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				},
				navigationRail: {
					open: true
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveLength(1);
		});
	});

	describe('embedded layout ', () => {
		it('layouts for default mode', async () => {
			const element = await setup({ media: { portrait: false, minWidth: true } }, { embed: false });

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveLength(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content ba-privacy-policy')).display).toBe('none');
			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveLength(1);
		});

		it('layouts for embedded mode', async () => {
			const element = await setup(
				{
					media: { portrait: false, minWidth: true },
					navigationRail: {
						open: true
					}
				},
				{ embed: true }
			);

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveLength(0);
			expect(element.shadowRoot.querySelectorAll(BaseLayerContainer.tag)).toHaveLength(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content ba-map-info')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content ba-privacy-policy')).display).toBe('block');
		});
	});
});
