import { html } from 'lit-html';
import BaElement from '../BaElement';
import './style.css';

/**
 * Container element for footer stuff. 
 * @class
 * @author aul
 */
export class FooterElement extends BaElement {

	constructor() {
		super();
		// this.root = this.attachShadow({ mode: "open" });
	}


	createView() {

		const children = this.createChildrenView();

		return html`
         <div class="footer">${children}</div>
        `;
	}


	createChildrenView() {
		// return this.isUnderTest() ? html`` : html`<ba-map-info></ba-map-info>`;
		return html`<ba-map-info></ba-map-info>`;
		// return html``;
	}
	// if we want Shadow DOM
	// getRenderTarget() {
	//     return this.root;
	// }

	static get tag() {
		return 'ba-footer';
	}


}
