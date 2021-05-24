
import { getGeometryLength, canShowAzimuthCircle, calculatePartitionResidualOfSegments, moveParallel } from './GeometryUtils';
import { getPartitionDelta } from './GeometryUtils';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import { Polygon, LineString, Circle, MultiPoint } from 'ol/geom';
import { toContext } from 'ol/render';

const ZPOLYGON = 10;
const ZLINE = 20;
const ZPOINT = 30;
const RED_COLOR = [255, 0, 0];
const WHITE_COLOR = [255, 255, 255];
const BLACK_COLOR = [0, 0, 0];


const getRulerStyle = (feature, resolution) => {
	const geom = feature.getGeometry();
	const calculationHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' };
	const partition = getPartitionDelta(geom, resolution, calculationHints);
	const partitionLength = getPartitionDelta(geom, resolution, calculationHints) * getGeometryLength(geom);	
	const partitionTickDistance = partitionLength / resolution;	
	
	const fill = new Fill();
	const baseStroke = new Stroke({
		color: RED_COLOR.concat([1]),
		fill: new Fill({ 
			color:RED_COLOR.concat([0.4]) 
		}),
		width: 3,
	});
	const getMainTickStroke = (residual) => {
		return new Stroke({
			color: RED_COLOR.concat([1]),
			width: 8,
			lineCap:'butt',
			lineDash:[3, partitionTickDistance - 3],
			lineDashOffset:3 + (partitionTickDistance * residual)
		});
	};

	const getSubTickStroke = (residual) => {
		return new Stroke({
			color: RED_COLOR.concat([1]),
			width: 5,
			lineCap:'butt',
			lineDash:[2, (partitionTickDistance / 5) - 2],
			lineDashOffset:2 + (partitionTickDistance * residual)
		});
	};
	
	const residuals = calculatePartitionResidualOfSegments(geom, partition);
	return new Style({ renderer:(pixelCoordinates, state) => {
		const context = state.context;
		if (pixelCoordinates.length > 1) {
			for (let index = 0; index < residuals.length; index++) {
				const residual = residuals[index];
				const from = pixelCoordinates[index];
				const to = pixelCoordinates[index + 1];
				if (!to) {
					break;
				}
				const coords = [from, to];
				const geometry = state.geometry.clone();
				geometry.setCoordinates(coords);
				const renderContext = toContext(context, { pixelRatio: 1, });		
			
				renderContext.setFillStrokeStyle(fill, baseStroke);
				renderContext.drawGeometry(geometry);
				renderContext.setFillStrokeStyle(fill, getMainTickStroke(residual));
				renderContext.drawGeometry(moveParallel(coords[0], coords[1], -4));
				renderContext.setFillStrokeStyle(fill, getSubTickStroke(residual));
				renderContext.drawGeometry(moveParallel(coords[0], coords[1], -2));	
			}
		}		
	} });
};

/**
 * Inspired by example from https://stackoverflow.com/questions/57421223/openlayers-3-offset-stroke-style
 * @param {*} feature 
 * @param {*} resolution 
 * @returns 
 */
export const measureStyleFunction = (feature, resolution) => {

	const stroke = new Stroke({
		color:RED_COLOR.concat([1]),
		width:3,
	});
	const styles = [
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
		getRulerStyle(feature, resolution)];
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
