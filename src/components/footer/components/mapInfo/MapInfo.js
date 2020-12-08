import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { changeZoomAndPosition } from '../../../map/store/olMap.action';
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

		const { CoordinateService } = $injector.inject('CoordinateService');
		this._coordinateService = CoordinateService;
	}

	initialize() {
		// let's listen for map_clicked -events
		window.addEventListener('map_clicked', (evt) => {
			alert('click @ ' + this._coordinateService.stringifyYX(
				this._coordinateService.toLonLat(evt.detail), 3));
		});

	}


	onWindowLoad() {
		// register callback on ba-button element
		this._root.getElementById('button0').onClick = () => {
			changeZoomAndPosition({
				zoom: 13,
				position: this._coordinateService.fromLonLat([11.57245, 48.14021])
			});
		};
		this._root.getElementById('button1').onClick = () => {
			changeZoomAndPosition({
				zoom: 11,
				position: this._coordinateService.fromLonLat([11.081, 49.449])
			});
		};
	}

	createView() {
		const { zoom, pointerPosition } = this._state;


		const zoomRounded = round(zoom, 3);


		const pointerPosition4326 = pointerPosition
			? this._coordinateService.stringifyYX(
				this._coordinateService.toLonLat(pointerPosition), 3)
			: '';


		return html`
			<style>${css}</style> 
			<div class='labels' >ZoomLevel: ${zoomRounded} ${pointerPosition4326}</div>
			<div class='buttons'>
				<ba-button id='button0' label='primary style' type="primary"></ba-button>
				<ba-button id='button1' label='secondary style'></ba-button>
				<ba-button id='button2' label='disabled' type='primary' disabled=true ></ba-button>
				<ba-button id='button3' label='disabled' disabled=true></ba-button>
			</div>
		`;
	}

	extractState(store) {
		const { map: { zoom, pointerPosition } } = store;
		return { zoom, pointerPosition };
	}

	static get tag() {
		return 'ba-map-info';
	}
}
