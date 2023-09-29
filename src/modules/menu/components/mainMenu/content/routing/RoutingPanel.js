/**
 * @module modules/menu/components/mainMenu/content/misc/BvvMiscContentPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './routingPanel.css';
import { $injector } from '../../../../../../injection';
import arrowLeftShortIcon from './assets/arrowLeftShort.svg';
import { abortOrReset } from '../../../../../../store/featureInfo/featureInfo.action';

/**
 * Container for more contents.
 * @class
 * @author costa_gi
 * @author alsturm
 */
export class RoutingPanel extends AbstractMvuContentPanel {
	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<ul class="ba-list">
					<li class="ba-list-item  ba-list-inline ba-list-item__header featureinfo-header">
						<span class="ba-list-item__pre" style="position:relative;left:-1em;">
							<ba-icon .icon="${arrowLeftShortIcon}" .size=${4} .title=${translate('featureInfo_close_button')} @click=${abortOrReset}></ba-icon>
						</span>
						<span class="ba-list-item__text vertical-center">
							<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> ${translate('Routing')} </span>
						</span>
					</li>
				<ul >
			</div>
		`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
