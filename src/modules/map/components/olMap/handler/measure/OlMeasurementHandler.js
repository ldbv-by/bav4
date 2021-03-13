import { Draw, Modify, Select, Snap } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import { Point, LineString, Polygon } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { $injector } from '../../../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { MeasurementOverlayTypes } from './MeasurementOverlay';
import { measureStyleFunction, generateSketchStyleFunction, modifyStyleFunction } from './StyleUtils';
import { getPartitionDelta, isVertexOfGeometry } from './GeometryUtils';
import { MeasurementOverlay } from './MeasurementOverlay';
import { MEASUREMENT_LAYER_ID } from '../../../../store/measurement.observer';
import { noModifierKeys, click, primaryAction } from 'ol/events/condition';

if (!window.customElements.get(MeasurementOverlay.tag)) {
	window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);
}
/**
 * Handler for measurement-interaction with the map
 * 
 * @class
 * @author thiloSchlemmer
 * @author taulinger
 */
export class OlMeasurementHandler extends OlLayerHandler {
	//this handler could be statefull
	constructor() {
		super(MEASUREMENT_LAYER_ID);
		const { TranslationService, MapService, EnvironmentService } = $injector.inject('TranslationService', 'MapService', 'EnvironmentService');
		this._translationService = TranslationService;
		this._mapService = MapService;
		this._environmentService = EnvironmentService;
		this._vectorLayer = null;
		this._draw = false;
		this._activeSketch = null;
		this._helpTooltip;
		this._isFinishOnFirstPoint = false;
		this._isSnapOnLastPoint = false;
		this._pointCount = 0;
		this._overlays = [];
		this._listeners = [];
		this._projectionHints = { fromProjection: 'EPSG:' + this._mapService.getSrid(), toProjection: 'EPSG:' + this._mapService.getDefaultGeodeticSrid() };
	}

