import { DRAW_LAYER_ID, DRAW_TOOL_ID } from '../../../../store/DrawPlugin';
import { OlLayerHandler } from '../OlLayerHandler';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { $injector } from '../../../../../../injection';
import { DragPan, Draw, Modify, Select, Snap } from 'ol/interaction';
import { createSketchStyleFunction, createSelectStyleFunction, createModifyStyleFunction } from '../../olStyleUtils';
import { StyleTypes } from '../../services/StyleService';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { observe } from '../../../../../../utils/storeUtils';
import { isVertexOfGeometry } from '../../olGeometryUtils';
import { setStyle, setType } from '../../../../store/draw.action';


export const DrawStateType = {
	ACTIVE: 'active',
	DRAW: 'draw',
	MODIFY: 'modify',
	SELECT: 'select',
	OVERLAY: 'overlay'
};

export const DrawSnapType = {
	FIRSTPOINT: 'firstPoint',
	LASTPOINT: 'lastPoint',
	VERTEX: 'vertex',
	EGDE: 'edge',
	FACE: 'face'
};

/**
 * Handler for draw-interaction with the map
 *
 * @class
 * @author thiloSchlemmer
 */
export class OlDrawHandler extends OlLayerHandler {
	constructor() {
		super(DRAW_LAYER_ID);
		const { TranslationService, MapService, EnvironmentService, StoreService, GeoResourceService, FileStorageService, OverlayService, StyleService } = $injector.inject('TranslationService', 'MapService', 'EnvironmentService', 'StoreService', 'GeoResourceService', 'FileStorageService', 'OverlayService', 'StyleService');
		this._translationService = TranslationService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._storeService = StoreService;
		this._geoResourceService = GeoResourceService;
		this._fileStorageService = FileStorageService;
		this._overlayService = OverlayService;
		this._styleService = StyleService;

		this._vectorLayer = null;
		this._drawType = null;
		this._draw = null;
		this._modify = null;
		this._snap = null;
		this._select = null;
		this._dragPan = null;
		this._activeSketch = null;
		this._activeStyle = null;

		this._storedContent = null;

		this._isFinishOnFirstPoint = false;
		this._isSnapOnLastPoint = false;
		this._pointCount = 0;
		this._listeners = [];

		this._projectionHints = { fromProjection: 'EPSG:' + this._mapService.getSrid(), toProjection: 'EPSG:' + this._mapService.getDefaultGeodeticSrid() };
		this._lastPointerMoveEvent = null;
		this._lastDrawStateType = null;
		this._measureState = {
			type: null,
			snap: null,
			coordinate: null,
			pointCount: this._pointCount,
			dragging: false
		};

		this._drawStateChangedListeners = [];
		this._registeredObservers = this._register(this._storeService.getStore());
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {
		const createLayer = () => {
			const source = new VectorSource({ wrapX: false });
			const layer = new VectorLayer({
				source: source
			});
			return layer;
		};

		const clickHandler = (event) => {
			const coordinate = event.coordinate;
			const dragging = event.dragging;
			const pixel = event.pixel;
			this._updateDrawState(coordinate, pixel, dragging);
			const selectableFeatures = this._getSelectableFeatures(pixel);
			if (this._drawState.type === DrawStateType.MODIFY && selectableFeatures.length === 0 && !this._modifyActivated) {
				this._select.getFeatures().clear();

				this._setDrawState({ ...this._measureState, type: DrawStateType.SELECT, snap: null });
			}

			if ([DrawStateType.MODIFY, DrawStateType.SELECT].includes(this._drawState.type) && selectableFeatures.length > 0) {
				selectableFeatures.forEach(f => {
					const hasFeature = this._isInCollection(f, this._select.getFeatures());
					if (!hasFeature) {
						this._select.getFeatures().push(f);
					}
				});
			}
			this._modifyActivated = false;
		};

		const pointerMoveHandler = (event) => {
			this._lastPointerMoveEvent = event;

			const coordinate = event.coordinate;
			const dragging = event.dragging;
			const pixel = event.pixel;
			this._updateDrawState(coordinate, pixel, dragging);
		};


		this._map = olMap;
		if (!this._vectorLayer) {
			this._vectorLayer = createLayer();
			this._mapContainer = olMap.getTarget();
			const source = this._vectorLayer.getSource();
			this._select = this._createSelect();
			this._select.setActive(false);
			this._modify = this._createModify();
			this._modify.setActive(false);
			this._snap = new Snap({ source: source, pixelTolerance: this._getSnapTolerancePerDevice() });
			this._dragPan = new DragPan();
			this._dragPan.setActive(false);
			// DEBUG:
			this._onDrawStateChanged((drawState) => this._updateDrawMode(drawState));
			this._listeners.push(olMap.on(MapBrowserEventType.CLICK, clickHandler));
			this._listeners.push(olMap.on(MapBrowserEventType.POINTERMOVE, pointerMoveHandler));
		}
		this._map.addInteraction(this._select);
		this._map.addInteraction(this._modify);
		this._map.addInteraction(this._snap);
		this._map.addInteraction(this._dragPan);


		const preselectDrawType = this._storeService.getStore().getState().draw.type;
		if (preselectDrawType) {
			this._init(preselectDrawType);
		}

		return this._vectorLayer;
	}


	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	// eslint-disable-next-line no-unused-vars
	onDeactivate(olMap) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later
		olMap.removeInteraction(this._modify);
		olMap.removeInteraction(this._snap);
		olMap.removeInteraction(this._select);
		olMap.removeInteraction(this._dragPan);

		if (this._draw) {
			olMap.removeInteraction(this._draw);
		}
		this._draw = null;
		this._map = null;
	}

