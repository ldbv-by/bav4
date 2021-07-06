import { html } from 'lit-html';
import css from './notificationPanel.css';
import { AbstractContentPanel } from '../../menu/components/mainMenu/content/AbstractContentPanel';

/**
 * Container for notifications.
 * @class
 * @author thiloSchlemmer
 */
export class NotificationPanel extends AbstractContentPanel {

	/**
     * 
     */
	createView() {
		return html`
        <style>${css}</style>
		<div class="notification-panel">
		</div>
        `;
	}

	static get tag() {
		return 'ba-notification-panel';
	}
}