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
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
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

	onInitialize() {
		this.observe(
			(state) => state.routing.categoryId,
			(categoryId) => this.signal(Update_Selected_Category, categoryId)
		);
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

		const getCategoryIconClass = (category) => `icon-${category.id}`;
		const getLabel = (category) => translate(`routing-info-label-${category.id}`);
		return html`
			<style>
				${css}
			</style>
			<div class="categories-container">
				${categories.map((category) => {
					const classes = { 'is-active': selectedCategory === category.id };
					return html`<button
						id=${category.id + '-button'}
						data-test-id"
						title=${category.label}
						@click=${() => selectCategory(category.id)} class='category-button ${classMap(classes)}'
					>
						<div class="category-button__background"></div>
						<div class="category-button__icon ${category.icon}"></div>
						<div class="category-button__text">${category.label}</div>
					</button>`;
				})}
			</div>
		`;
	}

	set categories(value) {
		this.signal(Update_Categories, value);
	}

	static get tag() {
		return 'ba-routing-category-bar';
	}
}
