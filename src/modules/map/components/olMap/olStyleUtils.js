
import { getGeometryLength, canShowAzimuthCircle } from './olGeometryUtils';
import { Fill, Stroke, Style, Circle as CircleStyle, Icon, Text as TextStyle } from 'ol/style';
import { Polygon, LineString, Circle, MultiPoint } from 'ol/geom';
import { $injector } from '../../../../injection';
import markerIcon from './assets/marker.svg';
import locationIcon from './assets/location.svg';
import tempLocationIcon from './assets/temporaryLocation.svg';


const Z_Polygon = 10;
const Z_Line = 20;
const Z_Point = 30;
const Red_Color = [255, 0, 0];
const White_Color = [255, 255, 255];
const Black_Color = [0, 0, 0];

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
	// const { EnvironmentService } = $injector.inject('EnvironmentService');
	// const environmentService = EnvironmentService;
	const isOfflineModus = true; // environmentService.isStandalone()
	const markerColor = styleOption.color ? styleOption.color : '#BADA55';

	const getMarkerSrc = () => {
		const defaultSymbol = 'marker';
		if (styleOption.symbolSrc != null && styleOption.symbolSrc !== false) {
			if (styleOption.symbolSrc.startsWith('http://') || styleOption.symbolSrc.startsWith('https://')) {
				return styleOption.symbolSrc;
			}
			return getIconUrl(styleOption.symbolSrc, hexToRgb(markerColor));
		}
		return getIconUrl(defaultSymbol);
	};
	const getMarkerScale = (sizeKeyword) => {
		switch (sizeKeyword) {
			case 'big':
				return 1;
			case 'medium':
				return 0.75;
			case 'small':
			default:
				return 0.5;
		}
	};

	const fallbackIconOptions = {
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: markerIcon,
		scale: getMarkerScale(styleOption.scale),
		color: markerColor
	};

	const defaultIconOptions = {
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: getMarkerSrc(),
		scale: getMarkerScale(styleOption.scale)
	};

	const iconOptions = isOfflineModus ? fallbackIconOptions : defaultIconOptions;
	return [new Style({
		image: new Icon(iconOptions)
	})];
};

export const textStyleFunction = (styleOption = { color: false, scale: false, text: false }) => {
	const strokeColor = styleOption.color ? styleOption.color : '#BADA55';
	const textContent = styleOption.text ? styleOption.text : 'New Text';
	const strokeWidth = 2;
	const getTextScale = (sizeKeyword) => {
		if (typeof (sizeKeyword) === 'number') {
			return sizeKeyword;
		}
		switch (sizeKeyword) {

			case 'big':
				return 2;
			case 'medium':
				return 1.5;
			case 'small':
			default:
				return 1;
		}
	};
	const textScale = getTextScale(styleOption.scale);

	return [new Style({
		text: new TextStyle({
			text: textContent,
			font: 'normal 16px sans-serif',
			stroke: new Stroke({
				color: getContrastColorFrom(hexToRgb(strokeColor)).concat(0.4),
				width: strokeWidth
			}),
			fill: new Fill({
				color: hexToRgb(strokeColor).concat([1])
			}),
			scale: textScale,
			offsetY: -5
		})
	})];
};

export const lineStyleFunction = (styleOption = { color: false }) => {
	const strokeColor = styleOption.color ? hexToRgb(styleOption.color) : hexToRgb('#BADA55');
	const strokeWidth = 2;
	return [new Style({
		stroke: new Stroke({
			color: strokeColor.concat([1]),
			width: strokeWidth
		})
	})];
};
export const polygonStyleFunction = (styleOption = { color: false }) => {
	const strokeColor = styleOption.color ? hexToRgb(styleOption.color) : hexToRgb('#BADA55');
	const strokeWidth = 2;
	return [new Style({
		stroke: new Stroke({
			color: strokeColor.concat([1]),
			width: strokeWidth
		}),
		fill: new Fill({
			color: strokeColor.concat([0.4])
		})
	})];
};



export const measureStyleFunction = (feature) => {
	const stroke = new Stroke({
		color: Red_Color.concat([1]),
		width: 3
	});

	const dashedStroke = new Stroke({
		color: Red_Color.concat([1]),
		width: 3,
		lineDash: [8]
	});

	const zIndex = (feature.getGeometry() instanceof LineString) ? Z_Line : Z_Polygon;

	const styles = [
		new Style({
			fill: new Fill({
				color: Red_Color.concat([0.4])
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
				color: Red_Color,
				width: 1
			}),
			fill: new Fill({
				color: White_Color
			})
		})
	})];
};

