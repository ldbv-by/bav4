import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../injection';
import { NOTIFICATION_AUTOCLOSE_TIME_NEVER } from './NotificationItem';
import css from './notificationPanel.css';
import { AbstractContentPanel } from '../../menu/components/mainMenu/content/AbstractContentPanel';


const notification_autoclose_time = 10000;
/**
 * Container for notifications.
 * @class
 * @author thiloSchlemmer
 */
export class NotificationPanel extends AbstractContentPanel {


	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._notifications = [];
		this._lastNotification = null;
		this._notification_autoclose_time = notification_autoclose_time;
	}

	/**
	 * @override
	 */
	createView(state) {

		const { notification } = state;
		const hasNotification = (candidate) => this._notifications.find(old => old.id === candidate.id);

		if (notification && !hasNotification(notification)) {
			this._add(notification);
		}

		return html`
        <style>${css}</style>
		<div class="notification-panel">
		${this._notifications.length > 0 ? repeat(
		this._notifications,
		(notification) => notification.id,
		(notification, index) => {
			const item = { ...notification, index: index, autocloseTime: notification.permanent ? NOTIFICATION_AUTOCLOSE_TIME_NEVER : this._notification_autoclose_time };
			return html`<ba-notification-item .content=${item} .onClose=${(event) => this._remove(event)}></ba-notification-item>`;
		})
		: html.nothing}  
		</div>
        `;
	}

	/**
	  * @override
	  * @param {Object} globalState 
	  */
	extractState(globalState) {
		const { notifications: { notification } } = globalState;

		return { notification };
	}

	static get tag() {
		return 'ba-notification-panel';
	}

	_add(notification) {
		// We must save the last notification, to decide, wheter a notification should be stored in the currently empty notification queue or not.
		// If the notification IS the last notification and the queue is empty, then this notification was successfull closed/removed behorehand.
		if (this._lastNotification !== notification) {
			this._lastNotification = notification;

			// adding in LIFO-manner 
			this._notifications = [{ ...notification.payload, id: notification.id }].concat(this._notifications);
		}

	}

	_remove(notification) {
		this._notifications = this._notifications.filter(n => n.id !== notification.id && n.message !== notification.message);
		this.render();
	}
}