import { html } from 'lit-html';
import BaElement from '../BaElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls } from 'ol/control';
import { changeZoomAndPosition, updatePointerPosition } from './store/olMap.action';



/**
 * Element which renders the ol map.
 * @class
 * @author aul
 */
export class OlMap extends BaElement {


	constructor() {
		super();
	}


	/**
	 * @override
	 */
	createView() {
		return html`
			<style>${olCss.toString() + css.toString()}</style>
			<div id="ol-map"></div>
		`;
	}

	/**
	 * @override
	 */
	initialize() {

		const BACKGROUND_LAYER_ID = 'g_atkis';
		const { zoom, position } = this.state;

		this.view = new View({
			center: position,
			zoom: zoom,
		});

		this.map = new Map({
			layers: [
				new TileLayer({
					id: BACKGROUND_LAYER_ID,
					source: new XYZ({
						projection: 'EPSG:3857',
						url: `https://intergeo37.bayernwolke.de/betty/${BACKGROUND_LAYER_ID}/{z}/{x}/{y}`,
						attributions: '&#169; ' +
							'<a href="https://www.geodaten.bayern.de" target="_blank">Bayerische Vermessungsverwaltung</a> ',

						attributionsCollapsible: false
					})
				})

			],
			// target: 'ol-map',
			view: this.view,
			controls: defaultControls({
				// attribution: false,
				zoom: false,
			}),
		});

		this.map.on('moveend', () => {
			if (this.view) {
				this.log('updating store');

				changeZoomAndPosition({
					zoom: this.view.getZoom(),
					position: this.view.getCenter()

				});
			}
		});


		this.map.on('pointermove', (evt) => {
			if (evt.dragging) {
				// the event is a drag gesture, this is handled by openlayers (map move)
				return;
			}
			const coord = this.map.getEventCoordinate(evt.originalEvent);
			updatePointerPosition(coord);
		});


		this.map.on('singleclick', (evt) => {
			const coord = this.map.getEventCoordinate(evt.originalEvent);
			this.emitEvent('map_clicked', coord);
		});
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this.map = null;
		this.view = null;
	}

	/**
	 * @override
	 * @param {Object} store 
	 */
	extractState(store) {
		const { map: { zoom, position } } = store;
		return { zoom, position };
	}

	/**
	 * @override
	 */
	onStateChanged() {
		const { zoom, position } = this.state;

		this.log('map state changed by store');


		this.view.animate({
			zoom: zoom,
			center: position,
			duration: 500
		});

	}

	/**
	 * @override
	 */
	onAfterRender() {
		this.map.setTarget(this.shadowRoot.getElementById('ol-map'));
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-ol-map';
	}


}