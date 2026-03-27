import { AdminStoreService } from '@src/modules/admin/services/AdminStoreService';

describe('AdminStoreService', () => {
	describe('constructor', () => {
		it('registers all reducers', () => {
			const instanceUnderTest = new AdminStoreService();

			const store = instanceUnderTest.getStore();
			expect(store).toBeDefined();

			const reducerKeys = Object.keys(store.getState());
			expect(reducerKeys.length).toBe(4);
			expect(reducerKeys.includes('modal')).toBe(true);
			expect(reducerKeys.includes('media')).toBe(true);
			expect(reducerKeys.includes('notifications')).toBe(true);
			expect(reducerKeys.includes('bottomSheet')).toBe(true);
		});
	});
});
