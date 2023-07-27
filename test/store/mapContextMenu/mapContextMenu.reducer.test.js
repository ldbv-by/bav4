import { TestUtils } from '../../test-utils.js';
import { mapContextMenuReducer } from '../../../src/store/mapContextMenu/mapContextMenu.reducer';
import { close, open } from '../../../src/store/mapContextMenu/mapContextMenu.action';

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
	});

	it("updates the 'coordinate' and 'data' property", () => {
		const store = setup();

		open([21, 42], 'content');

		const { coordinate, content } = store.getState().mapContextMenu;
		expect(coordinate).toEqual([21, 42]);
		expect(content).toBe('content');
	});

	it('updates the mode property', () => {
		const store = setup({
			mapContextMenu: {
				coordinate: [21, 42],
				content: 'content'
			}
		});

		close();

		expect(store).toBeNull;
	});
});
