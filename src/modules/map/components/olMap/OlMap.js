import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls } from 'ol/control';
import { changeZoomAndCenter, updatePointerPosition } from '../../store/position.action';
import { removeLayer } from '../../store/layers.action';
import { contextMenueOpen, contextMenueClose } from '../../../contextMenue/store/contextMenue.action';
import { $injector } from '../../../../injection';
import { toOlLayer, updateOlLayer } from './olMapUtils';


/**
 * Element which renders the ol map.
 * @class
 * @author aul
 */
export class OlMap extends BaElement {


	constructor() {
		super();
		const { ShareService: shareService, GeoResourceService: georesourceService } = $injector.inject('ShareService', 'GeoResourceService');
		this._shareService = shareService;
		this._geoResourceService = georesourceService;
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
		this._geoResourceService.init();

		const BACKGROUND_LAYER_ID = 'g_atkis';
		const { zoom, center } = this._state;

		this._view = new View({
			center: center,
			zoom: zoom,
		});
		this._contextMenuToggle = false;
		const baseLayer = new TileLayer({
			id: BACKGROUND_LAYER_ID,
			source: new XYZ({
				projection: 'EPSG:3857',
				url: `https://intergeo37.bayernwolke.de/betty/${BACKGROUND_LAYER_ID}/{z}/{x}/{y}`,
				attributions: '&#169; ' +
					'<a href="https://www.geodaten.bayern.de" target="_blank">Bayerische Vermessungsverwaltung</a> ',

				attributionsCollapsible: false
			})
		});
		baseLayer.set('id', 'g_atkis');

		this._map = new Map({
			layers: [
				baseLayer
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

				changeZoomAndCenter({
					zoom: this._view.getZoom(),
					center: this._view.getCenter()

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

		const shareUrl = window.location.href;
		const copyToClipboard = () => this._shareService.copyToClipboard(coord).catch(() => this.log('Cannot copy the coordinate to clipboard.'));
		// todo: implement (and use) permalink-service, shortener-service to get a usable URL
		// todo: add translation-service with i18n-olMap-provider
		const shareWith = () => this._shareService.share('BA4', 'Use the platform', shareUrl);
		const firstCommand = { label: 'Copy Coordinates', shortCut: '[CTRL] + C', action: copyToClipboard };
		const secondCommand = { label: 'Hello', action: () => this.log('Hello World!') };
		const thirdCommand = { label: 'Share', action: shareWith };
		return {
			pointer: { x: evt.originalEvent.pageX, y: evt.originalEvent.pageY },
			commands: [firstCommand, secondCommand, thirdCommand]
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
		const { position: { zoom, center }, layers: { active: overlayLayers, background: backgroundLayer } } = store;
		return { zoom, center, overlayLayers, backgroundLayer };
	}

	/**
	 * @override
	 */
	onStateChanged() {
		const { zoom, center } = this._state;

		this._syncOverlayLayer();

		this.log('map state changed by store');


		this._view.animate({
			zoom: zoom,
			center: center,
			duration: 500
		});

	}

	_getOlLayerById(id) {
		return this._map.getLayers().getArray().find(olLayer => olLayer.get('id') === id);
	}

	_syncOverlayLayer() {

		const { overlayLayers } = this._state;

		const updatedIds = overlayLayers.map(layer => layer.id);
		const currentIds = this._map.getLayers()
			.getArray()
			//exclude background layer
			.slice(1)
			.map(olLayer => olLayer.get('id'));

		// array intersection
		const toBeUpdated = updatedIds.filter(id => currentIds.includes(id));
		// array difference left side
		const toBeAdded = updatedIds.filter(id => !currentIds.includes(id));
		// array difference right side
		const toBeRemoved = currentIds.filter(id => !updatedIds.includes(id));

		toBeRemoved.forEach(id => {
			const olLayer = this._getOlLayerById(id);
			if(olLayer) {
				this._map.removeLayer(olLayer);
			}
		});

		toBeAdded.forEach(id => {
			const resource = this._geoResourceService.byId(id);
			if (resource) {
				const layer = overlayLayers.find(layer => layer.id === id);
				const olLayer = updateOlLayer(toOlLayer(resource), layer);
				//+1: regard baselayer
				this._map.getLayers().insertAt(layer.zIndex + 1, olLayer);
			}
			else {
				removeLayer(id);
			}
		});

		toBeUpdated.forEach(id => {
			const layer = overlayLayers.find(layer => layer.id === id);
			const olLayer = this._getOlLayerById(id);
			updateOlLayer(olLayer, layer);
			this._map.getLayers().remove(olLayer);
			//+1: regard baselayer
			this._map.getLayers().insertAt(layer.zIndex + 1, olLayer);
		});
	}

	_syncBackgroundLayer() {

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