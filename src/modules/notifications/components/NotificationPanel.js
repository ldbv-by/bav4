import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../injection';
import { NOTIFICATION_AUTOCLOSE_TIME_NEVER } from './NotificationItem';
import css from './notificationPanel.css';
import { MvuElement } from '../../MvuElement';


const Notification_Autoclose_Time = 10000;
const Update_Notifications = 'update_notifications';
const Update_Remove_Notification = 'update_remove_notification';


/**
 * Container for notifications.
 * @class
 * @author thiloSchlemmer
 */
export class NotificationPanel extends MvuElement {

	constructor() {
		super({
			notifications: [],
			lastNotification: null
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	onInitialize() {
		this.observe(state => state.notifications.notification, (notification) => this.signal(Update_Notifications, notification));
	}

	update(type, data, model) {
		const hasNotification = (candidate) => model.notifications.find(old => old.id === candidate.id);
		switch (type) {
			case Update_Notifications:
				if (data && !hasNotification(data)) {
					if (model.lastNotification !== data) {
						return {
							...model,
							notifications: [{ ...data.payload, id: data.id }].concat(model.notifications),
							lastNotification: data
						};
					}
				}
				return model;
			case Update_Remove_Notification:
				return { ...model, notifications: model.notifications.filter(n => n.id !== data.id) };
		}
	}


	/**
	 * @override
	 */
	createView(model) {
		const { notifications } = model;
		const createItem = (notification, index) => {
			const item = { ...notification, index: index, autocloseTime: notification.permanent ? NOTIFICATION_AUTOCLOSE_TIME_NEVER : Notification_Autoclose_Time };
			return html`<ba-notification-item .content=${item} .onClose=${(event) => this.signal(Update_Remove_Notification, event)}></ba-notification-item>`;
		};

		return html`
        <style>${css}</style>
		<div class="notification-panel">
		${notifications.length > 0 ? repeat(notifications, (notification) => notification.id, createItem) : html.nothing}  
		</div>
        `;
	}

	static get tag() {
		return 'ba-notification-panel';
	}
}
