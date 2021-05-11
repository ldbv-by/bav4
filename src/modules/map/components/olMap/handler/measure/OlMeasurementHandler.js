import { DragPan, Draw, Modify, Select, Snap } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import { LineString, Polygon } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { $injector } from '../../../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { MeasurementOverlayTypes } from './MeasurementOverlay';
import { setStatistic } from '../../../../store/measurement.action';
import { addLayer, removeLayer } from '../../../../store/layers.action';
import { measureStyleFunction, modifyStyleFunction, createSketchStyleFunction, createSelectStyleFunction } from './StyleUtils';
import { OverlayManager } from './OverlayManager';
import { getPartitionDelta, isVertexOfGeometry, getGeometryLength, getArea } from './GeometryUtils';
import { MeasurementOverlay } from './MeasurementOverlay';
import { noModifierKeys, singleClick } from 'ol/events/condition';
import MapBrowserEventType from 'ol/MapBrowserEventType';
import { MEASUREMENT_LAYER_ID } from '../../../../store/MeasurementPlugin';
import { observe } from '../../../../../../utils/storeUtils';
import { HelpTooltip } from './HelpTooltip';
import { KML } from 'ol/format';
import { debounced } from '../../../../../../utils/timer';
import { FileStorageServiceDataTypes } from '../../../../../../services/FileStorageService';
import { VectorGeoResource, VectorSourceType } from '../../../../../../services/domain/geoResources';

if (!window.customElements.get(MeasurementOverlay.tag)) {
	window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);
}


export const MeasureStateType = {
	ACTIVE: 'active',
	DRAW: 'draw',
	MODIFY: 'modify',
	SELECT: 'select',
	OVERLAY: 'overlay'
};

export const MeasureSnapType = {
	FIRSTPOINT: 'firstPoint',
	LASTPOINT: 'lastPoint',
	VERTEX: 'vertex',
	EGDE: 'edge',
	FACE: 'face'
};

const Debounce_Delay = 1000;

