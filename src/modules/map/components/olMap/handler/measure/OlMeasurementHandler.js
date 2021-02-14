import Draw from 'ol/interaction/Draw';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { unByKey } from 'ol/Observable';
import { Point, LineString, Polygon } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { $injector } from '../../../../../../injection';
import { OlLayerHandler } from '../OlLayerHandler';
import { MeasurementOverlayTypes } from './MeasurementOverlay';
import { measureStyleFunction } from './StyleUtils';
import { MeasurementOverlay } from './MeasurementOverlay';

if (!window.customElements.get(MeasurementOverlay.tag)) {
	window.customElements.define(MeasurementOverlay.tag, MeasurementOverlay);
}

export class OlMeasurementHandler extends OlLayerHandler {
	//this handler could be statefull
	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
		this._vectorLayer = null;
		this._draw = false;			
		this._activeSketch = null;		
		this._helpTooltip;
		this._overlays = [];
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
			const continuePolygonMsg = translate('draw_measure_continue_polygon');
			const continueLineMsg = translate('draw_measure_continue_line');

			if (event.dragging) {
				return;
			}
			/** @type {string} */
			let helpMsg =  translate('draw_measure_start');

			if (this._activeSketch) {
				var geom = this._activeSketch.getGeometry();
				if (geom instanceof Polygon) {
					helpMsg = continuePolygonMsg;
				}
				else if (geom instanceof LineString) {
					helpMsg = continueLineMsg;
				}
			}
			
			this._updateOverlay(this._helpTooltip, new Point(event.coordinate), helpMsg );
		};

		if (this._draw === false) {
			this._vectorLayer = prepareInteraction();			
			this._helpTooltip = this._createOverlay({ offset: [15, 0], positioning: 'center-left' }, MeasurementOverlayTypes.HELP);
			const source = this._vectorLayer.getSource();			
			this._draw = this._createInteraction(source);	

			this._addOverlayToMap(olMap, this._helpTooltip);			
			this._pointerMoveListener = olMap.on('pointermove', pointerMoveHandler);

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
		this._overlays.forEach(o => olMap.removeOverlay(o));
		unByKey(this._pointerMoveListener);
		this._helpTooltip = null;
		this._draw = false;
	}	

	_addOverlayToMap(map, overlay) {
		this._overlays.push(overlay);
		map.addOverlay(overlay);
	}

	_removeOverlayFromMap(map, overlay) {
		this._overlays.pop(overlay);
		map.removeOverlay(overlay);
	}

	_createInteraction(source) {		
		const draw = new Draw({
			source: source,
			type: 'LineString',
			style: measureStyleFunction
		});						
		
		const updateMeasureTooltips = (geometry) => {
			const map = draw.getMap();
			const length = geometry.getLength();
			
			const measureTooltip = this._activeSketch.get('measurement');			
				
			this._updateOverlay(measureTooltip, geometry, '');		
						
			// add partition tooltips on the line
			const partitions = this._activeSketch.get('partitions') || [];
			let delta = 1;
			if (length > 200000) {
				delta = 100000 / length;				
			}
			else if (length > 20000) {
				delta = 10000 / length;				
			}
			else if (length !== 0) {
				delta = 1000 / length;
			}
			let partitionIndex = 0;
			for (let i = delta;i < 1;i += delta, partitionIndex++) {
				let partition = partitions[partitionIndex] || false; 
				if (partition === false) {			
					partition = this._createOverlay( { offset: [0, -25], positioning: 'top-center' }, MeasurementOverlayTypes.DISTANCE_PARTITION );
					
					this._addOverlayToMap(map, partition);									
					partitions.push(partition);
				}
				this._updateOverlay(partition, geometry, i );
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
			const measureTooltip = event.feature.get('measurement');
			measureTooltip.getElement().static = true;
			measureTooltip.setOffset([0, -7]);					
			this._activeSketch = null;						
			unByKey(listener);
		};
		
		draw.on('drawstart', event =>  {				
			const measureTooltip = this._createOverlay({ offset: [0, -15], positioning: 'bottom-center' }, MeasurementOverlayTypes.DISTANCE);	
			this._activeSketch = event.feature;
			this._activeSketch.set('measurement', measureTooltip);

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

	_createOverlay(overlayOptions = {}, type) {
		const measurementOverlay = document.createElement(MeasurementOverlay.tag);
		measurementOverlay.type = type;		
		const overlay = new Overlay({ ...overlayOptions, element:measurementOverlay });
		return overlay;
	}

	_updateOverlay(overlay, geometry, value) {
		const measurementOverlay = overlay.getElement();
		measurementOverlay.value = value;
		measurementOverlay.geometry = geometry;
		overlay.setPosition(measurementOverlay.position);							
	}
}
