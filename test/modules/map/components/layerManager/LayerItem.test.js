import { LayerItem } from '../../../../../src/modules/map/components/layerManager/LayerItem';
import { Toggle } from '../../../../../src/modules/commons/components/toggle/Toggle';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';


window.customElements.define(LayerItem.tag, LayerItem);
window.customElements.define(Toggle.tag, Toggle);



describe('LayerItem', () => {
	beforeEach(async () => {
		TestUtils.setupStoreAndDi({});        
		$injector.registerSingleton('TranslationService', {	 translate: (key) => key });
	});	
   
	describe('when layer item is rendered', () => {
		
		it('displays label-property in label', async () => {
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, id:'id0', label:'label0' };
			const label = element.shadowRoot.querySelector('.layer-label');
			
			expect(label.innerText).toBe('label0');			
		});

		it('displays id-property when label is empty in label', async () => {
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, id:'id0', label:'' };
			const label = element.shadowRoot.querySelector('.layer-label');
			
			expect(label.innerText).toBe('id0');			
		});
        
		it('use layer.label property in toggle-title ', async () => {			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, label:'label0' };
			
			const toggle = element.shadowRoot.querySelector('ba-toggle');

			expect(toggle.title).toBe('label0 - layer_item_change_visibility');
		});

		it('use layer.opacity-property in slider ', async () => {
			const layer = { label:'id0', opacity:0.55 };
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = layer;
			
			const slider = element.shadowRoot.querySelector('.opacity-slider');
			expect(slider.value).toBe('55');
		});
        
		it('use layer.visible-property in toggle ', async () => {			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, label:'id0', visible:false };
			const toggle = element.shadowRoot.querySelector('ba-toggle');
		
			expect(toggle.checked).toBe(false);
		});
        
		it('use layer.collapsed-property in element style ', async () => {
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, label:'id0', visible:false, collapsed:false };
			
			const layerBody = element.shadowRoot.querySelector('.layer-body');
			const collapseButton = element.shadowRoot.querySelector('.collapse-button');

			
			expect(layerBody.classList.contains('expand')).toBeTrue();
			// expect(collapseButton.classList.contains('iconexpand')).toBeTrue();

			element.layer = { ...element.layer, collapsed:true };
			expect(layerBody.classList.contains('expand')).toBeFalse();
			expect(collapseButton.classList.contains('iconexpand')).toBeFalse();
		});
        
	});
	
});