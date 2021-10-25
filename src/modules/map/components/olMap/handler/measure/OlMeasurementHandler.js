import { DragPan, Draw, Modify, Select, Snap } from 'ol/interaction';
import { MapBrowserEvent } from 'ol';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import { LineString, Polygon } from 'ol/geom';
import { $injector } from '../../../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { setStatistic, setMode } from '../../../../../../store/measurement/measurement.action';
import { addLayer, removeLayer } from '../../../../../../store/layers/layers.action';
import { createSketchStyleFunction, selectStyleFunction } from '../../olStyleUtils';
import { getGeometryLength, getArea } from '../../olGeometryUtils';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { observe } from '../../../../../../utils/storeUtils';
import { HelpTooltip } from './../../HelpTooltip';
import { provide as messageProvide } from './tooltipMessage.provider';
import { create as createKML, readFeatures } from '../../formats/kml';
import { debounced } from '../../../../../../utils/timer';
import { VectorGeoResource, VectorSourceType } from '../../../../../../services/domain/geoResources';
import { saveManualOverlayPosition } from './MeasurementOverlayStyle';
import { getOverlays } from '../../OverlayStyle';
import { StyleTypes } from '../../services/StyleService';
import { FileStorageServiceDataTypes } from '../../../../../../services/FileStorageService';
import { getModifyOptions, getSelectableFeatures, getSelectOptions, getSnapState, getSnapTolerancePerDevice, InteractionSnapType, InteractionStateType, removeSelectedFeatures } from '../../olInteractionUtils';
import { isEmptyLayer } from '../../olMapUtils';
import { emitNotification } from '../../../../../../store/notifications/notifications.action';
import { LevelTypes } from '../../../../../../store/notifications/notifications.reducer';
import { OlSketchHandler } from '../OlSketchHandler';
import { MEASUREMENT_LAYER_ID, MEASUREMENT_TOOL_ID } from '../../../../../../plugins/MeasurementPlugin';
import { simulateMapEvent } from '../../../../../../../test/modules/map/components/olMap/mapTestUtils';

const Debounce_Delay = 1000;

