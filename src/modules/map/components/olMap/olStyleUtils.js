
import { getGeometryLength, canShowAzimuthCircle } from './olGeometryUtils';
import { Fill, Stroke, Style, Circle as CircleStyle, Icon } from 'ol/style';
import { Polygon, LineString, Circle, MultiPoint } from 'ol/geom';
import markerIcon from './assets/marker.svg';
import locationIcon from './assets/location.svg';
import tempLocationIcon from './assets/temporaryLocation.svg';
import { Feature } from 'ol';


const ZPOLYGON = 10;
const ZLINE = 20;
const ZPOINT = 30;
const RED_COLOR = [255, 0, 0];
const WHITE_COLOR = [255, 255, 255];
const BLACK_COLOR = [0, 0, 0];



export const baseStyleFunction = () => {
	return [new Style()];
};
export const nullStyleFunction = () => [new Style({})];

export const highlightStyleFunction = () => [new Style({
	image: new Icon({
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: locationIcon
	})
})];


export const highlightTemporaryStyleFunction = () => [new Style({
	image: new Icon({
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: tempLocationIcon
	})
})];

export const markerStyleFunction = (styleOption = { symbolSrc: false, color: false, scale: false }) => {
	const markerSrc = styleOption.symbolSrc ? styleOption.symbolSrc : markerIcon;
	const markerColor = styleOption.color ? styleOption.color : '#BADA55';
	const markerScale = styleOption.scale ? styleOption.scale : 1;
	return [new Style({
		image: new Icon({
			anchor: [0.5, 1],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			src: markerSrc,
			color: markerColor,
			scale: markerScale
		})
	})];
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
		})
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
				color: WHITE_COLOR
			})
		})
	})];
};

export const selectStyleFunction = () => {
	const appendableVertexStyle = new Style({
		image: new CircleStyle({
			radius: 7,
			stroke: new Stroke({
				color: BLACK_COLOR,
				width: 1
			}),
			fill: new Fill({
				color: WHITE_COLOR
			})
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
		const styleFunction = feature.getStyleFunction();
		if (!styleFunction || !styleFunction(feature, resolution)) {
			return [appendableVertexStyle];
		}
		const styles = styleFunction(feature, resolution);
		return styles.concat([appendableVertexStyle]);
	};
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
				color: WHITE_COLOR
			})
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

/**
 * Converts an array of numeric RGB-values to a the hexadecimal String-Represenation or null.
 * @param {Array<Number>} rgb
 * @returns {String|null}
 */
export const rgbToHex = (rgb) => {
	const rgb_min = 0;
	const rgb_max = 255;
	const rgb_component_count = 3;

	if (!Array.isArray(rgb)) {
		return null;
	}

	if (rgb.filter(c => rgb_min <= c && c <= rgb_max).length < rgb_component_count) {
		return null;
	}

	const componentToHex = (c) => {
		const hex = c.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
};

/**
 * extracts the color-value (as hex representation) or null from a feature
 * @param {Feature} feature the feature with or without a style
 * @returns {string|null} the color-value
 */
export const getColorFrom = (feature) => {
	if (feature == null) {
		return null;
	}
	const styles = feature.getStyle();
	if (styles) {
		const style = styles[0];
		const stroke = style.getStroke();
		const image = style.getImage();

		if (stroke) {
			return rgbToHex(stroke.getColor());
		}
		if (image && image.getColor()) {
			return rgbToHex(image.getColor());
		}
	}

	return null;
};
