
import { getGeometryLength, canShowAzimuthCircle } from './GeometryUtils';
import { Fill, Stroke, Style } from 'ol/style';
import { LineString, Circle } from 'ol/geom';


const ZPOLYGON = 10;
const ZLINE = 20;
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