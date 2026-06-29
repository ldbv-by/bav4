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
import { html } from 'lit-html';
import { setTab } from '@src/store/mainMenu/mainMenu.action';
import { TabIds } from '@src/domain/mainMenu';

const UPDATE_AVAILABLE_GEO_RESOURCES = 'update_available_geo_resources';
const UPDATE_ACTIVE_LEGENDS = 'update_active_legends';
const UPDATE_ZOOM_LEVEL = 'update_zoom_level';

/**
 * @class
 * @author herrmutig
 */
export class LegendPanel extends AbstractMvuContentPanel {
	_resizeObserver = null;

	constructor() {
		super({ availableGeoResources: [], activeLegends: [], zoomLevel: 0 });

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

		this.observe(
			(state) => state.position.zoom,
			(zoom) => this.signal(UPDATE_ZOOM_LEVEL, zoom)
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

	onAfterRender(firstTime) {
		if (firstTime) {
			// iframes do not change size dynamically with css, thus it can be mimicked with the following workaround..
			const element = this.shadowRoot.getElementById('legend-viewer');
			this._resizeObserver = new ResizeObserver((entries) => this._resizeLegendIframes(entries[0].contentRect));
			this._resizeObserver.observe(element);
		}
	}

	onDisconnect() {
		this._resizeObserver?.disconnect();
		this._resizeObserver = null;
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
			case UPDATE_ZOOM_LEVEL:
				return { ...model, zoomLevel: Math.round(data) };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const { availableGeoResources, activeLegends, zoomLevel } = model;

		const filteredGeoResources = availableGeoResources.filter((resource) => {
			return !activeLegends.some((legend) => legend.geoResourceId === resource.id);
		});

		const onSelectGeoResource = async (evt) => {
			const option = evt.target.selectedOptions[0];
			const geoResourceId = option.id;

			if (geoResourceId) {
				addLegend(option.id);
				evt.target.selectedIndex = 0;
			}
		};

		const onRemoveLegend = (legend) => {
			removeLegend(legend.geoResourceId);
		};

		const onToggleLegend = (evt, legend) => {
			const element = this.shadowRoot.querySelector(`#legend-${legend.geoResourceId} .legend-entries-container`);
			const collapseIcon = evt.currentTarget.querySelector('.icon.chevron');
			element.classList.toggle('hidden');
			collapseIcon.classList.toggle('iconexpand');

			evt.currentTarget.title = collapseIcon.classList.contains('iconexpand')
				? translate('legends_collapse_legend_entry')
				: translate('legends_expand_legend_entry');
		};

		const getLegendHTML = (legend) => {
			const legendEntries = legend.filterLegendEntriesByZoomLevel(zoomLevel);
			return html`<div class="legend-entries-container">${legendEntries.map((entry) => getLegendEntryHTML(entry))}</div>`;
		};

		const getLegendEntryHTML = (entry) => {
			if (!entry.urlOrData) {
				return html`<div class="legend-entry"><span>${translate('legends_at_zoomlevel_not_available')}</span></div>`;
			}

			switch (entry.type) {
				case LegendEntryType.IMAGE_URL:
				case LegendEntryType.IMAGE_BASE64:
					return html`<div class="legend-entry"><img src=${entry.urlOrData} /></div>`;
				case LegendEntryType.PDF_URL:
					return html`<div class="legend-entry"><iframe src=${entry.urlOrData}></iframe></div>`;
				default:
					return html`<div class="legend-entry"><span>${translate('legends_at_zoomlevel_not_available')}</span></div>`;
			}
		};

		const closeLegendPanel = () => {
			setTab(TabIds.MAPS);
		};

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<ul class="ba-list">
					<li class="ba-list-item  ba-list-inline ba-list-item__header">
						<span class="ba-list-item__pre" style="position:relative;left:-1em;">
							<ba-icon
								id="close-legend-panel"
								.icon=${arrowLeftShortIcon}
								.size=${4}
								.title=${translate('legends_close_button')}
								@click=${() => closeLegendPanel()}
							></ba-icon>
						</span>
						<span class="ba-list-item__text vertical-center">
							<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> ${translate('legends_panel_header')} </span>
						</span>
					</li>
				</ul>

				<div id="legend-viewer">
					<div>
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
							<div id="legend-${legend.geoResourceId}" class="legend-container">
								<div class="legend-content-header">
									<div class="legend-title">${legend.label}</div>
									<div class="button-container">
										<div>
											<ba-icon
												class="legend-entry-close-button"
												.size=${2.5}
												.icon=${removeSvg}
												.title=${translate('legends_entry_close_button')}
												@click=${() => onRemoveLegend(legend)}
											></ba-icon>
										</div>
										<div>
											<button
												class="legend-entry-collapse-button"
												title="${translate('legends_collapse_legend_entry')}"
												@click=${(evt) => onToggleLegend(evt, legend)}
											>
												<i class="icon chevron icon-rotate-90 iconexpand"></i>
											</button>
										</div>
									</div>
								</div>
								<div class="legend-content">${getLegendHTML(legend)}</div>
								<div class="legend-separator"></div>
							</div>
						`;
					})}
				</div>
			</div>
		`;
	}

	_resizeLegendIframes(contentRect) {
		const iframes = this.shadowRoot.querySelectorAll('.legend-entry iframe');
		for (const iframe of iframes) {
			iframe.width = contentRect.width;
		}
	}

	static get tag() {
		return 'ba-legend-panel';
	}
}
