
import { getGeometryLength, canShowAzimuthCircle, createOffsetGeometry } from './GeometryUtils';
import { getPartitionDelta } from './GeometryUtils';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import { Polygon, LineString, Circle, MultiPoint } from 'ol/geom';



const ZPOLYGON = 10;
const ZLINE = 20;
const ZPOINT = 30;
const RED_COLOR = [255, 0, 0];
const WHITE_COLOR = [255, 255, 255];
const BLACK_COLOR = [0, 0, 0];

const createRulerStyles = (feature, resolution) => {
	const geom = feature.getGeometry();
	const calculationHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' };
	const partitionLength = getPartitionDelta(geom, resolution, calculationHints) * getGeometryLength(geom);	
	const partitionTickDistance = partitionLength / resolution;	


	const bigWidth = 10;
	const smallWidth = 5;

	const calcLineOffsetInMeter = (widthInPixel) => widthInPixel / 2 * resolution;
	
	const bigTickStyle = new Style({
		geometry: createOffsetGeometry(geom, calcLineOffsetInMeter(bigWidth) ),
		stroke: new Stroke({
			color: RED_COLOR.concat([1]),
			lineCap:'butt',
			width:bigWidth,
			lineDash:[3, partitionTickDistance - 3],
			lineDashOffset:3
			// width:1,			
		})
	});
	const smallTickStyle = new Style({
		geometry: createOffsetGeometry(geom, calcLineOffsetInMeter(smallWidth) ),
		stroke: new Stroke({
			color: RED_COLOR.concat([1]),
			lineCap:'butt',
			width:smallWidth,
			lineDash:[2, (partitionTickDistance / 5) - 2],
			lineDashOffset:2
		})
	});

	return [bigTickStyle, smallTickStyle];
};

/**
 * Inspired by example from https://stackoverflow.com/questions/57421223/openlayers-3-offset-stroke-style
 * @param {*} feature 
 * @param {*} resolution 
 * @returns 
 */
export const measureStyleFunction3 = (feature, resolution) => {

	const stroke = new Stroke({
		color:RED_COLOR.concat([1]),
		width:3,
	});
	const zIndex = (feature.getGeometry() instanceof LineString) ?	ZLINE : ZPOLYGON;

	const styles = [
		new Style({
			fill: new Fill({ 
				color:RED_COLOR.concat([0.4]) 
			}),
			stroke:stroke,
			zIndex:zIndex
		},
		new Style({
			stroke:stroke,
			geometry: feature => {
				
				if (canShowAzimuthCircle(feature.getGeometry())) {					
					const coords = feature.getGeometry().getCoordinates();
					const radius = getGeometryLength(feature.getGeometry());
					const circle = new Circle(coords[0], radius);
					return circle;
				}
			},
			zIndex:0
		}))];
	const rulerStyles = createRulerStyles(feature, resolution);
	
	
	return styles.concat(rulerStyles);
};

export const measureStyleFunction2 = (feature, resolution) => {
	const projectionHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' };
	const dashedStroke = new Stroke({
		color:RED_COLOR.concat([1]),
		width:1
	});
	const zIndex = (feature.getGeometry() instanceof LineString) ?	ZLINE : ZPOLYGON;
	let simplifiedGeometry = feature.getGeometry();
	if (feature.getGeometry() instanceof Polygon) {
		simplifiedGeometry = new LineString(feature.getGeometry().getCoordinates()[0]);
	}
	const delta = getPartitionDelta(simplifiedGeometry, resolution, projectionHints);
	const styles = [
		new Style({
			fill: new Fill({ 
				color:RED_COLOR.concat([0.4]) 
			}),
			stroke:dashedStroke,
			zIndex:zIndex
		})];
	
	const width = 15;
	
	const geom = feature.getGeometry();
	const partitionLength = delta * getGeometryLength(geom);	
	const partitionTickDistance = partitionLength / resolution;	
	const bigTickStyle = new Style({
		stroke: new Stroke({
			color: RED_COLOR.concat([1]),
			lineCap:'butt',
			width:width,
			lineDash:[3, partitionTickDistance - 3],
			lineDashOffset:3
		})
	});
	const smallTickStyle = new Style({
		stroke: new Stroke({
			color: RED_COLOR.concat([1]),
			lineCap:'butt',
			width:width / 3,
			lineDash:[2, (partitionTickDistance / 5) - 2],
			lineDashOffset:2
		})
	});
	styles.push(bigTickStyle,
		smallTickStyle
	);
	
	return styles;
};

