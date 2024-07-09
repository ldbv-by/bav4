/**
 * @module modules/olMap/handler/measure/OlMeasurementHandler
 */
import { Draw, Modify, Select, Snap } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import { LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { setStatistic, setMode, setSelection, setFileSaveResult } from '../../../../store/measurement/measurement.action';
import { addLayer, removeLayer } from '../../../../store/layers/layers.action';
import { createSketchStyleFunction, selectStyleFunction } from '../../utils/olStyleUtils';
import { getStats } from '../../utils/olGeometryUtils';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { observe } from '../../../../utils/storeUtils';
import { HelpTooltip } from '../../tooltip/HelpTooltip';
import { provide as messageProvide } from './tooltipMessage.provider';
import { create as createKML } from '../../formats/kml';
import { debounced } from '../../../../utils/timer';
import { VectorGeoResource, VectorSourceType } from '../../../../domain/geoResources';
import { saveManualOverlayPosition } from '../../overlayStyle/MeasurementOverlayStyle';
import { getOverlays } from '../../overlayStyle/OverlayStyle';
import { StyleTypes } from '../../services/StyleService';
import { FileStorageServiceDataTypes } from '../../../../services/FileStorageService';
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
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { OlSketchHandler } from '../OlSketchHandler';
import { MEASUREMENT_LAYER_ID } from '../../../../plugins/MeasurementPlugin';
import { acknowledgeTermsOfUse } from '../../../../store/shared/shared.action';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { setCurrentTool } from '../../../../store/tools/tools.action';
import { setSelection as setDrawSelection } from '../../../../store/draw/draw.action';
import { KeyActionMapper } from '../../../../utils/KeyActionMapper';
import { getAttributionForLocallyImportedOrCreatedGeoResource } from '../../../../services/provider/attribution.provider';
import { KML } from 'ol/format';
import { Tools } from '../../../../domain/tools';

const Debounce_Delay = 1000;

/**
 * Handler for measurement-interaction with the map.
 *
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class OlMeasurementHandler extends OlLayerHandler {
	constructor() {
		super(MEASUREMENT_LAYER_ID);
		const {
			TranslationService,
			MapService,
			EnvironmentService,
			StoreService,
			GeoResourceService,
			OverlayService,
			StyleService,
			InteractionStorageService
		} = $injector.inject(
			'TranslationService',
			'MapService',
			'EnvironmentService',
			'StoreService',
			'GeoResourceService',
			'OverlayService',
			'StyleService',
			'InteractionStorageService'
		);
		this._translationService = TranslationService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._storeService = StoreService;
		this._geoResourceService = GeoResourceService;
		this._overlayService = OverlayService;
		this._styleService = StyleService;
		this._storageHandler = InteractionStorageService;

		this._vectorLayer = null;
		this._draw = false;

		this._storedContent = null;

		this._sketchHandler = new OlSketchHandler();
		this._mapListeners = [];
		this._keyActionMapper = new KeyActionMapper(document).addForKeyUp('Delete', () => this._remove()).addForKeyUp('Escape', () => this._startNew());

		this._lastPointerMoveEvent = null;
		this._lastInteractionStateType = null;
		this._measureState = {
			type: null,
			snap: null,
			coordinate: null,
			pointCount: 0,
			dragging: false
		};
		this._helpTooltip = new HelpTooltip();
		this._helpTooltip.messageProvideFunction = messageProvide;
		this._measureStateChangedListeners = [];
		this._drawingListeners = [];
		this._registeredObservers = [];
		this._saveContentDebounced = debounced(this._environmentService.isEmbedded() ? 0 : Debounce_Delay, () => this._save());
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {
		const translate = (key) => this._translationService.translate(key);
		if (
			!this._storeService.getStore().getState().shared.termsOfUseAcknowledged &&
			!this._environmentService.isStandalone() &&
			!this._environmentService.isEmbedded()
		) {
			const termsOfUse = translate('olMap_handler_termsOfUse');
			if (termsOfUse) {
				emitNotification(unsafeHTML(termsOfUse), LevelTypes.INFO);
			}
			acknowledgeTermsOfUse();
		}
		const getOldLayer = (map) => {
			const isOldLayer = (layer) => this._storageHandler.isStorageId(layer.get('geoResourceId'));
			// we iterate over all layers in reverse order, the top-most layer is the one we take source for our drawing layer
			return map.getLayers().getArray().reverse().find(isOldLayer);
		};

		const createLayer = () => {
			const source = new VectorSource({ wrapX: false });
			const layer = new VectorLayer({
				source: source,
				style: this._styleService.getStyleFunction(StyleTypes.MEASURE)
			});
			layer.label = translate('olMap_handler_draw_layer_label');
			return layer;
		};

		const addOldFeatures = async (layer, oldLayer) => {
			if (oldLayer) {
				const vgr = this._geoResourceService.byId(oldLayer.get('geoResourceId'));
				if (vgr) {
					this._storageHandler.setStorageId(oldLayer.get('geoResourceId'));
					/**
					 * Note: vgr.data does not return a Promise anymore.
					 * To preserve the internal logic of this handler, we create a Promise by using 'await' anyway
					 */
					const data = await vgr.data;
					const oldFeatures = new KML().readFeatures(data);
					const onFeatureChange = (event) => {
						const measureGeometry = this._createMeasureGeometry(event.target);
						this._styleService.updateStyle(event.target, olMap, { geometry: measureGeometry }, StyleTypes.MEASURE);
						this._setStatistics(event.target);
					};
					oldFeatures.forEach((f) => {
						f.getGeometry().transform('EPSG:' + vgr.srid, 'EPSG:' + this._mapService.getSrid());
						layer.getSource().addFeature(f);
						this._styleService.removeStyle(f, olMap);
						this._styleService.addStyle(f, olMap, layer);
						f.on('change', onFeatureChange);
					});
					removeLayer(oldLayer.get('id'));
					this._finish();
					this._setSelection(this._storeService.getStore().getState().measurement.selection);
					this._updateMeasureState();
				}
			}
		};

		const onResolutionChange = (olLayer) => {
			olLayer
				.getSource()
				.getFeatures()
				.forEach((f) => {
					const measureGeometry = this._createMeasureGeometry(f);
					this._styleService.updateStyle(f, olMap, { geometry: measureGeometry }, StyleTypes.MEASURE);
				});
		};

		const getOrCreateLayer = () => {
			const oldLayer = getOldLayer(this._map);
			const layer = createLayer();

			const updateContent = () => {
				const features = layer.getSource().getFeatures();
				features.forEach((f) => saveManualOverlayPosition(f));

				this._storedContent = createKML(layer, 'EPSG:3857');
				this._saveContentDebounced();
			};
			const setSelectedAndSave = (event) => {
				if (this._measureState.type === InteractionStateType.DRAW) {
					setSelection([event.feature.getId()]);
				}

				this._storedContent = createKML(layer, 'EPSG:3857');
				this._save();
			};

			const registerListeners = (layer) => {
				this._mapListeners.push(layer.getSource().on('addfeature', setSelectedAndSave));
				this._mapListeners.push(
					layer.getSource().on('changefeature', () => {
						updateContent();
					})
				);
				this._mapListeners.push(
					layer.getSource().on('removefeature', () => {
						updateContent();
					})
				);
				this._mapListeners.push(this._map.getView().on('change:resolution', () => onResolutionChange(layer)));
			};
			// eslint-disable-next-line promise/prefer-await-to-then
			addOldFeatures(layer, oldLayer)
				// eslint-disable-next-line promise/prefer-await-to-then
				.finally(() => {
					this._storedContent = createKML(layer, 'EPSG:3857');
					this._save();
					registerListeners(layer);
				});
			return layer;
		};

		const clickHandler = (event) => {
			const coordinate = event.coordinate;
			const dragging = event.dragging;
			const pixel = event.pixel;

			if (this._sketchHandler.isActive || this._measureState.type === InteractionStateType.DRAW) {
				this._updateMeasureState(coordinate, pixel, dragging);
				return;
			}
			const addToSelection = (features) => {
				if ([InteractionStateType.MODIFY, InteractionStateType.SELECT].includes(this._measureState.type)) {
					const ids = features.map((f) => f.getId());
					setSelection(ids);
					this._updateStatistics();
					this._updateMeasureState(coordinate, pixel, dragging);
				}
			};

			const changeTool = (features) => {
				const changeToMeasureTool = (features) => {
					return features.some((f) => f.getId().startsWith(Tools.DRAW + '_'));
				};
				if (changeToMeasureTool(features)) {
					const drawIds = features.filter((f) => f.getId().startsWith(Tools.DRAW + '_')).map((f) => f.getId());
					setDrawSelection(drawIds);
					setCurrentTool(Tools.DRAW);
				}
			};

			const isToolChangeNeeded = (features) => {
				return features.some((f) => !f.getId().startsWith(Tools.MEASURE + '_'));
			};
			const selectableFeatures = getSelectableFeatures(this._map, this._vectorLayer, pixel);
			const clickAction = isToolChangeNeeded(selectableFeatures) ? changeTool : addToSelection;

			clickAction(selectableFeatures);
		};

		const pointerUpHandler = () => {
			const draggingOverlay = getOverlays(this._vectorLayer).find((o) => o.get('dragging') === true);
			if (draggingOverlay) {
				draggingOverlay.set('dragging', false);
			}
		};

		const pointerMoveHandler = (event) => {
			this._lastPointerMoveEvent = event;

			const coordinate = event.coordinate;
			const dragging = event.dragging;
			const pixel = event.pixel;
			this._updateMeasureState(coordinate, pixel, dragging);
		};
		if (this._draw === false) {
			this._map = olMap;
			this._mapContainer = olMap.getTarget();
			this._vectorLayer = getOrCreateLayer();
			const source = this._vectorLayer.getSource();
			this._select = this._createSelect();
			this._select.setActive(false);
			this._modify = this._createModify();
			this._modify.setActive(false);
			this._draw = this._createDraw(source);
			this._snap = new Snap({ source: source, pixelTolerance: getSnapTolerancePerDevice() });
			this._onMeasureStateChanged((measureState) => this._updateMeasurementMode(measureState));
			if (!this._environmentService.isTouch()) {
				this._helpTooltip.activate(this._map);
				this._onMeasureStateChanged((measureState) => {
					this._helpTooltip.notify(measureState);
					if (measureState.snap === InteractionSnapType.VERTEX) {
						this._mapContainer.classList.add('grab');
					} else {
						this._mapContainer.classList.remove('grab');
					}
				});
			}

			this._mapListeners.push(olMap.on(MapBrowserEventType.CLICK, clickHandler));
			this._mapListeners.push(olMap.on(MapBrowserEventType.POINTERMOVE, pointerMoveHandler));
			this._mapListeners.push(olMap.on(MapBrowserEventType.POINTERUP, pointerUpHandler));
			this._mapListeners.push(olMap.on(MapBrowserEventType.DBLCLICK, () => false));
			this._registeredObservers = this._register(this._storeService.getStore());
			this._keyActionMapper.activate();

			olMap.addInteraction(this._select);
			olMap.addInteraction(this._modify);
			olMap.addInteraction(this._draw);
			olMap.addInteraction(this._snap);

			this._storedContent = null;
		}

		this._updateMeasureState();
		return this._vectorLayer;
	}

	/**
	 *  @override
	 *  @param {ol.Map} olMap
	 */
	onDeactivate(olMap) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later
		olMap.removeInteraction(this._draw);
		olMap.removeInteraction(this._modify);
		olMap.removeInteraction(this._snap);
		olMap.removeInteraction(this._select);

		this._helpTooltip.deactivate();

		this._unreg(this._mapListeners);
		this._unreg(this._measureStateChangedListeners);
		this._unreg(this._drawingListeners);
		this._unsubscribe(this._registeredObservers);
		this._keyActionMapper.deactivate();

		this._convertToPermanentLayer();
		this._vectorLayer
			.getSource()
			.getFeatures()
			.forEach((f) => this._overlayService.remove(f, this._map));
		setSelection([]);
		setStatistic({ length: null, area: null });

		this._draw = false;
		this._modify = false;
		this._select = false;
		this._snap = false;
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

	_setMeasureState(value) {
		if (value !== this._measureState) {
			this._measureState = value;
			this._measureStateChangedListeners.forEach((l) => l(value));
		}
	}

	_onMeasureStateChanged(listener) {
		this._measureStateChangedListeners.push(listener);
	}

	_register(store) {
		return [
			observe(
				store,
				(state) => state.measurement.finish,
				() => this._finish()
			),
			observe(
				store,
				(state) => state.measurement.reset,
				() => this._startNew()
			),
			observe(
				store,
				(state) => state.measurement.remove,
				() => this._remove()
			),
			observe(
				store,
				(state) => state.measurement.selection,
				(ids) => this._setSelection(ids)
			)
		];
	}

	_remove() {
		if (this._draw && this._draw.getActive()) {
			this._draw.removeLastPoint();
			if (this._sketchHandler.pointCount === 1) {
				this._startNew();
			}
			if (this._lastPointerMoveEvent) {
				this._draw.handleEvent(this._lastPointerMoveEvent);
			}
		}

		if (this._modify && this._modify.getActive()) {
			const additionalRemoveAction = (f) => this._overlayService.remove(f, this._map);
			removeSelectedFeatures(this._select.getFeatures(), this._vectorLayer, additionalRemoveAction);
			this._setSelection([]);
			this._updateStatistics();
			this._updateMeasureState();
		}
	}

	_finish() {
		if (this._draw.getActive()) {
			if (this._sketchHandler.isActive) {
				this._draw.finishDrawing();
				this._updateMeasureState();
			} else {
				this._activateModify(null);
			}
		}
	}

	_startNew() {
		if (this._draw.getActive()) {
			this._draw.abortDrawing();
		}
		this._draw.setActive(true);
		setSelection([]);
		setStatistic({ length: 0, area: 0 });
		this._modify.setActive(false);
		this._helpTooltip.deactivate();
		this._helpTooltip.activate(this._map);
		this._updateMeasureState();
	}

	_createDraw(source) {
		const draw = new Draw({
			source: source,
			type: 'Polygon',
			minPoints: 2,
			snapTolerance: getSnapTolerancePerDevice(),
			style: createSketchStyleFunction(this._styleService.getStyleFunction(StyleTypes.MEASURE))
		});

		const finishDistanceOverlay = (event) => {
			const geometry = event.feature.getGeometry();
			const distanceOverlay = event.feature.get('measurement');
			distanceOverlay.getElement().static = true;
			if (geometry instanceof Polygon && !this._sketchHandler.isFinishOnFirstPoint) {
				const lineCoordinates = geometry.getCoordinates()[0].slice(0, -1);
				event.feature.setGeometry(new LineString(lineCoordinates));
			}
			this._sketchHandler.deactivate();
			this._unreg(this._drawingListeners);
		};

		draw.on('drawstart', (event) => {
			const onFeatureChange = (event) => {
				const measureGeometry = this._createMeasureGeometry(event.target, true);
				this._overlayService.update(event.target, this._map, StyleTypes.MEASURE, { geometry: measureGeometry });
				this._setStatistics(event.target);
			};

			const onResolutionChange = () => {
				const measureGeometry = this._createMeasureGeometry(this._sketchHandler.active, true);
				this._overlayService.update(this._sketchHandler.active, this._map, StyleTypes.MEASURE, { geometry: measureGeometry });
			};

			this._sketchHandler.activate(event.feature, Tools.MEASURE + '_');
			this._overlayService.add(this._sketchHandler.active, this._map, StyleTypes.MEASURE);
			this._drawingListeners.push(event.feature.on('change', onFeatureChange));
			this._drawingListeners.push(this._map.getView().on('change:resolution', onResolutionChange));
		});

		draw.on('drawabort', (event) => this._overlayService.remove(event.feature, this._map));

		draw.on('drawend', (event) => {
			finishDistanceOverlay(event);
			this._styleService.addStyle(event.feature, this._map, this._vectorLayer);
			this._activateModify(event.feature);
		});

		return draw;
	}

	_createSelect() {
		const select = new Select(getSelectOptions(this._vectorLayer));
		const getResolution = () => this._map.getView().getResolution();
		select.getFeatures().on('change:length', this._updateStatistics);
		select.getFeatures().on('add', (e) => {
			const feature = e.element;
			const styleFunction = selectStyleFunction();
			const styles = styleFunction(feature, getResolution());
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
		this._draw.setActive(false);
		this._modify.setActive(true);
		this._modifyActivated = true;
		if (feature) {
			const onFeatureChange = (event) => {
				const measureGeometry = this._createMeasureGeometry(event.target);
				this._overlayService.update(event.target, this._map, StyleTypes.MEASURE, { geometry: measureGeometry });
				this._updateStatistics();
			};
			feature.on('change', onFeatureChange);
		}
	}

	_setStatistics(feature) {
		const stats = getStats(feature.getGeometry());
		if (!this._sketchHandler.isFinishOnFirstPoint) {
			// As long as the draw-interaction is active, the current geometry is a closed and maybe invalid Polygon
			// (snapping from pointer-position to first point) and must be corrected into a valid LineString
			const measureGeometry = this._createMeasureGeometry(feature, this._draw.getActive());
			const nonAreaStats = getStats(measureGeometry);
			setStatistic({ length: nonAreaStats.length, area: stats.area });
		} else {
			setStatistic({ length: stats.length, area: stats.area });
		}
	}

	_updateStatistics() {
		const startStatistic = { length: null, area: null };
		const sumStatistic = (before, feature) => {
			const stats = getStats(feature.getGeometry());
			return {
				length: before.length + stats.length,
				area: before.area + stats.area
			};
		};
		if (this._select) {
			const features = this._select.getFeatures().getArray();
			setStatistic(features.reduce(sumStatistic, startStatistic));
		}
	}

	_updateMeasurementMode(measureState) {
		if (this._lastInteractionStateType !== measureState.type && measureState.type !== InteractionStateType.OVERLAY) {
			this._lastInteractionStateType = measureState.type;
			setMode(this._lastInteractionStateType);
		}
	}

	_createMeasureGeometry(feature, isDrawing = false) {
		if (feature.getGeometry() instanceof Polygon) {
			const lineCoordinates = isDrawing ? feature.getGeometry().getCoordinates()[0].slice(0, -1) : feature.getGeometry().getCoordinates(false)[0];

			if (!this._sketchHandler.isFinishOnFirstPoint) {
				return new LineString(lineCoordinates);
			}
		}
		return feature.getGeometry();
	}

	_updateMeasureState(coordinate, pixel, dragging) {
		const measureState = {
			type: null,
			snap: null,
			coordinate: coordinate,
			pointCount: this._sketchHandler.pointCount
		};

		if (pixel) {
			measureState.snap = getSnapState(this._map, this._vectorLayer, pixel);
		}

		if (this._draw.getActive()) {
			measureState.type = InteractionStateType.ACTIVE;

			if (this._sketchHandler.isActive) {
				measureState.type = InteractionStateType.DRAW;

				if (this._sketchHandler.isFinishOnFirstPoint) {
					measureState.snap = InteractionSnapType.FIRSTPOINT;
				} else if (this._sketchHandler.isSnapOnLastPoint) {
					measureState.snap = InteractionSnapType.LASTPOINT;
				}
			}
		}

		if (this._modify.getActive()) {
			measureState.type = this._select.getFeatures().getLength() === 0 ? InteractionStateType.SELECT : InteractionStateType.MODIFY;
			measureState.geometryType = this._select.getFeatures().getLength() === 0 ? null : this._select.getFeatures().item(0)?.getGeometry().getType();
		}

		const dragableOverlay = getOverlays(this._vectorLayer).find((o) => o.get('dragable') === true);
		if (dragableOverlay) {
			measureState.type = InteractionStateType.OVERLAY;
		}
		const draggingOverlay = getOverlays(this._vectorLayer).find((o) => o.get('dragging') === true);
		if (draggingOverlay) {
			draggingOverlay.setOffset([0, 0]);
			draggingOverlay.set('manualPositioning', true);
			draggingOverlay.setPosition(coordinate);

			const parentFeature = draggingOverlay.get('feature');
			parentFeature.dispatchEvent('propertychange');
		}

		measureState.dragging = dragging;
		if (coordinate == null && pixel == null) {
			if (this._measureState.type === InteractionStateType.MODIFY) {
				measureState.type = InteractionStateType.SELECT;
			}
			if (this._measureState.type == null) {
				const hasFeature = this._vectorLayer.getSource().getFeatures().length > 0;
				measureState.type = hasFeature ? InteractionStateType.SELECT : measureState.type;
			}
		}
		this._setMeasureState(measureState);
	}

	_setSelection(ids = []) {
		const clear = () => {
			if (this._select) {
				this._select.getFeatures().clear();
			}
		};
		const fill = (ids) => {
			ids.forEach((id) => {
				const feature = this._vectorLayer.getSource().getFeatureById(id);
				const hasFeature = this._select.getFeatures().getArray().includes(feature);
				if (feature && !hasFeature) {
					this._select.getFeatures().push(feature);
				}
			});
		};
		const action = ids.length === 0 ? clear : fill;
		action(ids);
	}

	async _save() {
		/**
		 * The stored content will be created/updated after adding/changing and removing features,
		 * while interacting with the layer.
		 */
		const fileSaveResult = await this._storageHandler.store(this._storedContent, FileStorageServiceDataTypes.KML);
		setFileSaveResult(fileSaveResult ? { fileSaveResult, content: this._storedContent } : null);
	}

	async _convertToPermanentLayer() {
		const translate = (key) => this._translationService.translate(key);
		const label = translate('olMap_handler_draw_layer_label');

		if (!this._storageHandler.isValid()) {
			await this._save();
		}
		if (this._storedContent) {
			const id = this._storageHandler.getStorageId();
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
			addLayer(id, { constraints: { metaData: false } });
		}
	}

	static get Debounce_Delay() {
		return Debounce_Delay;
	}
}
