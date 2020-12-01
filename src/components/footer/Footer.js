import { html } from 'lit-html';
import { BaElement } from '../BaElement';
import { $injector } from '../../injection';
import css from './footer.css';

/**
 * Container element for footer stuff. 
 * @class
 * @author aul
 */
export class Footer extends BaElement {

	constructor() {
		super();

		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}

	createView() {

		const { mobile } = this._environmentService;

		return mobile ? html`` : html`
			<style>${css}</style>
			<div class="footer">
				<div class="content">	
					${this.createChildrenView()}
				</div>
			</div>
		`;
	}

	createChildrenView() {
		return html`<ba-map-info></ba-map-info>`;
	}

	static get tag() {
		return 'ba-footer';
	}
}
