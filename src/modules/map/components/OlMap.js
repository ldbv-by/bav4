import { html } from 'lit-html';
import { BaElement } from '../../BaElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls } from 'ol/control';
import { changeZoomAndPosition, updatePointerPosition } from '../store/olMap.action';
import { contextMenueOpen, contextMenueClose } from '../../contextMenue/store/contextMenue.action';
import { $injector } from '../../../injection';


/**
 * Element which renders the ol map.
 * @class
 * @author aul
 */
export class OlMap extends BaElement {


	constructor() {
		super();
		const { ShareService } = $injector.inject('ShareService');
		this._shareService = ShareService;
	}


	/**
	 * @override
	 */
	createView() {
		return html`
			<style>${olCss + css}</style>
			<div id="ol-map"></div>
		`;
	}

	/**
	 * @override
	 */
	initialize() {

		const BACKGROUND_LAYER_ID = 'g_atkis';
		const { zoom, position } = this._state;

		this._view = new View({
			center: position,
			zoom: zoom,
		});
		this._contextMenuToggle = false;

		this._map = new Map({
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
			view: this._view,
			controls: defaultControls({
				// attribution: false,
				zoom: false,
			}),
		});

		this._map.on('moveend', () => {
			if (this._view) {
				this.log('updating store');

				changeZoomAndPosition({
					zoom: this._view.getZoom(),
					position: this._view.getCenter()

				});
			}
		});


		this._map.on('pointermove', (evt) => {
			if (evt.dragging) {
				// the event is a drag gesture, this is handled by openlayers (map move)
				return;
			}
			const coord = this._map.getEventCoordinate(evt.originalEvent);
			updatePointerPosition(coord);
		});


		this._map.on('singleclick', (evt) => {
			const coord = this._map.getEventCoordinate(evt.originalEvent);
			this._contextMenuToggle = false;
			contextMenueClose();
			this.emitEvent('map_clicked', coord);
		});

		this._map.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			const contextMenueData = this._buildContextMenueData(e);
			contextMenueOpen(contextMenueData);
		});
	}

	_buildContextMenueData(evt) {
		const coord = this._map.getEventCoordinate(evt.originalEvent);
		const copyToClipboard = () => this._shareService.copyToClipboard(coord).catch(() => this.log('Cannot copy the coordinate to clipboard.'));
		const firstCommand = { label: 'Copy Coordinates', shortCut: '[CTRL] + C', action: copyToClipboard };
		const secondCommand = { label: 'Hello', action: () => this.log('Hello World!') };
		return {
			pointer: { x: evt.originalEvent.pageX, y: evt.originalEvent.pageY },
			commands: [firstCommand, secondCommand]
		};
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._map = null;
		this._view = null;
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
		const { zoom, position } = this._state;

		this.log('map state changed by store');


		this._view.animate({
			zoom: zoom,
			center: position,
			duration: 500
		});

	}

	/**
	 * @override
	 */
	onAfterRender() {
		this._map.setTarget(this.shadowRoot.getElementById('ol-map'));
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-ol-map';
	}


}