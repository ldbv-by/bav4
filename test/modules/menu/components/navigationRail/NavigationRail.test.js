/* eslint-disable no-undef */

import { NavigationRail } from '../../../../../src/modules/menu/components/navigationRail/NavigationRail';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { createNoInitialStateNavigationRailReducer } from '../../../../../src/store/navigationRail/navigationRail.reducer';
import { positionReducer } from '../../../../../src/store/position/position.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer';
import { featureInfoReducer } from '../../../../../src/store/featureInfo/featureInfo.reducer';
import { routingReducer } from '../../../../../src/store/routing/routing.reducer';
import { TabIds } from '../../../../../src/domain/mainMenu';
import { setTab } from '../../../../../src/store/mainMenu/mainMenu.action';
import { Tools } from '../../../../../src/domain/tools.js';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer.js';
import { authReducer } from '../../../../../src/store/auth/auth.reducer';
import { modalReducer } from '../../../../../src/store/modal/modal.reducer';
import { ToggleFeedbackPanel } from '../../../../../src/modules/feedback/components/toggleFeedback/ToggleFeedbackPanel';
import { closeModal } from '../../../../../src/store/modal/modal.action';

window.customElements.define(NavigationRail.tag, NavigationRail);

const authService = {
	isSignedIn: () => {},
	getRoles: () => {},
	signIn: () => {},
	signOut: () => {}
};

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
			auth: {
				signedIn: false
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			navigationRail: createNoInitialStateNavigationRailReducer(),
			mainMenu: createNoInitialStateMainMenuReducer(),
			media: createNoInitialStateMediaReducer(),
			featureInfo: featureInfoReducer,
			routing: routingReducer,
			position: positionReducer,
			tools: toolsReducer,
			modal: modalReducer,
			auth: authReducer
		});
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed
			})
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('AuthService', authService);

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
			expect(element.shadowRoot.querySelector('.home').title).toBe('menu_navigation_rail_home_tooltip');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.home')).order).toBe('0');

			expect(element.shadowRoot.querySelectorAll('.separator')).toHaveSize(1);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).display).toBe('block');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.separator')).order).toBe('1');

			expect(element.shadowRoot.querySelectorAll('.routing')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.routing .text').innerText).toBe('menu_navigation_rail_routing');
			expect(element.shadowRoot.querySelector('.routing').title).toBe('menu_navigation_rail_routing_tooltip');
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.routing')).display).toBe('none');

			expect(element.shadowRoot.querySelectorAll('.objectinfo')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('.objectinfo .text').innerText).toBe('menu_navigation_rail_object_info');
			expect(element.shadowRoot.querySelector('.objectinfo').title).toBe('menu_navigation_rail_object_info_tooltip');
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

			expect(element.shadowRoot.querySelectorAll('.sub-button-container')).toHaveSize(1);

			const feedbackButton = element.shadowRoot.querySelector('#feedback');
			expect(feedbackButton.title).toBe('menu_navigation_rail_feedback');
			expect(feedbackButton.querySelectorAll('.feedback .icon')).toHaveSize(1);

			const helpLink = element.shadowRoot.querySelector('#help');
			expect(helpLink.href).toContain('menu_navigation_rail_help_url');
			expect(helpLink.target).toBe('_blank');
			expect(helpLink.title).toBe('menu_navigation_rail_help');
			expect(helpLink.querySelectorAll('.help .icon')).toHaveSize(1);
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

			expect(window.getComputedStyle(element.shadowRoot.querySelector('.sub-button-container')).display).toBe('none');
		});

		it('has a signIn button', async () => {
			const element = await setup();

			const signedInButton = element.shadowRoot.querySelector('#authButton');
			expect(signedInButton.title).toBe('menu_navigation_rail_login');
			expect(signedInButton.classList.contains('logout')).toBeFalse();
			expect(signedInButton.querySelectorAll('.icon')).toHaveSize(1);
		});

		it('has a signOut button', async () => {
			const element = await setup({ auth: { signedIn: true } });

			const signedInButton = element.shadowRoot.querySelector('#authButton');
			expect(signedInButton.title).toBe('menu_navigation_rail_logout');
			expect(signedInButton.classList.contains('logout')).toBeTrue();
			expect(signedInButton.querySelectorAll('.icon')).toHaveSize(1);
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

		it('activates / deactivates a possible corresponding tool', async () => {
			const state = {
				media: { portrait: false, minWidth: false },
				mainMenu: {
					open: false,
					tab: TabIds.ROUTING
				},
				navigationRail: {
					open: true,
					visitedTabIds: [TabIds.FEATUREINFO]
				},
				tools: {
					current: Tools.ROUTING
				}
			};
			const element = await setup(state);

			expect(store.getState().mainMenu.tab).toBe(TabIds.ROUTING);
			expect(store.getState().tools.current).toBe(Tools.ROUTING);

			// the home button should not deactivate a current tool
			const homeButton = element.shadowRoot.querySelector('.home');
			homeButton.click();

			expect(store.getState().mainMenu.tab).toBe(TabIds.MAPS);
			expect(store.getState().tools.current).toBe(Tools.ROUTING);

			// the objectinfo button should deactivate an active tool
			const objectinfoButton = element.shadowRoot.querySelector('.objectinfo');
			objectinfoButton.click();

			expect(store.getState().mainMenu.tab).toBe(TabIds.FEATUREINFO);
			expect(store.getState().tools.current).toBeNull();

			// the routing button should activate the routing tool
			const routingButton = element.shadowRoot.querySelector('.routing');
			routingButton.click();

			expect(store.getState().mainMenu.tab).toBe(TabIds.ROUTING);
			expect(store.getState().tools.current).toBe(Tools.ROUTING);
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
			expect(element.shadowRoot.querySelector('.theme-toggle').title).toBe('menu_navigation_rail_dark_theme');
			expect(store.getState().media.darkSchema).toBeFalse();

			const button = element.shadowRoot.querySelector('.theme-toggle');
			button.click();

			expect(element.shadowRoot.querySelectorAll('.sun')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.moon')).toHaveSize(0);
			expect(element.shadowRoot.querySelector('.theme-toggle').title).toBe('menu_navigation_rail_light_theme');
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

		it('toggles routing tab', async () => {
			const state = {
				mainMenu: {
					open: false,
					tab: TabIds.TOPICS
				},
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

			expect(element.shadowRoot.querySelectorAll('.routing.is-active')).toHaveSize(0);
			setTab(TabIds.ROUTING);
			expect(element.shadowRoot.querySelectorAll('.routing.is-active')).toHaveSize(1);

			expect(store.getState().mainMenu.open).toBeFalse();

			element.shadowRoot.querySelector('.routing').click();

			expect(store.getState().mainMenu.open).toBeTrue();

			element.shadowRoot.querySelector('.routing').click();

			expect(store.getState().mainMenu.open).toBeFalse();
		});

		it('toggles featureInfo tab', async () => {
			const state = {
				mainMenu: {
					open: true,
					tab: TabIds.TOPICS
				},
				media: {
					portrait: false,
					minWidth: false
				},
				navigationRail: {
					open: true,
					visitedTabIds: []
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(0);
			setTab(TabIds.ROUTING);

			expect(store.getState().mainMenu.open).toBeTrue();

			element.shadowRoot.querySelector('.objectinfo').click();
			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(1);
			expect(store.getState().mainMenu.open).toBeTrue();

			element.shadowRoot.querySelector('.objectinfo').click();
			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(0);
			expect(store.getState().mainMenu.open).toBeFalse();

			element.shadowRoot.querySelector('.objectinfo').click();
			expect(store.getState().mainMenu.open).toBeTrue();
			expect(element.shadowRoot.querySelectorAll('.objectinfo.is-active')).toHaveSize(1);
		});

		it('opens the modal with the toggle-feedback component', async () => {
			const element = await setup();

			const feedbackButton = element.shadowRoot.querySelector('#feedback');
			feedbackButton.click();

			expect(store.getState().modal.data.title).toBe('menu_navigation_rail_feedback');
			expect(store.getState().modal.steps).toBe(2);
			const wrapperElement = TestUtils.renderTemplateResult(store.getState().modal.data.content);
			expect(wrapperElement.querySelectorAll(ToggleFeedbackPanel.tag)).toHaveSize(1);
			expect(wrapperElement.querySelector(ToggleFeedbackPanel.tag).onSubmit).toEqual(closeModal);
		});

		it('calls the AuthService to the login screen', async () => {
			const authServiceSpy = spyOn(authService, 'signIn');
			const element = await setup();
			const signedInButton = element.shadowRoot.querySelector('#authButton');

			signedInButton.click();

			expect(authServiceSpy).toHaveBeenCalled();
		});

		it('calls the AuthService to the logout screen', async () => {
			const authServiceSpy = spyOn(authService, 'signOut');
			const element = await setup({ auth: { signedIn: true } });
			const signedInButton = element.shadowRoot.querySelector('#authButton');

			signedInButton.click();

			expect(authServiceSpy).toHaveBeenCalled();
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
