/**
 * @module modules/olMap/handler/draw/OlDrawHandler
 */
import { DRAW_LAYER_ID } from '../../../../plugins/DrawPlugin';
import { OlLayerHandler } from '../OlLayerHandler';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { $injector } from '../../../../injection';
import { Draw, Modify, Select, Snap } from 'ol/interaction';
import {
	createSketchStyleFunction,
	getColorFrom,
	getDrawingTypeFrom,
	getSizeFrom,
	getSymbolFrom,
	getTextFrom,
	selectStyleFunction
} from '../../utils/olStyleUtils';
import { StyleTypes } from '../../services/StyleService';
import { StyleSizeTypes } from '../../../../domain/styles';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { equals, observe } from '../../../../utils/storeUtils';
import { setSelectedStyle, setStyle, setType, setGeometryIsValid, setSelection, setDescription } from '../../../../store/draw/draw.action';
import { unByKey } from 'ol/Observable';
import { create as createKML, KML_EMPTY_CONTENT } from '../../formats/kml';
import {
	getModifyOptions,
	getSelectableFeatures,
	getSelectOptions,
	getSnapState,
	getSnapTolerancePerDevice,
	InteractionSnapType,
	InteractionStateType,
	removeSelectedFeatures
} from '../../utils/olInteractionUtils';
import { HelpTooltip } from '../../tooltip/HelpTooltip';
import { provide as messageProvide } from './tooltipMessage.provider';
import { VectorGeoResource, VectorSourceType } from '../../../../domain/geoResources';
import { addLayer, removeLayer } from '../../../../store/layers/layers.action';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { OlSketchHandler } from '../OlSketchHandler';
import { setMode } from '../../../../store/draw/draw.action';
import { isValidGeometry } from '../../utils/olGeometryUtils';
import { acknowledgeTermsOfUse } from '../../../../store/shared/shared.action';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { setSelection as setMeasurementSelection } from '../../../../store/measurement/measurement.action';
import { INITIAL_STYLE } from '../../../../store/draw/draw.reducer';
import { isString } from '../../../../utils/checks';
import { hexToRgb } from '../../../../utils/colors';
import { KeyActionMapper } from '../../../../utils/KeyActionMapper';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from '../../../../services/provider/attribution.provider';
import { KML } from 'ol/format';
import { Tools } from '../../../../domain/tools';
import { GEODESIC_FEATURE_PROPERTY, GeodesicGeometry } from '../../ol/geodesic/geodesicGeometry';
import { setData } from '../../../../store/fileStorage/fileStorage.action';
import { createDefaultLayerProperties } from '../../../../store/layers/layers.reducer';

export const MAX_SELECTION_SIZE = 1;

