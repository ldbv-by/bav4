import { TestUtils } from '../../test-utils.js';
import { toolsReducer } from '../../../src/store/tools/tools.reducer.js';
import { setCurrentTool } from '../../../src/store/tools/tools.action.js';


describe('toolContainerReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			tools: toolsReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().tools.current).toBeNull();
	});

	it('changes the \'current\' property', () => {
		const store = setup();

		setCurrentTool('foo');

		expect(store.getState().tools.current).toBe('foo');

		setCurrentTool(null);

		expect(store.getState().tools.current).toBeNull();
	});
});
