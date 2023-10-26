/**
 * @module modules/utils/components/devInfo/DevInfo
 */
import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import css from './devInfo.css';
import { openModal } from '../../../../store/modal/modal.action';
import { MvuElement } from '../../../MvuElement';

/**
 * Displays the SOFTWARE_INFO value, which should
 * contain development information like build number, date, ...
 * @class
 * @author taulinger
 */
export class DevInfo extends MvuElement {
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

		const onShowcaseButtonClick = () => {
			openModal('Showcase', html`<ba-showcase></ba-showcase>`);
		};

		return html`
			<style>${css}</style>
			<div class='container'><ba-button @click=${onShowcaseButtonClick} .size=${2.0} .label=${info} .type=${'secondary'}><ba-button></div>
		`;
	}

	static get tag() {
		return 'ba-dev-info';
	}
}
