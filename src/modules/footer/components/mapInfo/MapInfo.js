import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { round } from '../../../../utils/numberUtils';
import { $injector } from '../../../../injection';
import css from './mapInfo.css';



/**
 * Demo-Element to show some information and do some action on the map
 * @class 
 * @author aul
 */
export class MapInfo extends BaElement {


	constructor() {
		super();

		const { CoordinateService, MapService } = $injector.inject('CoordinateService', 'MapService');
		this._coordinateService = CoordinateService;
		this._mapService = MapService;
	}

	initialize() {
		// let's listen for map_clicked -events
		window.addEventListener('map_clicked', (evt) => {
			alert('click @ ' + this._coordinateService.stringify(
				this._coordinateService.toLonLat(evt.detail), 3));
		});

	}

	/**
	 * @override
	 */
	onWindowLoad() {
		this._view = this.shadowRoot.getElementById('select-coord');
		this._selected = this._view.value;
	}

	createView() {
		const { zoom, pointerPosition } = this._state;

		const zoomRounded = round(zoom, 3);
		const items = this._mapService.getSridsForView();
		const srid = this._mapService.getSrid();

		const getPointerPositionChange = () => {
			switch (this._selected) {
				case '4326':
					return this._coordinateService.stringify(
						this._coordinateService.toLonLat(pointerPosition), 3);
				case '25832':
					return this._coordinateService.stringify(
						this._coordinateService.transform(pointerPosition, '3857', '25832'), 3);
				case '3857':
					return this._coordinateService.stringify(
						pointerPosition, 3);
				default:
					return '';
			} 

		}; 


		const onChange = () => {			
			this._selected = this._view.value; 
		};


		return html`
			<style>${css}</style>
			<div class='content'>
				<div class='theme-toggle'><ba-theme-toggle></ba-theme-toggle></div> 
				<div class='coord'>
				<div class='labels' >ZoomLevel: ${zoomRounded} | ${getPointerPositionChange()}</div>
					<select id='select-coord' @change="${onChange}" >
					${items.map((item) => html`
						<option class="select-coord-option" value="${item}" target="_blank">${item}</a> 
					`)}
					<option class="select-coord-option" value="${srid}" target="_blank">${srid}</a> 
					</select>
				</div>				
			</div>
		`;
	}

	extractState(store) {
		const { position: { zoom, pointerPosition } } = store;
		return { zoom, pointerPosition };
	}

	static get tag() {
		return 'ba-map-info';
	}
}
