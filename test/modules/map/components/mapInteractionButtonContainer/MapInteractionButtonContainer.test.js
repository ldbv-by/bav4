import { MapInteractionButtonContainer } from '../../../../../src/modules/map/components/mapInteractionButtonContainer/MapInteractionButtonContainer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection/index.js';
import { Tools } from '../../../../../src/domain/tools';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer.js';
import { BottomSheet } from '../../../../../src/modules/stackables/components/bottomSheet/BottomSheet';
import { bottomSheetReducer } from '../../../../../src/store/bottomSheet/bottomSheet.reducer';
import { createNoInitialStateMainMenuReducer } from '../../../../../src/store/mainMenu/mainMenu.reducer';
import { createNoInitialStateNavigationRailReducer } from '../../../../../src/store/navigationRail/navigationRail.reducer';
import { html } from 'lit-html';

window.customElements.define(MapInteractionButtonContainer.tag, MapInteractionButtonContainer);
window.customElements.define(BottomSheet.tag, BottomSheet);

describe('MapInteractionButtonContainer', () => {
	let store;
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;
		const initialState = {
			media: {
				portrait: false
			},
			tools: {
				current: false
			},
			mainMenu: {
				open: true,
				tab: null
			},
			navigationRail: {
				open: true
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			tools: toolsReducer,
			media: createNoInitialStateMediaReducer(),
			bottomSheet: bottomSheetReducer,
			mainMenu: createNoInitialStateMainMenuReducer(),
			navigationRail: createNoInitialStateNavigationRailReducer()
		});

		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(MapInteractionButtonContainer.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new MapInteractionButtonContainer();

			expect(element.getModel()).toEqual({
				toolId: null,
				isPortrait: false,
				isOpen: false,
				isOpenNavigationRail: false
			});
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new MapInteractionButtonContainer().getModel();

			expect(model).toEqual({
				toolId: null,
				isPortrait: false,
				isOpen: false,
				isOpenNavigationRail: false
			});
		});
	});

	describe('when initialized', () => {
		it('adds a container without buttons', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.map-interaction-button-container').children).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing.ui-center')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe.hide')).toHaveSize(1);
		});

		it('adds a container with active routing button', async () => {
			const element = await setup({ tools: { current: Tools.ROUTING } });
			expect(element.shadowRoot.querySelector('.map-interaction-button-container').children).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing.ui-center')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing')[0].label).toBe('map_interaction_button_container_routing');
			expect(element.shadowRoot.querySelectorAll('ba-button.routing')[0].title).toBe('');
		});

		it('adds a container with active compare button', async () => {
			const element = await setup({ tools: { current: Tools.COMPARE } });
			expect(element.shadowRoot.querySelector('.map-interaction-button-container').children).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe')[0].label).toBe('map_interaction_button_container_layerSwipe');
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe')[0].title).toBe('');
		});
	});

	describe('responsive layout ', () => {
		it('layouts for landscape', async () => {
			const state = {
				media: {
					portrait: false
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(1);
		});

		it('layouts for portrait', async () => {
			const state = {
				media: {
					portrait: true,
					minWidth: true
				}
			};

			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.is-portrait')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.is-landscape')).toHaveSize(0);
		});

		it('layouts with open navigation rail', async () => {
			const state = {
				media: {
					portrait: false
				},
				navigationRail: {
					open: true
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(1);
		});

		it('layouts with closed navigation rail', async () => {
			const state = {
				media: {
					portrait: false
				},
				navigationRail: {
					open: false
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open-navigationRail')).toHaveSize(0);
		});

		it('layouts with open main menu', async () => {
			const state = {
				media: {
					portrait: false
				},
				mainMenu: {
					open: true
				}
			};

			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(1);
		});

		it('layouts with closed main menu', async () => {
			const state = {
				media: {
					portrait: false
				},
				mainMenu: {
					open: false
				}
			};
			const element = await setup(state);
			expect(element.shadowRoot.querySelectorAll('.is-open')).toHaveSize(0);
		});
	});

	describe('reacts to bottom sheet', () => {
		it('sets bottom value to 110px', async () => {
			const element = await setup({ tools: { current: Tools.ROUTING } });
			const container = element.shadowRoot.querySelector('#mapInteractionButtonContainer');
			expect(element.shadowRoot.querySelectorAll('#mapInteractionButtonContainer')).toHaveSize(1);
			expect(container.style.getPropertyValue('bottom')).toBe('');

			const mock1 = TestUtils.renderTemplateResult(html`<ba-bottom-sheet style="display: block;height: 100px;"><div>TEST</div></ba-bottom-sheet>`);
			element.shadowRoot.appendChild(mock1);

			expect(element.shadowRoot.querySelectorAll(BottomSheet.tag)).toHaveSize(1);
			await TestUtils.timeout();

			expect(container.style.getPropertyValue('bottom')).toBe('110px');
		});

		it('sets bottom value to variable', async () => {
			const element = await setup({ tools: { current: Tools.ROUTING } });
			const container = element.shadowRoot.querySelector('#mapInteractionButtonContainer');
			expect(element.shadowRoot.querySelectorAll('#mapInteractionButtonContainer')).toHaveSize(1);
			expect(container.style.getPropertyValue('bottom')).toBe('');

			expect(element.shadowRoot.querySelectorAll(BottomSheet.tag)).toHaveSize(0);
			await TestUtils.timeout();

			expect(container.style.getPropertyValue('bottom')).toBe('var(--map-interaction-container-bottom)');
		});
	});

	describe('when clicked', () => {
		it('close routing', async () => {
			const element = await setup({ tools: { current: Tools.ROUTING } });
			expect(element.shadowRoot.querySelectorAll('ba-button.routing.hide')).toHaveSize(0);
			expect(store.getState().tools.current).toBe(Tools.ROUTING);

			const closeBtn = element.shadowRoot.querySelector('ba-button');
			closeBtn.click();

			expect(element.shadowRoot.querySelectorAll('ba-button.routing.hide')).toHaveSize(1);
			expect(store.getState().tools.current).toBeNull();
		});

		it('close compare', async () => {
			const element = await setup({ tools: { current: Tools.COMPARE } });
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe.hide')).toHaveSize(0);
			expect(store.getState().tools.current).toBe(Tools.COMPARE);

			const closeBtn = element.shadowRoot.querySelector('.layer-swipe');
			closeBtn.click();

			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe.hide')).toHaveSize(1);
			expect(store.getState().tools.current).toBeNull();
		});
	});
});
