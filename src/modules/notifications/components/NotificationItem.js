import { BaElement } from '../../BaElement';
import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { $injector } from '../../../injection';
import { LevelTypes } from '../../../store/notifications/notifications.reducer';


export class NotificationItem extends BaElement {
	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
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
		return html`<div class='notification_item ${classMap(levelClass)}'>
                        <div class='notification_content'>${this._content.message}
		        		<a class='notification_close' href='#'>${translate('notification_item_close')}</a>
		            </div>`;
	}

	static get tag() {
		return 'ba-notification-item';
	}

	set content(value) {
		this._content = value;
		this.render();
	}
}
