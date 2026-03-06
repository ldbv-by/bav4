import { acknowledgeTermsOfUse } from '@src/store/shared/shared.action';
import { sharedReducer } from '@src/store/shared/shared.reducer';
import { TestUtils } from '@test/test-utils';

describe('sharedReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			shared: sharedReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().shared.termsOfUseAcknowledged).toBe(false);
	});

	it('updates the termsOfUseAcknowlegded property', () => {
		const store = setup();

		expect(store.getState().shared.termsOfUseAcknowledged).toBe(false);

		acknowledgeTermsOfUse();

		expect(store.getState().shared.termsOfUseAcknowledged).toBe(true);
	});
});
