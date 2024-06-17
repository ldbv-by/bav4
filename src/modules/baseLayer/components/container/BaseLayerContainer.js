/**
 * @module modules/baseLayer/components/container/BaseLayerContainer
 */
import { html, nothing } from 'lit-html';
import css from './baseLayerContainer.css';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';
import { throttled } from '../../../../utils/timer';
import { findAllBySelector } from '../../../../utils/markup';

const Update_Current_Category = 'update_current_category';
const Update_Categories = 'update_categories';

/**
 * Manages multiple {@link BaseLayerSwitcher} instances
 * @class
 */
export class BaseLayerContainer extends MvuElement {
	#translationService;
	#topicsService;
	#throttledCalculateActiveCategoryFn = throttled(BaseLayerContainer.THROTTLE_DELAY_MS, () => this._calculateActiveCategory());

	constructor() {
		super({
			categories: {},
			activeCategory: null
		});

		const { TopicsService: topicsService, TranslationService: translationService } = $injector.inject('TopicsService', 'TranslationService');
		this.#translationService = translationService;
		this.#topicsService = topicsService;
	}

	onInitialize() {
		this.observe(
			(store) => store.topics.current,
			(current) => {
				if (current) {
					// if the current topic has no baseGeoRs definition, we take it form the default topic
					const categories = this.#topicsService.byId(current)?.baseGeoRs ?? this.#topicsService.byId(this.#topicsService.default().id).baseGeoRs;
					this.signal(Update_Categories, categories);
				}
			}
		);
		this.observeModel('categories', () => {
			// after categories are changed we also re-calculate the current active category
			this._calculateActiveCategory();
		});
	}

	update(type, data, model) {
		switch (type) {
			case Update_Current_Category:
				return { ...model, activeCategory: data };
			case Update_Categories:
				return { ...model, categories: data };
		}
	}

	_calculateActiveCategory() {
		const section = this.shadowRoot.getElementById('section');
		const index = section.clientWidth > 0 ? Math.round(section.scrollLeft / section.clientWidth) : 0;
		const { categories } = this.getModel();
		const keys = Object.keys(categories);
		this.signal(Update_Current_Category, keys[index]);
	}

	_scrollToActiveButton() {
		findAllBySelector(this, 'button[type="primary"]')[0]?.parentElement?.scrollIntoView();
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		if (firstTime) {
			const section = this.shadowRoot.getElementById('section');
			// scroll event handling should be throttled (https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event)
			section.addEventListener('scroll', () => this.#throttledCalculateActiveCategoryFn());
			setTimeout(() => {
				this._scrollToActiveButton();
			}, BaseLayerContainer.INITIAL_SCROLL_INTO_VIEW_DELAY_MS);
		}
	}

	createView(model) {
		const { categories, activeCategory } = model;
		const allBaseGeoResourceIds = Array.from(new Set(Object.values(categories).flat()));
		const translate = (key) => this.#translationService.translate(key);

		const onClick = (category) => {
			const tab = this.shadowRoot.getElementById(category);
			tab.scrollIntoView();
		};

		const isActive = (category) => {
			return activeCategory ? (activeCategory === category ? 'is-active' : '') : '';
		};
		const isButtonGroupHidden = () => {
			return Object.keys(categories).length < 2;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="title">${translate('baseLayer_switcher_header')}</div>
			${isButtonGroupHidden()
				? nothing
				: html`<div class="button-group">
						${Object.entries(categories).map(
							([key]) =>
								html`<button @click=${() => onClick(key)} class="title ${isActive(key)}">${translate(`baseLayer_container_category_${key}`)}</button>`
						)}
					</div>`}
			<div id="section" class="section scroll-snap-x">
				${Object.entries(categories).map(
					([key, value]) =>
						html`<div id="${key}" class="container ${isActive(key)}">
							<div>
								<ba-base-layer-switcher .configuration=${{ all: allBaseGeoResourceIds, managed: value }}></ba-base-layer-switcher>
							</div>
						</div>`
				)}
			</div>
		`;
	}

	static get tag() {
		return 'ba-base-layer-container';
	}

	static get THROTTLE_DELAY_MS() {
		return 100;
	}
	static get INITIAL_SCROLL_INTO_VIEW_DELAY_MS() {
		return 500;
	}
}
