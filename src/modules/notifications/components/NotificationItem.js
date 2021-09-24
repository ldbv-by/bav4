import { BaElement } from '../../BaElement';
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../injection';
import { LevelTypes } from '../../../store/notifications/notifications.reducer';
import css from './notificationItem.css';

export const NOTIFICATION_AUTOCLOSE_TIME_NEVER = 0;
export class NotificationItem extends BaElement {
	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._content = { message: null, level: null };
		this._autocloseTime = NOTIFICATION_AUTOCLOSE_TIME_NEVER;
		this._autocloseTimeoutId = null;
		this._onClose = () => { };
	}


	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const levelClass = {
			notification_info: this._content.level === LevelTypes.INFO,
			notification_warn: this._content.level === LevelTypes.WARN,
			notification_error: this._content.level === LevelTypes.ERROR
		};
		const levelText = () => {
			switch (this._content.level) {
				case LevelTypes.INFO:
					return 'notifications_item_info';
				case LevelTypes.WARN:
					return 'notifications_item_warn';
				case LevelTypes.ERROR:
					return 'notifications_item_error';
			}
		};
		if (this._autocloseTime > NOTIFICATION_AUTOCLOSE_TIME_NEVER) {
			this._autocloseTimeoutId = setTimeout(() => {
				this._hide();
			}, this._autocloseTime);
		}

		const message = this._content.message ? this._content.message : html.nothing;
		return html`
		<style>${css}</style>
		<div class='notification_item ${classMap(levelClass)}'>
        	<span class='notification_level'>${translate(levelText())}</span>
        	<span class='notification_content'>${message}</span>			
		</div>`;
	}

	_hide() {
		const element = this.shadowRoot.querySelector('.notification_item');

		// If the notification-item is not yet closed
		element.classList.add('notification_item_hide');

		element.addEventListener('animationend', () => {
			// If the notification-item is not yet closed
			this.onClose(this._content);
			clearTimeout(this._autocloseTimeoutId);
		});
	}

	static get tag() {
		return 'ba-notification-item';
	}

	set content(value) {
		this._content = value;
		this._autocloseTime = value.autocloseTime;
		this.render();
	}

	set onClose(callback) {
		this._onClose = callback;
	}

	get onClose() {
		return this._onClose;
	}

}
