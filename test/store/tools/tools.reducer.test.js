import { TestUtils } from '../../test-utils.js';
import { toolsReducer } from '../../../src/store/tools/tools.reducer.js';
import { setContainerContent } from '../../../src/store/tools/tools.action.js';


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

	describe('changes the \'content\' property', () => {

		it('sets content id', () => {
			const store = setup();

			setContainerContent('foo');

			expect(store.getState().tools.current).toBe('foo');
		});
	});

});
