/**
 * @module modules/legend/components/content/LegendContent
 */
import { html, nothing } from 'lit-html';
import css from './legendContent.css';
import { $injector } from '../../../../injection/index';
import { AbstractMvuContentPanel } from '../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import arrowLeftShortIcon from '../assets/arrowLeftShort.svg';
import { deactivateLegend } from '../../../../store/legend/legend.action';
import { open } from '../../../../store/mainMenu/mainMenu.action';

const Update_legend_active = 'update_legend_active';
const Update_resolution = 'update_resolution';
const Update_legend_items = 'update_legend_items';
const Update_IsPortrait_HasMinWidth = 'update_isPortrait';
const Update_ShowSubtitle = 'update_show_subtitle';

export class LegendContent extends AbstractMvuContentPanel {
	constructor() {
		super({
			legendActive: true,
			legendItems: [],
			resolution: 0,
			isPortrait: false,
			hasMinWidth: false,
			showSubtitle: false
		});

		const { TranslationService, EnvironmentService } = $injector.inject('TranslationService', 'EnvironmentService');
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
		const { legendActive, isPortrait, resolution, legendItems, showSubtitle } = model;

		if (!legendActive) {
			return nothing;
		}

		const translate = (key) => this._translationService.translate(key);

		const visibleLayers = legendItems.filter((l) => resolution > l.maxResolution && resolution < l.minResolution);

		const uniqueVisibleLayers = [...new Map(visibleLayers.map((item) => [item.title, item])).values()];

		const content = uniqueVisibleLayers.map(
			(l) => html`
			<div class="ea-legend-item__title">${l.title}</div>
			<img src="${l.legendUrl}" @dragstart=${(e) => e.preventDefault()}></img>
		`
		);

		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const onBackButton = () => {
			deactivateLegend();
			if (!isPortrait) open();
		};

		return html`
			<style>
				${css}
			</style>
			<div>
				<div class="container  ${getOrientationClass()}">
					<ul class="ba-list">
						<li class="ba-list-item  ba-list-inline ba-list-item__header featureinfo-header">
							<span class="ba-list-item__pre" style="position:relative;left:-1em;">
								<ba-icon .icon="${arrowLeftShortIcon}" .size=${4} .title=${translate('featureInfo_close_button')} @click=${onBackButton}></ba-icon>
							</span>
							<span class="ba-list-item__text vertical-center">
								<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> ${translate('ea_legend_title')} </span>
							</span>
						</li>
						<li>
							<div class="ea-legend-container>
								<div class="ea-legend-content">
									<div class="ea-legend__subtitle">${showSubtitle ? translate('ea_legend_subtitle') : ''}</div>
									${content}
								</div>
							</div>
						</li>
					</ul>
					<div></div>
				</div>
			</div>
		`;
	}

	static get tag() {
		return 'ea-legend';
	}
}
