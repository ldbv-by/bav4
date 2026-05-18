// @ts-nocheck
/**
 * @module modules/featureInfo/components/featureInfoPanel/FeatureInfoPanel
 */

import css from './legendPanel.css?inline';
import arrowLeftShortIcon from '@src/assets/icons/arrowLeftShort.svg';
import removeSvg from './assets/trash.svg';
import shareIcon from '@src/assets/icons/share.svg';
import { $injector } from '@src/injection';
import { AbstractMvuContentPanel } from '@src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { LegendEntryType } from '@src/services/GeoResourceLegendService';
import { addLegend, removeLegend } from '@src/store/legends/legends.action';
import { html, nothing } from 'lit-html';

const UPDATE_AVAILABLE_LAYERS = 'update_available_layers';
const UPDATE_ACTIVE_LEGENDS = 'update_active_legends';

/**
 * @class
 * @author herrmutig
 */
export class LegendPanel extends AbstractMvuContentPanel {
	constructor() {
		super({ availableLayers: [], activeLegends: [] });

		const { TranslationService, GeoResourceLegendService } = $injector.inject('TranslationService', 'GeoResourceLegendService');
		this._translationService = TranslationService;
		this._geoResourceLegendService = GeoResourceLegendService;
	}

	onInitialize() {
		// Updates the Dropdown List
		this.observe(
			(state) => state.layers.active,
			() => {
				const available = this._geoResourceLegendService.available();
				const legendsToRemove = this.getModel().activeLegends.filter(
					(legend) => !available.some((layer) => legend.geoResourceId === layer.geoResourceId)
				);

				for (const legend of legendsToRemove) {
					removeLegend(legend.geoResourceId);
				}

				this.signal(UPDATE_AVAILABLE_LAYERS, this._geoResourceLegendService.available());
			}
		);

		// Updates the active legends
		this.observe(
			(state) => state.legends,
			async (legends) => {
				await Promise.allSettled(legends.active.map(async (id) => await this._geoResourceLegendService.getLegendById(id))).then((resolved) => {
					const resolvedLegendObjects = resolved.filter((r) => r.status === 'fulfilled').map((r) => r.value);
					const rejectedLegendObjects = resolved.filter((r) => r.status === 'rejected').map((r) => r.reason);

					this.signal(UPDATE_ACTIVE_LEGENDS, resolvedLegendObjects);
				});
			}
		);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case UPDATE_AVAILABLE_LAYERS:
				return { ...model, availableLayers: [...data] };
			case UPDATE_ACTIVE_LEGENDS:
				return { ...model, activeLegends: [...data] };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { availableLayers, activeLegends } = model;
		const filteredLayers = availableLayers.filter((layer) => !activeLegends.some((legend) => legend.geoResourceId === layer.geoResourceId));
		const onSelectLayer = async (evt) => {
			const geoResourceId = evt.detail.selected;
			if (geoResourceId) {
				addLegend(geoResourceId);
				this.shadowRoot.getElementById('legend-searchable-select').selected = null;
			}
		};

		const onRemoveLegend = (legend) => {
			removeLegend(legend.geoResourceId);
		};

		const getLegendHTML = (legend) => {
			const entries = legend.entries[0];

			if (entries.length === 0) {
				return nothing;
			}

			return html`<div class="legend-entries-container">${entries.map((entry) => getLegendEntryHTML(entry))}</div>`;
		};

		const getLegendEntryHTML = (entry) => {
			switch (entry.type) {
				case LegendEntryType.IMAGE_URL:
					return html`<img src=${entry.urlOrData} />`;
				case LegendEntryType.PDF_URL:
					return html`<iframe src=${entry.urlOrData}></iframe>`;
				default:
					return '';
			}
		};

		return html`
			<style>
				${css}
			</style>
			<ul class="ba-list">
				<li class="ba-list-item  ba-list-inline ba-list-item__header legend-header">
					<span class="ba-list-item__pre" style="position:relative;left:-1em;">
						<ba-icon
							class="close-feature-info"
							.icon=${arrowLeftShortIcon}
							.size=${4}
							.title=${translate('legendpanel_close_button')}
							@click=${() => {}}
						></ba-icon>
					</span>
					<span class="ba-list-item__text vertical-center">
						<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> ${translate('legend_header')} </span>
					</span>
					<span class="share ba-icon-button ba-list-item__after vertical-center separator" style="padding-right: 1.5em;">
						<ba-icon .icon=${shareIcon} .size=${1.3}></ba-icon>
					</span>
				</li>
				<li>
					<div class="container">
						<ba-searchable-select
							id="legend-searchable-select"
							.maxEntries=${filteredLayers.length}
							.placeholder=${'Choose Legend'}
							.options=${filteredLayers.map((layer) => layer.geoResourceId)}
							.isResponsive=${true}
							.allowFiltering=${false}
							@select=${onSelectLayer}
						></ba-searchable-select>
					</div>
					${activeLegends.map((legend) => {
						return html`
							<div class="legend-container">
								<div class="legend-content-title">
									<div class="legend-title">${legend.geoResourceId}</div>
									<div>
										<ba-icon
											class="close-legend"
											size="${4},"
											.icon=${removeSvg}
											.title=${translate('legendpanel_close_legend_button')}
											@click=${() => onRemoveLegend(legend)}
										></ba-icon>
									</div>
								</div>
								<div class="legend-content">${getLegendHTML(legend)}</div>
								<div class="legend-separator"></div>
							</div>
						`;
					})}
				</li>
			</ul>
		`;
	}

	static get tag() {
		return 'ba-legend-panel';
	}
}
