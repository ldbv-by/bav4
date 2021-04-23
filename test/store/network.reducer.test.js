import { networkReducer } from '../../src/store/network/network.reducer';
import { setFetching, setOffline } from '../../src/store/network/network.action';
import { TestUtils } from '../test-utils.js';


describe('positionReducer', () => {

	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			network: networkReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().network.fetching).toBeFalse();
		expect(store.getState().network.offline).toBeFalse();
	});

	it('changes the \'offline\' property', () => {
		const store = setup();

		setOffline(true);

		expect(store.getState().network.offline).toBeTrue();

		setOffline(false);

		expect(store.getState().network.offline).toBeFalse();
	});

	it('changes the \'fetching\' property', () => {
		const store = setup();

		setFetching(true);

		expect(store.getState().network.fetching).toBeTrue();

		setFetching(false);

		expect(store.getState().network.fetching).toBeFalse();
	});
});

