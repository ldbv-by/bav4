import { TestUtils } from '../test-utils.js';
import { pointerReducer } from '../../src/store/pointer/pointer.reducer';
import { setClick, setContextClick } from '../../src/store/pointer/pointer.action';
import { ContextClickPlugin } from '../../src/plugins/ContextClickPlugin.js';
import { mapReducer } from '../../src/store/map/map.reducer.js';
import { setMoveStart } from '../../src/store/map/map.action.js';
import { mapContextMenuReducer } from '../../src/store/mapContextMenu/mapContextMenu.reducer.js';
import { isTemplateResult } from '../../src/utils/checks.js';
import { $injector } from '../../src/injection/index.js';
import { notificationReducer } from '../../src/store/notifications/notifications.reducer.js';
import { highlightReducer } from '../../src/store/highlight/highlight.reducer.js';
import { HighlightFeatureTypes } from '../../src/store/highlight/highlight.action.js';

describe('ContextClickPlugin', () => {

	const environmentServiceMock = {
		isTouch() { }
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			pointer: pointerReducer,
			map: mapReducer,
			mapContextMenu: mapContextMenuReducer,
			notifications: notificationReducer,
			highlight: highlightReducer
		});

		$injector
			.registerSingleton('EnvironmentService', environmentServiceMock);

		return store;
	};

	describe('touch environment', () => {

		beforeEach(() => {
			spyOn(environmentServiceMock, 'isTouch').and.returnValue(true);
		});

		describe('when context-click state changed', () => {

			it('updates the mapContextMenu and the highlight store section', () => {
				const store = setup();
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();
				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].type).toEqual(HighlightFeatureTypes.DEFAULT);

				//let's call it again
				setContextClick({ coordinate: [21210, 42420], screenCoordinate: [210, 420] });

				expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();
				expect(store.getState().highlight.features).toHaveSize(1);
				expect(store.getState().highlight.features[0].type).toEqual(HighlightFeatureTypes.DEFAULT);
			});

			describe('when move-start state changed', () => {

				it('updates the highlight store section', () => {
					const store = setup();
					new ContextClickPlugin().register(store);

					setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

					expect(store.getState().highlight.features).toHaveSize(1);

					setMoveStart();

					expect(store.getState().highlight.features).toHaveSize(0);
				});
			});

			describe('when pointer-click state changed', () => {

				it('updates the highlight store section', () => {
					const store = setup();
					new ContextClickPlugin().register(store);

					setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

					expect(store.getState().highlight.features).toHaveSize(1);

					setClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

					expect(store.getState().highlight.features).toHaveSize(0);
				});
			});
		});
	});

	describe('non-touch environment', () => {

		beforeEach(() => {
			spyOn(environmentServiceMock, 'isTouch').and.returnValue(false);
		});

		describe('when context-click state changed', () => {

			it('updates the mapContextMenu store section', () => {
				const store = setup();
				new ContextClickPlugin().register(store);


				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				const { coordinate, content } = store.getState().mapContextMenu;
				expect(coordinate).toEqual([21, 42]);
				expect(isTemplateResult(content)).toBeTrue();
			});
		});

		describe('when move-start state changed', () => {

			it('updates the mapContextMenu store section', () => {
				const store = setup();
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(store.getState().mapContextMenu.coordinate).not.toBeNull();

				setMoveStart();

				expect(store.getState().mapContextMenu.coordinate).toBeNull();
			});
		});

		describe('when pointer-click state changed', () => {

			it('updates the mapContextMenu store section', () => {
				const store = setup();
				new ContextClickPlugin().register(store);

				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(store.getState().mapContextMenu.coordinate).not.toBeNull();

				setClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(store.getState().mapContextMenu.coordinate).toBeNull();
			});
		});
	});
});
