import { BaElement } from '../../BaElement';
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../injection';
import { LevelTypes } from '../../../store/notifications/notifications.reducer';
import css from './notificationItem.css';


export class NotificationItem extends BaElement {
	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._content = null;
		this._autocloseTime = 0;
		this._autocloseTimeout = null;
	}


	/**
     * @override
     */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const levelClass = {
			notification_info: this._content.level === LevelTypes.INFO,
			notification_warn: this._content.level === LevelTypes.WARN,
			notification_error: this._content.level === LevelTypes.ERROR,
		};

		if (this._autocloseTime > 0) {
			this._autocloseTimeout = setTimeout(() => {
				this._hide();
			}, this._autocloseTime);
		}

		return html`
		<style>${css}</style>
		<div class='notification_item ${classMap(levelClass)}'>
        	<div class='notification_content'>${this._content.message}
			<a class='notification_close' href='#'>${translate('notification_item_close')}</a>
		</div>`;
	}

	_hide() {
		const root = this.shadowRoot.querySelector('.notification_item');
		if (root !== null) {
			// If the notification-item is not yet closed
			root.classList.add('notification_item_hide');
		}
		root.addEventListener('transitionend', () => {
			if (root !== null) {
				// If the notification-item is not yet closed
				root.parentNode.removeChild(root);

				clearTimeout(this._autocloseTimeout);
			}
		});
	}

	static get tag() {
		return 'ba-notification-item';
	}

	set content(value) {
		this._content = value.notification;
		this._autocloseTime = value.autocloseTime;
		this.render();
	}

}
