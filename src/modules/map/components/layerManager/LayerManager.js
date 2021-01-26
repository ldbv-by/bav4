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
		
		const getToggleTitle = (layer) => {
			const name = layer.label === '' ? layer.id : layer.label;
			return name + ' - ' + translate('layer_manager_change_visibility');
		};

		const getSlider = (layer) => {
			const onChangeOpacity = (e) => {				
				const input = e.target;
				const properties = { opacity: input.value / 100 };
				modifyLayer(layer.id, properties);				
			};

			return html`<div class='slider-container'>
				<input id=${'opacity-slider' + layer.id} type="range" min="1" max="100" value=${layer.opacity * 100} class="opacity-slider" @input=${onChangeOpacity} id="myRange"></div>`;

		};
		return html`
			<style>${css}</style>
			<div class="layermanager overflow-container">
				<div class='title'>${translate('layer_manager_title')} (${layerCount})</div> 
				<ul class='layers'>
                    ${repeat(activeLayers, (layer) => layer.id, (layer, index) => html`
					<li index=${index}>
						<div class='layer'>
							<div class='layer-header'>
								<span class='layer-label'>${layer.label === '' ? layer.id : layer.label}</span>
								<ba-toggle title='${getToggleTitle(layer)}' checked=${layer.visible} @toggle=${() => onToggle(layer)}></ba-toggle>
							</div>
							<div class='layer-body'>
								${getSlider(layer)}
							</div>
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