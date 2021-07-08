import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { $injector } from '../../../injection';
import css from './notificationPanel.css';
import { AbstractContentPanel } from '../../menu/components/mainMenu/content/AbstractContentPanel';



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
		this._notifications = [];
	}

	/**
	 * @override
	 */
	createView(state) {

		const { notification } = state;
		
		if (notification) {
			this._notifications.push({ ...notification.payload, id:notification.id });
		}
		
		return html`
        <style>${css}</style>
		<div class="notification-panel">
		${this._notifications.length > 0 ? repeat(
		this._notifications, 
		(notification) => notification.id, 
		(notification, index) => {			
			const item = { ...notification, index: index, autocloseTime: notification.permanent ? 0 : 10000 };			
				
			return html`<ba-notification-item .content=${item} .onClose=${(event) => this._remove(event)}></ba-notification-item>`;
		}) 
		: html.nothing}  
		</div>
        `;
	}

	/**
	  * @override
	  * @param {Object} globalState 
	  */
	extractState(globalState) {
		const { notifications: { notification } } = globalState;
	
		return { notification };
	}

	static get tag() {
		return 'ba-notification-panel';
	}

	_remove(notification) {
		this._notifications = this._notifications.filter(n => n.id !== notification.id);
	}
}