import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './zoomToExtentButton.css';
import { $injector } from '../../../../injection';
import { fit } from '../../store/position.action';

/**
 * Button that zooms map to extent
 * @class 
 * @author bakir_en  
 */

export class ZoomToExtentButton extends BaElement {

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
			<div class="zoom-to-extent">
				<button class="zoom-to-extent-button" @click=${zoomToExtent} title="${translate('map_zoom_extent_button')}" ><i class="icon zoom-to-extent-icon"></i></button>
            </div>
            
        `;
	}

	static get tag() {
		return 'ba-extent-button';
	} 
} 