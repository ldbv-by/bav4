import { NotificationPanel } from '../../../../src/modules/notifications/components/NotificationPanel';
import { NotificationItem, NOTIFICATION_AUTOCLOSE_TIME_NEVER } from '../../../../src/modules/notifications/components/NotificationItem';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { emitFixedNotification, emitNotification, LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { pointerReducer } from '../../../../src/store/pointer/pointer.reducer';

window.customElements.define(NotificationPanel.tag, NotificationPanel);
window.customElements.define(NotificationItem.tag, NotificationItem);

describe('NotificationPanel', () => {
	const setup = async (state = { notifications: { notification: null } }) => {
		TestUtils.setupStoreAndDi(state, { notifications: notificationReducer, pointer: pointerReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		const element = await TestUtils.render(NotificationPanel.tag);

		return element;
	};

	it('displays the empty panel', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._model.notifications.length).toBe(0);
	});

	it('adds a NotificationItem, when a notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._model.notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);

		expect(element._model.notifications.length).toBe(1);
		expect(element._model.notifications[0].id).toEqual(jasmine.any(Number));
		expect(element._model.notifications[0].content).toBe('fooBar');
		expect(element._model.notifications[0].level).toBe(LevelTypes.INFO);

		const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
		expect(notificationElement).toBeTruthy();
	});

	it('adds another NotificationItem, when a notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._model.notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);
		emitNotification('fooBar', LevelTypes.INFO);

		expect(element._model.notifications.length).toBe(2);

		const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
		expect(notificationElements.length).toBe(2);
	});

	it('adds a fixed NotificationItem, when a notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._model.notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);
		emitFixedNotification('fooBar');

		expect(element._model.notifications.length).toBe(1);
		expect(element._model.fixedNotification).toBeTruthy();

		const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
		expect(notificationElements.length).toBe(2);
	});


	it('adds and replace a fixed NotificationItem, when a notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._model.notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);
		emitFixedNotification('fooBar');

		expect(element._model.notifications.length).toBe(1);
		expect(element._model.fixedNotification).toBeTruthy();

		emitFixedNotification('fooBarBaz');

		expect(element._model.notifications.length).toBe(1);
		expect(element._model.fixedNotification).toBeTruthy();

		const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
		expect(notificationElements.length).toBe(2);
	});

	it('adds a NotificationItem only once, when panel is rerendered', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._model.notifications.length).toBe(0);

		emitNotification('fooBar', LevelTypes.INFO);

		expect(element._model.notifications.length).toBe(1);

		await element.render();
		await element.render();

		expect(element._model.notifications.length).toBe(1);

		const notificationElements = element.shadowRoot.querySelectorAll('ba-notification-item');
		expect(notificationElements.length).toBe(1);
	});

	it('uses the default constant, when a fixed notification is emitted', async () => {
		const element = await setup();

		expect(element).toBeTruthy();
		expect(element._model.notifications.length).toBe(0);

		emitFixedNotification('fooBar');

		const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
		expect(notificationElement).toBeTruthy();
		expect(notificationElement._model.notification.autocloseTime).toBe(NOTIFICATION_AUTOCLOSE_TIME_NEVER);
	});

	it('removes notificationItem, when a notification-item closes', async (done) => {
		const autocloseTime = 1000;
		const laterThenPanelAutoCloseTime = autocloseTime + 100;
		const element = await setup();
		element.signal('update_autoclose_time', autocloseTime);
		expect(element).toBeTruthy();

		emitNotification('fooBar', LevelTypes.INFO);

		const notificationElement = element.shadowRoot.querySelector('ba-notification-item');
		const notificationItemElement = notificationElement.shadowRoot.querySelector('.notification_item');

		setTimeout(() => {
			notificationItemElement.dispatchEvent(new Event('animationend'));
			setTimeout(() => {
				expect(element.shadowRoot.querySelector('ba-notification-item')).toBeFalsy();
			});
			done();
		}, laterThenPanelAutoCloseTime);
	});


});
