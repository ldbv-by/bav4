/**
 * @module modules/routing/components/categoryBar/CategoryBar
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { setCategory } from '../../../../store/routing/routing.action';
import { MvuElement } from '../../../MvuElement';
import { classMap } from 'lit-html/directives/class-map.js';
import css from './categoryBar.css';

const Update_Categories = 'update_categories';
const Update_Selected_Category = 'update_selected_category';

export class CategoryBar extends MvuElement {
	constructor() {
		super({ categories: [], selectedCategory: null });
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
		const selectCategory = (categoryCandidate) => {
			if (selectedCategory !== categoryCandidate) {
				setCategory(categoryCandidate);
			}
		};

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
