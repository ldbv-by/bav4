import { html } from 'lit-html';
import css from './layerItem.css';
import { $injector } from '../../../injection';
import { classMap } from 'lit-html/directives/class-map.js';
import { modifyLayer, removeLayer } from './../../../store/layers/layers.action';
import arrowUpSvg from './assets/arrow-up-short.svg';
import arrowDownSvg from './assets/arrow-down-short.svg';
import removeSvg from './assets/trash.svg';
import infoSvg from './assets/info.svg';
import { AbstractContentPanel } from '../../menu/components/mainMenu/content/AbstractContentPanel';
import { openModal } from '../../../../src/store/modal/modal.action';

/**
 * Child element of the LayerManager. Represents one layer and its state.
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 * @author alsturm
 * @author costa_gi
 */
export class LayerItem extends AbstractContentPanel {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._layer = { id: '', label: '', visible: true, collapsed: true, opacity: 1 };
	}


	/**
	* @override
	*/
	onAfterRender(firsttime) {
		if (firsttime) {
			/* grab sliders on page */
			const sliders = this._root.querySelectorAll('input[type="range"]');

			/* take a slider element, return a percentage string for use in CSS */
			const rangeToPercent = slider => {
				const max = slider.getAttribute('max') || 100;
				const percent = slider.value / max * 100;
				return `${parseInt(percent)}%`;
			};

			/* on page load, set the fill amount */
			sliders.forEach(slider => {
				slider.style.setProperty('--track-fill', rangeToPercent(slider));

				/* when a slider changes, update the fill prop */
				slider.addEventListener('input', e => {
					e.target.style.setProperty('--track-fill', rangeToPercent(e.target));
				});
			});
		}
	}

	/**
	 * @override
	 */
	createView() {
		const translate = (key) => this._translationService.translate(key);

		const currentLabel = this._layer.label === '' ? this._layer.id : this._layer.label;

		const getCollapseTitle = () => {
			return this._layer.collapsed ? translate('layerManager_expand') : translate('layerManager_collapse');
		};

		const changeOpacity = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(this._layer.id, { opacity: parseInt(event.target.value) / 100 });
		};
		const toggleVisibility = (event) => {
			//state store change -> implicit call of #render()
			modifyLayer(this._layer.id, { visible: event.detail.checked });
		};
		const toggleCollapse = () => {
			//change of local state -> explicit call of #render()
			this._layer.collapsed = !this._layer.collapsed;
			this.render();
		};
		const increaseIndex = () => {
			//state store change -> implicit call of #render()
			modifyLayer(this._layer.id, { zIndex: this._layer.zIndex + 1 });
		};
		const decreaseIndex = () => {
			//state store change -> implicit call of #render()
			if (this._layer.zIndex - 1 >= 0) {
				modifyLayer(this._layer.id, { zIndex: this._layer.zIndex - 1 });
			}
		};

		const remove = () => {
			//state store change -> implicit call of #render()
			removeLayer(this._layer.id);
		};

		const getSlider = () => {

			const onPreventDragging = (e) => {
				e.preventDefault();
				e.stopPropagation();
			};

			return html`<div class='slider-container'>
				<input  
					type="range" 
					min="1" 
					title=${translate('layerManager_opacity')}
					max="100" 
					value=${this._layer.opacity * 100} 
					class='opacity-slider' 
					draggable='true' 
					@input=${changeOpacity} 
					@dragstart=${onPreventDragging}
					id="opacityRange"></div>`;
		};


		const getVisibilityTitle = () => {
			return this._layer.label + ' - ' + translate('layerManager_change_visibility');
		};

		const iconCollapseClass = {
			iconexpand: !this._layer.collapsed
		};

		const bodyCollapseClass = {
			iscollapse: this._layer.collapsed
		};

		const openGeoResourceInfoPanel = async () => {
			const content = html`<ba-georesourceinfo-panel .geoResourceId=${this._layer.id}></ba-georesourceinfo-panel>`;
			openModal(this._layer.label, content);
		};

		return html`
        <style>${css}</style>
        <div class='ba-section divider'>
            <div class='ba-list-item'>          

                    <ba-checkbox .title='${getVisibilityTitle()}'  class='ba-list-item__text' tabindex='0' .checked=${this._layer.visible} @toggle=${toggleVisibility}>${currentLabel}</ba-checkbox>                                                   
                                       
                <button id='button-detail' data-test-id class='ba-list-item__after' title="${getCollapseTitle()}" @click="${toggleCollapse}">
                    <i class='icon chevron icon-rotate-90 ${classMap(iconCollapseClass)}'></i>
                </button>   
            </div>
            <div class='collapse-content ba-list-item  ${classMap(bodyCollapseClass)}'>                                                                                                                                                                
					${getSlider()}   
					<div>                                                                                              
						<ba-icon id='increase' .icon='${arrowUpSvg}' .color=${'var(--primary-color)'} .color_hover=${'var(--text3)'} .size=${2.6} .title=${translate('layerManager_move_up')} @click=${increaseIndex}></ba-icon>                    				
					</div>                                                                                              
					<div>                                                                                              
						<ba-icon id='decrease' .icon='${arrowDownSvg}' .color=${'var(--primary-color)'} .color_hover=${'var(--text3)'} .size=${2.6} .title=${translate('layerManager_move_down')} @click=${decreaseIndex}></ba-icon>                                
					</div>                                                                                              
					<div>                                                                                              
						<ba-icon id='info' data-test-id .icon='${infoSvg}' .color=${'var(--primary-color)'} .color_hover=${'var(--text3)'} .size=${2.6} @click=${openGeoResourceInfoPanel}></ba-icon>                 
					</div>                                                                                              
					<div>                                                                                              
						<ba-icon id='remove' .icon='${removeSvg}' .color=${'var(--primary-color)'} .color_hover=${'var(--text3)'} .size=${2.6} .title=${translate('layerManager_remove')} @click=${remove}></ba-icon>               
					</div>                                                                                              
            </div>
        </div>`;
	}

	static get tag() {
		return 'ba-layer-item';
	}

	set layer(value) {
		this._layer = value;
		this.render();
	}
}
