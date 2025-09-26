import { AdminStoreService } from '../../../../src/modules/admin/services/AdminStoreService';

describe('AdminStoreService', () => {
	describe('constructor', () => {
		it('registers all reducers', () => {
			const instanceUnderTest = new AdminStoreService();

			const store = instanceUnderTest.getStore();
			expect(store).toBeDefined();

			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(2);
			expect(reducerKeys.includes('notifications')).toBeTrue();
			expect(reducerKeys.includes('bottomSheet')).toBeTrue();
		});
	});
});
