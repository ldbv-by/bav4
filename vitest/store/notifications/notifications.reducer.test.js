import { TestUtils } from '../../test-utils';
import { notificationReducer } from '../../../src/store/notifications/notifications.reducer';
import { emitNotification, LevelTypes } from '../../../src/store/notifications/notifications.action';

describe('notificationReducer', () => {
	const setup = (state) => {
		return TestUtils.setupStoreAndDi(state, {
			notifications: notificationReducer
		});
	};

	it('initializes the store with default values', () => {
		const store = setup();
		expect(store.getState().notifications.latest).toBeNull();
	});

	it("sets the 'notification' property", () => {
		const store = setup();
		const notification = {
			content: 'foo',
			level: LevelTypes.INFO
		};

		emitNotification('foo', LevelTypes.INFO);
		expect(store.getState().notifications.latest.payload).toEqual(notification);
	});
});
