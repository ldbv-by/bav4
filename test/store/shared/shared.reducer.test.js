import { setFileSaveResult, acknowledgeTermsOfUse } from '../../../src/store/shared/shared.action';
import { sharedReducer } from '../../../src/store/shared/shared.reducer';
import { TestUtils } from '../../test-utils';


describe('sharedReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			shared: sharedReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();
		expect(store.getState().shared.fileSaveResult).toBeNull();
	});

	it('updates the termsOfUseAcknowlegded property', () => {
		const store = setup();

		expect(store.getState().shared.termsOfUseAcknowledged).toBeFalse();

		acknowledgeTermsOfUse();

		expect(store.getState().shared.termsOfUseAcknowledged).toBeTrue();
	});

	it('updates the fileSaveResult property', () => {
		const store = setup();
		const fileSaveResult = { adminId: 'fooBarId', fileId: 'barBazId' };

		setFileSaveResult(fileSaveResult);

		expect(store.getState().shared.fileSaveResult).toEqual({ adminId: 'fooBarId', fileId: 'barBazId' });
	});

});
