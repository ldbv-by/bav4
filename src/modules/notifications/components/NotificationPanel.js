import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../injection';
import { NOTIFICATION_AUTOCLOSE_TIME_NEVER } from './NotificationItem';
import css from './notificationPanel.css';
import { MvuElement } from '../../MvuElement';
import { LevelTypes } from '../../../store/notifications/notifications.action';


const Notification_Autoclose_Time = 10000;
const Update_Notifications = 'update_notifications';
const Update_Fixed_Notification = 'update_fixed_notifications';
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
			fixedNotification: null,
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
			if (notification) {
				const level = notification.payload.level;
				switch (level) {
					case LevelTypes.CUSTOM:
						this.signal(Update_Fixed_Notification, notification);
						break;
					case LevelTypes.INFO:
					case LevelTypes.WARN:
					case LevelTypes.ERROR:
						if (!hasNotification(notification) && lastNotification !== notification) {
							this.signal(Update_Notifications, notification);
						}
						break;
				}
			}

		};
		const empty = { payload: null, id: 0 };

		this.observe(state => state.notifications.latest, onLatestChanged);
		this.observe(state => state.pointer.beingDragged, () => this.signal(Update_Fixed_Notification, empty));
		this.observe(state => state.pointer.contextClick, () => this.signal(Update_Fixed_Notification, empty));
		this.observe(state => state.pointer.click, () => this.signal(Update_Fixed_Notification, empty));
	}

	update(type, data, model) {
		switch (type) {
			case Update_Notifications:
				return {
					...model,
					notifications: [{ ...data.payload, id: data.id }].concat(model.notifications),
					lastNotification: data
				};
			case Update_Fixed_Notification:
				return { ...model, fixedNotification: { ...data.payload, id: data.id } };
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
		const { notifications, fixedNotification, autocloseTime } = model;

		const createNotificationItem = (notification, index) => {
			const item = { ...notification, index: index, autocloseTime: notification.permanent ? NOTIFICATION_AUTOCLOSE_TIME_NEVER : autocloseTime };
			return html`<ba-notification-item .content=${item} .onClose=${(event) => this.signal(Update_Remove_Notification, event)}></ba-notification-item>`;
		};

		const createFixedNotificationItem = (notification) => {
			if (notification && notification.content) {
				const item = { ...notification, autocloseTime: NOTIFICATION_AUTOCLOSE_TIME_NEVER };
				return html`<ba-notification-item .content=${item}></ba-notification-item>`;
			}
			return nothing;
		};
		return html`
        <style>${css}</style>
		<div class="notification-panel">
			${repeat(notifications, (notification) => notification.id, createNotificationItem)}  
			${createFixedNotificationItem(fixedNotification)}
		</div>
        `;
	}

	static get tag() {
		return 'ba-notification-panel';
	}
}
