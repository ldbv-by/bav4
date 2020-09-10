import { html } from 'lit-html';
import BaElement from '../BaElement';
import './style.css';

/**
 * Container element for footer stuff. 
 * @class
 * @author aul
 */
export class FooterElement extends BaElement {

	createView() {

		return html`
         	<div class="footer">${this.createChildrenView()}</div>
        `;
	}

	createChildrenView() {
		return html`<ba-map-info></ba-map-info>`;
	}

	static get tag() {
		return 'ba-footer';
	}
}
