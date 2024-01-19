/**
 * @module modules/olMap/components/OlMap
 */
import { html } from 'lit-html';
import { MvuElement } from '../../MvuElement';
import olCss from 'ol/ol.css';
import css from './olMap.css';
import { Map as MapOl, View } from 'ol';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { defaults as defaultInteractions, PinchRotate } from 'ol/interaction';
import { removeLayer } from '../../../store/layers/layers.action';
import { changeLiveCenter, changeLiveRotation, changeLiveZoom, changeZoomCenterAndRotation } from '../../../store/position/position.action';
import { $injector } from '../../../injection';
import { updateOlLayer, toOlLayerFromHandler, registerLongPressListener, getLayerById } from '../utils/olMapUtils';
import { setBeingDragged, setClick, setContextClick, setPointerMove } from '../../../store/pointer/pointer.action';
import { setBeingMoved, setMoveEnd, setMoveStart } from '../../../store/map/map.action';
import VectorSource from 'ol/source/Vector';
import { Group as LayerGroup } from 'ol/layer';
import { GeoResourceFuture, GeoResourceTypes } from '../../../domain/geoResources';
import { setFetching } from '../../../store/network/network.action';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { equals } from '../../../utils/storeUtils';
import { roundCenter, roundRotation, roundZoomLevel } from '../../../utils/mapUtils';

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
			fitLayerRequest: null,
			layers: []
		});
		const {
			MapService: mapService,
			GeoResourceService: geoResourceService,
			LayerService: layerService,
			EnvironmentService: environmentService,
			TranslationService: translationService,
			OlMeasurementHandler: measurementHandler,
			OlDrawHandler: olDrawHandler,
			OlGeolocationHandler: geolocationHandler,
			OlHighlightLayerHandler: olHighlightLayerHandler,
			OlFeatureInfoHandler: olFeatureInfoHandler,
			OlElevationProfileHandler: olElevationProfileHandler,
			OlMfpHandler: olMfpHandler,
			OlRoutingHandler: olRoutingHandler,
			OlSelectableFeatureHandler: olSelectableFeatureHandler
		} = $injector.inject(
			'MapService',
			'GeoResourceService',
			'LayerService',
			'EnvironmentService',
			'TranslationService',
			'OlMeasurementHandler',
			'OlDrawHandler',
			'OlGeolocationHandler',
			'OlHighlightLayerHandler',
			'OlFeatureInfoHandler',
			'OlElevationProfileHandler',
			'OlMfpHandler',
			'OlRoutingHandler',
			'OlSelectableFeatureHandler'
		);

		this._mapService = mapService;
		this._layerService = layerService;
		this._environmentService = environmentService;
		this._translationService = translationService;
		this._geoResourceService = geoResourceService;
		this._layerHandler = new Map([
			[measurementHandler.id, measurementHandler],
			[geolocationHandler.id, geolocationHandler],
			[olHighlightLayerHandler.id, olHighlightLayerHandler],
			[olDrawHandler.id, olDrawHandler],
			[olMfpHandler.id, olMfpHandler],
			[olRoutingHandler.id, olRoutingHandler]
		]);
		this._mapHandler = new Map([
			[olFeatureInfoHandler.id, olFeatureInfoHandler],
			[olElevationProfileHandler.id, olElevationProfileHandler],
			[olSelectableFeatureHandler.id, olSelectableFeatureHandler]
		]);
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
			<style>
				${olCss + css}
			</style>
			<div data-test-id id="ol-map" tabindex="0"></div>
		`;
	}

	/**
	 * @override
	 */
	onInitialize() {
		//observe global state (position, active layers, orientation)
		this.observe(
			(state) => state.position,
			(data) => this.signal(Update_Position, data)
		),
			this.observe(
				(state) => state.layers.active,
				(data) => this.signal(Update_Layers, data)
			),
			this.observe(
				(state) => state.media.portrait,
				() => this._map.updateSize(),
				false
			);

		const { zoom, center, rotation } = this.getModel();

		this._view = new View({
			center: center,
			zoom: zoom,
			rotation: rotation,
			minZoom: this._mapService.getMinZoomLevel(),
			maxZoom: this._mapService.getMaxZoomLevel(),
			constrainRotation: false,
			constrainResolution: !this._environmentService.isTouch()
		});

		this._view.on('change:rotation', (evt) => {
			changeLiveRotation(evt.target.getRotation());
		});
		this._view.on('change:center', (evt) => {
			changeLiveCenter(evt.target.getCenter());
		});
		this._view.on('change:resolution', (evt) => {
			changeLiveZoom(evt.target.getZoom());
		});

		this._map = new MapOl({
			layers: [],
			view: this._view,
			controls: defaultControls({
				attribution: false,
				zoom: false,
				rotate: false
			}).extend([new ScaleLine({ target: this._mapService.getScaleLineContainer() })]),
			moveTolerance: this._environmentService.isTouch() ? 3 : 1,
			interactions: defaultInteractions({
				//for embedded mode
				//onFocusOnly: false,
				pinchRotate: false
			}).extend([
				new PinchRotate({
					threshold: this._mapService.getMinimalRotation()
				})
			])
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
			if ([...this._layerHandler.values()].filter((lh) => lh.active).filter((lh) => lh.options.preventDefaultClickHandling).length === 0) {
				evt.preventDefault();
				const coord = this._map.getEventCoordinate(evt.originalEvent);
				setClick({ coordinate: coord, screenCoordinate: [evt.originalEvent.clientX, evt.originalEvent.clientY] });
			}
		};

		const contextOrLongPressHandler = (evt) => {
			//when no layer handler is currently active or active handler does not prevent context click handling
			if ([...this._layerHandler.values()].filter((lh) => lh.active).filter((lh) => lh.options.preventDefaultContextClickHandling).length === 0) {
				evt.preventDefault();
				const coord = this._map.getEventCoordinate(evt.originalEvent);
				setContextClick({ coordinate: coord, screenCoordinate: [evt.originalEvent.clientX, evt.originalEvent.clientY] });
			}
		};

		if (this._environmentService.isTouch()) {
			registerLongPressListener(this._map, contextOrLongPressHandler, singleClickOrShortPressHandler);
		} else {
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

		this._map.on('loadstart', () => setFetching(true));
		this._map.on('loadend', () => setFetching(false));

		this._mapHandler.forEach((handler) => {
			handler.register(this._map);
		});

		//register particular observers on our model
		//handle fitRequest
		this.observeModel(['fitRequest', 'fitLayerRequest'], (eventLike) => this._fitToExtent(eventLike));
		//sync layers
		this.observeModel('layers', () => this._syncLayers());
		//sync the view
		this.observeModel(['zoom', 'center', 'rotation'], () => this._syncView());
	}

	/**
	 * @override
	 */
	onDisconnect() {
		this._map?.setTarget(null);
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
		const view = this._map.getView();
		/**
		 * Update the view only if the parameters are not virtually the same as the current one.
		 * Note: Triggering an animation on the ol.View causes an WMS source always to be loaded, even if nothing has changed effectively.
		 */
		if (
			!equals(zoom, roundZoomLevel(view.getZoom())) ||
			!equals(center, roundCenter(view.getCenter())) ||
			!equals(rotation, roundRotation(view.getRotation()))
		) {
			this._view.animate({
				zoom: zoom,
				center: center,
				rotation: rotation,
				duration: 200
			});
		}
	}

	_syncLayers() {
		const translate = (key) => this._translationService.translate(key);
		const { layers } = this.getModel();

		const updatedIds = layers.map((layer) => layer.id);
		const currentIds = this._map
			.getLayers()
			.getArray()
			.map((olLayer) => olLayer.get('id'));

		// array intersection
		const toBeUpdated = updatedIds.filter((id) => currentIds.includes(id));
		// array difference left side
		const toBeAdded = updatedIds.filter((id) => !currentIds.includes(id));
		// array difference right side
		const toBeRemoved = currentIds.filter((id) => !updatedIds.includes(id));

		const clearVectorSource = (olLayer) => {
			if (olLayer.getSource() instanceof VectorSource) {
				olLayer.getSource().clear();
			}
		};

		toBeRemoved.forEach((id) => {
			const olLayer = getLayerById(this._map, id);
			if (olLayer) {
				this._map.removeLayer(olLayer);
				if (this._layerHandler.has(id)) {
					this._layerHandler.get(id).deactivate(this._map);
				}

				if (olLayer instanceof LayerGroup) {
					olLayer.getLayers().forEach(clearVectorSource);
				} else {
					clearVectorSource(olLayer);
				}
			}
		});

		toBeAdded.forEach((id) => {
			const toOlLayer = (id, geoResource) => {
				const olLayer = geoResource
					? this._layerService.toOlLayer(id, geoResource, this._map)
					: this._layerHandler.has(id)
						? toOlLayerFromHandler(id, this._layerHandler.get(id), this._map)
						: null;
				if (olLayer) {
					const layer = layers.find((layer) => layer.id === id);
					updateOlLayer(olLayer, layer);
					this._map.getLayers().insertAt(layer.zIndex, olLayer);
				} else {
					console.warn(`Could not add an olLayer for id '${id}'`);
					emitNotification(`${translate('olMap_layer_not_available')} '${id}'`, LevelTypes.WARN);
					removeLayer(id);
				}
			};

			const geoResourceId = layers.find((l) => l.id === id)?.geoResourceId;
			const geoResource = this._geoResourceService.byId(geoResourceId);
			//if geoResource is a future, we insert a placeholder olLayer replacing it after the geoResource was resolved
			if (geoResource?.getType() === GeoResourceTypes.FUTURE) {
				geoResource
					.get()
					// eslint-disable-next-line promise/prefer-await-to-then
					.then((lazyLoadedGeoResource) => {
						// replace the placeholder olLayer by the real the olLayer
						const layer = layers.find((layer) => layer.id === id);
						const realOlLayer = this._layerService.toOlLayer(id, lazyLoadedGeoResource, this._map);
						updateOlLayer(realOlLayer, layer);
						this._map.getLayers().remove(getLayerById(this._map, id));
						this._map.getLayers().insertAt(layer.zIndex, realOlLayer);
					})
					// eslint-disable-next-line promise/prefer-await-to-then
					.catch((error) => {
						console.warn(error);
						emitNotification(`${translate('olMap_layer_not_available')} '${geoResource.id}'`, LevelTypes.WARN);
						removeLayer(id);
					});
			}
			toOlLayer(id, geoResource);
		});

		toBeUpdated.forEach((id) => {
			const layer = layers.find((layer) => layer.id === id);
			const olLayer = getLayerById(this._map, id);
			updateOlLayer(olLayer, layer);
			this._map.getLayers().remove(olLayer);
			this._map.getLayers().insertAt(layer.zIndex, olLayer);
		});
	}

	_fitToExtent(eventLike) {
		const onAfterFit = () => {
			this._syncStore();
		};

		const fit = () => {
			const extent = getLayerById(this._map, eventLike.payload.id)?.getSource?.()?.getExtent?.() ?? eventLike.payload.extent;

			if (extent) {
				const maxZoom = eventLike.payload.options.maxZoom ?? this._view.getMaxZoom();
				const viewportPadding = this._mapService.getVisibleViewport(this._map.getTarget());
				const padding = eventLike.payload.options.useVisibleViewport
					? [
							viewportPadding.top + OlMap.DEFAULT_PADDING_PX[0],
							viewportPadding.right + OlMap.DEFAULT_PADDING_PX[1],
							viewportPadding.bottom + OlMap.DEFAULT_PADDING_PX[2],
							viewportPadding.left + OlMap.DEFAULT_PADDING_PX[3]
						]
					: OlMap.DEFAULT_PADDING_PX;
				this._view.fit(extent, { maxZoom: maxZoom, callback: onAfterFit, padding: padding });
			}
		};

		if (eventLike.payload.id) {
			// we target a layer
			const { layers } = this.getModel();
			const geoResourceId = layers.find((l) => l.id === eventLike.payload.id)?.geoResourceId;
			const gr = this._geoResourceService.byId(geoResourceId);
			if (gr instanceof GeoResourceFuture) {
				// when we have a GeoResourceFuture we wait until it is resolved
				// Note: the actual call of #fit is wrapped within a timeout fn
				gr.onResolve(() => setTimeout(() => fit()));
			} else {
				fit();
			}
		} else {
			// we have an extent
			fit();
		}
	}

	/**
	 * @override
	 */
	onAfterRender(firstTime) {
		if (firstTime) {
			this._map.setTarget(this.shadowRoot.getElementById('ol-map'));
		}
	}

	/**
	 * @override
	 */
	static get tag() {
		return 'ba-ol-map';
	}

	static get DEFAULT_PADDING_PX() {
		return Array.of(10, 10, 10, 10);
	}
}
