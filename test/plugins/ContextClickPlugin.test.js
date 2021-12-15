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



describe('ContextClickPlugin', () => {

	const environmentServiceMock = {
		isTouch() { }
	};

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			pointer: pointerReducer,
			map: mapReducer,
			mapContextMenu: mapContextMenuReducer,
			notifications: notificationReducer
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

			it('updates the mapContextMenu store section', () => {
				const store = setup();
				new ContextClickPlugin().register(store);


				setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

				expect(isTemplateResult(store.getState().notifications.latest.payload.content)).toBeTrue();
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
