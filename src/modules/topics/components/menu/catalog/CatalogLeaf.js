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

		const { GeoResourceService: geoResourceService }
			= $injector.inject('GeoResourceService');

		this._geoResourceService = geoResourceService;
	}



	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.render();
	}

	createView(state) {

		const { currentTopicId, activeLayers, layersStoreReady } = state;


		if (this._catalogPart && layersStoreReady) {

			const style = document.createElement('style');
			style.innerHTML = `.ba-list-item { --primary-color-theme: var(--topic-theme-${currentTopicId});	 }`;
			this.shadowRoot.appendChild(style);

			const { geoResourceId } = this._catalogPart;
			const isChecked = activeLayers.map(geoResource => geoResource.id).includes(geoResourceId);
			const geoR = this._geoResourceService.byId(geoResourceId);
			const label = geoR ? geoR.label : geoResourceId;

			const onToggle = (event) => {
				if (geoR) {
					if (event.detail.checked) {
						addLayer(geoR.id, { label: geoR.label });
					}
					else {
						removeLayer(geoR.id);
					}
				}
			};

			return html`
			<style>
			${css}		
			</style>
			<span class="ba-list-item" >		
					<ba-checkbox class="ba-list-item__text" @toggle=${onToggle}  checked=${isChecked} tabindex='0'  title="checkbox"><span>${label}</span></ba-checkbox>						
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