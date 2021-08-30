import { html } from 'lit';
import { $injector } from '../../../../injection';
import { BaElement } from '../../../BaElement';
import css from './spinner.css';

/**
 * @class
 * @author taulinger
 */
export class Spinner extends BaElement {

	constructor() {
		super();
		const { TranslationService: translationService }
			= $injector.inject('TranslationService');

		this._translationService = translationService;
	}


	/**
	 * @override
	 */
	createView() {

		const translate = (key) => this._translationService.translate(key);

		return html`
		 <style>${css}</style> 
		 	<span class="loading">${translate('spinner_text')}</span>		
		`;
	}

	static get tag() {
		return 'ba-spinner';
	}
}
