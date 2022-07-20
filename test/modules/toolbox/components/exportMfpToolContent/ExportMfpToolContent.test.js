import { $injector } from '../../../../../src/injection';
import { ExportMfpToolContent } from '../../../../../src/modules/toolbox/components/exportMfpToolContent/ExportMfpToolContent';
import { AbstractToolContent } from '../../../../../src/modules/toolbox/components/toolContainer/AbstractToolContent';
import { createNoInitialStateMediaReducer } from '../../../../../src/store/media/media.reducer';
import { mfpReducer } from '../../../../../src/store/mfp/mfp.reducer';
import { TestUtils } from '../../../../test-utils';

window.customElements.define(ExportMfpToolContent.tag, ExportMfpToolContent);


describe('ExportMfpToolContent', () => {
	let store;
	const windowMock = {
		matchMedia() { }
	};


	const mfpServiceMock = {
		getCapabilities() {
			return Promise.resolve([]);
		},
		byId() {
			return { scales: [42, 21, 1] };
		}
	};
	const initialCurrent = { id: 'foo', scale: 42, dpi: 125 };
	const mfpDefaultState = {
		active: false,
		current: { id: null, scale: null, dpi: null }
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
				capabilities: []
			});
		});
	});

	describe('when initialized', () => {

		const scales = [42, 21, 1];
		const dpis = [125, 200];
		const capabilities = [{ id: 'foo', scales: scales, dpis: dpis, mapSize: { width: 42, height: 21 } }, { id: 'bar', scales: scales, dpis: dpis, mapSize: { width: 420, height: 210 } }];

		it('renders the view WITHOUT capabilities', async () => {
			const element = await setup();

			expect(element.shadowRoot.querySelector('ba-spinner')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#btn_submit').label).toBe('toolbox_exportMfp_submit');
			expect(element.shadowRoot.querySelector('#btn_submit').disabled).toBeTrue();
		});

		it('renders the view with loaded capabilities', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			expect(element.shadowRoot.querySelector('#select_layout')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#select_scale')).toBeTruthy();
			expect(element.shadowRoot.querySelector('#btn_submit').label).toBe('toolbox_exportMfp_submit');
			expect(element.shadowRoot.querySelector('#btn_submit').disabled).toBeFalse();

		});

		it('requests once the capabilities from mfpService', async () => {

			const capabilitiesSpy = spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			expect(capabilitiesSpy).toHaveBeenCalledTimes(1);
			expect(element.getModel().capabilities).toEqual(capabilities);
		});

		it('creates select options from the capabilities', async () => {

			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			expect(element.shadowRoot.querySelectorAll('#select_layout option')).toHaveSize(2);
			expect(element.shadowRoot.querySelectorAll('#select_scale option')).toHaveSize(3);
		});

		it('does NOT create select options, when capabilities are empty', async () => {
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutOptions = element.shadowRoot.querySelectorAll('#select_layout option');
			const scaleOptions = element.shadowRoot.querySelectorAll('#select_scale option');

			expect(layoutOptions).toHaveSize(0);
			expect(scaleOptions).toHaveSize(0);
		});

		it('does NOT create select options, when current in store is empty', async () => {
			const element = await setup();

			const layoutOptions = element.shadowRoot.querySelectorAll('#select_layout option');
			const scaleOptions = element.shadowRoot.querySelectorAll('#select_scale option');

			expect(layoutOptions).toHaveSize(0);
			expect(scaleOptions).toHaveSize(0);
		});

		it('labels the layout options with a name from the capabilities', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutOptions = element.shadowRoot.querySelectorAll('#select_layout option');
			expect(layoutOptions[0].textContent).toBe('toolbox_exportMfp_id_foo');
		});

		it('labels the scale options with a formatted scale from the capabilities', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutOptions = element.shadowRoot.querySelectorAll('#select_scale option');

			expect(layoutOptions[1].textContent).toMatch(/1:\d+/);
		});

		it('changes store, when a layout(id) is selected', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const layoutSelectElement = element.shadowRoot.querySelector('#select_layout');
			const layoutOption = layoutSelectElement.item(1);
			layoutOption.selected = true;
			layoutSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().id).toEqual('bar');
			expect(store.getState().mfp.current).toEqual({ id: 'bar', scale: 42, dpi: 125 });
		});

		it('changes store, when a layout(id) is selected and scale already specified', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			element.signal('update_scale', 99);

			const layoutSelectElement = element.shadowRoot.querySelector('#select_layout');
			const layoutOption = layoutSelectElement.item(1);
			layoutOption.selected = true;
			layoutSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().id).toEqual('bar');
			expect(store.getState().mfp.current).toEqual({ id: 'bar', scale: 42, dpi: 125 });
		});

		it('changes store, when a scale is selected', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
			const layoutOption = scaleSelectElement.item(1); //21
			layoutOption.selected = true;
			scaleSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().scale).toBe(21);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 21, dpi: 125 });
		});

		it('changes store, when a scale is selected and layout(id) already specified', async () => {
			spyOn(mfpServiceMock, 'getCapabilities').and.resolveTo(capabilities);
			const element = await setup({ ...mfpDefaultState, current: initialCurrent });

			element.signal('update_map_size', { width: 420, height: 210 });

			const scaleSelectElement = element.shadowRoot.querySelector('#select_scale');
			const layoutOption = scaleSelectElement.item(2); //21
			layoutOption.selected = true;
			scaleSelectElement.dispatchEvent(new Event('change'));

			expect(element.getModel().scale).toBe(1);
			expect(store.getState().mfp.current).toEqual({ id: 'foo', scale: 1, dpi: 125 });
		});

	});
});
