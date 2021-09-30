import { TestUtils } from '../../../test-utils.js';
import { pointerReducer } from '../../../../src/modules/map/store/pointer.reducer';
import { mapReducer } from '../../../../src/modules/map/store/map.reducer';
import { setClick, setContextClick } from '../../../../src/modules/map/store/pointer.action';
import { setMoveStart } from '../../../../src/modules/map/store/map.action';
import { mapContextMenuReducer } from '../../../../src/modules/map/store/mapContextMenu.reducer';
import { ContextClickPlugin } from '../../../../src/modules/map/store/ContextClickPlugin.js';
import { TemplateResult } from 'lit-html';



describe('ContextClickPlugin', () => {

	const setup = (state) => {
		const store = TestUtils.setupStoreAndDi(state, {
			pointer: pointerReducer,
			map: mapReducer,
			mapContextMenu: mapContextMenuReducer
		});

		return store;
	};

	describe('when context-click state changed', () => {

		it('updates the mapContextMenu store section', () => {
			const store = setup();
			new ContextClickPlugin().register(store);


			setContextClick({ coordinate: [2121, 4242], screenCoordinate: [21, 42] });

			const { coordinate, content } = store.getState().mapContextMenu;
			expect(coordinate).toEqual([21, 42]);
			expect(content).toBeInstanceOf(TemplateResult);
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
