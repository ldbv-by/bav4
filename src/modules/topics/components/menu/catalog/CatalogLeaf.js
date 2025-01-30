/**
 * @module modules/topics/components/menu/catalog/CatalogLeaf
 */
import { html, nothing } from 'lit-html';
import css from './catalogLeaf.css';
import { $injector } from '../../../../../injection';
import { addLayer, removeLayerOf } from '../../../../../store/layers/layers.action';
import infoSvg from '../assets/info.svg';
import { openModal } from '../../../../../store/modal/modal.action';
import { createUniqueId } from '../../../../../utils/numberUtils';
import { AbstractMvuContentPanel } from '../../../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import { GeoResourceFuture } from '../../../../../domain/geoResources';
import { removeLayer } from '../../../../../store/layers/layers.action';

const Update_Layers_Store_Ready = 'update_layers_store_ready';
const Update_Active_Layers = 'update_active_layers';
const Update_GeoResource_Id = 'update_geoResource_id';
const Update_LoadingPreviewFlag = 'update_loadingPreviewFlag';

/**
 * Amount of time waiting before adding a layer in ms.
 */
export const LOADING_PREVIEW_DELAY_MS = 500;

/**
 * @class
 * @property {module:domain/catalogTypeDef~CatalogNode} data The catalog node for this CatalogLeaf
 * @author taulinger
 * @author alsturm
 * @author costa_gi
 */
export class CatalogLeaf extends AbstractMvuContentPanel {
	#geoResourceService;
	#translationService;

	constructor() {
		super({ layersStoreReady: false, geoResourceId: null, activeLayers: [] });

		const { GeoResourceService: geoResourceService, TranslationService: translationService } = $injector.inject(
			'GeoResourceService',
			'TranslationService'
		);

		this.#geoResourceService = geoResourceService;
		this.#translationService = translationService;

		this._timeoutId = null;
	}

	set data(catalogNode) {
		this.signal(Update_GeoResource_Id, catalogNode.geoResourceId);
	}

	onInitialize() {
		this.observe(
			(state) => state.layers.ready,
			(ready) => this.signal(Update_Layers_Store_Ready, ready)
		);
		this.observe(
			(state) => state.layers.active,
			(layers) => this.signal(Update_Active_Layers, layers)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Layers_Store_Ready:
				return { ...model, layersStoreReady: data };
			case Update_Active_Layers:
				return { ...model, activeLayers: [...data] };
			case Update_GeoResource_Id:
				return { ...model, geoResourceId: data };
			case Update_LoadingPreviewFlag:
				return { ...model, loadingPreview: data };
		}
	}

	static _tmpLayerId(id) {
		return `tmp_${CatalogLeaf.name}_${id}`;
	}

	createView(model) {
		const { layersStoreReady, geoResourceId, activeLayers, loadingPreview } = model;
		const translate = (key) => this.#translationService.translate(key);

		if (geoResourceId && layersStoreReady) {
			const checked = activeLayers
				.filter((l) => l.constraints.hidden === false)
				.map((layer) => layer.geoResourceId)
				.includes(geoResourceId);
			const geoR = this.#geoResourceService.byId(geoResourceId);
			const keywords = [...this.#geoResourceService.getKeywords(geoResourceId)];
			const label = geoR ? geoR.label : geoResourceId;
			const title = geoR ? geoR.label : translate('topics_catalog_leaf_no_georesource_title');

			const onToggle = (event) => {
				if (event.detail.checked) {
					addLayer(`${geoR.id}_${createUniqueId()}`, { geoResourceId: geoR.id });
				} else {
					removeLayerOf(geoR.id);
				}
			};

			const openGeoResourceInfoPanel = async () => {
				const content = html`<ba-georesourceinfo-panel .geoResourceId=${geoResourceId}></ba-georesourceinfo-panel>`;
				openModal(label, content);
			};
			const getBadges = (keywords) => {
				const toBadges = (keywords) =>
					keywords.map((keyword) => html`<ba-badge .color=${'var(--text3)'} .background=${'var(--roles-color)'} .label=${keyword}></ba-badge>`);

				return keywords.length === 0 ? nothing : toBadges(keywords);
			};

			const isGeoResourceActive = (geoResourceId) => {
				return activeLayers.filter((l) => l.id !== CatalogLeaf._tmpLayerId(geoResourceId)).some((l) => l.geoResourceId === geoResourceId);
			};

			const getActivePreviewClass = () => {
				return loadingPreview ? 'loading' : '';
			};

			const getPreviewClass = () => {
				return !checked && activeLayers.filter((l) => l.id === CatalogLeaf._tmpLayerId(geoResourceId)).length === 1 ? 'preview' : '';
			};

			/**
			 * Uses mouseenter and mouseleave events for adding/removing a preview layer.
			 * These events are not fired on touch devices, so there's no extra handling needed.
			 */
			const onMouseEnter = () => {
				if (isGeoResourceActive(geoResourceId)) return;

				//add a preview layer if GeoResource is accessible
				if (this.#geoResourceService.isAllowed(geoResourceId)) {
					const id = CatalogLeaf._tmpLayerId(geoResourceId);
					this._timeoutId = setTimeout(() => {
						addLayer(id, { geoResourceId: geoResourceId, constraints: { hidden: true } });
						const geoRes = this.#geoResourceService.byId(geoResourceId);
						if (geoRes instanceof GeoResourceFuture) {
							this.signal(Update_LoadingPreviewFlag, true);
							geoRes.onResolve(() => this.signal(Update_LoadingPreviewFlag, false));
						}
						this._timeoutId = null;
					}, LOADING_PREVIEW_DELAY_MS);
				}
			};

			const onMouseLeave = () => {
				//remove the preview layer
				removeLayer(CatalogLeaf._tmpLayerId(geoResourceId));
				if (this._timeoutId) {
					clearTimeout(this._timeoutId);
					this._timeoutId = null;
				}
				this.signal(Update_LoadingPreviewFlag, false);
			};

			return html`
				<style>
					${css}
				</style>
				<span
					class="ba-list-item ${getActivePreviewClass()} ${getPreviewClass()}"
					@mouseenter=${() => onMouseEnter()}
					@mouseleave=${() => onMouseLeave()}
				>
					<ba-checkbox class="ba-list-item__text" @toggle=${onToggle} .disabled=${!geoR} .checked=${checked} tabindex="0" .title=${title}
						><span>${label}</span> ${getBadges(keywords)}</ba-checkbox
					>
					<div class="ba-icon-button ba-list-item__after vertical-center separator">
						<ba-icon
							id="info"
							data-test-id
							.icon="${infoSvg}"
							.color=${'var(--primary-color)'}
							.color_hover=${'var(--text3)'}
							.size=${2}
							.title=${translate('topics_catalog_leaf_info')}
							@click=${openGeoResourceInfoPanel}
						></ba-icon>
					</div>
				</span>
			`;
		}
		return nothing;
	}

	static get tag() {
		return 'ba-catalog-leaf';
	}
}
