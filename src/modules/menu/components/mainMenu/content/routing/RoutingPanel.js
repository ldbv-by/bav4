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

const Update_Categories = 'update_categories';

/**
 * Container for routing contents.
 * @class
 * @author alsturm
 * @author thiloSchlemmer
 */
export class RoutingPanel extends AbstractMvuContentPanel {
	constructor() {
		super({ categories: [] });
		const { TranslationService, RoutingService } = $injector.inject('TranslationService', 'RoutingService');
		this._translationService = TranslationService;
		this._routingService = RoutingService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Categories:
				return { ...model, categories: [...data] };
		}
	}

	/**
	 * @override
	 */
	async onInitialize() {
		await this._routingService.init();
		this.signal(Update_Categories, this._routingService.getCategories());
	}

	createView(model) {
		const { categories } = model;
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
				<div>	<ba-routing-category-bar .categories=${categories}></ba-routing-category-bar>
				<ba-routing-feedback></ba-routing-feedback>
				<div class='chips-container>
					<hr />
					<!-- todo:: placing chips 'export' and 'share' here-->
				</div>
				<ba-routing-info></ba-routing-info>
				<ba-routing-waypoints></ba-routing-waypoints>
				<ba-routing-details></ba-routing-details></div>
			</div>
		`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
