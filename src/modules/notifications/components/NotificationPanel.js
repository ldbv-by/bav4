import { html } from 'lit-html';
import { $injector } from '../../../injection';
import css from './notificationPanel.css';
import { AbstractContentPanel } from '../../menu/components/mainMenu/content/AbstractContentPanel';
import { observe } from '../../../utils/storeUtils';
import { NotificationItem } from './NotificationItem';


/**
 * Container for notifications.
 * @class
 * @author thiloSchlemmer
 */
export class NotificationPanel extends AbstractContentPanel {


	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService', 'GeoResourceService');
		this._translationService = TranslationService;
		this._registeredObservers = this._register(this._storeService.getStore());
	}

	/**
	 * @override
	 */
	createView() {
		return html`
        <style>${css}</style>
		<div class="notification-panel">
		</div>
        `;
	}

	_showNotification(e) {
		const parent = this.shadowRoot.querySelector('.notification-panel');
		const item = document.createElement(NotificationItem.tag);
		item.content = e.payload;
		parent.appendChild(item);
	}

	_register(store) {
		return [
			observe(store, state => state.notifications.notification, (e) => this._showNotification(e))
		];
	}

	static get tag() {
		return 'ba-notification-panel';
	}
}