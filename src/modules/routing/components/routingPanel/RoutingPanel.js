/**
 * @module modules/routing/components/routingPanel/RoutingPanel
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './routingPanel.css';

const Update_Categories = 'update_categories';

export class RoutingPanel extends MvuElement {
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
	onInitialize() {
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
			</div>`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
