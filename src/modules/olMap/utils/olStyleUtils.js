/**
 * @module modules/olMap/utils/olStyleUtils
 */
import { getGeometryLength, canShowAzimuthCircle, calculatePartitionResidualOfSegments, getPartitionDelta, moveParallel } from './olGeometryUtils';
import { toContext as toCanvasContext } from 'ol/render';
import { Fill, Stroke, Style, Circle as CircleStyle, Icon, Text as TextStyle } from 'ol/style';
import { Polygon, LineString, Circle, MultiPoint } from 'ol/geom';
import { $injector } from '../../../injection';
import markerIcon from '../assets/marker.svg';
import { isString } from '../../../utils/checks';
import { getContrastColorFrom, hexToRgb, rgbToHex } from '../../../utils/colors';
import { AssetSourceType, getAssetSource } from '../../../utils/assets';

const Z_Point = 30;
const Red_Color = [255, 0, 0];
const White_Color = [255, 255, 255];
// eslint-disable-next-line no-unused-vars
const Black_Color = [0, 0, 0];
const Default_Symbol = 'marker';

/**
 * @typedef StyleOption
 * @property {string} [symbolSrc] the URL to the resource of the marker symbol
 * @property {string} [color] the color as hexadecimal rgb value
 * @property {number} [scale] the scale; used to scale text or marker symbols
 * @property {string} [text] the displayed text
 */

export const DEFAULT_TEXT = 'new text';
export const DEFAULT_STYLE_OPTION = { symbolSrc: null, color: null, scale: null, text: null };

const getTextStyle = (text, color, scale, offsetY = -5) => {
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
			offsetY
		});
	};
	return text ? createStyle(text, color, scale) : null;
};