	_createDrawByType(type, styleOption) {
		if (type == null) {
			return null;
		}

		if (this._vectorLayer == null) {
			return null;
		}
		const source = this._vectorLayer.getSource();
		const snapTolerance = this._getSnapTolerancePerDevice();

		switch (type) {
			case 'Symbol':
				return new Draw({
					source: source,
					type: 'Point',
					snapTolerance: snapTolerance,
					style: this._getStyleFunctionByDrawType('Symbol', styleOption)
				});
			case 'Text':
				return new Draw({
					source: source,
					type: 'Point',
					minPoints: 1,
					snapTolerance: snapTolerance,
					style: createSketchStyleFunction(this._getStyleFunctionByDrawType('Text', styleOption))
				});
			case 'Line':
				return new Draw({
					source: source,
					type: 'LineString',
					snapTolerance: snapTolerance,
					style: createSketchStyleFunction(this._getStyleFunctionByDrawType('Line', styleOption))
				});
			case 'Polygon':
				return new Draw({
					source: source,
					type: 'Polygon',
					minPoints: 3,
					snapTolerance: snapTolerance,
					style: createSketchStyleFunction(this._getStyleFunctionByDrawType('Polygon', styleOption))
				});
			default:
				console.warn('unknown Drawtype: ' + type);
		}
	}

	_getStyleOption() {
		const defaultStyleOption = { symbolSrc: null, color: '#FFDAFF', scale: 0.5 };
		const currentStyleOptions = this._storeService.getStore().getState().draw.style;
		if (currentStyleOptions == null) {
			setStyle(defaultStyleOption);
			return defaultStyleOption;
		}

		return currentStyleOptions;
	}

	_getSelectableFeatures(pixel) {
		const features = [];
		const interactionLayer = this._vectorLayer;
		const featureSnapOption = {
			hitTolerance: 10,
			layerFilter: itemLayer => {
				return itemLayer === interactionLayer;
			}
		};

		this._map.forEachFeatureAtPixel(pixel, (feature, layer) => {
			if (layer === interactionLayer) {
				features.push(feature);
			}
		}, featureSnapOption);

		return features;
	}

	_getStyleFunctionByDrawType(drawType, styleOption) {
		switch (drawType) {
			case 'Symbol':
				return () => {
					const styleFunction = this._styleService.getStyleFunction(StyleTypes.MARKER);
					return styleFunction(styleOption);
				};
			default:
				return this._styleService.getStyleFunction(StyleTypes.DRAW);
		}
	}

	_updateDrawState(coordinate, pixel, dragging) {
		const drawState = {
			type: null,
			snap: null,
			coordinate: coordinate,
			pointCount: this._pointCount
		};

		drawState.snap = this._getSnapState(pixel);

		if (this._draw) {
			drawState.type = DrawStateType.ACTIVE;

			if (this._activeSketch) {
				this._activeSketch.getGeometry();
				drawState.type = DrawStateType.DRAW;

				if (this._isFinishOnFirstPoint) {
					drawState.snap = DrawSnapType.FIRSTPOINT;
				}
				else if (this._isSnapOnLastPoint) {
					drawState.snap = DrawSnapType.LASTPOINT;
				}
			}
		}

		if (this._modify.getActive()) {
			drawState.type = this._select.getFeatures().getLength() === 0 ? DrawStateType.SELECT : DrawStateType.MODIFY;
		}

		drawState.dragging = dragging;
		this._setDrawState(drawState);
	}

	// eslint-disable-next-line no-unused-vars
	_updateDrawMode(state) {
		// DEBUG:console.log(state.type ? '' + state.type : 'null');
	}


	/**
	 * todo: extract Util-method to kind of 'OlMapUtils'-file
	 */
	_isInCollection(item, itemCollection) {
		let isInCollection = false;
		itemCollection.forEach(i => {
			if (i === item) {
				isInCollection = true;
			}
		});
		return isInCollection;
	}