export const selectStyleFunction = () => {
	const appendableVertexStyle = new Style({
		image: new CircleStyle({
			radius: 7,
			stroke: new Stroke({
				color: Black_Color,
				width: 1
			}),
			fill: new Fill({
				color: White_Color
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
		zIndex: Z_Point - 1
	});


	return (feature, resolution) => {
		const styleFunction = feature.getStyleFunction();
		if (!styleFunction || !styleFunction(feature, resolution)) {
			return [appendableVertexStyle];
		}
		const styles = styleFunction(feature, resolution);
		return styles[0] ? styles.concat([appendableVertexStyle]) : [styles, appendableVertexStyle];
	};
};

export const createSelectStyleFunction = (styleFunction) => {
	const appendableVertexStyle = new Style({
		image: new CircleStyle({
			radius: 7,
			stroke: new Stroke({
				color: Black_Color,
				width: 1
			}),
			fill: new Fill({
				color: White_Color
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
		zIndex: Z_Point - 1
	});


	return (feature, resolution) => {

		const styles = styleFunction(feature, resolution);


		return styles.concat([appendableVertexStyle]);
	};
};

export const createSketchStyleFunction = (styleFunction) => {

	const sketchPolygon = new Style({
		fill: new Fill({
			color: White_Color.concat([0.4])
		}),
		stroke: new Stroke({
			color: White_Color,
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
				color: Red_Color.concat([0.4])
			});

			const stroke = new Stroke({
				color: Red_Color.concat([1]),
				width: 3
			});
			const sketchCircle = new Style({
				image: new CircleStyle({ radius: 4, fill: fill, stroke: stroke }),
				zIndex: Z_Point
			});
			styles = [sketchCircle];
		}
		else {
			styles = styleFunction(feature, resolution);
		}

		return styles;
	};
};

export const getIconUrl = (iconId, color = [255, 255, 255]) => {
	const { ConfigService } = $injector.inject('ConfigService');
	const configService = ConfigService;
	const url = configService.getValueAsPath('BACKEND_URL') + 'icons/' + color.toString() + '/' + iconId;

	return url;
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
	 * Converts the hexadecimal String-Represenation of a color to an array of numeric RGB-values or null.
	 * based on from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 * @param {string} rgb
	 * @returns {Array<Number>|null}
	 */
export const hexToRgb = (hex) => {
	if (hex == null) {
		return null;
	}

	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

/**
	 * Converts a color from RGB- to HSV-colorspace
	 * based on accepted answer from https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript/54070620#54070620
	 * @param {Array<number>} rgb the rgb-color array with numbers expect to be 0 <= r, g, b <= 255
	 * @returns {Array<number>} the return hsv-color array with numbers (0 <= h, s, v <= 1)
	 */
export const rgbToHsv = (rgb) => {
	if (rgb == null) {
		return null;
	}
	if (rgb.length !== 3) {
		return null;
	}
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const c = v - Math.min(r, g, b);
	const h = c && ((v === r) ? (g - b) / c : ((v === g) ? 2 + (b - r) / c : 4 + (r - g) / c));
	return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
};

/**
	 * Converts a color from HSV- to RGB-colorspace
	 * based on accepted answer from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
	 * @param {Array<number>} hsv the hsv-color array with numbers expect to be 0 <= h <= 360 and 0 <= s, v <= 1
	 * @returns {Array<number>} the return rgb-color array with numbers(rounded) 0 <= r, g, b <= 255
	 */
export const hsvToRgb = (hsv) => {
	if (hsv == null) {
		return null;
	}
	if (hsv.length !== 3) {
		return null;
	}
	const h = hsv[0] / 360;
	const s = hsv[1];
	const v = hsv[2];


	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	const calculateNormalizedRgb = () => {
		switch (i % 6) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	const normalizedRgb = calculateNormalizedRgb();
	return [
		Math.round(normalizedRgb[0] * 255),
		Math.round(normalizedRgb[1] * 255),
		Math.round(normalizedRgb[2] * 255)
	];
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
		const text = style.getText();

		if (stroke) {
			return rgbToHex(stroke.getColor());
		}
		if (image && image.getColor()) {
			return rgbToHex(image.getColor());
		}
		if (text) {
			return rgbToHex(text.getFill().getColor());
		}
	}

	return null;
};

/**
	 * creates a ligther or darker version of the specified basecolor
	 * @param {Array<Number>} rgbColor the basecolor as rgb-color-array
	 * @returns {Array<Number>} the rgb-color-array, which is lighter or darker as contrast to the basecolor
	 */
export const getContrastColorFrom = (baseColor) => {
	const HSV_Brightness_Limit = .7;
	const isDark = (hsv) => hsv[2] < HSV_Brightness_Limit;

	// only Black & White
	const lighter = (hsv) => [hsv[0], 0, 1];
	const darker = (hsv) => [hsv[0], 0, 0];

	const hsv = rgbToHsv(baseColor);
	const contrastHsv = isDark(hsv) ? lighter(hsv) : darker(hsv);

	return hsvToRgb(contrastHsv);
};

/**
	 * creates the complementary color for the specified color
	 * from https://www.tutorialspoint.com/javascript-complementary-colors-builder
	 * @param {string} color the color as hex-string
	 * @returns {string} the complementary color as hex string
	 */
export const getComplementaryColor = (color = '') => {
	const colorPart = color.slice(1);
	const ind = parseInt(colorPart, 16);
	let iter = ((1 << 4 * colorPart.length) - 1 - ind).toString(16);
	while (iter.length < colorPart.length) {
		iter = '0' + iter;
	}
	return '#' + iter;
};
