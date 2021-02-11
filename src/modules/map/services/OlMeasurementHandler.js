import Draw from 'ol/interaction/Draw';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Fill, Stroke, Style } from 'ol/style';
import { unByKey } from 'ol/Observable';
import { LineString, Polygon, Circle, LinearRing } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { getLength } from 'ol/sphere';
import { $injector } from '../../../injection';
import { OlLayerHandler } from '../components/olMap/handler/OlLayerHandler';


const ZPOLYGON = 10;
const ZLINE = 20;

//todo: find a better place....move to utils
export const getGeometryLength = (geometry) => {
	let lineString;
	if(geometry instanceof LineString) {
		lineString = geometry;
	}
	else if(geometry instanceof LinearRing) {
		lineString = new LineString(geometry.getCoordinates());
	}
	else if(geometry instanceof Polygon) {
		lineString = new LineString(geometry.getLinearRing(0).getCoordinates());
	}	
	
	if(lineString) {
		return lineString.getLength();
	}
	return 0;
};


//todo: find a better place....move to utils
export const canShowAzimuthCircle = (geometry) => {
	if(geometry instanceof LineString) {
		const coords = geometry.getCoordinates();
		if(coords.length === 2 || 
			(coords.length === 3 && coords[1][0] === coords[2][0] && coords[1][1] === coords[2][1])) {
			return true;
		}
	}
	return false;
};

//todo: find a better place....maybe StyleService
export const measureStyleFunction = (feature) => {
	
	const color = [255, 0, 0];
	const stroke = new Stroke({
		color:color.concat([1]),
		width:1
	});

	const dashedStroke = new Stroke({
		color:color.concat([1]),
		width:3,
		lineDash:[8]
	});
	
	const zIndex = (feature.getGeometry() instanceof LineString) ?	ZLINE : ZPOLYGON;

	const styles = [
		new Style({
			fill: new Fill({ 
				color:color.concat([0.4]) 
			}),
			stroke:dashedStroke,
			zIndex:zIndex
		}),
		new Style({
			stroke:stroke,
			geometry: feature => {
				
				if(canShowAzimuthCircle(feature.getGeometry())) {					
					const coords = feature.getGeometry().getCoordinates();
					const radius = getGeometryLength(feature.getGeometry());
					const circle = new Circle(coords[0], radius);
					return circle;
				}
			},
			zIndex:0
		})];

	return styles;
};
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
			
			this._updateOverlay(this._helpTooltip, helpMsg, event.coordinate, { remove:['hidden'] });
		};

		if(this._draw === false) {
			this._vectorLayer = prepareInteraction();
			this._helpTooltip = this._createHelpTooltip();
			const source = this._vectorLayer.getSource();			
			this._draw = this._createInteraction(source);	

			this._addOverlayToMap(olMap, this._helpTooltip);			
			this._pointeMoveListener = olMap.on('pointermove', pointerMoveHandler);

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
		unByKey(this._pointeMoveListener);
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

		const formatLength = (length) => {
			
			let output;
			if (length > 100) {
				output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
			}
			else {
				output = Math.round(length * 100) / 100 + ' ' + 'm';
			}
			return output;
		};
		const updateMeasureTooltips = (geometry) => {
			const map = draw.getMap();
			const length = getLength(geometry);
			const formattedLength = formatLength(length);
			const tooltipCoord = geometry.getLastCoordinate();
			const measureTooltip = this._activeSketch.get('measurement');
			this._updateOverlay(measureTooltip, formattedLength, tooltipCoord);		
						
			// add partition tooltips on the line
			const partitions = this._activeSketch.get('partitions') || [];
			let delta = 1;
			if(length > 200000) {
				delta = 100000 / length;				
			}
			else if(length > 20000) {
				delta = 10000 / length;				
			}
			else if(length !== 0) {
				delta = 1000 / length;
			}
			let partitionIndex = 0;
			for(let i = delta;i < 1;i += delta, partitionIndex++) {
				let partition = partitions[partitionIndex] || false; 
				if(partition === false) {
					partition = this._createPartition();
					
					if(map) {
						this._addOverlayToMap(map, partition);				
					}			
					partitions.push(partition);
				}
				const content = formatLength(length * i);
				const position = geometry.getCoordinateAt(i);
				this._updateOverlay(partition, content, position );
			}

			if(partitionIndex < partitions.length) {
				for(let j = partitions.length - 1;j >= partitionIndex;j--) {
					const removablePartition = partitions[j];
					if(map) {
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
			measureTooltip.getElement().className = 'ba-tooltip ba-tooltip-static';
			measureTooltip.setOffset([0, -7]);		
			this._activeSketch = null;						
			unByKey(listener);
		};
		
		draw.on('drawstart', event =>  {	
			const measureTooltip = this._createMeasureTooltip();	
			this._activeSketch = event.feature;
			this._activeSketch.set('measurement', measureTooltip);

			listener = event.feature.getGeometry().on('change', event => {
				updateMeasureTooltips(event.target);
			});
			const map = draw.getMap();
			if(map) {
				this._addOverlayToMap(map, measureTooltip);				
			}			
		});

		draw.on('drawend', finishMeasurementTooltip);

		return draw;
	}


	/**
	 * Creates a new measure tooltip
	 */
	_createMeasureTooltip() {	
		const overlayOptions = { offset: [0, -15], positioning: 'bottom-center' };
		const styleClasses = ['ba-tooltip', 'ba-tooltip-measure'];
		return this._createOverlay(styleClasses, overlayOptions);
	}

	_createHelpTooltip() {
		const overlayOptions = { offset: [15, 0], positioning: 'center-left' };
		const styleClasses = ['ba-tooltip', 'hidden'];
		return this._createOverlay(styleClasses, overlayOptions);	
	}

	_createPartition() {
		const overlayOptions = { offset: [0, -10], positioning: 'top-center' };
		const styleClasses = ['ba-tooltip', 'ba-intermediate'];		
		return this._createOverlay(styleClasses, overlayOptions);	
	}


	_createOverlay(styleClasses = [], overlayOptions = {}) {
		const contentElement = document.createElement('div');
		styleClasses.forEach(styleClass => contentElement.classList.add(styleClass));
		const overlay = new Overlay({ ...overlayOptions, element:contentElement });
		return overlay;
	}

	_updateOverlay(overlay, content = false, position = false, styleClassOperations = { add:[], remove:[], toggle:[] }) {
		const contentElement = overlay.getElement();
		if(content) {
			contentElement.innerHTML = content;
		}
		if(position) {
			overlay.setPosition(position);
		}		
		if(styleClassOperations.add) {
			styleClassOperations.add.forEach(e => contentElement.classList.add(e));
		}
		if(styleClassOperations.remove) {
			styleClassOperations.remove.forEach(e => contentElement.classList.remove(e));
		}
		if(styleClassOperations.toggle) {
			styleClassOperations.toggle.forEach(e => contentElement.classList.toggle(e));
		}
	}
}
