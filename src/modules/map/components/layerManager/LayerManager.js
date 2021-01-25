import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { repeat } from 'lit-html/directives/repeat.js';
import { modifyLayer } from './../../store/layers/layers.action';
import css from './layerManager.css';


export class LayerManager extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}


	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);
		const { active } = this._state;
		const   activeLayers = active;
		const layerCount = activeLayers.length;

		const onToggle = (layer) => {
			modifyLayer(layer.id, { visible: !layer.visible });
		};

		return html`
			<style>${css}</style>
			<div class="layermanager overflow-container">
				<div class='title'>${translate('layer_manager_title')} (${layerCount})</div> 
				<ul class='layers'>
                    ${repeat(activeLayers, (layer) => layer.id, (layer, index) => html`
					<li index=${index} >
						<div class='layer'>
							<ba-toggle title='${layer.label === '' ? layer.id : layer.label}' checked=${layer.visible} @toggle=${() => onToggle(layer)}>
								<span class='layer-label'>${layer.label}</span>
							</ba-toggle>
						</div>
					</li>`)}
                </ol>	
			</div>
		`;
	}
    
	/**
 * @override
 * @param {Object} store 
 */
	extractState(store) {
		const { layers: { active } } = store;
		
		return { active };
	}
    
	static get tag() {
		return 'ba-layer-manager';
	}
}