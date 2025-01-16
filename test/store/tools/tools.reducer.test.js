import { TestUtils } from '../../test-utils.js';
import { toolsReducer } from '../../../src/store/tools/tools.reducer.js';
import { setCurrentTool, toggleCurrentTool } from '../../../src/store/tools/tools.action.js';

describe('toolContainerReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			tools: toolsReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().tools.current).toBeNull();
	});

	describe('setCurrentTool', () => {
		it("changes the 'current' property", () => {
			const store = setup();

			setCurrentTool('foo');

			expect(store.getState().tools.current).toBe('foo');

			setCurrentTool(null);

			expect(store.getState().tools.current).toBeNull();
		});
	});

	describe('toggleCurrentTool', () => {
		it("changes the 'current' property", () => {
			const store = setup();

			toggleCurrentTool('foo');

			expect(store.getState().tools.current).toBe('foo');

			toggleCurrentTool('bar');

			expect(store.getState().tools.current).toBe('bar');

			toggleCurrentTool('bar');

			expect(store.getState().tools.current).toBeNull();

			toggleCurrentTool(null);

			expect(store.getState().tools.current).toBeNull();
		});
	});
});
