import { getGeometryLength, canShowAzimuthCircle, calculatePartitionResidualOfSegments, getPartitionDelta, moveParallel } from './olGeometryUtils';
import { toContext } from 'ol/render';
import { Fill, Stroke, Style, Circle as CircleStyle, Icon, Text as TextStyle } from 'ol/style';
import { Polygon, LineString, Circle, MultiPoint } from 'ol/geom';
import { $injector } from '../../../../injection';
import markerIcon from './assets/marker.svg';
import locationIcon from './assets/location.svg';
import tempLocationIcon from './assets/temporaryLocation.svg';

const Z_Point = 30;
const Red_Color = [255, 0, 0];
const White_Color = [255, 255, 255];
// eslint-disable-next-line no-unused-vars
const Black_Color = [0, 0, 0];
const Default_Symbol = 'marker';
const Asset_Svg_B64_Flag = 'data:image/svg+xml;base64,';

export const AssetSourceType = Object.freeze({
	LOCAL: 'local',
	REMOTE: 'remote',
	UNKNOWN: 'unknown'
});

const getTextStyle = (text, color, scale) => {
	const strokeWidth = 1;
	const createStyle = (text, color, scale) => {
		return new TextStyle({
			text: text,
			font: 'normal 16px sans-serif',
			stroke: new Stroke({
				color: getContrastColorFrom(hexToRgb(color)).concat(0.4),
				width: strokeWidth
			}),
			fill: new Fill({
				color: hexToRgb(color).concat([1])
			}),
			scale: scale,
			offsetY: -5
		});
	};
	return text ? createStyle(text, color, scale) : null;
};

const getTextScale = (sizeKeyword) => {
	if (typeof (sizeKeyword) === 'number') {
		return sizeKeyword;
	}
	switch (sizeKeyword) {

		case 'large':
			return 2;
		case 'medium':
			return 1.5;
		case 'small':
		default:
			return 1;
	}
};

const getMarkerScale = (sizeKeyword) => {
	if (typeof (sizeKeyword) === 'number') {
		return sizeKeyword;
	}
	switch (sizeKeyword) {
		case 'large':
			return 1;
		case 'medium':
			return 0.75;
		case 'small':
		default:
			return 0.5;
	}
};

export const markerScaleToKeyword = (scaleCandidate) => {
	const scale = typeof (scaleCandidate) === 'number' ? scaleCandidate : getMarkerScale(scaleCandidate);

	switch (scale) {
		case 1:
			return 'large';
		case 0.75:
			return 'medium';
		case 0.5:
		default:
			return 'small';
	}
};

export const getAssetSource = (asset) => {
	if (asset.startsWith(Asset_Svg_B64_Flag)) {
		return AssetSourceType.LOCAL;
	}

	if (asset.startsWith('http://') || asset.startsWith('https://')) {
		return AssetSourceType.REMOTE;
	}
	return AssetSourceType.UNKNOWN;
};

export const getMarkerSrc = (symbolSrc = null, symbolColor = '#ffffff') => {
	if (symbolSrc != null && symbolSrc !== false) {
		if ([AssetSourceType.LOCAL, AssetSourceType.REMOTE].includes(getAssetSource(symbolSrc))) {
			return symbolSrc;
		}
		console.warn('not recognized as valid src:', symbolSrc);
		return getIconUrl(Default_Symbol, hexToRgb(symbolColor));
	}
	return getIconUrl(Default_Symbol);
};

export const nullStyleFunction = () => [new Style({})];

/**
 * A StyleFunction which returns styles based on styling properties of the feature
 * according to {@see https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0| simpleStyle spec 1.1.0}.
 * If no or incomplete styling-information found on the feature, default values will be used.
 *
 * 'marker-symbol'-property is currently not supported
 * @param {Feature} feature the olFeature to be styled
 * @returns {Array<Style>}
 */
