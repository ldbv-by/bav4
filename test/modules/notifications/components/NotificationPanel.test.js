import { NotificationPanel } from '../../../../src/modules/notifications/components/NotificationPanel';
import { NotificationItem, NOTIFICATION_AUTOCLOSE_TIME_NEVER } from '../../../../src/modules/notifications/components/NotificationItem';
import { LevelTypes, notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { emitNotification } from '../../../../src/store/notifications/notifications.action';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(NotificationPanel.tag, NotificationPanel);
window.customElements.define(NotificationItem.tag, NotificationItem);

describe('NotificationPanel', () => {
	const setup = async (state = { notifications: { notification: null } }) => {
		TestUtils.setupStoreAndDi(state, { notifications: notificationReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		const element = await TestUtils.render(NotificationPanel.tag);

		return element;
	};

	it('displays the empty panel', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._notifications.length).toBe(0);
	});

	it('adds a NotificationItem, when a notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);

		expect(element._notifications.length).toBe(1);
		expect(element._notifications[0].id).toEqual(jasmine.any(Number));
		expect(element._notifications[0].message).toBe('fooBar');
		expect(element._notifications[0].level).toBe(LevelTypes.INFO);
		expect(element._notifications[0].permanent).toBeFalse();

		const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
		expect(notificationElement).toBeTruthy();
	});


	it('adds another NotificationItem, when a notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);
		emitNotification('fooBar', LevelTypes.INFO);

		expect(element._notifications.length).toBe(2);

		const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
		expect(notificationElements.length).toBe(2);
	});

	it('adds a NotificationItem only once, when panel is rerendered', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);

		expect(element._notifications.length).toBe(1);

		await element.render();
		await element.render();

		expect(element._notifications.length).toBe(1);

		const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
		expect(notificationElements.length).toBe(1);
	});

	it('adds a NotificationItem only once, when this notification was already closed', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);

		expect(element._notifications.length).toBe(1);

		await element.render();
		element._notifications = [];
		await element.render();

		expect(element._notifications.length).toBe(0);
	});

	it('uses the default constant, when a permanent notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO, true);

		const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
		expect(notificationElement).toBeTruthy();
		expect(notificationElement._autocloseTime).toBe(NOTIFICATION_AUTOCLOSE_TIME_NEVER);
	});

	it('calls the \'remove\'-callback, when a notification-item closes', async (done) => {
		const autocloseTime = 1000;
		const laterThenPanelAutoCloseTime = autocloseTime + 100;
		const element = await setup();
		element._notification_autoclose_time = autocloseTime;
		const removeSpy = spyOn(element, '_remove').and.callThrough();
		expect(element).toBeTruthy();

		emitNotification('fooBar', LevelTypes.INFO);

		const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
		const notificationItemElement = notificationElement.shadowRoot.querySelector('.notification_item');

		setTimeout(() => {
			notificationItemElement.dispatchEvent(new Event('transitionend'));
			setTimeout(() => {
				expect(removeSpy).toHaveBeenCalledWith({ message: 'fooBar', id: jasmine.any(Number), level: LevelTypes.INFO, index: 0, permanent: false, autocloseTime: autocloseTime });
			});
			done();
		}, laterThenPanelAutoCloseTime);
	});


});