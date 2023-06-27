import { closeModal, decrementStep, incrementStep, openModal } from '../../../src/store/modal/modal.action.js';
import { modalReducer } from '../../../src/store/modal/modal.reducer.js';
import { TestUtils } from '../../test-utils.js';

describe('modalReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			modal: modalReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().modal.active).toBeFalse();
		expect(store.getState().modal.data).toBeNull();
		expect(store.getState().modal.currentStep).toBe(0);
		expect(store.getState().modal.steps).toBe(1);
	});

	it('opens and closes the modal without options', () => {
		const store = setup();

		openModal('title', 'content');

		expect(store.getState().modal.data.title).toEqual('title');
		expect(store.getState().modal.active).toBeTrue();
		expect(store.getState().modal.currentStep).toBe(0);
		expect(store.getState().modal.steps).toBe(1);

		closeModal();

		expect(store.getState().modal.data).toBeNull();
		expect(store.getState().modal.active).toBeFalse();
		expect(store.getState().modal.currentStep).toBe(0);
		expect(store.getState().modal.steps).toBe(1);
	});

	it('opens and closes the modal with "steps" option', () => {
		const store = setup();

		openModal('title', 'content', { steps: 2 });

		expect(store.getState().modal.data.title).toEqual('title');
		expect(store.getState().modal.active).toBeTrue();
		expect(store.getState().modal.currentStep).toBe(0);
		expect(store.getState().modal.steps).toBe(2);

		incrementStep();
		closeModal();

		expect(store.getState().modal.data).toBeNull();
		expect(store.getState().modal.active).toBeFalse();
		expect(store.getState().modal.currentStep).toBe(0);
		expect(store.getState().modal.steps).toBe(1);
	});

	it('increments and decrements the current step', () => {
		const store = setup();

		openModal('title', 'content', { steps: 2 });

		expect(store.getState().modal.data.title).toEqual('title');
		expect(store.getState().modal.active).toBeTrue();
		expect(store.getState().modal.currentStep).toBe(0);
		expect(store.getState().modal.steps).toBe(2);

		incrementStep();

		expect(store.getState().modal.currentStep).toBe(1);

		incrementStep();

		expect(store.getState().modal.currentStep).toBe(1);

		decrementStep();

		expect(store.getState().modal.currentStep).toBe(0);

		decrementStep();

		expect(store.getState().modal.currentStep).toBe(0);
	});
});
