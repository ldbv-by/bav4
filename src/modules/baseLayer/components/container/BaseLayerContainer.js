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

	createView(model) {
		const { categories } = model;
		const allBaseGeoResourceIds = Array.from(new Set(Object.values(categories).flat()));
		const translate = (key) => this._translationService.translate(key);

		const onClick = (category) => {
			this._activeCategory = category;
			this.render();
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

			${Object.entries(categories).map(
				([key, value]) =>
					html`<div class="container ${isActive(key)}">
						<div>
							<ba-base-layer-switcher .configuration=${{ all: allBaseGeoResourceIds, managed: value }}></ba-base-layer-switcher>
						</div>
					</div>`
			)}
		`;
	}

	static get tag() {
		return 'ba-base-layer-container';
	}
}