	_createSelect() {
		const layerFilter = (itemLayer) => {
			itemLayer === this._vectorLayer;
		};
		const featureFilter = (itemFeature, itemLayer) => {
			if (layerFilter(itemLayer)) {
				return itemFeature;
			}
		};
		const styleFunction = () => {
			return this._activeStyle;
		};
		const options = {
			layers: layerFilter,
			filter: featureFilter,
			style: createSelectStyleFunction(styleFunction)
		};
		const select = new Select(options);

		return select;
	}

	_createModify() {
		// TODO: implement deleteContition
		const options = {
			features: this._select.getFeatures(),
			style: createModifyStyleFunction(this._styleService.getStyleFunction(StyleTypes.MARKER))
		};

		const modify = new Modify(options);
		modify.on('modifystart', (event) => {
			if (event.mapBrowserEvent.type !== MapBrowserEventType.SINGLECLICK) {
				this._mapContainer.classList.add('grabbing');
			}
		});
		modify.on('modifyend', event => {
			if (event.mapBrowserEvent.type === MapBrowserEventType.POINTERUP || event.mapBrowserEvent.type === MapBrowserEventType.CLICK) {
				this._mapContainer.classList.remove('grabbing');
			}
		});
		return modify;
	}

	_activateModify(feature) {
		if (this._draw) {
			this._draw.setActive(false);
			setType(null);
		}

		this._modify.setActive(true);
		this._modifyActivated = true;
		if (feature) {
			this._select.getFeatures().push(feature);
		}
	}

	_init(type) {
		const styleOption = this._getStyleOption();
		if (this._draw) {
			this._draw.abortDrawing();
			this._draw.setActive(false);
			this._map.removeInteraction(this._draw);
		}
		this._draw = this._createDrawByType(type, styleOption);
		if (this._draw) {
			this._draw.on('drawstart', event => {
				this._activeSketch = event.feature;
				this._pointCount = 1;
				this._isSnapOnLastPoint = false;

				this._activeSketch.setId(DRAW_TOOL_ID + '_' + new Date().getTime());
				const styleFunction = this._getStyleFunctionByDrawType(type, styleOption);
				this._activeStyle = styleFunction(this._activeSketch);
				this._activeSketch.setStyle(this._activeStyle);
			});
			this._draw.on('drawend', event => this._activateModify(event.feature));

			this._map.addInteraction(this._draw);
			this._draw.setActive(true);
		}

	}

	_remove() {
		// TODO: Implement logic for removing feature or part of feature
	}

	_finish() {
		if (this._draw && this._draw.getActive()) {
			if (this._activeSketch) {
				this._draw.finishDrawing();
			}
			else {
				this._activateModify(null);
			}
		}
	}

	_startNew() {
		if (this._draw) {
			this._draw.abortDrawing();
			this._select.getFeatures().clear();
			this._modify.setActive(false);

			if (this._draw) {
				const currenType = this._storeService.getStore().getState().draw.type;
				this._init(currenType);
			}
		}
	}

	_updateStyle() {
		if (this._draw) {
			const currenType = this._storeService.getStore().getState().draw.type;
			this._init(currenType);
		}
	}

	_onDrawStateChanged(listener) {
		this._drawStateChangedListeners.push(listener);
	}

	_register(store) {
		return [
			observe(store, state => state.draw.type, (type) => this._init(type)),
			observe(store, state => state.draw.style, () => this._updateStyle()),
			observe(store, state => state.draw.finish, () => this._finish()),
			observe(store, state => state.draw.reset, () => this._startNew()),
			observe(store, state => state.draw.remove, () => this._remove())];
	}

	_setDrawState(value) {
		if (value !== this._drawState) {
			this._drawState = value;
			this._drawStateChangedListeners.forEach(l => l(value));
		}
	}

	_getSnapState(pixel) {
		let snapType = null;
		const interactionLayer = this._vectorLayer;
		const featureSnapOption = {
			hitTolerance: 10,
			layerFilter: itemLayer => {
				return itemLayer === interactionLayer;
			}
		};
		let vertexFeature = null;
		let featuresFromInteractionLayerCount = 0;
		this._map.forEachFeatureAtPixel(pixel, (feature, layer) => {
			if (layer === interactionLayer) {
				featuresFromInteractionLayerCount++;
			}
			if (!layer && feature.get('features').length > 0) {
				vertexFeature = feature;
				return;
			}
		}, featureSnapOption);

		if (vertexFeature) {
			snapType = DrawSnapType.EGDE;
			const vertexGeometry = vertexFeature.getGeometry();
			const snappedFeature = vertexFeature.get('features')[0];
			const snappedGeometry = snappedFeature.getGeometry();

			if (isVertexOfGeometry(snappedGeometry, vertexGeometry)) {
				snapType = DrawSnapType.VERTEX;
			}
		}
		if (!vertexFeature && featuresFromInteractionLayerCount > 0) {
			snapType = DrawSnapType.FACE;
		}
		return snapType;
	}

	_getSnapTolerancePerDevice() {
		if (this._environmentService.isTouch()) {
			return 12;
		}
		return 4;
	}
}
