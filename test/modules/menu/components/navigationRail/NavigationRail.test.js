/* eslint-disable no-undef */

import { NavigationRail } from '../../../../../src/modules/menu/components/navigationRail/NavigationRail';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { navigationRailReducer } from '../../../../../src/store/navigationRail/navigationRail.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer';
import { featureInfoReducer } from '../../../../../src/store/featureInfo/featureInfo.reducer';
import { routingReducer } from '../../../../../src/store/routing/routing.reducer';

window.customElements.define(NavigationRail.tag, NavigationRail);

describe('NavigationRail', () => {
	const mapServiceMock = {
		getMinZoomLevel: () => {},
		getMaxZoomLevel: () => {}
	};

	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;

		const initialState = {
			navigationRail: {
				openNav: false,
				visitedTabIdsSet: null
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

		TestUtils.setupStoreAndDi(initialState, {
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

	describe('responsive layout ', () => {
		it('layouts with open main menu for landscape mode', async () => {
			const state = {
				media: {
					portrait: false,
					minWidth: true
				}
			};
			const element = await setup(state);

			// expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(0);
			// expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
		});

		// 	it('layouts with open main menu for portrait mode', async () => {
		// 		const state = {
		// 			media: {
		// 				portrait: true,
		// 				minWidth: false
		// 			}
		// 		};

		// 		const element = await setup(state);

		// 		// expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
		// 		// expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
		// 		expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
		// 		expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
		// 	});

		// 	it('layouts with open main menu for tablet mode', async () => {
		// 		const state = {
		// 			media: {
		// 				portrait: false,
		// 				minWidth: false
		// 			}
		// 		};

		// 		const element = await setup(state);

		// 		// expect(element.shadowRoot.querySelectorAll('.is-tablet')).toHaveSize(1);
		// 		// expect(element.shadowRoot.querySelectorAll('.is-desktop')).toHaveSize(0);
		// 		expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
		// 		expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
		// 	});
	});
});
