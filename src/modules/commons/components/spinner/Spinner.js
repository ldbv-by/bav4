import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './spinner.css';

/**
 * @class
 * @author taulinger
 */
export class Spinner extends BaElement {


	/**
	 * @override
	 */
	createView() {

		return html`
		 <style>${css}</style> 
		 	<span>Loading...</span>		
		`;
	}

	static get tag() {
		return 'ba-spinner';
	}
}
