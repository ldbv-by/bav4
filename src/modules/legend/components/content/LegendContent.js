import { html, nothing } from 'lit-html';
import css from './legendContent.css';
import { MvuElement } from '../../../MvuElement';
import { $injector } from '../../../../injection/index';

const Update_legend_active = 'update_legend_active';
const Update_resolution = 'update_resolution';
const Update_legend_items = 'update_legend_items';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait';
const Update_ShowSubtitle = 'update_show_subtitle';

export class LegendContent extends MvuElement {
	constructor() {
		super({
			legendActive: true,
			legendItems: [],
			resolution: 0,
			isPortrait: false,
			hasMinWidth: false,
			showSubtitle: false
		});

		const { StoreService, TranslationService, EnvironmentService } = $injector.inject('StoreService', 'TranslationService', 'EnvironmentService');
		this._storeService = StoreService;
		this._translationService = TranslationService;
		this._environmentService = EnvironmentService;
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_legend_active:
				return { ...model, legendActive: data };

			case Update_legend_items:
				return { ...model, legendItems: data };

			case Update_resolution:
				return { ...model, resolution: data };

			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };

			case Update_ShowSubtitle: {
				const activeLayers = data;
				const showSubtitle = activeLayers.some((l) => l.visible && l.opacity < 1);
				return { ...model, showSubtitle };
			}
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		this.observe(
			(state) => state.legend.legendActive,
			(active) => this.signal(Update_legend_active, active)
		);
		this.observe(
			(state) => state.legend.legendItems,
			(items) => this.signal(Update_legend_items, items)
		);
		this.observe(
			(state) => state.legend.mapResolution,
			(resolution) => this.signal(Update_resolution, resolution)
		);
		this.observe(
			(state) => state.media,
			(media) => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth })
		);
		this.observe(
			(state) => state.layers.active,
			(layers) => this.signal(Update_ShowSubtitle, layers),
			true
		);
	}

	createView(model) {
		if (!model.legendActive) {
			return nothing;
		}

		const translate = (key) => this._translationService.translate(key);

		const resolution = model.resolution;
		const visibleLayers = model.legendItems.filter((l) => resolution > l.maxResolution && resolution < l.minResolution);

		const uniqueVisibleLayers = [...new Map(visibleLayers.map((item) => [item.title, item])).values()];

		const content = uniqueVisibleLayers.map(
			(l) => html`
			<div class="ea-legend-item__title">${l.title}</div>
			<img src="${l.legendUrl}" @dragstart=${(e) => e.preventDefault()}></img>
		`
		);

		return html`
			<style>
				${css}
			</style>
			<div class="ea-legend-container ${model.isPortrait ? 'portrait-mode' : ''}">
				<div class="ea-legend-filler"></div>
				<div class="ea-legend-content">
					<div class="ea-legend__title">${translate('ea_legend_title')}</div>
					<div class="ea-legend__subtitle">${model.showSubtitle ? translate('ea_legend_subtitle') : ''}</div>
					${content}
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ea-legend';
	}
}
