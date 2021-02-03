import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './extendButton.css';
import { $injector } from '../../../../injection';
import arrowUpSvg from './assets/arrow-up.svg';

/**
 * Button that zooms map to extend
 * @class 
 * @author bakir_en  
 */

export class ExtendButton extends BaElement {

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
        
		const zoomExtend = () => {
			console.log('zoom to extend');
		}; 

		return html`
            <style>${css}</style>
            <div class="extend-button">
                <ba-icon icon='${arrowUpSvg}' title="${translate('map_info_button')}" size=40 @click=${zoomExtend}></ba-icon>
            </div>
            
        `;
	} 

	// extractState(store) {
	// 	const { map: { zoom, position } } = store;
	// 	return { zoom, position };
	// }

	// onStateChanged() {
	// 	this.shadowRoot.getElementById('info-popup').closePopup();
	// }

	static get tag() {
		return 'ba-extend-button';
	} 
} 