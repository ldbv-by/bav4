import { closeContainer, openContainer } from '../../../src/store/iframeContainer/iframeContainer.action.js';
import { iframeContainerReducer } from '../../../src/store/iframeContainer/iframeContainer.reducer.js';
import { TestUtils } from '../../test-utils.js';

describe('iframeContainerReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			iframeContainer: iframeContainerReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().iframeContainer.active).toBeFalse();
		expect(store.getState().iframeContainer.content).toBeNull();
	});

	it('updates the stores properties', () => {
		const store = setup();

		openContainer('content');

		expect(store.getState().iframeContainer.content).toBe('content');
		expect(store.getState().iframeContainer.active).toBeTrue();

		closeContainer();

		expect(store.getState().iframeContainer.content).toBeNull();
		expect(store.getState().iframeContainer.active).toBeFalse();
	});
});
