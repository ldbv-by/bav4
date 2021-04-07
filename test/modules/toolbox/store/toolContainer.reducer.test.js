import { TestUtils } from '../../../test-utils.js';
import { toolContainerReducer } from '../../../../src/modules/toolbox/store/toolContainer.reducer';
import { openToolContainer, closeToolContainer, toggleToolContainer, setContainerContent } from '../../../../src/modules/toolbox/store/toolContainer.action';


describe('toolContainerReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			toolContainer: toolContainerReducer
		});
	};


	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().toolContainer.open).toBeFalse();
		expect(store.getState().toolContainer.contentId).toBeFalse();
	});
	describe('changes the \'open\' property', () => {

		it('sets true', () => {
			const store = setup();


			openToolContainer();

			expect(store.getState().toolContainer.open).toBeTrue();
		});

		it('sets false', () => {
			const store = setup({ toolContainer: { open: true, contentId:'foo' } });

			expect(store.getState().toolContainer.open).toBeTrue();

			closeToolContainer();

			expect(store.getState().toolContainer.open).toBeFalse();
		});

		it('toggles current value', () => {
			const store = setup({ toolContainer: { open: true } });

			expect(store.getState().toolContainer.open).toBeTrue();

			toggleToolContainer();

			expect(store.getState().toolContainer.open).toBeFalse();

			toggleToolContainer();

			expect(store.getState().toolContainer.open).toBeTrue();
		});


	});
	describe('changes the \'content\' property', () => {

		it('sets content id', () => {
			const store = setup();


			setContainerContent('foo');

			expect(store.getState().toolContainer.contentId).toBe('foo');
		});
	});

});
