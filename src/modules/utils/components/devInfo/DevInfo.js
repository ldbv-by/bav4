import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import css from './devInfo.css';


/**
 * Displays the SOFTWARE_INFO value, which should
 * contain development informations like build number, date, ...
 * @class
 * @author taulinger
 */
export class DevInfo extends BaElement {

	constructor() {
		super();
		const { ConfigService } = $injector.inject('ConfigService');
		this._configService = ConfigService;
	}
	
	isRenderingSkipped() {
		return !this._configService.getValue('SOFTWARE_INFO', false);
	}

	createView() {
		const info = this._configService.getValue('SOFTWARE_INFO', false);

		return html`
			<style>${css}</style>
			<div class='container'>${info}</div>
		`;
	}

	static get tag() {
		return 'ba-dev-info';
	}
}
