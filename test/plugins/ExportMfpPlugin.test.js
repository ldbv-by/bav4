import { TestUtils } from '../test-utils.js';
import { setCurrentTool, ToolId } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { mfpReducer } from '../../src/store/mfp/mfp.reducer.js';
import { ExportMfpPlugin } from '../../src/plugins/ExportMfpPlugin.js';
import { $injector } from '../../src/injection/index.js';



describe('ExportMfpPlugin', () => {

	const mfpService = {
		async getCapabilities() { }
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			mfp: mfpReducer,
			tools: toolsReducer
		});
		$injector
			.registerSingleton('MfpService', mfpService);
		return store;
	};

	describe('when not yet initialized and toolId changes', () => {

		const getMockCapabilities = () => {
			const scales = [1000, 5000];
			const dpis = [125, 200];
			return [
				{ id: 'a4_portrait', scales: scales, dpis: dpis, mapSize: { width: 539, height: 722 } },
				{ id: 'a4_landscape', scales: scales, dpis: dpis, mapSize: { width: 785, height: 475 } }
			];
		};

		it('initializes the mfp-slice-of state and updates the active property', async () => {
			const store = setup();
			const instanceUnderTest = new ExportMfpPlugin();
			await instanceUnderTest.register(store);
			spyOn(mfpService, 'getCapabilities').and.resolveTo(getMockCapabilities());

			setCurrentTool(ToolId.EXPORT);

			// we have to wait for two async operations
			await TestUtils.timeout();
			expect(store.getState().mfp.current.id).toBe('a4_portrait');
			expect(store.getState().mfp.current.dpi).toBe(125);
			expect(store.getState().mfp.current.scale).toBe(1000);
			await TestUtils.timeout();
			expect(store.getState().mfp.active).toBeTrue();
		});
	});

	describe('when initilized and toolId changes', () => {

		it('updates the active property (I)', async () => {
			const store = setup();
			const instanceUnderTest = new ExportMfpPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setCurrentTool(ToolId.EXPORT);

			// we have to wait for two async operations
			await TestUtils.timeout();
			await TestUtils.timeout();
			expect(store.getState().mfp.active).toBeTrue();
		});

		it('updates the active property (II)', async () => {
			const store = setup({
				mfp: {
					active: true
				}
			});
			const instanceUnderTest = new ExportMfpPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setCurrentTool('foo');

			await TestUtils.timeout();
			expect(store.getState().mfp.active).toBeFalse();
		});
	});
});
