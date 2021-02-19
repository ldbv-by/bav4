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

		const { CoordinateService } = $injector.inject('CoordinateService');
		this._coordinateService = CoordinateService;
	}

	createView() {
		const { zoom } = this._state;

		const zoomRounded = round(zoom, 3);

		return html`
			<style>${css}</style>
			<div class='content'>
				<div class='theme-toggle'><ba-theme-toggle></ba-theme-toggle></div> 
				<div class='coordinates'>
					<div class='labels' >ZoomLevel: ${zoomRounded} | </div>
					<ba-coordinate-select></ba-coordinate-select>
				</div>				
			</div>
		`;
	}

	extractState(store) {
		const { position: { zoom } } = store;
		return { zoom };
	}

	static get tag() {
		return 'ba-map-info';
	}
}
