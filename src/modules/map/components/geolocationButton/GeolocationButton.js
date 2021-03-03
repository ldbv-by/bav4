import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import geolocationSvg from './assets/geo-alt-fill.svg';
import { $injector } from '../../../../injection';
import css from './geolocationButton.css';
import { activate, deactivate } from '../../store/geolocation.action';

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
		const { active, denied } = this._state;
		const translate = (key) => this._translationService.translate(key);

		const onClick = () => {
			if (active) {
				deactivate();
			}
			activate();
		};
		return html`<style>${css}</style>
		<ba-icon icon='${geolocationSvg}' size=40 disabled=${denied} title=${translate('map_geolocationButton_title_activate')} @click=${onClick}></ba-icon>
        `;
	}

	extractState(store) {
		const { geolocation: { active, denied } } = store;
		return { active, denied };
	}


	static get tag() {
		return 'ba-geolocation-button';
	}
} 