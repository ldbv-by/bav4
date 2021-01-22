import { LayerManager } from '../../../../../src/modules/map/components/layerManager/LayerManager';
import { layersReducer, defaultLayerProperties } from '../../../../../src/modules/map/store/layers/layers.reducer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';

window.customElements.define(LayerManager.tag, LayerManager);

describe('LayerManager', () => {

	const setup = async (state) => {
        
		TestUtils.setupStoreAndDi(state, { layers: layersReducer });
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
});