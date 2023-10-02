/**
 * @module modules/routing/components/routingPanel/RoutingPanel
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { $injector } from '../../../../injection/index';
import { AbstractMvuContentPanel } from '../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import css from './routingPanel.css';

const Update_Categories = 'update_categories';

export class RoutingPanel extends AbstractMvuContentPanel {
	constructor() {
		super({ categories: [] });

		const { RoutingService } = $injector.inject('RoutingService');
		this._routingService = RoutingService;
	}

	/**
	 * @override
	 */
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

	/**
	 *@override
	 */
	createView(model) {
		const { categories } = model;

		return html` <style>
				${css}
			</style>
			<div class="container">
				<ba-routing-category-bar .categories=${categories}></ba-routing-category-bar>
				<ba-routing-feedback></ba-routing-feedback>
				<div class='chips-container>
					<hr />
					<!-- todo:: placing chips 'export' and 'share' here-->
				</div>
				<ba-routing-info></ba-routing-info>
				<ba-routing-waypoints></ba-routing-waypoints>
				<ba-routing-details></ba-routing-details>
			</div>`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
