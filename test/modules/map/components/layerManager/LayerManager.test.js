import { LayerManager } from '../../../../../src/modules/map/components/layerManager/LayerManager';
import { Toggle } from '../../../../../src/modules/commons/components/toggle/Toggle';
import { layersReducer, defaultLayerProperties } from '../../../../../src/modules/map/store/layers/layers.reducer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(LayerManager.tag, LayerManager);
window.customElements.define(Toggle.tag, Toggle);

describe('LayerManager', () => {
	let store;
	const setup = async (state) => {
        
		store = TestUtils.setupStoreAndDi(state, { layers: layersReducer });
		$injector.registerSingleton('TranslationService', {	 translate: (key) => key });
		return TestUtils.render(LayerManager.tag);
	};
    
	describe('when initialized', () => {
		it('with empty layers displays no layer item', async() => {
			const stateEmpty = {
				layers: {
					active: [],
					background:'null'
				}
			};
			const element = await setup(stateEmpty);

			expect(element.shadowRoot.querySelector('.layer')).toBeFalsy();
		});
        
		it('with one layer displays one layer item', async() => {
			const layer = { ...defaultLayerProperties,
				id: 'id0', label: 'label0', visible: true, zIndex:1
			};
			const state = {
				layers: {
					active: [layer],
					background:'bg0'
				}
			};
			const element = await setup(state);

			expect(element.shadowRoot.querySelectorAll('.layer').length).toBe(1);
		});
	});

	describe('when layer item is rendered', () => {

		it('displays id if label is empty', async () => {
			const layer = { ...defaultLayerProperties,
				id: 'id0', label: '', visible: true, zIndex:1
			};
			const state = {
				layers: {
					active: [layer],
					background:'bg0'
				}
			};
			const element = await setup(state);
			const toggle = element.shadowRoot.querySelector('ba-toggle');

			expect(toggle.title).not.toBe('');
			expect(toggle.label).not.toBe('');
		});

		it('click on layer item change state', async() => {
			const layer = { ...defaultLayerProperties,
				id: 'id0', label: 'label0', visible: true, zIndex:1
			};
			const state = {
				layers: {
					active: [layer],
					background:'bg0'
				}
			};
			const element = await setup(state);

			const toggle = element.shadowRoot.querySelector('ba-toggle');
			expect(store.getState().layers.active[0].visible).toBe(true);
			toggle.click();
			expect(store.getState().layers.active[0].visible).toBe(false);


		});
	});
});