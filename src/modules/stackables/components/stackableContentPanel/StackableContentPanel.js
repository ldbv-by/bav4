/**
 * @module modules/stackables/components/stackableContentPanel/StackableContentPanel
 */
import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import css from './stackableContentPanel.css';
import { MvuElement } from '../../../MvuElement';
import { INTERACTION_BOTTOM_SHEET_ID } from '../../../../store/bottomSheet/bottomSheet.reducer';

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
			interactionBottomSheet: null,
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
		const getInteractionBottomSheet = (data) => {
			const interactionBottomSheet = data.data.find((b) => b.content && b.id === INTERACTION_BOTTOM_SHEET_ID);
			return interactionBottomSheet ?? null;
		};
		const getMostVisibleBottomSheet = (data) => {
			const mostVisibleBottomSheet = data.data.find((b) => b.content && b.id !== INTERACTION_BOTTOM_SHEET_ID);
			return mostVisibleBottomSheet ?? null;
		};
		switch (type) {
			case Update_Notifications:
				return {
					...model,
					notifications: [{ ...data.payload, id: data.id }].concat(model.notifications),
					lastNotification: data
				};
			case Update_Bottom_Sheet:
				return { ...model, interactionBottomSheet: getInteractionBottomSheet(data), bottomSheet: getMostVisibleBottomSheet(data) };
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
		const { notifications, interactionBottomSheet, bottomSheet, autocloseTime } = model;

		const createNotificationItem = (notification, index) => {
			const item = { ...notification, index: index, autocloseTime: autocloseTime };
			return html`<ba-notification-item
				.content=${item}
				.onClose=${(event) => this.signal(Update_Remove_Notification, event)}
			></ba-notification-item>`;
		};
		const createInteractionBottomSheet = (interactionBottomSheet) => {
			return interactionBottomSheet
				? html`<ba-bottom-sheet
						class="interaction-bottomsheet"
						.id=${interactionBottomSheet.id}
						.content=${interactionBottomSheet.content}
					></ba-bottom-sheet>`
				: nothing;
		};
		const createBottomSheet = (bottomSheet) => {
			return bottomSheet ? html`<ba-bottom-sheet .id=${bottomSheet.id} .content=${bottomSheet.content}></ba-bottom-sheet>` : nothing;
		};

		const isEmpty = notifications.length === 0 && bottomSheet == null && interactionBottomSheet == null;

		return isEmpty
			? nothing
			: html` <style>
						${css}
					</style>
					<div class="stackable-content-notification-panel">${repeat(notifications, (notification) => notification.id, createNotificationItem)}</div>
					<div class="stackable-content-sheet-panel">${createInteractionBottomSheet(interactionBottomSheet)}${createBottomSheet(bottomSheet)}</div>`;
	}

	static get tag() {
		return 'ba-notification-panel';
	}
}
