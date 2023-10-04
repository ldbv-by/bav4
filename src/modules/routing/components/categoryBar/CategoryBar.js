/**
 * @module modules/routing/components/categoryBar/CategoryBar
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { setCategory } from '../../../../store/routing/routing.action';
import { MvuElement } from '../../../MvuElement';
import { classMap } from 'lit-html/directives/class-map.js';
import css from './categoryBar.css';
import { $injector } from '../../../../injection/index';

const Update_Categories = 'update_categories';
const Update_Selected_Category = 'update_selected_category';

export class CategoryBar extends MvuElement {
	constructor() {
		super({ categories: [], selectedCategory: null });
		const { TranslationService, RoutingService } = $injector.inject('TranslationService', 'RoutingService');
		this._translationService = TranslationService;
		this._routingService = RoutingService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Categories:
				return { ...model, categories: [...data] };
			case Update_Selected_Category:
				return { ...model, selectedCategory: data };
		}
	}

	async onInitialize() {
		this.observe(
			(state) => state.routing.categoryId,
			(categoryId) => this.signal(Update_Selected_Category, categoryId)
		);

		await this._routingService.init();
		this.signal(Update_Categories, this._routingService.getCategories());
	}

	/**
	 *@override
	 */
	createView(model) {
		const { categories, selectedCategory } = model;
		const translate = (key) => this._translationService.translate(key);
		const selectCategory = (categoryCandidate) => {
			setCategory(categoryCandidate);
		};

		const getCategoryIconClass = (category) => `icon-${category.id.replace('-', '_')}`;
		const getLabel = (category) => translate(`routing-category-label-${category.id}`);
		return html`
			<style>
				${css}
			</style>
			<hr />
			<div class="categories-container">
				${categories.map((category) => {
					const classes = { 'is-active': selectedCategory === category.id };
					classes[getCategoryIconClass(category)] = true;
					return html`<button
						id=${category.id + '-button'}
						data-test-id"
						title=${getLabel(category)}
						@click=${() => selectCategory(category.id)} class='category-button ${classMap(classes)}'
					>												
						<div class="category-button__text">${getLabel(category)}</div>
					</button>`;
				})}
			</div>
		`;
	}

	static get tag() {
		return 'ba-routing-category-bar';
	}
}
