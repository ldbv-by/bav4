import { NotificationItem, NOTIFICATION_AUTOCLOSE_TIME_NEVER } from '../../../../src/modules/stackables/components/NotificationItem';
import { notificationReducer } from '../../../../src/store/notifications/notifications.reducer';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';
import { html } from 'lit-html';
import { LevelTypes } from '../../../../src/store/notifications/notifications.action';
import { TEST_ID_ATTRIBUTE_NAME } from '../../../../src/utils/markup';

window.customElements.define(NotificationItem.tag, NotificationItem);

describe('NotificationItem', () => {
	const notificationContent = {
		content: 'Foo',
		level: LevelTypes.INFO,
		autocloseTime: 0
	};

	const setup = async (notification = null) => {
		TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });
		const element = await TestUtils.render(NotificationItem.tag);
		element.content = notification;
		return element;
	};

	describe('constructor', () => {
		TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		it('sets a default model', async () => {
			const element = new NotificationItem();

			expect(element.getModel()).toEqual({
				notification: { content: null, level: null, autocloseTime: NOTIFICATION_AUTOCLOSE_TIME_NEVER },
				autocloseTimeoutId: null
			});
		});
	});

	describe('when initialized', () => {

		it('renders nothing when no data available', async () => {
			const element = await setup();

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when notification item is rendered', () => {

		beforeEach(function () {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('displays the notification content', async () => {
			const element = await setup({ ...notificationContent, content: 'FooBar' });
			const contentElement = element.shadowRoot.querySelector('.notification_content');

			expect(contentElement.innerText).toContain('FooBar');
			expect(element.shadowRoot.querySelectorAll(`[${TEST_ID_ATTRIBUTE_NAME}]`)).toHaveSize(1);
			expect(element.shadowRoot.querySelector('#notification-info').hasAttribute(TEST_ID_ATTRIBUTE_NAME)).toBeTrue();
		});

		it('displays the notification content from a lit-html template-result', async () => {
			const template = (str) => html`${str}`;

			const element = await setup({ ...notificationContent, content: template('FooBarBaz'), level: LevelTypes.CUSTOM });
			const contentElement = element.shadowRoot.querySelector('.notification_content');

			expect(contentElement.innerText).toMatch(/FooBarBaz[\r\n]?/);
		});

		it('starts hiding with autoclose after 1 sec.', async () => {
			const autocloseTime = 1000;
			const laterThenAutoCloseTime = autocloseTime + 100;
			const notification = { ...notificationContent, content: 'FooBar', autocloseTime: autocloseTime };

			const element = await setup(notification);
			const hideSpy = spyOn(element, '_hide').and.callThrough();

			jasmine.clock().tick(laterThenAutoCloseTime);

			expect(hideSpy).toHaveBeenCalled();
		});

		it('closes the notification item with call of onClose', async () => {
			const autocloseTime = 1000;
			const laterThenAutoCloseTime = autocloseTime + 100;
			const notification = { ...notificationContent, content: 'FooBar', autocloseTime: autocloseTime };

			const element = await setup(notification);
			element.onClose = jasmine.createSpy();
			const hideSpy = spyOn(element, '_hide').and.callThrough();
			const notificationElement = element.shadowRoot.querySelector('.notification_item');

			jasmine.clock().tick(laterThenAutoCloseTime);
			notificationElement.dispatchEvent(new Event('animationend'));
			expect(hideSpy).toHaveBeenCalled();


			expect(element.onClose).toHaveBeenCalledWith(notification);
		});

		describe('displays the level type', () => {

			it('info', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.INFO });
				const contentElement = element.shadowRoot.querySelector('.notification_level');

				expect(contentElement.innerText).toContain('notifications_item_info');
			});

			it('warn', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.WARN });
				const contentElement = element.shadowRoot.querySelector('.notification_level');

				expect(contentElement.innerText).toContain('notifications_item_warn');
			});

			it('error', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.ERROR });
				const contentElement = element.shadowRoot.querySelector('.notification_level');

				expect(contentElement.innerText).toContain('notifications_item_error');
			});

			it('custom', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.custom });

				expect(element.shadowRoot.querySelector('.notification_level')).toBeFalsy();
			});

		});
	});
});
