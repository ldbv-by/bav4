
import { getGeometryLength, canShowAzimuthCircle } from './GeometryUtils';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import { LineString, Circle, MultiPoint } from 'ol/geom';


const ZPOLYGON = 10;
const ZLINE = 20;
const ZPOINT = 30;
const RED_COLOR = [255, 0, 0];
const WHITE_COLOR = [255, 255, 255];
const BLACK_COLOR = [0, 0, 0];

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
		new Style({
			image: new CircleStyle({
				radius: 7,
				stroke: new Stroke({
					color:BLACK_COLOR,
					width:1 }),
				fill: new Fill({
					color: WHITE_COLOR,
				}),				
			}),
			geometry: function (feature) {
				// return the coordinates of the first ring of the polygon
				let coordinates = feature.getGeometry().getCoordinates();
				if (feature.getGeometry().getType() === 'Polygon') {
					coordinates = feature.getGeometry().getCoordinates()[0];
				}
				return new MultiPoint(coordinates);
			},
			zIndex:ZPOINT
		}
		)];

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

export const generateSketchStyleFunction = (styleFunction) => {
	
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