export const geojsonStyleFunction = (feature) => {
	// default style properties based on simpleStyle spec
	// hint: 'marker-symbol' is currently not supported
	const defaultStyleProperties = {
		/**
		 * specify the size of the marker. sizes
		 * can be different pixel sizes in different
		 * implementations
		 * @type {('small'|'medium'|'large')}
		 */
		'marker-size': 'medium',
		/**
		 * the marker's color as rgb-color string
		 * @type {string}
		 */
		'marker-color': '#fff',
		/**
		 * the color of a line as part of a polygon, polyline, or
		 * multigeometry as rgb-color string
		 * @type {string}
		 */
		'stroke': '#555555',
		/**
		 * the opacity of the line component of a polygon, polyline, or
		 * multigeometry
		 * @type {number}
		 */
		'stroke-opacity': 1.0,
		/**
		 * the width of the line component of a polygon, polyline, or multigeometry
			 *@type {number}
			 */
		'stroke-width': 3,
		/**
		 * the color of the interior of a polygon
		 * as rgb-color string
		 * @type {string}
		 */
		'fill': '#555555',
		/**
		 * the opacity of the interior of a polygon.
		 * @type {number}
		 */
		'fill-opacity': 0.6
	};

	const markerSizeToRadius = (markerSize) => {
		if (typeof (markerSize) === 'number') {
			return markerSize;
		}
		switch (markerSize) {
			case 'large':
				return 7;
			case 'medium':
				return 5;
			case 'small':
			default:
				return 3;
		}
	};


	const getSimpleStylePropertiesFrom = (feature) => {
		const simpleStyleProperties = {};
		Object.keys(defaultStyleProperties).forEach(k => {
			const styleValue = feature.get(k);
			if (styleValue) {
				simpleStyleProperties[k] = styleValue;
			}
		});
		return simpleStyleProperties;
	};

	const featureStyleProperties = feature ? getSimpleStylePropertiesFrom(feature) : {};
	const geoJsonStyleProperties = { ...defaultStyleProperties, ...featureStyleProperties };

	return [new Style({
		image: new CircleStyle({
			fill: new Fill({
				color: hexToRgb(geoJsonStyleProperties['marker-color']).concat([1])
			}),
			radius: markerSizeToRadius(geoJsonStyleProperties['marker-size'])
		}),
		stroke: new Stroke({
			color: hexToRgb(geoJsonStyleProperties['stroke']).concat([geoJsonStyleProperties['stroke-opacity']]),
			width: geoJsonStyleProperties['stroke-width']
		}),
		fill: new Fill({
			color: hexToRgb(geoJsonStyleProperties['fill']).concat([geoJsonStyleProperties['fill-opacity']])
		})
	})
	];

};

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

export const markerStyleFunction = (styleOption = { symbolSrc: false, color: false, scale: false, text: false }) => {
	const markerColor = styleOption.color ? styleOption.color : '#ff0000';


	const rasterIconOptions = {
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: styleOption.symbolSrc,
		scale: getMarkerScale(styleOption.scale)
	};

	const svgIconOptions = {
		anchor: [0.5, 1],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: styleOption.symbolSrc ? styleOption.symbolSrc : markerIcon,
		color: markerColor,
		scale: getMarkerScale(styleOption.scale)
	};

	const iconOptions = styleOption.symbolSrc ? (getAssetSource(styleOption.symbolSrc) === AssetSourceType.LOCAL ? svgIconOptions : rasterIconOptions) : svgIconOptions;

	return [new Style({
		image: new Icon(iconOptions),
		text: styleOption.text ? getTextStyle(styleOption.text, markerColor, getTextScale(styleOption.scale)) : null
	})];
};

export const textStyleFunction = (styleOption = { color: false, scale: false, text: false }) => {
	const strokeColor = styleOption.color ? styleOption.color : '#ff0000';
	const textContent = styleOption.text ? styleOption.text : 'New Text';

	const textScale = getTextScale(styleOption.scale);

	return [new Style({
		text: getTextStyle(textContent, strokeColor, textScale)
	})];
};

