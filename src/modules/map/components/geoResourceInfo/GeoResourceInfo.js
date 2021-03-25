import { html } from 'lit-html'; 
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';


export class GeoResourceInfo extends BaElement {

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

		return html`
            <div><p class='geo-rsrc-info'>${translate('map_geoResourceInfo_label')}: Content in Progress..</p></div>
        `;
	} 

	static get tag() {
		return 'ba-georesource-info';
	} 
}