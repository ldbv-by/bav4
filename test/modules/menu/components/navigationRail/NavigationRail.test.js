/* eslint-disable no-undef */

import { NavigationRail } from '../../../../../src/modules/menu/components/navigationRail/NavigationRail';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { navigationRailReducer } from '../../../../../src/store/navigationRail/navigationRail.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer';
import { featureInfoReducer } from '../../../../../src/store/featureInfo/featureInfo.reducer';
import { routingReducer } from '../../../../../src/store/routing/routing.reducer';
import { TabIds } from '../../../../../src/domain/mainMenu';

window.customElements.define(NavigationRail.tag, NavigationRail);

describe('NavigationRail', () => {
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};

	let store;
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;

		const initialState = {
			navigationRail: {
				openNav: false,
				visitedTabIdsSet: new Set([])
			},
			media: {
				portrait: false,
				minWidth: false
			},
			mainMenu: {
				open: true,
				tab: null
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			navigationRail: navigationRailReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			featureInfo: featureInfoReducer,
			routing: routingReducer
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return TestUtils.render(NavigationRail.tag);
	};

	describe('when instantiated', () => {
		it('has a model with default values', async () => {
			await setup();
			const model = new NavigationRail().getModel();
			expect(model).toEqual({
				isOpenNav: false,
				tabIndex: null,
				isPortrait: false,
				visitedTabIdsSet: null
			});
		});
	});

	describe('when initialized', () => {
		it('adds closed navigationRail for landscape mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);

			expect(element.shadowRoot.querySelectorAll('.home')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.home')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.home')).order).toBe('0');

			expect(element.shadowRoot.querySelectorAll('.separator')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).order).toBe('1');

			expect(element.shadowRoot.querySelectorAll('.routing')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.objectinfo')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.zoom-in')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-in')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.zoom-out')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-out')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.zoom-to-extent')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-to-extent')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.close')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.close')).display).toBe('none');
		});

		it('adds closed navigationRail for portrait mode', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);

			expect(element.shadowRoot.querySelectorAll('.home')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.home')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.home')).order).toBe('0');

			expect(element.shadowRoot.querySelectorAll('.separator')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).display).toBe('none');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).order).toBe('1');

			expect(element.shadowRoot.querySelectorAll('.routing')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.objectinfo')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.zoom-in')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-in')).display).toBe('flex');

			expect(element.shadowRoot.querySelectorAll('.zoom-out')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-out')).display).toBe('flex');

			expect(element.shadowRoot.querySelectorAll('.zoom-to-extent')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-to-extent')).display).toBe('flex');

			expect(element.shadowRoot.querySelectorAll('.close')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.close')).display).toBe('flex');
		});

		it('adds open navigationRail for landscape mode width active routing', async () => {
			const state = {
				media: { portrait: false, minWidth: false },
				mainMenu: {
					open: true,
					tab: TabIds.ROUTING
				},
				navigationRail: {
					openNav: true,
					visitedTabIdsSet: new Set([TabIds.ROUTING])
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.routing.is-active')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).order).toBe('2');

			expect(element.shadowRoot.querySelectorAll('.objectinfo')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).display).toBe('none');
		});

		it('adds open navigationRail for landscape mode width active objectinfo', async () => {
			const state = {
				media: { portrait: false, minWidth: false },
				mainMenu: {
					open: true,
					tab: TabIds.FEATUREINFO
				},
				navigationRail: {
					openNav: true,
					visitedTabIdsSet: new Set([TabIds.ROUTING, TabIds.FEATUREINFO])
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).order).toBe('2');

			expect(element.shadowRoot.querySelectorAll('.routing')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).order).toBe('3');
		});

		it('change active button on click', async () => {
			const state = {
				media: { portrait: false, minWidth: false },
				mainMenu: {
					open: true,
					tab: TabIds.FEATUREINFO
				},
				navigationRail: {
					openNav: true,
					visitedTabIdsSet: new Set([TabIds.ROUTING, TabIds.FEATUREINFO])
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.routing.is-active')).toHaveSize(0);
			expect(store.getState().mainMenu.tab).toBe(TabIds.FEATUREINFO);

			const button = element.shadowRoot.querySelector('.routing');
			button.click();

			expect(element.shadowRoot.querySelectorAll('.routing.is-active')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(0);
			expect(store.getState().mainMenu.tab).toBe(TabIds.ROUTING);
		});

		it('change darkSchema on click', async () => {
			const state = {
				media: { portrait: false, minWidth: false, darkSchema: false },
				navigationRail: {
					openNav: true,
					visitedTabIdsSet: new Set([TabIds.ROUTING, TabIds.FEATUREINFO])
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.theme-toggle.pointer')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.sun')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.moon')).toHaveSize(1);
			expect(store.getState().media.darkSchema).toBeFalse();

			const button = element.shadowRoot.querySelector('.theme-toggle');
			button.click();

			expect(element.shadowRoot.querySelectorAll('.sun')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.moon')).toHaveSize(0);
			expect(store.getState().media.darkSchema).toBeTrue();
		});
	});

	it('renders nothing when embedded', async () => {
		const element = await setup({}, { embed: true });

		expect(element.shadowRoot.children.length).toBe(0);
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
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
		});
		it('layouts with open main menu for portrait mode', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: false
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
		});
		it('layouts with open main menu for tablet mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: false
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
		});
	});
});
