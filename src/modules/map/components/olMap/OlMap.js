import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map as MapOl, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions, PinchRotate } from 'ol/interaction';
import { removeLayer } from '../../../../store/layers/layers.action';
import { changeZoomAndCenter } from '../../../../store/position/position.action';
import { $injector } from '../../../../injection';
import { updateOlLayer, toOlLayerFromHandler, registerLongPressListener } from './olMapUtils';
import { setBeingDragged, setContextClick, setPointerMove } from '../../store/pointer.action';
import { setBeingMoved, setMoveEnd, setMoveStart } from '../../store/map.action';


/**
 * Element which renders the ol map.
 * @class
 * @author taulinger
 */
export class OlMap extends BaElement {


	constructor() {
		super();
		const {
			GeoResourceService: georesourceService,
			LayerService: layerService,
			EnvironmentService: environmentService,
			OlMeasurementHandler: measurementHandler,
			OlGeolocationHandler: geolocationHandler
		} = $injector.inject('GeoResourceService', 'LayerService', 'EnvironmentService', 'OlMeasurementHandler', 'OlGeolocationHandler');

		this._geoResourceService = georesourceService;
		this._layerService = layerService;
		this._environmentService = environmentService;
		this._geoResourceService = georesourceService;
		this._layerHandler = new Map([[measurementHandler.id, measurementHandler], [geolocationHandler.id, geolocationHandler]]);
		this._eventHandler = new Map([]);
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
		const { zoom, center } = this.getState();

		this._view = new View({
			center: center,
			zoom: zoom,
		});

		this._map = new MapOl({
			layers: [],
			// target: 'ol-map',
			view: this._view,
			controls: defaultControls({
				attribution: false,
				zoom: false,
				rotate: false
			}),
			interactions: defaultInteractions({
				//for embedded mode
				//onFocusOnly: false,
				pinchRotate: false,
				
			}).extend([new PinchRotate({
				threshold: .5
			})])
		});

		this._map.on('movestart', () => {
			setMoveStart();
			setBeingMoved(true);
		});

		this._map.on('moveend', () => {
			if (this._view) {
				this._syncStore();
			}
			setBeingDragged(false);
			setMoveEnd();
			setBeingMoved(false);
		});

		const contextHandler = (evt) => {
			//when no layer handler is currently active
			if ([...this._layerHandler.values()].filter(lh => lh.active).length === 0) {
				evt.preventDefault();
				const coord = this._map.getEventCoordinate(evt.originalEvent);
				setContextClick({ coordinate: coord, screenCoordinate: [evt.originalEvent.clientX, evt.originalEvent.clientY] });
			}
		};

		if (this._environmentService.isTouch()) {
			registerLongPressListener(this._map, contextHandler);
		}
		else {
			this._map.addEventListener('contextmenu', contextHandler);
		}


		this._map.on('pointermove', (evt) => {
			if (evt.dragging) {
				// the event is a drag gesture, so we handle it in 'pointerdrag'
				return;
			}
			const coord = this._map.getEventCoordinate(evt.originalEvent);
			setPointerMove({ coordinate: coord, screenCoordinate: [evt.originalEvent.clientX, evt.originalEvent.clientY] });
		});

		this._map.on('pointerdrag', () => {
			setBeingDragged(true);
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
			const maxZoom = fitRequest.payload.options.maxZoom || this._view.getMaxZoom();
			this._view.fit(fitRequest.payload.extent, { maxZoom: maxZoom, callback: onAfterFit });
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
	 * @param {Object} globalState 
	 */
	extractState(globalState) {
		const { position: { zoom, center, fitRequest }, layers: { active: layers } } = globalState;
		return { zoom, center, fitRequest, layers };
	}

	/**
	 * @override
	 */
	onStateChanged() {
		this._syncOverlayLayer();
		this._syncView();
	}

	_getOlLayerById(id) {
		return this._map.getLayers().getArray().find(olLayer => olLayer.get('id') === id);
	}

	_syncStore() {
		changeZoomAndCenter({
			zoom: this._view.getZoom(),
			center: this._view.getCenter()
		});
	}

	_syncView() {
		const { zoom, center } = this.getState();

		if (!this._viewSyncBlocked) {

			this._view.animate({
				zoom: zoom,
				center: center,
				duration: 500
			});
		}
	}

	_syncOverlayLayer() {
		const { layers } = this.getState();

		const updatedIds = layers.map(layer => layer.geoResourceId);
		const currentIds = this._map.getLayers()
			.getArray()
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
			const olLayer = resource ? this._layerService.toOlLayer(resource) : (this._layerHandler.has(id) ? toOlLayerFromHandler(id, this._layerHandler.get(id), this._map) : null);

			if (olLayer) {
				const layer = layers.find(layer => layer.geoResourceId === id);
				updateOlLayer(olLayer, layer);
				this._map.getLayers().insertAt(layer.zIndex, olLayer);
			}
			else {
				console.warn('Could not add an olLayer for id \'' + id + '\'');
				removeLayer(id);
			}
		});

		toBeUpdated.forEach(id => {
			const layer = layers.find(layer => layer.geoResourceId === id);
			const olLayer = this._getOlLayerById(id);
			updateOlLayer(olLayer, layer);
			this._map.getLayers().remove(olLayer);
			this._map.getLayers().insertAt(layer.zIndex, olLayer);
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
