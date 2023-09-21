import { RoutingPlugin, ROUTING_LAYER_ID } from '../../src/plugins/RoutingPlugin';

import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { routingReducer } from '../../src/store/routing/routing.reducer';
import { toolsReducer } from '../../src/store/tools/tools.reducer';
import { setCurrentTool } from '../../src/store/tools/tools.action';
import { Tools } from '../../src/domain/tools';
import { deactivate, activate } from '../../src/store/routing/routing.action';
import { $injector } from '../../src/injection';
import { LevelTypes } from '../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';

describe('RoutingPlugin', () => {
	const routingService = {
		async init() {}
	};

	const translationService = {
		translate: (key) => key
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			routing: routingReducer,
			layers: layersReducer,
			tools: toolsReducer,
			notifications: notificationReducer
		});
		$injector.registerSingleton('RoutingService', routingService).registerSingleton('TranslationService', translationService);
		return store;
	};

	describe('when not yet initialized and toolId changes', () => {
		it('initializes the routing service and updates the active property', async () => {
			const store = setup();
			const instanceUnderTest = new RoutingPlugin();
			await instanceUnderTest.register(store);
			const routingServiceSpy = spyOn(routingService, 'init').and.resolveTo([]);

			setCurrentTool(Tools.ROUTING);

			// we have to wait for two async operations
			await TestUtils.timeout();
			await TestUtils.timeout();
			expect(routingServiceSpy).toHaveBeenCalled();
			expect(store.getState().routing.active).toBeTrue();
		});

		it('emits a notification when RoutingService#init throws an error', async () => {
			const message = 'something got wrong';
			const store = setup();
			const instanceUnderTest = new RoutingPlugin();
			await instanceUnderTest.register(store);
			spyOn(routingService, 'init').and.rejectWith(new Error(message));
			const errorSpy = spyOn(console, 'error');

			setCurrentTool(Tools.ROUTING);

			// we have to wait for two async operations
			await TestUtils.timeout();
			await TestUtils.timeout();
			expect(store.getState().routing.active).toBeFalse();
			expect(store.getState().notifications.latest.payload.content).toBe('global_routingService_init_exception');
			expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
			expect(errorSpy).toHaveBeenCalledWith('Routing service could not be initialized', jasmine.anything());
		});
	});

	describe('when toolId changes', () => {
		it('updates the active property (I)', async () => {
			const store = setup();
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setCurrentTool(Tools.ROUTING);

			// we have to wait for two async operations
			await TestUtils.timeout();
			await TestUtils.timeout();
			expect(store.getState().routing.active).toBeTrue();
		});

		it('updates the active property (II)', async () => {
			const store = setup({
				tools: {
					current: Tools.ROUTING
				}
			});
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setCurrentTool('foo');

			expect(store.getState().routing.active).toBeFalse();
		});
	});

	describe('when active property changes', () => {
		it('adds or removes the routing layer', async () => {
			const store = setup();
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(ROUTING_LAYER_ID);
			expect(store.getState().layers.active[0].constraints.alwaysTop).toBeTrue();
			expect(store.getState().layers.active[0].constraints.hidden).toBeTrue();

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});
	});
});
