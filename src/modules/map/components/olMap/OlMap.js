import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map as MapOl, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls } from 'ol/control';
import { changeZoomAndCenter, updatePointerPosition } from '../../store/position.action';
import { removeLayer, MEASUREMENT_LAYER_ID } from '../../store/layers.action';
import { contextMenueOpen, contextMenueClose } from '../../../contextMenue/store/contextMenue.action';
import { activate as activateMeasurement, deactivate } from '../../../map/store/measurement.action';
import { $injector } from '../../../../injection';
import { toOlLayer, updateOlLayer, toOlLayerFromHandler } from './olMapUtils';


/**
 * Element which renders the ol map.
 * @class
 * @author aul
 */
export class OlMap extends BaElement {


	constructor() {
		super();
		const {
			ShareService: shareService,
			GeoResourceService: georesourceService,
			OlMeasurementHandler: measurementHandler
		} = $injector.inject('ShareService', 'GeoResourceService', 'OlMeasurementHandler');
		this._shareService = shareService;
		this._geoResourceService = georesourceService;
		this._handler = new Map([[MEASUREMENT_LAYER_ID, measurementHandler]]);

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

		this._map = new MapOl({
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

		this._map.on('dblclick', (evt) => {
			const coord = this._map.getEventCoordinate(evt.originalEvent);
			this._contextMenuToggle = false;
			contextMenueClose();
			this.emitEvent('map_dblclicked', coord);
		});

		this._map.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			const contextMenueData = this._buildContextMenueData(e);
			contextMenueOpen(contextMenueData);
		});
	}

	_buildContextMenueData(evt) {
		const { measurementActive } = this._state;
		const coord = this._map.getEventCoordinate(evt.originalEvent);
		const measureDistance = () => {
			activateMeasurement();
		};
		const copyToClipboard = () => this._shareService.copyToClipboard(coord).catch(() => this.log('Cannot copy the coordinate to clipboard.'));
		const firstCommand = { label: 'Copy Coordinates', action: copyToClipboard };
		let secondCommand = { label: 'Measure Distance', action: measureDistance };
		if (measurementActive) {
			secondCommand = { label: 'Stop Measure Distance', action: deactivate };
		}
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
		const { position: { zoom, center }, layers: { active: overlayLayers, background: backgroundLayer } } = store;
		return { zoom, center, overlayLayers, backgroundLayer };
	}

	/**
	 * @override
	 */
	onStateChanged() {
		this.log('map state changed by store');

		this._syncOverlayLayer();
		this._syncView();
	}

	_getOlLayerById(id) {
		return this._map.getLayers().getArray().find(olLayer => olLayer.get('id') === id);
	}

	_syncView() {
		const { zoom, center } = this._state;

		this._view.animate({
			zoom: zoom,
			center: center,
			duration: 500
		});
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
			if (olLayer) {
				this._map.removeLayer(olLayer);
				if (this._handler.has(id)) {
					this._handler.get(id).deactivate(this._map);
				}
			}
		});

		toBeAdded.forEach(id => {
			const resource = this._geoResourceService.byId(id);
			const olLayer = resource ? toOlLayer(resource) : (this._handler.has(id) ? toOlLayerFromHandler(id, this._handler.get(id), this._map) : null);

			if (olLayer) {
				const layer = overlayLayers.find(layer => layer.id === id);
				updateOlLayer(olLayer, layer);
				//+1: regard baselayer
				this._map.getLayers().insertAt(layer.zIndex + 1, olLayer);
			}
			else {
				console.warn('Could not add an olLayer for id \'' + id + '\'');
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