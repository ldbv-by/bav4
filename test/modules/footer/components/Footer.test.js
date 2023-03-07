/* eslint-disable no-undef */

import { Footer } from '../../../../src/modules/footer/components/Footer';
import { TestUtils } from '../../../test-utils.js';
import { $injector } from '../../../../src/injection';
import { createNoInitialStateMainMenuReducer } from '../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateMediaReducer } from '../../../../src/store/media/media.reducer';

window.customElements.define(Footer.tag, Footer);

describe('Footer', () => {
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;

		const initialState = {
			mainMenu: {
				open: true
			},
			media: {
				portrait: false,
				minWidth: false
			},
			...state
		};

		TestUtils.setupStoreAndDi(initialState, { mainMenu: createNoInitialStateMainMenuReducer(), media: createNoInitialStateMediaReducer() });
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
				hasMinWidth: false
			});
		});
	});

	describe('when initialized', () => {
		it('removes a preload css class', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.preload')).toHaveSize(0);
		});

		it('adds footer elements and css classes for landscape mode', async () => {
			const element = await setup({}, { portrait: false });

			expect(element.shadowRoot.querySelectorAll('.footer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-attribution-info')).toHaveSize(1);
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

			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.footer.is-open')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('block');
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveSize(1);
		});

		it('layouts with open main menu for portrait mode', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);

			expect(element.shadowRoot.querySelectorAll('.footer.is-open')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveSize(1);
		});

		it('layouts with open main menu for tablet mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.footer.is-open')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.content')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('none');
			expect(element.shadowRoot.querySelectorAll('ba-map-info')).toHaveSize(1);
		});
	});

	describe('embedded layout ', () => {
		it('layouts for default mode', async () => {
			const element = await setup({ media: { portrait: false, minWidth: true } }, { embed: false });

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveSize(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('block');
		});

		it('layouts for embedded mode', async () => {
			const element = await setup({ media: { portrait: false, minWidth: true } }, { embed: true });

			expect(element.shadowRoot.querySelectorAll('.is-embedded')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.content')).display).toBe('none');
		});
	});
});
