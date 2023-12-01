/**
 * @module modules/menu/components/mainMenu/content/routing/RoutingPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './routingPanel.css';
import { $injector } from '../../../../../../injection';
import svg from './assets/arrowLeftShort.svg';
import { nothing } from '../../../../../../../node_modules/lit-html/lit-html';
import { setCurrentTool } from '../../../../../../store/tools/tools.action';

/**
 * Container for routing contents.
 * @class
 * @author alsturm
 * @author thiloSchlemmer
 */
export class RoutingPanel extends AbstractMvuContentPanel {
	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	createView(model) {
		const { active } = model;
		const translate = (key) => this._translationService.translate(key);
		const close = () => {
			setCurrentTool(null);
		};

		const getRoutingContent = (active) => {
			const content = html`<ba-routing-container></ba-routing-container>`;
			const chunkName = 'routing';

			return active ? html`<ba-lazy-load .chunkName=${chunkName} .content=${content}></ba-lazy-load>` : nothing;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<ul class="ba-list">
					<li class="ba-list-item  ba-list-inline ba-list-item__header featureinfo-header">
						<span class="ba-list-item__pre" style="position:relative;left:-1em;">
							<ba-icon .icon="${svg}" .size=${4} .title=${translate('menu_content_panel_close_button')} @click=${close}></ba-icon>
						</span>
						<span class="ba-list-item__text vertical-center">
							<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> Routing </span>
						</span>
					</li>
				</ul>
				<div>${getRoutingContent(active)}</div>
				<div class="chips__container">
					<ba-profile-chip></ba-profile-chip>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
