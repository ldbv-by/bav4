import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './searchContentPanel.css';


/**
 * @class
 * @author taulinger
 */
export class SearchContentPanel extends BaElement {

	/**
	 * @override
	 */
	createView() {
		return html`
        <style>${css}</style>
        <div class="search-content-panel">${this.constructor.name}</div>
        `;

	}

	static get tag() {
		return 'ba-search-content-panel';
	}
}
