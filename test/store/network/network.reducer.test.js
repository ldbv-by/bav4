import { networkReducer } from '../../../src/store/network/network.reducer';
import { setFetching, setOffline } from '../../../src/store/network/network.action';
import { TestUtils } from '../../test-utils.js';

describe('networkReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			network: networkReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().network.fetching).toBeFalse();
		expect(store.getState().network.pendingRequests).toBe(0);
		expect(store.getState().network.offline).toBeFalse();
	});

	it("changes the 'offline' property", () => {
		const store = setup();

		setOffline(true);

		expect(store.getState().network.offline).toBeTrue();

		setOffline(false);

		expect(store.getState().network.offline).toBeFalse();
	});

	it("changes the 'fetching' property", () => {
		const store = setup();

		setFetching(true);
		setFetching(true);

		expect(store.getState().network.fetching).toBeTrue();
		expect(store.getState().network.pendingRequests).toBe(2);

		setFetching(false);

		expect(store.getState().network.fetching).toBeTrue();
		expect(store.getState().network.pendingRequests).toBe(1);

		setFetching(false);

		expect(store.getState().network.fetching).toBeFalse();
		expect(store.getState().network.pendingRequests).toBe(0);

		setFetching(false);
		setFetching(false);
		setFetching(false);

		expect(store.getState().network.fetching).toBeFalse();
		expect(store.getState().network.pendingRequests).toBe(0);

		setFetching(true);

		expect(store.getState().network.fetching).toBeTrue();
		expect(store.getState().network.pendingRequests).toBe(1);
	});
});
