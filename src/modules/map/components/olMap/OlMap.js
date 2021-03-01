import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map as MapOl, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls } from 'ol/control';
import { removeLayer } from '../../store/layers.action';
import { changeZoomAndCenter, updatePointerPosition } from '../../store/position.action';
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
			GeoResourceService: georesourceService,
			OlMeasurementHandler: measurementHandler,
			OlContextMenueMapEventHandler: contextMenueHandler
		} = $injector.inject('GeoResourceService', 'OlMeasurementHandler', 'OlContextMenueMapEventHandler');
		
		this._geoResourceService = georesourceService;
		this._geoResourceService = georesourceService;
		this._layerHandler = new Map([[measurementHandler.id, measurementHandler]]);
		this._eventHandler = new Map([[contextMenueHandler.id, contextMenueHandler]]);
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
				this._syncStore();
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

		this._eventHandler.forEach(handler => {
			handler.register(this._map);
		});

		this.observe('fitRequest', (fitRequest) => {
			this._viewSyncBlocked = true;
			const onAfterFit = () => {
				this._viewSyncBlocked = false;
				this._syncStore();
			};
			this._view.fit(fitRequest.payload.extent, { callback: onAfterFit });
		});
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
		const { position: { zoom, center, fitRequest }, layers: { active: overlayLayers, background: backgroundLayer } } = store;
		return { zoom, center, fitRequest, overlayLayers, backgroundLayer };
	}

	/**
	 * @override
	 */
	onStateChanged() {
		this.log('syncing map');
		this._syncOverlayLayer();
		this._syncView();
	}

	_getOlLayerById(id) {
		return this._map.getLayers().getArray().find(olLayer => olLayer.get('id') === id);
	}

	_syncStore() {
		this.log('syncing store');
		changeZoomAndCenter({
			zoom: this._view.getZoom(),
			center: this._view.getCenter()
		});
	}

	_syncView() {
		const { zoom, center } = this._state;

		// const onAfterFit = () => {
		// 	this._viewSyncBlocked = false;
		// 	this._syncStore();
		// };

		if (!this._viewSyncBlocked) {

			// if (fitRequest && fitRequest.payload.extent) {
			// 	this._viewSyncBlocked = true;
			// 	this._view.fit(fitRequest.extent, { callback: onAfterFit });
			// }
			// else {
			this._view.animate({
				zoom: zoom,
				center: center,
				duration: 500
			});
			// }
		}
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
				if (this._layerHandler.has(id)) {
					this._layerHandler.get(id).deactivate(this._map);
				}
			}
		});

		toBeAdded.forEach(id => {
			const resource = this._geoResourceService.byId(id);
			const olLayer = resource ? toOlLayer(resource) : (this._layerHandler.has(id) ? toOlLayerFromHandler(id, this._layerHandler.get(id), this._map) : null);

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
