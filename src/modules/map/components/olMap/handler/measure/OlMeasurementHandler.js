import { Draw, Snap } from 'ol/interaction';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import { Point, LineString, Polygon } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { $injector } from '../../../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { MeasurementOverlayTypes } from './MeasurementOverlay';
import { measureStyleFunction, generateSketchStyleFunction } from './StyleUtils';
import { getPartitionDelta } from './GeometryUtils';
import { MeasurementOverlay } from './MeasurementOverlay';
import { MEASUREMENT_LAYER_ID } from '../../../../store/measurement.observer';

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
		this._projectionHints = { fromProjection:'EPSG:' + this._mapService.getSrid(), toProjection:'EPSG:' + this._mapService.getDefaultGeodeticSrid() };		
	}

	/**
	 * Activates the Handler.
	 * @override
	 */	
	activate(olMap) {
		const prepareInteraction = () => {
			const source = new VectorSource({ wrapX: false });	
			const layer = new VectorLayer({
				source: source,
				style: measureStyleFunction				
			});
			return layer;
		};

		const pointerMoveHandler = (event) => {
			const translate = (key) => this._translationService.translate(key);
			
			if (event.dragging) {
				return;
			}
			/** @type {string} */
			let helpMsg =  translate('map_olMap_handler_measure_start');

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
			
			this._updateOverlay(this._helpTooltip, new Point(event.coordinate), helpMsg );
		};

		const removeLastPoint = (draw, event) => {
			if ((event.which === 46 || event.keyCode === 46 ) && !/^(input|textarea)$/i.test(event.target.nodeName)) {
				if (draw) {
					draw.removeLastPoint();
				}				
			}
		};

		if (this._draw === false) {
			this._vectorLayer = prepareInteraction();			
			this._helpTooltip = this._createOverlay({ offset: [15, 0], positioning: 'center-left' }, MeasurementOverlayTypes.HELP);
			const source = this._vectorLayer.getSource();			
			this._draw = this._createInteraction(source);			
			this._snap = new Snap({ source: source, pixelTolerance:this._getSnapTolerancePerDevice() });
			this._addOverlayToMap(olMap, this._helpTooltip);			
			this._pointerMoveListener = olMap.on('pointermove', pointerMoveHandler);
			this._keyboardListener = document.addEventListener('keyup', (e) => removeLastPoint(this._draw, e));

			olMap.addInteraction(this._snap);
			olMap.addInteraction(this._draw);	
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
		olMap.removeInteraction(this._snap);
		this._overlays.forEach(o => olMap.removeOverlay(o));
		this._overlays = [];
		unByKey(this._pointerMoveListener);
		unByKey(this._keyboardListener);
		this._helpTooltip = null;
		this._draw = false;
	}	

	_addOverlayToMap(map, overlay) {
		this._overlays.push(overlay);
		map.addOverlay(overlay);
	}

	_removeOverlayFromMap(map, overlay) {
		this._overlays = this._overlays.filter(o => o !== overlay);
		map.removeOverlay(overlay);
	}

	_createInteraction(source) {		
		const draw = new Draw({
			source: source,
			type:'Polygon',
			minPoints:2,
			snapTolerance:4,
			style: generateSketchStyleFunction(measureStyleFunction)
		});						
		
		const updateMeasureTooltips = (geometry) => {
			let measureGeometry = geometry;
			const map = draw.getMap();
			const measureTooltip = this._activeSketch.get('measurement');		
			
			if (geometry instanceof Polygon) {
				const lineCoordinates = geometry.getCoordinates()[0].slice(0, -1);
				

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

				if (geometry.getArea()) {
					let areaOverlay = this._activeSketch.get('area') || this._createOverlay( { positioning: 'top-center' }, MeasurementOverlayTypes.AREA, this._projectionHints );				 
					this._addOverlayToMap(map, areaOverlay);
					this._updateOverlay(areaOverlay, geometry);
					this._activeSketch.set('area', areaOverlay);
				}
			}

			this._updateOverlay(measureTooltip, measureGeometry, '');		
						
			// add partition tooltips on the line
			const partitions = this._activeSketch.get('partitions') || [];
		
			
			let delta = getPartitionDelta(measureGeometry, this._projectionHints);			
			let partitionIndex = 0;
			for (let i = delta;i < 1;i += delta, partitionIndex++) {
				let partition = partitions[partitionIndex] || false; 
				if (partition === false) {			
					partition = this._createOverlay( { offset: [0, -25], positioning: 'top-center' }, MeasurementOverlayTypes.DISTANCE_PARTITION, this._projectionHints );
					
					this._addOverlayToMap(map, partition);									
					partitions.push(partition);
				}
				this._updateOverlay(partition, measureGeometry, i );
			}

			if (partitionIndex < partitions.length) {
				for (let j = partitions.length - 1;j >= partitionIndex;j--) {
					const removablePartition = partitions[j];
					if (map) {
						this._removeOverlayFromMap(map, removablePartition);				
					}	
					partitions.pop();
				}
			}
			this._activeSketch.set('partitions', partitions);		
		};
		let listener;
		
		const finishMeasurementTooltip = (event) => {			

			const geometry = event.feature.getGeometry();
			const measureTooltip = event.feature.get('measurement');
			measureTooltip.getElement().static = true;
			measureTooltip.setOffset([0, -7]);				
			if (geometry instanceof Polygon && !this._isFinishOnFirstPoint) {
				const lineCoordinates = geometry.getCoordinates()[0].slice(0, -1);
				event.feature.setGeometry(new LineString(lineCoordinates));		
				this._removeOverlayFromMap(draw.getMap(),	this._activeSketch.get('area')	);
			}
			else {
				this._updateOverlay(measureTooltip, geometry);
			}
			this._activeSketch = null;						
			unByKey(listener);
		};
		
		draw.on('drawstart', event =>  {	
			
			const measureTooltip = this._createOverlay({ offset: [0, -15], positioning: 'bottom-center' }, MeasurementOverlayTypes.DISTANCE, this._projectionHints);	
			this._activeSketch = event.feature;
			this._activeSketch.set('measurement', measureTooltip);

			this._pointCount = 1;		
			this._isSnapOnLastPoint = false;
			listener = event.feature.getGeometry().on('change', event => {
				updateMeasureTooltips(event.target);
			});
			const map = draw.getMap();
			if (map) {
				this._addOverlayToMap(map, measureTooltip);				
			}			
		});

		draw.on('drawend', finishMeasurementTooltip);

		return draw;
	}

	_createOverlay(overlayOptions = {}, type, projectionHints = {}) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;		
		measurementOverlay.projectionHints = projectionHints;
		const overlay = new Overlay({ ...overlayOptions, element:measurementOverlay });
		return overlay;
	}

	_updateOverlay(overlay, geometry, value) {
		const measurementOverlay = overlay.getElement();
		measurementOverlay.value = value;
		measurementOverlay.geometry = geometry;
		overlay.setPosition(measurementOverlay.position);							
	}

	_getSnapTolerancePerDevice() {
		if (this._environmentService.isTouch()) {
			return 12;
		}
		return 4;
	}
}
