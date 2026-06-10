/**
 * @module modules/legends/components/LegendPanel
 */
// @ts-nocheck

import css from './legendPanel.css?inline';
import arrowLeftShortIcon from '@src/assets/icons/arrowLeftShort.svg';
import removeSvg from './assets/trash.svg';
import { $injector } from '@src/injection';
import { AbstractMvuContentPanel } from '@src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { LegendEntryType } from '@src/services/GeoResourceLegendService';
import { addLegend, removeLegend } from '@src/store/legends/legends.action';
import { html, nothing } from 'lit-html';

const UPDATE_AVAILABLE_GEO_RESOURCES = 'update_available_geo_resources';
const UPDATE_ACTIVE_LEGENDS = 'update_active_legends';

/**
 * @class
 * @author herrmutig
 */
export class LegendPanel extends AbstractMvuContentPanel {
	constructor() {
		super({ availableGeoResources: [], activeLegends: [] });

		const { TranslationService, GeoResourceLegendService, GeoResourceService } = $injector.inject(
			'TranslationService',
			'GeoResourceLegendService',
			'GeoResourceService'
		);
		this._translationService = TranslationService;
		this._geoResourceLegendService = GeoResourceLegendService;
		this._geoResourceService = GeoResourceService;
	}

	onInitialize() {
		// Updates the Dropdown List
		this.observe(
			(state) => state.layers.active,
			() => {
				const availableResources = this._geoResourceLegendService
					.available()
					.map((id) => this._geoResourceService.byId(id))
					.filter((resource) => resource !== null);

				const legendsToRemove = this.getModel().activeLegends.filter(
					(legend) => !availableResources.some((resource) => legend.geoResourceId === resource.id)
				);

				for (const legend of legendsToRemove) {
					removeLegend(legend.geoResourceId);
				}

				this.signal(UPDATE_AVAILABLE_GEO_RESOURCES, availableResources);
			}
		);

		// Updates the active legends
		this.observe(
			(state) => state.legends,
			async (legends) => {
				await Promise.allSettled(legends.active.map(async (id) => await this._geoResourceLegendService.getLegendById(id))).then((resolved) => {
					const resolvedLegendObjects = resolved.filter((r) => r.status === 'fulfilled').map((r) => r.value);
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
			case UPDATE_AVAILABLE_GEO_RESOURCES:
				return { ...model, availableGeoResources: [...data] };
			case UPDATE_ACTIVE_LEGENDS:
				return { ...model, activeLegends: [...data] };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { availableGeoResources, activeLegends } = model;

		const filteredGeoResources = availableGeoResources.filter((resource) => !activeLegends.some((legend) => legend.geoResourceId === resource.id));
		const onSelectGeoResource = async (evt) => {
			//const geoResourceId = evt.detail.selected;
			const option = evt.target.selectedOptions[0];

			if (option.id) {
				addLegend(option.id);
				evt.target.selectedIndex = 0;
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
				case LegendEntryType.IMAGE_BASE64:
					return html`<div class="legend-entry"><img src=${entry.urlOrData} /></div>`;
				case LegendEntryType.PDF_URL:
					return html`<div class="legend-entry"><iframe src=${entry.urlOrData}></iframe></div>`;
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
							class="close-legends"
							.icon=${arrowLeftShortIcon}
							.size=${4}
							.title=${translate('legends_close_button')}
							@click=${() => {}}
						></ba-icon>
					</span>
					<span class="ba-list-item__text vertical-center">
						<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> ${translate('legends_title')} </span>
					</span>
				</li>
				<li>
					<div class="container">
						<select
							id="legend-select"
							.maxEntries=${filteredGeoResources.length}
							.isResponsive=${true}
							.allowFiltering=${false}
							@change=${onSelectGeoResource}
						>
							<option hidden disabled selected>${translate('legends_choose_option')}</option>
							${filteredGeoResources.map((resource) => html`<option id=${resource.id}>${resource.label}</option>`)}
						</select>
					</div>
					${activeLegends.map((legend) => {
						return html`
							<div class="legend-container">
								<div class="legend-content-title">
									<div class="legend-title">${legend.label}</div>
									<div>
										<ba-icon
											class="legend-entry-close-icon"
											size="${4},"
											.icon=${removeSvg}
											.title=${translate('legends_entry_close_button')}
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
