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



	set data(catalogPart) {
		this._catalogPart = catalogPart;
		this.render();
	}

	createView(state) {

		const { currentTopicId, activeLayers } = state;

		const {
			GeoResourceService: geoResourceService
		} = $injector.inject('GeoResourceService');

		const style = document.createElement( 'style' );
		style.innerHTML = `.ba-list-item { --primary-color-theme: var(--topic-theme-${currentTopicId});	 }`;
		this.shadowRoot.appendChild( style );

		if (this._catalogPart) {
			const { geoResourceId } = this._catalogPart;

			let isChecked = false;
			if (activeLayers.length > 0) {
				activeLayers.forEach(l => {
					if (l.geoResourceId === geoResourceId) {						
						isChecked = true;						
					}
				});
			}

			const geoR = geoResourceService.byId(geoResourceId);
			let label = 'no geoR';
			if (geoR) {
				label = geoR.label;
			}

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
		const { topics: { current: currentTopicId }, layers: { active: activeLayers } } = globalState;
		return { currentTopicId, activeLayers };
	}


	static get tag() {
		return 'ba-catalog-leaf';
	}
}