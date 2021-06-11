import { html, nothing } from 'lit-html';
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
		this._checked = false;
	}


	initialize() {
		//after layersStore is ready we re-render
		this.observe('layersStoreReady', () => this.render());
	}

	onStateChanged() {
		//nothing to do here, we only render after data changes, layersStore is ready or a layer was selected or deselected
	}

	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.render();
	}

	createView(state) {

		const { currentTopicId, activeLayers, layersStoreReady } = state;
		const translate = (key) => this._translationService.translate(key);


		if (this._catalogPart && layersStoreReady) {

			const style = document.createElement('style');
			style.innerHTML = `.ba-list-item { --primary-color-theme: var(--topic-theme-${currentTopicId});	 }`;
			this.shadowRoot.appendChild(style);

			const { geoResourceId } = this._catalogPart;
			const isChecked = activeLayers.map(geoResource => geoResource.id).includes(geoResourceId);
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
				//let's update the view
				this.render();
			};

			return html`
			<style>
			${css}		
			</style>
			<span class="ba-list-item" >		
					<ba-checkbox class="ba-list-item__text" @toggle=${onToggle}  disabled=${!geoR} checked=${isChecked} tabindex='0' title=${title}><span>${label}</span></ba-checkbox>						
					<button class="ba-icon-button ba-list-item__after verticla-center seperator">						
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
		const { topics: { current: currentTopicId }, layers: { active: activeLayers, ready: layersStoreReady } } = globalState;
		return { currentTopicId, activeLayers, layersStoreReady };
	}


	static get tag() {
		return 'ba-catalog-leaf';
	}
}