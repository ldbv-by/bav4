import { RoutingPlugin, ROUTING_LAYER_ID } from '../../src/plugins/RoutingPlugin';

import { TestUtils } from '../test-utils.js';
import { layersReducer } from '../../src/store/layers/layers.reducer';
import { initialState as initialRoutingState, routingReducer } from '../../src/store/routing/routing.reducer';
import { initialState as initialToolsState, toolsReducer } from '../../src/store/tools/tools.reducer';
import { setCurrentTool } from '../../src/store/tools/tools.action';
import { Tools } from '../../src/domain/tools';
import { deactivate, activate, setProposal, setStatus, setWaypoints } from '../../src/store/routing/routing.action';
import { $injector } from '../../src/injection';
import { LevelTypes } from '../../src/store/notifications/notifications.action';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer';
import { CoordinateProposalType, RoutingStatusCodes } from '../../src/domain/routing';
import { bottomSheetReducer } from '../../src/store/bottomSheet/bottomSheet.reducer.js';
import { ProposalContextContent } from '../../src/modules/routing/components/contextMenu/ProposalContextContent.js';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer.js';
import { HighlightFeatureType } from '../../src/store/highlight/highlight.action.js';
import { closeBottomSheet } from '../../src/store/bottomSheet/bottomSheet.action.js';
import { mapContextMenuReducer } from '../../src/store/mapContextMenu/mapContextMenu.reducer.js';

