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
			this._drawTypes = this._createDrawTypes(source);
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

		// eslint-disable-next-line no-unused-vars
		for (const [key, draw] of Object.entries(this._drawTypes)) {
			//draw.on('change:active', (e) => console.log('change:active changes for ' + key + ' to: ', e));
			this._map.addInteraction(draw);
		}

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

		// eslint-disable-next-line no-unused-vars
		for (const [key, draw] of Object.entries(this._drawTypes)) {
			olMap.removeInteraction(draw);
		}

		this._map = null;
	}

	_createDrawTypes(source) {
		const styleOption = { symbolSrc: null, color: '#FFDAFF' };
		const drawTypes = {
			'Symbol': new Draw({
				source: source,
				type: 'Point',
				snapTolerance: this._getSnapTolerancePerDevice(),
				style: this._getBaseStyle('Symbol', styleOption)
			}),
			'Text': new Draw({
				source: source,
				type: 'Point',
				minPoints: 1,
				snapTolerance: this._getSnapTolerancePerDevice(),
				style: createSketchStyleFunction(this._getBaseStyle('Text', styleOption))
			}),
			'Line': new Draw({
				source: source,
				type: 'LineString',
				snapTolerance: this._getSnapTolerancePerDevice(),
				style: createSketchStyleFunction(this._getBaseStyle('Line', styleOption))
			}),
			'Polygon': new Draw({
				source: source,
				type: 'Polygon',
				minPoints: 3,
				snapTolerance: this._getSnapTolerancePerDevice(),
				style: createSketchStyleFunction(this._getBaseStyle('Polygon', styleOption))
			})
		};


		// eslint-disable-next-line no-unused-vars
		for (const [key, draw] of Object.entries(drawTypes)) {
			draw.on('drawstart', event => {
				this._activeSketch = event.feature;
				this._pointCount = 1;
				this._isSnapOnLastPoint = false;

				this._activeSketch.setId(DRAW_TOOL_ID + '_' + new Date().getTime());
				this._activeSketch.setStyle(this._getBaseStyle(key, styleOption));
			});

			//draw.on('drawabort', event => this._overlayService.remove(event.feature, this._map));
			draw.on('drawend', event => this._activateModify(event.feature));
			draw.setActive(false);
		}
		return drawTypes;
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

	_getBaseStyle(drawType, styleOption) {
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
		const currentDraw = this._getActiveDraw();
		if (currentDraw) {
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
		const options = {
			layers: layerFilter,
			filter: featureFilter,
			style: createSelectStyleFunction(this._styleService.getStyleFunction(StyleTypes.MARKER))
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
		const currentDraw = this._getActiveDraw();

		if (currentDraw) {
			currentDraw.setActive(false);
		}

		this._modify.setActive(true);
		this._modifyActivated = true;
		if (feature) {
			this._select.getFeatures().push(feature);
		}
	}

	_init(type) {
		const setActiveDraw = (type) => {
			if (type in this._drawTypes) {
				const draw = this._drawTypes[type];
				draw.setActive(true);
			}
			else {
				console.warn('Unknown DrawType [' + type + '], deactivate only current draw');
			}
		};

		const currentDraw = this._getActiveDraw();

		if (currentDraw) {
			currentDraw.abortDrawing();
			currentDraw.setActive(false);
		}
		setActiveDraw(type);
	}

	_remove() {
		// TODO: Implement logic for removing feature or part of feature
	}

	_finish() {
		const activeDraw = this._getActiveDraw();
		if (activeDraw && activeDraw.getActive()) {
			if (this._activeSketch) {
				activeDraw.finishDrawing();
			}
			else {
				this._activateModify(null);
			}
		}
	}

	_startNew() {
		const activeDraw = this._getActiveDraw();
		if (activeDraw) {
			activeDraw.abortDrawing();
			this._select.getFeatures().clear();
			this._modify.setActive(false);
		}
	}

	_onDrawStateChanged(listener) {
		this._drawStateChangedListeners.push(listener);
	}

	_register(store) {
		return [
			observe(store, state => state.draw.type, (type) => this._init(type)),
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

	_getActiveDraw() {
		// eslint-disable-next-line no-unused-vars
		for (const [key, draw] of Object.entries(this._drawTypes)) {
			if (draw.getActive()) {
				return draw;
			}
		}

		return null;
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
