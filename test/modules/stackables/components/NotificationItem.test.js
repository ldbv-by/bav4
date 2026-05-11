import { NotificationItem, NOTIFICATION_AUTOCLOSE_TIME_NEVER } from '@src/modules/stackables/components/notificationItem/NotificationItem';
import { notificationReducer } from '@src/store/notifications/notifications.reducer';
import { TestUtils } from '@test/test-utils';
import { $injector } from '@src/injection';
import { html } from 'lit-html';
import { LevelTypes } from '@src/store/notifications/notifications.action';

window.customElements.define(NotificationItem.tag, NotificationItem);

describe('NotificationItem', () => {
	const notificationContent = {
		content: 'Foo',
		level: LevelTypes.INFO,
		autocloseTime: 0
	};

	const securityServiceMock = {
		sanitizeHtml(html) {
			return html;
		}
	};

	const setup = async (notification = null) => {
		TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('SecurityService', securityServiceMock);

		const element = await TestUtils.render(NotificationItem.tag);
		element.content = notification;
		return element;
	};

	describe('constructor', () => {
		TestUtils.setupStoreAndDi({}, { notifications: notificationReducer });
		$injector.registerSingleton('TranslationService', { translate: (key) => key }).registerSingleton('SecurityService', securityServiceMock);

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

		it('has default callback methods', async () => {
			const element = await setup();

			expect(element._onClose).toBeDefined();
		});
	});

	describe('when notification item is rendered', () => {
		beforeEach(function () {
			vi.useFakeTimers();
		});

		afterEach(function () {
			vi.useRealTimers();
		});

		it('displays the notification content', async () => {
			const element = await setup({ ...notificationContent, content: 'FooBar' });
			const contentElement = element.shadowRoot.querySelector('.notification_content');

			expect(contentElement.innerText).toContain('FooBar');
		});

		it('displays the notification content from a lit-html template-result', async () => {
			const template = (str) => html`${str}`;

			const element = await setup({ ...notificationContent, content: template('FooBarBaz'), level: LevelTypes.CUSTOM });
			const contentElement = element.shadowRoot.querySelector('.notification_content');

			expect(contentElement.innerText).toMatch(/FooBarBaz[\r\n]?/);
		});

		it('displays the notification content string sanitized', async () => {
			const sanitizeSpy = vi.spyOn(securityServiceMock, 'sanitizeHtml');

			const element = await setup({ ...notificationContent, content: 'FooBar' });
			const contentElement = element.shadowRoot.querySelector('.notification_content');

			expect(contentElement.innerText).toContain('FooBar');
			expect(sanitizeSpy).toHaveBeenCalledWith('FooBar');
		});

		it('displays the notification content from a lit-html template-result NOT sanitized', async () => {
			const sanitizeSpy = vi.spyOn(securityServiceMock, 'sanitizeHtml');
			const template = (str) => html`${str}`;

			const element = await setup({ ...notificationContent, content: template('FooBarBaz'), level: LevelTypes.CUSTOM });
			const contentElement = element.shadowRoot.querySelector('.notification_content');

			expect(contentElement.innerText).toMatch(/FooBarBaz[\r\n]?/);
			expect(sanitizeSpy).not.toHaveBeenCalledWith(expect.any(Object));
		});

		it('starts hiding with autoclose after 1 sec.', async () => {
			const autocloseTime = 1000;
			const laterThenAutoCloseTime = autocloseTime + 100;
			const notification = { ...notificationContent, content: 'FooBar', autocloseTime: autocloseTime };

			const element = await setup(notification);
			const hideSpy = vi.spyOn(element, '_hide');
			vi.advanceTimersByTime(laterThenAutoCloseTime);

			expect(hideSpy).toHaveBeenCalled();
		});

		it('closes the notification item with call of onClose', async () => {
			const autocloseTime = 1000;
			const laterThenAutoCloseTime = autocloseTime + 100;
			const notification = { ...notificationContent, content: 'FooBar', autocloseTime: autocloseTime };

			const element = await setup(notification);
			element.onClose = vi.fn();
			const hideSpy = vi.spyOn(element, '_hide');
			const notificationElement = element.shadowRoot.querySelector('.notification_item');

			vi.advanceTimersByTime(laterThenAutoCloseTime);
			notificationElement.dispatchEvent(new Event('animationend'));
			expect(hideSpy).toHaveBeenCalled();

			expect(element.onClose).toHaveBeenCalledWith(notification);
		});

		it('closes the notification item with call of _onClose', async () => {
			const autocloseTime = 1000;
			const laterThenAutoCloseTime = autocloseTime + 100;
			const notification = { ...notificationContent, content: 'FooBar', autocloseTime: autocloseTime };

			const element = await setup(notification);
			const closeSpy = vi.spyOn(element, '_onClose');
			const hideSpy = vi.spyOn(element, '_hide');
			const notificationElement = element.shadowRoot.querySelector('.notification_item');

			vi.advanceTimersByTime(laterThenAutoCloseTime);
			notificationElement.dispatchEvent(new Event('animationend'));
			expect(hideSpy).toHaveBeenCalled();
			expect(closeSpy).toHaveBeenCalled();
		});

		it('closes the notification on click', async () => {
			const autocloseTime = 10000;
			const notification = { ...notificationContent, content: 'FooBar', autocloseTime: autocloseTime };

			const element = await setup(notification);
			const notificationElement = element.shadowRoot.querySelector('.notification_item');
			const hideSpy = vi.spyOn(element, '_hide');

			notificationElement.click();

			expect(hideSpy).toHaveBeenCalled();
		});

		describe('has a level title', () => {
			it('info', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.INFO });
				const notificationElement = element.shadowRoot.querySelector('.notification_item');

				expect(notificationElement.title).toBe('notifications_item_info');
			});

			it('warn', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.WARN });
				const notificationElement = element.shadowRoot.querySelector('.notification_item');

				expect(notificationElement.title).toBe('notifications_item_warn');
			});

			it('error', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.ERROR });
				const notificationElement = element.shadowRoot.querySelector('.notification_item');

				expect(notificationElement.title).toBe('notifications_item_error');
			});

			it('custom', async () => {
				const element = await setup({ ...notificationContent, level: LevelTypes.custom });
				const notificationElement = element.shadowRoot.querySelector('.notification_item');
				expect(notificationElement.title).toBe('');
			});
		});
	});
});