describe('RoutingPlugin', () => {
	const routingService = {
		async init() {},
		getCategories() {}
	};

	const translationService = {
		translate: (key) => key
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			routing: routingReducer,
			layers: layersReducer,
			tools: toolsReducer,
			notifications: notificationReducer,
			bottomSheet: bottomSheetReducer,
			highlight: highlightReducer,
			mapContextMenu: mapContextMenuReducer
		});
		$injector.registerSingleton('RoutingService', routingService).registerSingleton('TranslationService', translationService);
		return store;
	};

	describe('class', () => {
		it('defines constant values', () => {
			expect(RoutingPlugin.HIGHLIGHT_FEATURE_ID).toBe('#routingPluginHighlightFeatureId');
		});
	});

	describe('when tools "current" property changes', () => {
		describe('and not yet initialized ', () => {
			it('initializes the routing service, sets the default routing category and updates the active property', async () => {
				const store = setup({ routing: initialRoutingState });
				const instanceUnderTest = new RoutingPlugin();
				await instanceUnderTest.register(store);
				const routingServiceSpy = spyOn(routingService, 'init').and.resolveTo([]);
				const categoryId = 'catId';
				spyOn(routingService, 'getCategories').and.returnValue([{ id: categoryId }]);

				setCurrentTool(Tools.ROUTING);

				// we have to wait for two async operations
				await TestUtils.timeout();
				expect(routingServiceSpy).toHaveBeenCalled();
				await TestUtils.timeout();
				expect(store.getState().routing.active).toBeTrue();
				expect(store.getState().routing.categoryId).toBe(categoryId);
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
				expect(store.getState().notifications.latest.payload.content).toBe('global_routingService_init_exception');
				expect(store.getState().notifications.latest.payload.level).toBe(LevelTypes.ERROR);
				expect(errorSpy).toHaveBeenCalledWith('Routing service could not be initialized', new Error(message));
				await TestUtils.timeout();
				expect(store.getState().routing.active).toBeFalse();
			});
		});

		it('updates the active property (activation)', async () => {
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

		it('updates the active property, closes the BottomSheet and removes the highlight feature (deactivation)', async () => {
			const store = setup({
				routing: { ...initialRoutingState, waypoints: [[0, 1]] },
				tools: {
					current: Tools.ROUTING
				},

				bottomSheet: { active: true },
				highlight: {
					features: [{ id: RoutingPlugin.HIGHLIGHT_FEATURE_ID, data: { coordinate: [11, 22] } }]
				}
			});
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setCurrentTool('foo');

			expect(store.getState().routing.active).toBeFalse();
			expect(store.getState().routing.waypoints).toHaveSize(0);
			expect(store.getState().bottomSheet.active).toBeFalse();
			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});

	describe('when routing "active" property changes', () => {
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

	describe('when routing "proposal" property changes', () => {
		it('sets "ROUTING" as the current active tool', async () => {
			const store = setup();
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);
			const coordinate = [21, 42];

			expect(store.getState().tools.current).toBeNull();

			setProposal(coordinate, CoordinateProposalType.START_OR_DESTINATION);

			setStatus(RoutingStatusCodes.Destination_Missing);
		});

		it('closes an existing ContextMenu, removes existing highlight features, opens the BottomSheet, and removes the highlight feature after the BottomSheet is closed', async () => {
			const store = setup({
				mapContextMenu: { data: 'foo' },
				highlight: {
					features: [{ id: 'foo', data: { coordinate: [11, 22] } }]
				}
			});
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			const coordinate = [21, 42];
			await instanceUnderTest.register(store);

			setProposal(coordinate, CoordinateProposalType.START_OR_DESTINATION);

			expect(store.getState().mapContextMenu.active).toBeFalse();
			expect(store.getState().bottomSheet.active).toBeTrue();
			const wrapperElement = TestUtils.renderTemplateResult(store.getState().bottomSheet.data);
			expect(wrapperElement.querySelectorAll(ProposalContextContent.tag)).toHaveSize(1);
			expect(store.getState().bottomSheet.active).toBeTrue();
			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].data.coordinate).toEqual(coordinate);
			expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.MARKER_TMP);
			expect(store.getState().highlight.features[0].id).toBe(RoutingPlugin.HIGHLIGHT_FEATURE_ID);

			closeBottomSheet();

			expect(store.getState().highlight.features).toHaveSize(0);
		});

		it('adds a different highlight feature when waypoint already exists', async () => {
			const store = setup({
				routing: {
					...initialRoutingState,
					waypoints: [
						// some waypoints (more than one needed)
						[1, 2],
						[3, 4]
					]
				},
				tools: {
					current: Tools.ROUTING
				}
			});
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			const coordinate = [21, 42];
			await instanceUnderTest.register(store);

			setProposal(coordinate, CoordinateProposalType.EXISTING_START_OR_DESTINATION);

			expect(store.getState().highlight.features).toHaveSize(1);
			expect(store.getState().highlight.features[0].data.coordinate).toEqual(coordinate);
			expect(store.getState().highlight.features[0].type).toBe(HighlightFeatureType.DEFAULT);
			expect(store.getState().highlight.features[0].id).toBe(RoutingPlugin.HIGHLIGHT_FEATURE_ID);
		});

		it('prevents selecting a waypoint for removal when it is the only one', async () => {
			const store = setup({
				routing: {
					...initialRoutingState,
					waypoints: [[21, 42]]
				},
				tools: {
					current: Tools.ROUTING
				}
			});
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			const coordinate = [21, 42];
			await instanceUnderTest.register(store);

			setProposal(coordinate, CoordinateProposalType.EXISTING_START_OR_DESTINATION);

			expect(store.getState().highlight.features).toHaveSize(0);
		});
	});

	describe('when routing "status" property changes', () => {
		it('sets "ROUTING" as the current active tool', async () => {
			const store = setup({ routing: initialRoutingState, tools: initialToolsState });
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setStatus(RoutingStatusCodes.Http_Backend_400); //should trigger no change

			expect(store.getState().tools.current).toBeNull();

			setStatus(RoutingStatusCodes.Destination_Missing);

			expect(store.getState().tools.current).toBe(Tools.ROUTING);

			setCurrentTool(null);

			setStatus(RoutingStatusCodes.Start_Missing);

			expect(store.getState().tools.current).toBe(Tools.ROUTING);
		});
	});

	describe('when routing "waypoint" property changes', () => {
		it('resets the UI', async () => {
			const store = setup({
				bottomSheet: { active: true },
				mapContextMenu: { active: true },
				highlight: {
					features: [{ id: RoutingPlugin.HIGHLIGHT_FEATURE_ID, data: { coordinate: [11, 22] } }],
					active: true
				}
			});
			const instanceUnderTest = new RoutingPlugin();
			instanceUnderTest._initialized = true;
			await instanceUnderTest.register(store);

			setWaypoints([
				[1, 2],
				[3, 4]
			]);

			expect(store.getState().bottomSheet.active).toBeFalse();
			expect(store.getState().mapContextMenu.active).toBeFalse();
			expect(store.getState().highlight.active).toBeFalse();
		});
	});
});