const getTextScale = (sizeKeyword) => {
	if (typeof sizeKeyword === 'number') {
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

export const textScaleToKeyword = (scaleCandidate) => {
	const scale = typeof scaleCandidate === 'number' ? scaleCandidate : getMarkerScale(scaleCandidate);

	switch (scale) {
		case 2:
			return 'large';
		case 1.5:
			return 'medium';
		case 1:
		default:
			return 'small';
	}
};

const getMarkerScale = (sizeKeyword) => {
	if (typeof sizeKeyword === 'number') {
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
	const scale = typeof scaleCandidate === 'number' ? scaleCandidate : getMarkerScale(scaleCandidate);

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
		stroke: '#555555',
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
		fill: '#555555',
		/**
		 * the opacity of the interior of a polygon.
		 * @type {number}
		 */
		'fill-opacity': 0.6
	};

	const markerSizeToRadius = (markerSize) => {
		if (typeof markerSize === 'number') {
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
		Object.keys(defaultStyleProperties).forEach((k) => {
			const styleValue = feature.get(k);
			if (styleValue) {
				simpleStyleProperties[k] = styleValue;
			}
		});
		return simpleStyleProperties;
	};

	const featureStyleProperties = feature ? getSimpleStylePropertiesFrom(feature) : {};
	const geoJsonStyleProperties = { ...defaultStyleProperties, ...featureStyleProperties };

	return [
		new Style({
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

export const defaultClusterStyleFunction = () => {
	const styleCache = {};
	const clusterShadowStyle = new Style({
		image: new CircleStyle({
			radius: 17,
			fill: new Fill({
				color: Black_Color.concat([0.15])
			})
		})
	});
	return (feature, resolution) => {
		const getClusterStyle = () => {
			const cachedStyle = styleCache[size];
			const createAndCache = () => {
				const style = [
					clusterShadowStyle,
					new Style({
						image: new CircleStyle({
							radius: 15,
							stroke: new Stroke({
								color: White_Color
							}),
							fill: new Fill({
								color: '#099dda'
							}),
							displacement: [0, 1] // displacement needed to place the text centered
						}),
						text: new TextStyle({
							text: size.toString(),
							scale: 1.5,
							fill: new Fill({
								color: White_Color
							})
						})
					})
				];
				styleCache[size] = style;
				return style;
			};
			return cachedStyle ? cachedStyle : createAndCache();
		};
		const getFeatureStyle = () => {
			const baseStyle = feature.get('features')[0].getStyle();
			if (typeof baseStyle === 'function') {
				return baseStyle(feature, resolution);
			}
			return baseStyle;
		};
		const size = feature.get('features').length;
		return size === 1 ? getFeatureStyle() : getClusterStyle();
	};
};

/**
 * Function to style a marker symbol
 * @param {null|StyleOption} styleOption the styleOption
 * @returns {Array<Style>} the resulting array of marker styles
 */
export const markerStyleFunction = (styleOption = DEFAULT_STYLE_OPTION) => {
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

	const iconOptions = styleOption.symbolSrc
		? getAssetSource(styleOption.symbolSrc) === AssetSourceType.LOCAL
			? svgIconOptions
			: rasterIconOptions
		: svgIconOptions;

	return [
		new Style({
			image: new Icon(iconOptions),
			text: styleOption.text ? getTextStyle(styleOption.text, markerColor, getTextScale(styleOption.scale), 6) : null
		})
	];
};

/**
 * Function to style a text symbol
 * @param {StyleOption} styleOption the styleOption
 * @returns {Array<Style>}  the resulting array of text styles
 */
export const textStyleFunction = (styleOption = DEFAULT_STYLE_OPTION) => {
	const strokeColor = styleOption.color ? styleOption.color : '#ff0000';
	const textContent = isString(styleOption.text) ? styleOption.text : DEFAULT_TEXT;

	const textScale = getTextScale(styleOption.scale);

	return [
		new Style({
			text: getTextStyle(textContent, strokeColor, textScale)
		})
	];
};

/**
 * Function to style a line geometry
 * @param {StyleOption} styleOption the styleOption
 * @returns the resulting array of line styles
 */
export const lineStyleFunction = (styleOption = DEFAULT_STYLE_OPTION) => {
	const strokeColor = styleOption.color ? hexToRgb(styleOption.color) : hexToRgb('#ff0000');
	const strokeWidth = 3;
	// TODO: activate TextStyle with:
	// ...
	// text: styleOption.text ? getTextStyle(styleOption.text, styleOption.color ? styleOption.color : '#ff0000', getTextScale(styleOption.scale)) : null
	// ...
	return [
		new Style({
			stroke: new Stroke({
				color: strokeColor.concat([1]),
				width: strokeWidth
			})
		})
	];
};

/**
 * Function to style a polygon geometry
 * @param {StyleOption} styleOption the styleOption
 * @returns the resulting array of polygon styles
 */
export const polygonStyleFunction = (styleOption = DEFAULT_STYLE_OPTION) => {
	const strokeColor = styleOption.color ? hexToRgb(styleOption.color) : hexToRgb('#ff0000');
	const strokeWidth = 3;
	// TODO: activate TextStyle with:
	// ...
	// text: styleOption.text ? getTextStyle(styleOption.text, styleOption.color ? styleOption.color : '#ff0000', getTextScale(styleOption.scale)) : null
	// ...
	return [
		new Style({
			stroke: new Stroke({
				color: strokeColor.concat([1]),
				width: strokeWidth
			}),
			fill: new Fill({
				color: strokeColor.concat([0.4])
			})
		})
	];
};

const getRulerStyle = () => {
	const getCanvasContextRenderFunction = (state) => {
		const renderContext = toCanvasContext(state.context, { pixelRatio: 1 });
		return (geometry, fill, stroke) => {
			renderContext.setFillStrokeStyle(fill, stroke);
			renderContext.drawGeometry(geometry);
		};
	};
	return new Style({
		renderer: (pixelCoordinates, state) => {
			const getContextRenderFunction = (state) =>
				state.customContextRenderFunction ? state.customContextRenderFunction : getCanvasContextRenderFunction(state);
			renderRulerSegments(pixelCoordinates, state, getContextRenderFunction(state));
		}
	});
};

export const renderRulerSegments = (pixelCoordinates, state, contextRenderFunction) => {
	const geometry = state.geometry.clone();
	const resolution = state.resolution;
	const pixelRatio = state.pixelRatio;
	const calculationHints = { fromProjection: 'EPSG:3857', toProjection: 'EPSG:25832', toProjectionExtent: [5, -80, 14, 80] };

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
			lineDashOffset: 3 * pixelRatio + partitionTickDistance * residual
		});
	};

	const getSubTickStroke = (residual, partitionTickDistance) => {
		return new Stroke({
			color: Red_Color.concat([1]),
			width: 5 * pixelRatio,
			lineCap: 'butt',
			lineDash: [2 * pixelRatio, (partitionTickDistance / 5 - 2) * pixelRatio],
			lineDashOffset: 2 * pixelRatio + partitionTickDistance * residual
		});
	};

	const drawTicks = (contextRenderer, segment, residual, tickDistance) => {
		// todo: for printing purpose the moving parallel offset must be adjusted due to the fact,
		// that segments will be geographic coordinates and not pixel coordinates.
		/* const adjustOffset = (offset) => {
			if (state.renderHint ?? state.renderHint === 'printer') {
				return -1 * offset * resolution;
			}
			return offset;
		};

		const draw = () => {
			const mainTickSegment = moveParallel(segment[0], segment[1], adjustOffset(-4 * pixelRatio));
			const subTickSegment = moveParallel(segment[0], segment[1], adjustOffset(-2 * pixelRatio));
			contextRenderer(mainTickSegment, fill, getMainTickStroke(residual, tickDistance));
			contextRenderer(subTickSegment, fill, getSubTickStroke(residual, tickDistance));

			return true;
		};
		*/
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
	contextRenderFunction(geometry, fill, baseStroke);

	// per segment
	const segmentCoordinates = geometry instanceof Polygon ? pixelCoordinates[0] : pixelCoordinates;

	segmentCoordinates.every((coordinate, index, coordinates) => {
		return drawTicks(contextRenderFunction, [coordinate, coordinates[index + 1]], residuals[index], partitionTickDistance);
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
				lineDash: [8],
				width: 2
			}),
			fill: new Fill({
				color: Red_Color.concat([0.4])
			})
		});
	};
	const styles = [
		new Style({
			stroke: stroke,
			geometry: (feature) => {
				if (canShowAzimuthCircle(feature.getGeometry())) {
					const coords = feature.getGeometry().getCoordinates();
					const radius = getGeometryLength(feature.getGeometry());
					const circle = new Circle(coords[0], radius);
					return circle;
				}
			},
			zIndex: 0
		}),
		resolution ? getRulerStyle() : getFallbackStyle()
	];
	return styles;
};

export const modifyStyleFunction = (feature) => {
	const getParentFeature = (child) => {
		const features = child.get('features');
		return features[0] ? features[0] : null;
	};
	const currentFeature = feature ? getParentFeature(feature) : null;
	const color = currentFeature ? getColorFrom(currentFeature) : Red_Color;

	return [
		new Style({
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
		})
	];
};

export const selectStyleFunction = () => {
	const getAppendableVertexStyle = (color) =>
		new Style({
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
				return [
					new Style({
						image: new CircleStyle({
							fill: fill,
							radius: 5,
							stoke: getColoredStroke(1)
						})
					})
				];
			case 'LineString':
			case 'MultiLineString':
				return [
					new Style({
						stroke: getColoredStroke(3)
					})
				];
			case 'Polygon':
			case 'MultiPolygon':
				return [
					new Style({
						fill: fill,
						stroke: getColoredStroke(2)
					})
				];
			case 'GeometryCollection':
				return [
					new Style({
						image: new CircleStyle({
							fill: fill,
							radius: 5,
							stoke: getColoredStroke(1)
						}),
						fill: fill,
						stroke: getColoredStroke(2)
					})
				];
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
		} else if (feature.getGeometry().getType() === 'Point') {
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
		} else {
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
 * extracts the color-value (as hex representation) or null from a feature
 * @param {Feature} feature the feature with or without a style
 * @returns {string|null} the color-value
 */
export const getColorFrom = (feature) => {
	if (feature == null) {
		return null;
	}
	const styles = getStyleArray(feature);
	feature.getStyle();
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
	const styles = getStyleArray(feature);
	feature.getStyle();
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
	const styles = getStyleArray(feature);
	feature.getStyle();
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
 * Extracts from the specified feature the size-value if the
 * StyleType is Marker/Text or null for all other StyleTypes.
 * @param {Feature} feature the feature with or without a style
 * @returns {StyleSizeTypes|null} the Size-Value or null
 */
export const getSizeFrom = (feature) => {
	if (feature == null) {
		return null;
	}
	const styles = getStyleArray(feature);
	feature.getStyle();
	if (styles) {
		const style = styles[0];
		const image = style?.getImage();
		const text = style?.getText();

		if (image) {
			return markerScaleToKeyword(image.getScale());
		}

		if (text) {
			return textScaleToKeyword(text.getScale());
		}
	}

	return null;
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
	const toArray = (arrayCandidate) => (Array.isArray(arrayCandidate) ? arrayCandidate : [arrayCandidate]);
	const applyStyleFunction = (styleFunction, feature) => toArray(styleFunction(feature));
	const getArray = (styles) => (typeof styles === 'function' ? applyStyleFunction(styles, feature) : toArray(styles));

	return feature.getStyle() ? getArray(feature.getStyle()) : null;
};