export const lineStyleFunction = (styleOption = { color: false, text: false }) => {
	const strokeColor = styleOption.color ? hexToRgb(styleOption.color) : hexToRgb('#ff0000');
	const strokeWidth = 3;
	// TODO: activate TextStyle with:
	// ...
	// text: styleOption.text ? getTextStyle(styleOption.text, styleOption.color ? styleOption.color : '#ff0000', getTextScale(styleOption.scale)) : null
	// ...
	return [new Style({
		stroke: new Stroke({
			color: strokeColor.concat([1]),
			width: strokeWidth
		})
	})
	];
};
export const polygonStyleFunction = (styleOption = { color: false, text: false }) => {
	const strokeColor = styleOption.color ? hexToRgb(styleOption.color) : hexToRgb('#ff0000');
	const strokeWidth = 3;
	// TODO: activate TextStyle with:
	// ...
	// text: styleOption.text ? getTextStyle(styleOption.text, styleOption.color ? styleOption.color : '#ff0000', getTextScale(styleOption.scale)) : null
	// ...
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


const getRulerStyle = () => {

	return new Style({
		renderer: (pixelCoordinates, state) => {
			const renderContext = toContext(state.context, { pixelRatio: 1 });
			const renderToContext = (geometry, fill, stroke) => {
				renderContext.setFillStrokeStyle(fill, stroke);
				renderContext.drawGeometry(geometry);
			};
			renderRulerSegments(pixelCoordinates, state, renderToContext);
		}
	});
};

export const renderRulerSegments = (pixelCoordinates, state, contextRenderer) => {
	const geometry = state.geometry.clone();
	const resolution = state.resolution;
	const pixelRatio = state.pixelRatio;
	const calculationHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832' };

	const partition = getPartitionDelta(geometry, resolution, calculationHints);
	const partitionLength = partition * getGeometryLength(geometry);
	const partitionTickDistance = partitionLength / resolution;
	const residuals = calculatePartitionResidualOfSegments(geometry, partition);

	const fill = new Fill({ color: Red_Color.concat([0.4]) });
	const baseStroke = new Stroke({
		color: Red_Color.concat([1]),
		width: 3 * pixelRatio
	});

	const getMainTickStroke = (residual, partitionTickDistance) => {
		return new Stroke({
			color: Red_Color.concat([1]),
			width: 8 * pixelRatio,
			lineCap: 'butt',
			lineDash: [3 * pixelRatio, (partitionTickDistance - 3) * pixelRatio],
			lineDashOffset: 3 * pixelRatio + (partitionTickDistance * residual)
		});
	};

	const getSubTickStroke = (residual, partitionTickDistance) => {
		return new Stroke({
			color: Red_Color.concat([1]),
			width: 5 * pixelRatio,
			lineCap: 'butt',
			lineDash: [2 * pixelRatio, ((partitionTickDistance / 5) - 2) * pixelRatio],
			lineDashOffset: 2 * pixelRatio + (partitionTickDistance * residual)
		});
	};

	const drawTicks = (contextRenderer, segment, residual, tickDistance) => {
		const draw = () => {
			const mainTickSegment = moveParallel(segment[0], segment[1], -4 * pixelRatio);
			const subTickSegment = moveParallel(segment[0], segment[1], -2 * pixelRatio);
			contextRenderer(mainTickSegment, fill, getMainTickStroke(residual, tickDistance));
			contextRenderer(subTickSegment, fill, getSubTickStroke(residual, tickDistance));

			return true;
		};
		const cancel = () => false;
		return segment[1] ? draw() : cancel();
	};

	// baseLine
	geometry.setCoordinates(pixelCoordinates);
	contextRenderer(geometry, fill, baseStroke);

	// per segment
	const segmentCoordinates = geometry instanceof Polygon ? pixelCoordinates[0] : pixelCoordinates;

	segmentCoordinates.every((coordinate, index, coordinates) => {
		return drawTicks(contextRenderer, [coordinate, coordinates[index + 1]], residuals[index], partitionTickDistance);
	});

};


/**
 * StyleFunction for measurement-feature
 *
 * Inspired by example from https://stackoverflow.com/questions/57421223/openlayers-3-offset-stroke-style
 * @param {Feature} feature the feature to be styled
 * @param {number} resolution the resolution of the Map-View
 * @returns {Array<Style>} the measurement styles for the specified feature
 */
export const measureStyleFunction = (feature, resolution) => {

	const stroke = new Stroke({
		color: Red_Color.concat([1]),
		width: 3
	});

	const getFallbackStyle = () => {
		return new Style({
			stroke: new Stroke({
				color: Red_Color.concat([1]),
				fill: new Fill({
					color: Red_Color.concat([0.4])
				}),
				width: 2
			})
		});
	};
	const styles = [
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
		resolution ? getRulerStyle() : getFallbackStyle()];
	return styles;
};

export const modifyStyleFunction = (feature) => {
	const getParentFeature = (child) => {
		const features = child.get('features');
		return features[0] ? features[0] : null;
	};
	const currentFeature = feature ? getParentFeature(feature) : null;
	const color = currentFeature ? getColorFrom(currentFeature) : Red_Color;

	return [new Style({
		image: new CircleStyle({
			radius: 6,
			stroke: new Stroke({
				color: White_Color,
				width: 3
			}),
			fill: new Fill({
				color: color
			})
		})
	})];
};

export const selectStyleFunction = () => {
	const getAppendableVertexStyle = (color) => new Style({
		image: new CircleStyle({
			radius: 5,
			stroke: new Stroke({
				color: White_Color,
				width: 3
			}),
			fill: new Fill({
				color: color
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
		const colorFromFeature = getColorFrom(feature);
		const color = colorFromFeature ? colorFromFeature : Red_Color;
		const styleFunction = feature.getStyleFunction();
		if (!styleFunction || !styleFunction(feature, resolution)) {
			return [getAppendableVertexStyle(color)];
		}
		const styles = styleFunction(feature, resolution);
		return styles[0] ? styles.concat([getAppendableVertexStyle(color)]) : [styles, getAppendableVertexStyle(color)];
	};
};

/**
 * returns the default styleFunction, based on the specified color
 * @param {Array<number>} color the rgba-color An Array of numbers, defining a RGBA-Color with [Red{0,255},Green{0,255},Blue{0,255},Alpha{0,1}]
 * @returns {Function} the default styleFunction
 */
export const defaultStyleFunction = (color) => {
	const colorRGBA = color;
	const colorRGB = color.slice(0, -1);

	const fill = new Fill({
		color: colorRGBA
	});

	const getColoredStroke = (width) => new Stroke({ color: colorRGB, width: width });

	return (feature) => {
		const geometryType = feature.getGeometry().getType();
		switch (geometryType) {
			case 'Point':
			case 'MultiPoint':
				return [new Style({
					image: new CircleStyle({
						fill: fill,
						radius: 5,
						stoke: getColoredStroke(1)
					})
				})];
			case 'LineString':
			case 'MultiLineString':
				return [new Style({
					stroke: getColoredStroke(3)
				})];
			case 'Polygon':
			case 'MultiPolygon':
				return [new Style({
					fill: fill,
					stroke: getColoredStroke(2)
				})];
		}
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
	const styles = getStyleArray(feature); feature.getStyle();
	if (styles) {
		const style = styles[0];
		const stroke = style?.getStroke();
		const image = style?.getImage();
		const text = style?.getText();

		if (stroke) {
			return rgbToHex(stroke.getColor());
		}


		if (image) {
			// first try to get the tint-color
			if (image.getColor()) {
				return rgbToHex(image.getColor());
			}
			// ...then try to get colorInformation from symbolSrc
			const { IconService: iconService } = $injector.inject('IconService');
			return rgbToHex(iconService.decodeColor(image.getSrc()));
		}

		if (text) {
			return rgbToHex(text.getFill().getColor());
		}

	}

	return null;
};


/**
 * extracts the symbolSrc-value or null from a feature
 * @param {Feature} feature the feature with or without a style
 * @returns {string|null} the symbolSrc-Value or null
 */
export const getSymbolFrom = (feature) => {
	if (feature == null) {
		return null;
	}
	const styles = getStyleArray(feature); feature.getStyle();
	if (styles) {
		const style = styles[0];
		const image = style.getImage();

		if (image) {
			return image.getSrc();
		}
	}
	return null;
};

/**
 * extracts the symbolSrc-value or null from a feature
 * @param {Feature} feature the feature with or without a style
 * @returns {string|null} the symbolSrc-Value or null
 */
export const getTextFrom = (feature) => {
	if (feature == null) {
		return null;
	}
	const styles = getStyleArray(feature); feature.getStyle();
	if (styles) {
		const style = styles[0];
		const textStyle = style.getText();

		if (textStyle) {
			return textStyle.getText();
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

/***
 * Returns the drawingtype of a feature. If the featue is created with the application itself,
 * the drawingType is part of the featureId and follows the convention id(feature)-> [measure|draw]_[drawingType]_[creationTime]
 * if the feature is not created with this application and the id follows not the before mentioned convention, NULL is returning.
 * @param {Feature} feature the feature
 * @returns {string|null}
 */
export const getDrawingTypeFrom = (feature) => {
	if (feature) {
		const featureId = feature.getId();
		const type_index = 1;
		const seperator = '_';
		const parts = featureId.split(seperator);

		if (parts.length <= type_index + 1) {
			return null;
		}
		return parts[type_index];
	}
	return null;
};


export const getStyleArray = (feature) => {

	const toArray = (arrayCandidate) => Array.isArray(arrayCandidate) ? arrayCandidate : [arrayCandidate];
	const applyStyleFunction = (styleFunction, feature) => toArray(styleFunction(feature));
	const getArray = (styles) => typeof (styles) === 'function' ? applyStyleFunction(styles, feature) : toArray(styles);


	return feature.getStyle() ? getArray(feature.getStyle()) : null;
};
