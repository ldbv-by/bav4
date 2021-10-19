import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../injection';
import { NOTIFICATION_AUTOCLOSE_TIME_NEVER } from './NotificationItem';
import css from './notificationPanel.css';
import { MvuElement } from '../../MvuElement';


const Notification_Autoclose_Time = 10000;
const Update_Notifications = 'update_notifications';
const Update_Remove_Notification = 'update_remove_notification';
const Update_Autoclose_Time = 'update_autoclose_time';


/**
 * Container for notifications.
 * @class
 * @author thiloSchlemmer
 */
export class NotificationPanel extends MvuElement {

	constructor() {
		super({
			notifications: [],
			autocloseTime: Notification_Autoclose_Time,
			lastNotification: null
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	onInitialize() {
		const { notifications, lastNotification } = this.getModel();
		const hasNotification = (candidate) => notifications.find(old => old.id === candidate.id);

		const onLatestChanged = (notification) => {
			if (notification && !hasNotification(notification) && lastNotification !== notification) {
				this.signal(Update_Notifications, notification);
			}
		};
		this.observe(state => state.notifications.latest, onLatestChanged);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Notifications:
				return {
					...model,
					notifications: [{ ...data.payload, id: data.id }].concat(model.notifications),
					lastNotification: data
				};
			case Update_Remove_Notification:
				return { ...model, notifications: model.notifications.filter(n => n.id !== data.id) };
			case Update_Autoclose_Time:
				return { ...model, autocloseTime: data };
		}
	}


	/**
	 * @override
	 */
	createView(model) {
		const { notifications, autocloseTime } = model;
		const createItem = (notification, index) => {
			const item = { ...notification, index: index, autocloseTime: notification.permanent ? NOTIFICATION_AUTOCLOSE_TIME_NEVER : autocloseTime };
			return html`<ba-notification-item .content=${item} .onClose=${(event) => this.signal(Update_Remove_Notification, event)}></ba-notification-item>`;
		};
		return html`
        <style>${css}</style>
		<div class="notification-panel">
			${repeat(notifications, (notification) => notification.id, createItem) }  
		</div>
        `;
	}

	static get tag() {
		return 'ba-notification-panel';
	}
}
