import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './infoButton.css';
import { $injector } from '../../../../injection';

/**
 * Button that opens an info popup
 * @class 
 *@author bakir_en  
 */

export class InfoButton extends BaElement {

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

		const openPopup = () => {

			// set created popup visible
			var popup = this.shadowRoot.getElementById('info-popup');
			if (popup.getAttribute('type') === 'hide') {
				// popup.setPosition(60, 210);
				popup.setAttribute('type', 'show');
			}
			else{
				popup.setAttribute('type', 'hide');
			} 
		};

		return html`
            <style>${css}</style>
            <div class="info-button">
                <a class="button" title="${translate('map_zoom_in_button')}" @click="${openPopup}"><span class="icon info-icon"></a>
            </div>
			<ba-popup id="info-popup" type='hide' right='60' top='210' >
				<span>I'm a reuseable popup!</span>
            </ba-popup>
            
        `;
	} 

	static get tag() {
		return 'ba-info-button';
	} 
} 