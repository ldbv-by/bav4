/**
 * @module modules/legends/components/LegendPanel
 */

// @ts-nocheck
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import css from './legendPanel.css?inline';
import arrowLeftShortIcon from '@src/assets/icons/arrowLeftShort.svg';
import removeSvg from './assets/trash.svg';
import { $injector } from '@src/injection';
import { AbstractMvuContentPanel } from '@src/modules/menu/components/mainMenu/content/AbstractMvuContentPanel';
import { LegendEntryType } from '@src/services/GeoResourceLegendService';
import { addLegends, clearLegends, removeLegend } from '@src/store/legends/legends.action';
import { setTab } from '@src/store/mainMenu/mainMenu.action';
import { TabIds } from '@src/domain/mainMenu';
import clearSvg from '@src/assets/icons/x-square.svg';
import chevronSvg from './assets/chevron.svg';

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

		const { TranslationService, GeoResourceLegendService, GeoResourceService, SecurityService } = $injector.inject(
			'TranslationService',
			'GeoResourceLegendService',
			'GeoResourceService',
			'SecurityService'
		);
		this._translationService = TranslationService;
		this._geoResourceLegendService = GeoResourceLegendService;
		this._geoResourceService = GeoResourceService;
		this._securityService = SecurityService;
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
					this.signal(UPDATE_ACTIVE_LEGENDS, resolvedLegendObjects.reverse());
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

		const inactiveGeoResources = availableGeoResources.filter((resource) => {
			return !activeLegends.some((legend) => legend.geoResourceId === resource.id);
		});

		const onSelectGeoResource = async (evt) => {
			const resource = evt.detail.selected;

			if (resource?.id) {
				addLegends(resource.id);
				evt.currentTarget.selected = null;
			}
		};

		const onRemoveLegend = (evt, legend) => {
			evt.stopPropagation();
			removeLegend(legend.geoResourceId);
		};

		const onToggleLegend = (evt, legend) => {
			evt.stopPropagation();
			// using hashedId because geoResourceId could contain a url which won't work for html content
			const element = this.shadowRoot.querySelector(`#legend-${legend.hashedId}`);
			const entryContainer = element.querySelector('.legend-entries-container');
			const collapseButton = this.shadowRoot.querySelector('#button_expand_or_collapse');
			collapseLegend(legend, !entryContainer.classList.contains('hidden'));
			collapseButton.title = getCollapseLegendsButtonTitle();
			collapseButton.label = getCollapseLegendsButtonLabel();
		};

		const collapseLegend = (legend, collapse) => {
			// using hashedId because geoResourceId could contain a url which won't work for html content
			const element = this.shadowRoot.querySelector(`#legend-${legend.hashedId}`);
			const entryContainer = element.querySelector('.legend-entries-container');
			const collapseIcon = element.querySelector('.toggler.icon.chevron');

			if (collapse) {
				entryContainer.classList.add('hidden');
				collapseIcon.classList.remove('iconexpand');
				collapseIcon.title = translate('legends_expand_legend_entry');
			} else {
				entryContainer.classList.remove('hidden');
				collapseIcon.classList.add('iconexpand');
				collapseIcon.title = translate('legends_collapse_legend_entry');
			}
		};

		const representGeoResourceOption = (option) => {
			return option?.label;
		};

		const closeLegendPanel = () => {
			setTab(TabIds.MAPS);
		};

		const getCollapseLegendsButtonLabel = () => {
			const expandable = [...this.shadowRoot.querySelectorAll(`.legend-entries-container`)].some((entry) => entry.classList.contains('hidden'));
			return expandable ? translate('legends_panel_button_expand_label') : translate('legends_panel_button_collapse_label');
		};

		const getCollapseLegendsButtonTitle = () => {
			const expandable = [...this.shadowRoot.querySelectorAll(`.legend-entries-container`)].some((entry) => entry.classList.contains('hidden'));
			return expandable ? translate('legends_panel_button_expand_title') : translate('legends_panel_button_collapse_title');
		};

		const expandOrCollapseLegendsAction = (evt) => {
			const entries = [...this.shadowRoot.querySelectorAll(`.legend-entries-container`)];

			const collapsable = !entries.some((entry) => entry.classList.contains('hidden'));
			activeLegends.forEach((legend) => collapseLegend(legend, collapsable));
			evt.currentTarget.title = getCollapseLegendsButtonTitle();
			evt.currentTarget.label = getCollapseLegendsButtonLabel();
		};

		const addAllLegendsAction = () => {
			addLegends(inactiveGeoResources.map((resource) => resource.id));
		};

		const removeAllLegendsAction = () => {
			clearLegends();
		};

		const getLegendHTML = (legend) => {
			const legendEntries = legend.filterLegendEntriesByZoomLevel(zoomLevel);
			return html`<div class="legend-entries-container">${legendEntries.map((entry) => getLegendEntryHTML(entry))}</div>`;
		};

		const getLegendEntryHTML = (entry) => {
			if (!entry.urlOrData) {
				return html`<div class="legend-entry"><span class="no-entry-text">${translate('legends_at_zoomlevel_not_available')}</span></div>`;
			}

			switch (entry.type) {
				case LegendEntryType.IMAGE_URL:
				case LegendEntryType.IMAGE_BASE64:
					return html`<div class="legend-entry"><img src=${entry.urlOrData} /></div>`;
				case LegendEntryType.PDF_URL:
					return html`<div class="legend-entry"><iframe src=${entry.urlOrData}></iframe></div>`;
				case LegendEntryType.HTML:
					return html`<div class="legend-entry">${unsafeHTML(this._securityService.sanitizeHtml(entry.urlOrData))}</div>`;
				default:
					return html`<div class="legend-entry"><span class="no-entry-text">${translate('legends_at_zoomlevel_not_available')}</span></div>`;
			}
		};

		const getLegendPanelHeaderContentHTML = () => {
			return html`<div class="main-button-container ${availableGeoResources.length < 1 ? 'hidden' : ''}">
				<div class="legend-select-container">
					<ba-searchable-select
						id="legend-select"
						.options=${inactiveGeoResources}
						.represent=${representGeoResourceOption}
						.placeholder=${translate('legends_choose_option')}
						.isResponsive=${true}
						@select=${onSelectGeoResource}
					></ba-searchable-select>
				</div>
				<ba-button
					id="button_expand_or_collapse"
					class="${activeLegends.length < 1 ? 'hidden' : ''}"
					.label=${getCollapseLegendsButtonLabel()}
					.title=${getCollapseLegendsButtonTitle()}
					.type=${'secondary'}
					.icon=${chevronSvg}
					@click=${expandOrCollapseLegendsAction}
				></ba-button>
				<ba-button
					id="button_add_legends"
					class="${inactiveGeoResources.length < 1 ? 'hidden' : ''}"
					.label=${translate('legends_panel_add_all_legends_label')}
					.title=${translate('legends_panel_add_all_legends_title')}
					.type=${'secondary'}
					.icon=${clearSvg}
					@click=${addAllLegendsAction}
				></ba-button>
				<ba-button
					id="button_clear_legends"
					class="${activeLegends.length === 0 ? 'hidden' : ''}"
					.label=${translate('legends_panel_remove_all_legends_label')}
					.title=${translate('legends_panel_remove_all_legends_title')}
					.type=${'secondary'}
					.icon=${clearSvg}
					@click=${removeAllLegendsAction}
				></ba-button>
			</div> `;
		};

		const getLegendViewerNoContentHTML = () => {
			return html`<div class="legend-no-content-container">
				<span class="legend-bg-icon"></span>
				<span class="info-text">
					${unsafeHTML(translate(availableGeoResources.length > 0 ? 'legends_panel_no_legends_selected' : 'legends_panel_no_legends_available'))}
				</span>
			</div>`;
		};

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<ul class="ba-list">
					<li class="ba-list-item  ba-list-inline ba-list-item__header legend-panel-header">
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

				${getLegendPanelHeaderContentHTML()} ${availableGeoResources.length < 1 ? nothing : html` <div class="separator"></div> `}
				<div id="legend-viewer" class="${activeLegends.length < 1 ? 'no-content' : ''}">
					${
						activeLegends.length < 1
							? getLegendViewerNoContentHTML()
							: activeLegends.map((legend) => {
									return html`
										<div id="legend-${legend.hashedId}" class="legend-container">
											<div class="legend-content-header" @click=${(evt) => onToggleLegend(evt, legend)}>
												<div class="legend-title">${legend.label}</div>
												<div class="button-container">
													<div>
														<ba-icon
															class="legend-entry-close-button"
															.size=${2.5}
															.icon=${removeSvg}
															.title=${translate('legends_entry_close_button')}
															@click=${(evt) => onRemoveLegend(evt, legend)}
														></ba-icon>
													</div>
													<div>
														<button
															class="legend-entry-collapse-button"
															title="${translate('legends_collapse_legend_entry')}"
															@click=${(evt) => onToggleLegend(evt, legend)}
														>
															<i class="toggler icon chevron icon-rotate-90 iconexpand"></i>
														</button>
													</div>
												</div>
											</div>
											<div class="legend-content">${getLegendHTML(legend)}</div>
										</div>
									`;
								})
					}
				</div>
			</div>
		`;
	}

	_resizeLegendIframes(contentRect) {
		const iframes = this.shadowRoot.querySelectorAll('.legend-entry iframe');
		for (const iframe of iframes) {
			iframe.width = contentRect.width - 30;
		}
	}

	static get tag() {
		return 'ba-legend-panel';
	}
}
