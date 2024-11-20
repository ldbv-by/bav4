import { CoordinateSelect } from '../../../../../src/modules/footer/components/coordinateSelect/CoordinateSelect';
import { $injector } from '../../../../../src/injection';
import { TestUtils } from '../../../../test-utils.js';
import { setPointerMove } from '../../../../../src/store/pointer/pointer.action';
import { pointerReducer } from '../../../../../src/store/pointer/pointer.reducer';
import { GlobalCoordinateRepresentations } from '../../../../../src/domain/coordinateRepresentation';

window.customElements.define(CoordinateSelect.tag, CoordinateSelect);

describe('CoordinateSelect', () => {
	const coordinateServiceMock = {
		stringify() {}
	};

	const mapServiceMock = {
		getCoordinateRepresentations: () => {}
	};

	const translationServiceMock = {
		translate: (key) => key
	};

	const setup = (config = { touch: false }) => {
		const state = {
			pointer: pointerReducer.initialState
		};

		TestUtils.setupStoreAndDi(state, { pointer: pointerReducer });

		$injector.registerSingleton('TranslationService', translationServiceMock);
		$injector.registerSingleton('CoordinateService', coordinateServiceMock);
		$injector.registerSingleton('MapService', mapServiceMock);
		$injector.registerSingleton('EnvironmentService', { isTouch: () => config.touch });

		return TestUtils.renderAndLogLifecycle(CoordinateSelect.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
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
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.coordinate-label')).toHaveSize(0);
		});
		it('adds select element', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const translationServiceSpy = spyOn(translationServiceMock, 'translate').and.callThrough();
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('select')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('select')[0].title).toBe('footer_coordinate_select');
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[0].value).toBe(GlobalCoordinateRepresentations.UTM.id);
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[1].value).toEqual(GlobalCoordinateRepresentations.WGS84.id);
			expect(element.shadowRoot.querySelectorAll('.coordinate-label')).toHaveSize(0);
			expect(translationServiceSpy).toHaveBeenCalledTimes(3);
			expect(translationServiceSpy.calls.all()[0].args.length).toBe(1);
			expect(translationServiceSpy.calls.all()[1].args[2]).toBe(true);
			expect(translationServiceSpy.calls.all()[2].args[2]).toBe(true);
		});
	});

	describe('on pointer move', () => {
		it('updates the coordinates', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const element = await setup();
			const stringifyMock = spyOn(coordinateServiceMock, 'stringify').and.returnValue('stringified coordinate');
			const testCoordinate = [1211817.6233080907, 6168328.021915435];

			setPointerMove({ coordinate: testCoordinate, screenCoordinate: [] });

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toBe('stringified coordinate');
			expect(stringifyMock).toHaveBeenCalledOnceWith(testCoordinate, GlobalCoordinateRepresentations.UTM);
		});
		it('displays "-" when no CoordinateReference is available', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.callFake((coordinate) => {
				return coordinate ? [] : [GlobalCoordinateRepresentations.UTM, GlobalCoordinateRepresentations.WGS84];
			});
			const element = await setup();
			const testCoordinate = [1211817.6233080907, 6168328.021915435];

			setPointerMove({ coordinate: testCoordinate, screenCoordinate: [] });

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toContain('-');
		});
	});

	describe('on selection change', () => {
		it('updates the coordinate', async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			spyOn(coordinateServiceMock, 'stringify').and.callFake((coordinate, cr) => `stringified coordinate for ${cr.id}`);
			const element = await setup();
			const testCoordinate = [1211817.6233080907, 6168328.021915435];
			setPointerMove({ coordinate: testCoordinate, screenCoordinate: [] });

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toBe(
				`stringified coordinate for ${GlobalCoordinateRepresentations.UTM.id}`
			);

			// change selection
			const select = element.shadowRoot.querySelector('select');
			select.value = GlobalCoordinateRepresentations.WGS84.id;
			select.dispatchEvent(new Event('change'));

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toBe(
				`stringified coordinate for ${GlobalCoordinateRepresentations.WGS84.id}`
			);
		});
	});

	describe('on touch devices', () => {
		it("doesn't show select and label", async () => {
			spyOn(mapServiceMock, 'getCoordinateRepresentations').and.returnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const element = await setup({ touch: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});
});
