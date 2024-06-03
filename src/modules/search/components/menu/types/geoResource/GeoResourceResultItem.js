/**
 * @module modules/search/components/menu/types/geoResource/GeoResourceResultItem
 */
import { html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import css from './geoResourceResultItem.css';
import { MvuElement } from '../../../../../MvuElement';
import { $injector } from '../../../../../../injection';
import { createUniqueId } from '../../../../../../utils/numberUtils';
import { fitLayer } from '../../../../../../store/position/position.action';
import { GeoResourceFuture, VectorGeoResource } from '../../../../../../domain/geoResources';
import zoomToExtentSvg from '../../assets/zoomToExtent.svg';
import infoSvg from '../../assets/info.svg';
import { openModal } from '../../../../../../store/modal/modal.action';

const Update_GeoResourceSearchResult = 'update_geoResourceSearchResult';
const Update_LoadingPreviewFlag = 'update_loadingPreviewFlag';
const Update_ActiveLayers = 'update_activeLayers';

/**
 * Amount of time waiting before adding a layer in ms.
 */
export const LOADING_PREVIEW_DELAY_MS = 500;

/**
 * Renders a search result item for a geoResource.
 *
 * Properties:
 * - `data`
 *
 * @class
 * @author taulinger
 */
export class GeoResourceResultItem extends MvuElement {
	#geoResourceService;
	constructor() {
		super({
			geoResourceSearchResult: null,
			loadingPreview: false,
			activeLayers: []
		});

		const { GeoResourceService: geoResourceService, TranslationService: translationService } = $injector.inject(
			'GeoResourceService',
			'TranslationService'
		);

		this.#geoResourceService = geoResourceService;
		this._translationService = translationService;
		this._timeoutId = null;
		this._wmsLayers = null;
	}

	update(type, data, model) {
		switch (type) {
			case Update_GeoResourceSearchResult:
				return { ...model, geoResourceSearchResult: data };
			case Update_LoadingPreviewFlag:
				return { ...model, loadingPreview: data };
			case Update_ActiveLayers:
				return { ...model, activeLayers: data.map((l) => ({ geoResourceId: l.geoResourceId, id: l.id })) };
		}
	}

	onInitialize() {
		this.observe(
			(state) => state.layers.active,
			(activeLayers) => this.signal(Update_ActiveLayers, activeLayers)
		);
	}

	set data(geoResourceSearchResult) {
		this.signal(Update_GeoResourceSearchResult, geoResourceSearchResult);
	}

	static _tmpLayerId(id) {
		return `tmp_${GeoResourceResultItem.name}_${id}`;
	}

	createView(model) {
		const { geoResourceSearchResult, loadingPreview } = model;
		const translate = (key) => this._translationService.translate(key);

		const isLayerActive = (geoResourceId) => {
			return model.activeLayers
				.filter((l) => l.id !== GeoResourceResultItem._tmpLayerId(geoResourceId))
				.some((l) => l.geoResourceId === geoResourceId);
		};

		/**
		 * Uses mouseenter and mouseleave events for adding/removing a preview layer.
		 * These events are not fired on touch devices, so there's no extra handling needed.
		 */
		const onMouseEnter = (result) => {
			if (isLayerActive(result.geoResourceId)) return;

			//add a preview layer if GeoResource is accessible
			if (this.#geoResourceService.isAllowed(result.geoResourceId)) {
				const id = GeoResourceResultItem._tmpLayerId(result.geoResourceId);
				this._timeoutId = setTimeout(() => {
					addLayer(id, { geoResourceId: result.geoResourceId, constraints: { hidden: true } });
					const geoRes = this.#geoResourceService.byId(result.geoResourceId);
					if (geoRes instanceof GeoResourceFuture) {
						this.signal(Update_LoadingPreviewFlag, true);
						geoRes.onResolve(() => this.signal(Update_LoadingPreviewFlag, false));
					}
					this._timeoutId = null;
				}, LOADING_PREVIEW_DELAY_MS);
			}
		};

		const onMouseLeave = (result) => {
			//remove the preview layer
			removeLayer(GeoResourceResultItem._tmpLayerId(result.geoResourceId));
			if (this._timeoutId) {
				clearTimeout(this._timeoutId);
				this._timeoutId = null;
			}
			this.signal(Update_LoadingPreviewFlag, false);
		};

		const onClick = (result) => {
			if (isLayerActive(result.geoResourceId)) {
				model.activeLayers.filter((l) => l.geoResourceId === result.geoResourceId).forEach((l) => removeLayer(l.id));
			} else {
				//remove the preview layer
				removeLayer(GeoResourceResultItem._tmpLayerId(result.geoResourceId));
				//add the "real" layer after some delay, which gives the user a better feedback
				const geoR = this.#geoResourceService.byId(result.geoResourceId);
				if (geoR) {
					const id = `${result.geoResourceId}_${createUniqueId()}`;
					const opacity = geoR.opacity;
					addLayer(id, { geoResourceId: result.geoResourceId, opacity });
				}
			}
		};

		const onClickZoomToExtent = (e, result) => {
			const id = GeoResourceResultItem._tmpLayerId(result.geoResourceId);
			//ensures that the layer has been added
			//the layer will be removed with onMouseLeave
			addLayer(id, { geoResourceId: result.geoResourceId, constraints: { hidden: true } });
			fitLayer(id);
			e.stopPropagation();
		};

		const onClickOpenGeoResourceInfoPanel = async (result) => {
			const content = html`<ba-georesourceinfo-panel .geoResourceId=${result.geoResourceId}></ba-georesourceinfo-panel>`;
			openModal('label', content);
		};

		const getActivePreviewClass = () => {
			return loadingPreview ? 'loading' : '';
		};

		const getBadges = (keywords) => {
			const toBadges = (keywords) =>
				keywords.map((keyword) => html`<ba-badge .color=${'var(--text3)'} .background=${'var(--roles-color)'} .label=${keyword}></ba-badge>`);
			return keywords.length === 0 ? nothing : toBadges(keywords);
		};

		const getZoomToExtentButton = (result) => {
			const geoRes = this.#geoResourceService.byId(result.geoResourceId);
			return geoRes instanceof VectorGeoResource && this.#geoResourceService.isAllowed(result.geoResourceId)
				? html`
						<ba-icon
							.icon="${zoomToExtentSvg}"
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--text3)'}
							.size=${2}
							.title="${translate('search_result_item_zoom_to_extent')}"
							@click="${(e) => onClickZoomToExtent(e, result)}"
						>
						</ba-icon>
					`
				: nothing;
		};

		if (geoResourceSearchResult) {
			const keywords = [...this.#geoResourceService.getKeywords(geoResourceSearchResult.geoResourceId)];
			return html`
				<style>
					${css}
				</style>
				<li
					class="ba-list-item ${getActivePreviewClass()}"
					tabindex="0"
					@mouseenter=${() => onMouseEnter(geoResourceSearchResult)}
					@mouseleave=${() => onMouseLeave(geoResourceSearchResult)}
				>
					<span class="ba-list-item__pre ">
						<ba-checkbox
							id="toggle_layer"
							class="ba-list-item__text"							
							@toggle=${() => onClick(geoResourceSearchResult)}
							.disabled=${!geoResourceSearchResult}
							.checked=${isLayerActive(geoResourceSearchResult.geoResourceId)}
							tabindex="0"
							>
							<span class="ba-list-item__text ">
								${
									loadingPreview
										? html`<ba-spinner .label=${geoResourceSearchResult.labelFormatted}></ba-spinner>`
										: html`${unsafeHTML(geoResourceSearchResult.labelFormatted)} ${getBadges(keywords)}`
								}
							</span>
						</ba-checkobx>
					</span>
					<div class="ba-list-item__after separator">
					${getZoomToExtentButton(geoResourceSearchResult)}
					<ba-icon
						class='info-button'
						.icon="${infoSvg}"
						.color=${'var(--primary-color)'}
						.color_hover=${'var(--text3)'}
						.size=${2}
						.title="${translate('search_result_item_info')}"
						@click="${() => onClickOpenGeoResourceInfoPanel(geoResourceSearchResult)}"
					>
					</ba-icon>
					</div>
				</li>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-search-content-panel-georesource-item';
	}
}
