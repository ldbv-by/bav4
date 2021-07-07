import { NotificationPanel } from './NotificationPanel';

if (!window.customElements.get(NotificationPanel.tag)) {
	window.customElements.define(NotificationPanel.tag, NotificationPanel);
}