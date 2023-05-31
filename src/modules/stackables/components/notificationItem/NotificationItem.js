/**
 * @module modules/stackables/components/notificationItem/NotificationItem
 */
import { html, nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../../injection';
import { LevelTypes } from '../../../../store/notifications/notifications.action';
import css from './notificationItem.css';
import { MvuElement } from '../../../MvuElement';

export const NOTIFICATION_AUTOCLOSE_TIME_NEVER = 0;

const Default_Notification_Content = { content: null, level: null, autocloseTime: NOTIFICATION_AUTOCLOSE_TIME_NEVER };
const Update_Notification = 'update_notification';

/**
 * Content of a Notification.
 *
 * @typedef NotificationContent
 * @property {string|TemplateResult} content the displayed content of the notification
 * @property {LevelTypes} level The type of level for this notification
 * @property {Number} autocloseTime the time in ms, when the notification should close automatically. 0 sets the Autoclose to "never".
 */

/**
 * Element to display a notification
 * @class
 * @author thiloSchlemmer
 */
export class NotificationItem extends MvuElement {
	constructor() {
		super({
			notification: Default_Notification_Content,
			autocloseTimeoutId: null
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._onClose = () => {};
	}

	update(type, data, model) {
		const getHideTimeout = () => setTimeout(() => this._hide(), data.autocloseTime);
		switch (type) {
			case Update_Notification:
				return {
					...model,
					notification: data,
					autocloseTimeoutId: data.autocloseTime > NOTIFICATION_AUTOCLOSE_TIME_NEVER ? getHideTimeout() : null
				};
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { notification } = model;
		const translate = (key) => this._translationService.translate(key);
		const levelClass = {
			notification_info: notification.level === LevelTypes.INFO,
			notification_warn: notification.level === LevelTypes.WARN,
			notification_error: notification.level === LevelTypes.ERROR
		};
		const getLevelText = (level) => {
			switch (level) {
				case LevelTypes.INFO:
					return html`<div id="notification-info" data-test-id class="notification_level">${translate('notifications_item_info')}</div>`;
				case LevelTypes.WARN:
					return html`<div class="notification_level">${translate('notifications_item_warn')}</div>`;
				case LevelTypes.ERROR:
					return html`<div class="notification_level">${translate('notifications_item_error')}</div>`;
				default:
					return html.nothing;
			}
		};

		return notification.content
			? html` <style>
						${css}
					</style>
					<div class="notification_item ${classMap(levelClass)}">
						${getLevelText(notification.level)}
						<div class="notification_content">${notification.content}</div>
					</div>`
			: nothing;
	}

	_hide() {
		const { notification, autocloseTimeoutId } = this.getModel();
		const element = this.shadowRoot.querySelector('.notification_item');

		// If the notification-item is not yet closed
		element.classList.add('notification_item_hide');

		element.addEventListener('animationend', () => {
			// If the notification-item is not yet closed
			this.onClose(notification);
			clearTimeout(autocloseTimeoutId);
		});
	}

	static get tag() {
		return 'ba-notification-item';
	}

	/**
	 * Sets the notification content
	 * @param {NotificationContent} notification
	 */
	set content(notification) {
		const content = { ...Default_Notification_Content, ...notification };
		this.signal(Update_Notification, content);
	}

	set onClose(callback) {
		this._onClose = callback;
	}

	get onClose() {
		return this._onClose;
	}
}
