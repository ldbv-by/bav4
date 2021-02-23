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

		const items = [
			{ name: translate('map_infoButton_help'), url: 'http://www.ldbv.bayern.de/hilfe.html' },
			{ name: translate('map_infoButton_contact'), url: 'https://www.ldbv.bayern.de/service/kontakt.html' },
			{ name: translate('map_infoButton_about'), url: 'https://geoportal.bayern.de/geoportalbayern/seiten/impressum.html' }
		];
		
		const togglePopup = () => {			
			// open/close popup on info button click
			var popup = this.shadowRoot.getElementById('info-popup'); 
			popup.isOpen() ? popup.closePopup() : popup.openPopup();
		};
		
		window.onresize = () => {
			var popup = this.shadowRoot.getElementById('info-popup');
			if (popup.isOpen()) {
				this.shadowRoot.getElementById('info-popup').closePopup();
			}			
		}; 

		return html`
            <style>${css}</style>
            <div class="info-button">
                <a class="button" title="${translate('map_infoButton_title')}" @click="${togglePopup}"><span class="icon info-icon"></span></a>
            </div>
			<ba-popup id="info-popup" type='hide' right='60' top='170' >
				<div class="info-popup-content">
					<ul class="info-popup-list">
					${items.map((item) => html`
						<li class="info-popup-listelement">
							<a class="info-popup-link" href="${item.url}" target="_blank">${item.name}</a> 
						</li>
					`)}
				  	</ul>
				</div>
            </ba-popup>
            
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
		return 'ba-info-button';
	} 
} 