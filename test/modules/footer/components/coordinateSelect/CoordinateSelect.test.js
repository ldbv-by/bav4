import { CoordinateSelect } from '@src/modules/footer/components/coordinateSelect/CoordinateSelect';
import { $injector } from '@src/injection';
import { TestUtils } from '@test/test-utils.js';
import { setPointerMove } from '@src/store/pointer/pointer.action';
import { pointerReducer } from '@src/store/pointer/pointer.reducer';
import { GlobalCoordinateRepresentations } from '@src/domain/coordinateRepresentation';

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

		return TestUtils.render(CoordinateSelect.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			vi.spyOn(mapServiceMock, 'getCoordinateRepresentations').mockReturnValue([
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
			vi.spyOn(mapServiceMock, 'getCoordinateRepresentations').mockReturnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('.coordinate-label')).toHaveLength(0);
		});
		it('adds select element', async () => {
			vi.spyOn(mapServiceMock, 'getCoordinateRepresentations').mockReturnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const translationServiceSpy = vi.spyOn(translationServiceMock, 'translate');
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('select')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('select')[0].title).toBe('footer_coordinate_select');
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[0].value).toBe(GlobalCoordinateRepresentations.UTM.id);
			expect(element.shadowRoot.querySelectorAll('.select-coordinate-option')[1].value).toEqual(GlobalCoordinateRepresentations.WGS84.id);
			expect(element.shadowRoot.querySelectorAll('.coordinate-label')).toHaveLength(0);
			expect(translationServiceSpy).toHaveBeenCalledTimes(3);
			expect(translationServiceSpy.mock.calls[0].length).toBe(1);
			expect(translationServiceSpy.mock.calls[1][2]).toBe(true);
			expect(translationServiceSpy.mock.calls[2][2]).toBe(true);
		});
	});

	describe('on pointer move', () => {
		it('updates the coordinates', async () => {
			vi.spyOn(mapServiceMock, 'getCoordinateRepresentations').mockReturnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const element = await setup();
			const stringifyMock = vi.spyOn(coordinateServiceMock, 'stringify').mockReturnValue('stringified coordinate');
			const testCoordinate = [1211817.6233080907, 6168328.021915435];

			setPointerMove({ coordinate: testCoordinate, screenCoordinate: [] });

			expect(element.shadowRoot.querySelector('.coordinate-label').innerText).toBe('stringified coordinate');
			expect(stringifyMock).toHaveBeenCalledExactlyOnceWith(testCoordinate, GlobalCoordinateRepresentations.UTM);
		});
		it('displays "-" when no CoordinateReference is available', async () => {
			vi.spyOn(mapServiceMock, 'getCoordinateRepresentations').mockImplementation((coordinate) => {
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
			vi.spyOn(mapServiceMock, 'getCoordinateRepresentations').mockReturnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			vi.spyOn(coordinateServiceMock, 'stringify').mockImplementation((coordinate, cr) => `stringified coordinate for ${cr.id}`);
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
			vi.spyOn(mapServiceMock, 'getCoordinateRepresentations').mockReturnValue([
				GlobalCoordinateRepresentations.UTM,
				GlobalCoordinateRepresentations.WGS84
			]);
			const element = await setup({ touch: true });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});
});
