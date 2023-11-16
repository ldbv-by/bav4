import { TestUtils } from '../../test-utils.js';
import { mapContextMenuReducer } from '../../../src/store/mapContextMenu/mapContextMenu.reducer';
import { closeContextMenu, openContextMenu, updateContextMenu } from '../../../src/store/mapContextMenu/mapContextMenu.action';

describe('mapContextMenu', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			mapContextMenu: mapContextMenuReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().mapContextMenu.coordinate).toBeNull();
		expect(store.getState().mapContextMenu.content).toBeNull();
		expect(store.getState().mapContextMenu.active).toBeFalse();
	});

	it('updates the "coordinate" and "data" property', () => {
		const store = setup();

		openContextMenu([21, 42], 'content');

		const { coordinate, content, active } = store.getState().mapContextMenu;
		expect(coordinate).toEqual([21, 42]);
		expect(content).toBe('content');
		expect(active).toBeTrue();
	});

	it('resets all properties', () => {
		const store = setup({
			mapContextMenu: {
				coordinate: [21, 42],
				content: 'content',
				active: true
			}
		});

		closeContextMenu();

		const { coordinate, content, active } = store.getState().mapContextMenu;
		expect(coordinate).toBeNull();
		expect(content).toBeNull();
		expect(active).toBeFalse();
	});

	it('updates the "content" property', () => {
		const store = setup({
			mapContextMenu: {
				coordinate: [21, 42],
				content: 'content',
				active: true
			}
		});

		updateContextMenu('new content');

		const { coordinate, content, active } = store.getState().mapContextMenu;
		expect(coordinate).toEqual([21, 42]);
		expect(content).toBe('new content');
		expect(active).toBeTrue();
	});
});
