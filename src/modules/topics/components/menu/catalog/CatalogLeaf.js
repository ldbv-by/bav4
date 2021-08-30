import { html, nothing } from 'lit';
import { AbstractContentPanel } from '../../../../menu/components/mainMenu/content/AbstractContentPanel';
import css from './catalogLeaf.css';
import { $injector } from '../../../../../injection';
import { addLayer, removeLayer } from '../../../../../store/layers/layers.action';


/**
 * @class
 * @author taulinger
 * @author alsturm
 */
export class CatalogLeaf extends AbstractContentPanel {

	constructor() {
		super();

		const {
			GeoResourceService: geoResourceService,
			TranslationService: translationService
		}
			= $injector.inject('GeoResourceService', 'TranslationService');

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
			const label = geoR ? geoR.label : geoResourceId;
			const title = geoR ? geoR.label : translate('topics_catalog_leaf_no_georesource_title');

			const onToggle = (event) => {
				if (event.detail.checked) {
					addLayer(geoR.id, { label: geoR.label });
				}
				else {
					removeLayer(geoR.id);
				}
			};

			return html`
			<style>
			${css}		
			</style>
			<span class="ba-list-item" >		
					<ba-checkbox class="ba-list-item__text" @toggle=${onToggle}  disabled=${!geoR} checked=${checked} tabindex='0' title=${title}><span>${label}</span></ba-checkbox>						
					<button class="ba-icon-button ba-list-item__after vertical-center separator">						
						<span  class='icon-background'>
						 </span>
						<i class='icon icon-secondary info'></i>
					</button>
				</span>
        	`;
		}
		return nothing;
	}

	extractState(globalState) {
		//our local state contains values derived form the global state and local data (_catalogPart)
		const { layers: { active: activeLayers, ready: layersStoreReady } } = globalState;

		const geoResourceId = this._catalogPart ? this._catalogPart.geoResourceId : null;
		const checked = geoResourceId ? activeLayers.map(geoResource => geoResource.id).includes(geoResourceId) : false;

		return { layersStoreReady, geoResourceId, checked };
	}


	static get tag() {
		return 'ba-catalog-leaf';
	}
}
