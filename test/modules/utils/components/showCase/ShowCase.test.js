import { html } from 'lit-html';
import { ShowCase } from '../../../../../src/modules/utils/components/showCase/ShowCase';
import { Toggle } from '../../../../../src/modules/commons/components/toggle/Toggle';
import { TestUtils } from '../../../../test-utils';
import { sidePanelReducer } from '../../../../../src/modules/menue/store/sidePanel.reducer';
import { mapReducer } from '../../../../../src/modules/map/store/olMap.reducer';
import { layersReducer } from '../../../../../src/modules/map/store/layers/layers.reducer';
import { modalReducer } from '../../../../../src/modules/modal/store/modal.reducer';
import { OlCoordinateService } from '../../../../../src/services/OlCoordinateService';
import { $injector } from '../../../../../src/injection';
import { openModal } from '../../../../../src/modules/modal/store/modal.action';

window.customElements.define(ShowCase.tag, ShowCase);
window.customElements.define(Toggle.tag, Toggle);

describe('ShowCase', () => {

	let store;
	
	const setup = () => {
		const state = {
			mobile: false,
			map: {
				zoom: 10,
				pointerPosition: [1288239.2412306187, 6130212.561641981]
			},
			sidePanel: {
				open: false
			},
			layers: {
				active: [],
				background:'null'
			},
			modal: { title: false, content: false }
		};
		store = TestUtils.setupStoreAndDi(state, { map: mapReducer, sidePanel: sidePanelReducer, layers:layersReducer, modal: modalReducer  });
		$injector
			.register('CoordinateService', OlCoordinateService)
			.registerSingleton('EnvironmentService', { isEmbedded : () => false });
        
        
		return TestUtils.render(ShowCase.tag);
	};
    
	describe('when initialized',  () => {
		
		it('adds a div which shows some buttons', async() => {
			const  element = await setup();
			
			// try different approaches
			expect(element.shadowRoot.querySelectorAll('.buttons ba-button').length).toBe(4);
			expect(element.shadowRoot.querySelector('.buttons').childElementCount).toBe(4);
			expect(element.shadowRoot.querySelector('#button0')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#button1')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#button2')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#button3')).toBeTruthy();
		});

		it('adds a div which shows some icons', async() => {
			const  element = await setup();
			
			expect(element.shadowRoot.querySelectorAll('ba-icon').length).toBe(4);
		});

	
		it('calls the callback, if button0 are clicked', async () => {
			const  element = await setup();
			
			element.shadowRoot.querySelector('#button0').click();
			
			expect(store.getState().map.zoom).toBe(13);
		});

		it('calls the callback, if button1 are clicked', async () => {
			const  element = await setup();
			
			element.shadowRoot.querySelector('#button1').click();
			
			expect(store.getState().map.zoom).toBe(11);
		});

		it('toggle gets checked, if toggle are clicked', async () => {
			const  element = await setup();
			const toggle = element.shadowRoot.querySelector('#toggle');
			
			expect(toggle).toBeTruthy();

			toggle.shadowRoot.querySelector('.switch').click();

			expect(toggle.shadowRoot.querySelector('input').checked).toBeTrue();
		});

		it('modal state changes in store, when \'Measure Distance\'-Button is clicked', async () => {
			const  element = await setup();
			const button = element.shadowRoot.querySelector('#buttonMeasureDistance');
			const modalContent = { title:'foo', content: html `<p class="bar">bar<p/>` };

			openModal(modalContent);
			expect(button).toBeTruthy();

			button.click();

			expect(store.getState().modal.title).toBeFalse();
		});

	});

});