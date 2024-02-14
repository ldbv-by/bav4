/* eslint-disable no-undef */

import { NavigationRail } from '../../../../../src/modules/menu/components/navigationRail/NavigationRail';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { navigationRailReducer } from '../../../../../src/store/navigationRail/navigationRail.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer';
import { featureInfoReducer } from '../../../../../src/store/featureInfo/featureInfo.reducer';
import { routingReducer } from '../../../../../src/store/routing/routing.reducer';
import { TabIds } from '../../../../../src/domain/mainMenu';

window.customElements.define(NavigationRail.tag, NavigationRail);

describe('NavigationRail', () => {
	const extent = [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462];
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {},
		getDefaultMapExtent: () => {
			return extent;
		}
	};

	let store;
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;

		const initialState = {
			navigationRail: {
				open: false,
				visitedTabIds: []
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
			routing: routingReducer,
			position: positionReducer
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
				open: false,
				isOpenNavigationRail: false,
				tabIndex: null,
				isPortrait: false,
				visitedTabIds: null
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
			expect(element.shadowRoot.querySelector('.home .text').innerText).toBe('menu_navigation_rail_home');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.home')).order).toBe('0');

			expect(element.shadowRoot.querySelectorAll('.separator')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).order).toBe('1');

			expect(element.shadowRoot.querySelectorAll('.routing')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.routing .text').innerText).toBe('menu_navigation_rail_routing');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.objectinfo')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.objectinfo .text').innerText).toBe('menu_navigation_rail_object_info');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.zoom-in')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.zoom-in .text').innerText).toBe('menu_navigation_rail_zoom_in');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-in')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.zoom-out')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.zoom-out .text').innerText).toBe('menu_navigation_rail_zoom_out');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-out')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.zoom-to-extent')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.zoom-to-extent .text').innerText).toBe('menu_navigation_rail_zoom_to_extend');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.zoom-to-extent')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.close')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.close .text').innerText).toBe('menu_navigation_rail_close');
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
					open: true,
					visitedTabIds: [TabIds.ROUTING]
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.routing.is-active')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.routing.hide')).toHaveSize(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).order).toBe('2');

			expect(element.shadowRoot.querySelectorAll('.objectinfo')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.objectinfo.hide')).toHaveSize(1);
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
					open: true,
					visitedTabIds: [TabIds.ROUTING, TabIds.FEATUREINFO]
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);

			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.objectinfo')).order).toBe('2');

			expect(element.shadowRoot.querySelectorAll('.routing')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.routing.is-active')).toHaveSize(0);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('flex');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).order).toBe('3');
		});
	});

	describe('when clicked', () => {
		it('changes the active button', async () => {
			const state = {
				media: { portrait: false, minWidth: false },
				mainMenu: {
					open: true,
					tab: TabIds.FEATUREINFO
				},
				navigationRail: {
					open: true,
					visitedTabIds: [TabIds.ROUTING, TabIds.FEATUREINFO]
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

		it('changes the tab and opens the mainMenu', async () => {
			const state = {
				media: { portrait: false, minWidth: false },
				mainMenu: {
					open: false,
					tab: TabIds.MAPS
				},
				navigationRail: {
					open: true,
					visitedTabIds: [TabIds.FEATUREINFO]
				}
			};
			const element = await setup(state);

			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().mainMenu.open).toBeFalse();

			const objectinfoButton = element.shadowRoot.querySelector('.objectinfo');
			objectinfoButton.click();

			expect(store.getState().mainMenu.tab).toBe(TabIds.FEATUREINFO);
			expect(store.getState().mainMenu.open).toBeTrue();

			const homeButton = element.shadowRoot.querySelector('.home');
			homeButton.click();

			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().mainMenu.open).toBeTrue();
		});

		it('changes the schema', async () => {
			const state = {
				media: { portrait: false, minWidth: false, darkSchema: false },
				navigationRail: {
					open: true,
					visitedTabIds: [TabIds.ROUTING, TabIds.FEATUREINFO]
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

		it('closes the component', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				},
				navigationRail: {
					open: true,
					visitedTabIds: []
				}
			};
			const element = await setup(state);

			expect(store.getState().navigationRail.open).toBeTrue();
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);

			element.shadowRoot.querySelector('.close').click();

			expect(store.getState().navigationRail.open).toBeFalse();
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);
		});

		it('decreases the current zoom level by one', async () => {
			const state = {
				position: {
					zoom: 10
				},
				media: {
					portrait: true,
					minWidth: true
				}
			};
			const element = await setup(state);
			element.shadowRoot.querySelector('.zoom-out').click();
			expect(store.getState().position.zoom).toBe(9);
		});

		it('increases the current zoom level by one', async () => {
			const state = {
				position: {
					zoom: 10
				},
				media: {
					portrait: true,
					minWidth: true
				}
			};
			const element = await setup(state);
			element.shadowRoot.querySelector('.zoom-in').click();
			expect(store.getState().position.zoom).toBe(11);
		});

		it('zooms to extent', async () => {
			const state = {
				position: {
					zoom: 10
				},
				media: {
					portrait: true,
					minWidth: true
				}
			};
			const element = await setup(state);
			element.shadowRoot.querySelector('.zoom-to-extent').click();
			expect(store.getState().position.fitRequest.payload.extent).toEqual(extent);
			expect(store.getState().position.fitRequest.payload.options).toEqual({ useVisibleViewport: false });
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
