/**
 * @module modules/menu/components/mainMenu/content/routing/RoutingPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './routingPanel.css';
import { $injector } from '../../../../../../injection';
import { setTab } from '../../../../../../store/mainMenu/mainMenu.action';
import { TabIds } from '../../../../../../domain/mainMenu';
import svg from './assets/arrowLeftShort.svg';

/**
 * Container for more contents.
 * @class
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

		//temp close
		const close = () => {
			setTab(TabIds.MAPS);
		};

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<ul class="ba-list">
					<li class="ba-list-item  ba-list-inline ba-list-item__header featureinfo-header">
						<span class="ba-list-item__pre" style="position:relative;left:-1em;">
							<ba-icon .icon="${svg}" .size=${4} .title=${translate('Routing')} @click=${close}></ba-icon>
						</span>
						<span class="ba-list-item__text vertical-center">
							<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> Routing </span>
						</span>
					</li>
				</ul>
				<div>content</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
