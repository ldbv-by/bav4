/**
 * @module modules/baseLayer/components/container/BaseLayerContainer
 */
import { html } from 'lit-html';
import css from './baseLayerContainer.css';
import { $injector } from '../../../../injection';
import { MvuElement } from '../../../MvuElement';

/**
 * Manages multiple {@link BaseLayerSwitcher} instances
 * @class
 */
export class BaseLayerContainer extends MvuElement {
	constructor() {
		super({
			// Todo: Get model data from service
			categories: {
				raster: ['atkis', 'luftbild_labels', 'tk', 'historisch', 'atkis_sw'],
				// vector: ['by_style_standard', 'by_style_luftbild', 'by_style_grau', 'by_style_nacht']
				vector: [
					'by_style_standard',
					'by_style_grau',
					'by_style_nacht',
					'by_style_hoehenlinien',
					'by_style_luftbild',
					'by_style_wandern',
					'by_style_radln'
				]
			}
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
		// Todo: Get model data from service
		this._activeCategory = 'raster';
	}

	/**
	 * @override
	 */
	onAfterRender(firsttime) {
		const determineActiveTabSection = (section) => {
			const i = Math.round(section.scrollLeft / section.clientWidth);
			const { categories } = this.getModel();
			const keys = Object.keys(categories);
			this._activeCategory = keys[i];
			this.render();
		};

		if (firsttime) {
			const section = this.shadowRoot.getElementById('section');
			section.addEventListener('scroll', () => {
				clearTimeout(section.scrollEndTimer);
				section.scrollEndTimer = setTimeout(determineActiveTabSection(section), 100);
			});
		}
	}

	createView(model) {
		const { categories } = model;
		const allBaseGeoResourceIds = Array.from(new Set(Object.values(categories).flat()));
		const translate = (key) => this._translationService.translate(key);

		const onClick = (category) => {
			const tab = this.shadowRoot.getElementById(category);
			tab.scrollIntoView();
		};

		const isActive = (category) => {
			return this._activeCategory === category ? 'is-active' : '';
		};

		return html`
			<style>
				${css}
			</style>
			<div class="title">${translate('baseLayer_switcher_header')}</div>
			<div class="button-group">
				${Object.entries(categories).map(
					([key]) =>
						html`<button @click=${() => onClick(key)} class="title ${isActive(key)}">${translate(`baseLayer_container_category_${key}`)}</button>`
				)}
			</div>
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
}