	/**
	 * Activates the Handler.
	 * @override
	 */
	activate(olMap) {
		const visibleChangedHandler = (event) => {
			const layer = event.target;
			const isVisibleStyle = layer.getVisible() ? '' : 'none';
			this._overlays.forEach(o => o.getElement().style.display = isVisibleStyle);
		};

		const opacityChangedHandler = (event) => {
			const layer = event.target;
			this._overlays.forEach(o => o.getElement().style.opacity = layer.getOpacity());
		};

		const createLayer = () => {
			const source = new VectorSource({ wrapX: false });
			const layer = new VectorLayer({
				source: source,
				style: measureStyleFunction
			});
			this._listeners.push(layer.on('change:visible', visibleChangedHandler));
			this._listeners.push(layer.on('change:opacity', opacityChangedHandler));
			return layer;
		};



		const pointerMoveHandler = (event) => {
			const translate = (key) => this._translationService.translate(key);

			if (event.dragging) {
				return;
			}
			let helpMsg = translate('map_olMap_handler_measure_start');
			if (this._draw.getActive()) {
				if (this._activeSketch) {
					this._activeSketch.getGeometry();
					helpMsg = translate('map_olMap_handler_measure_continue_line');

					if (this._isFinishOnFirstPoint) {
						helpMsg = translate('map_olMap_handler_measure_snap_first_point');
					}
					else if (this._isSnapOnLastPoint) {
						helpMsg = translate('map_olMap_handler_measure_snap_last_point');
					}

					if (this._pointCount > 2) {
						helpMsg += '<br/>' + translate('map_olMap_handler_delete_last_point');
					}
				}
			}

			if (this._modify.getActive()) {
				helpMsg = 'map_olMap_handler_measure_modify_key_for_delete';//translate('map_olMap_handler_measure_modify_key_for_delete');	
				const interactionLayer = this._vectorLayer;
				const featureSnapOption = {
					hitTolerance: 10,
					layerFilter: itemLayer => {
						return itemLayer === interactionLayer || (itemLayer.getStyle && itemLayer.getStyle() === modifyStyleFunction);
					},
				};
				let vertexFeature = null;
				this._map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
					if (!layer && feature.get('features').length > 0) {
						vertexFeature = feature;
						return;
					}
				}, featureSnapOption);

				if (vertexFeature) {
					helpMsg = 'map_olMap_handler_measure_modify_click_new_point';// translate('map_olMap_handler_measure_modify_click_new_point');

					const vertexGeometry = vertexFeature.getGeometry();
					const snappedFeature = vertexFeature.get('features')[0];
					const snappedGeometry = snappedFeature.getGeometry();
					
					if (isVertexOfGeometry(snappedGeometry, vertexGeometry)) {
						helpMsg = 'map_olMap_handler_measure_modify_click_or_drag';//translate('map_olMap_handler_measure_modify_click_or_drag');
					}
				}
			}
			this._updateOverlay(this._helpTooltip, new Point(event.coordinate), helpMsg);
		};

		if (this._draw === false) {
			this._map = olMap;
			this._vectorLayer = createLayer();
			this._helpTooltip = this._createOverlay({ offset: [15, 0], positioning: 'center-left' }, MeasurementOverlayTypes.HELP);
			const source = this._vectorLayer.getSource();
			this._select = this._createSelect();
			this._modify = this._createModify();
			this._modify.setActive(false);
			this._draw = this._createDraw(source);
			this._snap = new Snap({ source: source, pixelTolerance: this._getSnapTolerancePerDevice() });

			this._addOverlayToMap(olMap, this._helpTooltip);
			this._listeners.push(olMap.on('pointermove', pointerMoveHandler));
			this._listeners.push(document.addEventListener('keyup', (e) => this._removeLast(e)));

			olMap.addInteraction(this._select);
			olMap.addInteraction(this._modify);
			olMap.addInteraction(this._draw);
			olMap.addInteraction(this._snap);
		}
		return this._vectorLayer;
	}

	/**
	 *  @override
	 *  @param {Map} olMap
	 */
	deactivate(olMap) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later		
		olMap.removeInteraction(this._draw);
		olMap.removeInteraction(this._modify);
		olMap.removeInteraction(this._snap);
		olMap.removeInteraction(this._select);
		this._overlays.forEach(o => olMap.removeOverlay(o));
		this._overlays = [];
		this._listeners.forEach(l => unByKey(l));
		this._listeners = [];
		this._helpTooltip = null;
		this._draw = false;
		this._map = null;
	}

	_addOverlayToMap(map, overlay) {
		this._overlays.push(overlay);
		map.addOverlay(overlay);
	}

	_removeOverlayFromMap(map, overlay) {
		this._overlays = this._overlays.filter(o => o !== overlay);
		map.removeOverlay(overlay);
	}

	_removeLast(event) {
		if (this._draw && this._draw.getActive()) {
			if ((event.which === 46 || event.keyCode === 46) && !/^(input|textarea)$/i.test(event.target.nodeName)) {
				this._draw.removeLastPoint();
			}
		}

		if (this._modify && this._modify.getActive()) {
			if ((event.which === 46 || event.keyCode === 46) && !/^(input|textarea)$/i.test(event.target.nodeName)) {
				this._reset();
			}
		}
	}

	_reset() {
		this._draw.setActive(true);
		this._select.getFeatures().clear();
		this._modify.setActive(false);
		this._overlays.forEach(o => this._map.removeOverlay(o));
		this._overlays = [];
		this._vectorLayer.getSource().clear();
		this._addOverlayToMap(this._map, this._helpTooltip);
	}

	_createDraw(source) {
		const draw = new Draw({
			source: source,
			type: 'Polygon',
			minPoints: 2,
			snapTolerance: this._getSnapTolerancePerDevice(),
			style: generateSketchStyleFunction(measureStyleFunction)
		});

		let listener;

		const finishMeasurementTooltip = (event) => {

			const geometry = event.feature.getGeometry();
			const measureTooltip = event.feature.get('measurement');
			measureTooltip.getElement().static = true;
			measureTooltip.setOffset([0, -7]);
			if (geometry instanceof Polygon && !this._isFinishOnFirstPoint) {
				const lineCoordinates = geometry.getCoordinates()[0].slice(0, -1);
				event.feature.setGeometry(new LineString(lineCoordinates));
				this._removeOverlayFromMap(draw.getMap(), this._activeSketch.get('area'));
			}
			else {
				this._updateOverlay(measureTooltip, geometry);
			}
			this._activeSketch = null;
			unByKey(listener);
		};

		const activateModify = (event) => {
			draw.setActive(false);
			this._modify.setActive(true);
			event.feature.setStyle(measureStyleFunction);
			this._select.getFeatures().push(event.feature);
			event.feature.on('change', event => this._updateMeasureTooltips(event.target));
		};

		draw.on('drawstart', event => {

			const measureTooltip = this._createOverlay({ offset: [0, -15], positioning: 'bottom-center' }, MeasurementOverlayTypes.DISTANCE, this._projectionHints);
			this._activeSketch = event.feature;
			this._pointCount = 1;
			this._isSnapOnLastPoint = false;
			event.feature.set('measurement', measureTooltip);
			listener = event.feature.on('change', event => this._updateMeasureTooltips(event.target, true));
			this._addOverlayToMap(this._map, measureTooltip);
		});

		draw.on('drawend', event => {
			finishMeasurementTooltip(event);
			activateModify(event);
		}
		);

		return draw;
	}

	_updateMeasureTooltips(feature, isDrawing = false) {
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

			if (feature.getGeometry().getArea()) {
				const areaOverlay = feature.get('area') || this._createOverlay({ positioning: 'top-center' }, MeasurementOverlayTypes.AREA, this._projectionHints);
				this._addOverlayToMap(this._map, areaOverlay);
				this._updateOverlay(areaOverlay, feature.getGeometry());
				feature.set('area', areaOverlay);
			}
		}

		this._updateOverlay(measureTooltip, measureGeometry, '');

		// add partition tooltips on the line
		const partitions = feature.get('partitions') || [];


		const delta = getPartitionDelta(measureGeometry, this._projectionHints);
		let partitionIndex = 0;
		for (let i = delta; i < 1; i += delta, partitionIndex++) {
			let partition = partitions[partitionIndex] || false;
			if (partition === false) {
				partition = this._createOverlay({ offset: [0, -25], positioning: 'top-center' }, MeasurementOverlayTypes.DISTANCE_PARTITION, this._projectionHints);

				this._addOverlayToMap(this._map, partition);
				partitions.push(partition);
			}
			this._updateOverlay(partition, measureGeometry, i);
		}

		if (partitionIndex < partitions.length) {
			for (let j = partitions.length - 1; j >= partitionIndex; j--) {
				const removablePartition = partitions[j];
				if (this._map) {
					this._removeOverlayFromMap(this._map, removablePartition);
				}
				partitions.pop();
			}
		}
		feature.set('partitions', partitions);
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
			filter: featureFilter, style: measureStyleFunction
		};

		return new Select(options);
	}

	_createModify() {
		let isInsertFirst = false;
		const options = {
			features: this._select.getFeatures(),
			style: modifyStyleFunction,
			insertVertexCondition: event => {
				isInsertFirst = primaryAction(event);
				return isInsertFirst;
			},
			deleteCondition: event => {
				const isDeletable = (noModifierKeys(event) && click(event));
				if (isDeletable && isInsertFirst) {
					isInsertFirst = false;
					return false;
				}				
				return isDeletable;
			}
		};
		return new Modify(options);
	}

	_createOverlay(overlayOptions = {}, type, projectionHints = {}) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;
		measurementOverlay.projectionHints = projectionHints;
		const overlay = new Overlay({ ...overlayOptions, element: measurementOverlay });
		this._createDragOn(overlay, this._map);
		return overlay;
	}

	_updateOverlay(overlay, geometry, value) {
		const measurementOverlay = overlay.getElement();
		measurementOverlay.value = value;
		measurementOverlay.geometry = geometry;
		overlay.setPosition(measurementOverlay.position);
	}

	_createDragOn(overlay, map) {
		const element = overlay.getElement();
		
		const handleMouseDown = () => {
			const body = document.querySelector('body');
			const handleDragging = (event) => {
				const position = map.getEventCoordinate(event);
				overlay.setOffset([0, 0]);
				overlay.setPositioning('center-cendetr');
				overlay.setPosition(position);
				overlay.set('manualPositioning', true);
			};
			const handleMouseUp = () => {
				const body = document.querySelector('body');
				body.removeEventListener('mouseup', handleMouseUp);
				body.removeEventListener('mousemove', handleDragging);
			};			
			body.addEventListener('mouseup', handleMouseUp);
			body.addEventListener('mousemove', handleDragging);
		
		};
		element.addEventListener('mousedown', handleMouseDown);
	}

	_getSnapTolerancePerDevice() {
		if (this._environmentService.isTouch()) {
			return 12;
		}
		return 4;
	}
}
