import { TestUtils } from '../../test-utils';
import { LevelTypes, notificationReducer } from '../../../src/store/notifications/notifications.reducer';
import { emitNotification } from '../../../src/store/notifications/notifications.action';


describe('notificationReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			notifications: notificationReducer
		});
	};

	it('initiales the store with default values', () => {
		const store = setup();
		expect(store.getState().notifications.notification).toBeNull();
	});

	it('sets the \'notification\' property', () => {
		const store = setup();
		const notification = {
			message: 'foo',
			level: LevelTypes.INFO,
			permanent: false
		};

		emitNotification('foo', LevelTypes.INFO, false);
		expect(store.getState().notifications.notification.payload).toEqual(notification);
	});
});