import { LayerSwipeModal } from '@src/modules/map/components/layerSwipeSlider/LayerSwipeModal.js';

import { TestUtils } from '@test/test-utils.js';
import { $injector } from '@src/injection/index.js';
import { layerSwipeReducer } from '@src/store/layerSwipe/layerSwipe.reducer.js';
import { modalReducer } from '@src/store/modal/modal.reducer';

window.customElements.define(LayerSwipeModal.tag, LayerSwipeModal);

const baseGeoRs = {
	raster: ['atkis', 'luftbild_labels', 'tk', 'historisch', 'atkis_sw'],
	vector: ['by_style_standard', 'by_style_luftbild', 'by_style_grau', 'by_style_nacht']
};

const topicsServiceMock = {
	byId() {},
	default() {
		return { baseGeoRs };
	}
};

describe('LayerSwipeModal', () => {
	let store;

	const setup = (state = {}) => {
		const initialState = {
			layerSwipe: {},
			modal: {
				active: true
			},
			...state
		};

		store = TestUtils.setupStoreAndDi(initialState, {
			layerSwipe: layerSwipeReducer,
			modal: modalReducer
		});

		$injector.registerSingleton('TopicsService', topicsServiceMock).registerSingleton('TranslationService', { translate: (key) => key });
		return TestUtils.render(LayerSwipeModal.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			await setup();
			const element = new LayerSwipeModal();
			expect(element.getModel()).toEqual({});
		});
	});

	describe('when initialized', () => {
		it('adds a layer-swipe-modal component', async () => {
			const element = await setup({});
			expect(element.shadowRoot.querySelectorAll('.modal')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.modal-text')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.modal-text')[0].innerText).toContain('map_layerSwipeSlider_modal');
			expect(element.shadowRoot.querySelectorAll('.modal-link')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('.modal-link')[0].href).toContain('map_layerSwipeSlider_modal_link_url');
			expect(element.shadowRoot.querySelectorAll('.modal-link')[0].innerText).toBe('map_layerSwipeSlider_modal_link_text');
			expect(element.shadowRoot.querySelectorAll('.modal-link')[0].target).toEqual('_blank');
			expect(element.shadowRoot.querySelectorAll('ba-base-layer-switcher')).toHaveLength(1);
		});
	});

	describe('close the modal after clicking the ba-base-layer-switcher', () => {
		it('adds a layer-swipe-modal component', async () => {
			const element = await setup({});
			expect(store.getState().modal.active).toBe(true);

			element.shadowRoot.querySelectorAll('ba-base-layer-switcher')[0].click();

			expect(store.getState().modal.active).toBe(false);
		});
	});
});
