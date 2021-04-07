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
		const { EnvironmentService } = $injector.inject('EnvironmentService');
		this._environmentService = EnvironmentService;
	}
	
	isRenderingSkipped() {
		return !this._configService.getValue('SOFTWARE_INFO', false);
	}

	createView() {
		const { portrait } = this._environmentService.getScreenOrientation();
		const info = this._configService.getValue('SOFTWARE_INFO', false);
		const getDevInfoClass = () => portrait ? 'container-portrait' : 'container-landscape';

		return html`
			<style>${css}</style>
			<div class='container ${getDevInfoClass()}'>${info}</div>
		`;
	}

	static get tag() {
		return 'ba-dev-info';
	}
}
