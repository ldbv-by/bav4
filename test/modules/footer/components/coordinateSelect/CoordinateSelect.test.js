import { CoordinateSelect } from '../../../../../src/modules/footer/components/coordinateSelect/CoordinateSelect';
import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { $injector } from '../../../../../src/injection';
import { updatePointerPosition } from '../../../../../src/modules/map/store/position.action';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(CoordinateSelect.tag, CoordinateSelect);


describe('CoordinateSelect', () => {

	const coordinateServiceMock = {
		stringify() { },
		toLonLat() { },
		transform() { } 	
	
	};

	const mapServiceMock = {
		getSridDefinitionsForView: () => {
			return [{ label: 'TEST', code: 99999 }, { label: 'WGS84', code: 1111 }]; 
		},
		getSrid: () => {
			return 3857; 
		}
	}; 

	const setup = (config) => {
		const { touch = false } = config;

		const state = {
			position: {
				zoom: 5,
				pointerPosition: [12345, 67890]
			}
		};

		TestUtils.setupStoreAndDi(state, { position: positionReducer });

		$injector
			.registerSingleton('CoordinateService', coordinateServiceMock);
		$injector
			.registerSingleton('MapService', mapServiceMock);
		$injector
			.registerSingleton('EnvironmentService', { isTouch: () => touch });

		return TestUtils.render(CoordinateSelect.tag);
	};

    
    
	describe('when initialized', () => {	
		it('adds a div which shows coordinate select and coordinate display', async () => {
			const element = await setup({ touch: false });

			expect(element.shadowRoot.querySelector('select')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.coordinate-label')).toBeTruthy();
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[0].value).toEqual('99999');
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[1].value).toEqual('1111');
		});	
	});
    
	describe('on pointer move', () => {
		it('updates the div which shows the current pointer position', async () => {
			const element = await setup({ touch: false });

			const transformMock = spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');

			const testCoordinate = [1211817.6233080907, 6168328.021915435]; 

			expect(element.shadowRoot.querySelector('select').value).toEqual('99999');
			expect(element.shadowRoot.querySelector('.select-coordinate-option').innerHTML.includes('TEST')).toBeTruthy();
            
			// coordinates are shown after the pointer is moved, so initial there are no coordinates visible
			updatePointerPosition(testCoordinate); 
			// returns mocked value
			expect(element.shadowRoot.innerHTML.includes('stringified coordinate')).toBeTruthy();

			expect(transformMock).toHaveBeenCalledOnceWith(testCoordinate, 3857, 99999);
			expect(stringifyMock).toHaveBeenCalledOnceWith([21, 21], 99999);
		});
	});

	describe('on selection change', () => {
		it('updates the coordinate system', async () => {
			const element = await setup({ touch: false });

			const transformMock = spyOn(coordinateServiceMock, 'transform').and.returnValue([21, 21]);
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const toLonLatMock = spyOn(coordinateServiceMock, 'toLonLat').and.returnValue([42, 42]);

			const testCoordinate = [23, 23];

			const select = element.shadowRoot.querySelector('select');

			// shows no coordinates (default)
			select.value = '';
			select.dispatchEvent(new Event('change'));
			element.render();
			expect(element.shadowRoot.querySelector('.coordinate-label').innerHTML).toEqual('<!----><!---->');

			// change to code '1111' - toLonLat method is called
			select.value = 1111;
			select.dispatchEvent(new Event('change'));
			element.render();
			updatePointerPosition(testCoordinate); 
			expect(element.shadowRoot.innerHTML.includes('stringified coordinate')).toBeTruthy();
			expect(toLonLatMock).toHaveBeenCalledWith(testCoordinate);
			expect(stringifyMock).toHaveBeenCalledWith([42, 42], 1111, { digits: 5 });

			// change to code '99999' - transform method is called
			select.value = '99999';
			select.dispatchEvent(new Event('change'));
			element.render();
			expect(element.shadowRoot.innerHTML.includes('stringified coordinate')).toBeTruthy();
			expect(transformMock).toHaveBeenCalledWith(testCoordinate, 3857, 99999);
			expect(stringifyMock).toHaveBeenCalledWith([21, 21], 99999);

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