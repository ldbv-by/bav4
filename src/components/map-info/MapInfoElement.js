import { html } from 'lit-html';
import BaElement from '../BaElement';
import { changeZoomAndPosition } from '../../store/map/actions';
import { round } from '../../utils/numberUtils';
import { $injector } from '../../injection';



/**
 * Demo-Element to show some information and do some action on the map
 * @class 
 * @author aul
 */
export class MapInfoElement extends BaElement {


	constructor() {
		super();

		const { CoordinateService } = $injector.inject('CoordinateService');
		this.coordinateService = CoordinateService;
	}

	initialize() {
		// let's listen for map_clicked -events
		window.addEventListener('map_clicked', (evt) => {
			alert('click @ ' + this.coordinateService.stringifyYX(
				this.coordinateService.toLonLat(evt.detail), 3));
		});
	}

	createView() {
		const { zoom, pointerPosition } = this.state;


		const zoomRounded = round(zoom, 3);


		const pointerPosition4326 = pointerPosition
			? this.coordinateService.stringifyYX(
				this.coordinateService.toLonLat(pointerPosition), 3)
			: '';


		const onFlyToButtonClicked = () => {

			changeZoomAndPosition({
				zoom: 13,
				position: this.coordinateService.fromLonLat([11.57245, 48.14021])
			});
		};


		return html`
        <div class='zoomLabel' >ZoomLevel: ${zoomRounded} <button  @click=${onFlyToButtonClicked}>home</button> ${pointerPosition4326}</div>
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
