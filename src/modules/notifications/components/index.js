import { NotificationPanel } from './NotificationPanel';
import { NotificationItem } from './NotificationItem';

if (!window.customElements.get(NotificationPanel.tag)) {
	window.customElements.define(NotificationPanel.tag, NotificationPanel);
}

if (!window.customElements.get(NotificationItem.tag)) {
	window.customElements.define(NotificationItem.tag, NotificationItem);
}