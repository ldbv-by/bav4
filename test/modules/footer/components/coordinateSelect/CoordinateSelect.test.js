import { CoordinateSelect } from '../../../../../src/modules/footer/components/coordinateSelect/CoordinateSelect';
import { $injector } from '../../../../../src/injection';
import { TestUtils } from '../../../../test-utils.js';
import { setPointerMove } from '../../../../../src/store/pointer/pointer.action';
import { pointerReducer } from '../../../../../src/store/pointer/pointer.reducer';
import { CoordinateRepresentations } from '../../../../../src/domain/coordinateRepresentation';

window.customElements.define(CoordinateSelect.tag, CoordinateSelect);

describe('CoordinateSelect', () => {
	const coordinateServiceMock = {
		stringify() {}
	};

	const mapServiceMock = {
		getCoordinateRepresentations: () => {}
	};

	const setup = (config = { touch: false }) => {
		const state = {
			pointer: pointerReducer.initialState
		};

		TestUtils.setupStoreAndDi(state, { pointer: pointerReducer });

		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		$injector.registerSingleton('CoordinateService', coordinateServiceMock);
		$injector.registerSingleton('MapService', mapServiceMock);
		$injector.registerSingleton('EnvironmentService', { isTouch: () => config.touch });

		return TestUtils.renderAndLogLifecycle(CoordinateSelect.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84]);
			setup();
			const element = new CoordinateSelect();

			expect(element.getModel()).toEqual({
				selectedCr: null,
				pointerPosition: []
			});
		});
	});

	describe('when initialized', () => {
		it('renders nothing when pointer position equals null', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84]);
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.coordinate-label')).toHaveSize(0);
		});
		it('adds select element', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84]);
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('select')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('select')[0].title).toBe('footer_coordinate_select');
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[0].value).toBe(CoordinateRepresentations.UTM.label);
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[1].value).toEqual(CoordinateRepresentations.WGS84.label);
			expect(element.shadowRoot.querySelectorAll('.coordinate-label')).toHaveSize(0);
		});
	});

	describe('on pointer move', () => {
		it('updates the coordinates', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84]);
			const element = await setup();
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const testCoordinate = [1211817.6233080907, 6168328.021915435];

			setPointerMove({ coordinate: testCoordinate, screenCoordinate: [] });

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toBe('stringified coordinate');
			expect(stringifyMock).toHaveBeenCalledOnceWith(testCoordinate, CoordinateRepresentations.UTM);
		});
		it('displays "-" when no CoordinateReference is available', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.callFake((coordinate) => {
				return coordinate ? [] : [CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84];
			});
			const element = await setup();
			const testCoordinate = [1211817.6233080907, 6168328.021915435];

			setPointerMove({ coordinate: testCoordinate, screenCoordinate: [] });

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toContain('-');
		});
	});

	describe('on selection change', () => {
		it('updates the coordinate', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84]);
			spyOn(coordinateServiceMock, 'stringify').and.callFake((coordinate, cr) => `stringified coordinate for ${cr.label}`);
			const element = await setup();
			const testCoordinate = [1211817.6233080907, 6168328.021915435];
			setPointerMove({ coordinate: testCoordinate, screenCoordinate: [] });

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toBe('stringified coordinate for UTM');

			// change selection
			const select = element.shadowRoot.querySelector('select');
			select.value = CoordinateRepresentations.WGS84.label;
			select.dispatchEvent(new Event('change'));

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toBe('stringified coordinate for WGS84');
		});
	});

	describe('on touch devices', () => {
		it("doesn't show select and label", async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([CoordinateRepresentations.UTM, CoordinateRepresentations.WGS84]);
			const element = await setup({ touch: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});
});
