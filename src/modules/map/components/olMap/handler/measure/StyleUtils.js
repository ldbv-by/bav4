
import { getGeometryLength, canShowAzimuthCircle } from './GeometryUtils';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import { LineString, Circle } from 'ol/geom';


const ZPOLYGON = 10;
const ZLINE = 20;

// inspired by StackOverflow solution from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb?page=1&tab=votes#tab-top
export const hexToRgb = hex =>
	hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
		, (m, r, g, b) => '#' + r + r + g + g + b + b)
		.substring(1).match(/.{2}/g)
		.map(x => parseInt(x, 16));

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
				
				if (canShowAzimuthCircle(feature.getGeometry())) {					
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

export const generateSketchStyleFunction = (styleFunction) => {
	const sketchPolygon = new Style({ fill: new Fill({
		color: [255, 255, 255, 0.4] 
	}),
	stroke: new Stroke({
		color:[255, 255, 255],
		width:0
	}) 
	});

	return (feature, resolution) => {
		let styles;
		if (feature.getGeometry().getType() === 'Polygon') {
			styles = [sketchPolygon];
		}
		else if (feature.getGeometry().getType() === 'Point') {
			const globalColor = getComputedStyle(document.body).getPropertyValue('--color');
			const fillColor = globalColor ? hexToRgb(globalColor) : [0, 0, 0]; // todo: review, topic for diskussion
			const fill = new Fill({
				color:fillColor.concat([0.4])
			});

			const stroke = new Stroke({
				color: fillColor.concat([1]),
				width:3
			});
			const sketchCircle = new Style({
				image:new CircleStyle({ radius:4, fill:fill, stroke:stroke })
			});
			styles = [sketchCircle];
		}
		else {
			styles = styleFunction(feature, resolution);
		}

		return styles;
	};
};