const Temp_Session_Id = 'temp_measure_id';

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
		const { TranslationService, MapService, EnvironmentService, StoreService, GeoResourceService, OverlayService, StyleService, MeasurementStorageService } = $injector.inject('TranslationService', 'MapService', 'EnvironmentService', 'StoreService', 'GeoResourceService', 'OverlayService', 'StyleService', 'MeasurementStorageService');
		this._translationService = TranslationService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._storeService = StoreService;
		this._geoResourceService = GeoResourceService;
		this._overlayService = OverlayService;
		this._styleService = StyleService;
		this._storageHandler = MeasurementStorageService;

		this._vectorLayer = null;
		this._draw = false;
		this._storedContent = null;

		this._sketchHandler = new OlSketchHandler();
		this._listeners = [];

		this._projectionHints = { fromProjection: 'EPSG:' + this._mapService.getSrid(), toProjection: 'EPSG:' + this._mapService.getDefaultGeodeticSrid() };
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
		this._registeredObservers = this._register(this._storeService.getStore());
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {

		const getOldLayer = (map) => {
			return map.getLayers().getArray().find(l => l.get('id') && (
				this._storageHandler.isStorageId(l.get('id')) ||
				l.get('id') === Temp_Session_Id));
		};

		const createLayer = () => {
			const translate = (key) => this._translationService.translate(key);
			const source = new VectorSource({ wrapX: false });
			const layer = new VectorLayer({
				source: source,
				style: this._styleService.getStyleFunction(StyleTypes.MEASURE)
			});
			layer.label = translate('map_olMap_handler_measure_layer_label');
			return layer;
		};

		const addOldFeatures = async (layer, oldLayer) => {
			if (oldLayer) {

				const vgr = this._geoResourceService.byId(oldLayer.get('id'));
				if (vgr) {

					this._storageHandler.setStorageId(oldLayer.get('id'));
					vgr.getData().then(data => {
						const oldFeatures = readFeatures(data);
						const onFeatureChange = (event) => {
							const measureGeometry = this._createMeasureGeometry(event.target);
							this._styleService.updateStyle(event.target, olMap, { geometry: measureGeometry }, StyleTypes.MEASURE);
							this._setStatistics(event.target);
						};
						oldFeatures.forEach(f => {
							f.getGeometry().transform('EPSG:' + vgr.srid, 'EPSG:' + this._mapService.getSrid());
							f.set('srid', this._mapService.getSrid(), true);
							layer.getSource().addFeature(f);
							this._styleService.removeStyle(f, olMap);
							this._styleService.addStyle(f, olMap);
							f.on('change', onFeatureChange);
						});
					})
						.then(() => removeLayer(oldLayer.get('id')))
						.then(() => this._finish());
				}
			}
		};

		const onResolutionChange = (olLayer) => {
			olLayer.getSource().getFeatures().forEach(f => {
				const measureGeometry = this._createMeasureGeometry(f);
				this._styleService.updateStyle(f, olMap, { geometry: measureGeometry }, StyleTypes.MEASURE);
			});
		};

		const getOrCreateLayer = () => {
			const oldLayer = getOldLayer(this._map);
			const layer = createLayer();
			addOldFeatures(layer, oldLayer);
			const saveDebounced = debounced(Debounce_Delay, () => this._save());
			this._listeners.push(layer.getSource().on('addfeature', () => this._save()));
			this._listeners.push(layer.getSource().on('changefeature', () => saveDebounced()));
			this._listeners.push(layer.getSource().on('removefeature', () => saveDebounced()));
			this._listeners.push(this._map.getView().on('change:resolution', () => onResolutionChange(layer)));
			return layer;
		};

		const clickHandler = (event) => {
			const coordinate = event.coordinate;
			const dragging = event.dragging;
			const pixel = event.pixel;
			this._updateMeasureState(coordinate, pixel, dragging);
			const selectableFeatures = getSelectableFeatures(this._map, this._vectorLayer, pixel);
			if (this._measureState.type === InteractionStateType.MODIFY && selectableFeatures.length === 0 && !this._modifyActivated) {
				this._select.getFeatures().clear();
				setStatistic({ length: 0, area: 0 });
				this._setMeasureState({ ...this._measureState, type: InteractionStateType.SELECT, snap: null });
			}

			if ([InteractionStateType.MODIFY, InteractionStateType.SELECT].includes(this._measureState.type) && selectableFeatures.length > 0) {
				selectableFeatures.forEach(f => {
					const hasFeature = this._select.getFeatures().getArray().includes(f);
					if (!hasFeature) {
						this._select.getFeatures().push(f);
					}
				});
			}
			this._modifyActivated = false;
		};

		const pointerUpHandler = () => {
			const draggingOverlay = getOverlays(this._vectorLayer).find(o => o.get('dragging') === true);
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
			this._dragPan = new DragPan();
			this._dragPan.setActive(false);
			this._onMeasureStateChanged((measureState) => this._updateMeasurementMode(measureState));
			if (!this._environmentService.isTouch()) {
				this._helpTooltip.activate(this._map);
				this._onMeasureStateChanged((measureState) => {
					this._helpTooltip.notify(measureState);
					if (measureState.snap === InteractionSnapType.VERTEX) {
						this._mapContainer.classList.add('grab');
					}
					else {
						this._mapContainer.classList.remove('grab');
					}
				});
			}

			this._listeners.push(olMap.on(MapBrowserEventType.CLICK, clickHandler));
			this._listeners.push(olMap.on(MapBrowserEventType.POINTERMOVE, pointerMoveHandler));
			this._listeners.push(olMap.on(MapBrowserEventType.POINTERUP, pointerUpHandler));
			this._listeners.push(olMap.on(MapBrowserEventType.DBLCLICK, () => false));
			this._listeners.push(document.addEventListener('keyup', (e) => this._removeLast(e)));

			olMap.addInteraction(this._select);
			olMap.addInteraction(this._modify);
			olMap.addInteraction(this._draw);
			olMap.addInteraction(this._snap);
			olMap.addInteraction(this._dragPan);

			this._storedContent = null;
		}
		return this._vectorLayer;
	}

	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	onDeactivate(olMap) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later
		olMap.removeInteraction(this._draw);
		olMap.removeInteraction(this._modify);
		olMap.removeInteraction(this._snap);
		olMap.removeInteraction(this._select);
		olMap.removeInteraction(this._dragPan);

		this._helpTooltip.deactivate();

		this._unreg(this._listeners);
		this._unreg(this._registeredObservers);
		this._unreg(this._measureStateChangedListeners);

		this._convertToPermanentLayer();
		this._vectorLayer.getSource().getFeatures().forEach(f => this._overlayService.remove(f, this._map));

		setStatistic({ length: 0, area: 0 });

		this._draw = false;
		this._modify = false;
		this._select = false;
		this._snap = false;
		this._dragPan = false;
		this._map = null;
	}

	_unreg(listeners) {
		unByKey(listeners);
		listeners = [];
	}

	_setMeasureState(value) {
		if (value !== this._measureState) {
			this._measureState = value;
			this._measureStateChangedListeners.forEach(l => l(value));
		}
	}

	_onMeasureStateChanged(listener) {
		this._measureStateChangedListeners.push(listener);
	}

	_register(store) {
		return [
			observe(store, state => state.measurement.finish, () => this._finish()),
			observe(store, state => state.measurement.reset, () => this._startNew()),
			observe(store, state => state.measurement.remove, () => this._remove())];
	}

	_removeLast(event) {
		if ((event.which === 46 || event.keyCode === 46) && !/^(input|textarea)$/i.test(event.target.nodeName)) {
			this._remove();
		}
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
		}
	}

	_finish() {
		if (this._draw.getActive()) {
			if (this._sketchHandler.isActive) {
				this._draw.finishDrawing();
				this._simulateClickEvent();
			}
			else {
				this._activateModify(null);
			}
		}
	}

	_startNew() {
		if (this._draw.getActive()) {
			this._draw.abortDrawing();
		}
		this._draw.setActive(true);
		this._select.getFeatures().clear();
		this._modify.setActive(false);
		this._helpTooltip.deactivate();
		this._helpTooltip.activate(this._map);
		this._simulateClickEvent();
	}

	_createDraw(source) {
		const draw = new Draw({
			source: source,
			type: 'Polygon',
			minPoints: 2,
			snapTolerance: getSnapTolerancePerDevice(),
			style: createSketchStyleFunction(this._styleService.getStyleFunction(StyleTypes.MEASURE))
		});

		let listener;
		let zoomListener;

		const finishDistanceOverlay = (event) => {
			const geometry = event.feature.getGeometry();
			const distanceOverlay = event.feature.get('measurement');
			distanceOverlay.getElement().static = true;
			if (geometry instanceof Polygon && !this._sketchHandler.isFinishOnFirstPoint) {
				const lineCoordinates = geometry.getCoordinates()[0].slice(0, -1);
				event.feature.setGeometry(new LineString(lineCoordinates));
			}
			this._sketchHandler.deactivate();
			unByKey(listener);
			unByKey(zoomListener);
		};

		draw.on('drawstart', event => {
			const onFeatureChange = (event) => {
				const measureGeometry = this._createMeasureGeometry(event.target, true);
				this._overlayService.update(event.target, this._map, StyleTypes.MEASURE, { geometry: measureGeometry });
				this._setStatistics(event.target);
			};

			const onResolutionChange = () => {
				const measureGeometry = this._createMeasureGeometry(this._sketchHandler.active, true);
				this._overlayService.update(this._sketchHandler.active, this._map, StyleTypes.MEASURE, { geometry: measureGeometry });
			};

			this._sketchHandler.activate(event.feature);
			this._sketchHandler.active.setId(MEASUREMENT_TOOL_ID + '_' + new Date().getTime());
			this._overlayService.add(this._sketchHandler.active, this._map, StyleTypes.MEASURE);
			listener = event.feature.on('change', onFeatureChange);
			zoomListener = this._map.getView().on('change:resolution', onResolutionChange);

		});

		draw.on('drawabort', event => this._overlayService.remove(event.feature, this._map));

		draw.on('drawend', event => {
			finishDistanceOverlay(event);
			this._styleService.addStyle(event.feature, this._map);
			this._activateModify(event.feature);
		}
		);

		return draw;
	}

	_createSelect() {
		const select = new Select(getSelectOptions(this._vectorLayer));
		select.getFeatures().on('change:length', this._updateStatistics);
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
		modify.on('modifyend', event => {
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
			this._select.getFeatures().push(feature);
			const onFeatureChange = (event) => {
				const measureGeometry = this._createMeasureGeometry(event.target);
				this._overlayService.update(event.target, this._map, StyleTypes.MEASURE, { geometry: measureGeometry });
				this._updateStatistics();
			};
			feature.on('change', onFeatureChange);
		}
	}

	_setStatistics(feature) {
		const length = getGeometryLength(feature.getGeometry(), this._projectionHints);
		const area = getArea(feature.getGeometry(), this._projectionHints);
		setStatistic({ length: length, area: area });
	}

	_updateStatistics() {
		let length = 0;
		let area = 0;
		if (this._select) {
			this._select.getFeatures().forEach(f => {
				length = length + getGeometryLength(f.getGeometry(), this._projectionHints);
				area = area + getArea(f.getGeometry(), this._projectionHints);
			});
			setStatistic({ length: length, area: area });
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
			const lineCoordinates = isDrawing ? feature.getGeometry().getCoordinates()[0].slice(0, -1) : feature.getGeometry().getCoordinates()[0];

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

		measureState.snap = getSnapState(this._map, this._vectorLayer, pixel);
		if (this._draw.getActive()) {
			measureState.type = InteractionStateType.ACTIVE;

			if (this._sketchHandler.isActive) {
				measureState.type = InteractionStateType.DRAW;

				if (this._sketchHandler.isFinishOnFirstPoint) {
					measureState.snap = InteractionSnapType.FIRSTPOINT;
				}
				else if (this._sketchHandler.isSnapOnLastPoint) {
					measureState.snap = InteractionSnapType.LASTPOINT;
				}
			}
		}

		if (this._modify.getActive()) {
			measureState.type = this._select.getFeatures().getLength() === 0 ? InteractionStateType.SELECT : InteractionStateType.MODIFY;
		}
		const dragableOverlay = getOverlays(this._vectorLayer).find(o => o.get('dragable') === true);
		if (dragableOverlay) {
			measureState.type = InteractionStateType.OVERLAY;
		}

		if (!this._dragPan.getActive()) {
			const draggingOverlay = getOverlays(this._vectorLayer).find(o => o.get('dragging') === true);
			if (draggingOverlay) {
				draggingOverlay.setOffset([0, 0]);
				draggingOverlay.set('manualPositioning', true);
				draggingOverlay.setPosition(coordinate);

				const parentFeature = draggingOverlay.get('feature');
				parentFeature.dispatchEvent('propertychange');
			}
		}

		measureState.dragging = dragging;
		this._setMeasureState(measureState);
	}


	/**
	 * todo: redundant with OlDrawHandler, possible responsibility of a statefull _storageHandler
	 */
	async _save() {
		const features = this._vectorLayer.getSource().getFeatures();
		features.forEach(f => saveManualOverlayPosition(f));

		const newContent = createKML(this._vectorLayer, 'EPSG:3857');
		this._storageHandler.store(newContent, FileStorageServiceDataTypes.KML);
		this._storedContent = newContent;
	}

	/**
	 * todo: redundant with OlDrawHandler, possible responsibility of a statefull _storageHandler
	 */
	async _convertToPermanentLayer() {
		const translate = (key) => this._translationService.translate(key);
		const label = translate('map_olMap_handler_measure_layer_label');

		if (isEmptyLayer(this._vectorLayer)) {
			console.warn('Cannot store empty layer');
			return;
		}


		if (!this._storageHandler.isValid()) {
			await this._save();
		}

		const createTempIdAndWarn = () => {
			// TODO: offline-support is needed to properly working with temporary ids
			console.warn('Could not store layer-data. The data will get lost after this session.');
			emitNotification(translate('map_olMap_handler_storage_offline'), LevelTypes.WARN);
			return Temp_Session_Id;
		};

		const id = this._storageHandler.getStorageId() ? this._storageHandler.getStorageId() : createTempIdAndWarn();

		const getOrCreateVectorGeoResource = () => {
			const fromService = this._geoResourceService.byId(id);
			return fromService ? fromService : new VectorGeoResource(id, label, VectorSourceType.KML);
		};
		const vgr = getOrCreateVectorGeoResource();
		vgr.setSource(this._storedContent, 4326);

		//register georesource
		this._geoResourceService.addOrReplace(vgr);
		//add a layer that displays the georesource in the map
		addLayer(id, { label: label });
	}

	static get Debounce_Delay() {
		return Debounce_Delay;
	}


	/**
	 * Workaround for touch-devices to refresh measure-state and
	 * measure-mode, after the user calls measurement-actions (reset/remove/finish) without
	 * any further detected pointer-moves and -clicks
	 */
	_simulateClickEvent() {
		const view = this._map.getView();
		if (view) {
			const x = view.getCenter()[0];
			const y = view.getCenter()[1];
			simulateMapEvent(this._map, MapBrowserEventType.CLICK, x, y);
		}
	}

}
