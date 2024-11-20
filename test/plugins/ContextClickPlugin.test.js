import { TestUtils } from '../test-utils.js';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer';
import { setClick, setContextClick } from '../../src/store/pointer/pointer.action';
import { ContextClickPlugin } from '../../src/plugins/ContextClickPlugin.js';
import { mapReducer } from '../../src/store/map/map.reducer.js';
import { setMoveStart } from '../../src/store/map/map.action.js';
import { mapContextMenuReducer } from '../../src/store/mapContextMenu/mapContextMenu.reducer.js';
import { isTemplateResult } from '../../src/utils/checks.js';
import { $injector } from '../../src/injection/index.js';
import { toolsReducer } from '../../src/store/tools/tools.reducer';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer.js';
import { HighlightFeatureType } from '../../src/store/highlight/highlight.action.js';
import { bottomSheetReducer, INTERACTION_BOTTOM_SHEET_ID } from '../../src/store/bottomSheet/bottomSheet.reducer.js';
import { setCurrentTool } from '../../src/store/tools/tools.action.js';
import { Tools } from '../../src/domain/tools.js';

describe('ContextClickPlugin', () => {
	const environmentServiceMock = {
		isTouch() {}
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			pointer: pointerReducer,
			map: mapReducer,
			mapContextMenu: mapContextMenuReducer,
			bottomSheet: bottomSheetReducer,
			highlight: highlightReducer,
			tools: toolsReducer
		});

		$injector.registerSingleton('EnvironmentService', environmentServiceMock);

		return store;
	};

	describe('touch environment', () => {
		beforeEach(() => {
			spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
		});

		describe('when context-click state changed', () => {
			it('updates the mapContextMenu and the highlight slice-of-state', () => {
				const store = setup();
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(isTemplateResult(store.getState().bottomSheet.data[0].content)).toBeTrue();
				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].type).toEqual(HighlightFeatureType.QUERY_SUCCESS);

				//let's call it again
				setContextClick({ coordinate: [21210, 42420], screenCoordinate: [210, 420] });

				expect(isTemplateResult(store.getState().bottomSheet.data[0].content)).toBeTrue();
				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].type).toEqual(HighlightFeatureType.QUERY_SUCCESS);
			});

			describe('when move-start state changed', () => {
				it('updates the highlight and bottomSheet slice-of-state', () => {
					const store = setup();
					new ContextClickPlugin().register(store);

					setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().bottomSheet.active).toEqual([INTERACTION_BOTTOM_SHEET_ID]);

					setMoveStart();

					expect(store.getState().highlight.features).toHaveSize(0);
					expect(store.getState().bottomSheet.active).toEqual([]);
				});
			});

			describe('when pointer-click state changed', () => {
				it('updates the highlight and bottomSheet slice-of-state', () => {
					const store = setup();
					new ContextClickPlugin().register(store);

					setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

					expect(store.getState().highlight.features).toHaveSize(1);
					expect(store.getState().bottomSheet.active).toEqual([INTERACTION_BOTTOM_SHEET_ID]);

					setClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

					expect(store.getState().highlight.features).toHaveSize(0);
					expect(store.getState().bottomSheet.active).toEqual([]);
				});
			});
		});
		describe('when context-click state does NOT change', () => {
			describe('when move-start state changed', () => {
				it('does nothing', () => {
					const store = setup({ bottomSheet: { active: [INTERACTION_BOTTOM_SHEET_ID] } });
					new ContextClickPlugin().register(store);

					expect(store.getState().bottomSheet.active).toEqual([INTERACTION_BOTTOM_SHEET_ID]);

					setMoveStart();

					expect(store.getState().bottomSheet.active).toEqual([INTERACTION_BOTTOM_SHEET_ID]);
				});
			});

			describe('when pointer-click state changed', () => {
				it('does nothing', () => {
					const store = setup({ bottomSheet: { active: [INTERACTION_BOTTOM_SHEET_ID] } });
					new ContextClickPlugin().register(store);

					expect(store.getState().bottomSheet.active).toEqual([INTERACTION_BOTTOM_SHEET_ID]);

					setClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

					expect(store.getState().bottomSheet.active).toEqual([INTERACTION_BOTTOM_SHEET_ID]);
				});
			});
		});

		describe('when tool changes', () => {
			it('removes an existing highlight feature', () => {
				const store = setup({});
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(store.getState().highlight.features).toHaveSize(1);
				setCurrentTool(Tools.ROUTING);

				expect(store.getState().highlight.features).toHaveSize(0);
			});
		});
	});

	describe('non-touch environment', () => {
		beforeEach(() => {
			spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
		});

		describe('when context-click state changed', () => {
			it('updates the mapContextMenu slice-of-state', () => {
				const store = setup();
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				const { coordinate, content } = store.getState().mapContextMenu;
				expect(coordinate).toEqual([21, 42]);
				expect(isTemplateResult(content)).toBeTrue();
			});
		});

		describe('when move-start state changed', () => {
			it('updates the mapContextMenu slice-of-state', () => {
				const store = setup();
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(store.getState().mapContextMenu.active).toBeTrue();

				setMoveStart();

				expect(store.getState().mapContextMenu.active).toBeFalse();
			});
		});

		describe('when pointer-click state changed', () => {
			it('updates the mapContextMenu slice-of-state', () => {
				const store = setup();
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(store.getState().mapContextMenu.active).toBeTrue();

				setClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(store.getState().mapContextMenu.active).toBeFalse();
			});
		});
	});
});
