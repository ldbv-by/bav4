import { setSignedIn, setSignedOut } from '../../../src/store/auth/auth.action.js';
import { authReducer } from '../../../src/store/auth/auth.reducer.js';
import { TestUtils } from '../../test-utils.js';

describe('authReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			auth: authReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().auth.signedIn).toBeFalse();
		expect(store.getState().auth.byUser).toBeFalse();
	});

	it('updates the stores properties', () => {
		const store = setup();

		setSignedIn();

		expect(store.getState().auth.signedIn).toBeTrue();
		expect(store.getState().auth.byUser).toBeTrue();

		setSignedOut(true);

		expect(store.getState().auth.signedIn).toBeFalse();
		expect(store.getState().auth.byUser).toBeTrue();

		setSignedIn();

		setSignedOut(false);

		expect(store.getState().auth.signedIn).toBeFalse();
		expect(store.getState().auth.byUser).toBeFalse();
	});
});
