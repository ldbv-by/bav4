import { LayerItem } from '../../../../../src/modules/map/components/layerItem/LayerItem';
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
		
		it('displays name-attribute in label', async () => {
			
			const element = await TestUtils.render(LayerItem.tag, { name:'id0' });
			
			const label = element.shadowRoot.querySelector('.layer-label');
			expect(element.name).toBe('id0');
			expect(label.innerText).toBe('id0');			
		});
        
		it('use name-attribute in toggle-title ', async () => {
			
			const element = await TestUtils.render(LayerItem.tag, { name:'id0' });
			const toggle = element.shadowRoot.querySelector('ba-toggle');

			expect(toggle.title).toBe('id0 - layer_item_change_visibility');
		});

		it('use opacity-attribute in slider ', async () => {
			
			const element = await TestUtils.render(LayerItem.tag, { name:'id0', opacity:55 });
			const slider = element.shadowRoot.querySelector('.opacity-slider');

			expect(element.opacity).toBe(55);
			expect(slider.value).toBe('55');
		});
        
		it('use visible-attribute in toggle ', async () => {
			
			const element = await TestUtils.render(LayerItem.tag, { name:'id0', visible:false });
			const toggle = element.shadowRoot.querySelector('ba-toggle');

			expect(element.visible).toBe(false);
			expect(toggle.checked).toBe(false);
		});
        
		it('use draggable-attribute and prevent dragging of slider', async () => {
			
			const element = await TestUtils.render(LayerItem.tag, { name:'id0', draggable:true });
			const slider = element.shadowRoot.querySelector('.opacity-slider');
			
			expect(element.draggable).toBe(true);
			expect(slider.draggable).toBe(true);
		});
        
		it('use collapsed-attribute in element style ', async () => {
			
			const element = await TestUtils.render(LayerItem.tag, { name:'id0', opacity:55, collapsed:false });
			const layerBody = element.shadowRoot.querySelector('.layer-body');
			const collapseButton = element.shadowRoot.querySelector('.collapse-button');

			expect(element.collapsed).toBe(false);
			expect(layerBody.classList.contains('expand')).toBeTrue();
			// expect(collapseButton.classList.contains('iconexpand')).toBeTrue();
            
			element.collapsed = true;
			expect(layerBody.classList.contains('expand')).toBeFalse();
			expect(collapseButton.classList.contains('iconexpand')).toBeFalse();
		});
        
		it('click on layer toggle calls callback', async() => {
								
			const element = await TestUtils.render(LayerItem.tag, { name: 'id0' });            			
			const toggle = element.shadowRoot.querySelector('ba-toggle');            
			element.onVisibilityChanged =  jasmine.createSpy();

			toggle.click();
            
			expect(element.onVisibilityChanged).toHaveBeenCalled();
		});
		it('change of slider input-value calls callback', async() => {
					
			const element = await TestUtils.render(LayerItem.tag, 
				{ name: 'id0', opacity:55, collapsed:false });            			
			const slider = element.shadowRoot.querySelector('.opacity-slider');          
			element.onOpacityChanged =  jasmine.createSpy();

			slider.value = 66;
			slider.dispatchEvent(new Event('input'));
            
			expect(element.opacity).toBe(66);
			expect(element.onOpacityChanged).toHaveBeenCalled();
		});
        
		it('click on collapse-button calls callback', async() => {
					
			const element = await TestUtils.render(LayerItem.tag, 
				{ name: 'id0', collapsed:true });            			
			const collapseButton = element.shadowRoot.querySelector('.collapse-button a');        
                        
			element.onCollapsed =  jasmine.createSpy();
			collapseButton.click();
			
			expect(element.collapsed).toBe(false);                       
			collapseButton.click();
			
			expect(element.collapsed).toBe(true);
			expect(element.onCollapsed).toHaveBeenCalledTimes(2);
            
		});
	});

});