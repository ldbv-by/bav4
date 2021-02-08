import Draw from 'ol/interaction/Draw';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Fill, Stroke, Style } from 'ol/style';
import { unByKey } from 'ol/Observable';
import { LineString, Polygon, Circle, LinearRing } from 'ol/geom';
import Overlay from 'ol/Overlay';
import { getLength } from 'ol/sphere';


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
export class OlMeasurementHandler {
	//this handler could be statefull
	constructor() {
		this._map;
		this._draw = false;
		this._vectorLayer = false;
	
		this._measureTooltipElement;
		this._measureTooltip;		
	}

	/**
	 * Activates the Handler.
	 * @param {Map} olMap 
	 * @returns {VectorLayer} the olLayer which should be attached to
	 */
	// eslint-disable-next-line no-unused-vars
	activate(olMap) {

		//use the map to register event listener, interactions, etc
		//for development purposes you can attach the layer to the map here,
		//later, this will be done outside this handler
		if(this._draw === false) {
			this._map = olMap;
			this._addInteraction();		
		}		
		return this._vectorLayer;
	}	

	/**
	 * Deactivates the Handler
	 *  @param {Map} olMap 
	 *  @param {VectorLayer} olLayer 
	 */
	// eslint-disable-next-line no-unused-vars
	deactivate(olMap, olLayer) {
		//use the map to unregister event listener, interactions, etc
		//olLayer currently undefined, will be fixed later
		
		olMap.removeInteraction(this._draw);
		this._draw = false;
	}	

	_addInteraction() {
		const source = new VectorSource({ wrapX: false });	
		this._vectorLayer = new VectorLayer({
			source: source,
			style: measureStyleFunction,
			map:this._map
		});
		this._createMeasureTooltip();
		this._draw = new Draw({
			source: source,
			type: 'LineString',
			style: measureStyleFunction
		});
					
		this._map.addInteraction(this._draw);		

		const formatLength = (line) => {
			const length = getLength(line);
			let output;
			if (length > 100) {
				output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
			}
			else {
				output = Math.round(length * 100) / 100 + ' ' + 'm';
			}
			return output;
		};
		const writeMeasurement = (content, coordinate) => {
			this._measureTooltipElement.innerHTML = content;
			this._measureTooltip.setPosition(coordinate);
		};
		let listener;
		
		const finishMeasurementTooltip = () => {			
			this._measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
			this._measureTooltip.setOffset([0, -7]);
			this._createMeasureTooltip();
			unByKey(listener);
		};
		
		this._draw.on('drawstart', event =>  {
			
			let tooltipCoord = event.coordinate;			

			listener = event.feature.getGeometry().on('change', event => {
				const geom = event.target;
				const output = formatLength(geom);
				tooltipCoord = geom.getLastCoordinate();
				writeMeasurement(output, tooltipCoord);
			});
		});

		this._draw.on('drawend', () => finishMeasurementTooltip);
	}


	/**
	 * Creates a new measure tooltip
	 */
	_createMeasureTooltip() {	
		this._measureTooltipElement = document.createElement('div');
		this._measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
		this._measureTooltip = new Overlay({
			element: this._measureTooltipElement,
			offset: [0, -15], positioning: 'bottom-center'
		});
		this._map.addOverlay(this._measureTooltip);
	}
}