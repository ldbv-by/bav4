/**
 * @module modules/topics/components/menu/catalog/CatalogLeaf
 */
import { html, nothing } from 'lit-html';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';
import css from './catalogLeaf.css';
import { $injector } from '../../../../../injection';
import { addLayer, removeLayerOf } from '../../../../../store/layers/layers.action';
import infoSvg from '../assets/info.svg';
import { openModal } from '../../../../../store/modal/modal.action';
import { createUniqueId } from '../../../../../utils/numberUtils';

/**
 * @class
 * @author taulinger
 * @author alsturm
 * @author costa_gi
 */
export class CatalogLeaf extends AbstractContentPanel {
	constructor() {
		super();

		const { GeoResourceService: geoResourceService, TranslationService: translationService } = $injector.inject(
			'GeoResourceService',
			'TranslationService'
		);

		this._geoResourceService = geoResourceService;
		this._translationService = translationService;
	}

	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.updateState();
	}

	createView(state) {
		const { layersStoreReady, checked, geoResourceId } = state;
		const translate = (key) => this._translationService.translate(key);

		if (geoResourceId && layersStoreReady) {
			const geoR = this._geoResourceService.byId(geoResourceId);
			const keywords = [...this._geoResourceService.getKeywords(geoResourceId)];
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

	extractState(globalState) {
		//our local state contains values derived form the global state and local data (_catalogPart)
		const {
			layers: { active: activeLayers, ready: layersStoreReady }
		} = globalState;

		const geoResourceId = this._catalogPart ? this._catalogPart.geoResourceId : null;
		const checked = geoResourceId ? activeLayers.map((layer) => layer.geoResourceId).includes(geoResourceId) : false;

		return { layersStoreReady, geoResourceId, checked };
	}

	static get tag() {
		return 'ba-catalog-leaf';
	}
}