const defaultStyleOption = {
	symbolSrc: null, // used by: Symbol
	scale: StyleSizeTypes.MEDIUM, // used by Symbol
	color: '#FF0000', // used by Symbol, Text, Line, Polygon
	text: null // used by Text, Symbol
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
		const {
			TranslationService,
			MapService,
			EnvironmentService,
			StoreService,
			GeoResourceService,
			OverlayService,
			StyleService,
			IconService,
			FileStorageService
		} = $injector.inject(
			'TranslationService',
			'MapService',
			'EnvironmentService',
			'StoreService',
			'GeoResourceService',
			'OverlayService',
			'StyleService',
			'IconService',
			'FileStorageService'
		);
		this._translationService = TranslationService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._storeService = StoreService;
		this._geoResourceService = GeoResourceService;
		this._overlayService = OverlayService;
		this._styleService = StyleService;
		this._iconService = IconService;
		this._fileStorageService = FileStorageService;

		this._vectorLayer = null;
		this._layerId = null;
		this._draw = null;
		this._modify = null;
		this._snap = null;
		this._select = null;

		this._storedContent = null;

		this._sketchHandler = new OlSketchHandler();
		this._mapListeners = [];
		this._drawingListeners = [];
		this._keyActionMapper = new KeyActionMapper(document).addForKeyUp('Delete', () => this._remove()).addForKeyUp('Escape', () => this._reset());

		this._lastPointerMoveEvent = null;
		this._lastInteractionStateType = null;
		this._drawState = {
			type: null,
			snap: null,
			coordinate: null,
			pointCount: 0,
			dragging: false
		};

		this._helpTooltip = new HelpTooltip();
		this._helpTooltip.messageProvideFunction = messageProvide;
		this._drawStateChangedListeners = [];
		this._registeredObservers = [];
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {
		const translate = (key, params = []) => this._translationService.translate(key, params);
		if (
			!this._storeService.getStore().getState().shared.termsOfUseAcknowledged &&
			!this._environmentService.isStandalone() &&
			!this._environmentService.isEmbedded()
		) {
			const termsOfUse = translate('olMap_handler_termsOfUse', [translate('global_terms_of_use')]);
			if (termsOfUse) {
				emitNotification(termsOfUse, LevelTypes.INFO);
			}
			acknowledgeTermsOfUse();
		}
		const getOldLayer = (map) => {
			const byZIndex = (a, b) => b.getZIndex() - a.getZIndex(); // implicit reversed sort order
			const isOldLayer = (layer) =>
				this._fileStorageService.isAdminId(layer.get('geoResourceId')) || this._fileStorageService.isFileId(layer.get('geoResourceId'));
			// we sort all layers by zIndex (z-index=0 -> top-most; index=length-1 -> lowest)
			// and iterate over the result, the top-most layer is the one we take as source for our drawing layer
			return map.getLayers().getArray().sort(byZIndex).find(isOldLayer);
		};

		const createLayer = () => {
			const source = new VectorSource({ wrapX: false });
			const layer = new VectorLayer({
				source: source
			});
			layer.label = translate('olMap_handler_draw_layer_label');
			return layer;
		};

		const addOldFeatures = async (layer, oldLayer) => {
			if (oldLayer) {
				const vgr = this._geoResourceService.byId(oldLayer.get('geoResourceId'));
				if (vgr) {
					/**
					 * Note: vgr.data does not return a Promise anymore.
					 * To preserve the internal logic of this handler, we create a Promise by using 'await' anyway
					 */
					const data = await vgr.data;
					const oldFeatures = new KML().readFeatures(data);
					const onFeatureChange = (event) => {
						const geometry = event.target.getGeometry();
						setGeometryIsValid(isValidGeometry(geometry));
						this._styleService.updateStyle(event.target, olMap);
					};

					oldFeatures.forEach((f) => {
						f.getGeometry().transform('EPSG:' + vgr.srid, 'EPSG:' + this._mapService.getSrid());
						if (f.getId().startsWith(Tools.MEASURE)) {
							f.set(GEODESIC_FEATURE_PROPERTY, new GeodesicGeometry(f, olMap));
						}
						this._styleService.removeStyle(f, olMap);
						this._styleService.addStyle(f, olMap, layer);
						layer.getSource().addFeature(f);
						f.on('change', onFeatureChange);
					});
					const oldLayerId = oldLayer.get('id');
					this._layerId = oldLayerId;
					this._layerZIndex = oldLayer.getZIndex();
					removeLayer(oldLayerId);
					this._init(null);
					this._setSelection(this._storeService.getStore().getState().draw.selection);
				}
			}
		};

		const getOrCreateLayer = () => {
			const layer = createLayer();
			const updateAndSaveContent = () => {
				const kmlContent = createKML(layer, 'EPSG:3857');
				this._storedContent = kmlContent ?? KML_EMPTY_CONTENT;
				this._save();
			};
			const setSelectedAndSave = (event) => {
				if (this._drawState.type === InteractionStateType.DRAW) {
					setSelection([event.feature.getId()]);
				}
				this._storedContent = createKML(layer, 'EPSG:3857');
				this._save();
			};
			const registerListeners = (layer) => {
				this._mapListeners.push(layer.getSource().on('addfeature', setSelectedAndSave));
				this._mapListeners.push(layer.getSource().on('changefeature', () => updateAndSaveContent()));
				this._mapListeners.push(layer.getSource().on('removefeature', () => updateAndSaveContent()));
			};
			if (this._storeService.getStore().getState().draw.createPermanentLayer) {
				const oldLayer = getOldLayer(this._map);
				addOldFeatures(layer, oldLayer)
					// eslint-disable-next-line promise/prefer-await-to-then
					.finally(() => {
						this._storedContent = createKML(layer, 'EPSG:3857');
						this._save();
						registerListeners(layer);
					});
			} else {
				registerListeners(layer);
			}

			return layer;
		};

		const clickHandler = (event) => {
			const coordinate = event.coordinate;
			const dragging = event.dragging;
			const pixel = event.pixel;

			const addToSelection = (features) => {
				if ([InteractionStateType.MODIFY, InteractionStateType.SELECT].includes(this._drawState.type)) {
					const ids = features.map((f) => f.getId());
					this._setSelection(ids);
				}
				this._updateDrawState(coordinate, pixel, dragging);
			};

			const changeTool = (features) => {
				const changeToMeasureTool = (features) => {
					return features.some((f) => f.getId().startsWith(Tools.MEASURE + '_'));
				};
				if (changeToMeasureTool(features)) {
					const measurementIds = features.filter((f) => f.getId().startsWith(Tools.MEASURE + '_')).map((f) => f.getId());
					setMeasurementSelection(measurementIds);
					setCurrentTool(Tools.MEASURE);
				}
			};

			const isToolChangeNeeded = (features) => {
				return features.some((f) => !f.getId().startsWith(Tools.DRAW + '_'));
			};

			const selectableFeatures = getSelectableFeatures(this._map, this._vectorLayer, pixel).slice(0, 1); // we only want the first selectable feature
			const clickAction = isToolChangeNeeded(selectableFeatures) ? changeTool : addToSelection;
			clickAction(selectableFeatures);
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
			this._vectorLayer = getOrCreateLayer();
			this._mapContainer = olMap.getTarget();
			const source = this._vectorLayer.getSource();
			this._select = this._createSelect();
			this._modify = this._createModify();
			this._select.setActive(false);
			this._modify.setActive(false);
			this._snap = new Snap({ source: source, pixelTolerance: getSnapTolerancePerDevice() });
			this._onDrawStateChanged((drawState) => this._updateDrawMode(drawState));
			if (!this._environmentService.isTouch()) {
				this._helpTooltip.activate(this._map);
				this._onDrawStateChanged((drawState) => {
					this._helpTooltip.notify(drawState);
					if (drawState.snap === InteractionSnapType.VERTEX) {
						this._mapContainer.classList.add('grab');
					} else {
						this._mapContainer.classList.remove('grab');
					}
				});
			}
			this._mapListeners.push(olMap.on(MapBrowserEventType.CLICK, clickHandler));
			this._mapListeners.push(olMap.on(MapBrowserEventType.POINTERMOVE, pointerMoveHandler));
			this._mapListeners.push(olMap.on(MapBrowserEventType.DBLCLICK, () => false));
		}
		this._registeredObservers = this._register(this._storeService.getStore());
		this._keyActionMapper.activate();

		this._map.addInteraction(this._select);
		this._map.addInteraction(this._modify);
		this._map.addInteraction(this._snap);

		const preselectDrawType = this._storeService.getStore().getState().draw.type;
		if (preselectDrawType) {
			this._init(preselectDrawType);
		}

		this._storedContent = null; // reset last saved content for new changes
		this._updateDrawState();
		return this._vectorLayer;
	}

	/**
	 *  @override
	 *  @param {OlMap} olMap
	 */
	onDeactivate(olMap) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later
		const removeAllDrawInteractions = (map) => {
			map
				.getInteractions()
				.getArray()
				.filter((i) => i instanceof Draw)
				.forEach((d) => map.removeInteraction(d));
		};
		this._unreg(this._mapListeners);
		this._unreg(this._drawingListeners);
		setStyle(INITIAL_STYLE);
		setSelectedStyle(null);
		olMap.removeInteraction(this._modify);
		olMap.removeInteraction(this._snap);
		olMap.removeInteraction(this._select);

		removeAllDrawInteractions(olMap);
		this._helpTooltip.deactivate();

		this._unreg(this._drawStateChangedListeners);
		this._unsubscribe(this._registeredObservers);
		this._keyActionMapper.deactivate();

		setSelection([]);

		// eslint-disable-next-line promise/prefer-await-to-then
		this._saveAndOptionallyConvertToPermanentLayer().finally(() => {
			this._layerId = null;
			this._layerZIndex = null;
		});
		this._vectorLayer
			.getSource()
			.getFeatures()
			.forEach((f) => this._overlayService.remove(f, this._map));
		this._draw = null;
		this._modify = false;
		this._select = false;
		this._snap = false;
		this._vectorLayer = null;
		this._map = null;
	}

	_unreg(listeners) {
		unByKey(listeners);
		listeners = [];
	}

	_unsubscribe(observers) {
		observers.forEach((unsubscribe) => unsubscribe());
		observers = [];
	}

	_setDrawState(value) {
		if (value !== this._drawState) {
			this._drawState = value;
			this._drawStateChangedListeners.forEach((l) => l(value));
		}
	}

	_onDrawStateChanged(listener) {
		this._drawStateChangedListeners.push(listener);
	}

	_register(store) {
		return [
			observe(
				store,
				(state) => state.draw.type,
				(type) => this._init(type)
			),
			observe(
				store,
				(state) => state.draw.style,
				() => this._updateStyle()
			),
			observe(
				store,
				(state) => state.draw.finish,
				() => this._finish()
			),
			observe(
				store,
				(state) => state.draw.reset,
				() => this._reset()
			),
			observe(
				store,
				(state) => state.draw.remove,
				() => this._remove()
			),
			observe(
				store,
				(state) => state.draw.selection,
				(ids) => this._setSelection(ids)
			),
			observe(
				store,
				(state) => state.draw.description,
				(description) => this._updateDescription(description)
			)
		];
	}

	_init(type) {
		const styleOption = this._getStyleOption();
		if (this._draw) {
			this._draw.abortDrawing();
			this._draw.setActive(false);
			this._map.removeInteraction(this._draw);
		}

		this._select.getFeatures().clear();
		this._draw = this._createDrawByType(type, styleOption);

		// we deactivate the modify-interaction only,
		// if the given drawType results in a valid draw-interaction
		// otherwise we must force the modify-interaction to be active
		if (this._modify.getActive() && this._draw) {
			this._modify.setActive(false);
		} else if (this._draw == null) {
			this._modify.setActive(true);
		}

		if (this._draw) {
			this._draw.on('drawstart', (event) => {
				const onFeatureChange = (event) => {
					const geometry = event.target.getGeometry();
					setGeometryIsValid(isValidGeometry(geometry));
				};
				this._sketchHandler.activate(event.feature, this._map, Tools.DRAW + '_' + type + '_');
				const description = this._storeService.getStore().getState().draw.description;

				if (description) {
					this._sketchHandler.active.set('description', description);
				}
				const styleFunction = this._getStyleFunctionByDrawType(type, this._getStyleOption());
				const styles = styleFunction(this._sketchHandler.active);
				this._sketchHandler.active.setStyle(styles);
				this._drawingListeners.push(event.feature.on('change', onFeatureChange));
			});
			this._draw.on('drawend', (event) => {
				this._activateModify(event.feature);
				this._sketchHandler.deactivate();
				this._unreg(this._drawingListeners);
			});

			this._map.addInteraction(this._draw);
			this._draw.setActive(true);
			this._updateDrawState();
		}
	}

	_remove() {
		if (this._draw && this._draw.getActive()) {
			const isValid = () => {
				if (this._sketchHandler.isActive) {
					const geometry = this._sketchHandler.active.getGeometry();
					return isValidGeometry(geometry);
				}
				return false;
			};
			if (!isValid()) {
				this._startNew();
			} else {
				this._draw.removeLastPoint();
				this._updateDrawState();
			}

			if (this._lastPointerMoveEvent) {
				this._draw.handleEvent(this._lastPointerMoveEvent);
			}
		}

		if (this._modify && this._modify.getActive()) {
			removeSelectedFeatures(this._select.getFeatures(), this._vectorLayer);
			this._setSelection([]);
			this._updateDrawState();
		}
	}

	_finish() {
		if (this._sketchHandler.isActive) {
			this._draw.finishDrawing();
			this._updateDrawState();
		} else {
			this._activateModify();
		}
	}

	_startNew() {
		if (this._draw) {
			this._draw.abortDrawing();
			this._modify.setActive(false);
			setSelection([]);

			this._helpTooltip.deactivate();
			const currentType = this._storeService.getStore().getState().draw.type;
			this._init(currentType);
			this._helpTooltip.activate(this._map);
		}
		this._updateDrawState();
	}

	_reset() {
		if (this._draw) {
			this._draw.abortDrawing();
			this._modify.setActive(false);
			setSelection([]);

			this._helpTooltip.deactivate();
			setType(null);
		}
		this._updateDrawState();
	}

	_createDrawByType(type, styleOption) {
		if (type == null) {
			return null;
		}

		if (type === StyleTypes.MARKER && !styleOption.symbolSrc) {
			return null;
		}

		if (this._vectorLayer == null) {
			return null;
		}
		const source = this._vectorLayer.getSource();
		const snapTolerance = getSnapTolerancePerDevice();
		switch (type) {
			case StyleTypes.POINT:
			case StyleTypes.MARKER:
			case StyleTypes.TEXT:
				return new Draw({
					source: source,
					type: 'Point',
					minPoints: 1,
					snapTolerance: snapTolerance,
					style: this._getStyleFunctionByDrawType(type, styleOption),
					wrapX: true
				});
			case StyleTypes.LINE:
				return new Draw({
					source: source,
					type: 'LineString',
					snapTolerance: snapTolerance,
					style: createSketchStyleFunction(this._getStyleFunctionByDrawType('line', styleOption)),
					wrapX: true
				});
			case StyleTypes.POLYGON:
				return new Draw({
					source: source,
					type: 'Polygon',
					minPoints: 3,
					snapTolerance: snapTolerance,
					style: createSketchStyleFunction(this._getStyleFunctionByDrawType('polygon', styleOption)),
					wrapX: true
				});
			default:
				console.warn('unknown Drawtype: ' + type);
		}
	}

	_createSelect() {
		const select = new Select(getSelectOptions(this._vectorLayer));
		select.getFeatures().on('add', (e) => {
			const feature = e.element;
			const styleFunction = selectStyleFunction();
			const styles = styleFunction(feature);
			e.element.setStyle(styles);
		});
		select.getFeatures().on('remove', (e) => {
			const feature = e.element;
			const styles = feature.getStyle();
			styles.pop();
			feature.setStyle(styles);
		});

		return select;
	}

	_createModify() {
		const modify = new Modify(getModifyOptions(this._select.getFeatures()));
		modify.on('modifystart', (event) => {
			if (event.mapBrowserEvent.type !== MapBrowserEventType.SINGLECLICK) {
				this._mapContainer.classList.add('grabbing');
			}
		});
		modify.on('modifyend', (event) => {
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
		this._setSelected(feature);
	}

	_getStyleOption() {
		const getDefaultText = () => {
			const translate = (key) => this._translationService.translate(key);
			return translate('olMap_handler_draw_new_text');
		};

		const getDefaultTextByType = (type) => {
			switch (type) {
				case StyleTypes.TEXT:
					return getDefaultText();
				case StyleTypes.MARKER:
					return '';
				default:
					return null;
			}
		};

		const style = this._storeService.getStore().getState().draw.style;
		const type = this._storeService.getStore().getState().draw.type;
		if (equals(style, INITIAL_STYLE)) {
			const defaultSymbolUrl = this._iconService.getDefault().getUrl(hexToRgb(defaultStyleOption.color));
			const defaultSymbolSrc = defaultSymbolUrl ? defaultSymbolUrl : this._iconService.getDefault().base64;
			setStyle({
				...defaultStyleOption,
				symbolSrc: defaultSymbolSrc,
				text: getDefaultTextByType(type),
				anchor: this._iconService.getDefault().anchor
			});
		} else if (type === StyleTypes.TEXT && !isString(style.text)) {
			setStyle({ ...style, text: getDefaultText() });
		} else if (type === StyleTypes.MARKER && !isString(style.text)) {
			setStyle({ ...style, text: '' });
		}

		return this._storeService.getStore().getState().draw.style;
	}

	_getStyleFunctionFrom(feature) {
		const type = getDrawingTypeFrom(feature);
		return type != null ? this._getStyleFunctionByDrawType(type, this._getStyleOption()) : null;
	}

	_getStyleFunctionByDrawType(drawType, styleOption) {
		const drawTypes = [StyleTypes.POINT, StyleTypes.MARKER, StyleTypes.TEXT, StyleTypes.LINE, StyleTypes.POLYGON];
		if (drawTypes.includes(drawType)) {
			const styleFunction = this._styleService.getStyleFunction(drawType);
			return () => styleFunction(styleOption);
		}
		return this._styleService.getStyleFunction(StyleTypes.DRAW);
	}

	_updateDrawState(coordinate, pixel, dragging) {
		const pointCount = this._sketchHandler.pointCount;
		const drawState = {
			type: null,
			snap: null,
			coordinate: coordinate,
			pointCount: pointCount
		};
		if (pixel) {
			drawState.snap = getSnapState(this._map, this._vectorLayer, pixel);
		}

		if (this._draw) {
			drawState.type = InteractionStateType.ACTIVE;
			if (this._sketchHandler.isActive) {
				drawState.type = InteractionStateType.DRAW;
				drawState.geometryType = this._sketchHandler.active.getGeometry().getType();
				if (this._sketchHandler.isFinishOnFirstPoint) {
					drawState.snap = InteractionSnapType.FIRSTPOINT;
				} else if (this._sketchHandler.isSnapOnLastPoint) {
					drawState.snap = InteractionSnapType.LASTPOINT;
				}
			}
		}

		if (this._modify.getActive()) {
			drawState.type = this._select.getFeatures().getLength() === 0 ? InteractionStateType.SELECT : InteractionStateType.MODIFY;
			drawState.geometryType = this._select.getFeatures().getLength() === 0 ? null : this._select.getFeatures().item(0)?.getGeometry().getType();
		}

		drawState.dragging = dragging;
		if (coordinate == null && pixel == null && this._drawState.type === InteractionStateType.MODIFY) {
			drawState.type = InteractionStateType.SELECT;
		}
		this._setDrawState(drawState);
	}

	_updateDrawMode(drawState) {
		if (this._lastInteractionStateType !== drawState.type && drawState.type !== InteractionStateType.OVERLAY) {
			this._lastInteractionStateType = drawState.type;
			setMode(this._lastInteractionStateType);
		}
	}

	_updateStyle() {
		if (this._drawState.type === InteractionStateType.ACTIVE || this._drawState.type === InteractionStateType.SELECT) {
			const currentType = this._storeService.getStore().getState().draw.type;
			if (this._draw && !this._draw.active) {
				// Prevent a second initialization, while the draw-interaction is building up.
				// This can happen, when a draw-interaction for a TEXT- or MARKER-Draw is selected,
				// where the DefaultText must be set as style-property in the store
				this._init(currentType);
			}
		}

		if (this._drawState.type === InteractionStateType.MODIFY && this._select.getFeatures().getLength() > 0) {
			const feature = this._select.getFeatures().item(0);

			const styleFunction = this._getStyleFunctionFrom(feature);
			const newStyles = styleFunction(feature);

			feature.setStyle([newStyles[0], ...feature.getStyle().slice(1)]);
			this._setSelected(feature);
		}

		if (this._drawState.type === InteractionStateType.DRAW) {
			if (this._sketchHandler.isActive) {
				const styleFunction = this._getStyleFunctionFrom(this._sketchHandler.active);
				const newStyles = styleFunction(this._sketchHandler.active);
				this._sketchHandler.active.setStyle(newStyles);
			}
		}

		if (this._drawState.type == null) {
			this._startNew();
		}
	}

	_updateDescription(description) {
		const updateSketchFeature = () => {
			if (this._sketchHandler.isActive) {
				this._sketchHandler.active.setProperties({ description: description ? description : null });
			}
		};

		const updateSelectedFeature = () => {
			const feature = this._select.getFeatures().item(0);
			if (feature) {
				feature.setProperties({ description: description ? description : null });
			}
		};

		switch (this._drawState.type) {
			case InteractionStateType.DRAW:
				updateSketchFeature();
				break;
			case InteractionStateType.MODIFY:
				updateSelectedFeature();
				break;
		}
	}

	_setSelectedStyle(feature) {
		const currentStyleOption = this._getStyleOption();
		const featureColor = getColorFrom(feature);
		const featureSymbol = getSymbolFrom(feature);
		const featureText = getTextFrom(feature);
		const featureScale = getSizeFrom(feature);
		const color = featureColor ? featureColor : currentStyleOption.color;
		const symbolSrc = featureSymbol ? featureSymbol : currentStyleOption.symbolSrc;
		const text = featureText ? featureText : '';
		const scale = featureScale ? featureScale : currentStyleOption.scale;
		const style = { ...currentStyleOption, color: color, symbolSrc: symbolSrc, text: text, scale: scale };
		const selectedStyle = { type: getDrawingTypeFrom(feature), style: style };
		setSelectedStyle(selectedStyle);
		setStyle(style);
	}

	_setSelectedDescription(feature) {
		const valueOrNull = (value) => {
			return value ? value : null;
		};
		const getUpdatedDescription = (feature) => {
			const value = feature ? feature.get('description') : null;
			return valueOrNull(value);
		};
		setDescription(getUpdatedDescription(feature));
	}

	_setSelection(ids = []) {
		const getSelectedId = () =>
			this._select
				? this._select
						.getFeatures()
						.getArray()
						?.map((f) => f.getId())
				: null;
		const isNewSelection = !equals(ids, getSelectedId());
		if (this._select && isNewSelection) {
			const selectionSize = this._select.getFeatures().getLength();
			if (MAX_SELECTION_SIZE <= selectionSize || ids.length === 0) {
				this._setSelected(null);
			}
			ids.forEach((id) => {
				const feature = this._vectorLayer.getSource().getFeatureById(id);
				this._setSelected(feature);
			});
		}
	}

	_setSelected(feature) {
		const setSelected = (f) => {
			const hasFeature = this._select.getFeatures().getArray().includes(feature);
			this._setSelectedStyle(f);
			this._setSelectedDescription(f);
			if (!hasFeature) {
				this._select.getFeatures().push(f);
			}

			return true;
		};
		const deselect = () => {
			this._select.getFeatures().clear();
			setSelectedStyle(null);
			setDescription(null);
		};
		return feature ? setSelected(feature) : deselect();
	}

	async _save() {
		/**
		 * The stored content will be created/updated after adding/changing and removing features,
		 * while interacting with the layer.
		 */
		setData(this._storedContent);
	}

	async _saveAndOptionallyConvertToPermanentLayer() {
		const translate = (key) => this._translationService.translate(key);
		const label = translate('olMap_handler_draw_layer_label');

		await this._save();
		if (this._storeService.getStore().getState().draw.createPermanentLayer && this._storedContent) {
			const id = this._storeService.getStore().getState().fileStorage.fileId;
			const getOrCreateVectorGeoResource = () => {
				const fromService = this._geoResourceService.byId(id);
				return fromService
					? fromService
					: new VectorGeoResource(id, label, VectorSourceType.KML).setAttributionProvider(getAttributionForLocallyImportedOrCreatedGeoResource);
			};
			const vgr = getOrCreateVectorGeoResource();
			vgr.setSource(this._storedContent, 4326);

			// register the stored data as new georesource
			this._geoResourceService.addOrReplace(vgr);
			const layerId = this._layerId ?? `${id}_draw`;
			addLayer(layerId, { zIndex: this._layerZIndex ?? createDefaultLayerProperties().zIndex, geoResourceId: id, constraints: { metaData: false } });
		}
	}
}
