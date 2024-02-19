/**
 * @module modules/routing/components/categoryBar/CategoryBar
 */
import { html, nothing } from '../../../../../node_modules/lit-html/lit-html';
import { setCategory } from '../../../../store/routing/routing.action';
import { MvuElement } from '../../../MvuElement';
import { classMap } from 'lit-html/directives/class-map.js';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import css from './categoryBar.css';
import { $injector } from '../../../../injection/index';

const Update_Selected_Category = 'update_selected_category';

/**
 * Renders available routing categories as selectable elements for the user
 * @author thiloSchlemmer
 */
export class CategoryBar extends MvuElement {
	constructor() {
		super({ selectedCategory: null });
		const { RoutingService } = $injector.inject('RoutingService');
		this._routingService = RoutingService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Selected_Category:
				return { ...model, selectedCategory: data };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.routing.categoryId,
			(categoryId) => this.signal(Update_Selected_Category, categoryId)
		);
	}

	createView(model) {
		const { selectedCategory } = model;
		const categories = this._routingService.getCategories();
		const selectCategory = (categoryCandidate) => {
			setCategory(categoryCandidate);
		};
		const renderCategoryIcon = (category, activeCategory) => {
			// for the is-active state we have to use the parent categoryId on both ends
			const classes = { 'is-active': this._routingService.getParent(activeCategory) === this._routingService.getParent(category.id) };
			const iconSource = category.style.icon ?? this._routingService.getCategoryById(this._routingService.getParent(category.id))?.style.icon;
			if (iconSource) {
				return html`
					<svg class="category-icon ${classMap(classes)}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
						${unsafeSVG(iconSource)}
					</svg>
				`;
			}
			return nothing;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="categories-container">
				${categories.map((category) => {
					return html`<button
						id=${category.id + '-button'}
						data-test-id"
						title=${category.label}
						@click=${() => selectCategory(category.id)} class='category-button'
					>
					${renderCategoryIcon(category, selectedCategory)}
					</button>`;
				})}
			</div>
		`;
	}

	static get tag() {
		return 'ba-routing-category-bar';
	}
}
