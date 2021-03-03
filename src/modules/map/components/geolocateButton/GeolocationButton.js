import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import geolocationSvg from './assets/geo-alt-fill.svg';
import { $injector } from '../../../../injection';
import { activate } from '../../store/measurement.action';

/**
 * Button that activates-deactivates geolocation
 * @class 
 * @author thiloSchlemmer 
 */

export class GeolocationButton extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	 *@override 
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const onClick = () => {
			activate();
		};
		return html`<ba-icon icon='${geolocationSvg}' title=${translate('map_geolocationButton_title_activate')} @click=${onClick}></ba-icon>
        `;
	}

	extractState(store) {
		const { position: { zoom, center } } = store;
		return { zoom, center };
	}

	onStateChanged() {
		this.shadowRoot.getElementById('info-popup').closePopup();
	}

	static get tag() {
		return 'ba-geolocation-button';
	}
} 