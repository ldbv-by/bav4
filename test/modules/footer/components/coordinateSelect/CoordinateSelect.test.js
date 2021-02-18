import { CoordinateSelect } from '../../../../../src/modules/footer/components/coordinateSelect/CoordinateSelect';
import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { $injector } from '../../../../../src/injection';
import { OlCoordinateService } from '../../../../../src/services/OlCoordinateService';
import { updatePointerPosition } from '../../../../../src/modules/map/store/position.action';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(CoordinateSelect.tag, CoordinateSelect);


describe('CoordinateSelect', () => {

	const setup = (config) => {
		const { touch = false } = config;

		const state = {
			position: {
				zoom: 5,
				pointerPosition: [1288239.2412306187, 6130212.561641981]
			}
		};

		TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		$injector
			.register('CoordinateService', OlCoordinateService);
		$injector
			.registerSingleton('MapService', { getSridDefinitionsForView: () => {
				return [{ label: 'UTM', code: 25832 }, { label: 'WGS84', code: 4326 }]; 
			} });
		$injector
			.registerSingleton('EnvironmentService', { isTouch: () => touch });

		return TestUtils.render(CoordinateSelect.tag);
	};

    
    
	describe('when initialized', () => {	
		it('adds a div which shows coordinate select and coordinate display', async () => {
			const element = await setup({ touch: false });

			expect(element.shadowRoot.querySelector('select')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.coordinate-label')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[0].value).toEqual('25832');
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[1].value).toEqual('4326');
		});	
	});
    
	describe('on pointer move', () => {
		it('updates the div which shows the current pointer position', async () => {
			const element = await setup({ touch: false });


			expect(element.shadowRoot.querySelector('select').value).toEqual('25832');
            
			// coordinates are shown after the pointer is moved, so initial there are no coordinates visible
			updatePointerPosition([1211817.6233080907, 6168328.021915435]); 
			// initial mode UTM is set
			expect(element.shadowRoot.innerHTML.includes('639675.996, 5358942.428')).toBeTruthy();
		});
	});

	describe('on selection change', () => {
		it('updates the coordinate system', async () => {
			const element = await setup({ touch: false });

			updatePointerPosition([1211817.6233080907, 6168328.021915435]); 
			expect(element.shadowRoot.innerHTML.includes('639675.996, 5358942.428')).toBeTruthy();

			const select = element.shadowRoot.querySelector('select');

			// shows no coordinates (default)
			select.value = '';
			select.dispatchEvent(new Event('change'));
			element.render();
			expect(element.shadowRoot.querySelector('.coordinate-label').innerHTML).toEqual('<!----><!---->');

			// change to '4326'
			select.value = '4326';
			select.dispatchEvent(new Event('change'));
			element.render();
			expect(element.shadowRoot.innerHTML.includes('10.886, 48.368')).toBeTruthy();

			// change to '25832'
			select.value = '25832';
			select.dispatchEvent(new Event('change'));
			element.render();
			expect(element.shadowRoot.innerHTML.includes('639675.996, 5358942.428')).toBeTruthy();

			// pointer position initial state (null)
			updatePointerPosition(null);
			expect(element.shadowRoot.querySelector('.coordinate-label').innerHTML).toEqual('<!----><!---->');
		});
	});

	describe('on touch devices', () => {
		it('doesn\'t show select and label', async () => {

			const element = await setup({ touch: true });

			expect(element.shadowRoot.children.length).toBe(0);

		});
	});
});