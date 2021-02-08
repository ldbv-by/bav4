import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './extentButton.css';
import { $injector } from '../../../../injection';
import baSvg from './assets/ba.svg';
import { fit } from '../../store/position.action';

/**
 * Button that zooms map to extent
 * @class 
 * @author bakir_en  
 */

export class ExtentButton extends BaElement {

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
        
		const zoomToExtent = () => {
			//later we will use a service to retrieve the extent
			fit({ extent: [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462] });
		};

		return html`
            <style>${css}</style>
            <div class="extent-button">
                <ba-icon class="extent-icon" icon='${baSvg}' title="${translate('map_extent_button')}" size=50 @click=${zoomToExtent}></ba-icon>
            </div>
            
        `;
	}

	static get tag() {
		return 'ba-extent-button';
	} 
} 