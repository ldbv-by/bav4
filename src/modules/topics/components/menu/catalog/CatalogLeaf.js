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

const Update_Layers_Store_Ready = 'update_layers_store_ready';
const Update_Active_Layers = 'update_active_layers';
const Update_GeoResource_Id = 'update_geoResource_id';

/**
 * @class
 * @property {module:domain/catalogTypeDef~CatalogEntry} data The catalog entry for this CatalogLeaf
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
	}

	set data(catalogEntry) {
		this.signal(Update_GeoResource_Id, catalogEntry.geoResourceId);
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
		}
	}

	createView(model) {
		const { layersStoreReady, geoResourceId, activeLayers } = model;
		const translate = (key) => this.#translationService.translate(key);

		if (geoResourceId && layersStoreReady) {
			const checked = activeLayers.map((layer) => layer.geoResourceId).includes(geoResourceId);
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
			return html`
				<style>
					${css}
				</style>
				<span class="ba-list-item">
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
