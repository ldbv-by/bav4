
import { getGeometryLength, canShowAzimuthCircle } from './olGeometryUtils';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import { Polygon, LineString, Circle, MultiPoint } from 'ol/geom';


const ZPOLYGON = 10;
const ZLINE = 20;
const ZPOINT = 30;
const RED_COLOR = [255, 0, 0];
const WHITE_COLOR = [255, 255, 255];
const BLACK_COLOR = [0, 0, 0];

export const baseStyleFunction = () => {
	return [new Style()];
};

export const measureStyleFunction = (feature) => {
	const stroke = new Stroke({
		color: RED_COLOR.concat([1]),
		width: 3
	});

	const dashedStroke = new Stroke({
		color: RED_COLOR.concat([1]),
		width: 3,
		lineDash: [8]
	});

	const zIndex = (feature.getGeometry() instanceof LineString) ? ZLINE : ZPOLYGON;

	const styles = [
		new Style({
			fill: new Fill({
				color: RED_COLOR.concat([0.4])
			}),
			stroke: dashedStroke,
			zIndex: zIndex
		}),
		new Style({
			stroke: stroke,
			geometry: feature => {

				if (canShowAzimuthCircle(feature.getGeometry())) {
					const coords = feature.getGeometry().getCoordinates();
					const radius = getGeometryLength(feature.getGeometry());
					const circle = new Circle(coords[0], radius);
					return circle;
				}
			},
			zIndex: 0
		}),
	];

	return styles;
};

export const modifyStyleFunction = () => {
	return [new Style({
		image: new CircleStyle({
			radius: 8,
			stroke: new Stroke({
				color: RED_COLOR,
				width: 1
			}),
			fill: new Fill({
				color: WHITE_COLOR,
			}),
		}),
	})];
};

export const createSelectStyleFunction = (styleFunction) => {
	const appendableVertexStyle = new Style({
		image: new CircleStyle({
			radius: 7,
			stroke: new Stroke({
				color: BLACK_COLOR,
				width: 1
			}),
			fill: new Fill({
				color: WHITE_COLOR,
			}),
		}),
		geometry: (feature) => {
			const getCoordinates = (geometry) => {
				if (geometry instanceof LineString) {
					return feature.getGeometry().getCoordinates();
				}

				if (geometry instanceof Polygon) {
					return feature.getGeometry().getCoordinates()[0];
				}
			};

			const coordinates = getCoordinates(feature.getGeometry());
			if (coordinates) {
				return new MultiPoint(coordinates);
			}

			return feature.getGeometry();

		},
		zIndex: ZPOINT - 1
	});


	return (feature, resolution) => {

		const styles = styleFunction(feature, resolution);


		return styles.concat([appendableVertexStyle]);
	};
};

export const createSketchStyleFunction = (styleFunction) => {

	const sketchPolygon = new Style({
		fill: new Fill({
			color: WHITE_COLOR.concat([0.4])
		}),
		stroke: new Stroke({
			color: WHITE_COLOR,
			width: 0
		})
	});

	return (feature, resolution) => {
		let styles;
		if (feature.getGeometry().getType() === 'Polygon') {
			styles = [sketchPolygon];
		}
		else if (feature.getGeometry().getType() === 'Point') {
			const fill = new Fill({
				color: RED_COLOR.concat([0.4])
			});

			const stroke = new Stroke({
				color: RED_COLOR.concat([1]),
				width: 3
			});
			const sketchCircle = new Style({
				image: new CircleStyle({ radius: 4, fill: fill, stroke: stroke }),
				zIndex: ZPOINT
			});
			styles = [sketchCircle];
		}
		else {
			styles = styleFunction(feature, resolution);
		}

		return styles;
	};
};
