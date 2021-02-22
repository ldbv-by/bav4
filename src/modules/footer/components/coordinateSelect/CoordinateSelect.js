import { html } from 'lit-html';
import { $injector } from '../../../../injection';
import { BaElement } from '../../../BaElement';
import css from './coordinateSelect.css';

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
		
		this._items = this._mapService.getSridDefinitionsForView();
		// set selected coordinate system initially
		this._selectedCode = String(this._items[0].code);
	}
    
	/**
     * @override 
     */
	isRenderingSkipped() {
		return this._environmentService.isTouch();
	}

	/**
     *@override 
     */
	createView() {

		const { pointerPosition } = this._state;

		const getPointerPositionChange = () => {
			switch (this._selectedCode) {
				case String(this._items[0].code): //25832
					// on window load pointerPosition returns null so we have to catch this here
					return pointerPosition ? 
						this._coordinateService.stringify(
							this._coordinateService.transform(pointerPosition, this._mapService.getSrid(), this._items[0].code),  this._items[0].code) 
						: '';
				case String(this._items[1].code): //4326
					return this._coordinateService.stringify(
						this._coordinateService.toLonLat(pointerPosition), this._items[1].code, { digits:5 });
				default:
					return '';
			} 
		}; 


		const onChange = () => {			
			this._selectedCode = this.shadowRoot.querySelector('.select-coordinate').value;
			this.render();
		};


		return html`
			<style>${css}</style>
            <div class='coordinate-container' >
                <div class='coordinate-label'>${getPointerPositionChange()}</div>
					<select class='select-coordinate' @change="${onChange}">
					${this._items.map((item) => html`
						<option class="select-coordinate-option" value="${item.code}">${item.label}</option> 
					`)}
					</select>
			</div>				
		`;
	} 

	/**
     * @override 
     */
	extractState(store) {
		const { position: { pointerPosition } } = store;
		return { pointerPosition };
	}

	static get tag() {
		return 'ba-coordinate-select';
	} 
} 