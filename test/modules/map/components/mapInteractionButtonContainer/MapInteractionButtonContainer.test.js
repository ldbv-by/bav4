import { MapInteractionButtonContainer } from '../../../../../src/modules/map/components/mapInteractionButtonContainer/MapInteractionButtonContainer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection/index.js';
import { Tools } from '../../../../../src/domain/tools';
import { toolsReducer } from '../../../../../src/store/tools/tools.reducer';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer.js';

window.customElements.define(MapInteractionButtonContainer.tag, MapInteractionButtonContainer);

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
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			tools: toolsReducer,
			media: createNoInitialStateMediaReducer()
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
				isPortrait: false,
				toolId: null
			});
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new MapInteractionButtonContainer().getModel();

			expect(model).toEqual({
				isPortrait: false,
				toolId: null
			});
		});
	});

	describe('when initialized', () => {
		it('adds a container without buttons', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('.map-interaction-button-container').children).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe.hide')).toHaveSize(1);
		});

		it('adds a container with active routing button', async () => {
			const element = await setup({ tools: { current: Tools.ROUTING } });
			expect(element.shadowRoot.querySelector('.map-interaction-button-container').children).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing')[0].label).toBe('map_interaction_button_container_routing');
		});

		it('adds a container with active compare button', async () => {
			const element = await setup({ tools: { current: Tools.COMPARE } });
			expect(element.shadowRoot.querySelector('.map-interaction-button-container').children).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('ba-button.routing.hide')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-button.layer-swipe')[0].label).toBe('map_interaction_button_container_layerSwipe');
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
