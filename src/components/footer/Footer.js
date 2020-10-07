import { html } from 'lit-html';
import BaElement from '../BaElement';
import './footer.css';

/**
 * Container element for footer stuff. 
 * @class
 * @author aul
 */
export class Footer extends BaElement {

	createView() {

		return html`
			<div class="some">${this.createChildrenView()}</div>
		`;
	}

	createChildrenView() {
		return html`<ba-map-info></ba-map-info>`;
	}

	static get tag() {
		return 'ba-footer';
	}
}
