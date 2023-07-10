import { TestUtils } from '../test-utils.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer.js';
import { mfpReducer } from '../../src/store/mfp/mfp.reducer.js';
import { ExportMfpPlugin, MFP_LAYER_ID } from '../../src/plugins/ExportMfpPlugin.js';
import { $injector } from '../../src/injection/index.js';
import { activate, cancelJob, deactivate, startJob } from '../../src/store/mfp/mfp.action.js';
import { layersReducer } from '../../src/store/layers/layers.reducer.js';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer.js';
import { LevelTypes } from '../../src/store/notifications/notifications.action.js';
import { positionReducer } from '../../src/store/position/position.reducer.js';
import { Tools } from '../../src/domain/tools.js';

describe('ExportMfpPlugin', () => {
	const mfpService = {
		async init() {},
		async createJob() {},
		cancelJob() {}
	};
	const environmentService = {
		getWindow: () => {}
	};

	const translationService = {
		translate: (key) => key
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			mfp: mfpReducer,
			layers: layersReducer,
			tools: toolsReducer,
			notifications: notificationReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('EnvironmentService', environmentService)
			.registerSingleton('MfpService', mfpService)
			.registerSingleton('TranslationService', translationService);
		return store;
	};

	describe('when not yet initialized and toolId changes', () => {
		const getMockCapabilities = () => {
			const scales = [1000, 5000];
			const dpis = [125, 200];
			return {
				grSubstitutions: {},
				layouts: [
					{ id: 'a4_portrait', scales: scales, dpis: dpis, mapSize: { width: 539, height: 722 } },
					{ id: 'a4_landscape', scales: scales, dpis: dpis, mapSize: { width: 785, height: 475 } }
				]
			};
		};

		it('initializes the mfp-slice-of state and updates the active property', async () => {
			const store = setup();
			const instanceUnderTest = new ExportMfpPlugin();
			await instanceUnderTest.register(store);
			spyOn(mfpService, 'init').and.resolveTo(getMockCapabilities());

			setCurrentTool(Tools.EXPORT);

			// we have to wait for two async operations
			await TestUtils.timeout();
			expect(store.getState().mfp.current.id).toBe('a4_portrait');
			expect(store.getState().mfp.current.dpi).toBe(125);
			expect(store.getState().mfp.current.scale).toBe(1000);
			await TestUtils.timeout();
			expect(store.getState().mfp.active).toBeTrue();
		});

		it('emits a notification when MfpService#init throws an error', async () => {
			const message = 'something got wrong';
			const store = setup();
			const instanceUnderTest = new ExportMfpPlugin();
			await instanceUnderTest.register(store);
			spyOn(mfpService, 'init').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');

			setCurrentTool(Tools.EXPORT);

			// we have to wait for two async operations
			await TestUtils.timeout();
			expect(store.getState().mfp.current.id).toBeNull();
			expect(store.getState().mfp.current.dpi).toBeNull();
			expect(store.getState().mfp.current.scale).toBeNull();
			await TestUtils.timeout();
			expect(store.getState().mfp.active).toBeFalse();
			expect(store.getState().notifications.latest.payload.content).toBe('global_mfpService_init_exception');
			expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
			expect(errorSpy).toHaveBeenCalledWith('MfpCapabilities could not be fetched from backend', jasmine.anything());
		});
	});

	describe('when initialized and toolId changes', () => {
		it('updates the active property (I)', async () => {
			const store = setup();
			const instanceUnderTest = new ExportMfpPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setCurrentTool(Tools.EXPORT);

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

			expect(store.getState().mfp.active).toBeFalse();
		});
	});

	describe('when active property changes', () => {
		it('adds or removes the mfp layer', async () => {
			const store = setup();
			const instanceUnderTest = new ExportMfpPlugin();
			await instanceUnderTest.register(store);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(MFP_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
			expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});
	});

	describe('when jobSpec property changes', () => {
		describe('and jobSpec is available', () => {
			it('creates a new job by calling the MfpService', async () => {
				const store = setup();
				const instanceUnderTest = new ExportMfpPlugin();
				await instanceUnderTest.register(store);
				const spec = { foo: 'bar' };
				const url = 'http://foo.bar';
				spyOn(mfpService, 'createJob').withArgs(spec).and.resolveTo(url);
				const mockWindow = { location: null };
				spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);

				startJob(spec);

				expect(store.getState().mfp.jobSpec.payload).not.toBeNull();
				await TestUtils.timeout();
				expect(mockWindow.location).toBe(url);
				expect(store.getState().mfp.jobSpec.payload).toBeNull();
			});

			it('just updates the state when MfpService returns NULL', async () => {
				const store = setup();
				const instanceUnderTest = new ExportMfpPlugin();
				await instanceUnderTest.register(store);
				const spec = { foo: 'bar' };
				spyOn(mfpService, 'createJob').withArgs(spec).and.resolveTo(null);

				startJob(spec);

				expect(store.getState().mfp.jobSpec.payload).not.toBeNull();
				await TestUtils.timeout();
				expect(store.getState().mfp.jobSpec.payload).toBeNull();
			});

			it('emits a notification when #createJob throws an error', async () => {
				const message = 'something got wrong';
				const store = setup();
				const instanceUnderTest = new ExportMfpPlugin();
				await instanceUnderTest.register(store);
				const spec = { foo: 'bar' };
				spyOn(mfpService, 'createJob').withArgs(spec).and.rejectWith(new Error(message));
				const errorSpy = spyOn(console, 'error');

				startJob(spec);

				expect(store.getState().mfp.jobSpec.payload).not.toBeNull();
				await TestUtils.timeout();
				expect(store.getState().mfp.jobSpec.payload).toBeNull();
				expect(store.getState().notifications.latest.payload.content).toBe('global_mfpService_createJob_exception');
				expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
				expect(errorSpy).toHaveBeenCalledWith('PDF generation was not successful.', jasmine.anything());
			});
		});

		describe('and jobSpec is NOT available', () => {
			it('cancels the current job by calling the MfpService', async () => {
				const store = setup();
				const instanceUnderTest = new ExportMfpPlugin();
				await instanceUnderTest.register(store);
				const mfpServiceSpy = spyOn(mfpService, 'cancelJob');
				const mockWindow = { location: null };
				spyOn(environmentService, 'getWindow').and.returnValue(mockWindow);

				cancelJob();

				expect(mfpServiceSpy).toHaveBeenCalled();
			});
		});
	});
});
