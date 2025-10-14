import { WcStoreService } from '../../../../src/modules/wc/services/WcStoreService';

describe('WcStoreService', () => {
	describe('constructor', () => {
		it('registers all reducers', () => {
			const instanceUnderTest = new WcStoreService();

			const store = instanceUnderTest.getStore();

			expect(store).toBeDefined();
			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(0);
		});
	});
});
