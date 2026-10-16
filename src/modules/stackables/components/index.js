import { BottomSheet } from './bottomSheet/BottomSheet';
import { NotificationItem } from './notificationItem/NotificationItem';
import { StackableContentPanel } from './stackableContentPanel/StackableContentPanel';

if (!window.customElements.get(StackableContentPanel.tag)) {
	window.customElements.define(StackableContentPanel.tag, StackableContentPanel);
}

if (!window.customElements.get(BottomSheet.tag)) {
	window.customElements.define(BottomSheet.tag, BottomSheet);
}

if (!window.customElements.get(NotificationItem.tag)) {
	window.customElements.define(NotificationItem.tag, NotificationItem);
}