export const measureStyleFunction = (feature) => {
	
	const stroke = new Stroke({
		color:RED_COLOR.concat([1]),
		width:3
	});

	const dashedStroke = new Stroke({
		color:RED_COLOR.concat([1]),
		width:3,
		lineDash:[8]
	});
	
	const zIndex = (feature.getGeometry() instanceof LineString) ?	ZLINE : ZPOLYGON;

	const styles = [
		new Style({
			fill: new Fill({ 
				color:RED_COLOR.concat([0.4]) 
			}),
			stroke:dashedStroke,
			zIndex:zIndex
		}),
		new Style({
			stroke:stroke,
			geometry: feature => {
				
				if (canShowAzimuthCircle(feature.getGeometry())) {					
					const coords = feature.getGeometry().getCoordinates();
					const radius = getGeometryLength(feature.getGeometry());
					const circle = new Circle(coords[0], radius);
					return circle;
				}
			},
			zIndex:0
		}),
	];

	return styles;
};

export const modifyStyleFunction = () => {
	return [new Style({
		image: new CircleStyle({
			radius: 8,
			stroke: new Stroke({
				color:RED_COLOR,
				width:1 }),
			fill: new Fill({
				color: WHITE_COLOR,
			}),				
		}),
	})]
	;
};

export const createSelectStyleFunction = (styleFunction) => {
	const appendableVertexStyle = new Style({
		image: new CircleStyle({
			radius: 7,
			stroke: new Stroke({
				color:BLACK_COLOR,
				width:1 }),
			fill: new Fill({
				color: WHITE_COLOR,
			}),				
		}),	
		geometry: (feature) => {
			let coordinates = false;
			const geometry = feature.getGeometry();
			if (geometry instanceof LineString) {
				coordinates = feature.getGeometry().getCoordinates();	
				return new MultiPoint(coordinates);
			} 
			
			if (geometry instanceof Polygon) {
				coordinates = feature.getGeometry().getCoordinates()[0];
				return new MultiPoint(coordinates);
			}
	
			return feature.getGeometry();
	
		},
		zIndex:ZPOINT - 1
	});
	

	return (feature, resolution) => {
	
		const styles = styleFunction(feature, resolution);
	
		
		return styles.concat([appendableVertexStyle]);
	};
};

export const createSketchStyleFunction = (styleFunction) => {
	
	const sketchPolygon = new Style({ fill: new Fill({
		color:WHITE_COLOR.concat([0.4])
	}),
	stroke: new Stroke({
		color:WHITE_COLOR,
		width:0
	}) 
	});

	return (feature, resolution) => {
		let styles;
		if (feature.getGeometry().getType() === 'Polygon') {
			styles = [sketchPolygon];
		}
		else if (feature.getGeometry().getType() === 'Point') {
			const fill = new Fill({
				color:RED_COLOR.concat([0.4])
			});

			const stroke = new Stroke({
				color: RED_COLOR.concat([1]),
				width:3
			});
			const sketchCircle = new Style({
				image:new CircleStyle({ radius:4, fill:fill, stroke:stroke }),
				zIndex:ZPOINT
			});
			styles = [sketchCircle];
		}
		else {
			styles = styleFunction(feature, resolution);
		}

		return styles;
	};
};