/**
 * Handler for measurement-interaction with the map
 * 
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class OlMeasurementHandler extends OlLayerHandler {
	constructor() {
		super(MEASUREMENT_LAYER_ID);
		const { TranslationService, MapService, EnvironmentService, StoreService, GeoResourceService, FileStorageService } = $injector.inject('TranslationService', 'MapService', 'EnvironmentService', 'StoreService', 'GeoResourceService', 'FileStorageService');
		this._translationService = TranslationService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._storeService = StoreService;
		this._geoResourceService = GeoResourceService;
		this._fileStorageService = FileStorageService;
		this._vectorLayer = null;
		this._draw = false;
		this._activeSketch = null;

		this._isFinishOnFirstPoint = false;
		this._isSnapOnLastPoint = false;
		this._pointCount = 0;
		this._listeners = [];

		this._projectionHints = { fromProjection: 'EPSG:' + this._mapService.getSrid(), toProjection: 'EPSG:' + this._mapService.getDefaultGeodeticSrid() };
		this._lastPointerMoveEvent = null;
		this._overlayManager = new OverlayManager();
		this._measureState = {
			type: null,
			snap: null,
			coordinate: null,
			pointCount: this._pointCount,
			dragging: false
		};
		this._helpTooltip = new HelpTooltip(this._overlayManager);
		this._measureStateChangedListeners = [];
		this._registeredObservers = this._register(this._storeService.getStore());
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	onActivate(olMap) {
		const visibleChangedHandler = (event) => {
			const layer = event.target;
			const isVisibleStyle = layer.getVisible() ? '' : 'none';
			this._overlayManager.apply(o => o.getElement().style.display = isVisibleStyle);
		};

		const opacityChangedHandler = (event) => {
			const layer = event.target;
			this._overlayManager.apply(o => o.getElement().style.opacity = layer.getOpacity());
		};

		const getOldLayer = (map) => {
			if (this._lastMeasurementId) {
				return map.getLayers().getArray().find(l => l.get('id') === this._lastMeasurementId );
			}
			return null;
		};

		const createLayer = () => {
			const source = new VectorSource({ wrapX: false });
			const layer = new VectorLayer({
				source: source,
				style: measureStyleFunction
			});			
			return layer;
		};
		
		const addOldFeatures = async(layer, oldLayer) => {
			if (oldLayer) {
				
				const vgr = this._geoResourceService.byId(oldLayer.get('id'));
				if (vgr) {		
					vgr.getData().then(data => {
						const format = new KML({ writeStyles: true });						
						const oldFeatures = format.readFeatures(data);								
						oldFeatures.forEach(f =>  {
							f.setStyle(measureStyleFunction(f));
							f.getGeometry().transform('EPSG:' + vgr.srid, 'EPSG:' + this._mapService.getSrid());
							f.set('srid', this._mapService.getSrid(), true);
							layer.getSource().addFeature(f);
							this._createMeasureTooltip(f);
							this._createAreaToolTip(f);
						});											
					}).then(() => removeLayer( oldLayer.get('id')));
				}				
			}
		};
		const getOrCreateLayer = () => {
			const  oldLayer = getOldLayer(this._map);
			const layer = createLayer();
			addOldFeatures(layer, oldLayer);
			const saveDebounced = debounced(Debounce_Delay, () => this._save());
			this._listeners.push(layer.on('change:visible', visibleChangedHandler));
			this._listeners.push(layer.on('change:opacity', opacityChangedHandler));
			this._listeners.push(layer.getSource().on('addfeature', () => this._save()));
			this._listeners.push(layer.getSource().on('changefeature', () => saveDebounced())); 
			this._listeners.push(layer.getSource().on('removefeature', () => saveDebounced()));
			return layer;
		};

		const clickHandler = (event) => {
			const coordinate = event.coordinate;
			const dragging = event.dragging;
			const pixel = event.pixel;
			this._updateMeasureState(coordinate, pixel, dragging);
			const selectableFeatures = this._getSelectableFeatures(pixel);
			if (this._measureState.type === MeasureStateType.MODIFY && selectableFeatures.length === 0 && !this._modifyActivated) {
				this._select.getFeatures().clear();
				setStatistic({ length: 0, area: 0 });
				this._setMeasureState({ ...this._measureState, type: MeasureStateType.ACTIVE, snap: null });
			}

			if ([MeasureStateType.MODIFY, MeasureStateType.SELECT].includes(this._measureState.type) && selectableFeatures.length > 0) {
				selectableFeatures.forEach(f => {
					const hasFeature = this._isInCollection(f, this._select.getFeatures());
					if (!hasFeature) {
						this._select.getFeatures().push(f);
					}
				});
			}
			this._modifyActivated = false;
		};

		const pointerUpHandler = () => {
			const draggingOverlay = this._overlayManager.getOverlays().find(o => o.get('dragging') === true);
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
			this._snap = new Snap({ source: source, pixelTolerance: this._getSnapTolerancePerDevice() });
			this._dragPan = new DragPan();
			this._dragPan.setActive(false);
			this._overlayManager.activate(this._map);

			if (!this._environmentService.isTouch()) {
				this._helpTooltip.activate();
				this._onMeasureStateChanged((measureState) => this._helpTooltip.notify(measureState));
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
		this._overlayManager.deactivate();

		setStatistic({ length: 0, area: 0 });

		this._unreg(this._listeners);
		this._unreg(this._registeredObservers);
		this._unreg(this._measureStateChangedListeners);

		this._convertToPermanentLayer();

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
			observe(store, state => state.measurement.reset, () => this._startNew()),
			observe(store, state => state.measurement.remove, () => this._removeSelectedFeatures())];
	}


	_removeLast(event) {
		if (this._draw && this._draw.getActive()) {
			if ((event.which === 46 || event.keyCode === 46) && !/^(input|textarea)$/i.test(event.target.nodeName)) {
				this._draw.removeLastPoint();
				if (this._pointCount === 2) {
					this._reset();
				}
				if (this._lastPointerMoveEvent) {
					this._draw.handleEvent(this._lastPointerMoveEvent);
				}
			}
		}

		if (this._modify && this._modify.getActive()) {
			if ((event.which === 46 || event.keyCode === 46) && !/^(input|textarea)$/i.test(event.target.nodeName)) {
				this._removeSelectedFeatures();
			}
		}
	}

	_startNew() {
		this._draw.setActive(true);
		this._select.getFeatures().clear();
		this._modify.setActive(false);
		this._helpTooltip.deactivate();
		this._helpTooltip.activate();
	}

	_removeSelectedFeatures() {
		const selectedFeatures = this._select.getFeatures();
		selectedFeatures.forEach(f => {
			this._overlayManager.removeFrom(f);
			if (this._vectorLayer.getSource().hasFeature(f)) {
				this._vectorLayer.getSource().removeFeature(f);
			}
		});
		selectedFeatures.clear();
	}

	_createDraw(source) {
		const draw = new Draw({
			source: source,
			type: 'Polygon',
			minPoints: 2,
			snapTolerance: this._getSnapTolerancePerDevice(),
			style: createSketchStyleFunction(measureStyleFunction)
		});

		let listener;
		let zoomListener;

		const finishMeasurementTooltip = (event) => {

			const geometry = event.feature.getGeometry();
			const measureTooltip = event.feature.get('measurement');
			measureTooltip.getElement().static = true;
			measureTooltip.setOffset([0, -7]);
			if (geometry instanceof Polygon && !this._isFinishOnFirstPoint) {
				const lineCoordinates = geometry.getCoordinates()[0].slice(0, -1);
				event.feature.setGeometry(new LineString(lineCoordinates));
				this._overlayManager.remove(this._activeSketch.get('area'));
			}
			else {
				this._updateOverlay(measureTooltip, geometry);
			}
			this._activeSketch = null;
			unByKey(listener);
			unByKey(zoomListener);
		};

		const activateModify = (event) => {
			draw.setActive(false);
			this._modify.setActive(true);
			event.feature.setStyle(measureStyleFunction(event.feature));
			this._select.getFeatures().push(event.feature);
			this._modifyActivated = true;
			const onFeatureChange = (event) => {
				this._updateMeasureTooltips(event.target);
				this._updateStatistics();
			};
			event.feature.on('change', onFeatureChange);
		};

		draw.on('drawstart', event => {
			this._activeSketch = event.feature;
			this._pointCount = 1;
			this._isSnapOnLastPoint = false;
			const onFeatureChange = (event) => {
				this._updateMeasureTooltips(event.target, true);
				this._setStatistics(event.target);
			};
			listener = event.feature.on('change', onFeatureChange);
			zoomListener = this._map.getView().on('change:resolution', () => this._updateMeasureTooltips(this._activeSketch, true));			
			this._createMeasureTooltip(event.feature);
		});

		draw.on('drawend', event => {
			finishMeasurementTooltip(event);
			activateModify(event);
		}
		);

		return draw;
	}

	_createMeasureTooltip(feature) {
		const isDraggable = !this._environmentService.isTouch();
		const measureTooltip = this._createOverlay({ offset: [0, -15], positioning: 'bottom-center' }, MeasurementOverlayTypes.DISTANCE, isDraggable);
		feature.set('measurement', measureTooltip);
		feature.setId('measurement' + '_' + new Date().getTime());
		this._overlayManager.add(measureTooltip);	
		this._updateOverlay(measureTooltip, feature.getGeometry());	
	}

	_createAreaToolTip(feature) {
		if (feature.getGeometry() instanceof Polygon) {		
			if (feature.getGeometry().getArea())	{
				const isDraggable = !this._environmentService.isTouch();
				let areaOverlay = feature.get('area');
				if (!areaOverlay) {
					areaOverlay = this._createOverlay({ positioning: 'top-center' }, MeasurementOverlayTypes.AREA, isDraggable);
					this._overlayManager.add(areaOverlay);
				}
				this._updateOverlay(areaOverlay, feature.getGeometry());
				feature.set('area', areaOverlay);	
			}		
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

	async _save() {		
		const options = { featureProjection: 'EPSG:3857', rightHanded: true, decimals: 8 };
		const format = new KML({ writeStyles: true });
		this._storedContent = format.writeFeatures(this._vectorLayer.getSource().getFeatures(), options);

		
		if (!this._storeID) {
			try {
				const { fileId } = await this._fileStorageService.save(null, this._storedContent, FileStorageServiceDataTypes.KML);					
				this._storeID = fileId;				
			}
			catch (error) {
				console.warn('Could not store content initially:', error.message);			
			}
		}			
		else {
			try {
				await this._fileStorageService.save(this._storeID, this._storedContent, FileStorageServiceDataTypes.KML);	
			}
			catch (error) {
				console.warn('Could not store content:', error.message);
			}	
		}
	}


	_updateMeasureTooltips(feature, isDrawing) {
		let measureGeometry = feature.getGeometry();
		const measureTooltip = feature.get('measurement');

		if (feature.getGeometry() instanceof Polygon) {
			const lineCoordinates = isDrawing ? feature.getGeometry().getCoordinates()[0].slice(0, -1) : feature.getGeometry().getCoordinates()[0];


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

			if (!this._isFinishOnFirstPoint) {
				measureGeometry = new LineString(lineCoordinates);
			}
			
			this._createAreaToolTip(feature);
			
		}

		this._updateOverlay(measureTooltip, measureGeometry, '');

		// add partition tooltips on the line
		const partitions = feature.get('partitions') || [];
		const resolution = this._map.getView().getResolution();
		const delta = getPartitionDelta(measureGeometry, resolution, this._projectionHints);
		let partitionIndex = 0;
		for (let i = delta; i < 1; i += delta, partitionIndex++) {
			let partition = partitions[partitionIndex] || false;
			if (partition === false) {
				partition = this._createOverlay({ offset: [0, -25], positioning: 'top-center' }, MeasurementOverlayTypes.DISTANCE_PARTITION);

				this._overlayManager.add(partition);
				partitions.push(partition);
			}
			this._updateOverlay(partition, measureGeometry, i);
		}

		if (partitionIndex < partitions.length) {
			for (let j = partitions.length - 1; j >= partitionIndex; j--) {
				const removablePartition = partitions[j];
				this._overlayManager.remove(removablePartition);
				partitions.pop();
			}
		}
		feature.set('partitions', partitions);
	}

	_getSnapState(pixel) {
		let snapType = null;
		const interactionLayer = this._vectorLayer;
		const featureSnapOption = {
			hitTolerance: 10,
			layerFilter: itemLayer => {
				return itemLayer === interactionLayer || (itemLayer.getStyle && itemLayer.getStyle() === modifyStyleFunction);
			},
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
			snapType = MeasureSnapType.EGDE;
			const vertexGeometry = vertexFeature.getGeometry();
			const snappedFeature = vertexFeature.get('features')[0];
			const snappedGeometry = snappedFeature.getGeometry();

			if (isVertexOfGeometry(snappedGeometry, vertexGeometry)) {
				snapType = MeasureSnapType.VERTEX;
			}
		}
		if (!vertexFeature && featuresFromInteractionLayerCount > 0) {
			snapType = MeasureSnapType.FACE;
		}
		return snapType;
	}

	_getSelectableFeatures(pixel) {
		const features = [];
		const interactionLayer = this._vectorLayer;
		const featureSnapOption = {
			hitTolerance: 10,
			layerFilter: itemLayer => {
				return itemLayer === interactionLayer;
			},
		};

		this._map.forEachFeatureAtPixel(pixel, (feature, layer) => {
			if (layer === interactionLayer) {
				features.push(feature);
			}
		}, featureSnapOption);

		return features;
	}

	_updateMeasureState(coordinate, pixel, dragging) {
		const measureState = {
			type: null,
			snap: null,
			coordinate: coordinate,
			pointCount: this._pointCount
		};

		measureState.snap = this._getSnapState(pixel);

		if (this._draw.getActive()) {
			measureState.type = MeasureStateType.ACTIVE;

			if (this._activeSketch) {
				this._activeSketch.getGeometry();
				measureState.type = MeasureStateType.DRAW;

				if (this._isFinishOnFirstPoint) {
					measureState.snap = MeasureSnapType.FIRSTPOINT;
				}
				else if (this._isSnapOnLastPoint) {
					measureState.snap = MeasureSnapType.LASTPOINT;
				}
			}
		}

		if (this._modify.getActive()) {
			measureState.type = this._select.getFeatures().getLength() === 0 ? MeasureStateType.SELECT : MeasureStateType.MODIFY;
		}
		const dragableOverlay = this._overlayManager.getOverlays().find(o => o.get('dragable') === true);
		if (dragableOverlay) {
			measureState.type = MeasureStateType.OVERLAY;
		}

		measureState.dragging = dragging;
		this._setMeasureState(measureState);

		if (measureState.snap === MeasureSnapType.VERTEX) {
			this._mapContainer.classList.add('grab');
		}
		else {
			this._mapContainer.classList.remove('grab');
		}

		if (!this._dragPan.getActive()) {
			const draggingOverlay = this._overlayManager.getOverlays().find(o => o.get('dragging') === true);
			if (draggingOverlay) {
				draggingOverlay.setOffset([0, 0]);
				draggingOverlay.set('manualPositioning', true);
				draggingOverlay.setPosition(coordinate);
			}
		}
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
			style: createSelectStyleFunction(measureStyleFunction)
		};
		const select = new Select(options);
		select.getFeatures().on('change:length', this._updateStatistics);

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

	_createOverlay(overlayOptions = {}, type, isDraggable = false) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;
		measurementOverlay.isDraggable = isDraggable;
		measurementOverlay.projectionHints = this._projectionHints;
		const overlay = new Overlay({ ...overlayOptions, element: measurementOverlay, stopEvent: isDraggable });
		if (isDraggable) {
			this._createDragOn(overlay);
		}
		return overlay;
	}

	_updateOverlay(overlay, geometry, value) {
		const element = overlay.getElement();
		element.value = value;
		element.geometry = geometry;
		if (!overlay.get('manualPositioning')) {
			overlay.setPosition(element.position);
		}
	}

	_createDragOn(overlay) {
		const element = overlay.getElement();
		const dragPan = this._dragPan;


		const handleMouseDown = () => {
			dragPan.setActive(false);
			overlay.set('dragging', true);
		};

		const handleMouseEnter = () => {
			overlay.set('dragable', true);
		};

		const handleMouseLeave = () => {
			overlay.set('dragable', false);
		};
		element.addEventListener(MapBrowserEventType.POINTERDOWN, handleMouseDown);
		element.addEventListener('mouseenter', handleMouseEnter);
		element.addEventListener('mouseleave', handleMouseLeave);
	}

	async _convertToPermanentLayer() {
		const translate = (key) => this._translationService.translate(key);
		const label = translate('map_olMap_handler_measure_layer_label');
		
		if (!this._storeID || !this._storedContent ) {
			await this._save();		
		}
		
		let id = this._storeID;
		if (!id) {
			console.warn('Could not store layer-data. The data will get lost after this session.');	
			id = 'temp_measure_id';
			// TODO: offline-support is needed to properly working with temporary ids
			// TODO: propagate the failing to UI-feedback-channel 
		}
		
		try {
			let vgr = this._geoResourceService.byId(id);
			if (!vgr) {
				//create a georesource and set the data as source
				vgr = new VectorGeoResource(id, label, VectorSourceType.KML);				
			}
			vgr.setSource(this._storedContent, 4326);
			
			//register georesource
			this._geoResourceService.addOrReplace(vgr);
			//add a layer that displays the georesource in the map
			addLayer(id, { label: label });		
			this._lastMeasurementId = id;
		}
		catch (error) {
			console.error(error.message);
		}
	}


	_getSnapTolerancePerDevice() {
		if (this._environmentService.isTouch()) {
			return 12;
		}
		return 4;
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

	static get Debounce_Delay() {
		return Debounce_Delay; 
	
	}

}
