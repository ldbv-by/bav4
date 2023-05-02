/**
 * @module modules/stackables/components/StackableContentPanel
 */
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import css from './stackableContentPanel.css';
import { MvuElement } from '../../../MvuElement';

const Notification_Autoclose_Time = 5000;
const Update_Notifications = 'update_notifications';
const Update_Bottom_Sheet = 'update_bottom_sheet';
const Update_Remove_Notification = 'update_remove_notification';
const Update_Autoclose_Time = 'update_autoclose_time';

/**
 * Container for notifications and the bottom-sheet.
 * @class
 * @author thiloSchlemmer
 */
export class StackableContentPanel extends MvuElement {
	constructor() {
		super({
			notifications: [],
			bottomSheet: null,
			autocloseTime: Notification_Autoclose_Time,
			lastNotification: null
		});
	}

	onInitialize() {
		const onLatestChanged = (notification) => {
			if (notification) {
				this.signal(Update_Notifications, notification);
			}
		};

		const onBottomSheetChanged = (content) => {
			this.signal(Update_Bottom_Sheet, content);
		};

		this.observe((state) => state.notifications.latest, onLatestChanged);
		this.observe((state) => state.bottomSheet, onBottomSheetChanged);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Notifications:
				return {
					...model,
					notifications: [{ ...data.payload, id: data.id }].concat(model.notifications),
					lastNotification: data
				};
			case Update_Bottom_Sheet:
				return { ...model, bottomSheet: data.data };
			case Update_Remove_Notification:
				return { ...model, notifications: model.notifications.filter((n) => n.id !== data.id) };
			case Update_Autoclose_Time:
				return { ...model, autocloseTime: data };
		}
	}

	/**
	 * @override
	 */
	createView(model) {
		const { notifications, bottomSheet, autocloseTime } = model;

		const createNotificationItem = (notification, index) => {
			const item = { ...notification, index: index, autocloseTime: autocloseTime };
			return html`<ba-notification-item
				.content=${item}
				.onClose=${(event) => this.signal(Update_Remove_Notification, event)}
			></ba-notification-item>`;
		};

		const createBottomSheet = (content) => {
			return content ? html`<ba-bottom-sheet .content=${bottomSheet}></ba-bottom-sheet>` : nothing;
		};

		const isEmpty = notifications.length === 0 && bottomSheet == null;

		return isEmpty
			? nothing
			: html` <style>
						${css}
					</style>
					<div class="stackable-content-notification-panel">${repeat(notifications, (notification) => notification.id, createNotificationItem)}</div>
					<div class="stackable-content-sheet-panel">${createBottomSheet(bottomSheet)}</div>`;
	}

	static get tag() {
		return 'ba-notification-panel';
	}
}
