import { LayerSwipeSlider } from '../../../../../src/modules/map/components/layerSwipeSlider/LayerSwipeSlider.js';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection/index.js';
import { layerSwipeReducer } from '../../../../../src/store/layerSwipe/layerSwipe.reducer.js';

window.customElements.define(LayerSwipeSlider.tag, LayerSwipeSlider);

describe('LayerSwipeSlider', () => {
	let store;
	const setup = (state = {}, config = {}) => {
		const { embed = false } = config;
		const initialState = {
			layerSwipe: {
				active: false,
				ratio: null
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			layerSwipe: layerSwipeReducer
		});

		$injector.registerSingleton('EnvironmentService', {
			isEmbedded: () => embed
		});
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(LayerSwipeSlider.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new LayerSwipeSlider();

			expect(element.getModel()).toEqual({
				active: false,
				ratio: null
			});
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new LayerSwipeSlider().getModel();

			expect(model).toEqual({
				active: false,
				ratio: null
			});
		});
	});

	describe('when initialized', () => {
		it('adds nothing when not active', async () => {
			const element = await setup({ layerSwipe: { active: false, ratio: 50 } });
			expect(element.shadowRoot.querySelectorAll('.line')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('.layer-swipe')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('#rangeslider')).toHaveSize(0);
		});

		it('adds a layerswipe component', async () => {
			const element = await setup({ layerSwipe: { active: true, ratio: 50 } });
			expect(element.shadowRoot.querySelectorAll('.line')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('.layer-swipe')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#rangeslider')).toHaveSize(1);

			const rangeslider = element.shadowRoot.querySelector('#rangeslider');
			expect(rangeslider.value).toBe('50');
			expect(rangeslider.getAttribute('type')).toBe('range');
			expect(rangeslider.getAttribute('min')).toBe('0');
			expect(rangeslider.getAttribute('max')).toBe('100');
			expect(rangeslider.getAttribute('step')).toBe('1');
		});
	});

	describe('when input changed', () => {
		it('close routing', async () => {
			const element = await setup({ layerSwipe: { active: true, ratio: 50 } });
			const rangeslider = element.shadowRoot.querySelector('#rangeslider');

			expect(store.getState().layerSwipe.ratio).toBe(50);
			const left = window.getComputedStyle(element.shadowRoot.querySelector('.line')).left;

			// changing width
			rangeslider.value = 42;
			rangeslider.dispatchEvent(new Event('input'));

			expect(store.getState().layerSwipe.ratio).toBe(42);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.line')).left).not.toBe(left);

			// changing width
			rangeslider.value = 50;
			rangeslider.dispatchEvent(new Event('input'));

			expect(store.getState().layerSwipe.ratio).toBe(50);
			expect(window.getComputedStyle(element.shadowRoot.querySelector('.line')).left).toBe(left);
		});
	});
});
