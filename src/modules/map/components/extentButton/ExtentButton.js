import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './extentButton.css';
import { $injector } from '../../../../injection';
import arrowUpSvg from './assets/arrow-up.svg';
import { changeZoomAndPosition } from '../../store/olMap.action';

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
			changeZoomAndPosition({
				zoom: 12,
				position: [1288239.2412306187, 6130212.561641981]
			});
		};

		return html`
            <style>${css}</style>
            <div class="extent-button">
                <ba-icon icon='${arrowUpSvg}' title="${translate('map_extent_button')}" size=40 @click=${zoomToExtent}></ba-icon>
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
		return 'ba-extent-button';
	} 
} 