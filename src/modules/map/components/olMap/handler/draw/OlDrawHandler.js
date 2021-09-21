import { DRAW_LAYER_ID, DRAW_TOOL_ID } from '../../../../store/DrawPlugin';
import { OlLayerHandler } from '../OlLayerHandler';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { $injector } from '../../../../../../injection';
import { DragPan, Draw, Modify, Select, Snap } from 'ol/interaction';
import { createSketchStyleFunction, modifyStyleFunction, getColorFrom, selectStyleFunction } from '../../olStyleUtils';
import { StyleSizeTypes, StyleTypes } from '../../services/StyleService';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { observe } from '../../../../../../utils/storeUtils';
import { isVertexOfGeometry } from '../../olGeometryUtils';
import { setSelectedStyle, setStyle, setType } from '../../../../store/draw.action';
import { unByKey } from 'ol/Observable';
import { InteractionSnapType, InteractionStateType } from '../../olInteractionUtils';
import { HelpTooltip } from '../../HelpTooltip';
import { provide as messageProvide } from './tooltipMessage.provider';
import { Polygon } from 'ol/geom';
import { noModifierKeys, singleClick } from 'ol/events/condition';


export const MAX_SELECTION_SIZE = 1;

const defaultStyleOption = {
	symbolSrc: null, // used by: Symbol
	scale: StyleSizeTypes.MEDIUM, // used by Symbol
	color: '#FFDAFF', // used by Symbol, Text, Line, Polygon
	text: '' // used by Text
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
		this._lastInteractionStateType = null;
		this._drawState = {
			type: null,
			snap: null,
			coordinate: null,
			pointCount: this._pointCount,
			dragging: false
		};

		this._helpTooltip = new HelpTooltip();
		this._helpTooltip.messageProvideFunction = messageProvide;
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
			if (this._drawState.type === InteractionStateType.MODIFY && selectableFeatures.length === 0 && !this._modifyActivated) {
				this._select.getFeatures().clear();
				setSelectedStyle(null);
				this._setDrawState({ ...this._drawState, type: InteractionStateType.SELECT, snap: null });
			}

			if ([InteractionStateType.MODIFY, InteractionStateType.SELECT].includes(this._drawState.type) && selectableFeatures.length > 0) {
				selectableFeatures.forEach(f => {
					const hasFeature = this._isInCollection(f, this._select.getFeatures());
					if (!hasFeature) {
						this._setSelected(f);
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
			this._onDrawStateChanged((drawState) => this._updateDrawMode(drawState));
			if (!this._environmentService.isTouch()) {
				this._helpTooltip.activate(this._map);
				this._onDrawStateChanged((drawState) => {
					this._helpTooltip.notify(drawState);
					if (drawState.snap === InteractionSnapType.VERTEX) {
						this._mapContainer.classList.add('grab');
					}
					else {
						this._mapContainer.classList.remove('grab');
					}
				});
			}
			this._listeners.push(olMap.on(MapBrowserEventType.CLICK, clickHandler));
			this._listeners.push(olMap.on(MapBrowserEventType.POINTERMOVE, pointerMoveHandler));
			this._listeners.push(document.addEventListener('keyup', (e) => this._removeLast(e)));
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

		this._unreg(this._listeners);
		this._unreg(this._registeredObservers);
		this._draw = null;
		this._map = null;
	}

	_unreg(listeners) {
		unByKey(listeners);
		listeners = [];
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

	_getStyleFunctionFrom(feature) {
		const type = this._getDrawingTypeFrom(feature);
		return type != null ? this._getStyleFunctionByDrawType(type, this._getStyleOption()) : null;
	}

	_getStyleFunctionByDrawType(drawType, styleOption) {
		switch (drawType) {
			case 'Symbol':
				return () => {
					const styleFunction = this._styleService.getStyleFunction(StyleTypes.MARKER);
					return styleFunction(styleOption);
				};
			case 'Line':
				return () => {
					const styleFunction = this._styleService.getStyleFunction(StyleTypes.LINE);
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
			drawState.type = InteractionStateType.ACTIVE;

			if (this._activeSketch) {
				this._activeSketch.getGeometry();
				drawState.type = InteractionStateType.DRAW;

				if (this._isFinishOnFirstPoint) {
					drawState.snap = InteractionSnapType.FIRSTPOINT;
				}
				else if (this._isSnapOnLastPoint) {
					drawState.snap = InteractionSnapType.LASTPOINT;
				}
			}
		}

		if (this._modify.getActive()) {
			drawState.type = this._select.getFeatures().getLength() === 0 ? InteractionStateType.SELECT : InteractionStateType.MODIFY;
		}

		drawState.dragging = dragging;
		this._setDrawState(drawState);
	}

	// eslint-disable-next-line no-unused-vars
	_updateDrawMode(state) {
		// DEBUG:console.log(state.type ? '' + state.type : 'null');
		// TODO: implement here any further notifications like tooltips
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
			style: null
		};
		const select = new Select(options);
		select.getFeatures().on('add', (e) => {
			const feature = e.element;
			const styleFunction = selectStyleFunction();
			const styles = styleFunction(feature);
			e.element.setStyle(styles);
		});
		select.getFeatures().on('remove', (e) => {
			const feature = e.element;
			if (feature) {
				const styles = feature.getStyle();
				styles.pop();
				feature.setStyle(styles);
			}
		});

		return select;
	}

	_createModify() {
		const options = {
			features: this._select.getFeatures(),
			style: modifyStyleFunction,
			deleteCondition: event => {
				const isDeletable = (noModifierKeys(event) && singleClick(event));
				return isDeletable;
			}
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
		this._draw.setActive(false);
		setType(null);

		this._modify.setActive(true);
		this._modifyActivated = true;

		this._setSelected(feature);
		this._activeSketch = null;
	}

	_init(type) {
		const styleOption = this._getStyleOption();
		let listener;
		if (this._draw) {
			this._draw.abortDrawing();
			this._draw.setActive(false);
			this._map.removeInteraction(this._draw);
		}
		this._draw = this._createDrawByType(type, styleOption);
		this._select.getFeatures().clear();

		// we deactivate the modify-interaction only,
		// if the given drawType results in a valid draw-interaction
		// otherwise we must force the modify-interaction to be active
		if (this._modify.getActive() && this._draw) {
			this._modify.setActive(false);
		}
		else if (this._draw == null) {
			this._modify.setActive(true);
		}


		if (this._draw) {

			this._draw.on('drawstart', event => {
				this._activeSketch = event.feature;
				this._pointCount = 1;
				this._isSnapOnLastPoint = false;
				const onFeatureChange = (event) => {
					this._monitorDrawing(event.target, true);
				};

				this._activeSketch.setId(DRAW_TOOL_ID + '_' + type + '_' + new Date().getTime());
				const styleFunction = this._getStyleFunctionByDrawType(type, styleOption);
				const styles = styleFunction(this._activeSketch);
				this._activeSketch.setStyle(styles);
				listener = event.feature.on('change', onFeatureChange);
			});
			this._draw.on('drawend', event => {
				this._activateModify(event.feature);
				unByKey(listener);
			});

			this._map.addInteraction(this._draw);
			this._draw.setActive(true);
		}

	}

	_removeSelectedFeatures() {
		const selectedFeatures = this._select.getFeatures();
		selectedFeatures.forEach(f => {
			if (this._vectorLayer.getSource().hasFeature(f)) {
				this._vectorLayer.getSource().removeFeature(f);
			}
		});
		selectedFeatures.clear();
	}

	_removeLast(event) {
		if ((event.which === 46 || event.keyCode === 46) && !/^(input|textarea)$/i.test(event.target.nodeName)) {
			this._remove();
		}
	}

	_remove() {
		if (this._draw && this._draw.getActive()) {

			this._draw.removeLastPoint();
			if (this._pointCount === 1) {
				this._startNew();
			}
			if (this._lastPointerMoveEvent) {
				this._draw.handleEvent(this._lastPointerMoveEvent);
			}
		}

		if (this._modify && this._modify.getActive()) {

			this._removeSelectedFeatures();
		}
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

			const currenType = this._storeService.getStore().getState().draw.type;
			this._init(currenType);

		}
	}

	_updateStyle() {
		if (this._drawState.type === InteractionStateType.ACTIVE || this._drawState.type === InteractionStateType.SELECT) {
			const currenType = this._storeService.getStore().getState().draw.type;
			this._init(currenType);
		}

		if (this._drawState.type === InteractionStateType.MODIFY) {
			const feature = this._select.getFeatures().item(0);
			const styleFunction = this._getStyleFunctionFrom(feature);
			const newStyles = styleFunction(feature);

			const currentStyles = feature.getStyle();
			if (currentStyles.length > 1) {
				currentStyles[0] = newStyles[0];
			}
			feature.setStyle(currentStyles);
			setSelectedStyle({ type: this._getDrawingTypeFrom(feature), style: this._getStyleOption() });
		}

		if (this._drawState.type === InteractionStateType.DRAW) {
			if (this._activeSketch) {
				const styleFunction = this._getStyleFunctionFrom(this._activeSketch);
				const newStyles = styleFunction(this._activeSketch);
				this._activeSketch.setStyle(newStyles);
			}
		}

		if (this._drawState.type == null) {
			this._startNew();
		}


	}

	_monitorDrawing(feature, isDrawing) {
		const getLineCoordinates = (geometry, isDrawing) => {
			if (geometry instanceof Polygon) {
				return isDrawing ? geometry.getCoordinates()[0].slice(0, -1) : geometry.getCoordinates()[0];
			}
			return geometry.getCoordinates();

		};
		const lineCoordinates = getLineCoordinates(feature.getGeometry(), isDrawing);

		if (this._pointCount !== lineCoordinates.length) {
			// a point is added or removed
			this._pointCount = lineCoordinates.length;
		}
		else if (lineCoordinates.length > 1) {
			const firstPoint = lineCoordinates[0];
			const lastPoint = lineCoordinates[lineCoordinates.length - 1];
			const lastPoint2 = lineCoordinates[lineCoordinates.length - 2];

			const isSnapOnFirstPoint = (lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]);
			this._isFinishOnFirstPoint = (!this._isSnapOnLastPoint && isSnapOnFirstPoint);

			this._isSnapOnLastPoint = (lastPoint[0] === lastPoint2[0] && lastPoint[1] === lastPoint2[1]);
		}

	}

	_onDrawStateChanged(listener) {
		this._drawStateChangedListeners.push(listener);
	}

	_setSelected(feature) {
		if (feature) {
			const selectionSize = this._select.getFeatures().getLength();
			if (MAX_SELECTION_SIZE <= selectionSize) {
				this._select.getFeatures().clear();
			}
			this._select.getFeatures().push(feature);
			const currentStyleOption = this._getStyleOption();
			const featureColor = getColorFrom(feature);
			const color = featureColor ? featureColor : currentStyleOption.color;
			const style = { ...currentStyleOption, color: color };
			const selectedStyle = { type: this._getDrawingTypeFrom(feature), style: style };
			setSelectedStyle(selectedStyle);
		}
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
				return itemLayer === interactionLayer || (itemLayer.getStyle && itemLayer.getStyle() === modifyStyleFunction);
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
			snapType = InteractionSnapType.EGDE;
			const vertexGeometry = vertexFeature.getGeometry();
			const snappedFeature = vertexFeature.get('features')[0];
			const snappedGeometry = snappedFeature.getGeometry();

			if (isVertexOfGeometry(snappedGeometry, vertexGeometry)) {
				snapType = InteractionSnapType.VERTEX;
			}
		}
		if (!vertexFeature && featuresFromInteractionLayerCount > 0) {
			snapType = InteractionSnapType.FACE;
		}
		return snapType;
	}

	_getDrawingTypeFrom(feature) {
		if (feature) {
			const featureId = feature.getId();
			const type_index = 1;
			const seperator = '_';
			const parts = featureId.split(seperator);

			if (parts.length <= type_index) {
				return null;
			}
			return parts[type_index];
		}
		return null;
	}

	_getSnapTolerancePerDevice() {
		if (this._environmentService.isTouch()) {
			return 12;
		}
		return 4;
	}
}
