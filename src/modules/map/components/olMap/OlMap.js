import { html } from 'lit-html';
import { MvuElement } from '../../../MvuElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map as MapOl, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions, PinchRotate } from 'ol/interaction';
import { removeLayer } from '../../../../store/layers/layers.action';
import { changeLiveRotation, changeZoomCenterAndRotation } from '../../../../store/position/position.action';
import { $injector } from '../../../../injection';
import { updateOlLayer, toOlLayerFromHandler, registerLongPressListener, getLayerById } from './olMapUtils';
import { setBeingDragged, setClick, setContextClick, setPointerMove } from '../../../../store/pointer/pointer.action';
import { setBeingMoved, setMoveEnd, setMoveStart } from '../../../../store/map/map.action';
import VectorSource from 'ol/source/Vector';
import { Group as LayerGroup } from 'ol/layer';

const Update_Position = 'update_position';
const Update_Layers = 'update_layers';

/**
 * Element which renders the ol map.
 * @class
 * @author taulinger
 */
export class OlMap extends MvuElement {


	constructor() {
		super({
			zoom: null,
			center: null,
			rotation: null,
			fitRequest: null,
			layers: []
		});
		const {
			MapService: mapService,
			GeoResourceService: georesourceService,
			LayerService: layerService,
			EnvironmentService: environmentService,
			OlMeasurementHandler: measurementHandler,
			OlDrawHandler: olDrawHandler,
			OlGeolocationHandler: geolocationHandler,
			OlHighlightLayerHandler: olHighlightLayerHandler,
			OlFeatureInfoHandler: olFeatureInfoHandler
		} = $injector.inject('MapService', 'GeoResourceService', 'LayerService', 'EnvironmentService',
			'OlMeasurementHandler', 'OlDrawHandler', 'OlGeolocationHandler', 'OlHighlightLayerHandler', 'OlFeatureInfoHandler');

		this._mapService = mapService;
		this._geoResourceService = georesourceService;
		this._layerService = layerService;
		this._environmentService = environmentService;
		this._geoResourceService = georesourceService;
		this._layerHandler = new Map([[measurementHandler.id, measurementHandler], [geolocationHandler.id, geolocationHandler], [olHighlightLayerHandler.id, olHighlightLayerHandler], [olDrawHandler.id, olDrawHandler]]);
		this._mapHandler = new Map([[olFeatureInfoHandler.id, olFeatureInfoHandler]]);
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_Position:
				return { ...model, ...data };
			case Update_Layers:
				return { ...model, layers: data };
		}
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
	onInitialize() {
		//observe global state (position, active layers)
		this.observe(state => state.position, data => this.signal(Update_Position, data));
		this.observe(state => state.layers.active, data => this.signal(Update_Layers, data));

		const { zoom, center, rotation } = this.getModel();

		this._view = new View({
			center: center,
			zoom: zoom,
			rotation: rotation
		});

		this._view.on('change:rotation', (evt) => {
			changeLiveRotation(evt.target.getRotation());
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
			moveTolerance: this._environmentService.isTouch() ? 3 : 1,
			interactions: defaultInteractions({
				//for embedded mode
				//onFocusOnly: false,
				pinchRotate: false

			}).extend([new PinchRotate({
				threshold: this._mapService.getMinimalRotation()
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

		const singleClickOrShortPressHandler = (evt) => {
			//when no layer handler is currently active or active handler does not prevent click handling
			if ([...this._layerHandler.values()].filter(lh => lh.active).filter(lh => lh.options.preventDefaultClickHandling).length === 0) {
				evt.preventDefault();
				const coord = this._map.getEventCoordinate(evt.originalEvent);
				setClick({ coordinate: coord, screenCoordinate: [evt.originalEvent.clientX, evt.originalEvent.clientY] });
			}
		};

		const contextOrLongPressHandler = (evt) => {
			//when no layer handler is currently active or active handler does not prevent context click handling
			if ([...this._layerHandler.values()].filter(lh => lh.active).filter(lh => lh.options.preventDefaultContextClickHandling).length === 0) {
				evt.preventDefault();
				const coord = this._map.getEventCoordinate(evt.originalEvent);
				setContextClick({ coordinate: coord, screenCoordinate: [evt.originalEvent.clientX, evt.originalEvent.clientY] });
			}
		};

		if (this._environmentService.isTouch()) {
			registerLongPressListener(this._map, contextOrLongPressHandler, singleClickOrShortPressHandler);
		}
		else {
			this._map.addEventListener('contextmenu', contextOrLongPressHandler);
			this._map.on('singleclick', singleClickOrShortPressHandler);
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

		this._mapHandler.forEach(handler => {
			handler.register(this._map);
		});

		//register particular obeservers on our Model
		//handle fitRequest
		this.observeModel('fitRequest', (fitRequest) => {
			this._viewSyncBlocked = true;
			const onAfterFit = () => {
				this._viewSyncBlocked = false;
				this._syncStore();
			};
			const maxZoom = fitRequest.payload.options.maxZoom || this._view.getMaxZoom();
			this._view.fit(fitRequest.payload.extent, { maxZoom: maxZoom, callback: onAfterFit });
		});
		//sync layers
		this.observeModel('layers', () => this._syncLayers());
		//sync the view
		this.observeModel(['zoom', 'center', 'rotation', 'fitRequest'], () => this._syncView());
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
	 */
	onModelChanged() {
		//nothing to do here
	}

	_syncStore() {
		changeZoomCenterAndRotation({
			zoom: this._view.getZoom(),
			center: this._view.getCenter(),
			rotation: this._view.getRotation()
		});
	}

	_syncView() {
		const { zoom, center, rotation } = this.getModel();

		if (!this._viewSyncBlocked) {

			this._view.animate({
				zoom: zoom,
				center: center,
				rotation: rotation,
				duration: 500
			});
		}
	}

	_syncLayers() {
		const { layers } = this.getModel();

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

		const clearVectorSource = olLayer => {
			if (olLayer.getSource() instanceof VectorSource) {
				olLayer.getSource().clear();
			}
		};

		toBeRemoved.forEach(id => {
			const olLayer = getLayerById(this._map, id);
			if (olLayer) {
				this._map.removeLayer(olLayer);
				if (this._layerHandler.has(id)) {
					this._layerHandler.get(id).deactivate(this._map);
				}

				if (olLayer instanceof LayerGroup) {
					olLayer.getLayers().forEach(clearVectorSource);
				}
				else {
					clearVectorSource(olLayer);
				}
			}
		});

		toBeAdded.forEach(id => {
			const resource = this._geoResourceService.byId(id);
			const olLayer = resource ? this._layerService.toOlLayer(resource, this._map) : (this._layerHandler.has(id) ? toOlLayerFromHandler(id, this._layerHandler.get(id), this._map) : null);

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
			const olLayer = getLayerById(this._map, id);
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
