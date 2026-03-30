import { setSignedIn, setSignedOut } from '@src/store/auth/auth.action.js';
import { authReducer } from '@src/store/auth/auth.reducer.js';
import { TestUtils } from '@test/test-utils.js';

describe('authReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			auth: authReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().auth.signedIn).toBe(false);
		expect(store.getState().auth.byUser).toBe(false);
	});

	it('updates the stores properties', () => {
		const store = setup();

		setSignedIn();

		expect(store.getState().auth.signedIn).toBe(true);
		expect(store.getState().auth.byUser).toBe(true);

		setSignedOut(true);

		expect(store.getState().auth.signedIn).toBe(false);
		expect(store.getState().auth.byUser).toBe(true);

		setSignedIn();

		setSignedOut(false);

		expect(store.getState().auth.signedIn).toBe(false);
		expect(store.getState().auth.byUser).toBe(false);
	});
});
