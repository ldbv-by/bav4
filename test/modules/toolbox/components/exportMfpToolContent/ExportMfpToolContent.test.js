import { $injector } from '../../../../../src/injection';
import { Checkbox } from '../../../../../src/modules/commons/components/checkbox/Checkbox';
import { ExportMfpToolContent } from '../../../../../src/modules/toolbox/components/exportMfpToolContent/ExportMfpToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { startJob } from '../../../../../src/store/mfp/mfp.action';
import { mfpReducer } from '../../../../../src/store/mfp/mfp.reducer';
import { EventLike } from '../../../../../src/utils/storeUtils';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ExportMfpToolContent.tag, ExportMfpToolContent);
window.customElements.define(Checkbox.tag, Checkbox);

describe('ExportMfpToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};

	const mfpServiceMock = {
		getCapabilities() {
			return null;
		},
		getLayoutById() {
			return { scales: [42, 21, 1] };
		}
	};
	const initialCurrent = { id: 'foo', scale: 42, dpi: 125 };
	const mfpDefaultState = {
		active: false,
		current: { id: null, scale: null, dpi: null },
		showGrid: false,
		jobSpec: null,
		isJobStarted: false
	};

	const setup = async (mfpState = mfpDefaultState, config = {}) => {
		const state = {
			mfp: mfpState,
			media: {
				portrait: false
			}
		};

		const { embed = false, isTouch = false } = config;

		store = TestUtils.setupStoreAndDi(state, { mfp: mfpReducer, media: createNoInitialStateMediaReducer() });
		$injector
			.registerSingleton('EnvironmentService', {
				isEmbedded: () => embed,
				getWindow: () => windowMock,
				isTouch: () => isTouch
			})
			.registerSingleton('TranslationService', { translate: (key) => key })
			.registerSingleton('MfpService', mfpServiceMock);
		return TestUtils.render(ExportMfpToolContent.tag);
	};

	describe('class', () => {

		it('inherits from AbstractToolContent', async () => {

			const element = await setup();

			expect(element instanceof AbstractToolContent).toBeTrue();
		});
	});

	describe('when instantiated', () => {

		it('has a model with default values', async () => {
			const element = await setup();
			const model = element.getModel();
			expect(model).toEqual({
				id: null,
				scale: null,
				showGrid: false,
				isJobStarted: false
			});
		});
	});

	const scales = [42, 21, 1];
	const dpis = [125, 200];
	const capabilities = { grSubstitutions: {}, layouts: [{ id: 'foo', scales: scales, dpis: dpis, mapSize: { width: 42, height: 21 } }, { id: 'bar', scales: scales, dpis: dpis, mapSize: { width: 420, height: 210 } }] };

	describe('when initialized', () => {

		it('renders the view WITHOUT capabilities', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelectorAll('ba-spinner')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#btn_submit').label).toBe('toolbox_exportMfp_submit');
			expect(element.shadowRoot.querySelector('#btn_submit').disabled).toBeTrue();
		});

		it('renders the view with loaded capabilities', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			expect(element.shadowRoot.querySelectorAll('.layout-button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('#select_scale')).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#btn_submit').label).toBe('toolbox_exportMfp_submit');
			expect(element.shadowRoot.querySelector('#btn_submit').disabled).toBeFalse();
			expect(element.shadowRoot.querySelector('#showgrid').checked).toBeFalse();
			expect(element.shadowRoot.querySelector('#showgrid').title).toBe('toolbox_exportMfp_show_grid_title');

			const subHeaderElements = element.shadowRoot.querySelectorAll('.tool-sub-header');
			expect(subHeaderElements).toHaveSize(2);
			expect([...subHeaderElements].map(e => e.innerText)).toEqual(['toolbox_exportMfp_layout', 'toolbox_exportMfp_scale']);

		});

		it('requests once the capabilities from mfpService', async () => {

			const capabilitiesSpy = spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			await setup({ ...mfpDefaultState, current: initialCurrent });

			expect(capabilitiesSpy).toHaveBeenCalledTimes(1);
		});

		it('creates select options from the capabilities', async () => {

			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			expect(element.shadowRoot.querySelectorAll('.layout-button')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('#select_scale option')).toHaveSize(3);

			const buttons = element.shadowRoot.querySelectorAll('.layout-button');
			expect(buttons[0].classList.contains('active')).toBeTrue();
			expect(buttons[1].classList.contains('active')).toBeFalse();

		});

		it('does NOT create select options, when capabilities are empty', async () => {
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutButtons = element.shadowRoot.querySelectorAll('.layout-button');
			const scaleOptions = element.shadowRoot.querySelectorAll('#select_scale option');

			expect(layoutButtons).toHaveSize(0);
			expect(scaleOptions).toHaveSize(0);
		});

		it('does NOT create select options, when current in store is empty', async () => {
			const element = await setup();

			const layoutButtons = element.shadowRoot.querySelectorAll('.layout-button');
			const scaleOptions = element.shadowRoot.querySelectorAll('#select_scale option');

			expect(layoutButtons).toHaveSize(0);
			expect(scaleOptions).toHaveSize(0);
		});

		it('labels the layout options with a name from the capabilities', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutButtons = element.shadowRoot.querySelectorAll('.layout-button');
			expect(layoutButtons[0].title).toBe('toolbox_exportMfp_id_foo');
		});

		it('labels the scale options with a formatted scale from the capabilities', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutOptions = element.shadowRoot.querySelectorAll('#select_scale option');

			expect(layoutOptions[1].textContent).toMatch(/1:\d+/);
		});

	});

	describe('when the user selects a layout(id)', () => {

		it('changes store', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutButtonElements = element.shadowRoot.querySelectorAll('.layout-button');
			const layoutButton = layoutButtonElements[1];
			expect(layoutButton.classList.contains('active')).toBeFalse();
			layoutButton.dispatchEvent(new Event('click'));
			expect(layoutButton.classList.contains('active')).toBeTrue();

			expect(element.getModel().id).toEqual('bar');
			expect(store.getState().mfp.current).toEqual({ id: 'bar', scale: 42, dpi: 125 });
		});

		describe('and scale already specified', () => {

			it('changes store', async () => {
				spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
				const element = await setup({ ...mfpDefaultState, current: initialCurrent });

				element.signal('update_scale', 99);

				const layoutButtonElements = element.shadowRoot.querySelectorAll('.layout-button');
				const layoutButton = layoutButtonElements[1];
				expect(layoutButton.classList.contains('active')).toBeFalse();
				layoutButton.dispatchEvent(new Event('click'));
				expect(layoutButton.classList.contains('active')).toBeTrue();

				expect(element.getModel().id).toEqual('bar');
				expect(store.getState().mfp.current).toEqual({ id: 'bar', scale: 42, dpi: 125 });
			});

		});

	});

	describe('when the user selects a scale', () => {

		it('changes store', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
			const layoutOption = scaleSelectElement.item(1); //selected scale: 21
			layoutOption.selected = true;
			scaleSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().scale).toBe(21);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 21, dpi: 125 });
		});

		describe('and layout(id) already specified', () => {

			it('changes store, when a scale is selected and layout(id) already specified', async () => {
				spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
				const element = await setup({ ...mfpDefaultState, current: initialCurrent });

				element.signal('update_map_size', { width: 420, height: 210 });

				const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
				const layoutOption = scaleSelectElement.item(2); //selected scale: 21
				layoutOption.selected = true;
				scaleSelectElement.dispatchEvent(new Event('change'));

				expect(element.getModel().scale).toBe(1);
				expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 1, dpi: 125 });
			});
		});
	});

	describe('when the user press the plus button', () => {

		it('changes store, decrease the scale', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
			const decreaseButtonElement = element.shadowRoot.querySelector('#decrease');
			const layoutOption = scaleSelectElement.item(1); //selected scale: 21
			layoutOption.selected = true;
			scaleSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().scale).toBe(21);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 21, dpi: 125 });

			decreaseButtonElement.click();

			expect(element.getModel().scale).toBe(42);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 42, dpi: 125 });
		});

		it('does NOT change the store on minimum scale', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
			const decreaseButtonElement = element.shadowRoot.querySelector('#decrease');
			const layoutOption = scaleSelectElement.item(0); //selected scale: 42
			layoutOption.selected = true;
			scaleSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().scale).toBe(42);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 42, dpi: 125 });

			const updateSpy = spyOn(element, 'signal').and.callThrough();
			decreaseButtonElement.click();

			expect(updateSpy).not.toHaveBeenCalled();
		});
	});

	describe('when the user press the minus button', () => {

		it('changes store, increase the scale', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
			const increaseButtonElement = element.shadowRoot.querySelector('#increase');
			const layoutOption = scaleSelectElement.item(1); //selected scale: 21
			layoutOption.selected = true;
			scaleSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().scale).toBe(21);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 21, dpi: 125 });

			increaseButtonElement.click();

			expect(element.getModel().scale).toBe(1);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 1, dpi: 125 });
		});

		it('does NOT change the store on maximum scale', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
			const increaseButtonElement = element.shadowRoot.querySelector('#increase');
			const layoutOption = scaleSelectElement.item(2); //selected scale: 1
			layoutOption.selected = true;
			scaleSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().scale).toBe(1);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 1, dpi: 125 });

			const updateSpy = spyOn(element, 'signal').and.callThrough();
			increaseButtonElement.click();

			expect(updateSpy).not.toHaveBeenCalled();
		});
	});

	describe('when the user clicks the submit-button', () => {

		it('changes store', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const submitButton = element.shadowRoot.querySelector('#btn_submit');
			submitButton.click();

			expect(store.getState().mfp.jobRequest).toEqual(jasmine.any(EventLike));
		});

		it('displays the cancel-button', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			startJob({});

			expect(element.shadowRoot.querySelectorAll('#btn_cancel')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#btn_submit')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('#btn_cancel')[0].type).toBe('loading');
		});
	});

	describe('when the user clicks the cancel-button', () => {

		it('changes store', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			startJob({});
			const cancelButton = element.shadowRoot.querySelector('#btn_cancel');
			cancelButton.click();

			expect(store.getState().mfp.jobSpec.payload).toBeNull();
		});

		it('displays the submit-button again', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			startJob({});

			const cancelButton = element.shadowRoot.querySelector('#btn_cancel');
			cancelButton.click();

			expect(element.shadowRoot.querySelectorAll('#btn_cancel')).toHaveSize(0);
			expect(element.shadowRoot.querySelectorAll('#btn_submit')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('#btn_submit')[0].type).toBe('primary');
		});
	});

	describe('when the user toggles the showGrid-checkbox', () => {

		it('changes store', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.returnValue(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });
			const checkbox = element.shadowRoot.querySelector('#showgrid');

			expect(store.getState().mfp.showGrid).toBeFalse();

			checkbox.click();

			expect(store.getState().mfp.showGrid).toBeTrue();

			checkbox.click();

			expect(store.getState().mfp.showGrid).toBeFalse();
		});

	});
});
