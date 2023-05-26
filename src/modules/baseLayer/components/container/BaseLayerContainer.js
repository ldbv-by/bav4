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
	}

	createView(model) {
		const { categories } = model;
		const allBaseGeoResourceIds = Array.from(new Set(Object.values(categories).flat()));
		const translate = (key) => this._translationService.translate(key);

		return html`
			<style>
				${css}
			</style>
			<div class="title">${translate('baseLayer_container_header')}</div>
			<div class="container">
				${Object.entries(categories).map(
					([key, value]) =>
						html`<div class="title">${translate(`baseLayer_container_category_${key}`)}</div>
							<div>
								<ba-base-layer-switcher .configuration=${{ all: allBaseGeoResourceIds, managed: value }}></ba-base-layer-switcher>
							</div>`
				)}
			</div>
		`;
	}

	static get tag() {
		return 'ba-base-layer-container';
	}
}
