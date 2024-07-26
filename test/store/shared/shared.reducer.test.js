import { acknowledgeTermsOfUse } from '../../../src/store/shared/shared.action';
import { sharedReducer } from '../../../src/store/shared/shared.reducer';
import { TestUtils } from '../../test-utils';

describe('sharedReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			shared: sharedReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();
	});

	it('updates the termsOfUseAcknowlegded property', () => {
		const store = setup();

		expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();

		acknowledgeTermsOfUse();

		expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
	});
});
