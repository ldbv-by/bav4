import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './topicsContentPanel.css';


/**
 * @class
 * @author taulinger
 */
export class TopicsContentPanel extends BaElement {

	/**
	 * @override
	 */
	createView() {
		return html`
        	<style>${css}</style>
        	<div class="topics-content-panel">${this.constructor.name}</div>
        `;

	}

	static get tag() {
		return 'ba-topics-content-panel';
	}
}
