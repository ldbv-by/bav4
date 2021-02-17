import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import css from './coordinateSelect.css';
import { $injector } from '../../../../injection';

/**
 * Dropdown for selecting the coordinate system
 * @class 
 * @author bakir_en  
 */

export class CoordinateSelect extends BaElement {

	constructor() {
		super();
  
		const { CoordinateService, EnvironmentService, MapService, TranslationService } 
            = $injector.inject('CoordinateService', 'EnvironmentService', 'MapService', 'TranslationService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
		this._mapService = MapService;
		this._translationService = TranslationService;  
	}
    
	/**
     * @override 
     */
	isRenderingSkipped() {
		return this._environmentService.isTouch();
	}
    
	/**
	 * @override
	 */
	onWindowLoad() {
		// without this if clause,  this._view equals null
		if (!this._environmentService.isTouch()) {
			this._view = this.shadowRoot.querySelector('.select-coordinate');
			this._selected = this._view.value;
		} 
	}

	/**
     *@override 
     */
	createView() {

		const { pointerPosition } = this._state;

		const items = this._mapService.getSridDefinitionsForView();

		const getPointerPositionChange = () => {
			switch (this._selected) {
				case String(items[1].code): //4326
					return this._coordinateService.stringify(
						this._coordinateService.toLonLat(pointerPosition), 3);
				case String(items[0].code): //25832
					return this._coordinateService.stringify(
						this._coordinateService.transform(pointerPosition, '3857', '25832'), 3);
				default:
					return '';
			} 
		}; 


		const onChange = () => {			
			this._selected = this._view.value; 
		};


		return html`
			<style>${css}</style>
            <div class='coordinate-container' >
                <div class='coordinate-label'>${getPointerPositionChange()}</div>
					<select class='select-coordinate' @change="${onChange}" >
					${items.map((item) => html`
						<option class="select-coordinate-option" value="${item.code}" target="_blank">${item.label}</a> 
					`)}
					</select>
			</div>				
		`;
	} 

	extractState(store) {
		const { position: { pointerPosition } } = store;
		return { pointerPosition };
	}

	static get tag() {
		return 'ba-coordinate-select';
	} 
} 