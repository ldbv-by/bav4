import { TestUtils } from '../../test-utils.js';
import { toolContainerReducer } from '../../../src/store/tools/toolContainer.reducer.js';
import { setContainerContent } from '../../../src/store/tools/toolContainer.action.js';


describe('toolContainerReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			toolContainer: toolContainerReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().toolContainer.contentId).toBeNull();
	});

	describe('changes the \'content\' property', () => {

		it('sets content id', () => {
			const store = setup();


			setContainerContent('foo');

			expect(store.getState().toolContainer.contentId).toBe('foo');
		});
	});

});
